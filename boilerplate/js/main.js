var map

function createMap(){

    // creates a map
    map = L.map('map', {
        center: [0, 0],
        zoom: 2
    });

    // this adds the openstreeetmap layer
    

    var Stadia_Outdoors = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

    //call getData function
    getData(map);
};

function getData(map){
    fetch("data/natParkAttendance.geojson")
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
    },
    onEachFeature: onEachFeature
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

document.addEventListener('DOMContentLoaded',createMap)