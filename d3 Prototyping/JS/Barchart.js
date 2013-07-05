/** Constructor for a barchart visualization
 * x: the left margin
 * y: the right margin
 * h: height of the svg container
 * bw: width of the bars
 * id: id of the div tag to append the svg container
 * p: a padding value, to format the axes
 * xLabel: label for the x-axis
 * yLabel: label for the y-axis
 * title: of the graph
 * hLabels: A list of labels for the hint path, indicating all the different views of the visualization
 */
 function Barchart(h,bw,x,y,id,p,xLabel,yLabel,title,hLabels){
   //Position and size attributes for drawing the svg
   this.leftMargin = x;
   this.topMargin = y;
   this.id = id;
   this.padding = p;
   this.xLabel = xLabel;
   this.yLabel = yLabel;
   this.graphTitle = title;
   this.xLabels = []; //To store the labels along the x-axis
   this.hintLabels = hLabels;

   //Set up some display properties
   this.svg = null; //Reference to svg container
   this.barWidth = bw;
   this.numBars = 0; //Set later
   this.strokeWidth=5;
   this.width = 0; //Set later
   this.height = h;
   this.hintPathSpacing = 40; //Amount of horizontal distance between labels on hint path
   this.amplitude = 15; //Of the interaction path sine wave
   this.base = h-5; //Starting y-position of all bars (the base)
   this.pathData = [];  //Stores the x,y values for drawing the hint path

   //View index tracker variables
   this.currentView = 0; //Starting view of the bars (first year)  
   this.nextView = 1; //Next view of the barchart
   this.lastView = hLabels.length-1; //Index of the last view on the hint path

   this.interpValue=0; //For estimating the time direction and update the barchart view
   this.mouseY = -1;
   this.previousDragDirection = 1; //Saves the vertical dragging direction of the user
   this.previousHintPathDirection = 1; //Saves the direction of the hint path (going up or down)

   this.ambiguousBars = [];
   this.interactionPaths = [];
   this.pathDirection = -1; //Directon travelling along an interaction path
   this.timeDirection = 1; //Keeps track of the direction travelling over time 
   this.passedMiddle = -1; //Passed the mid point of the peak of the sine wave
   this.peakValue = null; //The y-value of the sine wave's peak (or trough)
     
   //Set up some event functions, all declared in main.js
   this.placeholder = function() {};
   this.clickHintLabelFunction = this.placeholder;
   this.clickSVG = this.placeholder();
   this.dragEvent = null;
   this.draggedBar = -1;

   //Function for drawing a linearly interpolated line (the hint path)
   this.hintPathGenerator = d3.svg.line().interpolate("linear");
   //Function for drawing a sine wave
   this.interactionPathGenerator = d3.svg.line().interpolate("monotone");
   //Interpolate function between two values, at the specified amount
   this.interpolator = function (a,b,amount) {return d3.interpolate(a,b)(amount)};
}
/** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
 *  will be drawn. Also, add a blur filter for the hint path effect.
 * */
Barchart.prototype.init = function(){
    //Draw the main svg
   this.svg = d3.select(this.id).append("svg")
       .attr("id","mainSvg")
       .attr("width", this.width)
      .attr("height", this.height+(this.padding*2))  
      .style("position", "absolute")
      .style("left", this.leftMargin + "px")
      .style("top", this.topMargin + "px")
      .on("click",this.clickSVG)
      .append("g")
	  .attr("transform", "translate(" + this.padding + "," + this.padding + ")");
     //Add the blur filter to the SVG so other elements can call it
    this.svg.append("svg:defs")
         .append("svg:filter")
         .attr("id", "blur")
         .append("svg:feGaussianBlur")
         .attr("stdDeviation", 5);

 }
/** Render the visualization onto the svg
 * data: The dataset to be visualized
 * start: The starting view of the visualization, as an index into the labels array
 *
 * Data MUST be provided in the following array format:
 * n is the number of views (or number of labels on the hint path)
 * Object{"heights":{h1,h2...hn},
 *        "label":"name of data bar" (to appear on the x-axis)
 *       }
 *       ..... number of bars
 * */
 Barchart.prototype.render = function(data,start){
      var ref = this;
    //Save some values and set the width of the svg (based on number of bars)
     this.numBars = data.length;
     this.width = (this.barWidth+this.strokeWidth)*this.numBars;
     d3.select(this.id).select("#mainSvg").attr("width",this.width+(this.padding*2));

     //Resolve the index value for the next view (e.g., if currentView is 0, then nextView should be set to 1)
     this.currentView = start;
     if (this.currentView ==0){
         this.nextView = this.currentView+1;
     }else if (this.currentView == this.lastView){
         this.nextView = this.currentView;
         this.currentView = this.currentView -1;
     }else {
         this.nextView = this.currentView + 1;
     }
     //Find the max value of the heights, used to scale the axes and the dataset
     var max_h = d3.max(data.map(function (d){return d3.max(d.heights);}));
     //Create the scales
	 var xScale = d3.scale.linear().domain([0,ref.numBars]).range([0,ref.width]);   
     var yScale =  d3.scale.linear().domain([0, max_h]).range([0,ref.height]);

//Assign data values to a set of rectangles representing the bars of the chart
this.svg.selectAll("rect")
    .data(data.map(function (d,i) {
            //Need to adjust the dataset to contain y-positions and heights
            //Array format is: data[viewIndex] = [y of top of bar, height of bar]
            var data = [];
            for (var j=0;j< d.heights.length;j++){
               data[j] = [ref.base - yScale(d.heights[j]),yScale(d.heights[j])];
            }
	        return {nodes:data,id:i,label:d.label,xPos:xScale(i)+ref.padding+ref.strokeWidth};
	  }))
     .enter().append("g").attr("class","gDisplayBars")
	 .attr("id", function (d){return "gDisplayBars"+d.id;});

   //Save the labels for the x-axis
   this.xLabels = this.svg.selectAll(".gDisplayBars").data().map(function (d){return d.label});
   //Draw the axes
   this.drawAxes(xScale,yScale);

  //Draw the bars
   this.svg.selectAll(".gDisplayBars")
     .append("rect")
     .attr("x", function(d){return d.xPos;})
     .attr("y", function(d){ return d.nodes[ref.currentView][0];})
     .attr("width", this.barWidth)
     .attr("height", function(d) {return d.nodes[ref.currentView][1]; })
	 .attr("class", "displayBars")
	 .attr("id", function (d){return "displayBars"+d.id;});

	//Add a blank g element to contain the hint path
    this.svg.append("g").attr("id","hintPath");
 }
/** Draws the axes  and the graph title on the SVG
 *  xScale: a function defining the scale of the x-axis
 *  yScale: a function defining the scale of the y-axis
 * */
Barchart.prototype.drawAxes = function (xScale,yScale){
    var ref = this;
    //Define the axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    // Add the title of the graph
    this.svg.append("text")
        .attr("id", "graphTitle")
        .text(this.graphTitle)
        .attr("x",1).attr("y",-15);

    // Add the x-axis label
    this.svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", this.width+this.padding)
        .attr("y", this.height+this.padding-3)
        .text(this.xLabel);

    // Add the y-axis label
    this.svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", 6)
        .attr("transform", "rotate(-90)")
        .text(this.yLabel);

    // Add the y-axis
    this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+ this.padding+ ",0)")
        .call(yAxis);

    //Add the x-axis
    this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+this.padding+"," + this.height + ")")
        .call(xAxis)
        .selectAll("text")
        .text(function (d) {return ref.xLabels[d];})
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)");
}
/** Re-draws the dragged bar by altering it's height according to the dragging amount.
 *  As the bar is dragged, the view variables are updated and the rest
 *  of the bars are animated by calling handleDraggedBar()
 *  id: The id of the dragged bar, for selecting by id
 *  mouseY: The y-coordinate of the mouse, received from the drag event
 *
 *  Recall: the base of every bar is at this.base, therefore top of the bar is this.base-barHeight
 * */
//TODO: detect revisiting cases and use time inference to alleviate interaction
 Barchart.prototype.updateDraggedBar = function (id,mouseY,mouseX){
     var ref = this;
    //Re-draw the bars according to the dragging amount
    this.svg.select("#displayBars"+id).each(function (d) {

         var currentY =  d.nodes[ref.currentView][0];
         var nextY = d.nodes[ref.nextView][0];
         var currentHeight =  d.nodes[ref.currentView][1];
         var nextHeight = d.nodes[ref.nextView][1];
         var newValues = []; //Will contain the new height and y-position:[y,h] of the dragged bar

        if (ref.isAmbiguous ==1){ //At least one stationary sequence exists somewhere on the hint path
            var currentAmbiguous = ref.ambiguousBars[ref.currentView][0];
            var nextAmbiguous = ref.ambiguousBars[ref.nextView][0];
            //Check for stationary bar sequences
            if (currentAmbiguous == 1 && nextAmbiguous ==0){ //Approaching the stationary points from right (along hint path)
                ref.pathDirection = ref.ambiguousBars[ref.currentView][1];
                console.log(ref.pathDirection+" "+ref.timeDirection);
                ref.passedMiddle = 0;
                ref.peakValue = (ref.pathDirection==1)?(currentY-ref.amplitude):(ref.amplitude+currentY);
                newValues = ref.handleDraggedBar(currentY,nextY,currentHeight,nextHeight,mouseY,id);
            }else if (currentAmbiguous == 0 && nextAmbiguous==1){ //Approaching the stationary points from left (along hint path)
                ref.pathDirection = -1; //Sine wave always starts with a trough
                ref.passedMiddle = 0;
                ref.peakValue = (ref.pathDirection==1)?(nextY-ref.amplitude):(ref.amplitude+nextY);
                newValues = ref.handleDraggedBar(currentY,nextY,currentHeight,nextHeight,mouseY,id);
            }else if (currentAmbiguous==1 && nextAmbiguous==1){ //In middle of sequence
                ref.handleDraggedBar_stationary(currentY,mouseY,mouseX,id);
                newValues = [currentY,currentHeight];
            }else{ //No stationary case to handle right now
                newValues = ref.handleDraggedBar(currentY,nextY,currentHeight,nextHeight,mouseY,id);
            }

        }else { //No stationary ambiguous cases exist
            newValues = ref.handleDraggedBar(currentY,nextY,currentHeight,nextHeight,mouseY,id);
        }

        //Save the mouse y-coordinate
        ref.mouseY = mouseY;

        //Re-draw the dragged bar
        ref.svg.select("#displayBars"+id).attr("y",newValues[0]).attr("height",newValues[1]);
     });
}
/** Updates the view variables to move the visualization forward
 * (passing the next view)
 * */
Barchart.prototype.moveForward = function (){
    if (this.nextView < this.lastView){ //Avoid index out of bounds
        this.currentView = this.nextView;
        this.nextView++;
    }   
}
/** Updates the view variables to move the visualization backward
 * (passing the current view)
 * */
Barchart.prototype.moveBackward = function (){
    if (this.currentView > 0){ //Avoid index out of bounds
        this.nextView = this.currentView;
        this.currentView--;
    }
}
/** Appends an anchor to the svg, if there isn't already one
 *  x,y: the position of the anchor
 * */
Barchart.prototype.appendAnchor = function (x,y){
    var ref = this;
    if (this.svg.select("#anchor").empty()){
        //this.svg.select("#hintPath").append("circle").attr("cx", x+this.barWidth/2).attr("cy", y).attr("r",5).attr("id","anchor");
        this.svg.select("#hintPath").append("path").datum([[x+ref.barWidth/2,y]])
            .attr("d", ref.hintPathGenerator).attr("id","anchor");
    }
}
/** Removes an anchor from the svg, if one is appended
 * */
Barchart.prototype.removeAnchor = function (){
    if (!this.svg.select("#anchor").empty()){
        this.svg.select("#anchor").remove();
    }
}
/** Resolves a dragging interaction by comparing the current mouse position with the bounding
 *  y positions of current and next views.  Ensures the mouse dragging does not cause the dragged
 *  bar to be drawn out of bounds and keeps track of time progression by updating the view variables
 *  when a view is switched.
 *  currentY, nextY: The y-positions of the bar in current and next views
 *  currentHeight, nextHeight: the heights of the bar in current and next views
 *  mouseY: the mouse's vertical dragging amount
 *  id: of the dragged bar
 *  @return: [newY,newHeight], values used to update the drawing of the dragged bar
 * */
Barchart.prototype.handleDraggedBar = function (currentY,nextY,currentHeight,nextHeight,mouseY,id){
    var newValues = [];
    //Determine the direction of the path (up or down)
    var hintPathDirection = (currentY > nextY) ? 1:-1;

    //Find the current vertical dragging direction of the user
    var draggingDirection = mouseY>this.mouseY ? -1:1;
    //console.log("hint path dir: "+hintPathDirection+" mouse dir: "+draggingDirection+" current view "+this.currentView+" next view "+this.nextView+" interp "+this.interpValue);
    //Resolve the bounds
    var bounds = this.checkBounds(currentY,nextY,mouseY);

    //Update the view based on where the mouse is w.r.t the view boundaries
    if (bounds == mouseY){	    
	    this.findInterpolation(currentY,nextY,mouseY,0); 		
        this.interpolateBars(id,this.interpValue,this.currentView,this.nextView);
        this.animateHintPath(this.interpValue);
        this.previousHintPathDirection = hintPathDirection;
        newValues = [mouseY,this.findHeight(currentHeight,mouseY,currentY)];
    }else if (bounds == currentY ){ //Passing current
        if (hintPathDirection != this.previousHintPathDirection){
            this.inferTimeDirection(currentY,nextY,mouseY,draggingDirection,hintPathDirection);
        }else{
            this.moveBackward();
            this.previousHintPathDirection = hintPathDirection;
        }
        newValues = [currentY,currentHeight];
    }else{ //Passing next
        if (hintPathDirection != this.previousHintPathDirection){
            this.inferTimeDirection(nextY,currentY,mouseY,draggingDirection,hintPathDirection);
        }else{
            this.moveForward();
            this.previousHintPathDirection = hintPathDirection;
        }
        newValues = [nextY,nextHeight];
    }

    //Save the dragging direction
    this.previousDragDirection = draggingDirection;

    return newValues;
}
/**Infers the time direction when user arrives at corners, inference is based on previous direction
 * travelling over time.  The views are updated (forward or backward) whenever the dragging direction
 * changes.
 * b1,b2: the boundary views (b1 should be the currently encountered corner)
 * mouseY: dragging position of the mouse
 * draggingDirection: of the user, 1 if dragging clockwise, -1 is counter-clockwise
 * hintPathDirection: of the path, 1 if up, -1 if down, saves this value in a global variable only once the view changes
 * */
Barchart.prototype.inferTimeDirection = function (b1,b2,mouseY,draggingDirection,hintPathDirection){
//console.log(draggingDirection+" "+this.previousDragDirection+" "+this.timeDirection);
    if (b1 > b2){ //Dragging needs to switch 1 -> -1 in order for view to change
        if (mouseY>=b1 && draggingDirection==-1 && this.previousDragDirection==1){
            if (this.timeDirection ==1){this.moveForward();}
            else{this.moveBackward();}
            this.previousHintPathDirection = hintPathDirection;
        }
    }else{//Dragging needs to switch -1 -> 1 in order for the view to change
        if (mouseY<=b1 && draggingDirection==1 && this.previousDragDirection==-1){
            if (this.timeDirection ==1){this.moveForward();}
            else{this.moveBackward();}
            this.previousHintPathDirection = hintPathDirection;
        }
    }
}
/** Resolves a dragging interaction in a similar method as handleDraggedBar, except
 *  this function is only called when in the middle of a stationary sequence of bars.
 *  barY: The y-position of the stationary bar  
 *  mouseY, mouseX: coordinates of the mouse
 *  id: of the dragged bar
 * */
Barchart.prototype.handleDraggedBar_stationary = function (barY,mouseY,mouseX,id){

    var bounds = this.checkBounds(this.peakValue,barY,mouseY);
	var newY; //To re-position the anchor
	//console.log(barY+" "+mouseY+" "+this.peakValue);
	if (bounds == mouseY){
		 this.findInterpolation(barY,this.peakValue, mouseY, 1);
		 this.interpolateBars(id,this.interpValue,this.currentView,this.nextView);
         this.animateHintPath(this.interpValue);
		 //console.log("time direction: "+this.timeDirection+" "+this.interpValue);
		 newY = mouseY;               
    }else if (bounds == this.peakValue){ //At boundary
		 if (this.timeDirection ==1){this.passedMiddle = 1}
		 else {this.passedMiddle =0;}
		 newY = this.peakValue;
    }else{ //At base
		 //Update the view
		 if (this.timeDirection ==1){
			 this.moveForward();
			 this.passedMiddle = 0;
		 }
		 else{
			 this.moveBackward();
			 this.passedMiddle = 1;
		 }
		this.pathDirection = (this.pathDirection==1)?-1:1;
        this.peakValue = (this.pathDirection==1)?(barY-this.amplitude):(this.amplitude+barY);
		//console.log(this.currentView+" "+this.nextView);
		newY=barY;
     }

    var ref = this;
   //d3.select("#anchor").attr("d",function (d) {return ref.hintPathGenerator([[d[0][0],d[0][1]],[d[0][0],newY]]);}); //Re-draw anchor (line attached to bar)
    d3.select("#anchor").attr("d",function (d) {return ref.hintPathGenerator([[mouseX,mouseY],[d[0][0],newY]]);}); //Re-draw anchor
}
/**Computes the new height of a bar based on a new y-position
 * oldHeight: the original height of the bar
 * newYPos: the new y-position of the bar
 * oldYPos: the old y-position of the bar
 * @return the new height
 * */
Barchart.prototype.findHeight = function (oldHeight,newYPos,oldYPos){
    var yDiff = Math.abs(newYPos - this.base);
    var yDirection = 1;
    if (newYPos > oldYPos) yDirection = -1; //Moving down
    return (oldHeight + yDirection*Math.abs(yDiff - oldHeight));
}
/** Checks if the mouse is in bounds defined by h1 and h2
 *  h1,h2: the bounds
 *  mouseY: the mouse position
 *  @return start,end: boundary values are returned if the given
 *                     mouse position is equal to or has crossed it
 *          mouseY: The mouse value, if in bounds
 * */
Barchart.prototype.checkBounds = function(h1,h2,mouseY){
   //Resolve the boundaries for comparison, start is lower value, end is higher 
    var start,end;
	if (h1>h2){
        end = h1;
        start =h2;
	}else{
        start = h1;
        end = h2;
	}
	//console.log("my "+mouseY+"start "+start+" end "+end);
	//Check if the mouse is between start and end values
	if (mouseY <= start) {
        if (this.timeDirection == -1) {this.interpValue = 1; }
        else{this.interpValue = 0;}
        return start;
    }else if (mouseY >=end) {
        if (this.timeDirection == -1) {this.interpValue = 1; }
        else{this.interpValue = 0;}
        return end;
    }     
	
	return mouseY;
}
/** Calculates the interpolation amount  (percentage travelled) of the mouse, between views.
*   Uses the interpolation amount to find the direction travelling over time and saves it
*   in the global variable.
*   b1,b2: y-position of boundary values (mouse is currently in between)
*   mouse: y-position of the mouse
*   ambiguity: a flag, = 1, stationary case (interpolation split by the peak on the sine wave)
*                      = 0, normal case
*/
Barchart.prototype.findInterpolation  = function (b1,b2,mouseY,ambiguity){
   var distanceTravelled, currentInterpValue;
   var total = Math.abs(b2 - b1);
   //Calculate the new interpolation amount
   if (ambiguity == 0){
		distanceTravelled = Math.abs(mouseY-b1);		
		currentInterpValue = distanceTravelled/total;
	}else{
	    if (this.passedMiddle ==0 ){ //Needs to be re-mapped to lie between [0,0.5] (towards the peak/trough)
         distanceTravelled = Math.abs(mouseY - b1);
         currentInterpValue = distanceTravelled/(total*2);
		}else{ //Needs to be re-mapped to lie between [0.5,1] (passed the peak/trough)
	      distanceTravelled = Math.abs(mouseY - b2);
		  currentInterpValue = (distanceTravelled+total)/(total*2);
		}
	}	
	//Set the direction travelling over time (1: forward, -1: backward)
    this.timeDirection = (currentInterpValue > this.interpValue) ? 1:-1;

	//console.log(this.timeDirection+" "+this.interpValue+" "+currentInterpValue);
    //Save the current interpolation value
    this.interpValue = currentInterpValue;
}
/** Animates the hint path by horizontally translating it according to the vertical
 *  dragging amount.
 *  interpAmount: the amount the dragged bar has travelled between two views
 * */
 Barchart.prototype.animateHintPath = function (interpAmount){
   var ref = this;
   var translateAmount = this.hintPathSpacing*interpAmount + this.hintPathSpacing*this.currentView;

    //Translate the hint path, labels and interaction paths (if any)
   this.svg.select("#path").attr("transform","translate(" + (-translateAmount) + ")");
   this.svg.select("#hintPath").selectAll(".hintLabels").attr("transform","translate(" + (-translateAmount) + ")");

    if (this.interactionPaths.length >0) {
            this.svg.select("#hintPath").selectAll(".interactionPath")
                .attr("transform","translate(" + (-translateAmount) + ")");
    }
}
/**"Animates" the rest of the bars while one is being dragged
 * Uses the interpAmount to determine how far the bar has travelled between the two heights
 * defined at start and end view. The heights of the other bars are then estimated using the
 * interpAmount and re-drawn at the new height
 * id: The id of the dragged bar
 * interpAmount: amount to interpolate by
 * startView,endView: Define the range to interpolate across
 * */
Barchart.prototype.interpolateBars = function(id,interpAmount,startView,endView){
  var ref = this;
    console.log(interpAmount+" start view "+startView+" endView "+endView);
  this.svg.selectAll(".displayBars").filter(function (d){return d.id!=id;})
      .attr("height",function (d){
          return ref.interpolator(d.nodes[startView][1], d.nodes[endView][1],interpAmount);
      })
      .attr("y", function(d){
          return ref.interpolator(d.nodes[startView][0], d.nodes[endView][0],interpAmount);
      });
}
/** Animates all bars in the barchart along their hint paths from
 *  startView to endView, this function is called when "fast-forwarding"
 *  is invoked (by clicking a year label on the hint path)
 *  startView: View index to start the animation at
 *  endView: View to end the animation at (need to update view variables
 *  according to this value)
 *  id: the id of the dragged bar (if any), to animate it's hint path which is visible
 *  NOTE: This function does not update the view tracking variables
 * */
//TODO: last and first view: animateView going out of bounds
  Barchart.prototype.animateBars = function( id, startView, endView) {
    if (startView == endView){return;}
    var ref = this;
    //Determine the travel direction (e.g., forward or backward in time)
    var direction = 1;
    if (startView>endView) direction=-1;

    //Define some counter variables to keep track of the views passed during the transition
    var totalViews = this.lastView+1;
    var viewCounter = -1; //Identifies when a new view is reached
    var animateView = startView; //Indicates when to switch the views (after all points are finished transitioning)
    
    //Apply multiple transitions to each display point by chaining them
    this.svg.selectAll(".displayBars").each(animate());

    //Recursively invoke this function to chain transitions, a new transition is added once
    //the current one is finished
    function animate() {
        viewCounter++;
        if (viewCounter==totalViews) {
            animateView = animateView + direction;
            viewCounter = 0;
        }
        if (direction == 1 && animateView>=endView) return;
        if (direction ==-1 && animateView<=endView) return;
        return function(d) {
            //Animate the bar
            d3.select(this).transition(400).ease("linear")
                .attr("height",d.nodes[animateView][1])
                .attr("y",d.nodes[animateView][0])
                .each("end", animate());
            //If the bar's hint path is visible, animate it
            if (d.id == id){
                var translate = animateView*ref.hintPathSpacing;

                //Re-draw the hint path and labels
                d3.select("#path").attr("transform","translate("+(-translate)+")");
                d3.select("#hintPath").selectAll(".hintLabels").attr("transform","translate("+(-translate)+")");

                //Re-draw interaction paths (if any)
                if (ref.interactionPaths.length>0){
                    d3.select("#hintPath").selectAll(".interactionPath")
                        .attr("transform","translate("+(-translate)+")");
                }
            }
        };
    }
}
/** Redraws the barchart at a specified view
 *  view: the view to draw
 *  id: if id is specified (not -1), then the hint path is re-drawn
 *  NOTE: view tracking variables are not updated by this function
 * */
Barchart.prototype.redrawView = function (view,id){
   var ref = this;
   //Re-draw the  bars at the specified view
   this.svg.selectAll(".displayBars")
              .transition().duration(300)
              .attr("height", function (d){return d.nodes[view][1];})
              .attr("y", function (d){return d.nodes[view][0];});

    //Re-draw the hint path (if id is specified)
    if (id!=-1){
        var translate = view*this.hintPathSpacing;
        var savedYCoord;

        //Re-draw the hint path and labels
        this.svg.select("#path").attr("transform","translate("+(-translate)+")");
        this.svg.selectAll(".hintLabels").attr("transform","translate("+(-translate)+")");

        //Re-draw interaction paths (if any)
        if (this.interactionPaths.length>0){
            this.svg.select("#hintPath").selectAll(".interactionPath")
                .attr("transform","translate("+(-translate)+")");
            //Re-position the anchor (if exists)
            if (!this.svg.select("#anchor").empty()){
                this.svg.select("#anchor").attr("d",function (d){return ref.hintPathGenerator(d)});
            }
        }
    }
}
/** Updates the view tracking variables when the view is being changed by an external
 * visualization (e.g., slider)
 * */
Barchart.prototype.changeView = function (newView){
    if (newView ==0){
        this.currentView = newView
        this.nextView = newView+1;
    }else if (newView == this.lastView){
        this.nextView = newView;
        this.currentView = newView -1;
    }else {
        this.currentView = newView;
        this.nextView = newView + 1;
    }
}
/** Re-calculates the x-values for the moving hint path x-coordinates
 * (for both points comprising the path and labels)
 * oldX: the original x position
 * index: the view index
 * view: the current view
 * */
Barchart.prototype.findHintX = function (oldX,index){
    return (oldX+this.barWidth/2+(index*this.hintPathSpacing));
}
/** Snaps to the nearest view once a dragged bar is released
 *  Nearest view is the closest height (either current or next) to the
 *  most recent y-position of the dragged bar. View tracking variables are
 *  updated according to which view is "snapped" to.
 *  id: The id of the dragged bar
 *  heights: An array of all heights of the dragged bar (e.g., d.nodes)
 * */
Barchart.prototype.snapToView = function (id, heights){  
   var currentDist, nextDist;
   
   //Check if the views are an ambiguous case, set the distances
   if (this.isAmbiguous==1){   
        if (this.interpValue > 0.5){ //Snap to nextView
		   currentDist = 1;
		   nextDist = 0;
		}else{ //Snap to current view
		   currentDist = 0;
		   nextDist = 1;
		}
    }else{    
      currentDist = Math.abs(heights[this.currentView][0] - this.mouseY);
      nextDist = Math.abs(heights[this.nextView][0] - this.mouseY);      
   }   
   
  //Ensure the nextView wasn't the last one to avoid the index going out of bounds
  if (currentDist > nextDist && this.nextView != this.lastView){
	this.currentView = this.nextView;
	this.nextView++;
  }
  
  //Re-draw at the snapped view
  if (this.nextView == this.lastView)  this.redrawView(this.currentView+1,id);
  else this.redrawView(this.currentView,id);
}
/** Displays the hint path by appending its svg components to the main svg
 *  id: the id of the dragged bar
 *  heights: the array of heights and y positions of the bar [ypos,height]
 *  xPos: the x-position of the bar
 * */
Barchart.prototype.showHintPath = function (id,heights,xPos){
    var ref = this;

    //Create a dataset to draw the hint path in the format: [x,y]
    this.pathData = heights.map(function (d,i){return [ref.findHintX(xPos,i),d[0]];});

    //Search the dataset for ambiguous cases (sequences of stationary points)
    this.checkAmbiguous();
    if (this.isAmbiguous==1){ this.appendAnchor(xPos,0);}

    var translate = this.hintPathSpacing*this.currentView;

    //Draw the interaction path(s) (if any)
    if (this.isAmbiguous ==1){
        this.svg.select("#hintPath").selectAll(".interactionPath")
            .data(this.interactionPaths.map(function (d,i){return {points:d,id:i}}))
            .enter().append("path").attr("d",function (d){return ref.interactionPathGenerator(d.points)})
            .attr("transform","translate("+(-translate)+")")
            .attr("class","interactionPath");
    }

	//Draw the hint path line
   this.svg.select("#hintPath").append("svg:path")
       .attr("d", this.hintPathGenerator(ref.pathData))
       .attr("filter", "url(#blur)")
       .attr("transform","translate("+(-translate)+")")
       .attr("id","path");

	//Draw the hint labels
   this.svg.select("#hintPath").selectAll("text").data(ref.pathData.map(function(d,i){
           return {x:d[0],y:d[1],label:ref.hintLabels[i]};
        })).enter().append("svg:text")
        .text(function(d) { return d.label; })
        .attr("x",function (d){return d.x}).attr("y",function (d){return d.y})
        .attr("transform", "translate("+(-translate)+")")
        .attr("class","hintLabels").on("click",this.clickHintLabelFunction);

    //Fade out the other bars
   this.svg.selectAll(".displayBars").filter(function (d){ return d.id!=id})
        .transition().duration(300)
        .style("fill-opacity", 0.4);
}
/** Clears the hint path by removing its components from the svg
 * */
 Barchart.prototype.clearHintPath = function (){
        this.pathData = [];
        this.interactionPaths = [];
        this.isAmbiguous = 0;
        this.removeAnchor();
        this.svg.select("#hintPath").selectAll("text").remove();
        this.svg.select("#hintPath").selectAll("path").remove();
		this.svg.selectAll(".displayBars").style("fill-opacity", 1);
 }
//TODO: can use this to also detect really small changes in height to alleviate the interaction
/** Search for ambiguous cases in a list of heights/y-coordinates.  Ambiguous cases are tagged by type, using a number.
 *  The scheme is:
 *  0: not ambiguous
 *  1: stationary bar (bar which doesn't move for at least 2 consecutive years)
 *  This information is stored in the ambiguousBars array, which gets re-populated each time a
 *  new bar is dragged.  This array is in  the format: [[type, newY]...number of views]
 * */
Barchart.prototype.checkAmbiguous = function (){
    var j, currentBar;
    var stationaryBars = [];
    this.isAmbiguous = 0;
    this.ambiguousBars = [];

    //Re-set the ambiguousPoints array
    for (j=0;j<=this.lastView;j++){
        this.ambiguousBars[j] = [0];
    }
    //Populate the stationary and revisiting bars array
    //Search for heights that are equal (called "repeated bars")
    for (j=0;j<=this.lastView;j++){
        currentBar= this.pathData[j][1];
        for (var k=j;k<=this.lastView;k++){
            if (j!=k && this.pathData[k][1]== currentBar){ //Repeated bar is found
            //if (j!=k && (Math.abs(this.pathData[k][1]- currentBar))<1){ //An almost repeated bar, less than one pixel difference
                if (Math.abs(k-j)==1){ //Stationary bar
                    this.isAmbiguous = 1;
                    //If the bar's index does not exist in the array of all stationary bars, add it
                    if (stationaryBars.indexOf(j)==-1){
                        stationaryBars.push(j);
                        this.ambiguousBars[j] = [1];
                    }if (stationaryBars.indexOf(k)==-1){
                        stationaryBars.push(k);
                        this.ambiguousBars[k] = [1];
                    }
                }
            }
        }

    }
    //First check if there exists any stationary bars in the dataset
    if (stationaryBars.length>0){
        //Then, generate points for drawing an interaction path
        this.findPaths(d3.min(stationaryBars));
    }
}
/** This function will populate an array containing all data for drawing a sine wave:
 * interactionPaths[] = [[points for the sine wave]..number of paths]
 * Note: this function is only called in checkAmbiguous(), because it uses the resulting
 * ambiguousBars array
 * startIndex: the index of the first stationary bar (only for reducing the search, can just
 * set this to 0)
 * */
Barchart.prototype.findPaths = function (startIndex){
    var pathInfo = [];
    for (var j=startIndex; j<=this.lastView;j++){
        if (this.ambiguousBars[j][0]==1){
            if (j!=startIndex && this.ambiguousBars[j-1][0]!=1){ //Starting a new path
                this.interactionPaths.push(this.calculatePathPoints(pathInfo));
                pathInfo = [];
            }
            pathInfo.push(j);
        }
    }
    this.interactionPaths.push(this.calculatePathPoints(pathInfo));
}
/** Calculates a set of points to compose a sine wave (for an interaction path)
 * indices: the corresponding year indices, this array's length is the number of peaks of the path
 * @return an array of points for drawing the sine wave: [[x,y], etc.]
 * */
Barchart.prototype.calculatePathPoints = function (indices){
    var angle = 0;
    var pathPoints = [];

    //Save the x and y coordinates of the stationary bar
    var xPos = this.pathData[indices[0]][0];
    var yPos = this.pathData[indices[0]][1];

    //Find the period of the sine function
    var length = indices.length;
    var totalPts = 3*length + (length-3);

    //Calculate the points (5 per gap between views)
    for (var j=0;j<totalPts;j++){
        var theta = angle + (Math.PI/4)*j;
        var y = this.amplitude*Math.sin(theta)+yPos;
        var x = (this.hintPathSpacing/4)*j + xPos;
        pathPoints.push([x,y]);
    }

    //Insert the end direction (1=peak, -1=trough) of the sine wave into ambiguousBars array
    // (first direction will always be -1)
    var endDirection = (indices.length % 2==0)?-1:1;
    this.ambiguousBars[indices[indices.length-1]] = [1,endDirection];

    return pathPoints;
}
//TODO: does the code handle non-existent data values? also, does it handle zero values?