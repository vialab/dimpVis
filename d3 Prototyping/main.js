var years = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000","2005"]; //Hard coded years for view labels              

var scatterplot   = new Scatterplot(50, 100, 550, 550, "#scatter",30);
scatterplot.init();
//Declare some interaction functions for the scatterplot 

scatterplot.clickHintLabelFunction = function (d, i){
										//scatterplot.animateAlongPath(i);
										scatterplot.changeView(i);
										slider.updateSlider(i); 
									};
/**scatterplot.clickFunction = function (d){
								if (scatterplot.clickedPoint != d.id){
								      scatterplot.clearHintPath(scatterplot.clickedPoint);
									 scatterplot.clickedPoint = d.id;
									 scatterplot.showHintPath(scatterplot.clickedPoint);			                         
								}
								else {
									scatterplot.clearHintPath(scatterplot.clickedPoint);
									scatterplot.clickedPoint = -1;
								}
								
	                           };*/

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
                   .call(scatterplot.dragEvent);

/**scatterplot.widget.on("mousemove", function (d){		  
		  if (scatterplot.clickedPoint != -1){
			scatterplot.updateDraggedPoint(scatterplot.clickedPoint,d3.svg.mouse(this)[0],d3.svg.mouse(this)[1]);
			}
	   });*/

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
                            scatterplot.clearHintPath(scatterplot.draggedPoint);
                            barchart.clearHintPath(barchart.draggedBar);							
					     }) 
                      .on("drag", function(){   
                            var previous = slider.currentTick;					  
							slider.updateDraggedSlider(d3.event.x);
                            if (previous != slider.currentTick){						
                                scatterplot.changeView(slider.currentTick);	
                                barchart.changeView(slider.currentTick);									
                           }	
						    slider.updateDraggedSlider(d3.event.x);                          						
					  })
					  .on("dragend",function (){
					      slider.snapToTick(d3.event.x);
                          scatterplot.changeView(slider.currentTick);
                          barchart.changeView(slider.currentTick);					      
					  });	

slider.widget.select("#slidingTick")				                 			  
                   .call(slider.dragEvent);	   
				   
				   
////////////////////////////////////////////////////////////////////////////////
// Create new bar chart
////////////////////////////////////////////////////////////////////////////////   
var barchart   = new Barchart(700, 950, 800, 250 , "#bargraph",years);
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
								   scatterplot.clearHintPath(scatterplot.draggedPoint);
								   barchart.draggedBar = d.id;   
                                   barchart.showHintPath(d.id,d.nodes); 
                                   barchart.resolveViews(d.id,d.heights);						                                              						   
					  })
                      .on("drag", function(d){    
                           var view = barchart.currentView;					  
                           barchart.updateDraggedBar(d.id,d3.event.y);	
						   if (barchart.currentView != view){
                                  slider.updateSlider(barchart.currentView);
                                  scatterplot.changeView(barchart.currentView);									  
							}						
                           					   								  
					  })
					  .on("dragend",function (d){					    
					         barchart.snapToView(d.id,d3.event.y,d.heights);							 
							 slider.updateSlider(barchart.currentView); 
                             scatterplot.changeView(barchart.currentView);									 
					  });	

barchart.widget.selectAll(".displayBars")				                 			  
                   .call(barchart.dragEvent);
				   
////////////////////////////////////////////////////////////////////////////////
// Create new pie chart
////////////////////////////////////////////////////////////////////////////////  
piedata = [{"label":"one", "values":[0.2,0.5,0.1]}, 
            {"label":"two", "values":[0.5,0.3,0.1]}, 
            {"label":"three", "values":[0.3,0.2,0.8]}]; 

var pieLabels = ["1995","2000","2005"];	
var piechart   = new Piechart(700, 700, 800, 500 , "#piegraph",pieLabels);
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
                          piechart.showHintPath(d.id);   
                          piechart.resolveViews(d.id, d.angles);						  
					  })
                      .on("drag", function(d){                           		  
                           piechart.updateDraggedSegment(d.id,d3.event.x,d3.event.y);                          					   								  
					  })
					  .on("dragend",function (d){                             				  
					         piechart.clearHintPath(d.id);
							 piechart.snapToView(d.id,d.endAngle,d.angles);
                             //piechart.redrawView();	
                             //piechart.redrawSegments(d.id,d.startAngle,d.endAngle);							 
					  });	

piechart.widget.selectAll(".DisplayArcs")				                 			  
                   .call(piechart.dragEvent);
