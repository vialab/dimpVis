var years = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000","2005"]; //Hard coded years for view labels              



////////////////////////////////////////////////////////////////////////////////
// Create new slider facilitating changing to different views of the visualization
////////////////////////////////////////////////////////////////////////////////   
var slider   = new Slider(15, 700, 700, 200, "#time",11,years, "Years","#666");
slider.init();
slider.render();
				  
////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the slider
////////////////////////////////////////////////////////////////////////////////
 slider.dragEvent = d3.behavior.drag()  
						.on("dragstart", function(){                               
                           						
					     }) 
                      .on("drag", function(){   
                            var previous = slider.currentTick;					  
							slider.updateDraggedSlider(d3.event.x);
                            if (previous != slider.currentTick){						
                                									
                           }	
						    slider.updateDraggedSlider(d3.event.x);                          						
					  })
					  .on("dragend",function (){
					      slider.snapToTick(d3.event.x);
                          			      
					  });	

slider.widget.select("#slidingTick")				                 			  
                   .call(slider.dragEvent);	   
				   
				   

////////////////////////////////////////////////////////////////////////////////
// Create new pie chart
////////////////////////////////////////////////////////////////////////////////  
piedata = [{"label":"one", "values":[0.2,0.5,0.1]}, 
            {"label":"two", "values":[0.5,0.3,0.1]}, 
            {"label":"three", "values":[0.3,0.2,0.8]}]; 

var pieLabels = ["1995","2000","2005"];	
var piechart   = new Piechart(900, 900, 50, 50 , 180,"#piegraph",pieLabels);
piechart.init();
piechart.render(piedata);

////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the piechart
////////////////////////////////////////////////////////////////////////////////
/**piechart.mouseoverFunction = function (d){
                                    piechart.currentView = 1;
									piechart.render(piedata);									
	                           };*/
							   
piechart.dragEvent = d3.behavior.drag()
                      /**.origin(function(d){ //Set the starting point of the drag interaction
							return {x:d3.event.x,y:d3.event.y};
	                   })*/
					   .on("dragstart", function(d){  
                          piechart.clearHintPath(d.id);					   
                          piechart.showHintPath(d.id);  
						  
					  })
                      .on("drag", function(d){                           		  
                           piechart.updateDraggedSegment(d.id,d3.event.x,d3.event.y);                          					   								  
					  })
					  .on("dragend",function (d){                             				  
					         //piechart.clearHintPath(d.id);
							 piechart.snapToView(d.id,d.endAngle,d.angles);
                             //piechart.redrawView();	
                             //piechart.redrawSegments(d.id,d.startAngle,d.endAngle);							 
					  });	

piechart.widget.selectAll(".DisplayArcs")				                 			  
                   .call(piechart.dragEvent);
