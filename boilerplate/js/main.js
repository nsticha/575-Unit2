var map
var dataStats = {}
class PopupContent {
    constructor(properties, attribute) {
        this.properties = properties;
        this.attribute = attribute;
        this.year = attribute.split("_")[1];
        this.attendance = this.properties[attribute];
        this.formatted = "<p><b>National Park Unit:</b>" + this.properties.National_Park_Unit + "</p><p><b>Attendance in " + this.year + ":</b> " + this.attendance + " visitors</p>";
    }
}
function createMap() {

    // creates a map
    map = L.map('map', {
        center: [45, -93 ],
        zoom: 5
    });

    // this adds the openstreeetmap layer


    var Stadia_Outdoors = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    //call getData function
    getData(map);
};

function calcStats(data) {
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for (var National_Park_Unit of data.features) {
        //loop through each year
        for (var year = 1990; year <= 2020; year += 5) {
            //get population for current year
            var value = National_Park_Unit.properties["Attendance_" + String(year)];
            //add value to array
            if(value > 0)
            allValues.push(value);
        }
    }
    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function(a, b){
        return a+b;
    });
    dataStats.mean = sum/ allValues.length;

}  

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 0.5;
    //Flannery Apperance Compensation formula
    if (attValue > 0)
        var radius = 1.0083 * Math.pow(attValue / dataStats.min, 0.5715) * minRadius
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
   // build popup content 
    var popup = new PopupContent(feature.properties, attribute);

    //bind the popup to the circle marker
    layer.bindPopup(popup.formatted, {
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

function getCircleValues(attribute) {
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
      max = -Infinity;
  
    map.eachLayer(function (layer) {
      //get the attribute value
      if (layer.feature) {
        var attributeValue = Number(layer.feature.properties[attribute]);
  
        //test for min
        if (attributeValue < min) {
          min = attributeValue;
        }
  
        //test for max
        if (attributeValue > max) {
          max = attributeValue;
        }
      }
    });
  
    //set mean
    var mean = (max + min) / 2;
  
    //return values as an object
    return {
      max: max,
      mean: mean,
      min: min,
    };
  }
  
// creates an array of the sequential visitation data to keep track of their order
function processData(data){
    // empty array to hold the attributes
    var attributes = [];
    // propertie for the first feature (0) in the data set 
    var properties = data.features[0].properties;
    //push each attribute name into our attribute array
     for(var attribute in properties){
    if(attribute.indexOf("Attendance") > -1){
        attributes.push(attribute);
    };    
};

// check to see if array works

return attributes;

};


function updatePropSymbols(attribute){
    
    var year = attribute.split("_")[1];
    //update temporal legend
    document.querySelector("span.year").innerHTML = year;

    map.eachLayer(function(layer){

        if (layer.feature && layer.feature.properties[attribute]){
          // access feature properties
            var props = layer.feature.properties;
       // update each featire's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius)
            // adds National Park data to popup
            var popupContent = new PopupContent(props, attribute);

            var year = attribute.split("_")[1];
           //popupContent += "<p><b>Attendance in " + year + ":</b> " + props[attribute] + " visitors</p>";


        // update popup content
        popup = layer.getPopup();
        popup.setContent(popupContent.formatted).update();




        };
    });
    
};

//Create new sequence controls
function createSequenceControls(attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            // ... initialize other DOM elements
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')
           // add sequencing arrows
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/leftarrow.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/rightarrow.png"></button>');

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
            
        }
    });


    map.addControl(new SequenceControl()); 
       // add listeners after adding control 
        //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    var steps = document.querySelectorAll('.step');

    steps.forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };

            //Step 8: update slider
            document.querySelector('.range-slider').value = index;

            //Step 9: pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    })
    //Step 5: input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        //Step 6: get the new index value
        var index = this.value;

        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });



};

function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //PUT YOUR SCRIPT TO CREATE THE TEMPORAL LEGEND HERE
            container.innerHTML= '<p class="temporalLegend">Attendance in <span class="year">1990</span></p>';
            // STep 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width= "130px" height="130px">';
            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){
                
                //Step 3: assign the r and cy attributes  
                var radius = calcPropRadius(dataStats[circles[i]]);
                console.log(radius)  
                var cy = 59 - radius;
                console.log(cy) 
                //circle string
                svg += 
                '<circle class="legend-circle" id="' + 
                circles[i] + 
                '"r="' +
                radius +
                '"cy="' +
                cy +
                '" fill="#94d3ff" fill-opacity="0.8" stroke="#000000" cx="30"/>';
             //evenly space out labels
            var textY = i * 20 + 20;
            //text string
             svg +=
                '<text id="' +
                circles[i] +
                '-text" x="65" y="' +
                textY +
                '">' +
                Math.round(dataStats[circles[i]] * 100) / 100 
                +
                
                "</text>";

        };
            //close svg string
            svg += "</svg>";
            // add attribute legend sgv to the container 
            container.insertAdjacentHTML('beforeend',svg);

            return container;
        }
    });

    map.addControl(new LegendControl());

};
function getData(map) {
    fetch("data/natParkAttendance.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            var attributes = processData(json);
            calcStats(json);
            // call the prop symbol function so symbols actually appear
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
            createLegend(attributes)
            
            
        });
};

//create a Leaflet GeoJSON layer and add it to the map

document.addEventListener('DOMContentLoaded', createMap)