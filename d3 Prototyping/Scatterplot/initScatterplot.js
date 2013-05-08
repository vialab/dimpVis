/** This file creates and coordinates a scatterplot and a slider according to the provided dataset
 * */

//Create a new scatterplot visualization
var scatterplot   = new Scatterplot(0, 0, 550, 550, "#scatter",50,5,"fertility rate","life expectancy","Fertility Rate vs. Life Expectancy Over the Years");

//Define the function when the SVG (background of graph) is clicked, should clear the hint path displayed
scatterplot.clickSVG = function (){
    scatterplot.clearHintPath();
};
scatterplot.init();

//Define the click interaction of the hint labels to invoke fast switching among views
scatterplot.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation(); //Prevents the event from propagating down to the SVG
    scatterplot.animatePoints(scatterplot.currentView, i);
    scatterplot.changeView(i);
    slider.updateSlider(i);
};

scatterplot.render( dataset, 0,labels); //Draw the scatterplot, dataset is an array created in a separate js file containing the json data,
                                        // and labels is an array representing the different views of the dataset

//Define the dragging interaction of the scatterplot points, which will continuously update the scatterplot
 scatterplot.dragEvent = d3.behavior.drag()
                       .origin(function(d){ //Set the starting point of the drag interaction
							return {x:d.nodes[scatterplot.currentView][0],y:d.nodes[scatterplot.currentView][1]};
	                   })
					   .on("dragstart", function(d){
                            //d3.event.sourceEvent.stopPropagation(); //TODO: this doesn't seem to work..
						    scatterplot.clearHintPath();
						    scatterplot.draggedPoint = d.id;
                            scatterplot.showHintPath(d.id,d.nodes);
					  })
                      .on("drag", function(d){
                           scatterplot.updateDraggedPoint(d.id,d3.event.x,d3.event.y);
                           slider.animateTick(scatterplot.interpValue,scatterplot.currentView,scatterplot.nextView);
					  })
					  .on("dragend",function (d){ //In this event, mouse coordinates are undefined, need to use the saved
                                                  //coordinates of the scatterplot object
					        scatterplot.snapToView(d.id,d.nodes);
							slider.updateSlider(scatterplot.currentView);
					  });	

//Apply the dragging function to all points of the scatterplot, making them all draggable
scatterplot.svg.selectAll(".displayPoints")
                   .call(scatterplot.dragEvent);

//Create a new slider widget as an alternative for switching views of the scatterplot visualization
var slider   = new Slider(15, 700, "#time",labels, "Years","#666",50);
slider.init();
slider.render();
				  
//Define the dragging interaction of the slider which will update the view of the scatterplot
 slider.dragEvent = d3.behavior.drag()  
						.on("dragstart", function(){                               
                            scatterplot.clearHintPath();
					     }) 
                      .on("drag", function(){                               					  
							slider.updateDraggedSlider(d3.event.x);                       
						    scatterplot.interpolatePoints(-1,slider.interpValue,slider.currentTick,slider.nextTick);
					  })
					  .on("dragend",function (){
					      slider.snapToTick();
                          scatterplot.changeView(slider.currentTick); 
                          scatterplot.redrawView(slider.currentTick);
					  });	

//Apply the dragging event to the slider's movable tick
slider.widget.select("#slidingTick")				                 			  
                   .call(slider.dragEvent);	   
				   
