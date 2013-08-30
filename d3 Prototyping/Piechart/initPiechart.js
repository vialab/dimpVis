/** This file creates and coordinates a piechart and a slider according to the provided dataset
 * */

//Create a new piechart visualization
var piechart   = new Piechart(50, 50 , 180,"#piegraph","Random",labels);
var colours = colorbrewer.Set2[3]; //Use scale from color brewer
var colourLabels = ["Segment A","Segment B","Segment C"];

//Define the function when the SVG (background) is clicked, should clear the hint path displayed
piechart.clickSVG = function (){
    piechart.clearHintPath();
};
//Initialize and render the piechart visualization
piechart.init();
piechart.render(data,colours);

drawColourLegend(piechart,colours,colourLabels,220,10,30,15,1.2);

//Define the function for fast-forwarding the view by clicking on any label along the hint path
piechart.clickHintLabelFunction = function (d,i){
     d3.event.stopPropagation();
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
        piechart.draggedSegment = d.id;
        piechart.clearHintPath();
        //Prevent the angle from blowing up, by making sure it starts under 360 deg
        if (d.startAngle > piechart.twoPi){d.startAngle = d.startAngle - piechart.twoPi}
        piechart.showHintPath(d.id, d.nodes, d.startAngle);
    })
    .on("drag", function(d){
        piechart.updateDraggedSegment(d.id,d3.event.x,d3.event.y, d.nodes);
        slider.animateTick(piechart.interpValue,piechart.currentView,piechart.nextView);
    })
    .on("dragend",function (d){
        piechart.snapToView(d.id,d.nodes);
        slider.updateSlider(piechart.currentView);
    });

piechart.svg.selectAll(".displayArcs").call(piechart.dragEvent);

//Create a new slider widget as an alternative for switching views of the scatterplot visualization
var slider   = new Slider(15, 700, "#time",labels, "Years","#666",50);
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


				   

