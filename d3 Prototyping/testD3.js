var years = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000","2005"];
var data = [
                  [ 
					[0,50],[100,30],[200,40],[300,50]
				  ],
                  [
					[100,33],[300,95],[50,10],[30,20]
				  ]
                  				  
                 
              ];
              
          
var scatterplot   = new Scatterplot(50, 100, 500, 500, "#scatter",30);
scatterplot.init();
//Declare some interaction functions for the scatterplot 
scatterplot.mouseoverFunction = function (d){
									if (scatterplot.clickedPoint ==-1){
										scatterplot.hoveredPoint = d.id;
										scatterplot.showHintPath(scatterplot.hoveredPoint);
									}
									//console.log("hovered"+scatterplot.hoveredPoint);
	                           };
scatterplot.mouseoutFunction = function (d){
									if (scatterplot.clickedPoint ==-1){
										scatterplot.clearHintPath(scatterplot.hoveredPoint);
										scatterplot.hoveredPoint = -1;
									}
									//console.log("cleared");
	                           };
scatterplot.clickFunction = function (d){
								if (scatterplot.clickedPoint != d.id){
									 scatterplot.clickedPoint = d.id;
									 scatterplot.showHintPath(scatterplot.clickedPoint);								 
			                         
								}
								else {
									scatterplot.clearHintPath(scatterplot.clickedPoint);
									scatterplot.clickedPoint = -1;
								}
								//console.log("clicked"+scatterplot.clickedPoint);
									
	                           };
//scatterplot.render( data, 0);
scatterplot.render( dataset, 0,years);
////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the scatterplot
////////////////////////////////////////////////////////////////////////////////
 scatterplot.dragEvent = d3.behavior.drag()
                       .origin(function(d){ //Set the starting point of the drag interaction
							return {x:d.nodes[scatterplot.currentView][0],y:d.nodes[scatterplot.currentView][1]};
	                   })
                      .on("drag", function(d){                             		  
                           scatterplot.updateDraggedPoint(d.id,d3.event.x,d3.event.y);	
                           scatterplot.showHintPath(d.id);	                          					   
					  })
					  .on("dragend",function (d){					    
					      scatterplot.snapToView(d.id,d3.event.x,d3.event.y);   
                         scatterplot.clearHintPath(d.id);	
                         slider.updateSlider(scatterplot.currentView);
                         //console.log(scatterplot.currentView);						 
					  });	

scatterplot.widget.selectAll(".displayPoints")				                 			  
                   .call(scatterplot.dragEvent);



/**.widget.on("mousemove", function (d){
		  //console.log(d3.svg.mouse(this)[0]); //older version of d3, need to use d3.svg.mouse
		  if (scatterplot.clickedPoint != -1){
			scatterplot.updateDrag(scatterplot.clickedPoint);
			}

	   });*/
	   

////////////////////////////////////////////////////////////////////////////////
// Create new slider facilitating changing to different views of the visualization
////////////////////////////////////////////////////////////////////////////////   
var slider   = new Slider(15, 700, 700, 100, "#time",11,years);
slider.init();
slider.render();
				  
////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the slider
////////////////////////////////////////////////////////////////////////////////
 slider.dragEvent = d3.behavior.drag()                      
                      .on("drag", function(){                             
							slider.updateDraggedSlider(d3.event.x);                            						   
					  })
					  .on("dragend",function (){
					      slider.snapToTick(d3.event.x);
                          scatterplot.updateView(slider.sliderPos);					      
					  });	

slider.widget.select("#slidingTick")				                 			  
                   .call(slider.dragEvent);	   
				   
				   
