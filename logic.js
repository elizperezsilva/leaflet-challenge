// Store our API endpoint inside queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

let query2 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl). then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {


  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  }

  

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      let color;
      let r = 255;
      let g = Math.floor(255-80*feature.properties.mag);
      let b = Math.floor(255-80*feature.properties.mag);
      color= "rgb("+r+" ,"+g+","+ b+")"
      
      let geojsonMarkerOptions = {
        radius: 4*feature.properties.mag,
        fillColor: color,
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });


  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
  
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  // Create a baseMaps object
  let baseMaps = {
    "Street Map": streetmap
  };

  // Create overlay object to hold our overlay
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });


  // Create a legend to display information
  function getColor(magnitude) {
    return magnitude > 8 ? '#800026' :
           magnitude > 7 ? '#BD0026' :
           magnitude > 6 ? '#E31A1C' :
           magnitude > 5 ? '#FC4E2A' :
           magnitude > 4 ? '#FD8D3C' :
           magnitude > 3 ? '#FEB24C' :
           magnitude > 2 ? '#FED976' :
                           '#FFEDA0';
  }
  
  let legend = L.control({ position: 'bottomright' });
  
  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
        labels = [];
  
    div.innerHTML += 'Magnitude<br><hr>';
  
    // Loop through the intervals to generate colored labels
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
  
    return div;
  };
  
  legend.addTo(myMap);
  

}