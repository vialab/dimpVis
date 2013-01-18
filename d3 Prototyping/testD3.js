

var data = [
                  [ 250,   50 ],
                  [ 0,   33 ]         
                 
              ];
var data_2 = [
                  [ 330,   95 ],
                  [ 410,   12 ],
                  [ 475,   44 ],
                  [ 25,    67 ]                  
              ];
var scatterplot   = new Scatterplot(0, 0, 500, 500, "#scatter");
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
                           scatterplot.updateDraggedPoint();						   
					  });	
//Mouse in, out and click
scatterplot.widget.selectAll("circle")
				  .on("click", function (d){ 
				        if (scatterplot.clickedPoint != d.id)
                             scatterplot.clickedPoint = d.id;
                        else 
							scatterplot.clickedPoint = -1;
						console.log("clicked"+scatterplot.clickedPoint);
	              })
	              .on("mouseover", function (d){
					    scatterplot.hoveredPoint = d.id;
						console.log("hovered"+scatterplot.hoveredPoint);
	              })
				  .on("mouseout", function (d){
						console.log("cleared");
	               })                  			  
                   /**.call(scatterplot.dragEvent)*/;



scatterplot.widget.on("mousemove", function (d){
		  //console.log(d3.svg.mouse(this)); //older version of d3, need to use d3.svg.mouse
		  if (scatterplot.clickedPoint != -1)
			scatterplot.updateDrag(scatterplot.clickedPoint);

	   });
