
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
scatterplot.render( data, 0);

////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the scatterplot
////////////////////////////////////////////////////////////////////////////////
 scatterplot.dragEvent = d3.behavior.drag()
                       .origin(function(d){ //Set the starting point of the drag interaction
							return {x:d.nodes[scatterplot.currentView][0],y:d.nodes[scatterplot.currentView][1]};
	                   })
                      .on("drag", function(d){                             		  
                           scatterplot.updateDraggedPoint(d.id,d3.event.x);	
                           scatterplot.showHintPath(d.id);	                          					   
					  })
					  .on("dragend",function (d){
					      scatterplot.snapToView(d3.event.x,d3.event.y);   
                         scatterplot.clearHintPath(d.id);	
                         //TODO: update slider						 
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
var slider   = new Slider(50, 500, 500, 500, "#time",3);
slider.init();
slider.render();
				  
////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the slider
////////////////////////////////////////////////////////////////////////////////
 slider.dragEvent = d3.behavior.drag()
                      // .origin([0,50])
                      .on("drag", function(){                             
							slider.updateDraggedSlider(d3.event.x);                            						   
					  })
					  .on("dragend",function (){
					      slider.snapToTick(d3.event.x);
                          //TODO: update scatter					      
					  });	

slider.widget.select("#slidingTick")				                 			  
                   .call(slider.dragEvent);	   
				   
				   
////////////////////////////////////////////////////////////////////////////////
// Test reading in population json data
////////////////////////////////////////////////////////////////////////////////
/**var scatterplot2 = d3.select("#scatter2").append("svg")
    .attr("width", 800)
    .attr("height", 1200) 
    .style("position", "absolute")
      .style("left", "0px")
      .style("top", "700px")	
    .append("g")
        ;

scatterplot2.selectAll("circle")
      .data(dataset)
      .enter().append("circle")
        .attr("cx",  function (d) { return d.F1955*100; } )
        .attr("cy", function (d) { return d.Pop1955/10000; } )
        .attr("r", function (d) { return d.Cluster*2 + 1; } )
		.append("title")
      .text(function(d) { return d.Country; });  */