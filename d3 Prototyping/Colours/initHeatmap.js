var heatmap = new Heatmap(20, 20, 5,50,"#vis","Car complaints",years);
heatmap.init();
heatmap.render(data,xLabels,yLabels);
 
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
                           // heatmap.clearHintPath(d.id);					  
					       heatmap.snapToView();						   
						   //heatmap.selected = -1;  
						   heatmap.previousMouseY = null;  				 
					  });	


heatmap.svg.selectAll(".cell").call(heatmap.dragEvent);

/**
var slider   = new Slider(50, 500, 900, 100, "#time",years_nhtsa.length,years_nhtsa, "Years","#666",10);
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

	

