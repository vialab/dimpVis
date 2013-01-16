

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

scatterplot.widget.selectAll("circle")
				  .on("click", function (d){
                        scatterplot.clickedPoint = d.id;				  
						console.log("clicked");
	              })
	              .on("mouseover", function (d){
					    scatterplot.hoveredPoint = d.id;
						console.log("hover");
	              })
				  .on("mouseout", function (d){
						console.log("cleared");
	               })

