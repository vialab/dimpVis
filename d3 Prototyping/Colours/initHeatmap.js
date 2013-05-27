/** This file creates and coordinates a heatmap and a slider according to the provided dataset
 * */

//Create new heatmap visualization
var heatmap = new Heatmap(30, 30,50,"#vis","Car complaints",labels);
heatmap.init();

//TODO:Define the function when the SVG (background of graph) is clicked, should clear the hint path displayed
/**heatmap.clickSVG = function (){
    heatmap.clearHintPath();
};*/
//TODO:Define click function for each hint path label
heatmap.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation();
    heatmap.animateColours(heatmap.draggedCell,heatmap.currentView,i);
    heatmap.changeView(i);
    slider.updateSlider(i);
};

heatmap.render(data,xLabels,yLabels);
//Define the function to respond to the dragging behaviour of the cells
heatmap.dragEvent = d3.behavior.drag()
                   .origin(function(d){ return {x:d.x,y:d.y};})
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
                  });

//Apply the dragging function to each cell on the heatmap
heatmap.svg.selectAll(".cell").call(heatmap.dragEvent);

//Create a slider widget
var slider   = new Slider(10, 500, "#time",labels, "Years","#666",15);
slider.init();
slider.render();
//Define the function to respond to the dragging behaviour of the slider tick
slider.dragEvent = d3.behavior.drag()
					  .on("dragstart", function(){ heatmap.clearHintPath();})
                      .on("drag", function(){                               				  
							slider.updateDraggedSlider(d3.event.x);
                            heatmap.interpolateColours(slider.currentTick,slider.nextTick,slider.interpValue);
					  })
					  .on("dragend",function (){
					      slider.snapToTick();
                          heatmap.changeView(slider.currentTick);
                          heatmap.redrawView(slider.currentTick,-1);
					  });
//Apply the dragging function to the movable tick
slider.widget.select("#slidingTick").call(slider.dragEvent);

	

