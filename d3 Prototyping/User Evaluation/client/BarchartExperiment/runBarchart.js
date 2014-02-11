/** This file is draws the interactive visualizations involved in the barchart experiment
 * */

var svgWidth = 1200;
var svgHeight = 900;;
//Add a main svg which all visualization elements will be appended to
d3.select("#vis").append("svg").attr("id","mainSvg").attr("width",svgWidth).attr("height",svgHeight).style("display","block");

//////////////////////Create a barchart visualization//////////////////////

var barchart   = new Barchart(700, 70, 30);
barchart.init("mainSvg","gBarchart");
setHintPathType(barchart,1); //Make sure set to partial hint path initially
barchart.experimentMode = 1;

//Define click function for each hint path label
barchart.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation();
    d3.event.preventDefault();
    barchart.animateBars(barchart.draggedBar,barchart.currentView,i);
    changeView(barchart,i);
    slider.updateSlider(i);
};
//Define the function to respond to the dragging behaviour of the bars
barchart.dragEvent = d3.behavior.drag()
    .origin(function(d){ //Set the starting point of the drag interaction
        return {x:d.xPos,y:d.nodes[barchart.currentView][0]};
    })
    .on("dragstart", function(d){
        d3.event.sourceEvent.preventDefault();
        barchart.clearHintPath();
        barchart.draggedBar = d.id;
        barchart.selectBar(d.id, d.nodes, d.xPos);
        logTouchDown(d.id,d3.mouse(this)[0],d3.mouse(this)[1]);
    })
    .on("drag", function(d){
        d3.event.sourceEvent.preventDefault();
        slider.animateTick(barchart.interpValue,barchart.currentView,barchart.nextView);
        barchart.updateDraggedBar(d.id,d3.event.x,d3.event.y,d.xPos,d.nodes);
        //barchart.svg.selectAll(".displayBars").on("mouseenter",function(){});
    })
    .on("dragend",function (d){
        d3.event.sourceEvent.preventDefault();
        barchart.snapToView(d.id,d.nodes);
        slider.updateSlider(barchart.currentView);
        logTouchUp(d.id,barchart.mouseX,barchart.mouseY);
       /** barchart.svg.selectAll(".displayBars").on("mouseenter",function(d){
            barchart.clearHintPath();
            barchart.hoverBar(d.id,d.nodes, d.xPos);
        });*/
    });

//////////////////////Create the time slider//////////////////////
var slider   = new Slider(50, 800,"","#636363",80);
slider.init("mainSvg","gSlider");
//Define the function to respond to the dragging behaviour of the slider tick
slider.dragEvent = d3.behavior.drag()
    .on("dragstart", function(){
        d3.event.sourceEvent.preventDefault();
        barchart.clearHintPath();
        logTouchDown(0,d3.mouse(this)[0],d3.mouse(this)[1]);
        slider.selectTick();
    }).on("drag", function(){
        d3.event.sourceEvent.preventDefault();
        slider.mouseY = d3.event.y;
        slider.updateDraggedSlider(d3.event.x);
        barchart.interpolateBars(-1,slider.interpValue,slider.currentTick,slider.nextTick);
    }).on("dragend",function (){
        d3.event.sourceEvent.preventDefault();
        slider.snapToTick();
        changeView(barchart,slider.currentTick);
        barchart.redrawView(slider.currentTick,-1);
        logTouchUp(0,slider.mouseX,slider.mouseY);
    });

//////////////////////Create the small multiples display//////////////////////

 var multiples = new Multiples(20,225);
 multiples.init();

//Attach listener to the svg for logging background touches
d3.select("#mainSvg").on("mousedown",function(){
    //TODO: add case if not in small multiples, need to log whenever an image is clicked
    logBackgroundTouchDown(d3.mouse(this)[0],d3.mouse(this)[1]);
}).on("mouseup", function(){
     logBackgroundTouchUp(d3.mouse(this)[0],d3.mouse(this)[1]);
});

//Important variables need to be set to be accessed by the runExperiment.js file in order to reference the barchart object
var visRef = barchart;
var className = ".displayBars";
var gClassName = ".gDisplayBars";
var gIdName = "#gBarchart";
var realDataYLabel = "Total Enrollment (Bachelors Degree, Full Time)";
var realDataXLabel = "Program";
var realDataTitle = "Student Enrollment Over The Years At UOIT";
var phaseId = 0;
var yLabel = "";
var xLabel = "";

//Customized display properties for the tutorial screens
var tutorialInstructions = [
    "", "",
    "Select the image of the barchart that answers the question",
    "Drag the bars to explore the visualization over time"
];
var tutorialGifs = ["Images/partialHintPath.png", "Images/slider.png", "Images/multiples.png","Images/fastForwarding.png"];
var techniqueInstructions = ["Drag the bar","Drag the slider","Select an image"];

//////////////////////////Testing a tutorial idea /////////////////////////////////////
d3.select("#tutorialVis").append("svg").attr("id","tutorialSvg").attr("width",500).attr("height",580).style("display","none");

var barchart_tutorial   = new Barchart(400, 70, 30);
barchart_tutorial.init("tutorialSvg","gBarchartTutorial");
setHintPathType(barchart_tutorial,1); //Make sure set to partial hint path initially
barchart_tutorial.logEvents = 0;
barchart_tutorial.experimentMode = 1;

//Define the function to respond to the dragging behaviour of the bars
barchart_tutorial.dragEvent = d3.behavior.drag()
    .origin(function(d){ //Set the starting point of the drag interaction
        return {x:d.xPos,y:d.nodes[barchart_tutorial.currentView][0]};
    })
    .on("dragstart", function(d){
        d3.event.sourceEvent.preventDefault();
        barchart_tutorial.clearHintPath();
        barchart_tutorial.draggedBar = d.id;
        barchart_tutorial.selectBar(d.id, d.nodes, d.xPos);
    })
    .on("drag", function(d){
        d3.event.sourceEvent.preventDefault();
        slider_tutorial.animateTick(barchart_tutorial.interpValue,barchart_tutorial.currentView,barchart_tutorial.nextView);
        barchart_tutorial.updateDraggedBar(d.id,d3.event.x,d3.event.y,d.xPos,d.nodes);
       // barchart_tutorial.svg.selectAll(".displayBars").on("mouseenter",function(){});
    })
    .on("dragend",function (d){
        d3.event.sourceEvent.preventDefault();
        barchart_tutorial.snapToView(d.id,d.nodes);
        slider_tutorial.updateSlider(barchart_tutorial.currentView);
       /** barchart_tutorial.svg.selectAll(".displayBars").on("mouseenter",function(d){
            barchart.clearHintPath();
            barchart.hoverBar(d.id,d.nodes, d.xPos);
        });*/
    });

var slider_tutorial   = new Slider(10, 490,"","#636363",80);
slider_tutorial.init("tutorialSvg","gSliderTutorial");
//Define the function to respond to the dragging behaviour of the slider tick
slider_tutorial.dragEvent = d3.behavior.drag()
    .on("dragstart", function(){
        barchart_tutorial.clearHintPath();
        slider_tutorial.selectTick();
    }).on("drag", function(){
        slider_tutorial.mouseY = d3.event.y;
        slider_tutorial.updateDraggedSlider(d3.event.x);
        barchart_tutorial.interpolateBars(-1,slider_tutorial.interpValue,slider_tutorial.currentTick,slider_tutorial.nextTick);
    }).on("dragend",function (){
        slider_tutorial.snapToTick();
        changeView(barchart_tutorial,slider_tutorial.currentTick);
        barchart_tutorial.redrawView(slider_tutorial.currentTick,-1);
    });

var visRef_tutorial = barchart_tutorial;
var tutorial_className = "#gBarchartTutorial .displayBars";