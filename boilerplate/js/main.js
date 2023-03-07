var map
var minValue

function createMap() {

    // creates a map
    map = L.map('map', {
        center: [0, 0],
        zoom: 3
    });

    // this adds the openstreeetmap layer


    var Stadia_Outdoors = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    //call getData function
    getData(map);
};

function calculateMinValue(data) {
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for (var National_Park_Unit of data.features) {
        //loop through each year
        for (var year = 1990; year <= 2020; year += 5) {
            //get population for current year
            var value = National_Park_Unit.properties["Attendance_" + String(year)];
            //add value to array
            if (value > 0)
                allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)
    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 0.5;
    //Flannery Apperance Compensation formula
    if (attValue > 0)
        var radius = 1.0083 * Math.pow(attValue / minValue, 0.5715) * minRadius
    else {
        var radius = 1
    }
    return radius;
};
//Step 3: Add circle markers for point features to the map
function pointToLayer(feature, latlng, attributes) {
   
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#94d3ff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
// determine the value of the selected attribute for each feature
    var attValue = Number(feature.properties[attribute]);
    // this gives circle a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string starting with National Park Unit...Example 2.1 line 24
    var popupContent = "<p><b>National Park Unit:</b> " + feature.properties.National_Park_Unit + "</p>";

    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Attendance in " + year + ":</b> " + feature.properties[attribute] + "visitors</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -options.radius)
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};
function createPropSymbols(data, attributes) {
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
            
        }
    }).addTo(map);
};
// creates an array of the sequential visitation data to keep track of their order
function processData(data){
    var attributes = []; 
    var properties = data.features[0].properties;
    
     for(var attribute in properties){
    if(attribute.indexOf("Attendance") > -1){
        attributes.push(attribute);
    };    
};

// check to see if array works

return attributes;

};

function createSequenceControls(attributes){
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider )

    document.querySelector('.range-slider').max = 6;
    document.querySelector('.range-slider').min = 0;
    document.querySelector('.range-slider').value = 0;
    document.querySelector('.range-slider').step = 1;
   // add buttons to switch between dates
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse"></button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward"></button>');
   // replace button content with custom images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend','<img src="img/leftarrow.png">');
    document.querySelector('#forward').insertAdjacentHTML('beforeend','<img src="img/rightarrow.png">');

     // step 5- click listener for arrow buttons
 document.querySelectorAll('.step').forEach(function(step){
    step.addEventListener("click",function(){
       var index = document.querySelector('.range-slider').value;
       // step 6: incrament or decrement the value depending on button clicked
       if (step.id == 'forward'){
        index++;
         //step 7: if past the last attribute, wrap around to the first attribute
         index = index > 6 ? 0 : index;
       } else if (step.id == 'reverse'){
        index--;
        //step 7: if past the first attriute, wrap around to the last attribute
        index = index < 0 ? 6 : index;
       };
       // step 8: update slider
       document.querySelector('.range-slider').value = index;
       
       updatePropSymbols(attributes[index]);
    }); 
  });
   //step5 pt 2 input listener for slider
   document.querySelector('.range-slider').addEventListener('input',function(){
   var index = this.value;
   updatePropSymbols(attributes[index]);
   });

};

function updatePropSymbols(attribute){
    map.eachLayer(function(layer){

        if (layer.feature && layer.feature.properties[attribute]){
          // access feature properties
            var props = layer.feature.properties;
       // update each featire's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius)

        // add park to popup content string
        var popupContent = "<p><b>National Park Unit:</b> " + props.National_Park_Unit + "</p>";

        //add formatted attribute to panel content string
        var year = attribute.split("_")[1];
        popupContent += "<p><b>Attendance in " + year + ":</b>" + props[attribute] + "visitors</p>";

        // update popup content
        popup = layer.getPopup();
        popup.setContent(popupContent).update();



        };
    });
};

function getData(map) {
    fetch("data/natParkAttendance.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            var attributes = processData(json);
            minValue = calculateMinValue(json);
            // call the prop symbol function so symbols actually appear
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
            
        });
}
//create a Leaflet GeoJSON layer and add it to the map



//if(layer.feature && layerprop) <=0 to make always appear


document.addEventListener('DOMContentLoaded', createMap)