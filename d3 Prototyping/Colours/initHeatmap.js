var years = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000","2005"]; //Hard coded years for view labels              

var heatmap = new Heatmap(0, 0, 800, 800, "#vis");
heatmap.init();
heatmap.render(years);
/**scatterplot.render( dataset, 0,years);
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
								   //console.log(d.nodes[7][0]+" "+d.nodes[7][1]+" "+d.nodes[8][0]+" "+d.nodes[8][1]);
                                   barchart.clearHintPath(barchart.draggedBar);								   
                                   scatterplot.showHintPath(d.id);                          								   
							                                           						   
					  })
                      .on("drag", function(d){  
                           var view = scatterplot.currentView;					  
                           scatterplot.updateDraggedPoint(d.id,d3.event.x,d3.event.y);
						   if (scatterplot.currentView != view){
                                  slider.updateSlider(scatterplot.currentView);	
								  barchart.changeView(scatterplot.currentView);
							}	 
                            //scatterplot.showHintPath(d.id);  								
					  })
					  .on("dragend",function (d){					    
					         scatterplot.snapToView(d.id,d3.event.x,d3.event.y,d.nodes);						 	
							 slider.updateSlider(scatterplot.currentView);  
                             barchart.changeView(scatterplot.currentView);							 
					  });	

scatterplot.widget.selectAll(".displayPoints")				                 			  
                   .call(scatterplot.dragEvent);*/


	

