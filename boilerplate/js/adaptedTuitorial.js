var map

function createMap(){

    // creates a map
    map = L.map('map', {
        center: [0, 0],
        zoom: 2
    });

    // this adds the openstreeetmap layer
    //var Thunderforest_Outdoors = L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}', {
	//attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	//apikey: '<your apikey>',
	//maxZoom: 22

   // }).addTo(map);
   L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};

function getData(map){
    fetch("data/MegaCities.geojson")
		.then(function(response){
			return response.json();
		})
		.then(function(json){
            var geojsonMarkerOptions = {
                radius: 6,
                fillColor: "#49b9d5",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
 //create a Leaflet GeoJSON layer and add it to the map
 
 L.geoJson(json, {
    pointToLayer: function (feature, latlng){
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);
})
};
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    fetch("data/MegaCities.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                onEachFeature: onEachFeature
            }).addTo(map);
        })  
};

document.addEventListener('DOMContentLoaded',createMap)