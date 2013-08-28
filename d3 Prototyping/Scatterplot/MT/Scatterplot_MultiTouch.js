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
   this.numPoints = -1; //Set this later

   //Variables to track dragged point location within the hint path, all assigned values when the dataset is provided (in render())
   this.currentView = -1;
   this.nextView = -1;
   this.lastView = -1;  //The index of the last view of the dataset
   this.mouseX = -1; //Keep track of mouse coordinates for the dragend event
   this.mouseY = -1;
   this.interpValue = 0; //Stores the current interpolation value (percentage travelled) when a point is dragged between two views
   this.labels = []; //Stores the labels of the hint path
   this.ambiguousPoints = [];  //Keeps track of any points which are ambiguous when the hint path is rendered, by assigning the point a flag
   //this.closePoints = []; //Points which are near each other such that labels are probably overlapping
   this.loops = []; //Stores points to draw for interaction loops (if any)
   this.previousLoopAngle = "start"; //Stores the angle of dragging along a loop, used to determine rotation direction along loop
   this.previousLoopSign = 0; //Keeps track of the angle switching from positive to negative or vice versa when dragging along a loop
   this.previousDraggingDirection = 1; //Saves the dragging direction around an interaction loop
   //this.endView = -1;  //The view at the end of a loop
   this.timeDirection = 1; //Tracks the direction travelling over time

    //For the interaction sliders
    this.sliderCurrentView = -1;
    this.sliderNextView = -1;
    this.sliderLastView = -1;
    this.draggedSlider = -1;

   //Save some angle values
   this.halfPi = Math.PI/2;
   this.threePi_two = Math.PI*3/2;
   this.twoPi = Math.PI*2;
   this.pi = Math.PI;

   //Variables to track interaction events
   this.draggedPoint = -1;
   this.isAmbiguous = 0;  //Whether or not the point being dragged has at least one ambiguous case, set to 0 if none, and 1 otherwise

   //Event functions, declared later in this file or in the init file (if visualization is
   // interacting with another visualization) after the object has been instantiated
   this.placeholder = function() {};
   this.clickHintLabelFunction = this.placeholder;
   this.clickSVG = this.placeholder;
   /**this.dragStartSlider = this.placeholder;
   this.draggingSlider = this.placeholder;
   this.dragEndSlider = this.placeholder;*/
}
 /** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
 *  will be drawn. Also, add a blur filter for the hint path effect.
 * */
Scatterplot.prototype.init = function() {

    this.svg = d3.select(this.id).append("svg")
      .attr("width", this.width+(this.padding*2.5))
      .attr("height", this.height+(this.padding*2))
      .attr("x",this.xpos).attr("y",this.ypos)
      .on("click",this.clickSVG).append("g")
      .attr("transform", "translate(" + this.padding + "," + this.padding + ")");

    //Add the blur filter used for the hint path to the SVG so other elements can call it
    this.svg.append("svg:defs").append("svg:filter")
        .attr("id", "blur").append("svg:feGaussianBlur")
        .attr("stdDeviation", 4);

    //Add the blur filter for interaction loops
    this.svg.append("svg:defs").append("svg:filter")
        .attr("id", "blurLoop").append("svg:feGaussianBlur")
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
   this.numPoints = data.length;

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
	  })).enter().append("g")
	  .attr("class","gDisplayPoints");
     
	 //Draw the data points
     this.svg.selectAll(".gDisplayPoints").append("svg:circle")
          .attr("cx", function(d) {return d.nodes[ref.currentView][0];})
          .attr("cy", function(d) {return d.nodes[ref.currentView][1]; })
          .attr("r", this.pointRadius).attr("class", "displayPoints")
          .attr("id", function (d){return "displayPoints"+d.id;})
          .attr("title", function (d) {return d.label;});
         /**.on("mousedown", function (d){
             ref.draggedPoint = d.id;
             ref.showHintPath(d.id, d.nodes);
             console.log("down");
         })
         .on("mousemove",function (d){
             if (ref.draggedPoint != -1){
                 ref.updateDraggedPoint(d.id,d3.mouse(this)[0],d3.mouse(this)[1]);
                 console.log("move");
             }
         })
         .on("mouseup", function (d){
             ref.draggedPoint = -1;
             console.log("up");
         });*/

    //Append an empty g element to contain the hint path
    this.svg.append("g").attr("id","hintPath");
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
     this.svg.append("text").attr("id", "graphTitle")
         .attr("class","axis").text(this.graphTitle)
         .attr("x",1).attr("y",-15);

    // Add the x-axis
    this.svg.append("g").attr("class", "axis")
        .attr("transform", "translate("+this.padding+"," + this.height + ")")
        .call(xAxis);

    // Add the y-axis
    this.svg.append("g").attr("class", "axis")
        .attr("transform", "translate("+ this.padding+ ",0)")
        .call(yAxis);

    // Add an x-axis label
    this.svg.append("text").attr("class", "axisLabel")
        .attr("x", this.width)
        .attr("y", this.height+this.padding-10)
        .text(this.xLabel);

    // Add a y-axis label
    this.svg.append("text").attr("class", "axisLabel")
        .attr("x", -15).attr("transform", "rotate(-90)")
        .text(this.yLabel);
}
/** Appends an anchor to the svg, if there isn't already one
 * */
Scatterplot.prototype.appendAnchor = function (){
    if (this.svg.select("#anchor").empty()){
        this.svg.select("#hintPath").append("circle")
         .attr("id","anchor").attr("r",5).style("stroke","none");
    }
}
/** Re-draws the anchor, based on the dragging along the loop
 * interp: amount along the loop to draw the anchor at
 * groupNumber: to select the id of the loop
 * */
Scatterplot.prototype.redrawAnchor = function (interp,groupNumber){
    var loopPath = d3.select("#loop"+groupNumber).node();
    var totalLength = loopPath.getTotalLength();
    var newPoint = loopPath.getPointAtLength(totalLength*interp);
    this.svg.select("#anchor").attr("cx",newPoint.x).attr("cy",newPoint.y).style("stroke","#c7c7c7");
}
/**Hides the circle anchor by removing it's stroke colour
 * */
Scatterplot.prototype.hideAnchor = function (){
    this.svg.select("#anchor").style("stroke","none");
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
Scatterplot.prototype.updateDraggedPoint = function(id,mouseX,mouseY) {

    //Save the mouse coordinates
    var ref = this;
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

            /**if (currentPointInfo[0]==1 && nextPointInfo[0] == 0){ //Approaching loop from left side of hint path (not on loop yet)
                newPoint = ref.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
            }else if (currentPointInfo[0]==0 && nextPointInfo[0] == 1){ //Approaching loop from right side on hint path (not on loop yet)
                console.log("next is ambiguous");
                newPoint = ref.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
            }else if (currentPointInfo[0]==1 && nextPointInfo[0] == 1){ //In middle of stationary point sequence
                return;
            }else{
                newPoint = ref.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
            }*/
            /***/
            if (currentPointInfo[0]==1 && nextPointInfo[0] == 0){ //Approaching loop from left side of hint path (not on loop yet)
                ref.deactivateSlider(currentPointInfo[1]);
                newPoint = ref.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
            }else if (currentPointInfo[0]==0 && nextPointInfo[0] == 1){ //Approaching loop from right side on hint path (not on loop yet)
                ref.deactivateSlider(nextPointInfo[1]);
                newPoint = ref.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
            }else if (currentPointInfo[0]==1 && nextPointInfo[0] == 1){ //In middle of stationary point sequence

                /**if (ref.draggedSlider == -1){ //No slider is being dragged
                    if (ref.sliderCurrentView == 0){

                    }else if (ref.sliderNextView == ref.sliderLastView){
                        newPoint = ref.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
                        ref.currentView = ref.nextView;
                        ref.nextView++;
                    }

                }*/
                ref.activateSlider(currentPointInfo[1]);
                return;
            }else{
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
        this.interpolateLabelColour(t);
        newPoint= [minDist[0],minDist[1]];
        //Save the values
        this.timeDirection = this.findTimeDirection(t);
        this.interpValue = t; //Save the interpolation amount
    }
    return newPoint;
}
/** Sets the time direction based on the interpolation amount, currently not needed for the interaction
 *  But can be used to log events.
 * @return: the new direction travelling in time
 * */
Scatterplot.prototype.findTimeDirection = function (interpAmount){
    var direction;
    if (interpAmount > this.interpValue){ //Forwards in time
        direction = 1;
    }else if (interpAmount < this.interpValue){ //Backwards in time
        direction = -1;
    }else{ //Did not change
        direction = this.timeDirection
    }

    if (this.timeDirection != direction){ //Switched directions
        console.log("switched directions "+direction+" currentInterp "+this.interpValue+" newInterp "+interpAmount+" "+this.currentView+" "+this.nextView);
    }
    return direction;
}
/** Updates the view variables to move the visualization forward
 * (passing the next view)
 * */
Scatterplot.prototype.moveForward = function (){
    if (this.nextView < this.lastView){ //Avoid index out of bounds
        this.currentView = this.nextView;
        this.nextView++;
        this.timeDirection = 1;
        this.interpValue = 0;
    }
}
/** Updates the view variables to move the visualization backward
 * (passing the current view)
 * */
Scatterplot.prototype.moveBackward = function (){
    if (this.currentView > 0){ //Avoid index out of bounds
        this.nextView = this.currentView;
        this.currentView--;
        this.timeDirection = -1;
        this.interpValue = 1;
    }
}
/**Interpolates the label transparency between start and end view, this fading effect is used for
 * distinguishing how close the user is from transitioning views the stationary ambiguous cases.
 * interp: the interpolation amount (amount travelled across start to end)
 * */
Scatterplot.prototype.interpolateLabelColour = function (interp){
    var ref = this;
    this.svg.selectAll(".hintLabels").attr("fill-opacity",function (d) {
            if (d.id ==ref.currentView){ //Dark to light
                return d3.interpolate(1,0.3)(interp);
            }else if (d.id == ref.nextView){ //Light to dark
                return d3.interpolate(0.3,1)(interp);
            }
            return 0.3;
        });
}
/**Handles a dragging interaction along an interaction slider (vertical dragging motion)
 * used to advance forward or backward along the hint path in the stationary point case.
 * Updates the main view variables as well as the variables corresponding to each interval along the slider.
 * id: of the dragged point
 * yValues: along the slider
 * */
//Replaced dragalongloop function
Scatterplot.prototype.dragAlongSlider = function(id,mouseY,yValues) {

   var current = yValues[this.sliderCurrentView];
   var next = yValues[this.sliderNextView];
   var bounds = checkBounds(this,current,next,mouseY);
   var draggingDirection = 1;

    if (bounds ==  current){ //Passing current view
        if (this.sliderCurrentView >0){
            moveBackward(this,draggingDirection);
            this.sliderNextView = this.sliderCurrentView;
            this.sliderCurrentView--;
        }
   }else if (bounds == next){ //Passing next view
        if (this.sliderNextView < this.sliderLastView){
            moveForward(this,draggingDirection);
            this.sliderCurrentView = this.sliderNextView;
            this.sliderNextView++;
        }
   }else{ //Somewhere in between views
        findInterpolation(this,current,next,mouseY,0,draggingDirection);
        this.interpolatePoints(id,this.interpValue,this.currentView,this.nextView);
        this.interpolateLabelColour(this.interpValue);
   }
}
/**Finds the angle of the mouse w.r.t the center of the loop
 * @return [angle,positiveAngle,interpAmount]
 * */
Scatterplot.prototype.calculateMouseAngle = function (mouseX,mouseY,orientationAngle,loopCx,loopCy){

    var newAngle;
    var subtractOne = 0; //For adjusting the interpolation value

    if (orientationAngle < this.halfPi && orientationAngle >= 0){ //Between 0 (inclusive) and 90
        newAngle = Math.atan2(mouseY - loopCy, loopCx - mouseX) + orientationAngle; //0/360 deg
    }else if (orientationAngle < this.twoPi && orientationAngle >= this.threePi_two){ //Between 360/0 and 270 (inclusive)
        subtractOne = 1;
        newAngle = Math.atan2(loopCx - mouseX,mouseY - loopCy) - (orientationAngle - this.threePi_two);  //270 deg
    }else if (orientationAngle < this.threePi_two && orientationAngle >= this.pi){ //Between 270 and 180 (inclusive)
        newAngle =  Math.atan2(loopCy - mouseY, mouseX - loopCx) + (orientationAngle- this.pi); //180 deg
    }else{
        subtractOne = 1;
        newAngle = Math.atan2(mouseX - loopCx, loopCy - mouseY) -(orientationAngle - this.halfPi); // 90 deg
    }

    var positiveAngle = (newAngle < 0)?((this.pi - newAngle*(-1))+this.pi):newAngle;

    var interpAmount = (subtractOne ==1)? (1-positiveAngle/this.twoPi) : (positiveAngle/this.twoPi);

    return  [newAngle,positiveAngle,interpAmount];
}
/** Adjusts the interpolation value of the mouse angle (1/0 mark is at the stationary point) to draw correctly on
 *  the loop (where 0.5 is at the stationary point)
 * */
Scatterplot.prototype.convertMouseToLoop_interp = function (mouseInterp){
    return (mouseInterp >=0 && mouseInterp <0.5)?(mouseInterp+0.5):(mouseInterp-0.5);
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
    if (distanceCurrent > distanceNext && this.nextView <= this.lastView){ //Snapping to next view
		this.currentView = this.nextView;
	    this.nextView = this.nextView +1;
     }

    //Redraw the view
    this.redrawView(this.currentView);
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
 *  id: of the dragged point (if any)
 *  startView, endView: animation goes from start to end view
 *  Resources: http://bl.ocks.org/mbostock/1125997
 *            http://bost.ocks.org/mike/transition/
 * */
 Scatterplot.prototype.animatePoints = function( id, startView, endView) {
     if (startView == endView){return;}
     var ref = this;
     //Determine the travel direction (e.g., forward or backward in time)
     var direction = 1;
     if (startView>endView) direction=-1;

    //Define some counter variables to keep track of the views passed during the transition
    var totalObjects = this.numPoints;
    var objectCounter = -1;
    var animateView = startView; //Indicates when to switch the views (after all points are finished transitioning)

    //Apply multiple transitions to each display point by chaining them
    this.svg.selectAll(".displayPoints").each(animate());

    //Recursively invoke this function to chain transitions, a new transition is added once
    //the current one is finished
    function animate() {
        objectCounter++;
        if (objectCounter==totalObjects) {
            animateView = animateView + direction;
            objectCounter = 0;
        }

        //Ensure the animateView index is not out of bounds
        if (direction == 1 && animateView>=endView) {return};
        if (direction ==-1 && animateView<=endView) {return};

        return function(d) {
            //Re-draw each point at the current view in the animation sequence
            d3.select(this).transition(400).ease("linear")
            .attr("cx",d.nodes[animateView][0])
            .attr("cy",d.nodes[animateView][1])
            .each("end", animate());

            //Re-colour the labels along the hint path (if a path is visible)
            if (d.id == id){
                d3.selectAll(".hintLabels").attr("fill-opacity",function (b){ return ((b.id==animateView)?1:0.3)});
            }
        };
    }
}
/** Redraws the scatterplot at a specified view
 *  view: the view to draw
 *  NOTE: view tracking variables are not updated by this function
 * */
Scatterplot.prototype.redrawView = function(view) {

    this.hideAnchor();

    //Re-colour the hint path labels
    this.svg.selectAll(".hintLabels").attr("fill-opacity",function (d){ return ((d.id==view)?1:0.3)});
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

    //In case next view went out of bounds (from snapping to view), re-adjust the view variables
     var drawingView = this.currentView;
     if (this.nextView>this.lastView){
         this.nextView--;
         this.currentView--;
         drawingView = this.nextView;
     }

    //Function for drawing a linearly interpolated path between set of points
    var line = d3.svg.line().interpolate("linear");

    //First check for ambiguous cases in the hint path of the dragged point, then draw loops (if any)
     var repeatedPoints = ref.checkAmbiguous(id,points);

    if (ref.isAmbiguous==1){
        ref.appendAnchor();
    }

    //Draw the hint path labels, reposition any which are in a stationary sequence
    var adjustedPoints = this.placeLabels(points,repeatedPoints);

     this.svg.select("#hintPath").selectAll("text")
       .data(adjustedPoints.map(function (d,i) {
            var xPos = d[0] + ref.pointRadius*2;
            var yPos = d[1] + ref.pointRadius*2;
            return {x:xPos,y:yPos,id:i,groupNum:d[2]}
        })).enter().append("svg:text")
        .text(function(d) { return ref.labels[d.id]; })
        .attr("x", function(d) {return d.x;})
        .attr("y", function (d) {  return d.y; })
        .attr("class","hintLabels")
        .attr("fill-opacity",function (d){
             //if (ref.ambiguousPoints[d.id][0] ==1) return 0;
             return ((d.id==drawingView)?1:0.3)
         }).attr("id",function (d){return "hintLabels"+ d.id})
         //Replaced the click function defined in init
         .on("touchstart", function (){
             d3.event.stopPropagation();
         }).on("touchend", function (d){

             if (!d3.select(d3.event.target).classed("hintLabels"))
                 return;
             d3.event.stopPropagation();
             ref.animatePoints(ref.draggedPoint,ref.currentView, d.id);
             ref.changeView(d.id);
            // ref.clearHintPath();
         });
        //.on("click", this.clickHintLabelFunction);

    //Render the hint path line
    this.svg.select("#hintPath").append("svg:path")
        .attr("d",  line(points)).attr("id","path")
        .attr("filter", "url(#blur)");

    //Fade out the other points using a transition
    this.svg.selectAll(".displayPoints").filter(function (d) {return d.id!=id})
	           .transition().duration(300).style("fill-opacity", 0.3);
}
/**This function places labels in ambiguous cases such that they do not overlap
 * points: a 2D array of positions of each label [x,y]...
 * */
//Adjusted to match the interaction slider (labels placed vertically)
 Scatterplot.prototype.placeLabels = function (points,repeatedPoints){

  if (this.isAmbiguous == 0){return points}

  var ref = this;
  var offset = -1;
  var indexCounter = 0;
  var index = -1;

 for (var j= 0;j<repeatedPoints.length;j++){ //TODO: really inefficient change later!
    repeatedPoints[j][3] = 0;
 }

  var adjustedPoints = points.map(function (d,i){
      var y = d[1];
      var x = d[0];

      if (ref.ambiguousPoints[i][0] == 1){
          if (ref.ambiguousPoints[i][1] != offset){
              indexCounter = 0;
              offset = ref.ambiguousPoints[i][1];
              index++;
          }
          x = x + 25*indexCounter;
          indexCounter++;
          repeatedPoints[index][3] = indexCounter;
      }
      return [x,y,indexCounter-1];
  });

  this.drawSliders(repeatedPoints);

  return adjustedPoints;
}
/** Draws interaction sliders as svg rects onto the hint path (if point has stationary cases)
 *  id: of the dragged point
 * */
//Replaced the drawLoops function
Scatterplot.prototype.drawSliders = function (points){
   var ref = this;
   //Draw all sliders at their respective stationary points
    this.svg.select("#hintPath").selectAll(".interactionSliders")
        .data(points.map(function (d,i){
            var n = []; //Y-values of the years along the slider, can use this to draw ticks later

            for (var j=0;j<d[3];j++){
                n.push(d[1] + 25*j);
            }

            return {id:i,x:d[0]+45,y:d[1],numYears:d[3],nodes:n};
        }))
        .enter().append("rect").attr("class","interactionSliders")
        .attr("id",function (d,i){return "interactionSlider"+i;})
        .style("fill","none").attr("width",15).attr("height",function (d){return 20*d.numYears})
        .attr("x", function (d){return d.x}).attr("y", function (d){return d.y});
        /**.on("mousedown", this.placeholder)
        .on("mousemove",this.placeholder)
        .on ("mouseup", this.placeholder);
        .on("touchstart", this.placeholder).on("touchmove",this.placeholder)
        .on("touchend",this.placeholder);*/
}
/** Makes a slider (with id) active (interactive)*/
Scatterplot.prototype.activateSlider = function (id){
    var ref = this;
   //Using the touch interactions
    /**this.svg.select("#interactionSlider"+id).on("touchstart", function (d){

        d3.event.preventDefault();
        ref.sliderLastView = d.nodes.length -1;
        ref.draggedSlider = d.id;

        if (ref.timeDirection == 1){
            ref.sliderCurrentView = 0;
            ref.sliderNextView = 1;
        }else{
            ref.sliderCurrentView = ref.sliderLastView - 1;
            ref.sliderNextView = ref.sliderLastView;
        }
    }).on("touchmove",function (d){

            d3.event.preventDefault();
            if (ref.draggedSlider != -1){
                var touchY;
                 if (d3.touches(this).length>1){
                 touchY = d3.touches(this)[1][1];
                 }else{
                 touchY = d3.touches(this)[0][1];
                 }
                ref.dragAlongSlider(ref.draggedPoint,touchY,d.nodes);
            }
        }).on("touchend",function (d){

            d3.event.preventDefault();
            d3.event.stopPropagation();

            ref.draggedSlider = -1;
            if (ref.sliderCurrentView == 0){
                ref.nextView = ref.currentView;
                ref.currentView--;
            }else if (ref.sliderNextView == ref.sliderLastView){
                ref.currentView = ref.nextView;
                ref.nextView++;
            }
        });*/

//Add dragging function for the interaction slider for ambiguous regions
//TODO: slider widget does not get updated..
    var dragInteractionSlider = d3.behavior.drag()
        .on("dragstart", function(d){
            d3.event.sourceEvent.preventDefault();
            ref.sliderLastView = d.nodes.length -1;
            ref.draggedSlider = d.id;

            if (ref.timeDirection == 1){
                ref.sliderCurrentView = 0;
                ref.sliderNextView = 1;
            }else{
                ref.sliderCurrentView = ref.sliderLastView - 1;
                ref.sliderNextView = ref.sliderLastView;
            }
        })
        .on("drag", function(d){
            d3.event.sourceEvent.preventDefault();
            if (ref.draggedSlider != -1){
                var userY;
                var touchesArray = d3.touches(this);
                if (touchesArray.length>0){
                    if (touchesArray.length>1){
                        userY = touchesArray[1][1];
                    }else{
                        userY = touchesArray[0][1];
                    }
                }else{
                    userY = d3.event.y;
                }
                ref.dragAlongSlider(ref.draggedPoint,userY,d.nodes);
            }
        })
        .on("dragend",function (){ //In this event, mouse coordinates are undefined, need to use the saved
            d3.event.sourceEvent.preventDefault();
            d3.event.sourceEvent.stopPropagation();

            ref.draggedSlider = -1;
            if (ref.sliderCurrentView == 0){
                ref.nextView = ref.currentView;
                ref.currentView--;
            }else if (ref.sliderNextView == ref.sliderLastView){
                ref.currentView = ref.nextView;
                ref.nextView++;
            }
            document.title = "ending dragged slider";
        });

    //Update the display (labels + slider)
    this.svg.select("#interactionSlider"+id).call(dragInteractionSlider).style("fill","#c7c7c7");
    this.svg.selectAll(".hintLabels").filter(function (d){return (ref.ambiguousPoints[d.id][1]==id)})
        .transition(200).attr("x",function (d){return ((d.x - 25*d.groupNum)+65)}).attr("y",function (d){return (d.y + 25* d.groupNum)});
}
/**De-activates a slider (with id) */
Scatterplot.prototype.deactivateSlider = function (id){

  /** this.svg.select("#interactionSlider"+id)
       .on("touchstart", this.placeholder)
       .on("touchmove",this.placeholder)
       .on ("touchend", this.placeholder);*/
  var ref = this;
  //Re-set the display (labels + slider)
  this.svg.select("#interactionSlider"+id).style("fill","none").call(ref.placeholder);
  this.svg.selectAll(".hintLabels").filter(function (d){return (ref.ambiguousPoints[d.id][1]==id)})
      .transition(300).attr("x",function (d){return d.x}).attr("y",function (d){return d.y});
}
/** Clears the hint path by removing it, also re-sets the transparency of the faded out points and the isAmbiguous flag */
Scatterplot.prototype.clearHintPath = function () {

    this.isAmbiguous = 0;
    this.removeAnchor();

    //Remove the hint path svg elements
    this.svg.select("#hintPath").selectAll("text").remove();
    this.svg.select("#hintPath").selectAll("path").remove();
    this.svg.select("#hintPath").selectAll("circle").remove();

	//Re-set the transparency of faded out points
    this.svg.selectAll(".displayPoints").style("fill-opacity", 1);

    this.svg.selectAll(".interactionSliders").remove();
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
 * angle: the angle to orient the loop at
 * @return an array of all loop points and the year index in the format: [[x,y], etc.]
 * */
Scatterplot.prototype.calculateLoopPoints = function (x,y,angle){
    var loopPoints = [];
    var loopWidth = Math.PI/5; //Change this value to expand/shrink the width of the loop

    //The first point of the path should be the original point, as a reference for drawing the loop
    loopPoints.push([x,y]);

    //Generate some polar coordinates to complete the round part of the loop
    loopPoints.push([(x + this.loopRadius*Math.cos(angle+loopWidth)),(y+ this.loopRadius*Math.sin(angle+loopWidth))]);
    loopPoints.push([(x + this.loopRadius*Math.cos(angle)),(y+ this.loopRadius*Math.sin(angle))]);
    loopPoints.push([(x + this.loopRadius*Math.cos(angle-loopWidth)),(y+ this.loopRadius*Math.sin(angle-loopWidth))]);

   //The last point of the path should be the original point, as a reference for drawing the loop
   loopPoints.push([x,y]);
   return loopPoints;
}
//TODO: Could use this function to detect really close points to optimize label display
/** Search for ambiguous cases in a list of points.  Ambiguous cases are tagged as '1' and non-ambiguous are '0'.
 *  If ambiguous cases are found, draws loops.
 *  This function populates the following global array:
 *  this.ambiguousPoints:[[type,group]..total number of points on hint path], Group is an index indicating
 *  which group stationary points the point belongs to.
 *
 *  id: of the dragged point
 *  points: an array of points to search within for ambiguity
 * */
Scatterplot.prototype.checkAmbiguous = function (id,points){
    var j, currentPoint;
    var repeatedPoints = [];
    var foundIndex = -1;
    var groupNum = -1;

    //Clear and re-set the global arrays
    this.ambiguousPoints = [];
    //this.closePoints = [];
    for (j=0;j<=this.lastView;j++){
        this.ambiguousPoints[j] = [0];
        //this.closePoints[j] = [0];
    }

    //Populate the stationary and revisiting points array
    //Search for points that match in the x and y values (called "stationary points")
    for (j=0;j<=this.lastView;j++){
        currentPoint = points[j];
        for (var k=0;k<=this.lastView;k++){
            if (j!=k){
                if (points[k][0] == currentPoint[0] && points[k][1] == currentPoint[1]){ //A repeated point is found
                    if (Math.abs(k-j)==1){ //Stationary point
                        this.isAmbiguous = 1;
                        //Add this stationary point to repeatedPoints, according to it's x and y value
                        foundIndex = this.findInArray(currentPoint[0],currentPoint[1],repeatedPoints);
                        if (foundIndex==-1) {
                            groupNum++;
                            repeatedPoints.push([currentPoint[0],currentPoint[1]]);
                        }
                        this.ambiguousPoints[j] = [1,groupNum];
                       // this.closePoints[j] = [1];
                    }
                }
            }
        }
    }
    //Draw the interaction loop(s) (if any)
    if (this.isAmbiguous == 1){
        //TODO: automatically orient the loops such that they smoothly blend with the path
        //Manually add the orientation angles to the repeatedPoints array (later change this)
        //IMPORTANT: use the angle 0, instead of 360 (360 breaks the code..)
        repeatedPoints[0].push(Math.PI/6);
        repeatedPoints[1].push(Math.PI/6);
        return repeatedPoints;
    }else{
        return [];
    }
}
/** Search for x,y in a 2D array with the format: [[x,y]..number of points]
 *  x,y: the point to search for
 *  array: the array to search within
 *  @return -1 if no match is found, or the index of the found match
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
