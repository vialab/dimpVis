

var data = [
                  [ 5,     20 ],
                  [ 480,   90 ],
                  [ 250,   50 ],
                  [ 100,   33 ]         
                 
              ];
var data_2 = [
                  [ 330,   95 ],
                  [ 410,   12 ],
                  [ 475,   44 ],
                  [ 25,    67 ]                  
              ];
var scatterplot   = new Scatterplot(0, 50, 500, 500, "#scatter");
scatterplot.init();
 scatterplot.render( data );

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
                           scatterplot.updateDrag();						   
					  });

//Mouse in, out and click
scatterplot.widget.selectAll("circle")
				  .on("click", function (d){ 
                        scatterplot.clickedPoint = d.id;                        						
						console.log(scatterplot.clickedPoint);
	              })
	              .on("mouseover", function (d){
					    scatterplot.hoveredPoint = d.id;
						console.log(scatterplot.hoveredPoint);
	              })
				  .on("mouseout", function (d){
						console.log("cleared");
	               })
                   .call(scatterplot.dragEvent);




