 var axisLabels = ["transmission", "wheel","seat","engine","brakes","pedal"];
       
var years = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000","2005"];

var heatmap = new Heatmap(20, 20, 1200, 800, "#vis",years,[],20);
heatmap.init();
//Render 4x6 matrix as the heatmap, across 6 different views
heatmap.render(data,4,6,matrixColours);

 
heatmap.dragEvent = d3.behavior.drag()
                       .origin(function(d){ //Set the starting point of the drag interaction
							return {x:d.x,y:d.y};
	                   })
					   .on("dragstart", function(d){ 
                          			   
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
                            heatmap.clearHintPath(d.id);							  
					       heatmap.snapToView();						   
						   heatmap.selected = -1;  
						   heatmap.previousMouseY = null;  				 
					  });	


heatmap.widget.selectAll(".cell").call(heatmap.dragEvent);

////////////////////////////////////////////////////////////////////////////////
// Create new slider facilitating changing to different views of the visualization
////////////////////////////////////////////////////////////////////////////////   
var slider   = new Slider(110, 770, 700, 100, "#time",6,years, "Years","#666",50);
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

	

