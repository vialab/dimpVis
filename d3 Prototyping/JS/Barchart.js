/** Constructor for a barchart visualization
 * x: the left margin
 * y: the right margin
 * h: height of the svg container
 * bw: width of the bars
 * id: id of the div tag to append the svg container
 * p: a padding value, to format the axes
 */
 function Barchart(h,bw,x,y,id,p){
   //Position and size attributes for drawing the svg
   this.leftMargin = x;
   this.topMargin = y;
   this.id = id;
   this.svg = null; //Reference to svg container
   this.useMobile = false;

   //Display properties
   this.barColour = "#74c476";
   this.zeroBarColour = "#c7c7c7";

   this.padding = p;
   this.barWidth = bw;
   this.strokeWidth=5;
   this.height = h;
   this.hintPathSpacing = 40; //Amount of horizontal distance between labels on hint path
   this.amplitude = 15; //Of the interaction path sine wave
   this.base = h-5; //Starting y-position of all bars (the base)
   this.pathData = [];  //Stores the x,y values for drawing the hint path
   this.hintPathType = 0; //Full hint path displayed

   //Variables set later (in render or init)
   this.numBars = 0;
   this.width = 0;
   this.hintLabels = [];
   this.lastView = -1; //Index of the last view on the hint path
   this.xLabels = []; //To store the labels along the x-axis
   this.graphTitle = "";
   this.xLabel = "";
   this.yLabel = "";

   //View index tracker variables
   this.currentView = 0; //Starting view of the bars (first year)  
   this.nextView = 1; //Next view of the barchart

   //Variables for handling regular interaction
   this.interpValue=0; //For estimating the time direction and update the barchart view
   this.mouseY = 0;
   this.mouseX = 0;
   this.previousDragDirection = 1; //Saves the vertical dragging direction of the user
   this.peakTolerance = 10; //Tolerance frame applied on peaks of hint path

   //Variables used for handling ambiguity
   this.ambiguousBars = [];
   this.interactionPaths = [];
   this.pathDirection = -1; //Directon travelling along an interaction path
   this.timeDirection = 1; //Keeps track of the direction travelling over time 
   this.passedMiddle = -1; //Passed the mid point of the peak of the sine wave
   this.peakValue = null; //The y-value of the sine wave's peak (or trough)
   this.atPeak = -1; //The view index of a peak formed by an end point of the sine wave and the hint path
   this.heightThreshold = 2; //Pixel difference between bar heights, if less than this value, then the views are considered as stationary (draw interaction paths)

   //Set up some event functions, all declared in main.js
   this.placeholder = function() {};
   this.clickHintLabelFunction = this.placeholder;
   this.clickSVG = this.placeholder();
   /**this.touchEndFunction = this.placeholder;
   this.touchStartFunction = this.placeholder;
   this.touchMoveFunction = this.placeholder;
   this.touchLabel = this.placeholder;*/
   this.dragEvent = null;
   this.draggedBar = -1;

   //Attributes that can be toggled via forms (Not being used right now)
   //this.indicatorType = 2; //Type of indicator drawn on sine wave, default is outer elastic
   //this.progressIndicator = 2; //Type of progress indicator to be drawn along the hint path, default is none

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
       .attr("id","mainSvg").style("position", "absolute")
       .attr("width", this.width)
       .attr("height", this.height+(this.padding*2))
       .style("left", this.leftMargin + "px")
       .style("top", this.topMargin + "px")
       .on("click",this.clickSVG).append("g").attr("id","mainG")
       .attr("transform", "translate(" + this.padding + "," + this.padding + ")");

     //Add the blur filter to the SVG so other elements can call it
    this.svg.append("svg:defs").append("svg:filter")
        .attr("id", "blur").append("svg:feGaussianBlur")
        .attr("stdDeviation", 3);
}
/** Render the visualization onto the svg
 * data: The dataset to be visualized
 * hLabels: 1D array of hint labels to appear along the hint path
 * title: of the dataset
 * xLabel, yLabel: of the axes
 *
 * Data MUST be provided in the following array format:
 * n is the number of views (or number of labels on the hint path)
 * Object{"heights":{h1,h2...hn},
 *        "label":"name of data bar" (to appear on the x-axis)
 *       }
 *       ..... number of bars
 * */
 Barchart.prototype.render = function(data,hLabels,title,xLabel,yLabel){
      var ref = this;

    //Clear all elements in the main svg - only needed if changing the dataset
    clearVis(".gDisplayBars");

    //Save some global variables
    this.numBars = data.length;
    this.hintLabels = hLabels;
    this.lastView = hLabels.length-1;
    this.graphTitle = title;
    this.xLabel = xLabel;
    this.yLabel = yLabel;

    //Set the width of the svg (based on number of bars)
     this.width = (this.barWidth+this.strokeWidth)*this.numBars;
     d3.select("#mainSvg").attr("width",this.width+(this.padding*2));

     //Find the max value of the heights, used to scale the axes and the dataset
     var max_h = d3.max(data.map(function (d){return d3.max(d.heights);}));
     //Create the scales
	 var xScale = d3.scale.linear().domain([0,ref.numBars]).range([0,ref.width]);   
     var yScale =  d3.scale.linear().domain([0,max_h]).range([0,ref.height]);

//Assign data values to a set of rectangles representing the bars of the chart
this.svg.selectAll("rect")
    .data(data.map(function (d,i) {
            //Need to adjust the dataset to contain y-positions and heights
            //Array format is: data[viewIndex] = [y of top of bar, height of bar]
            var data = [];
            for (var j=0;j< d.heights.length;j++){
               data[j] = [ref.base - yScale(d.heights[j]),yScale(d.heights[j])];
            }
            //Find the peaks on the hint path, add a flag to indicate peak type
            var newValues = ref.findPeaks(data);
	        return {nodes:newValues,id:i,label:d.label,xPos:(xScale(i)+ref.padding+ref.strokeWidth)};
	  }))
     .enter().append("g").attr("class","gDisplayBars")
	 .attr("id", function (d){return "gDisplayBars"+d.id;});

   //Save the labels for the x-axis
   this.xLabels = this.svg.selectAll(".gDisplayBars").data().map(function (d){return d.label});

   //Draw the axes
   yScale =  d3.scale.linear().domain([max_h,0]).range([0,ref.height]); //Reverse the scale to get the corect axis display
   this.drawAxes(xScale,yScale);

  //Draw the bars
   this.svg.selectAll(".gDisplayBars").append("rect")
     .attr("x", function(d){return d.xPos;})
     .attr("y", function(d){ return d.nodes[ref.currentView][0];})
     .attr("width", this.barWidth)
     .attr("height", function(d) {return d.nodes[ref.currentView][1]})
	 .attr("class", "displayBars").style("fill",ref.barColour)
	 .attr("id", function (d){return "displayBars"+d.id;});

	//Add a blank g element to contain the hint path
    this.svg.append("g").attr("id","hintPath");
 }
/**Finds the peaks in a set of values (i.e., on either side of a point, the values are both increasing or decreasing)
 * data: a 2D array of [y-value,height]
 * @return the same array with added values to each array entry: 0 or 1/-1 flag if it is a peak/trough respectively
 * */
Barchart.prototype.findPeaks = function (data){
    var newData = data;
    var endIndex = data.length-1;
    newData[0].push(0); //First view is not a peak

    for (var j=0;j<data.length;j++){
        var currentY = data[j][0];
        if (j>0 && j < endIndex){
            if (data[j-1][0] < currentY && data[j+1][0] < currentY){ //Upwards peak
                newData[j].push(-1);
            }else if (data[j-1][0] > currentY && data[j+1][0] > currentY){ //Downwards peak
                newData[j].push(1);
            }else{ //No peak
                newData[j].push(0);
            }
        }
    }

    newData[endIndex].push(0); //Last view is never a peak
    return newData;
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
    this.svg.append("text").attr("class","axis")
        .attr("id", "graphTitle")
        .text(this.graphTitle)
        .attr("x",1).attr("y",-15);

    // Add the x-axis label
    this.svg.append("text").attr("class", "axisLabel")
        .attr("x", this.width+this.padding)
        .attr("y", this.height+this.padding-3)
        .text(this.xLabel);

    // Add the y-axis label
    this.svg.append("text").attr("class", "axisLabel")
        .attr("x", 6).attr("transform", "rotate(-90)")
        .text(this.yLabel);

    // Add the y-axis
    this.svg.append("g").attr("class", "axis")
        .attr("transform", "translate("+ this.padding+ ",0)")
        .call(yAxis);

    //Add the x-axis
    this.svg.append("g").attr("class", "axis")
        .attr("transform", "translate("+this.padding+"," + this.height + ")")
        .call(xAxis).selectAll("text")
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
 Barchart.prototype.updateDraggedBar = function (id,mouseX,mouseY,barX,nodes){

    //Set the current vertical dragging direction of the user
    //TODO: use Math.round() to round mouse coordinates into integers such that small (accidental) changes in mouse movement doesn't trigger a switch in dragging direction
     var draggingDirection= (mouseY > this.mouseY)? -1 : (mouseY < this.mouseY)? 1 : this.previousDragDirection;

   //Re-set the time direction and dragging direction if the dragging has just started
    if (this.timeDirection ==0){
        this.timeDirection = 1; //Forward in time by default
        //this.previousDragDirection = draggingDirection;
        draggingDirection = this.previousDragDirection;
    }

    var current = nodes[this.currentView];
    var next = nodes[this.nextView];
    var newValues = []; //Will contain the new height and y-position:[y,h] of the dragged bar

    if (this.isAmbiguous ==1){ //At least one stationary sequence exists somewhere on the hint path

        var currentAmbiguous = this.ambiguousBars[this.currentView];
        var nextAmbiguous = this.ambiguousBars[this.nextView];

        //Check for stationary bar sequences
        if (currentAmbiguous[0] == 1 && nextAmbiguous[0] ==0){ //Approaching the stationary points from right (along hint path)

            setSineWaveVariables(this,currentAmbiguous[2],current[0],1);

            if((current>next && this.pathDirection==1) || (current<next && this.pathDirection==1)){ //Detect if the sine wave and regular hint path form a peak at end point
                this.atPeak = this.currentView;
            }

            newValues = this.handleDraggedBar(current,next,mouseY,id,draggingDirection,barX);

        }else if (currentAmbiguous[0] == 0 && nextAmbiguous[0]==1){ //Approaching the stationary points from left (along hint path)
            setSineWaveVariables(this,nextAmbiguous[2],next[0],0);

            if(current>next){ //Detect if the sine wave and regular hint path form a peak at end point
                this.atPeak = this.nextView;
            }

            newValues = this.handleDraggedBar(current,next,mouseY,id,draggingDirection,barX);

        }else if (currentAmbiguous[0]==1 && nextAmbiguous[0]==1){ //In middle of sequence

            //Dragging has started in the middle of a sequence, need to determine the time direction based on the vertical dragging direction
            if (this.passedMiddle == -1){
                setSineWaveVariables(this,draggingDirection,current[0],0);
                //If vertical dragging indicates the time direction should move backwards, in this case need to update the view variables
                if (this.pathDirection != currentAmbiguous[2] && this.currentView>0){
                    this.passedMiddle = 1;
                    moveBackward(this,draggingDirection);
                }
            }

            this.handleDraggedBar_stationary(current[0],mouseY,mouseX,id,draggingDirection);
            newValues = [current[0],current[1]];

        }else{ //No stationary case to handle right now
            this.atPeak = -1;
            newValues = this.handleDraggedBar(current,next,mouseY,id,draggingDirection,barX);
        }
    }else { //No stationary ambiguous cases exist
        newValues = this.handleDraggedBar(current,next,mouseY,id,draggingDirection,barX);
    }

    //Re-draw the dragged bar
    this.svg.select("#displayBars"+id).attr("y",newValues[0]).attr("height",newValues[1]).style("fill",this.barColour);

   //Save some variables
   this.previousDragDirection = draggingDirection;
   this.mouseY = mouseY;
   this.mouseX = mouseX;
}
/** Resolves a dragging interaction by comparing the current mouse position with the bounding
 *  y positions of current and next views.  Ensures the mouse dragging does not cause the dragged
 *  bar to be drawn out of bounds and keeps track of time by updating the view variables.
 *  current, next: The nodes for each bar of current and next views (i.e., [y-pos,height])
 *  id: of the dragged bar
 *  @return: [newY,newHeight], values used to update the drawing of the dragged bar
 * */
Barchart.prototype.handleDraggedBar = function (current,next,mouseY,id,draggingDirection,barX){
    var newValues = [];

    //Resolve the bounds, find the appropriate y-coords (if at peak, the tolerance adjusted y-value is used instead of the original)
    var currentY = (current[2]!=0)?(current[0] + current[2]*this.peakTolerance):current[0];
    var nextY = (next[2]!=0)?(next[0] + next[2]*this.peakTolerance):next[0];
    var bounds = checkBounds(this,currentY,nextY,mouseY);

    //Update the view based on where the mouse is w.r.t the view boundaries
    if (bounds == mouseY){	    

	    findInterpolation(this,currentY,nextY,mouseY,0,draggingDirection);
        this.interpolateBars(id,this.interpValue,this.currentView,this.nextView);
        this.animateHintPath(this.interpValue);
        newValues = [mouseY,this.findHeight(mouseY)];

    }else if (bounds == currentY ){ //Passing current

        if (current[2]!=0 || this.atPeak == this.currentView){ //At a peak or a peak formed by hint path and sine wave
            inferTimeDirection(this,draggingDirection,1);
            newValues = this.findNewY(currentY,nextY,mouseY,current);
        }else{
            moveBackward(this,draggingDirection);
            newValues = (current[2]!=0)? [currentY,this.findHeight(currentY)]:[currentY,current[1]];
        }
    }else{ //Passing next

        if (next[2]!=0 || this.atPeak ==this.nextView){ //At a peak or a peak formed by hint path and sine wave
            inferTimeDirection(this,draggingDirection,0);
            newValues = this.findNewY(nextY,currentY,mouseY,next);
        }else{
            moveForward(this,draggingDirection);
            //console.log(findPixelDistance(this.mouseX,this.mouseY,barX,nextY));
            newValues = (next[2]!=0)?[nextY,this.findHeight(nextY)]:[nextY,next[1]];
        }
    }

     return newValues;
}
/**Finds the new y-value to draw the dragged bar at (this function is needed because a tolerance value is used)
 * b1,b2: the boundary view values (b1 should be the current view)
 * @return the y-position the bar should be drawn at and the corresponding height
 * */
 Barchart.prototype.findNewY = function (b1,b2,mouseY,orig){

    if (b1 > b2){
        return (mouseY>=orig[0])?[orig[0],orig[1]]:[mouseY,this.findHeight(mouseY)];
    }else{
        return (mouseY<=orig[0])?[orig[0],orig[1]]:[mouseY,this.findHeight(mouseY)];
    }
}
/** Resolves a dragging interaction in a similar method as handleDraggedBar, except
 *  this function is only called when in the middle of a stationary sequence of bars.
 *  barY: The y-position of the stationary bar  
 *  mouseY, mouseX: coordinates of the mouse
 *  id: of the dragged bar
 *  draggingDirection: vertical dragging direction of the mouse
 * */
Barchart.prototype.handleDraggedBar_stationary = function (barY,mouseY,mouseX,id,draggingDirection){

     //If the atPeak variable is set to and index, it means that the first or last point on the sine wave is forming
     //A peak with the hint path
     if (this.atPeak!=-1){ //At one end point on the sine wave
         if (draggingDirection != this.previousDragDirection){ //Permit view updates when the dragging direction changes
             this.atPeak = -1;
         }
     }

    var bounds = checkBounds(this,this.peakValue,barY,mouseY);
    //var newY; //To re-position the anchor

	if (bounds == mouseY){
		 findInterpolation(this,barY,this.peakValue, mouseY, 1, draggingDirection);
		 this.interpolateBars(id,this.interpValue,this.currentView,this.nextView);
         this.animateHintPath(this.interpValue);
		 //newY = mouseY;
    }else if (bounds == this.peakValue){ //At boundary
        if (draggingDirection != this.previousDragDirection){
            if (this.timeDirection ==1){this.passedMiddle = 1}
            else {this.passedMiddle =0;}
        }
        this.interpValue = 0.5;
        //newY = this.peakValue;
    }else{ //At base, update the view

        if (this.atPeak==-1){
             var newPathDirection = (this.pathDirection==1)?-1:1;
             if (this.timeDirection ==1 && this.nextView < this.lastView){
                 moveForward(this,draggingDirection);
                 setSineWaveVariables(this,newPathDirection,barY,0);
             }else if (this.timeDirection==-1 && this.currentView >0){
                 moveBackward(this,draggingDirection);
                 setSineWaveVariables(this,newPathDirection,barY,1);
             }else if (this.nextView == this.lastView){
                 if (draggingDirection != this.previousDragDirection){ //Flip the direction when at the end of the hint path
                     this.timeDirection = (this.timeDirection==1)?-1:1;
                     this.atPeak= this.nextView;
                 }
             }
        }
         //newY=barY;
     }
}
/**Computes the new height of a bar based on a new y-position
 * yPos: current y-position of the bar
 * @return the new height, from the base of the graph
 * */
Barchart.prototype.findHeight = function (yPos){   
    return Math.abs(yPos - this.base);
}
/** Animates the hint path by horizontally translating it according to the vertical
 *  dragging amount.
 *  interpAmount: the amount the dragged bar has travelled between two views
 * */
 Barchart.prototype.animateHintPath = function (interpAmount){
   var ref = this;

  var translateAmount = this.hintPathSpacing*interpAmount + this.hintPathSpacing*this.currentView;

    //Translate the hint path and labels and interpolate the label colour opacity to show the transition from current to next view
   this.svg.select("#hintPath").selectAll("path").attr("transform","translate(" + (-translateAmount) + ")");
   this.svg.select("#hintPath").selectAll(".hintLabels").attr("transform","translate(" + (-translateAmount) + ")")
       .attr("fill-opacity",function (d) {
           if (d.id ==ref.currentView){ //Dark to light
               return d3.interpolate(1,0.3)(interpAmount);
           }else if (d.id == ref.nextView){ //Light to dark
               return d3.interpolate(0.3,1)(interpAmount);
           }
           return 0.3;
       });
   if (this.hintPathType ==1){
        redrawPartialHintPath_line(this,this.ambiguousBars);
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
    //console.log(interpAmount+" start view "+startView+" endView "+endView);
  this.svg.selectAll(".displayBars").filter(function (d){return d.id!=id;})
      .attr("height",function (d){
          return ref.interpolator(d.nodes[startView][1], d.nodes[endView][1],interpAmount);
      })
      .attr("y", function(d){
          return ref.interpolator(d.nodes[startView][0], d.nodes[endView][0],interpAmount);
      });
}
/** Animates all bars in the barchart along their hint paths from
 *  startView to endView, this function is called a year label on the hint path
 *  is clicked
 *  startView, endView: View indices to bound the animation
 *  id: the id of the dragged bar (if any), to animate it's hint path which is visible
 *  NOTE: This function does not update the view tracking variables
 * */
 Barchart.prototype.animateBars = function( id, startView, endView) {

    if (startView == endView){return;}
    var ref = this;

    //Determine the travel direction (e.g., forward or backward in time)
    var direction = 1;
    if (startView>endView) direction=-1;

    //Define some counter variables to keep track of the views passed during the transition
    var totalBars = this.numBars; //Highest index of all bars
    var barCounter = -1; //Identifies when all bars have been animated and the view should change
    var animateView = startView; //+ direction; //Indicates when to switch the views (after all points are finished transitioning)

    //Apply multiple chained transitions to each display point by chaining them
    this.svg.selectAll(".displayBars").each(animate());

    //Recursively invoke this function to chain transitions, a new transition is added once
    //the current one is finished
    function animate() {
        barCounter++;
        if (barCounter==totalBars) {
            animateView = animateView + direction;
            barCounter = 0;
        }

        if (direction == 1 && animateView>=endView) {return;}
        if (direction ==-1 && animateView<=endView) {return;}

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
                d3.select("#hintPath").selectAll("path").attr("transform","translate("+(-translate)+")");
                d3.selectAll(".hintLabels").attr("transform","translate("+(-translate)+")")
                    .attr("fill-opacity", function (b) {return (b.id==animateView)?1:0.3});
            }
        }
    }
}
/** Redraws the barchart at a specified view
 *  view: the view to draw
 *  id: if id is specified (not -1), then the hint path is re-drawn
 *  NOTE: view tracking variables are not updated by this function
 * */
Barchart.prototype.redrawView = function (view,id){
    var ref = this;
  if (this.hintPathType==1){
       hidePartialHintPath(this);
   }
   //else{
       //Re-draw the  bars at the specified view
       this.svg.selectAll(".displayBars").transition().duration(300)
           .attr("height", function (d){return (d.nodes[view][1]==0 /**&& d.id==id*/)?2:d.nodes[view][1];})
           .attr("y", function (d){return d.nodes[view][0];})
           .style("fill",function (d){return (d.nodes[view][1]==0 /**&& d.id==id*/)?ref.zeroBarColour:ref.barColour;});

       //Re-draw the hint path (if id is specified)
       if (id!=-1){
           var translate = view*this.hintPathSpacing;

           //Re-draw the hint path and labels
           this.svg.select("#hintPath").selectAll("path").attr("transform","translate("+(-translate)+")");
           this.svg.selectAll(".hintLabels").attr("transform","translate("+(-translate)+")")
               .attr("fill-opacity",function (d){ return ((d.id==view)?1:0.3)});
       }
   //}
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
    if (this.ambiguousBars[this.currentView][0]==1 && this.ambiguousBars[this.nextView][0]==1){
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
  if (currentDist > nextDist && this.nextView <= this.lastView){
	this.currentView = this.nextView;
	this.nextView++;
  }
  
  //Re-draw at the snapped view
  this.redrawView(this.currentView,id);
}
/** Called each time a new bar is dragged.  Searches for ambiguous regions, and draws the hint path
 *  id: the id of the dragged bar
 *  heights: the array of heights and y positions of the bar [ypos,height]
 *  xPos: the x-position of the bar
 *  */
Barchart.prototype.selectBar = function (id,heights,xPos){
    var ref = this;

    //In case next view went out of bounds (from snapping to view), re-adjust the view variables
    var drawingView = adjustView(this);

    //Create a dataset to draw the hint path in the format: [x,y]
    this.pathData = heights.map(function (d,i){return [ref.findHintX(xPos,i),d[0],d[2]];});

    var translate = this.hintPathSpacing*drawingView;
    this.timeDirection = 0;  //In case dragging starts at a peak..
    this.previousDragDirection = (heights[this.nextView][0]>heights[this.currentView][0])?-1:1;

    //Search the dataset for ambiguous cases (sequences of stationary bars)
    var ambiguousData = checkAmbiguous(this,heights.map(function(d){return d[0]}),this.heightThreshold);
    this.ambiguousBars = ambiguousData[0];

    //Draw the hint path
    if (this.isAmbiguous ==1){
        this.interactionPaths = [];
        ambiguousData[1].forEach(function (d){ref.interactionPaths.push(ref.calculatePathPoints(d))});
        this.drawInteractionPaths(translate);
    }
    if (this.hintPathType ==0){
        this.drawHintPath(xPos,translate,drawingView);
    }else{
        drawPartialHintPath_line(this,translate,this.pathData);
    }

    //Fade out the other bars
    if (!this.useMobile){
        this.svg.selectAll(".displayBars").filter(function (d){ return d.id!=id})
        /**.transition().duration(300)*/.style("fill-opacity", 0.5);
        //highlightDataObject(0,1,"displayBars",this.barColour,"#D95F02");
    }
}
/** Draws interaction paths as sine waves with a dashed line, also sets the passedMiddle variable
 *  translate: the amount to translate the path such that it corresponds with the dragged bar
 * */
Barchart.prototype.drawInteractionPaths = function(translate){
    var ref = this;

    this.svg.select("#hintPath").selectAll(".interactionPath")
        .data(this.interactionPaths.map(function (d,i){return {points:d,id:i}}))
        .enter().append("path").attr("d",function (d){return ref.interactionPathGenerator(d.points)})
        .attr("transform","translate("+(-translate)+")")
        .attr("class","interactionPath").attr("id",function (d){return "interactionPath"+ d.id;});
    this.passedMiddle = -1; //In case dragging has started in the middle of a sine wave..
}
/** Displays the hint path by appending its svg components to the main svg
 *  translate: the amount to horizontally translate the path by
 *  view: view to draw at
 *  xPos: of the dragged bar
 * */
Barchart.prototype.drawHintPath = function (xPos,translate,view){
    var ref = this;

   //Draw a white underlayer
   this.svg.select("#hintPath").append("path")
        .attr("d", this.hintPathGenerator(ref.pathData))
        .attr("filter", function (){return (ref.useMobile)?"":"url(#blur)"})
        .attr("transform","translate("+(-translate)+")")
        .attr("id","underLayer").attr("clip-path","url(#clip)");

	//Draw the hint path line
   this.svg.select("#hintPath").append("path")
       .attr("d", this.hintPathGenerator(ref.pathData))
       .attr("filter", function (){return (ref.useMobile)?"":"url(#blur)"})
       .attr("transform","translate("+(-translate)+")")
       .attr("id","path").attr("clip-path","url(#clip)");

    if (this.useMobile){ //Adjust the display properties of the hint path
       drawMobileHintPath(this);
    }

	//Draw the hint labels
   this.svg.select("#hintPath").selectAll("text").data(ref.pathData.map(function(d,i){
           var yCoord = d[1];
           if (d[2] == -1){ //If the label is at a downwards peak, adjust the y-coordinate such that it doesn't lie on top of the point on the hint path
               yCoord = yCoord + 10;
           }
           return {x:d[0],y:yCoord,label:ref.hintLabels[i],id:i};
        })).enter().append("svg:text")
        .text(function(d) { return d.label; })
        .attr("x",function (d){return d.x}).attr("y",function (d){return d.y})
        .attr("fill-opacity",function (d){ return ((d.id==view)?1:0.3)})
        .attr("transform", "translate("+(-translate)+")")
        .attr("id",function (d) {return "hintLabel"+ d.id})
        .attr("clip-path","url(#clip)")
        .attr("class","hintLabels").on("click",this.clickHintLabelFunction);
}
/** Clears the hint path by removing its components from the svg
 * */
 Barchart.prototype.clearHintPath = function (){
        this.pathData = [];
        this.interactionPaths = [];
        this.svg.select("#hintPath").selectAll("text").remove();
        this.svg.select("#hintPath").selectAll("path").remove();
		this.svg.selectAll(".displayBars").style("fill-opacity", 1);
 }
/** Calculates a set of points to compose a sine wave (for an interaction path)
 * indices: the corresponding year indices, this array's length is the number of peaks of the path
 * @return an array of points for drawing the sine wave: [[x,y], etc.]
 * */
Barchart.prototype.calculatePathPoints = function (indices){
    var angle = 0;
    var pathPoints = [];
    var quarterPi = Math.PI/4;

    //Save the x and y coordinates of the stationary bar
    var xPos = this.pathData[indices[0]][0];
    var yPos = this.pathData[indices[0]][1];

    //Find the period of the sine function
    var length = indices.length;
    var totalPts = 3*length + (length-3);

    var indexCounter = 0;
    var sign = -1;

    //Calculate the points (5 per gap between views)
    for (var j=0;j<totalPts;j++){
        var theta = angle + quarterPi*j;
        var y = this.amplitude*Math.sin(theta)+yPos;
        var x = (this.hintPathSpacing/4)*j + xPos;
        if (j%4==0){ //Add the sign (+1 for peak, -1 for trough) to each ambiguous bar along the sine wave
           this.ambiguousBars[indices[indexCounter]].push(sign);
            indexCounter++;
            sign = (sign==-1)?1:-1; //Flip the sign of the sine wave direction
        }
        pathPoints.push([x,y]);
    }

    //Insert the direction of the end point on the sine wave into ambiguousBars array
    var endDirection = (indices.length % 2==0)?-1:1;
    this.ambiguousBars[indices[indices.length-1]][2] = endDirection;

    return pathPoints;
}