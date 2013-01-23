var testData = {
    "1":[
		{"x":0,"y":33,"year":1990},{"x":300,"y":95,"year":1991}
		]
	 ,
    "2":[
	    
		{"x":250,"y":50,"year":1990},{"x":100,"y":30,"year":1991}
		]
     	
};

/**var data = [
                  [ 0,   50,
					[[0,50],[100,30],[200,40]] 
				  ],
                  [ 100,   33 ,
					[[100,33],[300,95],[400,10]]
				  ]         
                 
              ];*/
var data = [
                  [ 
					[0,50],[100,30],[200,40]
				  ],
                  [
					[100,33],[300,95],[400,10]
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
					       d.x = d3.event.x;
						   d.y = d3.event.y; 						 
                           scatterplot.updateDraggedPoint();						   
					  });	

/**scatterplot.widget.selectAll(".displayPoints")				                 			  
                   .call(scatterplot.dragEvent);*/



scatterplot.widget.on("mousemove", function (d){
		  //console.log(d3.svg.mouse(this)[0]); //older version of d3, need to use d3.svg.mouse
		  if (scatterplot.clickedPoint != -1)
			scatterplot.updateDrag(scatterplot.clickedPoint);

	   });
	   
	   
var timeSlider   = new Slider(0, 600, 500, 500, "#time");
timeSlider.init();
var timeRange = [1,2,3];
timeSlider.render(timeRange);
timeSlider.widget.selectAll("rect")
				  .on("click", function (d){ 
				        if (timeSlider.clicked != d.id){
                             timeSlider.clicked = d.id;
							 scatterplot.render( data, d.id);							 
						}
                        else {						    
							timeSlider.clicked = -1;
						}
						//console.log("clicked"+scatterplot.clickedPoint);
	              })