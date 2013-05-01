/** Constructor for a barchart visualization
 * x: the left margin
 * y: the right margin
 * w: width of the svg container
 * h: height of the svg container
 * id: id of the div tag to append the svg container
 * p: a padding value, to format the axes
 * xLabel: label for the x-axis
 * yLabel: label for the y-axis
 * title: of the graph
 */
 function Barchart(width,height,x,y,id,p,xLabel,yLabel,title){
    //TODO: width and height can be automatically computed if we know the bar width, it should be the bar width which is provided in the constructor
   //Position and size attributes for drawing the svg
   this.width = width;
   this.height = height;
   this.leftMargin = x;
   this.topMargin = y;
   this.id = id;
   this.padding = p;
   this.xLabel = xLabel;
   this.yLabel = yLabel;
   this.graphTitle = title;
   this.hintLabels = []; //To store the labels for the hint path
   this.xLabels = []; //To store the labels along the x-axis

   //Set up some display properties
   this.svg = null; //Reference to svg container
   this.displayData = null; //To store the data set to be visualized
   this.barWidth = 50; 
   this.strokeWidth=5;
   this.hintPathSpacing = 30; //Amount of horizontal distance between labels on hint path
   this.base = height-5; //Starting y-position of the bars (the base)
   this.pathData = [];  //Stores the x,y values for drawing the hint path

   //Default graph colours, can be changed by called the setColours() function
   this.hintColour = "#1f77b4";
   this.axisColour = "#c7c7c7";
   this.barColour = "#74c476";

   //View index tracker variables
   this.currentView = 0; //Starting view of the bars (first year)  
   this.nextView = 1; //Next view of the barchart
   this.lastView = -1;
   this.interpValue=0;
   this.mouseY = -1;
   this.numBars = 0;

   //Set up some event functions, all declared in main.js
   this.placeholder = function() {};
   this.clickHintLabelFunction = this.placeholder;   
   this.dragEvent = null;
   this.draggedBar = -1;
 }
/**Customize the display colours of the barchart, to change the default
 * barCol: The colour of the points
 * hintCol: The colour of the hint path
 * axisCol: The colour of the axes
 * */
Barchart.prototype.setColours = function(barCol, hintCol, axisCol){
    this.hintColour = hintCol;
    this.barColour = barCol;
    this.axisColour = axisCol;
}
/** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
 *  will be drawn. Also, add a blur filter for the hint path effect.
 * */
 Barchart.prototype.init = function(){
    //Draw the main svg
   this.svg = d3.select(this.id).append("svg")
       .attr("width", this.width+(this.padding*2))
      .attr("height", this.height+(this.padding*2))  
      .style("position", "absolute")
      .style("left", this.leftMargin + "px")
      .style("top", this.topMargin + "px")  
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
 * hLabels: A list of labels for the hint path, indicating all the different views of the visualization
 *
 * Data MUST be provided in the following array format:
 * n is the number of views (or number of labels on the hint path)
 * Object{"heights":{h1,h2...hn},
 *        "label":"name of data bar" (to appear on the x-axis)
 *       }
 *       ..... number of bars
 * */
 Barchart.prototype.render = function(data,start,hLabels){
      var ref = this;
     //Save some values
	  this.displayData = data; 
	  this.hintLabels = hLabels;
      this.numBars = hLabels.length;
      this.currentView = start;
      this.lastView = hLabels.length-1;

     //Resolve the index value for the next view (e.g., if currentView is 0, then nextView should be set to 1)
     if (this.currentView ==0){
         this.nextView = this.currentView+1;
     }else if (this.currentView == this.lastView){
         this.nextView = this.currentView;
         this.currentView = this.currentView -1;
     }else {
         this.nextView = this.currentView + 1;
     }
     //Find the max and min values of the heights, used to scale the axes and the dataset
     var max_h = d3.max(data.map(function (d){return d3.max(d.heights);}));
     var min_h = d3.min(data.map(function (d){return d3.min(d.heights);}));

    //Create the scales
	 var xScale = d3.scale.linear().domain([0,ref.numBars]).range([0,ref.width]);   
     var yScale =  d3.scale.linear().domain([min_h, max_h]).range([ref.height,0]);

//Assign data values to a set of rectangles representing the bars of the chart
this.svg.selectAll("rect")
    .data(this.displayData.map(function (d,i) {
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
     .attr("height", function(d) { return d.nodes[ref.currentView][1]; })
	 .attr("fill", this.barColour)
	 .attr("class", "displayBars")
	 .attr("id", function (d){return "displayBars"+d.id;})
     .style("cursor", "pointer");

	//Add a blank g element to each bar, to contain its hint path
	this.svg.selectAll(".gDisplayBars").append("g")
								  .attr("id",function (d){return "gInner"+d.id;})
                                  .attr("class","gInner");
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
        .style("fill", this.axisColour)
        .text(this.graphTitle)
        .attr("x",1).attr("y",-15);

    // Add the x-axis label
    this.svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", this.width+this.padding)
        .attr("y", this.height+this.padding-10)
        .style("fill",this.axisColour)
        .text(this.xLabel);

    // Add the y-axis label
    this.svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", 6)
        .attr("transform", "rotate(-90)")
        .style("fill",this.axisColour)
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

    //Colour the axes and labels
    this.svg.selectAll(".axis path").style("stroke",this.axisColour);
    this.svg.selectAll(".axis line").style("stroke",this.axisColour);
    this.svg.selectAll(".axis text").style("fill",this.axisColour);
}
/** Re-draws the dragged bar by altering it's height according to the dragging amount
 *  As the bar is dragged, the view variables are updated and the rest
 *  of the bars are animated
 *  id: The id of the dragged bar, for selecting by id
 *  mouseY: The y-coordinate of the mouse, received from the drag event
 *
 *  Recall: the base of every bar is at this.base, therefore top of the bar is this.base-barHeight
 * */
 //TODO: Get rid of this repeated code
Barchart.prototype.updateDraggedBar = function (id,mouseY){
     var ref = this;
    //Save the mouse coordinate
    this.mouseY = mouseY;

    this.svg.select("#displayBars"+id).each(function (d) {
         var newValues = []; //Saves the new height and y-position:[y,h]
         var currentY =  d.nodes[ref.currentView][0];
         var nextY = d.nodes[ref.nextView][0];
         var currentHeight =  d.nodes[ref.currentView][1];
         var nextHeight = d.nodes[ref.nextView][1];
         var bounds = ref.checkBounds(currentY,nextY,mouseY);
         if (ref.currentView ==0){ //At the first bar
             if (bounds == currentY){ //Passed lowest bar, out of bounds
                 newValues = [currentY,currentHeight];
             }else if (bounds == nextY){ //Passed the next bar height, update the view tracking variables
                 ref.currentView = ref.nextView;
                 ref.nextView++;
                 newValues = [nextY,nextHeight];
             }else{
                 //Otherwise, mouse dragging is in bounds
                 ref.interpolateBars(id,bounds,ref.currentView,ref.nextView);
                 ref.animatePath(id,bounds);
                 newValues = [mouseY,ref.findHeight(currentHeight,mouseY,currentY)];
             }
         } else if (ref.nextView == ref.lastView){ //At the last bar
             if (bounds == nextY){ //Passed highest, out of bounds
                 newValues=[nextY,nextHeight];
             }else if (bounds == currentY){ //Passed current, update view tracker variables
                 ref.nextView = ref.currentView;
                 ref.currentView--;
                 newValues = [currentY,currentHeight];
             }else{
                 //Otherwise, mouse dragging is in bounds
                 ref.interpolateBars(id,bounds,ref.currentView,ref.nextView);
                 ref.animatePath(id,bounds);
                 newValues = [mouseY,ref.findHeight(currentHeight,mouseY,currentY)];
             }
         }else { //At a bar somewhere in between current and next view
             if (bounds == currentY){ //Passed current, update the variables
                 ref.nextView = ref.currentView;
                 ref.currentView--;
                 newValues = [currentY,currentHeight];
             }else if (bounds ==nextY){ //Passed next, update the variables
                 ref.currentView = ref.nextView;
                 ref.nextView++;
                 newValues = [nextY,nextHeight];
             }else{
                 //Otherwise, mouse dragging is in bounds
                 ref.interpolateBars(id,bounds,ref.currentView,ref.nextView);
                 ref.animatePath(id,bounds);
                 newValues = [mouseY,ref.findHeight(currentHeight,mouseY,currentY)];
             }
         }
        ref.svg.select("#displayBars"+id).attr("y",newValues[0]).attr("height",newValues[1]);
     });
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
 *          distanceRatio: the percentage the mouse has travelled from
 *                         h1 to h2
 * */
//TODO:It is possible that this function will fail, because distanceratio could equal the boundary values..
Barchart.prototype.checkBounds = function(h1,h2,mouseY){
   //Resolve the boundaries
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
	if (mouseY <= start) return start;
	else if (mouseY >=end) return end;

    //Find the amount travelled from current to next view (remember: h1 is current and h2 is next)
    var distanceTravelled = Math.abs(mouseY-h1);
    var totalDistance = Math.abs(h2 - h1);
    var distanceRatio = distanceTravelled/totalDistance;
    this.interpValue = distanceRatio;
	return distanceRatio;
}
/** Animates the hint path by horizontally translating it according to the vertical
 *  dragging amount.
 *  id: the id of the dragged bar, for selecting its hint path
 *  interpAmount: the amount the dragged bar has travelled between two views
 * */
Barchart.prototype.animatePath = function (id, interpAmount){
    var ref = this;
  //Function to re-draw the hint path at a new horizontal location
    var lineGenerator = d3.svg.line()
                        .x(function(d,i) {
                              var currentX = ref.findHintX(d[0],i,ref.currentView);
                              var nextX = ref.findHintX(d[0],i,ref.nextView);
                              var interpolateX = d3.interpolate(currentX, nextX);
                              return interpolateX(interpAmount);
                          })
                        .y(function(d) { return d[1]; })
                        .interpolate("linear");
    //Re-draw the hint path
    this.svg.select("#p"+id).attr("d", function(d,i){return lineGenerator(ref.pathData); });
	//Re-draw the hint path labels
   this.svg.selectAll(".hintLabels")
                    .attr("transform",function (d,i) {
                        var currentX = ref.findHintX(d.x,i,ref.currentView);
                        var nextX = ref.findHintX(d.x,i,ref.nextView);
                        var interpolateX = d3.interpolate(currentX,nextX);
                        return "translate("+interpolateX(interpAmount)+","+ d.y+")";
                    });
}
/**"Animates" the rest of the bars while one is being dragged
 * Uses the interpAmount to determine how far the bar has travelled between the two heights
 * defined at start and end view. The heights of the other bars are then estimated using the
 * interpAmount and re-drawn at the new height
 * id: The id of the dragged point
 * interpAmount: The t parameter, or amount to interpolate by
 * startView,endView: Define the range to interpolate across
 * */
Barchart.prototype.interpolateBars = function(id,interpAmount,startView,endView){
  this.svg.selectAll(".displayBars").filter(function (d){return d.id!=id;})
      .attr("height",function (d){
          var interpolateHeight = d3.interpolate(d.nodes[startView][1], d.nodes[endView][1]);
          return interpolateHeight(interpAmount);
      })
      .attr("y", function(d){
          var interpolateY = d3.interpolate(d.nodes[startView][0], d.nodes[endView][0]);
          return interpolateY(interpAmount);
      });
}
/** Redraws the barchart at a specified view
 *  view: the view to draw
 *  NOTE: view tracking variables are not updated by this function
 * */
Barchart.prototype.redrawView = function (view){
   var ref = this;
   this.svg.selectAll(".displayBars")
              .transition().duration(300)
              .attr("height", function (d){return d.nodes[view][1];})
              .attr("y", function (d){return d.nodes[view][0];});
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
Barchart.prototype.findHintX = function (oldX,index,view){
    return (oldX+this.barWidth/2+(index*this.hintPathSpacing))-view*this.hintPathSpacing;
}
/** Snaps to the nearest view once a dragged bar is released
 *  Nearest view is the closest height (either current or next) to the
 *  most recent y-position of the dragged bar. View tracking variables are
 *  updated according to which view is "snapped" to.
 *  id: The id of the dragged bar
 *  points: An array of all heights of the dragged point (e.g., d.nodes)
 * */
Barchart.prototype.snapToView = function (id, heights){
   var current =  heights[this.currentView][0];
   var next = 	heights[this.nextView][0];
   var currentDist = Math.abs(current - this.mouseY);
   var nextDist = Math.abs(next - this.mouseY);
  //Ensure the nextView wasn't the last one to avoid the index going out of bounds
   if (currentDist > nextDist && this.nextView != this.lastView){
        this.currentView = this.nextView;
        this.nextView++;
    }
  if (this.nextView == this.lastView)  this.redrawView(this.currentView+1);
  else this.redrawView(this.currentView);
}
/** Displays the hint path by appending its svg components to the main svg
 *  id: the id of the dragged bar
 *  heights: the array of heights and y positions of the bar [ypos,height]
 *  xPos: the x-position of the bar
 * */
//TODO: check for ambiguous cases, similar to what is done in the scatterplot
Barchart.prototype.showHintPath = function (id,heights,xPos){
    var ref = this;
    //Line function for drawing the hint path
    var lineGenerator = d3.svg.line()
        .x(function(d,i) { return ref.findHintX(d[0],i,ref.currentView); })
        .y(function(d) { return d[1]; })
        .interpolate("linear");

    //Create a dataset to draw the hint path in the format: [x,y]
    this.pathData = heights.map(function (d){return [xPos,d[0]];});
	//Draw the hint path line
    this.svg.select("#gInner"+id).append("svg:path")
                                  .attr("d", lineGenerator(ref.pathData))
								  .attr("id",function (d){return "p"+d.id;})
								  .style("stroke-width", 2)
								  .style("stroke", this.hintColour)
								  .style("fill","none")								
								  .attr("filter", "url(#blur)");
												
	//Draw the hint labels
   this.svg.select("#gInner"+id).selectAll("text").data(heights.map(function(d,i){
                           return {x:xPos,y:d[0],label:ref.hintLabels[i]};
                       })).enter()
                        .append("svg:text")
                        .text(function(d) { return d.label; })
                        .attr("transform",function (d,i) {
                               if (i==ref.currentView){ //Don't want to rotate the label resting on top of the bar
                                   return "translate("+ref.findHintX(d.x,i,ref.currentView)+","+ d.y+")";
                               }else{
                                   return "translate("+(ref.findHintX(d.x,i,ref.currentView)-10)+","+ d.y+")";
                               }
                         })
                       .attr("fill", "#666")
                       .attr("class","hintLabels")
                       .on("click",this.clickHintLabelFunction)
                       .style("cursor", "pointer");

    //Fade out the other bars
    this.svg.selectAll(".displayBars").filter(function (d){ return d.id!=id})
        .transition().duration(300)
        .style("fill-opacity", 0.4);
}
/** Clears the hint path by removing its components from the svg
 *  id: the id of the dragged bar
 * */
 Barchart.prototype.clearHintPath = function (id){
        this.pathData = [];
        this.svg.select("#gInner"+id).selectAll("text").remove();
        this.svg.select("#p"+id).remove();
		this.svg.selectAll(".displayBars").style("fill-opacity", 1);
 }

