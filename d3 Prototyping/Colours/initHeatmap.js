/** This file creates and coordinates a heatmap and a slider according to the provided dataset
 * */

//Create new heatmap visualization
var heatmap = new Heatmap(30, 30,50,"#vis","Random",labels);

heatmap.clickSVG = function (){
    d3.event.preventDefault();
    heatmap.clearHintPath();
};

heatmap.init();

heatmap.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation();
    heatmap.animateColours(heatmap.draggedCell,heatmap.currentView,i);
    heatmap.changeView(i);
    slider.updateSlider(i);
};

heatmap.render(data,xLabels,yLabels);
//Define the function to respond to the dragging behaviour of the cells
heatmap.dragEvent = d3.behavior.drag()
                   .origin(function(d){ return {x:d.x+heatmap.cellSize/2,y:d.y+heatmap.cellSize/2};})
                   .on("dragstart", function(d){
                       heatmap.clearHintPath();
                       heatmap.draggedCell = d.id;
                       heatmap.showHintPath(d.id,d.values,d.x,d.y);
                   })
                  .on("drag", function(d){
                        heatmap.updateDraggedCell(d.id,d3.event.y);
                        slider.animateTick(heatmap.interpValue,heatmap.currentView,heatmap.nextView);
                  })
                  .on("dragend",function (d){
                       heatmap.snapToView(d.id, d.values, d.y);
                       heatmap.previousMouseY = null;
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
                      heatmap.changeView(slider.currentTick);
                      heatmap.redrawView(slider.currentTick);
                  });
//Apply the dragging function to the movable tick
slider.widget.select("#slidingTick").call(slider.dragEvent);

	

