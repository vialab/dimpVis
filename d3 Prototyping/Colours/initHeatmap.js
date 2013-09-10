/** This file creates and coordinates a heatmap and a slider according to the provided dataset
 * */

//Create new heatmap visualization
var heatmap = new Heatmap(30, 30,50,"#vis","Random",labels);

heatmap.clickSVG = function (){
    d3.event.preventDefault();
    heatmap.clearHintPath();
};

heatmap.init();
setHintPathType(heatmap,1);

heatmap.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation();
    d3.event.preventDefault();
    heatmap.animateColours(heatmap.draggedCell,heatmap.currentView,i);
    changeView(heatmap,i);
    slider.updateSlider(i);
};

var colours = colorbrewer.YlOrRd[5];
var colourLabels = ["rgb(254,224,139)","rgb(253,174,97)","rgb(244,109,67)","rgb(215,48,39)","rgb(165,0,38)"];
heatmap.render(data,xLabels,yLabels,colours);

//drawColourLegend(heatmap,colours,colourLabels,220,10,heatmap.cellSize/3,heatmap.cellSize/3,1);

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
var slider   = new Slider(10, 300, "#time",labels, "Time","#666",20);
slider.init();
slider.render();
//Define the function to respond to the dragging behaviour of the slider tick
slider.dragEvent = d3.behavior.drag()
                  .on("dragstart", function(){ heatmap.clearHintPath();})
                  .on("drag", function(){
                       console.log(slider.currentTick+" "+slider.nextTick+" "+slider.interpValue);
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

	

