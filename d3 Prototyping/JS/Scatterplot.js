/** Constructor for a scatterplot visualization
 * x: the left margin
 * y: the right margin
 * w: width of the svg container
 * h: height of the svg container
 * id: id of the div tag to append the svg container
 * p: a padding value, to format the axes
 * r: the radius of the scatterplot points
 * xLabel: label for the x-axis
 * yLabel: label for the y-axis
*/
function Scatterplot(x, y, w, h, id,p,r,xLabel,yLabel) {
   // Position and size attributes for drawing the svg
   this.xpos = x;
   this.ypos = y;
   this.width = w;
   this.height = h;
   this.id = id; 
   this.padding = p
   this.pointRadius = r;
   this.xLabel = xLabel;
   this.yLabel = yLabel;

   //Set some default colours (which can be changed by calling the setColours() function)
   this.hintColour = "steelblue";
   this.pointColour = "#666";
   this.axisColour = "#c7c7c7";

   // Create a variable to reference the main svg
   this.svg = null;

   //Variables to track dragged point location within the hint path, all assigned values when the dataset is provided (in render())
   this.currentView = -1;
   this.nextView = -1;
   this.lastView = -1;  //The index of the last view of the dataset
   this.interpValue = 0; //Stores the current interpolation value (percentage travelled) when a point is dragged between two views
   this.displayData = [];// Stores the dataset to be visualized
   this.labels = []; //Stores the labels of the hint path

   //Variables to track interaction events, not needed in all cases
   this.clicked = -1;
   this.hovered = -1;
   this.dragged = -1;

   //Event functions, declared later in this file or in the init file (if visualization is
   // interacting with another visualization) after the object has been instantiated
   this.placeholder = function() {};
   this.mouseoverFunction = this.placeholder;
   this.mouseoutFunction  = this.placeholder;  
   this.clickFunction = this.placeholder;
   this.clickHintLabelFunction = this.placeholder;
   this.dragEvent = null;
}
/**Customize the display colours to the scatterplot, to change the default
 * pointCol: The colour of the points
 * hintCol: The colour of the hint path
 * axisCol: The colour of the axes
 * */
Scatterplot.prototype.setColours = function(pointCol, hintCol, axisCol){
   this.hintColour = hintCol;
   this.pointColour = pointCol;
   this.axisColour = axisCol;
}
 /** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
 *  will be drawn. Also, add a blur filter for the hint path effect.
 * */
Scatterplot.prototype.init = function() {
   this.svg = d3.select(this.id).append("svg")
      .attr("width", this.width+(this.padding*2))
      .attr("height", this.height+(this.padding*2))  
     .append("g")
     .attr("transform", "translate(" + (this.padding+this.xpos) + "," + (this.padding+this.ypos) + ")");

    //Add the blur filter used for the hint path to the SVG so other elements can call it
    this.svg.append("svg:defs")
        .append("svg:filter")
        .attr("id", "blur")
        .append("svg:feGaussianBlur")
        .attr("stdDeviation", 5);
}
/** Render the visualization onto the svg
 * data: The dataset to be visualized
 * start: The starting view of the visualization, as an index into the labels array
 * labels: A list of labels for the hint path, indicating all the different views of the visualization
 *
 * Data MUST be provided in the following array format:
 * n is the number of views (or number of labels on the hint path)
 * Object{"points":{[x,y],[x,y]...n},
 *        "label":"name of data point" (optional)
 *       }
 *       ..... number of data points
 * */
Scatterplot.prototype.render = function( data, start, labels) {
   var ref = this; //Reference variable

	//Save the function parameters
   this.labels = labels;
   this.displayData = data;
   this.currentView = start;
   this.lastView = labels.length -1;

   //Resolve the index value for the next view (e.g., if currentView is 0, then nextView should be set to 1)
   if (this.currentView ==0){//First point on path			        
			this.nextView = this.currentView+1;
	}else if (this.currentView == this.lastView){  //Last point of path
		   this.nextView = this.currentView;
		   this.currentView = this.currentView -1;
	}else { //A point somewhere in the middle				     
		this.nextView = this.currentView + 1;
	}
     //Find the max and min values of the points, used to scale the axes and the dataset
     var max_x = d3.max(data.map(function (d){return d3.max(d.points.map(function (a){return a[0];}) ); }));
     var min_x = d3.min(data.map(function (d){return d3.min(d.points.map(function (a){return a[0];}) ); }));
     var max_y = d3.max(data.map(function (d){return d3.max(d.points.map(function (a){return a[1];}) ); }));
     var min_y = d3.min(data.map(function (d){return d3.min(d.points.map(function (a){return a[1];}) ); }));

    //Create the scales by mapping the x,y to the svg size
    var xScale = d3.scale.linear().domain([min_x,max_x]).range([0,ref.width]);
    var yScale =  d3.scale.linear().domain([min_y, max_y]).range([ref.height,0]);

    //Call the function which draws the axes
    this.drawAxes(xScale,yScale);

  // Draw the points according to the values in the data set
  this.svg.selectAll("circle")
     .data(this.displayData.map(function (d,i) {
            //Re-scale the points such that they are drawn within the svg container
           d.points.forEach(function (d) {
               d[0] = xScale(d[0]);
               d[1] = yScale(d[1]);
           });
	        return {nodes:d.points,id:i,label:d.label};
	  }))	
      .enter()
      .append("g")	  
	  .attr("class","gDisplayPoints");

//TODO: Draw the hint path only when point is dragged to avoid over populating the DOM
 //Drawing paths between points
 var line = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .interpolate("linear");
   
    this.svg.selectAll(".gDisplayPoints").append("g")
								  .attr("id",function (d){return "gInner"+d.id;})
                                   .attr("class","gInner");									  
	 //Render the hint points							   
	this.svg.selectAll(".gDisplayPoints").selectAll(".gInner").selectAll("circle")
                                             .data(function(d) {return d.nodes;})
											 .enter().append("svg:circle")
											 .attr("cx", function(d) { return d[0]; })
											.attr("cy", function(d) { return d[1]; })
											.attr("r",ref.pointRadius)
											.attr("class","hintPoints")
											.style("fill","none")
											.style("cursor","pointer")
											.attr("filter", "url(#blur)");

	//Render the hint path labels
    this.svg.selectAll(".gDisplayPoints").selectAll(".gInner").selectAll("text")
	                                        .data(function(d) {return d.nodes;}).enter()								  
								            .append("svg:text")
                                            .text(function(d,i) { return ref.labels[i]; })
												.attr("x", function(d) {return d[0] + ref.pointRadius*2})
												.attr("y", function (d) {  return d[1] + ref.pointRadius*2; })
											   .attr("fill", "none")											  
											   .attr("class","hintLabels")
											   .style("cursor","pointer")											  
											   .on("click", this.clickHintLabelFunction);
	//Render the hint path line									    
    this.svg.selectAll("g").selectAll(".gInner").append("svg:path")
                                  .attr("d", function(d){ 
								         return line(d.nodes); 
								  })
								  .attr("id",function (d){return "p"+d.id;})
								  .style("stroke-width", 2)
								  .style("stroke", "none")
								   .style("fill", "none")
								    .attr("filter", "url(#blur)");
     
	 //Render the actual data points last, so that they are displayed on top of the hint path
     this.svg.selectAll(".gDisplayPoints").append("svg:circle")
							  .attr("cx", function(d) {	     
								   return d.nodes[ref.currentView][0];
							   })
							 .attr("cy", function(d) {        
								   return d.nodes[ref.currentView][1];
							  })
							  .attr("r", ref.pointRadius)
							  .attr("stroke", "none")
							  .attr("stroke-width", "2")
							  .attr("class", "displayPoints")
							  .attr("fill",ref.pointColour)
							  .style("fill-opacity",1)
							   .attr("id", function (d){return "displayPoints"+d.id;})
							  .style("cursor", "pointer")  
							   .on("mouseover", ref.mouseoverFunction)
							   .on("mouseout", ref.mouseoutFunction)
							   .on("click", ref.clickFunction);
}
/** Draws the axes on the SVG
 *  xScale: a function defining the scale of the x-axis
 *  yScale: a function defining the scale of the y-axis
 * */
Scatterplot.prototype.drawAxes = function (xScale,yScale){

    //Define functions to create the axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    // Add the x-axis
    this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+this.padding+"," + this.height + ")")
        .style("fill",this.axisColour)
        .call(xAxis);

    // Add the y-axis
    this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+ this.padding+ ",0)")
        .style("fill",this.axisColour)
        .call(yAxis);

    // Add an x-axis label
    this.svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", this.width)
        .attr("y", this.height+this.padding-10)
        .style("fill",this.axisColour)
        .text(this.xLabel);

    // Add a y-axis label
    this.svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", 6)
        .style("fill",this.axisColour)
        .attr("transform", "rotate(-90)")
        .text(this.yLabel);
}
 //Updates the dragged point - for drag mouse event
//TODO: refactor this function, lots of repeated code
Scatterplot.prototype.updateDraggedPoint = function(id,mouseX,mouseY) {	 
       var ref = this;
	   this.svg.select("#displayPoints"+id).each( function (d) {
           var newPoint = []; //The new point to draw on the line
           //Get the two points of the line segment currently dragged along
           var pt1 = d.nodes[ref.currentView][0];
           var pt2 = d.nodes[ref.nextView][0];
           var pt1_y = d.nodes[ref.currentView][1];
           var pt2_y = d.nodes[ref.nextView][1];
       });
	  /**this.svg.select("#displayPoints"+id)
        .attr("cx", function(d){		
                 //Get the two points which compose the current sub-path dragged along	               			 
		        var pt1 = d.nodes[ref.currentView][0];				
                var pt2 = d.nodes[ref.nextView][0];		
                var bounds = ref.checkBounds(pt1,pt2,mouseX);				
                if (ref.currentView ==0 && bounds == pt1){//First point on path, out of bounds	 				
					   return pt1;									
				  }else if (ref.nextView == ref.lastView && bounds == pt2){  //Last point of path, out of bounds
					  return pt2;				
				  }	else { //A point somewhere in the middle
				     if (bounds == pt1){ //Passed current					    
					    return pt1;
					 }else if (bounds == pt2){ //Passed next			    
					    return pt2;
					 }
				 }

                  return mouseX;             		
		})
        .attr("cy", function(d){	
             //Get the two points which compose the current sub-path dragged along		
		        var pt1 = d.nodes[ref.currentView][0];
                var pt2 = d.nodes[ref.nextView][0];	
                var pt1_y = d.nodes[ref.currentView][1];
                var pt2_y = d.nodes[ref.nextView][1];					
                var bounds = ref.checkBounds(pt1,pt2,mouseX);
              console.log(ref.minDistancePoint(mouseX,mouseY,pt1,pt1_y,pt2,pt2_y));
                var interpY;				
		     //Check to make sure mouse is in bounds
                if (ref.currentView ==0){//First point on path	 				
					if (bounds == pt1){  //Out of Bounds
					   return pt1_y;
					}else if (bounds == pt2){  //Beyond nextView
					//  interpY = ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					 // ref.animatePoints(mouseX,interpY, pt1, pt1_y,pt2,pt2_y,id);
					  ref.currentView = ref.nextView;
					  ref.nextView = ref.currentView +1;
                      ref.redrawView(id,-1);					  
					  return pt2_y;
					}else{ //Within current sub-path
					   interpY = ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					   ref.animatePoints(mouseX,interpY, pt1, pt1_y,pt2,pt2_y,id);
					   return interpY;
					}					
				  }else if (ref.nextView == ref.lastView){  //Last point of path
					if (bounds == pt1){  //Beyond 
                         //interpY = ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					    // ref.animatePoints(mouseX,interpY, pt1, pt1_y,pt2,pt2_y,id);					
					    ref.nextView = ref.currentView;
						ref.currentView = ref.currentView - 1;	
                        ref.redrawView(id,-1);						
					    return pt1_y;
					}else if (bounds == pt2){  //Out of Bounds					  
					  return pt2_y;
					}else{ //Within current sub-path
					   interpY = ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					   ref.animatePoints(mouseX,interpY, pt1, pt1_y,pt2,pt2_y,id);
					   return interpY;
					}
				  }	else { //A point somewhere in the middle				 
				     if (bounds == pt1){ //Passed current                         					 
					    ref.nextView = ref.currentView;
						ref.currentView = ref.currentView-1;
						ref.redrawView(id,-1);
					    return pt1_y;
					 }else if (bounds == pt2){ //Passed next
					    ref.currentView = ref.nextView;
					    ref.nextView = ref.nextView +1;						
						ref.redrawView(id,-1);
					    return pt2_y;
					 }else{ //Within current sub-path
					    interpY = ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y,mouseY);
					    ref.animatePoints(mouseX,interpY, pt1, pt1_y,pt2,pt2_y,id);
					    return interpY;
					 }
				 }
               
		});*/
  
}
//"Animates" the rest of points while a point is dragged
//TODO: refactor this function, lots of repeated code
Scatterplot.prototype.animatePoints = function(mouseX,interpY, pt1_x, pt1_y,pt2_x,pt2_y,id){
    var ref = this;
  //Determine the percentage travelled along the path between current and next
  var distanceTravelled = ref.calculateDistance(mouseX,interpY,pt1_x,pt1_y);
  var totalDistance = ref.calculateDistance(pt1_x,pt1_y,pt2_x,pt2_y);
  var distanceRatio = distanceTravelled/totalDistance;
  ref.interpValue = distanceRatio;
   this.svg.selectAll(".displayPoints")
				   .attr("cx",function (d){	
                          if (d.id != id){				   
							     var pt1 = d.nodes[ref.currentView][0];
								 var pt2 = d.nodes[ref.nextView][0];	
								 var pt1_y = d.nodes[ref.currentView][1];
								 var pt2_y = d.nodes[ref.nextView][1];
								 var interpolator = d3.interpolate({x:pt1,y:pt1_y},{x:pt2,y:pt2_y});
								 var newPoint = interpolator(distanceRatio);
								 return newPoint.x;
						   }
						   return mouseX;
						})
					 .attr("cy",function (d){	
					     if (d.id != id){
								 var pt1 = d.nodes[ref.currentView][0];
								 var pt2 = d.nodes[ref.nextView][0];	
								 var pt1_y = d.nodes[ref.currentView][1];
								 var pt2_y = d.nodes[ref.nextView][1];
                                 var interpolator = d3.interpolate({x:pt1,y:pt1_y},{x:pt2,y:pt2_y});
                                 var newPoint = interpolator(distanceRatio);
								 return newPoint.y;								 
															
						}		
                        return interpY;						
					 });			
 
}
//A function meant only to interface with other visualizations or the slider
//Given an interpolation value, move all points accordingly between the view 'current' and 'next'
Scatterplot.prototype.updatePoints = function(interpValue,current,next){  
   this.svg.selectAll(".displayPoints")
				   .attr("cx",function (d){	                         				   
							     var pt1 = d.nodes[current][0];
								 var pt2 = d.nodes[next][0];	
								 var pt1_y = d.nodes[current][1];
								 var pt2_y = d.nodes[next][1];
								 var interpolator = d3.interpolate({x:pt1,y:pt1_y},{x:pt2,y:pt2_y});
								 var newPoint = interpolator(interpValue);
								 return newPoint.x;						  
						})
					 .attr("cy",function (d){		    
								 var pt1 = d.nodes[current][0];
								 var pt2 = d.nodes[next][0];	
								 var pt1_y = d.nodes[current][1];
								 var pt2_y = d.nodes[next][1];
                                 var interpolator = d3.interpolate({x:pt1,y:pt1_y},{x:pt2,y:pt2_y});
                                 var newPoint = interpolator(interpValue);
								 return newPoint.y;													
											
					 });			
 
}
////////////////////////////////////////////////////////////////////////////////
// Snap the draggable point to the nearest view
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.snapToView = function( id, mouseX, mouseY,nodes) {
    var ref = this;    
	var distanceCurrent = ref.calculateDistance(mouseX,mouseY, nodes[ref.currentView][0], nodes[ref.currentView][1]);					
	var distanceNext = 	ref.calculateDistance(mouseX,mouseY, nodes[ref.nextView][0], nodes[ref.nextView][1]);	
    if (distanceCurrent > distanceNext && ref.nextView != ref.lastView){ //Snap to next view
		ref.currentView = ref.nextView;
		ref.nextView = ref.nextView +1;	                        				
     }
    if (ref.nextView == ref.lastView){ //If the nextView is the last view index, need to re draw the plot on that index (not currentView, which is nextView-1)
        ref.redrawView(id,ref.nextView);
	}else{
	   ref.redrawView(id,-1);
    }	
	           
    
}
////////////////////////////////////////////////////////////////////////////////
// Changes the view, newView is the index of the view
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.changeView = function( newView) {     
	 var ref = this;
	 //Update the view tracker variables
	 if (newView ==0){//First point on path
            ref.currentView = newView	 
			ref.nextView = newView+1;
	}else if (newView == ref.lastView){  //Last point of path
		   ref.nextView = newView;
		   ref.currentView = newView -1;
	}else { //A point somewhere in the middle
        ref.currentView = newView;	
		ref.nextView = newView + 1;
	}
    //ref.redrawView("null",-1); //redraw the points for the currently selected view
}
////////////////////////////////////////////////////////////////////////////////
// Animates points along a path when fast forwarding is used
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.animateAlongPath = function( previousView, nextView) {     
	 var ref = this;
	 //Update the view tracker variables
	 if (nextView ==0){//First point on path
            ref.currentView = nextView	 
			ref.nextView = nextView+1;
	}else if (nextView == ref.lastView){  //Last point of path
		   ref.nextView = nextView;
		   ref.currentView = nextView -1;
	}else { //A point somewhere in the middle
        ref.currentView = nextView;	
		ref.nextView = nextView + 1;
	}
	//Need to do multi-stage transitions
	//Transition chaining
   /** var first = this.widget.selectAll(".displayPoints")
	          .transition().duration(400)
			  .ease("linear")			 
	          .attrTween("cx",function (d){	
			           var interp = d3.interpolate(d.nodes[0][0],d.nodes[1][0]);
						  return function (t){
						   return interp(t);
						  };
			        })
				 .attrTween("cy",function (d){	
			       	    var interp = d3.interpolate(d.nodes[0][1],d.nodes[1][1]);
						  return function (t){
						  
						   return interp(t);
						  };			 
	             });
	var second = first.transition().duration(400)
	.ease("linear")			 
	          .attrTween("cx",function (d){	
			           var interp = d3.interpolate(d.nodes[1][0],d.nodes[2][0]);
						  return function (t){
						   return interp(t);
						  };
			        })
				 .attrTween("cy",function (d){	
			       	    var interp = d3.interpolate(d.nodes[1][1],d.nodes[2][1]);
						  return function (t){
						   return interp(t);
						  };			 
	             });*/
	//Using the end function
	/**this.widget.selectAll(".displayPoints")
	          .transition().duration(1200)
			  .ease("linear")			 
	          .attrTween("cx",function (d){	
			           var interp = d3.interpolate(d.nodes[0][0],d.nodes[0][0]);
						  return function (t){
						   return interp(t);
						  };
			        })
				 .attrTween("cy",function (d){	
			       	    var interp = d3.interpolate(d.nodes[1][1],d.nodes[1][1]);
						  return function (t){
						   return interp(t);
						  };			 
	             })
				 .each("end",ref.transition(1,2));*/
	
	//ref.transition(0,1);
	/**for (var j=1;j<ref.currentView;j++){
	    this.widget.selectAll(".displayPoints")
	          .transition().duration(1200)
			  .ease("linear")			 
	          .attrTween("cx",function (d){	
			           var interp = d3.interpolate(d.nodes[j-1][0],d.nodes[j][0]);
						  return function (t){
						   return interp(t);
						  };
			        })
				 .attrTween("cy",function (d){	
			       	    var interp = d3.interpolate(d.nodes[j-1][1],d.nodes[j][1]);
						  return function (t){
						   return interp(t);
						  };			 
	             });				    
	}*/
	
    //ref.redrawView("null",-1); //redraw the points for the currently selected view
}
Scatterplot.prototype.transition = function(previous, next) {  
   var ref = this;
   this.svg.selectAll(".displayPoints")
	          .transition().duration(1200)
			 // .ease("linear")			 
	          .attrTween("cx",function (d){	
			           var interp = d3.interpolate(d.nodes[previous][0],d.nodes[next][0]);
						  return function (t){
						   return interp(t);
						  };
			        })
				 .attrTween("cy",function (d){	
			       	    var interp = d3.interpolate(d.nodes[previous][1],d.nodes[next][1]);
						  return function (t){
						   return interp(t);
						  };			 
	             })	;
                // .each("end", ref.transition((previous+1),(next+1)));				 
				 
}
////////////////////////////////////////////////////////////////////////////////
// Redraws the points on the scatterplot
// Note: 'id' is optional, only if a point should be highlighted (during drag)
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.redrawView = function(id,view) {     
     var displayView = this.currentView;
     if (view!=-1){
	    displayView = view;
	 } 
	 
    this.svg.selectAll(".displayPoints")
	          .transition().duration(400)
	           .attr("cx",function (d){	
			           return d.nodes[displayView][0];
			        })
				 .attr("cy",function (d){	
			        return d.nodes[displayView][1];					 
	             })
				 ; 
}

//Finds the interpolated value of the unknown y-coordinate
Scatterplot.prototype.findInterpY = function(x,x0,y0,x1,y1,mouseY){   
    if ((x1 - x0) == 0){
	   var interpY = mouseY; //TODO: change this because mouse could go out of bounds!
    }else {
	  var interpY = y0 + (y1 - y0)*((x - x0)/(x1 - x0));
	}	
	return interpY;
    
}

//Checks if a mouse position is within bounds of a defined path
//Returns a point if the mouse position is equal to it or has crossed it
//Returns 'ok' if the mouse is within bounds
Scatterplot.prototype.checkBounds = function(pt1,pt2,mouse){ 
    var start,end;
	if (pt1>pt2){
	 end = pt1;
	 start = pt2;
	}else{
	  start = pt1;
	  end = pt2;
	}
	//Check if mouse is between path defined by (start,end)
	if (mouse < start){
	   return start;
	}else if (mouse >end){
	   return end;
	}
	return "ok";	
}
Scatterplot.prototype.showHintPath = function (id){      
	
	   this.svg.select("#p"+id)
					.style("stroke", this.hintColour);     	
       this.svg.select("#gInner"+id).selectAll(".hintLabels")
								  .style("fill", this.pointColour); 
        this.svg.selectAll(".displayPoints")
	           .transition().duration(400)
	           .style("fill-opacity", function (d){
			       if (d.id != id){
				      return 0.3;
				   }
			   }); 	      							  
}
Scatterplot.prototype.clearHintPath = function (id) {
    
      this.svg.select("#p"+id)
				.style("stroke", "none");	 
     this.svg.select("#gInner"+id).selectAll(".hintLabels")
				.style("fill", "none");	
     this.svg.selectAll(".displayPoints")
	           .style("fill-opacity", 1);				
}

/** Calculates the distance between two points
 * (x1,y1) is the first point
 * (x2,y2) is the second point
 * @return the distance, avoiding the square root
 * */
Scatterplot.prototype.calculateDistance = function(x1,y1,x2,y2){
    var term1 = x1 - x2;
    var term2 = y1 - y2;
    return (term1*term1)+(term2*term2);
}
/** Finds the minimum distance between a point at (x,y), with respect
 * to a line segment defined by points (pt1_x,pt1_y) and (pt2_x,pt2_y)
 * Code based on: http://stackoverflow.com/questions/849211/shortest
 * -distance-between-a-point-and-a-line-segment
 * Formulas can be found at: http://paulbourke.net/geometry/pointlineplane/
 * @return the point on the line at the minimum distance, as an array: [x,y]
 * */
Scatterplot.prototype.minDistancePoint = function(x,y,pt1_x,pt1_y,pt2_x,pt2_y){
   var distance = this.calculateDistance(pt1_x,pt1_y,pt2_x,pt2_y);
   //Two points of the line segment are the same
   if (distance == 0) return [pt1_x,pt1_y];

   var t = ((x - pt1_x) * (pt2_x - pt1_x) + (y - pt1_y) * (pt2_y - pt1_y)) / distance;
   if (t < 0) return [pt1_x,pt1_y]; //Point projection goes beyond the first point of the line
   if (t > 1) return [pt2_x,pt2_y]; //Point projection goes beyond the second point of the line

   //Otherwise, point projection lies on the line somewhere
    var minX = pt1_x + t*(pt2_x-pt1_x);
    var minY = pt1_y + t*(pt2_y-pt1_y);
    return [minX,minY];
}
