            
var years = ["1955","1960","1965","1970","1975","1980"];
var years_nhtsa = [1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009];
var heatmap = new Heatmap(20, 20, 1200, 800, "#vis",years_nhtsa);
heatmap.init();
//Render 4x6 matrix as the heatmap, across 6 different views
heatmap.render(dataMatrix,6,6,matrixColours);

 
heatmap.dragEvent = d3.behavior.drag()
                       .origin(function(d){ //Set the starting point of the drag interaction
							return {x:d.x,y:d.y};
	                   })
					   .on("dragstart", function(d){ 
                           heatmap.clearHintPath(heatmap.selected);					   
						   heatmap.selected = d.id;						  
						   heatmap.showHintPath(d.id,d.pathData,d.x,d.y);
						   heatmap.previousMouseY = d3.event.y;	                           								   
							                                           						   
					  })  
					.on("drag", function(d){  
                          if (heatmap.selected != -1){
								heatmap.updateDraggedCell(heatmap.selected,d3.event.y);	   
							   //console.log("move mouse");
							} 
                            slider.animateTick(heatmap.interpValue,heatmap.currentView,heatmap.nextView);								
					  })					  
					  .on("dragend",function (d){				    
					       heatmap.snapToView();						   
						   heatmap.selected = -1;  
						   heatmap.previousMouseY = null;  				 
					  });	


heatmap.widget.selectAll(".cell").call(heatmap.dragEvent);

////////////////////////////////////////////////////////////////////////////////
// Create new slider facilitating changing to different views of the visualization
////////////////////////////////////////////////////////////////////////////////   
var slider   = new Slider(110, 770, 700, 100, "#time",20,years_nhtsa, "Years","#666");
slider.init();
slider.render();
				  
////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the slider
////////////////////////////////////////////////////////////////////////////////
 /**slider.dragEvent = d3.behavior.drag()  
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
                   .call(slider.dragEvent);	*/   

	

