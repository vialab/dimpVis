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
 * title: of the graph
*/
function Scatterplot(x, y, w, h, id,p,r,xLabel,yLabel,title) {
   // Position and size attributes for drawing the svg
   this.xpos = x;
   this.ypos = y;
   this.id = id; 
   this.padding = p;
   this.width = w;
   this.height = h;
   this.pointRadius = r;
   this.loopRadius = 50;
   this.xLabel = xLabel;
   this.yLabel = yLabel;
   this.graphTitle = title;
   // Create a variable to reference the main svg
   this.svg = null;

   //Variables to track dragged point location within the hint path, all assigned values when the dataset is provided (in render())
   this.currentView = -1;
   this.nextView = -1;
   this.lastView = -1;  //The index of the last view of the dataset
   this.mouseX = -1; //Keep track of mouse coordinates for the dragend event
   this.mouseY = -1;
   this.interpValue = 0; //Stores the current interpolation value (percentage travelled) when a point is dragged between two views
   this.labels = []; //Stores the labels of the hint path
   this.ambiguousPoints = [];  //Keeps track of any points which are ambiguous when the hint path is rendered, by assigning the point a flag
   this.loops = []; //Stores points to draw for interaction loops (if any)
   this.previousLoopAngle = "start"; //Stores the angle of dragging along a loop, used to determine rotation direction along loop
   this.previousLoopSign = 0; //Keeps track of the angle switching from positive to negative or vice versa when dragging along a loop

   //Variables to track interaction events
   this.dragged = -1;
   this.isAmbiguous = 0;  //Whether or not the point being dragged has at least one ambiguous case, set to 0 if none, and 1 otherwise

   //Event functions, declared later in this file or in the init file (if visualization is
   // interacting with another visualization) after the object has been instantiated
   this.placeholder = function() {};
   this.clickHintLabelFunction = this.placeholder;
   this.clickSVG = this.placeholder;
   this.dragEvent = null;
}
 /** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
 *  will be drawn. Also, add a blur filter for the hint path effect.
 * */
Scatterplot.prototype.init = function() {
   this.svg = d3.select(this.id).append("svg")
      .attr("width", this.width+(this.padding*2.5))
      .attr("height", this.height+(this.padding*2))
       .attr("x",this.xpos).attr("y",this.ypos)
       .on("click",this.clickSVG)//TODO: Want to be able to click the background of the graph (not a point) as a way of clearing the hint path, right now events are interfering
       .append("g")
       .attr("transform", "translate(" + this.padding + "," + this.padding + ")");
    //Add the blur filter used for the hint path to the SVG so other elements can call it
    this.svg.append("svg:defs")
        .append("svg:filter")
        .attr("id", "blur")
        .append("svg:feGaussianBlur")
        .attr("stdDeviation", 4);
    //Add the blur filter for interaction loops
    this.svg.append("svg:defs")
        .append("svg:filter")
        .attr("id", "blurLoop")
        .append("svg:feGaussianBlur")
        .attr("stdDeviation", 2);
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
     var max_y = d3.max(data.map(function (d){return d3.max(d.points.map(function (a){return a[1];}) ); }));

    //Create the scales by mapping the x,y to the svg size
    var xScale = d3.scale.linear().domain([0,max_x]).range([0,ref.width]);
    var yScale =  d3.scale.linear().domain([0, max_y]).range([ref.height,0]);

    //Call the function which draws the axes
    this.drawAxes(xScale,yScale);

  // Set up the data for drawing the points according to the values in the data set
  this.svg.selectAll("circle")
     .data(data.map(function (d,i) {
            //Re-scale the points such that they are drawn within the svg container
           d.points.forEach(function (d) {
               d[0] = xScale(d[0]);
               d[1] = yScale(d[1]);
           });
	        return {nodes:d.points,id:i,label:d.label};
	  }))	
      .enter().append("g")
	  .attr("class","gDisplayPoints");
     
	 //Draw the data points
     this.svg.selectAll(".gDisplayPoints").append("svg:circle")
          .attr("cx", function(d) {return d.nodes[ref.currentView][0];})
          .attr("cy", function(d) {return d.nodes[ref.currentView][1]; })
          .attr("r", this.pointRadius).attr("class", "displayPoints")
          .attr("id", function (d){return "displayPoints"+d.id;})
          .attr("title", function (d) {return d.label;});

    //Append an empty g element to contain the hint path
    this.svg.append("g")
        .attr("id","hintPath");
}
/** Draws the axes  and the graph title on the SVG
 *  xScale: a function defining the scale of the x-axis
 *  yScale: a function defining the scale of the y-axis
 * */
 Scatterplot.prototype.drawAxes = function (xScale,yScale){

    //Define functions to create the axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    // Add the title of the graph
     this.svg.append("text")
         .attr("id", "graphTitle")
         .text(this.graphTitle)
         .attr("x",1).attr("y",-15);

    // Add the x-axis
    this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+this.padding+"," + this.height + ")")
        .call(xAxis);

    // Add the y-axis
    this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+ this.padding+ ",0)")
        .call(yAxis);

    // Add an x-axis label
    this.svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", this.width)
        .attr("y", this.height+this.padding-10)
        .text(this.xLabel);

    // Add a y-axis label
    this.svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", -15)
        .attr("transform", "rotate(-90)")
        .text(this.yLabel);
}
/** Appends an anchor to the svg, if there isn't already one
 *  x,y: the position of the anchor
 * */
Scatterplot.prototype.appendAnchor = function (x,y){
    if (this.svg.select("#anchor").empty()){
        this.svg.select("#hintPath").append("circle").datum([x,y])
         .attr("id","anchor").attr("cx", x).attr("cy", y).attr("r",5);
    }
}
/** Removes an anchor from the svg, if one is appended
 * */
Scatterplot.prototype.removeAnchor = function (){
    if (!this.svg.select("#anchor").empty()){
        this.svg.select("#anchor").remove();
    }
}
/** Re-draws the dragged point by projecting it onto the the line segment according to
 *  the minimum distance.  As the point is dragged, the views are updated and the rest
 *  of the points are animated
 *  id: The id of the dragged point, for selecting by id
 *  mousex, mouseY: The coordinates of the mouse, received from the drag event
 * */
//TODO: special cases: when current is stationary but next isn't and vice versa
Scatterplot.prototype.updateDraggedPoint = function(id,mouseX,mouseY) {
    var ref = this;
    //Save the mouse coordinates
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    //Re-draw the point's according to the position of the dragged point
    this.svg.select("#displayPoints"+id).each( function (d) {
        var pt1_x = d.nodes[ref.currentView][0];
        var pt2_x = d.nodes[ref.nextView][0];
        var pt1_y = d.nodes[ref.currentView][1];
        var pt2_y = d.nodes[ref.nextView][1];
        var newPoint = [];
        if (ref.isAmbiguous==1){ //Ambiguous cases exist on the hint path
            var currentPointInfo = ref.ambiguousPoints[ref.currentView];
            var nextPointInfo = ref.ambiguousPoints[ref.nextView];
            if (currentPointInfo[0]==1 && nextPointInfo[0] == 0){ //Approaching stationary points from left side of hint path (not on loop yet)
                ref.appendAnchor(pt1_x,pt1_y);
                ref.previousLoopAngle = "start";
                newPoint = ref.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
            }else if (currentPointInfo[0]==0 && nextPointInfo[0] == 1){ //Approaching stationary points from right side on hint path (not on loop yet)
                ref.appendAnchor(pt2_x,pt2_y);
                ref.previousLoopAngle = "start";
                newPoint = ref.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
            }else if (currentPointInfo[0]==1 && nextPointInfo[0] == 1){ //In middle of stationary point sequence
                ref.dragAlongLoop(id,currentPointInfo[2]);
                return;
            }else if (currentPointInfo[0]==2){//Revisiting point
                ref.toggleLabelColour(ref.currentView,currentPointInfo[2]);
                newPoint = ref.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
            }else{
                ref.removeAnchor();
                newPoint = ref.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
            }
        }else{ //No ambiguous cases exist
            newPoint = ref.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
        }
        //Re-draw the dragged point
        ref.svg.select("#displayPoints"+id).attr("cx",newPoint[0]).attr("cy",newPoint[1]);
    });
}
/** Calculates the new position of the dragged point
 * id: of the dragged point
 * pt1, pt2: the boundary points (of current and next view)
 * @return the coordinates of the newPoint as an array [x,y]
 * */
Scatterplot.prototype.dragAlongPath = function(id,pt1_x,pt1_y,pt2_x,pt2_y){
    var newPoint = [];
    //Get the two points of the line segment currently dragged along
    var minDist = this.minDistancePoint(this.mouseX,this.mouseY,pt1_x,pt1_y,pt2_x,pt2_y);
    var newPoint = []; //The new point to draw on the line
    var t = minDist[2]; //To test whether or not the dragged point will pass pt1 or pt2
    //Update the position of the dragged point
    if (t<0){ //Passed current
        this.moveBackward();
        newPoint = [pt1_x,pt1_y];
    }else if (t>1){ //Passed next
        this.moveForward();
        newPoint= [pt2_x,pt2_y];
    }else{ //Some in between the views (pt1 and pt2)
        this.interpolatePoints(id,t,this.currentView,this.nextView);
        newPoint= [minDist[0],minDist[1]];
    }
    return newPoint;
}
/** Updates the view variables to move the visualization forward
 * (passing the next view)
 * */
Scatterplot.prototype.moveForward = function (){
    if (this.nextView < this.lastView){ //Avoid index out of bounds
        this.currentView = this.nextView;
        this.nextView++;
    }
    this.previousDirection = 1;
}
/** Updates the view variables to move the visualization backward
 * (passing the current view)
 * */
Scatterplot.prototype.moveBackward = function (){
    if (this.currentView > 0){ //Avoid index out of bounds
        this.nextView = this.currentView;
        this.currentView--;
    }
    this.previousDirection = -1;
}
 /**Toggles the label colour based on the current view, this effect is used for distinguishing the position on
 * hint path in both ambiguous cases.
 * currentView: the current view, this label will not be faded out
 * groupNumber: the group of repeated points the current point belongs to
 * */
Scatterplot.prototype.toggleLabelColour = function (currentView,groupNumber){
    var ref = this;
    this.svg.selectAll(".hintLabels")
        .filter(function (d){return ref.ambiguousPoints[d.id][2]==groupNumber;})
        .attr("fill-opacity",function (d) {return ((d.id==currentView)? 1:0.3);});
}
/**Interpolates the label transparency between start and end view, this fading effect is used for
 * distinguishing how close the user is from transitioning views the stationary ambiguous cases.
 * interp: the interpolation amount (amount travelled across start to end)
 * startView, endView: the bounding views
 * groupNumber: the group of repeated points the current point belongs to
 * */
Scatterplot.prototype.interpolateLabelColour = function (interp,startView,endView,groupNumber){
    var ref = this;
    this.svg.selectAll(".hintLabels")
        .filter(function (d){return ref.ambiguousPoints[d.id][2]==groupNumber;})
        .attr("fill-opacity",function (d) {
            if (d.id ==startView){ //Fade out
                return d3.interpolate(1,0.3)(interp);
            }else if (d.id == endView){ //Fade in
                return d3.interpolate(0.3,1)(interp);
            }
            return 0.3;
        });
}
/**Handles a dragging interaction along an interaction loop (really a circular dragging motion)
 * used to advance forward or backward along the hint path in the stationary point case
 * id: of the dragged point
 * groupNumber: the group of repeated points this loop belongs to
 * */
Scatterplot.prototype.dragAlongLoop = function (id,groupNumber){
     var ref = this;

     //Get position (centre point) of the stationary point
     var points = this.svg.select("#displayPoints"+id).data().map(function (d) {return d.nodes[ref.currentView];});
     var anchorAngle = Math.PI/6;
     var loopCx = points[0][0]+this.loopRadius/2*Math.cos(anchorAngle);
     var loopCy = points[0][1]+this.loopRadius/2*Math.sin(anchorAngle);

    //Calculate the angle of the mouse w.r.t the stationary point
     var angle = Math.atan2(this.mouseX-loopCx,this.mouseY-loopCy);
     //console.log(angle*180/Math.PI);
    //Determine the sign of the angle (positive or negative)
     var sign = (angle>0)?1:-1;

    //Convert negative angles into positive
     var positiveAngle = (angle < 0)?((Math.PI - angle*(-1))+Math.PI):angle;

    //Find the angular dragging direction
     var draggingDirection = (positiveAngle>this.previousLoopAngle)?-1:1;

    //Find the precentage amount travelled along the loop
    var distanceTravelled = 1 - (positiveAngle/(Math.PI*2));

    //Check if the user has crossed the 180 deg mark, approximately where the stationary point lies (to switch views)
    if (sign!=this.previousLoopSign && this.previousLoopAngle !="start"){ //Switching Directions, might be a view change
        var angle_deg = Math.abs(angle)*180/Math.PI; //Convert to degrees just for convenience
        if (!(angle_deg > 0 && angle_deg < 20)){ //Ignore sign switches within 20 deg from the zero/360 mark
            console.log("switch views");
            if (draggingDirection==1){ //Dragging clockwise
                this.moveForward();
            }else{ //Dragging counter-clockwise
                this.moveBackward();
            }
            this.toggleLabelColour(this.currentView,groupNumber)
            this.interpValue = 0;
        }
    }else{ //Dragging in the middle of the loop, animate the view
        //Need to adjust the distanceTravelled value, because the 1.0 (100% travelled, 360 deg)
        //mark lies on the edge of the loop opposite to the where the stationary point is
        var newInterp;
        if (draggingDirection == 1){
            if (distanceTravelled > 0.5 && distanceTravelled <=1){
                newInterp = distanceTravelled/2;
            }else { //Between 0 and 0.5
                newInterp = distanceTravelled+0.5;
            }
        }else{ //Dragging counter-clockwise
            if (distanceTravelled > 0.5 && distanceTravelled <=1){
                newInterp = (1-distanceTravelled) + 0.5;
            }else { //Between 0 and 0.5
                newInterp = 0.5 - distanceTravelled;
            }
        }
       // console.log(newInterp+" "+draggingDirection+" "+distanceTravelled);
       // console.log(newInterp);
        this.interpValue = newInterp;
        this.interpolatePoints(id,this.interpValue,this.currentView,this.nextView);
        this.interpolateLabelColour(this.interpValue,this.currentView,this.nextView,groupNumber);
    }
   // console.log(this.previousLoopAngle+" "+angle+" "+this.countRevolutions+" "+this.previousLoopDirection);
    //console.log(this.interpValue);
    //Re-draw the anchor along the loop
    var loopPath = d3.select("#loop"+groupNumber).node();
    var totalLength = loopPath.getTotalLength();
    var newPoint = loopPath.getPointAtLength(totalLength*distanceTravelled);

    ref.svg.select("#anchor").attr("cx",newPoint.x).attr("cy",newPoint.y);

    //Save the dragging angle and direction
    this.previousLoopAngle = positiveAngle;
    this.previousLoopSign = sign;
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
          d3.select(this).attr("cx",newPoint.x).attr("cy",newPoint.y);
      })
}
/** Snaps to the nearest view once a dragged point is released
 *  Nearest view is the closest position (either current or next) to the
 *  most recent position of the dragged point. View tracking variables are
 *  updated according to which view is "snapped" to.
 *  id: The id of the dragged point
 *  points: An array of all point positions of the dragged point (e.g., d.nodes)
 * */
Scatterplot.prototype.snapToView = function( id, points) {
    //TODO: other case where one is stationary but the other is not
    var distanceCurrent,distanceNext;
    if (this.ambiguousPoints[this.currentView][0] == 1 && this.ambiguousPoints[this.nextView][0] == 1){ //Current and next are stationary points
       distanceCurrent = this.interpValue;
       distanceNext = 0.5;
    }else { //Non-ambiguous point
        //Calculate the distances from the dragged point to both current and next
        distanceCurrent = this.calculateDistance(this.mouseX,this.mouseY, points[this.currentView][0], points[this.currentView][1]);
        distanceNext = this.calculateDistance(this.mouseX,this.mouseY, points[this.nextView][0],points[this.nextView][1]);
    }
    //Based on the smaller distance, update the scatterplot to that view
    if (distanceCurrent > distanceNext && this.nextView != this.lastView){ //Snapping to next view
		this.currentView = this.nextView;
	    this.nextView = this.nextView +1;
     }
    //Special case: If the nextView is the last view index, need to re draw the plot on that index (not currentView, which is nextView-1)
    if (this.nextView == this.lastView) this.redrawView(this.nextView);
    else this.redrawView(this.currentView);
}
/** Updates the view tracking variables when the view is being changed by an external
 * visualization (e.g., slider)
 * */
Scatterplot.prototype.changeView = function( newView) {
	 //Update the view tracker variables
	 if (newView ==0){//First point on path
            this.currentView = newView
			this.nextView = newView+1;
	}else if (newView == this.lastView){  //Last point of path
		   this.nextView = newView;
		   this.currentView = newView -1;
	}else { //A point somewhere in the middle
            this.currentView = newView;
            this.nextView = newView + 1;
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
//TODO: Still pretty buggy might have to do with the view tracking, sometimes doesn't animate to the correct view, exact cause of this is unknown
//TODO: Add toggling label colour for stationary/revisiting points
 Scatterplot.prototype.animatePoints = function( startView, endView) {
     if (startView == endView){return;}
     var ref = this;
     //Determine the travel direction (e.g., forward or backward in time)
     var direction = 1;
     if (startView>endView) direction=-1;

    //Define some counter variables to keep track of the views passed during the transition
    var totalViews = ref.lastView+1;
    var viewCounter = -1; //Identifies when a new view is reached
    var animateView = startView; //Indicates when to switch the views (after all points are finished transitioning)

    //Apply multiple transitions to each display point by chaining them
    this.svg.selectAll(".displayPoints").each(animate());

    //Recursively invoke this function to chain transitions, a new transition is added once
    //the current one is finished
    function animate() {
        viewCounter++;
        if (viewCounter==totalViews) {
            animateView = animateView + direction;
            viewCounter = 0;
        }
        return function(d) {
            //Ensure the animateView index is not out of bounds
            if (direction == 1 && animateView>endView) {return};
            if (direction ==-1 && animateView<endView) {return};
            //Re-draw each point at the current view in the animation sequence
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
//TODO: For later, Might want to add interpolation or use the interpolate function
Scatterplot.prototype.redrawView = function(view) {
    if (this.ambiguousPoints.length != 0 && this.ambiguousPoints[view][0] == 1){ //A stationary point, update the label colour
        this.toggleLabelColour(view,this.ambiguousPoints[view][2]);
        //Re-draw position the anchor at the stationary point (if any)
        if (!this.svg.select("#anchor").empty()){
            this.svg.select("#anchor").attr("cx",function (d){return d[0]}).attr("cy",function (d){return d[1]});
        }
    }
    this.svg.selectAll(".displayPoints").transition().duration(300)
	          .attr("cx",function (d){return d.nodes[view][0];})
			  .attr("cy",function (d){return d.nodes[view][1];});
}
/** Displays the hint path by appending text labels and a path to the svg
 * id: The id of the dragged point, to determine which hint path to draw
 * points: An array of all points of the dragged point (e.g., d.nodes)
 * */
//TODO: For Later, find a better way for label placement to minimize overlap (detect really close points and shift the label positions)
 Scatterplot.prototype.showHintPath = function (id,points){
    var ref = this;
    //Function for drawing a linearly interpolated path between set of points
    var line = d3.svg.line()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; })
        .interpolate("linear");

    //First check for ambiguous cases in the hint path of the dragged point
     ref.checkAmbiguous(points);

    //Draw the interaction loop(s) (if any)
     if (this.loops.length >0){ this.drawLoops(id)}

    //Adjust the points array to include ambiguous points (if any), otherwise, just keep the original array
    var adjustedPoints = points;
    if (ref.isAmbiguous==1){
        //Re-map the points array to contain positions which correspond to ambiguous cases (at each ambiguous case, labels are
        // presented as a horizontally oriented list)
        adjustedPoints = points.map(function (d,i){
            if (ref.ambiguousPoints[i][0]!=0) return [d[0]+25*ref.ambiguousPoints[i][1],d[1],ref.ambiguousPoints[i][2]];
            return d;
       });
    }
    //Draw the hint path labels
    this.svg.select("#hintPath").selectAll("text")
        .data(adjustedPoints.map(function (d,i) {
            return {x:d[0] + ref.pointRadius*2,y:d[1] + ref.pointRadius*2,id:i}
         }))
        .enter().append("svg:text")
        .text(function(d) { return ref.labels[d.id]; })
        .attr("x", function(d) {return d.x;})
        .attr("y", function (d) {  return d.y; })
        .attr("class","hintLabels")
        .attr("id",function (d){return "hintLabels"+ d.id})
        .on("click", this.clickHintLabelFunction);

    //Render the hint path line
    this.svg.select("#hintPath").append("svg:path")
        .attr("d",  line(points))
        .attr("id","path")
        .attr("filter", "url(#blur)");

    //Fade out the other points using a transition
    this.svg.selectAll(".displayPoints").filter(function (d) {return d.id!=id})
	           .transition().duration(300)
	           .style("fill-opacity", 0.3);
}
/** Draws interaction loops as svg paths onto the hint path (if point has stationary cases)
 *  id: of the dragged point
 * */
Scatterplot.prototype.drawLoops = function (id){
    var ref = this;
    //Create a function for drawing a loop around a stationary point, as an interaction path
    var loopGenerator = d3.svg.line().x(function(d) { return d[0]; }).y(function(d) { return d[1]; })
        .tension(0)
        .interpolate("basis-closed"); //Closed B-spline, a loop
   //Draw all loops at their respective stationary points
    this.svg.select("#hintPath").selectAll(".loops")
        .data(ref.loops.map(function (d,i){
            var loopPoints = [];
            loopPoints = ref.calculateLoopPoints(d[0],d[1],d[2]);
            return {points:loopPoints,id:i};
        }))
        .enter().append("path")
        .attr("d",function (d){return loopGenerator(d.points);})
        .attr("class","loops")
        .attr("id",function (d,i){return "loop"+i;})
        .attr("filter", "url(#blurLoop)");
}
/**Clears the hint path by removing it, also re-sets the transparency of the faded out points and the isAmbiguous flag */
Scatterplot.prototype.clearHintPath = function () {
    this.isAmbiguous = 0;
    this.loops = []; //Re-set the array

    //Remove the hint path svg elements
    this.svg.select("#hintPath").selectAll("text").remove();
    this.svg.select("#hintPath").selectAll("path").remove();
    this.svg.select("#hintPath").selectAll("circle").remove();

	//Re-set the transparency of faded out points
    this.svg.selectAll(".displayPoints").style("fill-opacity", 1);
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
/** Computes the points to lie along an interaction loop
 * Note: this function is only called in findLoops()
 * x,y: Define the center point of the loop (sort of)
 * numPoints: the number of views at the stationary point (might not need this if all loops are the same size)
 * @return an array of all loop points and the year index in the format: [[x,y], etc.]
 * */
Scatterplot.prototype.calculateLoopPoints = function (x,y,numPoints){
    var loopPoints = [];  
    var interval = Math.PI/6;
    //The first point of the path should be the original point, as a reference for drawing the loop
    loopPoints.push([x,y]);
    //Generate some polar coordinates for forming the loop around x,y using arbitrary angles
    for (var j=1;j<=3;j++){
        loopPoints.push([(x + this.loopRadius*Math.cos(interval*j)),(y+ this.loopRadius*Math.sin(interval*j))]);
    }
    //The last point of the path should be the original point, as a reference for drawing the loop
   loopPoints.push([x,y]);
   return loopPoints;
}
//TODO: Could use this function to detect really close points to optimize label display
/** Search for ambiguous cases in a list of points.  Ambiguous cases are tagged by type, using a number:
 *  0: not ambiguous
 *  1: stationary point (point which doesn't move for at least 2 consecutive years)
 *  2: revisiting point (point which returns to the same position multiple times in the dataset)
 *
 *  In this function, three important arrays are populated:
 *  this.ambiguousPoints: an array to quickly determine the type for each point along the hint path
 *                  Format: [[type,adjustedIndex,group]..total number of points on hint path], the adjusted index is for
 *                  placing the hint label (an offset, such that the labels at one ambiguous point can be a list).  The group
 *                  is another index which indicates which group of repeated or common points the point belongs to.
 *  repeatedPoints: an array which combines revisiting and stationary points
 *                  Format: [ [x,y,[[viewIndex,type]..number of view indices matching this point]] .. number of ambiguous points]
 *  this.loops: an array of all loops to draw
 *                 Format: [[x,y,# of points]..number of loops]
 *
 *  points: an array of points to search within
 * */
Scatterplot.prototype.checkAmbiguous = function (points){
    var j, currentPoint;
    var stationaryPoints = [];
    var revisitingPoints = [];
    var repeatedPoints = [];
    var foundIndex = -1;

    this.ambiguousPoints = [];
    //Re-set the ambiguousPoints array
    for (j=0;j<points.length;j++){ this.ambiguousPoints[j] = [0];}

    //Populate the stationary and revisiting points array
    //Search for points that match in the x and y values (called "repeated points")
    for (j=0;j<points.length;j++){
        currentPoint = points[j];
        for (var k=0;k<points.length;k++){
            if (j!=k && points[k][0] == currentPoint[0] && points[k][1] == currentPoint[1]){ //A repeated point is found
                this.isAmbiguous = 1;
                if (Math.abs(k-j)==1){ //Stationary point
                    //If the point's index does not exist in the array of all stationary points, add it
                    if (stationaryPoints.indexOf(j)==-1){
                        stationaryPoints.push(j);
                        this.ambiguousPoints[j] = [1];
                        //Add this stationary point to repeatedPoints, according to it's x and y value
                        foundIndex = this.findInArray(currentPoint[0],currentPoint[1],repeatedPoints);
                        if (foundIndex!=-1) repeatedPoints[foundIndex][2].push([j,1]);
                        else repeatedPoints.push([currentPoint[0],currentPoint[1],[[j,1]]]);
                    }
                }else{ //Revisiting point
                    //If the point's index does not exist in the array of all revisiting points, add it
                    if (revisitingPoints.indexOf(j)==-1){
                        revisitingPoints.push(j);
                       if(this.ambiguousPoints[j][0]!=1){ //Set the flag to show this is a revisiting point
                       //Need to make sure it wasn't set as a stationary, because stationary has higher priority
                           this.ambiguousPoints[j] = [2];
                          //Add this revisiting point to repeatedPoints, according to it's x and y value
                           foundIndex = this.findInArray(currentPoint[0],currentPoint[1],repeatedPoints);
                           if (foundIndex!=-1) repeatedPoints[foundIndex][2].push([j,2]);
                           else repeatedPoints.push([currentPoint[0],currentPoint[1],[[j,2]]]);
                       }
                    }
                }
            }
        }
    }
    //Now, need to add adjustedIndex to each ambiguous point so the hint labels can be placed at the correct positions
    //Also, populate the loops array to contain all loops which must be drawn where there are areas of stationary points
    var foundStationary = 0;
    for (j=0;j<repeatedPoints.length;j++){
        var viewIndices = repeatedPoints[j][2];
        for (k=0;k<viewIndices.length;k++){
            var type = viewIndices[k][1];
            this.ambiguousPoints[viewIndices[k][0]] = [type,k,j];
            if (type==1) foundStationary = 1;
        }
        if (foundStationary==1) this.loops.push([repeatedPoints[j][0],repeatedPoints[j][1],viewIndices.length]);
        foundStationary = 0;
    }
}
/** Search for x,y in a 2D array with the format: [[x,y,..other elements]..number of points]
 *  x,y: the point to search for
 *  array: the array to search within
 *  @return -1 if no match is found
 *          the index of the found match
 * */
Scatterplot.prototype.findInArray = function (x,y,array)
{
   if (array.length==0) return -1;
   for (var j=0;j<array.length;j++){
      if (array[j][0]==x && array[j][1]==y){
          return j;
      }
   }
    return -1;
}
//TODO: non-existent data points (e.g missing from the data set), "hole" in hint path?
//TODO: does the code handle zero values? (point goes off the axis)
//TODO: how to visualize a revisiting point within a stationary point sequence (like my example for afghanistan on scatterplot)