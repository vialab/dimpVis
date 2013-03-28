var years = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000","2005"]; //Hard coded years for view labels              
//Fake data for debugging
piedata = [{"label":"one", "values":[0.2,0.5,0.1,0.1]}, 
            {"label":"two", "values":[0.5,0.3,0.1,0.3]}, 
            {"label":"three", "values":[0.3,0.2,0.8,0.6]}]; 

var pieLabels = ["1990","1995","2000","2005"];	


				   
				   

////////////////////////////////////////////////////////////////////////////////
// Create new pie chart
////////////////////////////////////////////////////////////////////////////////  

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
							 piechart.snapToView(d.id,d.endAngle,d.nodes);							 					 
					  });	

piechart.widget.selectAll(".DisplayArcs")				                 			  
                   .call(piechart.dragEvent);
