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
   this.svg = null; //Reference to svg container

   //Display properties
   this.padding = p;
   this.xLabel = xLabel;
   this.yLabel = yLabel;
   this.graphTitle = title;
   this.xLabels = []; //To store the labels along the x-axis
   this.hintLabels = hLabels;
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

   //Variables for handling regular interaction
   this.interpValue=0; //For estimating the time direction and update the barchart view
   this.mouseY = 0;
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
   this.dragEvent = null;
   this.draggedBar = -1;

   //Attributes that can be toggled via forms
   this.indicatorType = 2; //Type of indicator drawn on sine wave, default is outer elastic
   this.progressIndicator = 2; //Type of progress indicator to be drawn along the hint path, default is none

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
       .on("click",this.clickSVG)
       .append("g").attr("id","mainG")
	   .attr("transform", "translate(" + this.padding + "," + this.padding + ")");

     //Add the blur filter to the SVG so other elements can call it
    this.svg.append("svg:defs").append("svg:filter")
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
 Barchart.prototype.render = function(data){
      var ref = this;

     //Clear all elements in the main svg - only needed if changing the dataset
    // this.svg.select("#mainG").selectAll("g").remove();

    //Save some values and set the width of the svg (based on number of bars)
     this.numBars = data.length;
     this.width = (this.barWidth+this.strokeWidth)*this.numBars;
     d3.select(this.id).select("#mainSvg").attr("width",this.width+(this.padding*2));

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
            //Find the peaks on the hint path, add a flag to indicate peak type
            var newValues = ref.findPeaks(data);
	        return {nodes:newValues,id:i,label:d.label,xPos:(xScale(i)+ref.padding+ref.strokeWidth)};
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
 Barchart.prototype.updateDraggedBar = function (id,mouseY,mouseX){
     var ref = this;
    //Re-draw the bars according to the dragging amount
    this.svg.select("#displayBars"+id).each(function (d) {
        //Set the current vertical dragging direction of the user
        var draggingDirection;
        //TODO: use Math.round() to round mouse coordinates into integers such that small (accidental) changes in mouse movement doesn't trigger a switch in dragging direction
        if (mouseY>ref.mouseY){ draggingDirection = -1;}
        else if (mouseY < ref.mouseY){ draggingDirection = 1;}
        else{ draggingDirection = ref.previousDragDirection;}

       //Re-set the time direction and dragging direction if the dragging has just started
        if (ref.timeDirection ==0){
            ref.timeDirection = 1; //Forward in time by default
            ref.previousDragDirection = draggingDirection;
        }

        var current = d.nodes[ref.currentView];
        var next = d.nodes[ref.nextView];
        var newValues = []; //Will contain the new height and y-position:[y,h] of the dragged bar

        if (ref.isAmbiguous ==1){ //At least one stationary sequence exists somewhere on the hint path

            var currentAmbiguous = ref.ambiguousBars[ref.currentView];
            var nextAmbiguous = ref.ambiguousBars[ref.nextView];

            //Check for stationary bar sequences
            if (currentAmbiguous[0] == 1 && nextAmbiguous[0] ==0){ //Approaching the stationary points from right (along hint path)

                ref.setSineWaveVariables(currentAmbiguous[1],current[0],1);
                ref.hideAnchor();

                if((current>next && ref.pathDirection==1) || (current<next && ref.pathDirection==1)){ //Detect if the sine wave and regular hint path form a peak at end point
                    ref.atPeak = ref.currentView;
                }

                newValues = ref.handleDraggedBar(current,next,mouseY,id,draggingDirection);

            }else if (currentAmbiguous[0] == 0 && nextAmbiguous[0]==1){ //Approaching the stationary points from left (along hint path)
                ref.setSineWaveVariables(nextAmbiguous[1],next[0],0);
                ref.hideAnchor();

                if(current>next){ //Detect if the sine wave and regular hint path form a peak at end point
                    ref.atPeak = ref.nextView;
                }

                newValues = ref.handleDraggedBar(current,next,mouseY,id,draggingDirection);

            }else if (currentAmbiguous[0]==1 && nextAmbiguous[0]==1){ //In middle of sequence

                //Dragging has started in the middle of a sequence, need to determine the time direction based on the vertical dragging direction
                if (ref.passedMiddle == -1){
                    ref.setSineWaveVariables(draggingDirection,current[0],0);
                    //If vertical dragging indicates the time direction should move backwards, in this case need to update the view variables
                    if (ref.pathDirection != currentAmbiguous[1] && ref.currentView>0){
                        ref.passedMiddle = 1;
                        ref.moveBackward();
                    }
                }

                ref.handleDraggedBar_stationary(current[0],mouseY,mouseX,id,draggingDirection);

                newValues = [current[0],current[1]];

            }else{ //No stationary case to handle right now
                ref.atPeak = -1;
                ref.hideAnchor();
                newValues = ref.handleDraggedBar(current,next,mouseY,id,draggingDirection);
            }
        }else { //No stationary ambiguous cases exist
            newValues = ref.handleDraggedBar(current,next,mouseY,id,draggingDirection);
        }

        //Re-draw the dragged bar
        ref.svg.select("#displayBars"+id).attr("y",newValues[0]).attr("height",newValues[1]);

        //Save the dragging direction
        ref.previousDragDirection = draggingDirection;

    });

    //Save the mouse y-coordinate
    this.mouseY = mouseY;
}
/**Updates variables for dragging along the sine wave:
 *  pathDirection: vertical direction of the approaching portion of the sine wave (e.g., at next view)
 *  barHeight: height of the stationary bar, used to calculate the height of the upcoming peak/trough
 *  passedMiddle: a flag to determine how to calculate the interpolation (0: interp is between 0 and <0.5,
 *  1: interp is between 0.5 and < 1)
 * */
Barchart.prototype.setSineWaveVariables = function (pathDirection,barHeight,passedMiddle){
    this.passedMiddle = passedMiddle;
    this.pathDirection = pathDirection;
    this.peakValue = (pathDirection==1)?(barHeight-this.amplitude):(this.amplitude+barHeight);
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
        if (this.indicatorType ==0 || this.indicatorType ==1){ //Inner or outer elastic
            this.svg.select("#hintPath").append("path").datum([[x+ref.barWidth/2,y]])
                .attr("d", ref.hintPathGenerator).attr("id","anchor");
        }else if (this.indicatorType == 2){ //Circle
            this.svg.select("#hintPath").append("g").attr("id","anchor");
            this.svg.select("#anchor").append("circle").attr("cx", x+this.barWidth/2).attr("cy", y).attr("r",4).attr("stroke","none");
            this.svg.select("#anchor").append("path").datum([[x+ref.barWidth/2,y]])
                .attr("d", ref.hintPathGenerator);
        }
    }
}
/** Re-draws the anchor, depends on the type of indicator the user has selected on the form
 * baseY = y-value of the stationary bar
 * mouseX, mouseY: mouse coordinates during dragging
 * newY = newY lies along the sine wave somewhere
 * */
 Barchart.prototype.redrawAnchor = function (baseY,mouseX,mouseY,newY){
    var ref = this;
    if (this.indicatorType ==0){ //Outer elastic
        this.svg.select("#anchor").attr("d",function (d) {return ref.hintPathGenerator([[mouseX,mouseY],[d[0][0],newY]]);});
    }else if (this.indicatorType == 1){ //Inner Elastic
        this.svg.select("#anchor").attr("d",function (d) {return ref.hintPathGenerator([[d[0][0],baseY],[d[0][0],newY]]);});
    }else if (this.indicatorType ==2){ //Circle
        this.svg.select("#anchor").select("path").attr("d",function (d) {return ref.hintPathGenerator([[d[0][0],baseY],[d[0][0],newY]]);});
        this.svg.select("#anchor").select("circle").attr("cy",newY).attr("stroke","#c7c7c7");
    }
}
/**Hides the circle anchor by removing it's stroke colour
 * */
Barchart.prototype.hideAnchor = function (){
    this.svg.select("#anchor").select("circle").attr("stroke","none");
}
/** Removes an indicator from the svg, if one is appended
 * id: of the indicator to remove (should be a string: "#id_name" */
Barchart.prototype.removeIndicator = function (id){
    if (!this.svg.select(id).empty()){
        this.svg.select(id).remove();
    }
}
/** Appends a progress indicator to the svg, if there isn't already one
 *  data: array of points for drawing the line
 * */
Barchart.prototype.appendProgress = function (data){
    var ref = this;

    if (this.svg.select("#progress").empty()){
        //Add the blur filter to the SVG so other elements can call it
        this.svg.append("svg:defs").append("svg:filter")
            .attr("id", "blurProgress")
            .append("svg:feGaussianBlur")
            .attr("stdDeviation", 3);

        this.svg.select("#hintPath").append("path").datum(data)
            .attr("id","progress").attr("filter", "url(#blurProgress)");

        if (this.progressIndicator ==1){ //Large progress path
            this.svg.select("#progress").attr("d", function (d) {return ref.hintPathGenerator(d)});
        }
    }
}
/** Re-draws a progress indicator using the stroke dash interpolation example by mike bobstock:
 * http://bl.ocks.org/mbostock/5649592
 * interpAmount: how far travelled between views
 * translateAmount: to animate the progress path with the hint path
 * */
Barchart.prototype.drawProgress = function (interpAmount,translateAmount){
    var ref = this;

    if (!this.svg.select("#progress").empty()){

        //Create the interpolation function and get the total length of the path
        var length = d3.select("#progress").node().getTotalLength();
        var interpStr = d3.interpolateString("0," + length, length + "," + length);
        //Make some adjustments according to the type of progress path selected
        if (this.progressIndicator == 0 && interpAmount==0){ //Small progress paths, at the point of transitioning views
           this.svg.select("#progress").attr("d", function (d) {return ref.hintPathGenerator([d[ref.currentView],d[ref.nextView]])});
        }else if (this.progressIndicator==1){ //Large progress path, adjust the interpolation
            interpAmount = (this.currentView-1)/this.lastView + interpAmount/this.lastView;
        }

        //Re-colour the progress path
        this.svg.select("#progress").attr("stroke-dasharray",interpStr(interpAmount))
            .attr("transform","translate(" + (-translateAmount) + ")");
    }
}
/** Resolves a dragging interaction by comparing the current mouse position with the bounding
 *  y positions of current and next views.  Ensures the mouse dragging does not cause the dragged
 *  bar to be drawn out of bounds and keeps track of time by updating the view variables.
 *  current, next: The nodes for each bar of current and next views (i.e., [y-pos,height])
 *  mouseY: the mouse's y-coordinate
 *  id: of the dragged bar
 *  draggingDirection: vertical dragging direction of mouse
 *  @return: [newY,newHeight], values used to update the drawing of the dragged bar
 * */
//TODO: start the dragging at a peak causes some jumping (might be a similar problem as the sine wave)
Barchart.prototype.handleDraggedBar = function (current,next,mouseY,id,draggingDirection){
    var newValues = [];

    //Resolve the bounds, find the appropriate y-coords (if at peak, the tolerance adjusted y-value is used instead of the original)
    var currentY = (current[2]!=0)?(current[0] + current[2]*this.peakTolerance):current[0];
    var nextY = (next[2]!=0)?(next[0] + next[2]*this.peakTolerance):next[0];
    var bounds = this.checkBounds(currentY,nextY,mouseY);
   // var currentY = current[0];
   // var nextY = next[0];

    //Update the view based on where the mouse is w.r.t the view boundaries
    if (bounds == mouseY){	    

	    this.findInterpolation(currentY,nextY,mouseY,0);
        this.interpolateBars(id,this.interpValue,this.currentView,this.nextView);
        this.animateHintPath(this.interpValue);
        newValues = [mouseY,this.findHeight(mouseY)];

    }else if (bounds == currentY ){ //Passing current

        if (current[2]!=0 || this.atPeak == this.currentView){ //At a peak or a peak formed by hint path and sine wave
            newValues = this.inferTimeDirection(currentY,nextY,mouseY,draggingDirection,current);
        }else{
            this.moveBackward();
            newValues = (current[2]!=0)? [currentY,this.findHeight(currentY)]:[currentY,current[1]];
        }

        if (this.progressIndicator!=1){this.drawProgress(0,0);}
    }else{ //Passing next

        if (next[2]!=0 || this.atPeak ==this.nextView){ //At a peak or a peak formed by hint path and sine wave
            newValues = this.inferTimeDirection(nextY,currentY,mouseY,draggingDirection,next);
        }else{
            this.moveForward();
            newValues = (next[2]!=0)?[nextY,this.findHeight(nextY)]:[nextY,next[1]];
        }

        if (this.progressIndicator!=1){this.drawProgress(0,0);}
    }

     return newValues;
}
/**Infers the time direction when user arrives at corners, inference is based on previous direction
 * travelling over time.  The views are updated (forward or backward) whenever the dragging direction
 * changes.
 * b1,b2: the boundary views (b1 should be the currently encountered corner)
 * @return the y-position the bar should be drawn at
 * */
Barchart.prototype.inferTimeDirection = function (b1,b2,mouseY,draggingDirection,orig){

    if (this.previousDragDirection!=draggingDirection){ //Switched directions, update the time
        if (this.timeDirection ==1){this.moveForward();}
        else{this.moveBackward();}
    }

    if (b1 > b2){ //Return information for re-drawing the bar
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
//TODO: jumping is better, but still happens sometimes
Barchart.prototype.handleDraggedBar_stationary = function (barY,mouseY,mouseX,id,draggingDirection){

     //If the atPeak variable is set to and index, it means that the first or last point on the sine wave is forming
     //A peak with the hint path
     if (this.atPeak!=-1){ //At one end point on the sine wave
         if (draggingDirection != this.previousDragDirection){ //Permit view updates when the dragging direction changes
             this.atPeak = -1;
         }
     }

    var bounds = this.checkBounds(this.peakValue,barY,mouseY);
    var newY; //To re-position the anchor

	if (bounds == mouseY){
		 this.findInterpolation(barY,this.peakValue, mouseY, 1);
		 this.interpolateBars(id,this.interpValue,this.currentView,this.nextView);
         this.animateHintPath(this.interpValue);
		 newY = mouseY;               
    }else if (bounds == this.peakValue){ //At boundary
        if (draggingDirection != this.previousDragDirection){
            if (this.timeDirection ==1){this.passedMiddle = 1}
            else {this.passedMiddle =0;}
        }
        this.interpValue = 0.5;
        newY = this.peakValue;
    }else{ //At base, update the view

        if (this.atPeak==-1){
             var newPathDirection = (this.pathDirection==1)?-1:1;
             if (this.timeDirection ==1 && this.nextView < this.lastView){
                 this.moveForward();
                 this.setSineWaveVariables(newPathDirection,barY,0);
             }else if (this.timeDirection==-1 && this.currentView >0){
                 this.moveBackward();
                 this.setSineWaveVariables(newPathDirection,barY,1);
             }
        }
         newY=barY;
     }

    this.redrawAnchor(barY,mouseX,mouseY,newY);
}
/**Computes the new height of a bar based on a new y-position
 * yPos: current y-position of the bar
 * @return the new height, from the base of the graph
 * */
Barchart.prototype.findHeight = function (yPos){   
    return Math.abs(yPos - this.base);
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

	//Check if the mouse is between start and end values
	if (mouseY <= start) {
        //if (this.timeDirection == -1) {this.interpValue = 1; }
        //else{this.interpValue = 0;}
        this.interpValue = 0;
        return start;
    }else if (mouseY >=end) {
        //if (this.timeDirection == -1) {this.interpValue = 1; }
        //else{this.interpValue = 0;}
        this.interpValue = 0;
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
    //TODO: potentially dangerous b/c interpvalue could stay the same (might need a current == interpValue case)
    this.timeDirection = (currentInterpValue > this.interpValue) ? 1:-1;

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

    //Translate the hint path and labels and interpolate the label colour opacity to show the transition from current to next view
   this.svg.select("#path").attr("transform","translate(" + (-translateAmount) + ")");
   this.svg.select("#hintPath").selectAll(".hintLabels").attr("transform","translate(" + (-translateAmount) + ")")
       .attr("fill-opacity",function (d) {
           if (d.id ==ref.currentView){ //Dark to light
               return d3.interpolate(1,0.3)(interpAmount);
           }else if (d.id == ref.nextView){ //Light to dark
               return d3.interpolate(0.3,1)(interpAmount);
           }
           return 0.3;
       });

    //Translate interaction paths (if any)
    if (this.interactionPaths.length >0) {
        this.svg.select("#hintPath").selectAll(".interactionPath")
                .attr("transform","translate(" + (-translateAmount) + ")");
    }

    if (this.progressIndicator!=2){
       this.drawProgress(interpAmount,translateAmount);
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
            console.log(animateView);
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

        //Re-draw the hint path and labels
        this.svg.select("#path").attr("transform","translate("+(-translate)+")");
        this.svg.selectAll(".hintLabels").attr("transform","translate("+(-translate)+")")
             .attr("fill-opacity",function (d){ return ((d.id==view)?1:0.3)});

        //Re-draw interaction paths (if any)
        if (this.interactionPaths.length>0){
            this.svg.select("#hintPath").selectAll(".interactionPath")
                .attr("transform","translate("+(-translate)+")");
            this.removeIndicator("#anchor"); //Anchor will be re-appended in showHintPath()
        }

        //Re-draw progress paths (if any)
        if (this.progressIndicator != 2){
            this.svg.select("#progress").attr("transform","translate("+(-translate)+")");
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
  if (currentDist > nextDist && this.nextView <= this.lastView){
	this.currentView = this.nextView;
	this.nextView++;
  }
  
  //Re-draw at the snapped view
  this.redrawView(this.currentView,id);
}
/** Displays the hint path by appending its svg components to the main svg
 *  id: the id of the dragged bar
 *  heights: the array of heights and y positions of the bar [ypos,height]
 *  xPos: the x-position of the bar
 * */
Barchart.prototype.showHintPath = function (id,heights,xPos){
    var ref = this;
    //In case next view went out of bounds (from snapping to view), re-adjust the view variables
    var drawingView = this.currentView;
    if (this.nextView>this.lastView){
        this.nextView--;
        this.currentView--;
        drawingView = this.nextView;
    }

    //Create a dataset to draw the hint path in the format: [x,y]
    this.pathData = heights.map(function (d,i){return [ref.findHintX(xPos,i),d[0],d[2]];});

    //Search the dataset for ambiguous cases (sequences of stationary points)
    this.checkAmbiguous();

    var translate = this.hintPathSpacing*drawingView;

    //Draw the interaction path(s) (if any)
    if (this.isAmbiguous ==1){
        this.appendAnchor(xPos,0);
        this.svg.select("#hintPath").selectAll(".interactionPath")
            .data(this.interactionPaths.map(function (d,i){return {points:d,id:i}}))
            .enter().append("path").attr("d",function (d){return ref.interactionPathGenerator(d.points)})
            .attr("transform","translate("+(-translate)+")")
            .attr("class","interactionPath");
        this.passedMiddle = -1; //In case dragging has started in the middle of a sine wave..
    }

   this.timeDirection = 0;  //In case dragging starts at a peak..

	//Draw the hint path line
   this.svg.select("#hintPath").append("svg:path")
       .attr("d", this.hintPathGenerator(ref.pathData))
       .attr("filter", "url(#blur)")
       .attr("transform","translate("+(-translate)+")")
       .attr("id","path");

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
        .attr("fill-opacity",function (d){ return ((d.id==drawingView)?1:0.3)})
        .attr("transform", "translate("+(-translate)+")")
        .attr("id",function (d) {return "hintLabel"+ d.id})
        .attr("class","hintLabels").on("click",this.clickHintLabelFunction);

    //Fade out the other bars
   this.svg.selectAll(".displayBars").filter(function (d){ return d.id!=id})
        /**.transition().duration(300)*/.style("fill-opacity", 0.4);

    //Draw a progress indicator (if specified)
    if (this.progressIndicator != 2){
        this.appendProgress(this.pathData);
        this.drawProgress(0,0);
    }
}
/** Clears the hint path by removing its components from the svg
 * */
 Barchart.prototype.clearHintPath = function (){
        this.pathData = [];
        this.interactionPaths = [];
        this.removeIndicator("#anchor");
        this.svg.select("#hintPath").selectAll("text").remove();
        this.svg.select("#hintPath").selectAll("path").remove();
		this.svg.selectAll(".displayBars").style("fill-opacity", 1);
 }
//TODO: can use this to also detect really small changes in height to alleviate the interaction
/** Search for ambiguous cases in a list of heights/y-coordinates.  Ambiguous cases are tagged by type, using a number.
 *  The scheme is: 0: not ambiguous, 1: stationary bar (bar which doesn't move for at least 2 consecutive years)
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
        this.ambiguousBars[j] = [0,0];
    }
    //Populate the stationary and revisiting bars array
    //Search for heights that are equal (called "repeated bars")
    for (j=0;j<=this.lastView;j++){
        currentBar= this.pathData[j][1];
        for (var k=j;k<=this.lastView;k++){
            //if (j!=k && this.pathData[k][1]== currentBar){ //Repeated bar is found
            if (j!=k && (Math.abs(this.pathData[k][1]- currentBar))<this.heightThreshold){ //An almost repeated bar, less than one pixel difference
                if (Math.abs(k-j)==1){ //Stationary bar
                    this.isAmbiguous = 1;
                    //If the bar's index does not exist in the array of all stationary bars, add it
                    if (stationaryBars.indexOf(j)==-1){
                        stationaryBars.push(j);
                        this.ambiguousBars[j] = [1,0];
                    }if (stationaryBars.indexOf(k)==-1){
                        stationaryBars.push(k);
                        this.ambiguousBars[k] = [1,0];
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
/** Populate an array containing all data for drawing a sine wave:
 * interactionPaths[] = [[points for the sine wave]..number of paths]
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

    var indexCounter = 0;
    var sign = -1;

    //Calculate the points (5 per gap between views)
    for (var j=0;j<totalPts;j++){
        var theta = angle + (Math.PI/4)*j;
        var y = this.amplitude*Math.sin(theta)+yPos;
        var x = (this.hintPathSpacing/4)*j + xPos;
        if (j%4==0){ //Add the sign (+1 for peak, -1 for trough) to each ambiguous bar along the sine wave
           this.ambiguousBars[indices[indexCounter]] = [1,sign];
            indexCounter++;
            sign = (sign==-1)?1:-1; //Flip the sign of the sine wave direction
        }
        pathPoints.push([x,y]);
    }

    //Insert the direction of the end point on the sine wave into ambiguousBars array
    var endDirection = (indices.length % 2==0)?-1:1;
    this.ambiguousBars[indices[indices.length-1]] = [1,endDirection];

    return pathPoints;
}
//TODO: does the code handle non-existent data values? also, does it handle zero values?