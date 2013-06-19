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
   this.numBars = 0; //Set this later
   this.strokeWidth=5;
   this.width = 0; //Set this later
   this.height = h;
   this.hintPathSpacing = 30; //Amount of horizontal distance between labels on hint path
   this.base = h-5; //Starting y-position of the bars (the base)
   this.pathData = [];  //Stores the x,y values for drawing the hint path

   //Default graph colours, can be changed by called the setColours() function
   this.hintColour = "#1f77b4";
   this.axisColour = "#c7c7c7";
   this.barColour = "#74c476";

   //View index tracker variables
   this.currentView = 0; //Starting view of the bars (first year)  
   this.nextView = 1; //Next view of the barchart
   this.lastView = hLabels.length-1; //Index of the last view on the hint path
   this.interpValue=0;
   this.mouseY = -1;
   this.ambiguousBars = [];
   this.interactionPaths = [];

   //Set up some event functions, all declared in main.js
   this.placeholder = function() {};
   this.clickHintLabelFunction = this.placeholder;
   this.clickSVG = this.placeholder();
   this.dragEvent = null;
   this.draggedBar = -1;

   //Function for drawing a linearly interpolated line (the hint path)
   this.hintPathGenerator = d3.svg.line()
        .x(function(d,i) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("linear");
    //Function for drawing a cardinal spline
   this.interactionPathGenerator = d3.svg.line()
        .x(function(d,i) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("cardinal");
   //Interpolate function between two values, at the specified amount
   this.interpolator = function (a,b,amount) {return d3.interpolate(a,b)(amount)};
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
	 .attr("fill", this.barColour)
	 .attr("class", "displayBars")
	 .attr("id", function (d){return "displayBars"+d.id;})
     .style("cursor", "pointer");

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
        .style("fill", this.axisColour)
        .text(this.graphTitle)
        .attr("x",1).attr("y",-15);

    // Add the x-axis label
    this.svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", this.width+this.padding)
        .attr("y", this.height+this.padding-3)
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
/** Re-draws the dragged bar by altering it's height according to the dragging amount.
 *  As the bar is dragged, the view variables are updated and the rest
 *  of the bars are animated by calling handleDraggedBar()
 *  id: The id of the dragged bar, for selecting by id
 *  mouseY: The y-coordinate of the mouse, received from the drag event
 *
 *  Recall: the base of every bar is at this.base, therefore top of the bar is this.base-barHeight
 * */
Barchart.prototype.updateDraggedBar = function (id,mouseY){
     var ref = this;
    //Save the mouse coordinate
    this.mouseY = mouseY;
    //Re-draw the bars according to the dragging amount
    this.svg.select("#displayBars"+id).each(function (d) {
         var currentY =  d.nodes[ref.currentView][0];
         var nextY = d.nodes[ref.nextView][0];
         var currentHeight =  d.nodes[ref.currentView][1];
         var nextHeight = d.nodes[ref.nextView][1];
         var newValues = [];
        //Checking for stationary bar sequences
         if (ref.ambiguousBars[ref.currentView][0]==1 && ref.ambiguousBars[ref.nextView][0]==1){ //In middle of sequence
             ref.handleDraggedBar_stationary(ref.ambiguousBars[ref.currentView][1],ref.ambiguousBars[ref.nextView][1],mouseY,id);
             newValues = [currentY,currentHeight];
         }
         //TODO: are these cases even needed?
         /**else if (ref.ambiguousBars[ref.nextView][0]==1){//At the beginning of sequence

         }else if (ref.ambiguousBars[ref.currentView][0]==1){ //At the end of sequence

         }*/
         else{
             newValues = ref.handleDraggedBar(currentY,nextY,currentHeight,nextHeight,mouseY,id); //Saves the new height and y-position:[y,h]
         }
         ref.svg.select("#displayBars"+id).attr("y",newValues[0]).attr("height",newValues[1]);
     });
}
/** Resolves a dragging interaction by comparing the current mouse position with the bounding
 *  y positions of current and next views.  Ensures the mouse dragged does not cause the dragged
 *  bar to be drawn out of bounds and keeps track of time progression by updating the view variables
 *  when a view is switched.
 *  currentY, nextY: The y-positions of the bar in current and next views
 *  currentHeight, nextHeight: the heights of the bar in current and next views
 *  mouseY: the mouse's vertical dragging amount
 *  id: of the dragged bar
 *  @return: [newY,newHeight], values used to update the drawing of the dragged bar
 * */
Barchart.prototype.handleDraggedBar = function (currentY,nextY,currentHeight,nextHeight,mouseY,id){
    var ref = this;
    var newValues = [];
    var bounds = ref.checkBounds(currentY,nextY,mouseY); //Resolve the bounds
    if (ref.currentView ==0){ //At the first bar
        if (bounds == currentY){ //Passed lowest bar, out of bounds
            newValues = [currentY,currentHeight];
        }else if (bounds == nextY){ //Passed the next bar height, update the view tracking variables
            ref.currentView = ref.nextView;
            ref.nextView++;
            ref.interpValue = 0;
            newValues = [nextY,nextHeight];
        }else{ //Otherwise, mouse dragging is in bounds
            ref.interpolateBars(id,bounds,ref.currentView,ref.nextView);
            ref.animateHintPath(bounds,-1);
            newValues = [mouseY,ref.findHeight(currentHeight,mouseY,currentY)];
        }
    } else if (ref.nextView == ref.lastView){ //At the last bar
        if (bounds == nextY){ //Passed highest, out of bounds
            newValues=[nextY,nextHeight];
        }else if (bounds == currentY){ //Passed current, update view tracker variables
            ref.nextView = ref.currentView;
            ref.currentView--;
            ref.interpValue = 0;
            newValues = [currentY,currentHeight];
        }else{ //Otherwise, mouse dragging is in bounds
            ref.interpolateBars(id,bounds,ref.currentView,ref.nextView);
            ref.animateHintPath(bounds,-1);
            newValues = [mouseY,ref.findHeight(currentHeight,mouseY,currentY)];
        }
    }else { //At a bar somewhere in between current and next view
        if (bounds == currentY){ //Passed current, update the variables
            ref.nextView = ref.currentView;
            ref.currentView--;
            ref.interpValue = 0;
            newValues = [currentY,currentHeight];
        }else if (bounds ==nextY){ //Passed next, update the variables
            ref.currentView = ref.nextView;
            ref.nextView++;
            ref.interpValue = 0;
            newValues = [nextY,nextHeight];
        }else{ //Otherwise, mouse dragging is in bounds
            ref.interpolateBars(id,bounds,ref.currentView,ref.nextView);
            ref.animateHintPath(bounds,-1);
            newValues = [mouseY,ref.findHeight(currentHeight,mouseY,currentY)];
        }
    }
    return newValues;
}
/** Resolves a dragging interaction in a similar method as handleDraggedBar, except
 *  this function is only called when in the middle of a stationary sequence of bars.
 *  currentY, nextY: The y-positions of the bar  along the hint path in current and next views
 *  originalY: The original y-positions of the bar in current and next views (which are equal)
 *  height: the height of the bar in current and next views (which are equal)
 *  mouseY: the mouse's vertical dragging amount
 *  id: of the dragged bar
 *  Note: no return value, because the height and y position of the dragged bar does not change, only
 *  need to update the view variables
 * */
Barchart.prototype.handleDraggedBar_stationary = function (currentY,nextY,mouseY,id){
    var ref = this;
    var bounds = ref.checkBounds(currentY,nextY,mouseY); //Resolve the bounds
    if (ref.currentView ==0){ //At the first bar
        if (bounds == nextY){ //Passed the next bar height, update the view tracking variables
            ref.currentView = ref.nextView;
            ref.nextView++;
        }else if (bounds!= currentY){
            ref.interpolateBars(id,bounds,ref.currentView,ref.nextView);
            ref.animateHintPath(bounds,0);
        }
    } else if (ref.nextView == ref.lastView){ //At the last bar
      if (bounds == currentY){ //Passed current, update view tracker variables
            ref.nextView = ref.currentView;
            ref.currentView--;
        }else if (bounds != nextY){
            ref.interpolateBars(id,bounds,ref.currentView,ref.nextView);
            ref.animateHintPath(bounds,0);
        }
    }else { //At a bar somewhere in between current and next view
        if (bounds == currentY){ //Passed current, update the variables
            ref.nextView = ref.currentView;
            ref.currentView--;
        }else if (bounds ==nextY){ //Passed next, update the variables
            ref.currentView = ref.nextView;
            ref.nextView++;
        }else{
            //Otherwise, mouse dragging is in bounds
            ref.interpolateBars(id,bounds,ref.currentView,ref.nextView);
            ref.animateHintPath(bounds,0);
        }
    }
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
 *  interpAmount: the amount the dragged bar has travelled between two views
 *  pathId: set to -1 if all interaction paths should be animated with the hint path
 *               an id of an interaction path which should be animated vertically and horizontally
 * */
//TODO: alot of repeated code with the interpolator, maybe saving the values in an array isn't a bad idea
 Barchart.prototype.animateHintPath = function (interpAmount,pathId){
   var ref = this;
    //Re-draw the hint path
   this.svg.select("#path").attr("d",  ref.hintPathGenerator(ref.pathData.map(function (d,i){
        var currentX = ref.findHintX(d[0],i,ref.currentView);
        var nextX = ref.findHintX(d[0],i,ref.nextView);
        return {x:ref.interpolator(currentX,nextX,interpAmount),y:d[1]};
    })));
	//Re-draw the hint path labels
   this.svg.select("#hintPath").selectAll(".hintLabels")
            .attr("transform",function (d,i) {
                var currentX = ref.findHintX(d.x,i,ref.currentView);
                var nextX = ref.findHintX(d.x,i,ref.nextView);
                return "translate("+ref.interpolator(currentX,nextX,interpAmount)+","+ d.y+")";
            });
    //Re-draw the interaction paths (if any) by horizontally translating them
    if (this.interactionPaths.length >0) {
            this.svg.select("#hintPath").selectAll(".interactionPath").filter(function (d) {return d.id !=pathId})
                .attr("d",function (d){return ref.interactionPathGenerator(d.points.map(function (d){
                    var currentX = ref.findHintX(d[0],d[2],ref.currentView);
                    var nextX = ref.findHintX(d[0],d[2],ref.nextView);
                    return {x:ref.interpolator(currentX,nextX,interpAmount),y:d[1]};
                   }));
               });
        if (pathId!=-1){ //TODO:Animate the interaction path in both dimensions to coincide with the dragging along it
            this.svg.select("#hintPath").selectAll(".interactionPath").filter(function (d) {return d.id ==pathId})
                .attr("d",function (d){return ref.interactionPathGenerator(d.points.map(function (d){
                    var currentX = ref.findHintX(d[0],d[2],ref.currentView);
                    var nextX = ref.findHintX(d[0],d[2],ref.nextView);
                    return {x:ref.interpolator(currentX,nextX,interpAmount),y:d[1]};
                }));
             });
        }
    }
}
/** TODO: Vertically animates an interaction path when the path is being dragged along
 * (e.g., when user is moving across ambiguous regions on the hint path)
 *  interpAmount: the amount travelled between two views
 *  id: of the interaction path
 * */
/**Barchart.prototype.animateInteractionPath = function (interpAmount,id){
    var ref = this;
    //Re-draw the interaction path
    this.svg.select("#hintPath").selectAll(".interactionPath")
        .attr("d",function (d){return ref.interactionPathGenerator(d.points.map(function (d){
            var currentY = d[1];
            var nextY = d[1];
            var interpolateX = this.interpolator(currentY, nextY, interpAmount);
            return {x:d[0],y:interpolateX};
          }));
        });
}*/
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
                //Re-draw the hint path
                d3.select("#path").attr("d", function(d,i){
                    return ref.hintPathGenerator(ref.pathData.map(function (d,i){return {x:ref.findHintX(d[0],i,animateView),y:d[1]}}));
                });
                //Re-draw the hint path labels
                d3.select("#hintPath").selectAll(".hintLabels")
                    .attr("transform",function (d,i) {
                        //Don't rotate the label resting on top of the bar
                        if (i==animateView) return "translate("+ref.findHintX(d.x,i,animateView)+","+ d.y+")";
                        else return "translate("+(ref.findHintX(d.x,i,animateView)-10)+","+ d.y+")";
                    });
                //Re-draw interaction paths (if any)
                if (ref.interactionPaths.length>0){
                    d3.select("#hintPath").selectAll(".interactionPath")
                        .attr("d",function (d){return ref.interactionPathGenerator(d.points.map(function (d){
                            return {x:ref.findHintX(d[0],d[2],animateView),y:d[1]};
                        }));});
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
         //Re-draw the hint path
        this.svg.select("#path").attr("d", function(d,i){
            return ref.hintPathGenerator(ref.pathData.map(function (d,i){return {x:ref.findHintX(d[0],i,view),y:d[1]}}));
        });
        //Re-draw the hint path labels
        this.svg.selectAll(".hintLabels")
            .attr("transform",function (d,i) {
                //Don't rotate the label resting on top of the bar
                if (i==view) return "translate("+ref.findHintX(d.x,i,view)+","+ d.y+")";
                else return "translate("+(ref.findHintX(d.x,i,view)-10)+","+ d.y+")";
          });
        //Re-draw interaction paths (if any)
        if (this.interactionPaths.length>0){
            this.svg.select("#hintPath").selectAll(".interactionPath")
                .attr("d",function (d){return ref.interactionPathGenerator(d.points.map(function (d){
                    return {x:ref.findHintX(d[0],d[2],view),y:d[1]};
                }));});
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
Barchart.prototype.findHintX = function (oldX,index,view){
    return (oldX+this.barWidth/2+(index*this.hintPathSpacing))-view*this.hintPathSpacing;
}
/** Re-calculates the yvalues for the moving hint path y-coordinates
 * (for both points comprising the path and labels)
 * oldY: the original y position
 * index: the view index
 * view: the current view
 * */
//TODO: not used...
 Barchart.prototype.findHintY = function (oldY,index,view){
    return oldY-view*this.hintPathSpacing;
}
/** Snaps to the nearest view once a dragged bar is released
 *  Nearest view is the closest height (either current or next) to the
 *  most recent y-position of the dragged bar. View tracking variables are
 *  updated according to which view is "snapped" to.
 *  id: The id of the dragged bar
 *  heights: An array of all heights of the dragged bar (e.g., d.nodes)
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
    this.pathData = heights.map(function (d){return [xPos,d[0]];});
    this.checkAmbiguous();
    //TODO: interaction paths need to be re-drawn or vertically translated whenever dragging starts at a peak or trough
    //TODO: interaction paths should be drawn as a sine wave, looks better than a spline http://stackoverflow.com/questions/13893127/how-to-draw-a-path-smoothly-from-start-point-to-end-point-in-d3-js
    //Draw the interaction path(s) (if any)
    if (this.interactionPaths.length >0){
        this.svg.select("#hintPath").selectAll(".interactionPath")
            .data(this.interactionPaths.map(function (d,i){return {points:d,id:i}}))
            .enter().append("path").attr("d",function (d){return ref.interactionPathGenerator(d.points.map(function (d){
                return {x:ref.findHintX(d[0],d[2],ref.currentView),y:d[1]};
            }));})
            .attr("stroke-dasharray","3,3")//Makes the path dashed
            .attr("class","interactionPath")
            .style("fill","none")
            .style("stroke", this.hintColour);
    }
	//Draw the hint path line
   this.svg.select("#hintPath").append("svg:path")
       .attr("d", this.hintPathGenerator(ref.pathData.map(function (d,i){
            return {x:ref.findHintX(d[0],i,ref.currentView),y:d[1]};
       })))
       .style("stroke-width", 2).style("stroke", this.hintColour)
       .style("fill","none").attr("filter", "url(#blur)")
       .attr("id","path");
												
	//Draw the hint labels
   this.svg.select("#hintPath").selectAll("text").data(heights.map(function(d,i){
           return {x:xPos,y:d[0],label:ref.hintLabels[i]};
        })).enter().append("svg:text")
        .text(function(d) { return d.label; })
        .attr("transform",function (d,i) {
           //Don't rotate the label resting on top of the bar
           if (i==ref.currentView) return "translate("+ref.findHintX(d.x,i,ref.currentView)+","+ d.y+")";
           else return "translate("+(ref.findHintX(d.x,i,ref.currentView)-10)+","+ d.y+")";
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
 * */
 Barchart.prototype.clearHintPath = function (){
        this.pathData = [];
        this.interactionPaths = [];
        this.isAmbiguous = 0;
        this.svg.select("#hintPath").selectAll("text").remove();
        this.svg.select("#hintPath").selectAll("path").remove();
		this.svg.selectAll(".displayBars").style("fill-opacity", 1);
 }
//TODO: can use this to also detect really small changes in height to alleviate the interaction
//TODO: do we really need to pre-detect the revisiting case, could check on the fly in updateDraggedBar(), also the revisiting problem might be resolved when inferring time continuity
/** Search for ambiguous cases in a list of heights/y-coordinates.  Ambiguous cases are tagged by type, using a number.
 *  The scheme is:
 *  0: not ambiguous
 *  1: stationary bar (bar which doesn't move for at least 2 consecutive years)
 *  2: revisiting bar (this is a special type of re-visitation, where the bar revisits the same height with
 *                     only one height in between which introduces directional ambiguity during dragging)
 *
 *  This information is stored in the ambiguousBars array, which gets re-populated each time a
 *  new bar is dragged.  This array is in  the format: [[type, newY]...number of views]
 * */
Barchart.prototype.checkAmbiguous = function (){
    var j, currentBar;
    var stationaryBars = [];
    var revisitingBars = [];
    this.isAmbiguous = 0;
    this.ambiguousBars = [];

    //Re-set the ambiguousPoints array
    for (j=0;j<this.lastView;j++){
        this.ambiguousBars[j] = [0];
    }
    //Populate the stationary and revisiting bars array
    //Search for heights that are equal (called "repeated bars")
    for (j=0;j<this.lastView;j++){
        currentBar= this.pathData[j][1];
        for (var k=j;k<this.lastView;k++){
            if (j!=k && this.pathData[k][1]== currentBar){ //Repeated bar is found
            //if (j!=k && (Math.abs(this.pathData[k][1]- currentBar))<1){ //An almost repeated bar, less than one pixel difference
                this.isAmbiguous = 1;
                if (Math.abs(k-j)==1){ //Stationary bar
                    //If the bar's index does not exist in the array of all stationary bars, add it
                    if (stationaryBars.indexOf(j)==-1){
                        stationaryBars.push(j);
                        this.ambiguousBars[j] = [1];
                    }if (stationaryBars.indexOf(k)==-1){
                        stationaryBars.push(k);
                        this.ambiguousBars[k] = [1];
                    }
                }
                /**if (Math.abs(k-j)==2){ //
                 }*/ //TODO: Use this for barchart ambiguous (revisiting)
            }
        }

    }
    //First check if there exists any stationary bars in the dataset
    if (stationaryBars.length>0){
        //Then, generate points for drawing an interaction path
        this.findPaths(d3.min(stationaryBars));
    }
    /**console.log(this.ambiguousBars);
    console.log(stationaryPoints);
     console.log(revisitingPoints);*/

}
/** Finds areas in the data set which require interaction paths, which are sequences of
 * stationary points.  This function will populate an array containing all data for
 * drawing a sine wave which is used to guide the interaction across areas of stationary bars
 * interactionPaths[] = [[points for the sine wave]..number of paths]
 * Note: this function is only called in checkAmbiguous(), because it uses the resulting
 * ambiguousBars array
 * startIndex: the index of the first stationary bar in the ambiguousBars array
 * */
Barchart.prototype.findPaths = function (startIndex){
    var pathInfo = [];
    pathInfo[0] = this.pathData[startIndex][1];
    pathInfo[1] = [];
    for (var j=startIndex; j< this.lastView;j++){
        if (this.ambiguousBars[j][0]==1){
            if (j!=startIndex && this.ambiguousBars[j-1][0]!=1){ //Starting a new path
                //Need to calculate points to draw the loop, based on the original point value
                this.interactionPaths.push(this.calculatePathPoints(pathInfo[0],pathInfo[1]));
                pathInfo = [];
                pathInfo[0] = this.pathData[j][1];
                pathInfo[1] = [];
            }
            pathInfo[1].push(j);
        }
    }
    this.interactionPaths.push(this.calculatePathPoints(pathInfo[0],pathInfo[1]));
}
/** Computes the peak points to lie along an interaction path
 * Note: this function is only called in findPaths()
 * h: the original height which defines the base axis of the sine wave
 * indices: the corresponding year indices, this array's length is the number of peaks of the path
 * @return an array of all points for the sine wave peaks and the year index in the format: [[x,y,index], etc.]
 * */
Barchart.prototype.calculatePathPoints = function (h,indices){
    var pathPoints = [];
    //Save the x and y coordinates of the stationary bar
    var xPos = this.pathData[indices[0]][0];
    var yPos = this.pathData[indices[0]][1];
    //The first point of the path should be the original point
    pathPoints.push([xPos,yPos,indices[0]]);
    var direction = 1; //Up or down direction of the sine wave, toggles among peaks
    var amplitude = 20; //Height above or below the base (yPos)
    for (var j=1;j<=indices.length;j++){
        //Only need to compute the y value, since x will stay the same and is adjusted as needed by findHintX()
        var newY = direction*amplitude + yPos;
        direction = direction*-1; //Reverse the direction
        //Save the y value in the ambiguousBars array, to be used later when determining the interaction direction
        var originalIndex = indices[j-1];
        pathPoints.push([xPos,newY,originalIndex]);
        this.ambiguousBars[originalIndex] = [1,newY];
    }
    //The last point of the path should be the original point
    pathPoints.push([xPos,yPos,indices[indices.length-1]]);
    return pathPoints;
}
//TODO: does the code handle non-existent data values? also, does it handle zero values?