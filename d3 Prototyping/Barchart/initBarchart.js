////////////////////////////////////////////////////////////////////////////////
// Create new slider facilitating changing to different views of the visualization
////////////////////////////////////////////////////////////////////////////////   
var slider   = new Slider(700, 100, "#time",labels, "Years","#666",50);
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
							slider.updateDraggedSlider(d3.event.x);
                           barchart.interpolateBars(-1,slider.interpValue,slider.currentTick,slider.nextTick);
						                             						
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
var barchart   = new Barchart(800, 300, 30, 0 , "#bargraph",80,"country","population","Populations of a subset of countries over time");
barchart.init();
barchart.clickHintLabelFunction = function (d, i){
										//barchart.animateAlongPath(i);
										barchart.changeView(i);
										slider.updateSlider(i); 
									};
barchart.render(dataset,0,labels);

////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the barchart
////////////////////////////////////////////////////////////////////////////////
 barchart.dragEvent = d3.behavior.drag()
                       .origin(function(d){ //Set the starting point of the drag interaction
							return {x:d.xPos,y:d.nodes[barchart.currentView][0]};
	                   })
					   .on("dragstart", function(d){                         
							       barchart.clearHintPath(barchart.draggedBar);								  
								   barchart.draggedBar = d.id;   
                                   barchart.showHintPath(d.id, d.nodes, d.xPos);
					  })
                      .on("drag", function(d){                              				  
                           barchart.updateDraggedBar(d.id,d3.event.y);					   
                          slider.animateTick(barchart.interpValue,barchart.currentView,barchart.nextView);								
                           					   								  
					  })
					  .on("dragend",function (d){					    
					        barchart.snapToView(d.id,d.nodes);
							slider.updateSlider(barchart.currentView);
                             								 
					  });	

barchart.svg.selectAll(".displayBars")
                   .call(barchart.dragEvent);
				   
