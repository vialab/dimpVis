var years = [1970,	1971,	1972,	1973,	1974,	1975,	1976,	1977,	1978,	1979,	1980,	1981,	
1982,	1983,	1984,	1985,	1986,	1987,	1988,	1989,	1990,	1991,	1992,	1993,	1994,	
1995,	1996,	1997,	1998,	1999,	2000,	2001,	2002,	2003,	2004,	2005,	2006,	2007,	
2008,	2009,	2010,	2011];
            


////////////////////////////////////////////////////////////////////////////////
// Create new slider facilitating changing to different views of the visualization
////////////////////////////////////////////////////////////////////////////////   
var slider   = new Slider(15, 700, 1400, 100, "#time",years.length,years, "Years","#666",17);
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
                            barchart.updateBars(slider.interpValue,slider.currentTick,slider.nextTick);  							
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
var barchart   = new Barchart(600, 500, 30, 0 , "#bargraph",years,80);
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
                                   barchart.previousMouseX = d3.mouse(this)[0];								   
					  })
                      .on("drag", function(d){                                                  						   
                           barchart.updateDraggedBar(d.id,d3.mouse(this)[0],d3.mouse(this)[1]);	
						   	slider.animateTick(barchart.interpValue,barchart.currentView,barchart.nextView);					
                           					   								  
					  })
					  .on("dragend",function (d){					    
					         barchart.snapToView(d.id,d3.event.y,d.nodes);							 
							 slider.updateSlider(barchart.currentView);
                             								 
					  });	

barchart.widget.selectAll(".displayBars")				                 			  
                   .call(barchart.dragEvent);
				   
