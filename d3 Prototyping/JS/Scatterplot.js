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
   this.id = id; 
   this.padding = p;
   this.width = w;
   this.height = h;
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
   if (this.currentView ==0){
			this.nextView = this.currentView+1;
	}else if (this.currentView == this.lastView){
		   this.nextView = this.currentView;
		   this.currentView = this.currentView -1;
	}else {
		this.nextView = this.currentView + 1;
	}
     //Find the max and min values of the points, used to scale the axes and the dataset
     var max_x = d3.max(data.map(function (d){return d3.max(d.points.map(function (a){return a[0];}) ); }));
     var min_x = d3.min(data.map(function (d){return d3.min(d.points.map(function (a){return a[0];}) ); }));
     var max_y = d3.max(data.map(function (d){return d3.max(d.points.map(function (a){return a[1];}) ); }));
     var min_y = d3.min(data.map(function (d){return d3.min(d.points.map(function (a){return a[1];}) ); }));
  //TODO: graph is offset by the padding, which causes points to go off the graph
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

   //Append an empty g element to contain the hint path
   this.svg.selectAll(".gDisplayPoints").append("g")
        .attr("id",function (d){return "gInner"+d.id;})
        .attr("class","gInner");
     
	 //Draw the data points
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
							  .style("cursor", "pointer")  ;
							   /**.on("mouseover", ref.mouseoverFunction)
							   .on("mouseout", ref.mouseoutFunction)
							   .on("click", ref.clickFunction);*///Currently not being used
}
/** Draws the axes on the SVG
 *  xScale: a function defining the scale of the x-axis
 *  yScale: a function defining the scale of the y-axis
 * */
 //TODO:Ticks went missing :(
 Scatterplot.prototype.drawAxes = function (xScale,yScale){

    //Define functions to create the axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    // Add the x-axis
    this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+this.padding+"," + this.height + ")")
        .style("fill",this.axisColour)
        .call(xAxis)
        .select("path").style("stroke",this.axisColour);

    // Add the y-axis
    this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+ this.padding+ ",0)")
        .style("fill",this.axisColour)
        .call(yAxis)
        .select("path").style("stroke",this.axisColour);

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
/** Re-draws the dragged point by projecting it onto the the line segment according to
 *  the minimum distance.  As the point is dragged, the views are update and the rest
 *  of the points are animated
 *  id: The id of the dragged point, for selecting by id
 *  mousex, mouseY: The coordinates of the mouse, from the drag event
 * */
Scatterplot.prototype.updateDraggedPoint = function(id,mouseX,mouseY) {	 
   var ref = this;
   this.svg.select("#displayPoints"+id).each( function (d) {
           //Get the two points of the line segment currently dragged along
           var pt1_x = d.nodes[ref.currentView][0];
           var pt2_x = d.nodes[ref.nextView][0];
           var pt1_y = d.nodes[ref.currentView][1];
           var pt2_y = d.nodes[ref.nextView][1];
           var minDist = ref.minDistancePoint(mouseX,mouseY,pt1_x,pt1_y,pt2_x,pt2_y);
           var newPoint = []; //The new point to draw on the line
           var t = minDist[2]; //To test whether or not the dragged point will pass pt1 or pt2
           if (ref.currentView ==0){//First point of hint path
               if (t<0){  //Passed current view, mouse is going off the path
                   newPoint = [pt1_x,pt1_y];
               }else if (t>1){  //Passed the next view, mouse is still on path
                  //Update the view tracking variables
                   ref.currentView = ref.nextView;
                   ref.nextView = ref.currentView +1;
                   newPoint = [pt2_x,pt2_y]; //TODO: This won't work for fast motions, need to find the interpolated point in the next line segment to be more accurate
               }else{ //Somewhere in between pt1 and pt2
                   ref.interpolatePoints(id,t,ref.currentView,ref.nextView);
                   newPoint = [minDist[0],minDist[1]];
               }
           }else if (ref.nextView == ref.lastView){  //Last point of hint path
            if (t<0){  //Passed current view, mouse is still on path
                //Update the view tracking variables
                ref.nextView = ref.currentView;
                ref.currentView = ref.currentView - 1;
                newPoint= [pt1_x,pt1_y];
            }else if (t>1){  //Passed next view, mouse is going off the path
                newPoint= [pt2_x,pt2_y];
            }else{ //Somewhere between pt1 and pt2
                ref.interpolatePoints(id,t,ref.currentView,ref.nextView);
                newPoint= [minDist[0],minDist[1]];
            }
        }else{ //At any middle point along the hint path
               if (t<0){ //Passed current view
                   ref.nextView = ref.currentView;
                   ref.currentView = ref.currentView-1;
                  newPoint = [pt1_x,pt1_y];
               }else if (t>1){ //Passed next
                   ref.currentView = ref.nextView;
                   ref.nextView = ref.nextView +1;
                   newPoint= [pt2_x,pt2_y];
               }else{ //Somewhere between pt1 and pt2
                   ref.interpolatePoints(id,t,ref.currentView,ref.nextView);
                   newPoint= [minDist[0],minDist[1]];
               }
           }
        ref.svg.select("#displayPoints"+id).attr("cx",newPoint[0]).attr("cy",newPoint[1]);
  });
}
/**"Animates" the rest of the points while one is being dragged
 * Uses the 't' parameter, which represents approximately how far along a line segment
 * the dragged point has travelled.  The positions of the rest of the points are interpolated
 * based on this t parameter and re-drawn at this interpolated position
 * id: The id of the dragged point
 * interpAmount: The t parameter, or amount to interpolate by
 * startView,endView: Define the range to interpolate across
 * */
Scatterplot.prototype.interpolatePoints = function(id,interpAmount,startView,endView){
  var ref = this;
  ref.interpValue = interpAmount; //Save the interpolation value, for animating other visualizations
  //Redraw all points, excluding the dragging one, to their new position according to the interpolation amount
  this.svg.selectAll(".displayPoints").filter(function (d){return d.id!=id;})
      .each(function (d){
          var interpolator = d3.interpolate({x:d.nodes[startView][0],y:d.nodes[startView][1]},
              {x:d.nodes[endView][0],y:d.nodes[endView][1]}); //Function to linearly interpolate between points at current and next view
          var newPoint = interpolator(interpAmount);
          //Update the position of the point according to the interpolated point position
          d3.select(this).attr("cx",newPoint.x)
                         .attr("cy",newPoint.y);
      })
}
/** Snaps to the nearest view once a dragged point is released
 *  Nearest view is the closest position (either current or next) to the
 *  most recent position of the dragged point. View tracking variables are
 *  updated according to which view is "snapped" to.
 *  id: The id of the dragged point
 *  mouseX, mouseY: Coordinates of the mouse, defining the most recent position of the dragged point
 *  points: An array of all point positions of the dragged point (e.g., d.nodes)
 * */
Scatterplot.prototype.snapToView = function( id, mouseX, mouseY,points) {
    var ref = this;
    //Calculate the distances from the dragged point to both current and next
	var distanceCurrent = ref.calculateDistance(mouseX,mouseY, points[ref.currentView][0], points[ref.currentView][1]);
	var distanceNext = 	ref.calculateDistance(mouseX,mouseY, points[ref.nextView][0],points[ref.nextView][1]);
    //Based on the smaller distance, update the scatterplot to that view
    if (distanceCurrent > distanceNext && ref.nextView != ref.lastView){ //Snapping to next view
		ref.currentView = ref.nextView;
		ref.nextView = ref.nextView +1;	                        				
     }
    //Special case: If the nextView is the last view index, need to re draw the plot on that index (not currentView, which is nextView-1)
    if (ref.nextView == ref.lastView){
        ref.redrawView(ref.nextView);
	}else{
	   ref.redrawView(ref.currentView);
    }
}
/** Updates the view tracking variables when the view is being changed by an external
 * visualization (e.g., slider)
 * */
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
}
/** Animates all points in the scatterplot along their hint paths from
 *  startView to endView, this function is called when "fast-forwarding"
 *  is invoked (by clicking a year label on the hint path)
 *  startView: View index to start the animation at
 *  endView: View to end the animation at (need to update view variables
 *  according to this value)
 *  Resources: http://bl.ocks.org/mbostock/1125997
 *            http://bost.ocks.org/mike/transition/
 *  NOTE: This function does not update the view tracking variables
 * */
//TODO:Add tweening to make the transition smoother
//TODO: Out of bounds for end points, still pretty buggy might have to do with the view tracking
 Scatterplot.prototype.animatePoints = function( startView, endView) {
	 var ref = this;
     //Determine the travel direction (e.g., forward or backward in time)
     var direction = 1;
     if (startView>endView) direction=-1;

    //Define some counter variables to keep track of the views passed during the transition
    var totalViews = ref.lastView+1;
    var viewCounter = 0; //Identifies when a new view is reached
    var animateView = startView; //Indicates when to switch the views (after all points are finished transitioning)

    //Apply multiple transitions to each display point by chaining them
    this.svg.selectAll(".displayPoints").each(animate());

    //Recursively invoke this function to chain transitions, a new transition is added once
    //the current one is finished
    function animate() {
        viewCounter = viewCounter + direction;
        if (viewCounter%totalViews==0) {
            animateView = animateView + direction;
            viewCounter = 0;
        }
       if (direction == 1 && animateView>=endView) return;
       if (direction ==-1 && animateView<=endView) return;
        return function(d) {
                console.log(animateView);
                d3.select(this).transition(400).ease("linear")
                .attr("cx",d.nodes[animateView][0])
                .attr("cy",d.nodes[animateView][1])
                .each("end", animate());
        };
    }
}
/** Redraws the scatterplot at a specified view
 *  view: the view to draw
 *  NOTE: view tracking variables are not updated by this function
 * */
//TODO: Might want to add interpolation or use the interpolate function
Scatterplot.prototype.redrawView = function(view) {
    this.svg.selectAll(".displayPoints")
	          .transition().duration(400)
	           .attr("cx",function (d){	
			           return d.nodes[view][0];
			        })
				 .attr("cy",function (d){	
			           return d.nodes[view][1];
	             });
}

/** Displays the hint path by appending text labels and a path to the svg
 * id: The id of the dragged point, to determine which hint path to draw
 * points: An array of all points of the dragged point (e.g., d.nodes)
 * */
Scatterplot.prototype.showHintPath = function (id,points){
    var ref = this;
    //Function for drawing a linearly interpolated path between set of points
    var line = d3.svg.line()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; })
        .interpolate("linear");

    //Render the hint points - Currently not needed
   /** this.svg.selectAll(".gDisplayPoints").selectAll(".gInner").selectAll("circle")
        .data(function(d) {return d.nodes;})
        .enter().append("svg:circle")
        .attr("cx", function(d) { return d[0]; })
        .attr("cy", function(d) { return d[1]; })
        .attr("r",ref.pointRadius)
        .attr("class","hintPoints")
        .style("fill","none")
        .style("cursor","pointer")
        .attr("filter", "url(#blur)");*/
   var testArray = [[1,1],[1,1],[1,1],[1,2],[1,1],[1,2],[5,5]];
    ref.checkAmbiguous(testArray);
    //ref.checkAmbiguous(points);
    //Draw the hint path labels
    this.svg.select("#gInner"+id).selectAll("text")
        .data(points).enter()
        .append("svg:text")
        .text(function(d,i) { return ref.labels[i]; })
        .attr("x", function(d,i) {return points[i][0] + ref.pointRadius*2})//TODO: Better way for label placement to minimize overlap, http://stackoverflow.com/questions/15748318/d3-line-chart-labels-overlap
        .attr("y", function (d,i) {  return points[i][1] + ref.pointRadius*2; })
        .attr("fill", this.pointColour)
        .attr("class","hintLabels")
        .style("cursor","pointer")
        .on("click", this.clickHintLabelFunction);

    //Render the hint path line
    this.svg.select("#gInner"+id).append("svg:path")
        .attr("d", function(d){
            return line(d.nodes);
        })
        .attr("id",function (d){return "p"+d.id;})
        .style("stroke-width", 2)
        .style("stroke", this.hintColour)
        .style("fill", "none")
        .attr("filter", "url(#blur)");

    //Fade out the other points using a transition
    this.svg.selectAll(".displayPoints").filter(function (d) {return d.id!=id})
	           .transition().duration(400)
	           .style("fill-opacity", 0.3);
}
/**Clears the hint path by removing it, also re-sets the transparency of the faded out points
 * id: The id of the dragged point, to indicate which hint path to remove
 * */
Scatterplot.prototype.clearHintPath = function (id) {
     //Remove the hint path svg elements
     this.svg.select("#p"+id).remove();
     this.svg.select("#gInner"+id).selectAll("text").remove();
	//Re-set the transparency of faded out points
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
 * @return the point on the line at the minimum distance and the t parameter, as an array: [x,y,t]
 * */
Scatterplot.prototype.minDistancePoint = function(x,y,pt1_x,pt1_y,pt2_x,pt2_y){

   var distance = this.calculateDistance(pt1_x,pt1_y,pt2_x,pt2_y);
   //Two points of the line segment are the same
   if (distance == 0) return [pt1_x,pt1_y,0];

   var t = ((x - pt1_x) * (pt2_x - pt1_x) + (y - pt1_y) * (pt2_y - pt1_y)) / distance;
   if (t < 0) return [pt1_x,pt1_y,t]; //Point projection goes beyond pt1
   if (t > 1) return [pt2_x,pt2_y,t]; //Point projection goes beyond pt2

   //Otherwise, point projection lies on the line somewhere
    var minX = pt1_x + t*(pt2_x-pt1_x);
    var minY = pt1_y + t*(pt2_y-pt1_y);
    return [minX,minY,t];
}
//TODO: detect ambiguous cases in the dataset
//TODO: Could detect really close points to optimize label display
/**Checks for ambiguous cases*/
//Test strings:
//testArray = [[1,1],[1,1],[1,1],[1,2],[1,1],[1,2]];
// +382.892561983471204.56596732550827+382.892561983471204.56596732550827+311.40495867768595121.75153500683433+273.801652892562104.21014948688469+

Scatterplot.prototype.checkAmbiguous = function (points){
    var j, currentPoint;
    var ambiguousPoints = [];
    var stationaryPoints = [];
    var revisitingPoints = [];
    //Re-set the ambiguousPoints array
    for (j=0;j<points.length;j++){
        ambiguousPoints[j] = 0;
    }
    //Populate the stationary and revisiting points array
    //Search for points that match in the x and y values (called "repeated points")
    for (j=0;j<points.length;j++){
        currentPoint = points[j];
        for (var k=j;k<points.length;k++){
            if (j!=k && points[k][0] == currentPoint[0] && points[k][1] == currentPoint[1]){ //A repeated point is found
                // console.log("found"+j+" "+k+" ");
                if (Math.abs(k-j)==1){ //Stationary point
                    //If the point's index does not exist in the array of all stationary points, add it
                    if (stationaryPoints.indexOf(j)==-1){
                        stationaryPoints.push(j);
                        ambiguousPoints[j] = 1;
                    }if (stationaryPoints.indexOf(k)==-1){
                        stationaryPoints.push(k);
                        ambiguousPoints[k] = 1;
                    }
                }else{ //Revisiting point
                    //If the point's index does not exist in the array of all revisiting points, add it
                    if (revisitingPoints.indexOf(j)==-1){
                        revisitingPoints.push(j);
                        if(ambiguousPoints[j]!=1){ //Set the flag to show this is a revisiting point (Need to make sure it wasn't set as a stationary, because stationary takes higher priority)
                            ambiguousPoints[j] = 2;
                        }
                    }
                    //Check for both j and k
                    if (revisitingPoints.indexOf(k)==-1){
                        revisitingPoints.push(k);
                        if(ambiguousPoints[k]!=1){ //Set the flag to show this is a revisiting point
                            ambiguousPoints[k] = 2;
                        }
                    }
                }
                //Both revisiting and stationary?
                /**if (Math.abs(k-j)==2){ //
                }*/ //TODO: Use this for barchart ambiguous
            }
        }

    }
    console.log(stationaryPoints);
    console.log(revisitingPoints);
    console.log(ambiguousPoints);

}