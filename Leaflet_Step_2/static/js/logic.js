// Function that will determine the colour of circle markers based on the earthquake magnitude level
function setColour(magnitude) {
  if (magnitude < 1) {
    return "#0bfe00";
  } else if (magnitude < 2) {
    return "#b9fe00";
  } else if (magnitude < 3) {
    return "#fad28b";
  } else if (magnitude < 4) {
    return "#fab98b";
  } else if (magnitude < 5) {
    return "#fa8838";
  } else {
    return "#fa0000";
  }
}

// Store our API endpoint inside queryUrl
var queryUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);

  function createFeatures(earthquakeData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup(
        "<h3>" +
          feature.properties.place +
          "</h3><hr><p>" +
          new Date(feature.properties.time) +
          "</p>" +
          "<br><h3> Magnitude: " +
          feature.properties.mag +
          "</h3>"
      );
    }

    // function to put circle markers at the lat/lng of the earthquakes
    function pointToLayer(feature, latlng) {
      var geojsonMarkerOptions = {
        radius: feature.properties.mag * 4,
        fillColor: setColour(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6,
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer,
    });

    // Load in Tectonic Plates GeoJSON Data
    var geoData = "static/data/plates.geojson";

    // Read geojson data with d3
    d3.json(geoData).then(data => {
      var plates = L.geoJson(data, {
        // Style each feature (in this case a country)
        style: function () {
          return {
            color: "red",
            fillColor: "none",
            fillOpacity: 0.2,
            weight: 3,
          };
        },
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer,
      });

      // Sending our earthquakes layer to the createMap function
      createMap(earthquakes, plates);
    });
  }

  function createMap(earthquakes, plates) {
    // Define Variables for Tile Layers
    var satelliteMap = L.tileLayer(
      "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY,
      }
    );

    var grayscaleMap = L.tileLayer(
      "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY,
      }
    );

    var outdoorsMap = L.tileLayer(
      "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY,
      }
    );

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      Satellite: satelliteMap,
      Grayscale: grayscaleMap,
      Outdoors: outdoorsMap,
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      "Fault Lines": plates,
      Earthquakes: earthquakes,
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [39.09, -98.71],
      zoom: 5,
      layers: [satelliteMap, earthquakes],
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control
      .layers(baseMaps, overlayMaps, {
        collapsed: false,
      })
      .addTo(myMap);

    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      var div = L.DomUtil.create("div", "info legend");
      var mag_levels = [0, 1, 2, 3, 4, 5];


      // loop to set the colour of earthquake magnitude levels in legend section
      div.innerHTML = "<h4>Earthquake <br> magnitude</h4>";

      for (var i = 0; i < mag_levels.length; i++) {
        div.innerHTML +=
          '<i style="background-color:' +
          setColour(mag_levels[i]) +
          '"></i> ' +
          mag_levels[i] +
          (mag_levels[i + 1] ? "&ndash;" + mag_levels[i + 1] + "<br>" : "+");
      }

      return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);
  }

});
