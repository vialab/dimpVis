/** This file is draws the interactive visualizations involved in the barchart experiment
 * */

var svgWidth = 1540;
var svgHeight = 1200;
//Add a main svg which all visualization elements will be appended to
d3.select("#vis").append("svg").attr("id","mainSvg").attr("width",svgWidth).attr("height",svgHeight).style("display","block");

//////////////////////Create a scatterplot visualization//////////////////////

var scatterplot   = new Scatterplot(900, 800,50);
scatterplot.init("mainSvg","gScatterplot");
setHintPathType(scatterplot,1);

//Define the click interaction of the hint labels to invoke fast switching among views
scatterplot.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation();
    d3.event.preventDefault();
    scatterplot.animatePoints(scatterplot.draggedPoint,scatterplot.currentView, i);
    changeView(scatterplot,i);
    slider.updateSlider(i);
};

//Define the dragging interaction of the scatterplot points, which will continuously update the scatterplot
scatterplot.dragEvent = d3.behavior.drag()
    /**.origin(function(d){ //Set the starting point of the drag interaction
        return {x:d.nodes[scatterplot.currentView][0],y:d.nodes[scatterplot.currentView][1]};
    })*/.on("dragstart", function(d){
        d3.event.sourceEvent.preventDefault();
        scatterplot.clearHintPath();
        scatterplot.draggedPoint = d.id;
        scatterplot.previousDragAngle = 0; //To be safe, re-set this
        scatterplot.selectPoint(d.id,d.nodes);
        logTouchDown(d.id,d3.mouse(this)[0],d3.mouse(this)[1]);
    }).on("drag", function(d){
        d3.event.sourceEvent.preventDefault();
        slider.animateTick(scatterplot.interpValue,scatterplot.currentView,scatterplot.nextView);
        scatterplot.updateDraggedPoint(d.id,d3.event.x,d3.event.y, d.nodes);
    }).on("dragend",function (d){ //In this event, mouse coordinates are undefined, need to use the saved
        d3.event.sourceEvent.preventDefault();
        scatterplot.snapToView(d.id,d.nodes);
        slider.updateSlider(scatterplot.currentView);
        logTouchUp(d.id,scatterplot.mouseX,scatterplot.mouseY);
    });


//////////////////////Create the time slider//////////////////////
var slider   = new Slider(50, 950,"","#636363",80);
slider.init("mainSvg");
//Define the function to respond to the dragging behaviour of the slider tick
slider.dragEvent = d3.behavior.drag()
    .on("dragstart", function(){
        scatterplot.clearHintPath();
        logTouchDown(0,d3.mouse(this)[0],d3.mouse(this)[1]);
    }).on("drag", function(){
        slider.mouseY = d3.event.y;
        slider.updateDraggedSlider(d3.event.x);
        scatterplot.interpolatePoints(-1,slider.interpValue,slider.currentTick,slider.nextTick);
    }).on("dragend",function (){
        slider.snapToTick();
        changeView(scatterplot,slider.currentTick);
        scatterplot.redrawView(slider.currentTick,-1);
        logTouchUp(0,slider.mouseX,slider.mouseY);
    });

//////////////////////Create the small multiples display//////////////////////

 var multiples = new Multiples(30,300);
 multiples.init();

//Attach listener to the svg for logging background touches
d3.select("#mainSvg").on("mousedown",function(){
    //TODO: add case if in small multiples
    logBackgroundTouchDown(d3.mouse(this)[0],d3.mouse(this)[1]);
}).on("mouseup", function(){
     logBackgroundTouchUp(d3.mouse(this)[0],d3.mouse(this)[1]);
});

//Important variables need to be set to be accessed by the runExperiment.js file in order to reference the barchart object
var visRef = scatterplot;
var className = ".displayPoints";
var gClassName = ".gDisplayPoints";
var gIdName = "#gScatterplot";
var realDataYLabel = "Total Enrollment (Bachelors Degree, Full Time)";
var realDataXLabel = "Program";
var realDataTitle = "Student Enrollment Over The Years At UOIT";
var phaseId = 1;
var yLabel = "Age(Years)";
var xLabel = "Height (Feet)";
//var yLabel = "";
//var xLabel = "";

//Customized display properties for the tutorial screens
var tutorialInstructions = [
    "",
    "Drag along the slider to find a view of the scatterplot that answers the question",
    "Select the image of the scatterplot that answers the question",
    "Drag the points to explore the visualization over time"
];
var tutorialGifs = ["Images/partialHintPath.png", "Images/slider.gif", "Images/multiples.png","Images/exploratory.gif"];

var techniqueInstructions = ["Drag the point","Drag the slider","Select an image"];



////////For the tutorial /////////////////////////////////////////////////////////////////////////////////

d3.select("#tutorialVis").append("svg").attr("id","tutorialSvg").attr("width",700).attr("height",550).style("display","none");

//////////////////////Create a small scatterplot visualization//////////////////////

var scatterplot_tutorial   = new Scatterplot(600, 400,10);
scatterplot_tutorial.init("tutorialSvg","gScatterplot_tutorial");
setHintPathType(scatterplot_tutorial,1);

//Define the dragging interaction of the scatterplot points, which will continuously update the scatterplot
scatterplot_tutorial.dragEvent = d3.behavior.drag()
.on("dragstart", function(d){
        d3.event.sourceEvent.preventDefault();
        scatterplot_tutorial.clearHintPath();
        scatterplot_tutorial.draggedPoint = d.id;
        scatterplot_tutorial.previousDragAngle = 0; //To be safe, re-set this
        scatterplot_tutorial.selectPoint(d.id,d.nodes);
    }).on("drag", function(d){
        d3.event.sourceEvent.preventDefault();
        slider_tutorial.animateTick(scatterplot_tutorial.interpValue,scatterplot_tutorial.currentView,scatterplot_tutorial.nextView);
        scatterplot_tutorial.updateDraggedPoint(d.id,d3.event.x,d3.event.y, d.nodes);
    }).on("dragend",function (d){ //In this event, mouse coordinates are undefined, need to use the saved
        d3.event.sourceEvent.preventDefault();
        scatterplot_tutorial.snapToView(d.id,d.nodes);
        slider_tutorial.updateSlider(scatterplot_tutorial.currentView);
    });


//////////////////////Create the time slider//////////////////////
var slider_tutorial   = new Slider(10, 470,"","#636363",80);
slider_tutorial.init("tutorialSvg");
//Define the function to respond to the dragging behaviour of the slider tick
slider_tutorial.dragEvent = d3.behavior.drag()
    .on("dragstart", function(){
        scatterplot_tutorial.clearHintPath();
    }).on("drag", function(){
        slider_tutorial.mouseY = d3.event.y;
        slider_tutorial.updateDraggedSlider(d3.event.x);
        scatterplot_tutorial.interpolatePoints(-1,slider_tutorial.interpValue,slider_tutorial.currentTick,slider_tutorial.nextTick);
    }).on("dragend",function (){
        slider_tutorial.snapToTick();
        changeView(scatterplot_tutorial,slider_tutorial.currentTick);
        scatterplot_tutorial.redrawView(slider_tutorial.currentTick,-1);
    });

var visRef_tutorial = scatterplot_tutorial;
