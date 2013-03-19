var years = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000","2005"]; //Hard coded years for view labels              


////////////////////////////////////////////////////////////////////////////////
// Create new slider facilitating changing to different views of the visualization
////////////////////////////////////////////////////////////////////////////////   
var slider   = new Slider(15, 700, 700, 100, "#time",11,years, "Years");
slider.init();
slider.render();
				  
////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the slider
////////////////////////////////////////////////////////////////////////////////
 slider.dragEvent = d3.behavior.drag()  
						.on("dragstart", function(){                           
                            barchart.clearHintPath(barchart.draggedBar);							
					     }) 
                      .on("drag", function(){   
                            var previous = slider.currentTick;					  
							slider.updateDraggedSlider(d3.event.x);
                            if (previous != slider.currentTick){	                              
                                barchart.changeView(slider.currentTick);									
                           }	
						    slider.updateDraggedSlider(d3.event.x);                          						
					  })
					  .on("dragend",function (){
					      slider.snapToTick(d3.event.x);                          
                          barchart.changeView(slider.currentTick);					      
					  });	

slider.widget.select("#slidingTick")				                 			  
                   .call(slider.dragEvent);	   
				   
				   
////////////////////////////////////////////////////////////////////////////////
// Create new bar chart
////////////////////////////////////////////////////////////////////////////////   
var barchart   = new Barchart(600, 600, 30, 0 , "#bargraph",years,30);
barchart.init();
barchart.clickHintLabelFunction = function (d, i){
										//barchart.animateAlongPath(i);
										barchart.changeView(i);
										slider.updateSlider(i); 
									};
barchart.render(dataset);

////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the barchart
////////////////////////////////////////////////////////////////////////////////
 barchart.dragEvent = d3.behavior.drag()
                       .origin(function(d){ //Set the starting point of the drag interaction
							return {x:d.x,y:d.nodes[barchart.currentView][1]};
	                   })
					   .on("dragstart", function(d){                         
							       barchart.clearHintPath(barchart.draggedBar);								  
								   barchart.draggedBar = d.id;   
                                   barchart.showHintPath(d.id,d.nodes);                                 					                                              						   
					  })
                      .on("drag", function(d){    
                           var view = barchart.currentView;	                          					   
                           barchart.updateDraggedBar(d.id,d3.event.x,d3.event.y);	
						   if (barchart.currentView != view){
                                  slider.updateSlider(barchart.currentView);                                 							  
							}						
                           					   								  
					  })
					  .on("dragend",function (d){					    
					         barchart.snapToView(d.id,d3.event.y,d.nodes);							 
							 slider.updateSlider(barchart.currentView);
                             								 
					  });	

barchart.widget.selectAll(".displayBars")				                 			  
                   .call(barchart.dragEvent);
				   
