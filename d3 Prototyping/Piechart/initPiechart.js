/** This file creates and coordinates a piechart and a slider according to the provided dataset
 * */

 //Create a new piechart visualization
var piechart   = new Piechart(50, 50 , 180,"#piegraph","Test Piechart",labels);

//Define the function when the SVG (background) is clicked, should clear the hint path displayed
piechart.clickSVG = function (){
    piechart.clearHintPath();
};
//Initialize and render the piechart visualization
piechart.init();
piechart.render(data,0);

//Define the function for fast-forwarding the view by clicking on any label along the hint path
/**piechart.clickHintLabelFunction = function (){

 };*/

//Define the dragging interaction for the piechart segments
piechart.dragEvent = d3.behavior.drag()
    //TODO:Set the starting point of the drag interaction
    /**.origin(function(d){
     return {x:d3.event.x,y:d3.event.y};
     })*/
    .on("dragstart", function(d){
        piechart.clearHintPath();
        piechart.showHintPath(d.id, d.hDirections, d.nodes, d.startAngle);
    })
    .on("drag", function(d){
        piechart.updateDraggedSegment(d.id,d3.event.x,d3.event.y);
        slider.animateTick(piechart.interpValue,piechart.currentView,piechart.nextView);
    })
    .on("dragend",function (d){
        piechart.snapToView(d.id,d.endAngle,d.nodes);
        //slider.updateSlider(piechart.currentView);
        //piechart.redrawView();
        //piechart.redrawSegments(d.id,d.startAngle,d.endAngle);
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
                            piechart.updateSegments(slider.interpValue,slider.currentTick,slider.nextTick);
                     })
                     .on("dragend",function (){
                          slider.snapToTick();
                          piechart.changeView(slider.currentTick);
                          //piechart.redrawView(-1,-1);
                     });

slider.widget.select("#slidingTick").call(slider.dragEvent);


				   

