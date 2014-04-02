/** This file creates and coordinates a heatmap and a slider according to the provided dataset
 * */
//Add a main svg which all visualization elements will be appended to
d3.select("#heatmap").append("svg").attr("id","mainSvg").on("click",function(){
    d3.event.preventDefault();
    heatmap.clearHintPath();
});
var screenWidth = window.innerWidth-50;
var screenHeight = window.innerHeight-50;

window.onload = function (){
    //TODO:barchart.useMobile = checkDevice();
    d3.select("#mainSvg").attr("width",screenWidth).attr("height",screenHeight);
}
//Create new heatmap visualization
var heatmap = new Heatmap(70,screenWidth,screenHeight,"Network of Student Relationships over Time (Gerhard van de Bunt)",labels);

heatmap.init();
//setHintPathType(heatmap,1);

heatmap.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation();
    d3.event.preventDefault();
    heatmap.animateColours(heatmap.draggedCell,heatmap.currentView,i);
    changeView(heatmap,i);
    slider.updateSlider(i);
};
heatmap.render(data,xLabels,yLabels);
heatmap.showLegend(legendLabels,5,200);

//Define the function to respond to the dragging behaviour of the cells
heatmap.dragEvent = d3.behavior.drag()
                   .origin(function(d){ return {x:d.x+heatmap.cellSize/2,y:d.y+heatmap.cellSize/2};})
                   .on("dragstart", function(d){
                       d3.event.sourceEvent.preventDefault();
                       heatmap.clearHintPath();
                       heatmap.draggedCell = d.id;
                       heatmap.selectCell(d.id,d.values,d.x,d.y);
                   })
                  .on("drag", function(d){
                        d3.event.sourceEvent.preventDefault();
                        heatmap.updateDraggedCell(d.id,d3.event.y, d3.event.x,d.values);
                        slider.animateTick(heatmap.interpValue,heatmap.currentView,heatmap.nextView);
                  })
                  .on("dragend",function (){
                       d3.event.sourceEvent.preventDefault();
                       heatmap.snapToView();
                       slider.updateSlider(heatmap.currentView);
                  });

//Apply the dragging function to each cell on the heatmap
heatmap.svg.selectAll(".cell").call(heatmap.dragEvent);

//Create a slider widget
var slider   = new Slider(50, 540, labels, "","#666",50);
slider.init();
slider.render();
//Define the function to respond to the dragging behaviour of the slider tick
slider.dragEvent = d3.behavior.drag()
                  .on("dragstart", function(){ heatmap.clearHintPath();})
                  .on("drag", function(){
                        heatmap.interpolateColours(slider.currentTick,slider.nextTick,slider.interpValue);
                        slider.updateDraggedSlider(d3.event.x);
                  })
                  .on("dragend",function (){
                      slider.snapToTick();
                      changeView(heatmap,slider.currentTick);
                      heatmap.redrawView(slider.currentTick);
                  });
//Apply the dragging function to the movable tick
slider.widget.select("#slidingTick").call(slider.dragEvent);

	

