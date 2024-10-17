// URLs for GeoJSON data (Earthquakes and Tectonic Plates)
let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Base Maps
let satellite = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
});

let grayscale = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
});

let outdoors = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
});

// Map Object
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [satellite]
});

// Layer control for base maps
let baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
};

// Placeholder for overlay layers
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();

// Overlay control
let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
};

// Add layer control to map
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

// Function to get color based on earthquake depth
function getColor(depth) {
    return depth > 90 ? "#ea2c2c" : // Deep
           depth > 70 ? "#ea822c" :
           depth > 50 ? "#ee9c00" :
           depth > 30 ? "#eecc00" :
           "#d4ee00"; // Shallow
}

// Fetch and visualize earthquake data
d3.json(earthquakeUrl).then(function (data) {
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            let depth = feature.geometry.coordinates[2]; // Depth from coordinates
            let color = getColor(depth);
            let geojsonMarkerOptions = {
                radius: 4 * feature.properties.mag,
                fillColor: color,
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        onEachFeature: function (feature, layer) {
            let depth = feature.geometry.coordinates[2]; // Depth from coordinates
            layer.bindPopup(
                `<h3>${feature.properties.place}</h3><hr>
                 <p>${new Date(feature.properties.time)}</p>
                 <p>Magnitude: ${feature.properties.mag}</p>
                 <p>Depth: ${depth} km</p>` // Added depth to tooltip
            );
        }
    }).addTo(earthquakes);
    earthquakes.addTo(myMap);
});

// Fetch and visualize tectonic plate data from GitHub
d3.json(tectonicPlatesUrl).then(function (data) {
    L.geoJSON(data, {
        style: {
            color: "orange",
            weight: 2
        }
    }).addTo(tectonicPlates);
    tectonicPlates.addTo(myMap);
});

// Add a legend to the map
let legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [0, 30, 50, 70, 90];
    
    div.innerHTML = "<strong>Depth (km)</strong><br>";

    // Loop through our depth intervals and generate a label with a colored square for each interval
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(depths[i] + 1) + '">&nbsp;&nbsp;&nbsp;&nbsp;</i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }
    return div;
};

legend.addTo(myMap);