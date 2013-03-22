var years = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000","2005"]; //Hard coded years for view labels              

var scatterplot   = new Scatterplot(50, 100, 550, 550, "#scatter",30);
scatterplot.init();
//Declare some interaction functions for the scatterplot 

scatterplot.clickHintLabelFunction = function (d, i){
										scatterplot.changeView(i);		
                                        scatterplot.redrawView("null",-1);										
										slider.updateSlider(i); 
									};


scatterplot.render( dataset, 0,years);
////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the scatterplot
////////////////////////////////////////////////////////////////////////////////
 scatterplot.dragEvent = d3.behavior.drag()
                       .origin(function(d){ //Set the starting point of the drag interaction
							return {x:d.nodes[scatterplot.currentView][0],y:d.nodes[scatterplot.currentView][1]};
	                   })
					   .on("dragstart", function(d){                          
							       scatterplot.clearHintPath(scatterplot.draggedPoint);
								   scatterplot.draggedPoint = d.id; 								   							   
                                   scatterplot.showHintPath(d.id,d.repeatedPoints,d.nodes);                          								   
							                                           						   
					  })
                      .on("drag", function(d){  
                           var view = scatterplot.currentView;					  
                           scatterplot.updateDraggedPoint(d.id,d3.event.x,d3.event.y);
						   if (scatterplot.currentView != view){
                                  slider.updateSlider(scatterplot.currentView);									  
							}	
                             slider.animateTick(scatterplot.interpValue,scatterplot.currentView,scatterplot.nextView);					
                             								
					  })
					  .on("dragend",function (d){					    
					         scatterplot.snapToView(d.id,d3.event.x,d3.event.y,d.nodes);						 	
							 slider.updateSlider(scatterplot.currentView);                              							 
					  });	

scatterplot.widget.selectAll(".displayPoints")				                 			  
                   .call(scatterplot.dragEvent);

/**scatterplot.widget.on("mousemove", function (d){		  
		  if (scatterplot.clickedPoint != -1){
			scatterplot.updateDraggedPoint(scatterplot.clickedPoint,d3.svg.mouse(this)[0],d3.svg.mouse(this)[1]);
			}
	   });*/

////////////////////////////////////////////////////////////////////////////////
// Create new slider facilitating changing to different views of the visualization
////////////////////////////////////////////////////////////////////////////////   
var slider   = new Slider(15, 700, 700, 100, "#time",11,years, "Years","#666");
slider.init();
slider.render();
				  
////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the slider
////////////////////////////////////////////////////////////////////////////////
 slider.dragEvent = d3.behavior.drag()  
						.on("dragstart", function(){                               
                            scatterplot.clearHintPath(scatterplot.draggedPoint);                            							
					     }) 
                      .on("drag", function(){   
                            var previous = slider.currentTick;					  
							slider.updateDraggedSlider(d3.event.x);
                            if (previous != slider.currentTick){						
                                scatterplot.changeView(slider.currentTick);	                               									
                           }
						    scatterplot.updatePoints(slider.interpValue,slider.currentTick,slider.nextTick);													   
						    slider.updateDraggedSlider(d3.event.x);
                           						
					  })
					  .on("dragend",function (){
					      slider.snapToTick(d3.event.x);
                          scatterplot.changeView(slider.currentTick); 
                          scatterplot.redrawView("null",-1); 						  
					  });	

slider.widget.select("#slidingTick")				                 			  
                   .call(slider.dragEvent);	   
				   
