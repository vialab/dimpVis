/** This file creates and coordinates a scatterplot and a slider according to the provided dataset
 * */

//Create a new scatterplot visualization
var scatterplot   = new Scatterplot(0, 0, 550, 550, "#scatter",50,5,"fertility rate (children per woman)","life expectancy (years)","Fertility Rate vs. Life Expectancy of World Countries");

//Define the function when the SVG (background of graph) is clicked, should clear the hint path displayed
/**scatterplot.clickSVG = function (){
    d3.event.preventDefault();
    scatterplot.clearHintPath();
};*/

scatterplot.init();

scatterplot.render( dataset, 0,labels); //Draw the scatterplot, dataset is an array created in a separate js file containing the json data,
                                        // and labels is an array representing the different views of the dataset

//Define the dragging interaction of the scatterplot points, which will continuously update the scatterplot
var dragPoint = d3.behavior.drag()
                       .origin(function(d){ //Set the starting point of the drag interaction
							return {x:d.nodes[scatterplot.currentView][0],y:d.nodes[scatterplot.currentView][1]};
	                   })
					   .on("dragstart", function(d){
                            d3.event.sourceEvent.preventDefault();
                            scatterplot.clearHintPath();
						    scatterplot.draggedPoint = d.id;
                            scatterplot.previousDragAngle = 0; //To be safe, re-set this
                            scatterplot.showHintPath(d.id,d.nodes);
					  })
                      .on("drag", function(d){
                           document.title = "drag1";
                           d3.event.sourceEvent.preventDefault();
                           var userX,userY;
                           if (d3.touches(this).length > 0){
                               userX = d3.touches(this)[0][0];
                               userY = d3.touches(this)[0][1];
                           }else{
                               userX = d3.event.x;
                               userY = d3.event.y;
                           }
                           slider.animateTick(scatterplot.interpValue,scatterplot.currentView,scatterplot.nextView);
                           scatterplot.updateDraggedPoint(d.id,userX,userY);
                           document.title = "drags2"+d3.touches(this);
					  })
					  .on("dragend",function (d){ //In this event, mouse coordinates are undefined, need to use the saved
                                                  //coordinates of the scatterplot object
                            if (!d3.select(d3.event.sourceEvent.target).classed("displayPoints")) //Hack: checks if the event is targeting a point or some other class
                                return;

                            d3.event.sourceEvent.preventDefault();
					        scatterplot.snapToView(d.id,d.nodes);
							slider.updateSlider(scatterplot.currentView);
                            scatterplot.clearHintPath();
                            document.title = "drag end points";
					  });	

//Apply the dragging function to all points of the scatterplot, making them all draggable
scatterplot.svg.selectAll(".displayPoints").call(dragPoint);


//Create a new slider widget as an alternative for switching views of the scatterplot visualization
var slider   = new Slider(15, 700, "#time",labels, "Time","#666",50);
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
				   
