//Try loading and parsing some csv data
/**var csv_data;

d3.csv("population.csv", function(error, csv_data) {}

  
  );*/


var testData = {
    "1":[
		{"x":0,"y":33,"year":1990},{"x":300,"y":95,"year":1991}
		]
	 ,
    "2":[
	    
		{"x":250,"y":50,"year":1990},{"x":100,"y":30,"year":1991}
		]
     	
};

var data = [
                  [ 
					[0,50],[100,30],[200,40],[300,50]
				  ],
                  [
					[100,33],[300,95],[50,10],[30,20]
				  ]
                  				  
                 
              ];
              
          
var scatterplot   = new Scatterplot(0, 0, 500, 500, "#scatter");
scatterplot.init();
//Declare some interaction functions 
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
scatterplot.render( data, 0);

////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the scatterplot
////////////////////////////////////////////////////////////////////////////////
 scatterplot.dragEvent = d3.behavior.drag()
                       .origin(function(d){ //Set the starting point of the drag interaction
							return d;
	                   })
                      .on("drag", function(d){                             		  
                           scatterplot.updateDraggedPoint(d.id,d3.event.x,d3.event.y);						   
					  });	

/**scatterplot.widget.selectAll(".displayPoints")				                 			  
                   .call(scatterplot.dragEvent);*/



scatterplot.widget.on("mousemove", function (d){
		  //console.log(d3.svg.mouse(this)[0]); //older version of d3, need to use d3.svg.mouse
		  if (scatterplot.clickedPoint != -1){
			scatterplot.updateDrag(scatterplot.clickedPoint);
			}

	   });
	   
	   
////////////////////////////////////////////////////////////////////////////////
// Create new slider facilitating changing to the different views of the visualization
////////////////////////////////////////////////////////////////////////////////   
var slider   = new Slider(50, 600, 500, 500, "#time",3);
slider.init();
slider.render();
				  
////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the slider
////////////////////////////////////////////////////////////////////////////////
 slider.dragEvent = d3.behavior.drag()
                      // .origin([0,50])
                      .on("drag", function(){                             
							slider.updateDraggedSlider(d3.event.x);
                            //d.y = d3.event.y;							
                           //scatterplot.updateDraggedPoint(d.id,d3.event.x,d3.event.y);						   
					  })
					  .on("dragend",function (){
					      slider.snapToTick(d3.event.x);
                          scatterplot.render( data, slider.sliderPos);					      
					  });	

slider.widget.select("#slidingTick")				                 			  
                   .call(slider.dragEvent);