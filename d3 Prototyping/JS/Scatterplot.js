/** Constructor for a scatterplot visualization
 * w: width of the graph
 * h: height of the graph
 * p: a padding value, to format the axes
*/
function Scatterplot(w, h,p) {
   // Position and size attributes for drawing the svg
   this.padding = p;
   this.width = w;
   this.height = h;
   this.pointRadius = 8;
   this.loopRadius = 40;
   this.xLabel ="";
   this.yLabel = "";
   this.graphTitle = "";
   this.hintPathType = 0;   
   
   this.loopCurrent = 0;
   this.loopNext = 1;

   // Create a variable to reference the main svg
   this.svg = null;
   this.numPoints = -1; //Set this later

   //Variables to track dragged point location within the hint path, all assigned values when the dataset is provided (in render())
   this.currentView = 0;
   this.nextView = 1;
   this.lastView = -1;  //The index of the last view of the dataset
   this.mouseX = -1; //Keep track of mouse coordinates for the dragend event
   this.mouseY = -1;
   this.interpValue = 0; //Stores the current interpolation value (percentage travelled) when a point is dragged between two views
   this.labels = []; //Stores the labels of the hint path
   this.ambiguousPoints = [];  //Keeps track of any points which are ambiguous when the hint path is rendered, by assigning the point a flag
   this.loops = []; //Stores points to draw for interaction loops (if any)
   this.timeDirection = 1; //Tracks the direction travelling over time

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
   this.hintPathGenerator =  d3.svg.line().interpolate("linear");

   this.clickedPoints = []; //Keeps track of which points to show labels for
      
   this.pointColour = "00A2E8";
   this.hintPathColour = "#aec7e8";

   this.hintPathPoints_flashlight = []; //For the flashlight hint path only, for keeping track of points currently visible on the hint path
}
 /** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
 *  will be drawn. Also, add a blur filter for the hint path effect.
 * */
Scatterplot.prototype.init = function() {

    this.svg = d3.select("#mainSvg")
        .append("g").attr("id","gScatterplot")
        .attr("transform", "translate(" + this.padding + "," + this.padding + ")");

    //Add the blur filter used for the hint path to the SVG so other elements can call it
    this.svg.append("svg:defs").append("svg:filter")
        .attr("id", "blur").append("svg:feGaussianBlur")
        .attr("stdDeviation", 2);

    //Add the blur filter for interaction loops
    this.svg.append("svg:defs").append("svg:filter")
        .attr("id", "blurLoop").append("svg:feGaussianBlur")
        .attr("stdDeviation", 1);

    //Add the blur filter for the partial hint path
    this.svg.append("svg:defs").append("svg:filter")
        .attr("id", "blur2").append("svg:feGaussianBlur")
        .attr("stdDeviation", 2);

    //Add the blur filter for the flashlight hint path
    this.svg.append("svg:defs").append("svg:filter")
        .attr("id", "blurFlashlight").append("svg:feGaussianBlur")
        .attr("stdDeviation", 2);
}
/** Render the visualization onto the svg
 * data: The dataset to be visualized
 * labels: A list of labels for the hint path, indicating all the different views of the visualization
 *
 * Data MUST be provided in the following array format:
 * n is the number of views (or number of labels on the hint path)
 * Object{"points":{[x,y],[x,y]...n},
 *        "label":"name of data point" (optional)
 *       }
 *       ..... number of data points
 * */
Scatterplot.prototype.render = function( data, labels,xLabel,yLabel,title) {
   var ref = this; //Reference variable
	//Save the parameters in global variables
   this.labels = labels;
   this.lastView = labels.length -1;
   this.numPoints = data.length;
   this.xLabel = xLabel;
   this.yLabel = yLabel;
   this.graphTitle = title;

     //Find the max and min values of the points, used to scale the axes and the dataset
     var max_x = d3.max(data.map(function (d){return d3.max(d.points.map(function (a){return a[0];}) ); }));
     var max_y = d3.max(data.map(function (d){return d3.max(d.points.map(function (a){return a[1];}) ); }));
    var min_y = d3.min(data.map(function (d){return d3.min(d.points.map(function (a){return a[1];}) ); }));

    //Create the scales by mapping the x,y to the svg size
    var xScale = d3.scale.linear().domain([0,max_x]).range([0,ref.width]);
    var yScale =  d3.scale.linear().domain([min_y, max_y]).range([ref.height,0]);
    //var yScale =  d3.scale.linear().domain([min_y, 50000000,max_y]).range([ref.height,ref.height/2,0]); //polylinear scale for the internet user dataset

    //Call the function which draws the axes
    this.drawAxes(xScale,yScale);

  // Set up the data for drawing the points according to the values in the data set
  this.svg.selectAll("circle")
     .data(data.map(function (d,i) {
              //Re-scale the points such that they are drawn within the svg container
              var scaledPoints = [];
              var interpolatedYears = [];
              for (var j=0;j< d.points.length;j++){
                  //Check for missing data, interpolate based on surrounding points
                  if (d.points[j][0]=="missing" || d.points[j][1]=="missing"){
                      var newPoint = ref.interpolateMissingPoint(d.points,j);
                      interpolatedYears.push(1);
                      scaledPoints[j] = [xScale(newPoint.x)+ref.padding,yScale(newPoint.y)];
                  }else{
                      interpolatedYears.push(0);
                      scaledPoints[j] = [xScale(d.points[j][0])+ref.padding,yScale(d.points[j][1])];
                  }
              }
	        return {nodes:scaledPoints,id:i,label:d.label,interpYears:interpolatedYears};
	  }))	
      .enter().append("g")
	  .attr("class","gDisplayPoints").attr("id",function (d){return "gDisplayPoints"+ d.id});
     
	 //Draw the data points
     this.svg.selectAll(".gDisplayPoints").append("svg:circle")
          .attr("cx", function(d) {return d.nodes[ref.currentView][0];})
          .attr("cy", function(d) {return d.nodes[ref.currentView][1]; })
          .attr("r", this.pointRadius).attr("class", "displayPoints")
          .attr("id", function (d){return "displayPoints"+d.id;})
         /** .attr("title", function (d) {return d.label;})*/
         .style("fill-opacity",1).style("stroke","#FFF").style("stroke-width",1)		
		.style("fill",this.pointColour).style("fill-opacity",1);

    //Append an empty g element to contain the hint path
    this.svg.append("g").attr("id","hintPath");
}
/**Interpolates the value for a year with missing data by using surrounding points
 * points: the array of all points over time
 * year: the year index of the missing data
 * */
Scatterplot.prototype.interpolateMissingPoint = function (points,year){
    var interpolator;
    if (year>0 && year < points.length-1){ //Not the first or last year
       interpolator = d3.interpolate({x:points[year-1][0],y:points[year-1][1]},
            {x:points[year+1][0],y:points[year+1][1]});
    }else{
        interpolator = d3.interpolate({x:0,y:0},  //TODO:deal with end points, this is just a placeholder
            {x:1,y:1});
    }
    return interpolator(0.5);
}
/** Draws the axes  and the graph title on the SVG
 *  xScale: a function defining the scale of the x-axis
 *  yScale: a function defining the scale of the y-axis
 * */
 Scatterplot.prototype.drawAxes = function (xScale,yScale){

    //Define functions to create the axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
        .tickSize(-this.height,0,0);
    var yAxis = d3.svg.axis().scale(yScale).orient("left")
        .tickSize(-this.width,0,0);

    // Add the title of the graph
     this.svg.append("text").attr("id", "graphTitle")
         .attr("class","axis").text(this.graphTitle)
         .attr("x",1).attr("y",-15);

    // Add the x-axis
    this.svg.append("g").attr("class", "axis")
        .attr("transform", "translate("+this.padding+"," + this.height + ")")
        .call(xAxis).selectAll("line").style("fill","none").style("stroke","#BDBDBD");

    // Add the y-axis
    this.svg.append("g").attr("class", "axis")
        .attr("transform", "translate("+ this.padding+ ",0)")
        .call(yAxis).selectAll("line").style("fill","none").style("stroke","#BDBDBD");

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
         .attr("id","anchor").attr("r",this.pointRadius).style("stroke","none")
		 .style("fill","none");
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
 *  mousex,y: the mouse coordinates
 *  nodes: the points along the hint path
 * */
Scatterplot.prototype.updateDraggedPoint = function(id,mouseX,mouseY,nodes) {
    if (this.hintPathType==1){
        this.updateDraggedPoint_flashlight(id,mouseX,mouseY,nodes);
        return;
    }
    var pt1_x = nodes[this.currentView][0];
    var pt2_x = nodes[this.nextView][0];
    var pt1_y = nodes[this.currentView][1];
    var pt2_y = nodes[this.nextView][1];
    var newPoint = [];

    if (this.isAmbiguous==1){ //Ambiguous cases exist on the hint path

        var currentPointInfo = this.ambiguousPoints[this.currentView];
        var nextPointInfo = this.ambiguousPoints[this.nextView];

        if (currentPointInfo[0]==1 && nextPointInfo[0] == 0){ //Approaching loop from left side of hint path (not on loop yet)
			this.loopCurrent = 3;
            this.loopNext = 4;
            newPoint = this.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
        }else if (currentPointInfo[0]==0 && nextPointInfo[0] == 1){ //Approaching loop from right side on hint path (not on loop yet)
            this.loopCurrent = 0;
            this.loopNext = 1;
            newPoint = this.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
        }else if (currentPointInfo[0]==1 && nextPointInfo[0] == 1){ //In middle of stationary point sequence
            this.dragAlongLoop(id,currentPointInfo[1],mouseX,mouseY);
            return;
        }else{
            newPoint = this.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
        }
    }else{ //No ambiguous cases exist
        newPoint = this.dragAlongPath(id,pt1_x,pt1_y,pt2_x,pt2_y);
    }

    var draggedPoint = this.svg.select("#displayPoints"+id);

    if (this.hintPathType==3){ //Combined hint path mode
        //Find the distance from mouse to the point along the path
        var distance = findPixelDistance(this.mouseX,this.mouseY,newPoint[0],newPoint[1]);
        if (distance >100){
            this.hintPathType = 1;
        }
        draggedPoint.style("fill-opacity",1-Math.abs(findPixelDistance(this.mouseX,this.mouseY,newPoint[0],newPoint[1])/100));
    }

    //Re-draw the dragged point
    draggedPoint.attr("cx",newPoint[0]).attr("cy",newPoint[1]);
    this.animatePointLabel(id,newPoint[0],newPoint[1]);

    //Save the mouse coordinates
    this.mouseX = mouseX;
    this.mouseY = mouseY;
}
/** Re-draws the dragged point according to the mouse position, changing the hint path
 * display according to the flashlight design
 *  id: The id of the dragged point, for selecting by id
 *  mousex,y: the mouse coordinates
 *  nodes: the points along the hint path
 * */
Scatterplot.prototype.updateDraggedPoint_flashlight = function(id,mouseX,mouseY,nodes){
  //TODO: ambiguity?
    if (this.hintPathType==3){ //Check if near the time line hint path, if using combined hint path mode

    }

    this.drawHintPath_flashlight([mouseX,mouseY],nodes);
    //Re-draw the dragged point
    this.svg.select("#displayPoints"+id).attr("cx",mouseX).attr("cy",mouseY);
    this.animatePointLabel(id,mouseX,mouseY);

    //Save the mouse coordinates
    this.mouseX = mouseX;
    this.mouseY = mouseY;
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
        if (this.hintPathType ==2){
          redrawPartialHintPath_line(this,this.ambiguousPoints);
        }
    }
    return newPoint;
}
/** Sets the time direction based on the interpolation amount, currently not needed for the interaction
 *  But can be used to log events.
 * @return: the new direction travelling in time
 * */
Scatterplot.prototype.findTimeDirection = function (interpAmount){
    var direction = (interpAmount > this.interpValue)? 1 : (interpAmount < this.interpValue)?-1 : this.timeDirection;

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
                return d3.interpolate(1,0.5)(interp);
            }else if (d.id == ref.nextView){ //Light to dark
                return d3.interpolate(0.5,1)(interp);
            }
            return 0.5;
        });
}
Scatterplot.prototype.dragAlongLoop = function (id,groupNumber,mouseX,mouseY){

    var loopData = this.svg.select("#loop"+groupNumber).data().map(function (d) {return [d.cx, d.cy,d.orientationAngle,d.points2,d.years]});   
    
	//var loopGenerator = d3.svg.line().interpolate("linear"); 
	//this.svg.select("#hintPath").append("path").attr("d",loopGenerator(loopData[0][3])).style("fill","none").style("stroke","#FFF");


	//d.points[0] = stationary point
	//d.points[1] = to the left of the stationary pt (forward path)
	//d.points[2..] = etc.. keep going counter clockwise
   // this.svg.append("circle").attr("cx",loopData[0][3][3][0]).attr("cy",loopData[0][3][3][1]).attr("r",10).style("fill","red");
	var loopPoints = loopData[0][3];
    var pt1_x = loopPoints[this.loopCurrent][0];
	var pt1_y = loopPoints[this.loopCurrent][1];
	var pt2_x = loopPoints[this.loopNext][0];
	var pt2_y = loopPoints[this.loopNext][1];

     var minDist = this.minDistancePoint(mouseX,mouseY,pt1_x,pt1_y,pt2_x,pt2_y);
     var newPoint = []; //The new point to draw on the line
     var t = minDist[2]; //To test whether or not the dragged point will pass pt1 or pt2

	  var angles = this.calculateMouseAngle(minDist[0],minDist[1],loopData[0][2],loopData[0][0],loopData[0][1]);
      var loopInterp = this.convertMouseToLoop_interp(angles[2]);
    
	//Get the loop's boundary years
	var startYear = loopData[0][4][0];	
	var endYear = loopData[0][4][loopData[0][4].length-1];
	
    if (t<0){ //Passed current on loop
        this.loopNext = this.loopCurrent;
        this.loopCurrent--;
        if (this.loopCurrent < 0){ //Check if the view was passed
           if(this.currentView > startYear){ //In the middle of the loop (2 is the border view)
                this.moveBackward();
                this.loopCurrent = 3;
                this.loopNext = 4;
           }else{ //Move back to the full hint path
               this.loopCurrent = 0;
               this.loopNext = 1;
               this.moveBackward();
           }
        }
        //console.log("backward"+this.loopCurrent+" "+this.loopNext+" views"+this.currentView+" "+this.nextView);
    }else if (t>1){ //Passed next on the loop
       this.loopCurrent = this.loopNext;
       this.loopNext++;
       if (this.loopCurrent > 3){ //Check if the view was passed
            if (this.nextView < endYear){ //Not at the border view
               this.loopCurrent = 0;
               this.loopNext = 1;
               this.moveForward();
            }else{
                this.loopCurrent = 3;
                this.loopNext = 4;
                this.moveForward();
            }
        }
        //console.log("forward"+this.loopCurrent+" "+this.loopNext+" views"+this.currentView+" "+this.nextView);
    }else{ //Some in between the views (pt1 and pt2), redraw the anchor and the view
        //this.svg.select("#anchor").attr("cx",minDist[0]).attr("cy",minDist[1]).style("stroke","#c7c7c7");       
        this.interpAmount = angles[2];
		this.timeDirection = this.findTimeDirection(this.interpAmount,id);
        this.interpolatePoints(id,this.interpAmount,this.currentView,this.nextView);
        this.interpolateLabelColour(this.interpAmount);
        if (this.hintPathType ==2){
            redrawPartialHintPath_line(this,this.ambiguousPoints,this.id);
        }
    }	
    this.redrawAnchor(loopInterp,groupNumber);
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
  var ref = this;
  this.svg.selectAll(".displayPoints").filter(function (d){return d.id!=id;})
      .each(function (d){
          var interpolator = d3.interpolate({x:d.nodes[startView][0],y:d.nodes[startView][1]},
              {x:d.nodes[endView][0],y:d.nodes[endView][1]}); //Function to linearly interpolate between points at current and next view
          var newPoint = interpolator(interpAmount);
          //Update the position of the point according to the interpolated point position
          d3.select(this).attr("cx",newPoint.x).attr("cy",newPoint.y);

          //Update the labels (if visible)
          if (ref.clickedPoints.indexOf(d.id)!=-1) ref.animatePointLabel(d.id,newPoint.x,newPoint.y);
      })
}
/**Re-draws a point label according to the specified position (new position of the point) by
 * updating its x and y attributes
 * @param id of the point label
 * @param x,y, new position of the label
 * */
Scatterplot.prototype.animatePointLabel = function (id,x,y){
    var ref = this;
    this.svg.select("#pointLabel"+id).attr("x", x).attr("y", y-ref.pointRadius);
}
/** Snaps to the nearest view once a dragged point is released
 *  Nearest view is the closest position (either current or next) to the
 *  most recent position of the dragged point. View tracking variables are
 *  updated according to which view is "snapped" to.
 *  id: The id of the dragged point
 *  points: All points along the hint path
 * */
Scatterplot.prototype.snapToView = function( id, points) {
    if (this.hintPathType==1){ //Snapping is different for flashlight hint path
        this.snapToView_flashlight(id,points);
        return;
    }
    var distanceCurrent,distanceNext;
    if (this.ambiguousPoints[this.currentView][0] == 1 && this.ambiguousPoints[this.nextView][0] == 1){ //Current and next are stationary points
       distanceCurrent = this.interpValue;
       distanceNext = 0.5;
    }else { //Non-ambiguous point
        //Calculate the distances from the dragged point to both current and next
        distanceCurrent = this.calculateDistance(this.mouseX,this.mouseY, points[this.currentView][0], points[this.currentView][1]);
        distanceNext = this.calculateDistance(this.mouseX,this.mouseY, points[this.nextView][0],points[this.nextView][1]);
    }

    //Based on the smaller distance, update the scatter plot to that view
    if (distanceCurrent > distanceNext && this.nextView <= this.lastView){ //Snapping to next view
		this.currentView = this.nextView;
	    this.nextView = this.nextView +1;
     }

    //Redraw the view
    this.redrawView(this.currentView);
}
/** Snaps to the nearest view once a dragged point is released
 *  Nearest view is the closest position
 *  id: The id of the dragged point
 *  points: All points along the hint path
 * */
Scatterplot.prototype.snapToView_flashlight = function (id,points){
    var minDist = Number.MAX_VALUE;
    var viewToSnapTo = -1;
    var currentPointIndex = -1;
    //TODO: might want to save the current positions visible on the hint path to avoid re-calculating all distances
     for (var i=0;i<this.hintPathPoints_flashlight.length;i++){
         currentPointIndex = this.hintPathPoints_flashlight[i];
         var currentDist = this.calculateDistance(points[currentPointIndex][0],points[currentPointIndex][1],this.mouseX,this.mouseY);
         if (currentDist<minDist) {
             minDist = currentDist;
             viewToSnapTo = currentPointIndex;
         }
     }
    if (viewToSnapTo<this.lastView){
        this.currentView = viewToSnapTo;
        this.nextView = this.currentView+1;
    }
    this.drawHintPath_flashlight(points[viewToSnapTo],points);
    this.redrawView(viewToSnapTo);
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

     if (this.hintPathType==1){ //Go directly to the year, when using flashlight path
         this.redrawView(endView);
         return;
     }

     if (startView == endView)return;
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
            ref.animatePointLabel(d.id, d.nodes[animateView][0], d.nodes[animateView][1]);
            //Re-colour the labels along the hint path (if a path is visible)
            if (d.id == id){
                d3.selectAll(".hintLabels").attr("fill-opacity",function (b){ return ((b.id==animateView)?1:0.5)});
            }
        };
    }
}
/** Redraws the scatterplot's point labels at the specified view
 *  view: the view to draw
 * */
Scatterplot.prototype.redrawPointLabels = function(view){
    var ref = this;
    this.svg.selectAll(".pointLabels").filter(function (d){return (ref.clickedPoints.indexOf(d.id)!=-1)})
        .attr("x",function (d){return d.nodes[view][0];})
        .attr("y",function (d){return d.nodes[view][1]-ref.pointRadius;});
}
/** Redraws the scatterplot at a specified view
 *  view: the view to draw
 *  NOTE: view tracking variables are not updated by this function
 * */
Scatterplot.prototype.redrawView = function(view) {
    /**if (this.hintPathType==2){ //Partial hint path
        hideSmallHintPath(this);
    }*/
    if (this.hintPathType==0){ //Trajectory
        this.hideAnchor();
        //Re-colour the hint path labels
        this.svg.selectAll(".hintLabels").attr("fill-opacity",function (d){ return ((d.id==view)?1:0.5)});
        this.svg.selectAll(".displayPoints")/**.transition().duration(300)*/
            .attr("cx",function (d){return d.nodes[view][0];})
            .attr("cy",function (d){return d.nodes[view][1];});

    }else if (this.hintPathType==1){ //Flashlight
        this.svg.selectAll(".displayPoints").transition().duration(300)
            .attr("cx",function (d){return d.nodes[view][0];})
            .attr("cy",function (d){return d.nodes[view][1];});
    }
    this.redrawPointLabels(view);
}
/** Called each time a new point is dragged.  Searches for ambiguous regions, and draws the hint path
 *  */
Scatterplot.prototype.selectPoint = function (point){
    //In case next view went out of bounds (from snapping to view), re-adjust the view variables
    var drawingView = adjustView(this);

    //First check for ambiguous cases in the hint path of the dragged point, then draw loops (if any)
    this.checkAmbiguous(point.id, point.nodes);

    if (this.isAmbiguous==1){
        this.appendAnchor();
    }

    if (this.hintPathType ==0){ //Trajectory path
        this.drawHintPath(drawingView, point.nodes, point.interpYears);
    }else if (this.hintPathType==1){ //Flashlight path
        this.drawHintPath_flashlight(point.nodes[drawingView],point.nodes);
    }else if (this.hintPathType==2){ //Partial hint path used in evaluation
        drawPartialHintPath_line(this,0, point.nodes);
        redrawPartialHintPath_line(this,this.ambiguousPoints);
    }else if (this.hintPathType==3){ //Combined
        this.drawHintPath(drawingView, point.nodes, point.interpYears);
    }

    if (this.clickedPoints.indexOf(point.id) ==-1) {
        this.clickedPoints.push(point.id);
        this.drawPointLabel(point.id);
    }
    var ref = this;
    //Fade out the other points using a transition
    this.svg.selectAll(".displayPoints").filter(function (d) {return (ref.clickedPoints.indexOf(d.id)==-1)})
        .transition().duration(300).style("fill-opacity", 0.3);//.style("stroke-opacity",0.3);
}
/** Draws a label at the top of the selected point
 * */
//TODO: draw a line from the corner of the label to the point
 Scatterplot.prototype.drawPointLabel = function (id){
    var ref = this;
    //Add labels to the points
    var gElement = this.svg.select("#gDisplayPoints"+id);
    gElement.append("text")
        .attr("x", function(d) {return d.nodes[ref.currentView][0];})
        .attr("y", function(d) {return d.nodes[ref.currentView][1]-ref.pointRadius; })
        .attr("class","pointLabels").attr("id",function (d){return "pointLabel"+ d.id})
        .text(function (d){return d.label;});

    /**var bbox =  this.svg.select("#pointLabel"+id).node().getBBox();
    var padding = 2;

    gElement.append("rect").attr("x", bbox.x-padding).attr("y", bbox.y-padding)
        .attr("height",bbox.height+padding*2).attr("width",bbox.width+padding*2)
        .attr("rx",5).attr("ry",5)
        .attr("class","pointLabels").style("fill","#EDEDED").style("fill-opacity",0.3)
        .style("stroke","#EDEDED").style("stroke-opacity",1);*/
}
/** Displays a trajectory hint path by appending its svg components to the main svg
 *  view: view to draw at
 *  points: all points along the hint path
 *  interpPts: points that have been interpolated (missing data)
 * */
 Scatterplot.prototype.drawHintPath = function (view,points,interpPts){
     var ref = this;
    //Draw the hint path labels, reposition any which are in a stationary sequence
    var adjustedPoints = this.placeLabels(points);

     this.svg.select("#hintPath").selectAll("text")
       .data(adjustedPoints.map(function (d,i) {
            return {x:d[0]+ ref.pointRadius,y:d[1]+ ref.pointRadius,id:i}
        })).enter().append("svg:text")
        .text(function(d,i) {
             if (interpPts[i]==1) return "";  //Don't show the labels of interpolated years
             return ref.labels[d.id];
         }).attr("x", function(d) {return d.x;})
        .attr("y", function (d) {  return d.y; })
        .attr("class","hintLabels")
        .attr("fill-opacity",function (d){ return ((d.id==view)?1:0.5)})
        .attr("id",function (d){return "hintLabels"+ d.id})
		.style("font-family","sans-serif").style("font-size","10px").style("text-anchor","middle")
		.style("fill","#666").on("click", this.clickHintLabelFunction);

    //Render the hint path line
    this.svg.select("#hintPath").append("svg:path")
        .attr("d",  this.hintPathGenerator(points))
        .attr("id","path").attr("filter", "url(#blur)")
		.style("fill","none").style("stroke-width",1.5).style("stroke",this.pointColour);
}
/** Re-draws a flashlight style hint path as the point is dragged
 *  currentPosition: position of the dragged point
 *  points: all points along the hint path
 * */
Scatterplot.prototype.drawHintPath_flashlight = function (currentPosition,points){
    this.svg.select("#hintPath").selectAll(".hintLabels").remove();
    this.svg.select("#hintPath").selectAll("path").remove();
    this.hintPathPoints_flashlight = [];

    //TODO: ambiguity?
    //var currentPosition = points[view];
    var distances = [];
    for (var i=0;i<points.length;i++){ //Grab the closest n points to the current position
          distances.push([this.calculateDistance(currentPosition[0],currentPosition[1],points[i][0],points[i][1]),i]);
    }
    distances.sort(function(a,b){return a[0]-b[0]}); //Sort ascending
    var maxDistance = distances[4][0]; //For scaling the transparency

    var pathPoints = [];
    var ref = this;
    for (var i=0;i<4;i++){ //Start at 1, we know the zero distance will be the first element in the sorted array
        pathPoints.push(points[distances[i][1]]);
        var pointIndex = distances[i][1];
        this.svg.select("#hintPath").append("svg:path")
            .attr("d",  this.hintPathGenerator([points[pointIndex],currentPosition]))
            .attr("id","path").attr("filter", "url(#blurFlashlight)").attr("opacity",Math.abs(1-distances[i][0]/maxDistance))
            .style("fill","none").style("stroke-width",1).style("stroke",this.pointColour);
        this.hintPathPoints_flashlight.push(pointIndex);
    }

    //Draw the hint path labels
    this.svg.select("#hintPath").selectAll("text").data(pathPoints.map(function (d,i){
        return {x:d[0],y:d[1],id:ref.hintPathPoints_flashlight[i],id2:i}
    })).enter().append("text").text(function (d){return ref.labels[d.id]}).attr("x", function(d) {return d.x;})
        .attr("y", function (d) {  return d.y; }).attr("class","hintLabels")
        .attr("fill-opacity",function (d) {return Math.abs(1-distances[d.id2][0]/maxDistance)})
        .attr("id",function (d){return "hintLabels"+ d.id})
        .style("font-family","sans-serif").style("font-size","10px").style("text-anchor","middle")
        .style("fill","#666").on("click", this.clickHintLabelFunction);
}
/**This function places labels in ambiguous cases such that they do not overlap
 * points: a 2D array of positions of each label [x,y]...
 * */
Scatterplot.prototype.placeLabels = function (points){
  if (this.isAmbiguous == 0){return points} //No ambiguous cases, don't need to adjust the points

  var ref = this;
  var offset = -1;
  var indexCounter = -1;
  var x = 0;
  var y = 0;
  var adjustedPoints = points.map(function (d,i){
      if (ref.ambiguousPoints[i][0] == 1 /**|| ref.ambiguousPoints[i][0] == 2*/){
          if (ref.ambiguousPoints[i][1] != offset){
              indexCounter = -1;
              offset = ref.ambiguousPoints[i][1];
              x= d[0];
              y = d[1];
          }
          indexCounter++;
          return [x + 25*indexCounter,y-10];
      }
      return [d[0],d[1]];
  });
  return adjustedPoints;
}
/**This function places labels in ambiguous cases for a flashlight hint path, aligned vertically and equally spaced
 * points: a 2D array of positions of each label [x,y]...
 * */
Scatterplot.prototype.placeLabels_flashlight= function (points){
    if (this.isAmbiguous == 0){return points} //No ambiguous cases, don't need to adjust the points

    var ref = this;
    var offset = -1;
    var indexCounter = -1;
    var x = 0;
    var y = 0;
    var adjustedPoints = points.map(function (d,i){
        if (ref.ambiguousPoints[i][0] == 1 /**|| ref.ambiguousPoints[i][0] == 2*/){
            if (ref.ambiguousPoints[i][1] != offset){
                indexCounter = -1;
                offset = ref.ambiguousPoints[i][1];
                x= d[0];
                y = d[1];
            }
            indexCounter++;
            return [x ,y+ 25*indexCounter];
        }
        return [d[0],d[1]];
    });
    return adjustedPoints;
}
/** Draws interaction loops as svg paths onto the hint path (if point has stationary cases)
 *  id: of the dragged point
 * */
 Scatterplot.prototype.drawLoops = function (id,points){
    //Create a function for drawing a loop around a stationary point, as an interaction path
    var loopGenerator = d3.svg.line().tension(0).interpolate("basis-closed"); //Closed B-spline
    var ref = this;

   //Draw all loops at their respective stationary points
    this.svg.select("#hintPath").selectAll(".loops")
        .data(points.map(function (d,i){
            var loopPoints = [];
            loopPoints = ref.calculateLoopPoints(d[0],d[1],d[2]);
            var x = d[0] + (ref.loopRadius/2)*Math.cos(d[2]);
            var y = d[1] + (ref.loopRadius/2)*Math.sin(d[2]);
			var repeatedYears = [];
			for (var j=0;j<ref.ambiguousPoints.length;j++){
			    if (ref.ambiguousPoints[j][0] == 1 && ref.ambiguousPoints[j][1] == i){
				    repeatedYears.push(j);
				}
			}
            return {points:loopPoints[0],id:i,orientationAngle:d[2],cx:x,cy:y,points2:loopPoints[1],years:repeatedYears};
        }))
        .enter().append("path").attr("class","loops")
        .attr("d",function (d){return loopGenerator(d.points);})
        .attr("id",function (d,i){return "loop"+i;})
		.style("fill","none").style("stroke","#666").style("stroke-dasharray","3,3")
        .attr("filter", "url(#blurLoop)");
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
}
/**Clears the point labels when the background is clicked
 * */
Scatterplot.prototype.clearPointLabels = function (){
    this.svg.selectAll(".pointLabels").remove();
    this.clickedPoints = [];
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
   var drawingPoints = [];
    var loopWidth = Math.PI/5; //Change this value to expand/shrink the width of the loop

    //The first point of the path should be the original point, as a reference for drawing the loop
    drawingPoints.push([x,y]);

    //Generate some polar coordinates to complete the round part of the loop
    drawingPoints.push([(x + this.loopRadius*Math.cos(angle+loopWidth)),(y+ this.loopRadius*Math.sin(angle+loopWidth))]);
    drawingPoints.push([(x + this.loopRadius*Math.cos(angle)),(y+ this.loopRadius*Math.sin(angle))]);
    drawingPoints.push([(x + this.loopRadius*Math.cos(angle-loopWidth)),(y+ this.loopRadius*Math.sin(angle-loopWidth))]);

   //The last point of the path should be the original point, as a reference for drawing the loop
   drawingPoints.push([x,y]);
   
   //Hack here!!!- another set of points for handling dragging around loops
	var loopPoints = [];
	loopWidth = Math.PI/7; //Change this value to expand/shrink the width of the loop
    var adjustedRadius = this.loopRadius - 10;
	//The first point of the path should be the original point, as a reference for drawing the loop
	loopPoints.push([x,y]);

    //TODO: automatically assign dragging direction to loops
	//Generate some polar coordinates to complete the round part of the loop
	//HACK: use this when dragging segways to the left
	/**loopPoints.push([(x + adjustedRadius*Math.cos(angle+loopWidth)),(y+ adjustedRadius*Math.sin(angle+loopWidth))]);
	loopPoints.push([(x + adjustedRadius*Math.cos(angle)),(y+ adjustedRadius*Math.sin(angle))]);
	loopPoints.push([(x + adjustedRadius*Math.cos(angle-loopWidth)),(y+ adjustedRadius*Math.sin(angle-loopWidth))]);*/
    
	//HACK: use this point order when dragging segways right
	loopPoints.push([(x + adjustedRadius*Math.cos(angle-loopWidth)),(y+ adjustedRadius*Math.sin(angle-loopWidth))]);
	loopPoints.push([(x + adjustedRadius*Math.cos(angle)),(y+ adjustedRadius*Math.sin(angle))]);
	loopPoints.push([(x + adjustedRadius*Math.cos(angle+loopWidth)),(y+ adjustedRadius*Math.sin(angle+loopWidth))]);
	
	//The last point of the path should be the original point, as a reference for drawing the loop
	loopPoints.push([x,y]);
   
   return [drawingPoints,loopPoints];
}
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
    var groupNum = 0;

    //Clear and re-set the global arrays
    this.ambiguousPoints = [];
    //this.closePoints = [];
    for (j=0;j<=this.lastView;j++){
        this.ambiguousPoints[j] = [0];
        //this.closePoints[j] = [0];
    }
    var savedIndex= -1;
    //Populate the stationary and revisiting points array
    //Search for points that match in the x and y values (called "stationary points")
    for (j=0;j<=this.lastView;j++){
        currentPoint = points[j];
        for (var k=0;k<=this.lastView;k++){
            if (j!=k){
                var distance = findPixelDistance(points[k][0],points[k][1],currentPoint[0],currentPoint[1]);
                if ((points[k][0] == currentPoint[0] && points[k][1] == currentPoint[1])||(distance<=10)){ //A repeated point is found
                    if (Math.abs(k-j)==1){ //Stationary point
                        this.isAmbiguous = 1;
                        if (Math.abs(savedIndex-j)>1 && savedIndex!=-1){
                            groupNum++;
                        }
                        this.ambiguousPoints[j] = [1,groupNum];
                        savedIndex = j;
                    }/**else{ //Found a revisiting point
                        if (this.ambiguousPoints[j][0] ==0){ //Don't want to overwrite a stationary point
                            this.ambiguousPoints[j] = [2,groupNum];
                        }
                    }*/
                }
            }
        }
    }   //Draw the interaction loop(s) (if any)
    if (this.isAmbiguous == 1){
        //TODO: automatically orient the loops such that they blend with the path
        var currentGroupNum = -1;
        for (var i=0;i<this.ambiguousPoints.length;i++){
            if (this.ambiguousPoints[i].length>1){
                if (this.ambiguousPoints[i][1]!=currentGroupNum){
                    repeatedPoints.push([points[i][0],points[i][1],Math.PI*3/2]);
                }
                currentGroupNum = this.ambiguousPoints[i][1];
            }
        }
        this.drawLoops(id,repeatedPoints);
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