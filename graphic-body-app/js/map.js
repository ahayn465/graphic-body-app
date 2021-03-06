/**
 * Created by Amanda on 2016-02-15.
 */



var regions = {};
var allTheRegions = [];
var touchedRegions = [];

var userName = '';
var userAge = '';

var theSymptom = '';
var theSeverity = 0;

var fs = require('fs');
var anterior = JSON.parse(fs.readFileSync('views/anterior.json', 'utf8'));
var posterior = JSON.parse(fs.readFileSync('views/posterior.json', 'utf8'));


(function initialize() {

    renderMap(anterior['regions'], 'anterior-map');
    renderMap(posterior['regions'], 'posterior-map');

    for( var i in anterior['regions'] ){
        allTheRegions.push( anterior['regions'][i] );
    }
    for( var i in anterior['regions'] ){
        allTheRegions.push( posterior['regions'][i] );
    }

    var modal = document.getElementById('symptomModal');


    //Event listeners for the window

    // Modal Save: When the user clicks on save, close the modal and update the dermatomes
    var closeSpan = document.getElementById('closeModal');
    closeSpan.onclick = function () {
        modal.style.display = "none";
        updateDermatomes();
    }

    // Update user info
    userName = document.getElementById('name');
    userAge = document.getElementById('age');

    userName.addEventListener('change',function(event) {
        console.log(userName.value);
    });

    userAge.addEventListener('change',function(event) {
        console.log(userAge.value);
    })


})();



/**
 * Function renderMap
 *
 * creates a map using Raphael with a given array of path data
 *
 * @param data - A JSON file that contains the path data for the view
 * @param viewId - The id of the div to render the map in
 */
function renderMap(data, viewId){

    var mapContainer = document.getElementById(viewId);
    document.write(mapContainer);

    var map = new Raphael(mapContainer, 350, 700);
    map.setViewBox(0, 0, 900, 1900 );


    var style = {
        fill: "#D3AF8E",
        stroke: "#D3AF8E",
        "stroke-width": 0,
        "stroke-linejoin": "round",
        cursor: "pointer",
    };

    var animationSpeed = 500;
    var hoverStyle = {
        fill: "#27b7c0"
    }
    var hoverStyle = {
        fill: "#27b7c0"
    }

   for(var i=0; i < data.length; i++){

       regions[i] = map.path(data[i]['path']);

       regions[i]['view'] = data[i]['view'];
       regions[i]['region'] = data[i]['region'];
       regions[i]['dermatome'] = data[i]['dermatome'];
       regions[i]['side'] = data[i]['side'];

       regions[i]['sympt-pain'] = data[i]['sympt-pain'];
       regions[i]['sympt-numbness'] = data[i]['sympt-numbness'];
       regions[i]['sympt-tingling'] = data[i]['sympt-tingling'];
       regions[i]['sympt-weakness'] = data[i]['sympt-weakness'];

       var idString = data[i]['side'] + '-' + data[i]['dermatome']  + '-' + data[i]['view'];

       regions[i]['pathid'] = idString;


   }



    //add event listeners and atributes to the svg regions
    for(var regionName in regions) {
        regions[regionName].attr(style);
        (function (region) {
            region.attr(style);

            region[0].addEventListener("mouseenter", function() {
                region.animate(hoverStyle, animationSpeed);

                // if the region has not been added to the array already, add it
                if(touchedRegions.indexOf(region['pathid']) === -1){
                    touchedRegions.push(region['pathid']);
                }

            }, true);

            region[0].addEventListener("mouseout", function() {
                region.animate(style, animationSpeed);


            }, true);

        })(regions[regionName]);


    }

    return addEventListeners(viewId);
}




function addEventListeners (viewId){
    var map = document.getElementById(viewId);
    var mousedownID = -1;  //Global ID of mouse down interval

    function mousedown(event) {
        if(mousedownID==-1)  //Prevent multiple loops!
            mousedownID = setInterval(whilemousedown, 100 /*execute every 100ms*/);
        console.log('mouse has been clicked');

    }
    function mouseup(event) {
        if(mousedownID!=-1) {  //Only stop if exists
            clearInterval(mousedownID);
            mousedownID = -1;

            if(touchedRegions.length > 0){
                gatherSeverityData();
            }
        }
    }
    function whilemousedown() {
        console.log('mouse is currently down');
    }
    //Assign events
    map.addEventListener("mousedown", mousedown);
    map.addEventListener("mouseup", mouseup);

    //Also clear the interval when user leaves the window with mouse
    map.addEventListener('click', function(){

    })
}


function gatherUserData(){
    var modal = document.getElementById('userModal');

    modal.style.display = "block";
    slider = document.getElementById('slider');
    noUiSlider.create(slider, {
        start: [1],
        step: 1,
        range: {
            'min': 1,
            'max': 10
        }
    });
}


function gatherSeverityData() {

    //Display the modal, and create the severity slider
    var modal = document.getElementById('symptomModal');
    var dropdown = document.getElementById('symptomDropdown');

    //get the symptom from the dropdown
    //initialize it to the default of pain
    theSymptom = dropdown.options[dropdown.selectedIndex].value;

    //and update it if it changes
    dropdown.addEventListener('change', function(){
        theSymptom = dropdown.options[dropdown.selectedIndex].value;
    });

    modal.style.display = "block";
    slider = document.getElementById('slider');
    noUiSlider.create(slider, {
        start: [1],
        step: 1,
        range: {
            'min': 1,
            'max': 10
        }
    });

    var valueInput = document.getElementById('value-input'),
        valueSpan = document.getElementById('severity-span');

    slider.noUiSlider.on('update', function () {
        theSeverity = slider.noUiSlider.get();
    });

}

// called when the modal is closed to update the dermatomes in the selected regions
function updateDermatomes(){
    console.log('reporting ' + theSymptom + ' level ' + theSeverity + ' on the following regions');

   touchedRegions.forEach( updateSvgRegions )

    var result = allTheRegions.filter(function( obj ) {
        var a = touchedRegions.indexOf(obj['dermatome']);

        if(a > -1){
           console.log(obj['id']);
        }
    });

    console.log(touchedRegions);

}


function updateSvgRegions(item, index){

    var lookup = {};
    for (var i = 0, len = allTheRegions.length; i < len; i++) {

        var idString = allTheRegions[i]['side'] + '-' + allTheRegions[i]['dermatome'] + '-' + allTheRegions[i]['view'];

        if(idString === item){

            var symptomString = 'sympt-' + theSymptom;
            allTheRegions[i][symptomString] = theSeverity;

            console.log(allTheRegions[i]);
        }

        lookup[allTheRegions[i].pathid] = allTheRegions[i];
    }


    touchedRegions = [];
}


function resetMaps(){

    console.log("Resetting maps");

    allTheRegions.forEach( function(item){
        item['sympt-pain'] = 0;
        item['sympt-numbness'] = 0;
        item['sympt-tingling'] = 0;
        item['sympt-weakness'] = 0;
    });
}


function convertArrayOfObjectsToCSV(args) {

    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || "\n";

    keys = Object.keys(data[0]);
    var index = keys.indexOf('path');

    if (index > -1) {
        keys.splice(index, 1);
    }

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;


    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    console.log(result);
    return result;

}


function saveData(defaultFileName){

    var utc = new Date().toJSON().slice(0,10);

    var filename = defaultFileName + userName.value + userAge.value + '-' + utc + '.csv';

    console.log('saving to '+ filename);

    var args = { columnDelimiter: ',', data: allTheRegions };
    var result = convertArrayOfObjectsToCSV(args);

    saveToFile(filename, result);
}












/** Potential touch event handlers **/
/** TODO testing required with device **/


(function startup() {
    var el = document.getElementById("anterior-map");
    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleCancel, false);
    log("initialized.");
})();

var ongoingTouches = new Array();

function handleStart(evt) {

     console.log('started touce events');
    evt.preventDefault();
    log("touchstart.");
    var el = document.getElementById("anterior-map");
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        log("touchstart:" + i + "...");
        ongoingTouches.push(copyTouch(touches[i]));
        var color = colorForTouch(touches[i]);
        ctx.beginPath();
        ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
        ctx.fillStyle = color;
        ctx.fill();
        log("touchstart:" + i + ".");
    }
}

function handleEnd(evt) {
    evt.preventDefault();
    log("touchend");
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        var color = colorForTouch(touches[i]);
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            ctx.lineWidth = 4;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8);  // and a square at the end
            ongoingTouches.splice(idx, 1);  // remove it; we're done
        } else {
            log("can't figure out which touch to end");
        }
    }
}

function handleCancel(evt) {
    evt.preventDefault();
    log("touchcancel.");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        ongoingTouches.splice(i, 1);  // remove it; we're done
    }
}

function log(msg) {
    console.log(msg);
}
