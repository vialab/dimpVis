/** This file is draws the interactive visualizations involved in the barchart experiment
 * */

//////////////////////Create a barchart visualization//////////////////////

//Add a main svg which all visualization elements will be appended to
d3.select("#vis").append("svg").attr("id","mainSvg").attr("width",1200).attr("height",1000);

var barchart   = new Barchart(700, 70, 30);
barchart.init();
setHintPathType(barchart,1); //Make sure set to partial hint path initially

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
        logTouchDown(d.id);
    })
    .on("drag", function(d){
        d3.event.sourceEvent.preventDefault();
        slider.animateTick(barchart.interpValue,barchart.currentView,barchart.nextView);
        barchart.updateDraggedBar(d.id,d3.event.x,d3.event.y,d.xPos,d.nodes);
    })
    .on("dragend",function (d){
        d3.event.sourceEvent.preventDefault();
        barchart.snapToView(d.id,d.nodes);
        slider.updateSlider(barchart.currentView);
        logTouchUp(d.id);
    });

//////////////////////Create the time slider//////////////////////
var slider   = new Slider(50, 800,labels, "","#636363",80);
slider.init();
//Define the function to respond to the dragging behaviour of the slider tick
slider.dragEvent = d3.behavior.drag()
    .on("dragstart", function(){ barchart.clearHintPath();})
    .on("drag", function(){
        slider.updateDraggedSlider(d3.event.x);
        barchart.interpolateBars(-1,slider.interpValue,slider.currentTick,slider.nextTick);
    })
    .on("dragend",function (){
        slider.snapToTick();
        changeView(barchart,slider.currentTick);
        barchart.redrawView(slider.currentTick,-1);
    });

//////////////////////Create the small multiples display//////////////////////
/**var multiples = new Multiples("#multiples",10,100,2,2);
multiples.clickImageFunction = function (d){
    multiples.clickedImage = d.id;
    //TODO: add data logging of the answer
    console.log("clicked "+ d.name+" "+ d.id);
}*/




