/** This file creates and coordinates a piechart and a slider according to the provided dataset
 * */

//Add a main svg which all visualization elements will be appended to

d3.select("#piegraph").append("svg").attr("id","mainSvg").on("click",function(){
    piechart.clearHintPath();
});

//Create a new piechart visualization
var piechart   = new Piechart(20 , 150,"Secondary School Averages of Full Time, First Year Science Students",labels);

window.onload = function (){
    piechart.useMobile = checkDevice();
    d3.select("#mainSvg").attr("width",window.innerWidth-50).attr("height",window.innerHeight-50);
}

//Define the function when the SVG (background) is clicked, should clear the hint path displayed
piechart.clickSVG = function (){
    piechart.clearHintPath();
};
//Initialize and render the piechart visualization
piechart.init();
//setHintPathType(piechart,1);
piechart.render(data);
piechart.showLegend(0,50);


//Define the function for fast-forwarding the view by clicking on any label along the hint path
piechart.clickHintLabelFunction = function (d,i){
     d3.event.stopPropagation();
    d3.event.preventDefault();
     piechart.animateSegments(piechart.draggedSegment,piechart.currentView,i);
     changeView(piechart,i);
     slider.updateSlider(i);
 };

//Define the dragging interaction for the piechart segments
piechart.dragEvent = d3.behavior.drag()
    //TODO:Set the starting point of the drag interaction
    /**.origin(function(d){
     return {x:d3.event.x,y:d3.event.y};
     })*/
    .on("dragstart", function(d){
        d3.event.sourceEvent.preventDefault();
        piechart.draggedSegment = d.id;
        piechart.clearHintPath();
        //Prevent the angle from blowing up, by making sure it starts under 360 deg
        if (d.startAngle > piechart.twoPi){d.startAngle = d.startAngle - piechart.twoPi}
        piechart.selectSegment(d.id, d.nodes, d.startAngle);
    })
    .on("drag", function(d){
        d3.event.sourceEvent.preventDefault();
        var coords = getUserCoords(this);
        piechart.updateDraggedSegment(d.id,coords[0],coords[1], d.nodes);
        slider.animateTick(piechart.interpValue,piechart.currentView,piechart.nextView);
    })
    .on("dragend",function (d){
        d3.event.sourceEvent.preventDefault();
        piechart.snapToView(d.id,d.nodes);
        slider.updateSlider(piechart.currentView);
    });

piechart.svg.selectAll(".displayArcs").call(piechart.dragEvent);

//Create a new slider widget as an alternative for switching views of the scatterplot visualization
var slider   = new Slider(60, 500, labels, "","#666",50);
slider.init();
slider.render();

//Define the dragging interaction for the slider, which moves the sliding tick back and forth
slider.dragEvent = d3.behavior.drag()
    .on("dragstart", function(){ piechart.clearHintPath();})
    .on("drag", function(){
        slider.updateDraggedSlider(d3.event.x);
        piechart.interpolateSegments(-1,0,slider.currentTick,slider.nextTick,slider.interpValue);
    })
    .on("dragend",function (){
        slider.snapToTick();
        changeView(piechart,slider.currentTick);
        piechart.redrawView(slider.currentTick,piechart.draggedSegment);
    });

slider.widget.select("#slidingTick").call(slider.dragEvent);


				   

