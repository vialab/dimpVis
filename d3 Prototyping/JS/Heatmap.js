/** Constructor for a heatmap visualization
 * x: the left margin
 * y: the right margin
 * cs: pixel size of the cells
 * id: id of the div tag to append the svg container
 * title: of the chart
 * hLabels: labels to appear along the hint paths
 */
function Heatmap(x, y, cs, id,title,hLabels) {
   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.id = id;
   this.cellSize = cs;
   this.chartTitle = title;
   this.svg = null;
   this.width = null;
   this.height = null;

   //Variables to track interaction events
   this.currentView = 0;
   this.nextView = 1;
   this.lastView = hLabels.length-1;
   this.previousPathDirection = 1; // 1: path going up, -1: path going downwards, this is not direction in time
   this.previousDragDirection = 1; //Dragging direction of the user: 1 if up, -1 if down
   this.timeDirection = 1 //Direction travelling over time, 1: forward, -1: backward

   this.mouseY=null; //To track the mouse position
   this.interpValue = 0; //Value to track the progress of colour interpolation when switching between views
   this.draggedCell = -1; //Keeps track of the id of the dragged cell
   this.draggedCellX = -1; //Saved x coordinate of the dragged cell
   this.draggedCellY = -1; //Saved y coordinate of the dragged cell

   this.hintYValues = []; //Saves the hint y-values (at the first view)
   this.ambiguousCells = []; //Keeps track of which cells are part of an ambiguous case
   this.isAmbiguous = 0;  //A flag to quickly check whether or not there exists ambiguous cases in the data
   this.amplitude = 20; //Of the sine wave (interaction path)
   this.interactionPaths = [];

   //Display properties
   this.labels = hLabels;
   this.xSpacing = 50; //Spacing across x for hint path
   this.ySpacing = 20; //Spacing for the y of hint path

   //Declare some interaction event functions
   this.dragEvent = {};
   this.clickHintLabelFunction = {};
   this.clickSVG = {};

  //Function for drawing the hint path line
  //Note: array of points should be in the format [[x,y]..etc.]
   this.lineGenerator = d3.svg.line().interpolate("linear");

   //Function for drawing a sine wave (interaction path)
   this.interactionPathGenerator = d3.svg.line().interpolate("monotone");

   //Interpolate function between two values, at the specified amount
   this.interpolator = function (a,b,amount) {return d3.interpolate(a,b)(amount)};
}
/** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
 *  will be drawn. Also, add a blur filter for the hint path effect.
 * */
Heatmap.prototype.init = function() {

    this.svg = d3.select(this.id)
      .append("svg").attr("id","mainSvg")
      .on("click",this.clickSVG)
      .append("g")
      .attr("transform", "translate(" + this.xpos + "," + this.ypos + ")");

   this.svg.append("svg:defs").append("svg:filter")
        .attr("id", "blur").append("svg:feGaussianBlur")
        .attr("stdDeviation", 2);
}
/** Render the visualization onto the svg
 * data: The dataset to be visualized
 * xLabels: an array of labels to appear on the x-axis
 * yLabels: an array of labels to appear on the y-axis
 *
 * Data MUST be provided in the following array format:
 * data = [{"row","column",[colour values for all views]}...number of cells]
 * */
Heatmap.prototype.render = function(data,xLabels,yLabels) {
    var ref = this;
    //Set the width and height of the svg, now that the dimensions are known
    this.width = xLabels.length*this.cellSize+100;
    this.height = yLabels.length*this.cellSize+100;
    d3.select(this.id).select("#mainSvg").attr("width", this.width).attr("height", this.height);

    //Find the max and min score in the dataset (used for the colour scale)
    var maxScore = d3.max(data.map(function (d){return d3.max(d.values); }));
    var minScore = d3.min(data.map(function (d){return d3.min(d.values); }));

    var colours = ["rgb(254,224,139)","rgb(253,174,97)","rgb(244,109,67)","rgb(215,48,39)","rgb(165,0,38)"];
    var generateColour = d3.scale.quantize().domain([minScore,maxScore]).range(colours);
    //Find the hint y value (of the colour along the colour scale)
    var hintYOffset = d3.scale.quantize().domain([minScore,maxScore])
        .range(colours.map(function(d,i){return i;}).reverse());//Lower colours on scale have lower offsets
                                                                //Which means drag up to reach higher scores (darker colours)
    //Draw the cells for each entry in the heatmap
    //The allValues array contains information for drawing the cells and drawing the hint path
    //Format: allValues[j] = [[colour,originalScore,hintX,hintY,yOffset,gradientOffset]...
    // for each view on the hint path]
    this.svg.selectAll(".cell")
         .data(data.map(function (d,i) {
                var allValues = [],hintLengths = [];
                var xCoord = d.row*ref.cellSize;
                var yCoord = d.column*ref.cellSize;
                var hintX,hintY,hintLength, j,yOffset;
                var prevHintX = 0,prevHintY = 0, cumulativeLengthTotal=0;
                var hintLengthTotal = 0, currentYOffset = 0;

               //Convert scores into colours and find hint path drawing information
                for(j=0;j< d.values.length;j++){
                    yOffset = hintYOffset(d.values[j]);
                    if (j==0){ currentYOffset = yOffset;}  //Visualization must start at currentview = 0 for this to work
                    hintX = ref.findHintX(j);
                    hintY = ref.findHintY(yOffset);
                    hintLength = ref.calculateDistance(prevHintX,prevHintY,hintX,hintY);
                    hintLengthTotal+= hintLength;
                    hintLengths.push(hintLength+cumulativeLengthTotal);
                    allValues[j] = [generateColour(d.values[j]),d.values[j],hintX,hintY,yOffset];
                    prevHintX = hintX;
                    prevHintY = hintY;
                    cumulativeLengthTotal+=hintLength;
                }
                //Calculate the offset percentages for linear gradient used to colour the hint path
                for (j=0;j<hintLengths.length;j++){
                    allValues[j].push((hintLengths[j]/hintLengthTotal).toFixed(2)*100);
                }
                return {id:i,values:allValues,x:xCoord,y:yCoord};
         })).enter().append("rect").attr("class", "cell")
            .attr("width", this.cellSize).attr("height", this.cellSize)
            .attr("id", function (d) {return "cell"+d.id;})
            .attr("x", function(d) {return d.x; })
            .attr("y", function(d) {return d.y; })
            .attr("fill", function(d) {return d.values[ref.currentView][0]; });

    //Add the g element to contain the hint path for the dragged tile
    this.svg.append("g").attr("id","hintPath");
    //Draw the axes labels and title
    this.addAxisLabels(xLabels,yLabels);
}
/** Calculates the distance between two points
 * (x1,y1) is the first point
 * (x2,y2) is the second point
 * @return the euclidean distance
 * */
Heatmap.prototype.calculateDistance = function(x1,y1,x2,y2){
    var term1 = x1 - x2;
    var term2 = y1 - y2;
    return Math.sqrt((term1*term1)+(term2*term2));
}
/**Draws the labels along the x and y axis, and the title
 * xLabels: 1D array of all labels to appear along the x-axis
 * yLabels: 1D array of all labels to appear along the y-axis
 * */
Heatmap.prototype.addAxisLabels = function (xLabels,yLabels){
    var ref = this;
    this.svg.append("text").attr("id","chartTitle")
        .attr("x",-10).attr("y",-10).text(this.chartTitle);

    this.svg.selectAll(".axisVertical").data(yLabels)
        .enter().append("svg:text")
        .text(function(d) {return d;})
        .attr("x",this.xpos+this.width-100)
        .attr("y",function (d,i){return ref.cellSize*i+ref.cellSize/2;})
        .attr("class","axisVertical");

    this.svg.selectAll(".axisHorizontal").data(xLabels)
        .enter().append("svg:text")
        .text(function(d) { return d;})
        .attr("transform",function (d,i) {
            return "translate("+(ref.cellSize*i+ref.cellSize/2)+
                ","+(ref.ypos+ref.height-100)+") rotate(-65)";
        }).attr("class","axisHorizontal");
}
/** Compares the vertical distance of the mouse with the two bounding views (using the
 *  y-position along the hint path).  From this comparison, the views are resolved and
 *  (if needed), the heatmap is recoloured based on the dragging distance (how close the
 *  user is to one of the bounding views)
 *  id: The id of the dragged cell
 *  mouseY: The y-coordinate of the mouse, received from the drag event
 * */
 Heatmap.prototype.updateDraggedCell = function(id, mouseY){
   var ref = this;
   //Redraw the colours of all cells according to the dragging amount
   this.svg.select("#cell"+id).each(function (d){

       var currentYOffset = d.values[ref.currentView][4];
       var nextYOffset = d.values[ref.nextView][4];
       var currentY = ref.hintYValues[ref.currentView];
       var nextY = ref.hintYValues[ref.nextView];

       //Determine the direction of the path
       var pathDirection;
       if (currentY < nextY){ pathDirection = -1; } //Dragging down
       else if (currentY > nextY){pathDirection = 1;} //Dragging up
       else{pathDirection = 0; } //Ambiguous?

       //Determine whether the path direction has stayed the same or has changed
       if (pathDirection == ref.previousPathDirection){ //Same direction
           currentY = (pathDirection==1)? (ref.draggedCellY - currentY/6):(ref.draggedCellY + currentY/6);
       }else{ //Changed direction, interaction ambiguity
           currentY = ref.draggedCellY; //Start boundary at the center of the dragged cell
       }
       nextY = (pathDirection==1)? (ref.draggedCellY - nextY/6):(ref.draggedCellY + nextY/6);

        //  console.log(currentY+" "+nextY+" "+mouseY+" "+ref.currentView);
       //console.log(currentYOffset+" "+nextYOffset+" "+mouseY+" "+ref.currentView);

       //Find the current vertical dragging direction
       var draggingDirection = mouseY<ref.mouseY? 1:-1;
       console.log(pathDirection+" "+draggingDirection);
       //console.log(ref.currentView+" "+ref.nextView);
       var bounds = ref.checkBounds(currentY,nextY,mouseY);

       if (bounds == mouseY){
           ref.interpolateColours(ref.currentView, ref.nextView,ref.interpValue);
           ref.animateHintPath(currentYOffset,ref.interpValue,draggingDirection);
           ref.previousPathDirection = pathDirection;
       }else if (bounds == currentY){ //Passing current view
           if (pathDirection != ref.previousPathDirection){
              // console.log("changed direction");
               ref.inferTimeDirection(currentY,nextY,mouseY,draggingDirection,pathDirection);
           }else{
               ref.moveBackward();
               ref.previousPathDirection = pathDirection;
           }
       }else{ //Passing next view
           if (pathDirection != ref.previousPathDirection){
               //console.log("changed direction");
               ref.inferTimeDirection(nextY,currentY,mouseY,draggingDirection,pathDirection);
           }else{
               ref.moveForward();
               ref.previousPathDirection = pathDirection;
           }
       }
       ref.previousDragDirection = draggingDirection; //Save the current dragging direction
    });
     console.log(this.currentView+" "+this.nextView);

    this.mouseY = mouseY; //Save the mouse coordinate
}
/**Infers the time direction when user arrives at corners, inference is based on previous direction
 * travelling over time.  The views are updated (forward or backward) whenever the dragging direction
 * changes.
 * b1,b2: the boundary views (b1 should be the currently encountered corner)
 * mouseY: dragging position of the mouse
 * draggingDirection: of the user, 1 if dragging clockwise, -1 is counter-clockwise
 * pathDirection: vertical direction of the hint path (1: up, -1: down)
 * */
Heatmap.prototype.inferTimeDirection = function (b1,b2,mouseY,draggingDirection,pathDirection){

    if (b1 > b2){ //Dragging needs to switch 1 -> -1 in order for view to change
        if (mouseY>=b1 && draggingDirection==-1 && this.previousDragDirection==1){
            if (this.timeDirection ==1){this.moveForward();}
            else{this.moveBackward();}
            this.previousPathDirection = pathDirection;
        }
    }else{//Dragging needs to switch -1 -> 1 in order for the view to change
        if (mouseY<=b1 && draggingDirection==1 && this.previousDragDirection==-1){
            if (this.timeDirection ==1){this.moveForward();}
            else{this.moveBackward();}
            this.previousPathDirection = pathDirection;
        }
    }
}
/** Updates the view variables to move the visualization forward
 * (passing the next view)
 * */
Heatmap.prototype.moveForward = function (){
    if (this.nextView < this.lastView){ //Avoid index out of bounds
        this.currentView = this.nextView;
        this.nextView++;
    }
}
/** Updates the view variables to move the visualization backward
 * (passing the current view)
 * */
Heatmap.prototype.moveBackward = function (){
    if (this.currentView > 0){ //Avoid index out of bounds
        this.nextView = this.currentView;
        this.currentView--;
    }
}
/** Checks if the mouse is in bounds defined by y1 and y2
 *  y1,y2: the bounds
 *  mouseY: the mouse position
 *  @return start,end: boundary values are returned if the given
 *                     mouse position is equal to or has crossed it
 *          distanceRatio: the percentage the mouse has travelled from
 *                         y1 to y2
 * */
Heatmap.prototype.checkBounds = function(y1,y2,mouseY){
    //Resolve the boundaries
    var start,end;
    if (y1>y2){
        end = y1;
        start =y2;
    }else{
        start = y1;
        end = y2;
    }

    //Check if the mouse is between start and end values, re-set the interpValue
    if (mouseY <= start){
        if (this.timeDirection == -1) {this.interpValue = 1; }
        else{this.interpValue = 0;}
        return start;
    } else if (mouseY >=end) {
        if (this.timeDirection == -1) {this.interpValue = 1; }
        else{this.interpValue = 0;}
        return end;
    }

    //Find the amount travelled from current to next view (y1 is current and y2 is next)
    var distanceTravelled = Math.abs(mouseY-y1);
    var totalDistance = Math.abs(y2 - y1);
    var distanceRatio = distanceTravelled/totalDistance;

    //Set the direction travelling over time based on changes in interpolation values
    if (distanceRatio > this.interpValue){ //Moving forward
        this.timeDirection = 1;
    }else { //Going backward
        this.timeDirection = -1;
    }

    this.interpValue = distanceRatio; //Save the current interpValue

    return mouseY;
}
/** Translates the hint path according to the amount dragged from current to next view
 * currentOffset,nextOffset: y-value offsets of the two bounding views
 * interpAmount: amount travelled between the views
 * */
Heatmap.prototype.animateHintPath = function (currentOffset,interpAmount,draggingDirection){
     var translateX = -(this.xSpacing*interpAmount + this.xSpacing*this.currentView);

    if (draggingDirection == -1){
         var translateY = -(this.ySpacing*interpAmount + this.ySpacing*currentOffset);
     }else{
         var translateY = ( this.ySpacing*interpAmount - this.ySpacing*currentOffset);
     }
     console.log(translateY);

     this.svg.select("#hintPath").selectAll("text").attr("transform","translate("+translateX+","+translateY+")");
     this.svg.select("#hintPath").selectAll("path").attr("transform","translate("+translateX+","+translateY+")");
}
/**Updates the colour of the cells by interpolating the colour between views
 * current, next: the views to interpolate between
 * interpAmount: the amount to interpolate by
 */
Heatmap.prototype.interpolateColours = function(current,next,interpAmount){
    var ref = this;
  //Re-colour all cells
  this.svg.selectAll(".cell").attr("fill", function (d){
      return ref.interpolator(d.values[current][0],d.values[next][0],interpAmount);
  });
}
/** Animates the colours of the cells by interpolation within the given view boundaries
 *  start,end: the bounding views
 *  id: of the most recently dragged cell
 * */
//TODO: not priority to fix this function
 Heatmap.prototype.animateColours = function (id,start,end){
    if (start== end){return;}
    var ref = this;
    //Determine the travel direction (e.g., forward or backward in time)
    var direction = 1;
    if (start>end) direction=-1;

    //Define some counter variables to keep track of the views passed during the transition
    var totalViews = this.lastView+1;
    var viewCounter = -1; //Identifies when a new view is reached
    var animateView = start; //Indicates when to switch the views (after all points are finished transitioning)

    //Apply multiple transitions to each display point by chaining them
    this.svg.selectAll(".cell").each(animate());

    //Recursively invoke this function to chain transitions, a new transition is added once
    //the current one is finished
    function animate() {
        viewCounter++;
        if (viewCounter==totalViews) {
            animateView = animateView + direction;
            viewCounter = 0;
        }
        if (direction == 1 && animateView>=end) return;
        if (direction ==-1 && animateView<=end) return;
        return function(d) {
            //Animate the cell's colour
            d3.select(this).transition(400).ease("linear")
                .attr("fill",d.values[animateView][0])
                .each("end", animate());
            //TODO: animate hint path If the cell's hint path is visible, animate it
            /**if (d.id == id){
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
            }*/
        };
    }
}
 /** Snaps to the nearest view once the dragging on a cell stops
 *  Nearest view is the closest point on the hint path (either current or next) to the
 *  most recent y-position of the mouse. View tracking variables are
 *  updated according to which view is "snapped" to.
 *  id: The id of the dragged cell
 *  points: An array of all points along the dragged cell's hint path (e.g., d.values)
 * */
Heatmap.prototype.snapToView = function (id, points,y){
    //!!TODO: this needs to be changed to coincide with the coordinates in updateDraggedCell()
    var current =  y+this.cellSize/2;
    var next = 	points[this.nextView][3]+y+this.cellSize/2-points[this.currentView][3];
    var currentDist = Math.abs(current - this.mouseY);
    var nextDist = Math.abs(next - this.mouseY);

    //Ensure the nextView wasn't the last one to avoid the index going out of bounds
    if (currentDist > nextDist && this.nextView != this.lastView){
        this.currentView = this.nextView;
        this.nextView++;
    }
    //Update the view
    if (this.nextView == this.lastView) {
        this.redrawView(this.currentView+1);
        this.redrawHintPath(points[this.currentView+1][4],this.currentView+1);
    } else {
        this.redrawView(this.currentView);
        this.redrawHintPath(points[this.currentView][4],this.currentView);
    }
}
/** Updates the view tracking variables when the view is being changed by an external
 * visualization (e.g., slider), then redraw the view at the new view.
 * */
Heatmap.prototype.changeView = function (newView){
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
/**Redraws the heatmap at a specified view by re-colouring all cells.
 * id: of the dragged cell
 * */
Heatmap.prototype.redrawView = function(view){
    this.svg.selectAll(".cell").attr("fill", function (d){return d.values[view][0];});
}
/**Redraws the hintpath at a specified view by translating it
 *  view: the view index to draw at
 * */
Heatmap.prototype.redrawHintPath = function(offset,view){

    var translateX = -this.xSpacing*view;
    var translateY = -this.ySpacing*offset;

    this.svg.select("#hintPath").selectAll("text").attr("transform", "translate("+translateX+","+translateY+")");
    this.svg.select("#hintPath").selectAll("path").attr("transform", "translate("+translateX+","+translateY+")");
}
/** Draws a hint path for the dragged cell on the heatmap
 * id: of the dragged cell
 * pathData: information for drawing the path (x,y coords of the line,
 * colouring information for the gradient - This would be d.values)
 * x,y: coordinates of the dragged cell
 * view: the view to start drawing the path at
 * Good tutorial on svg line gradients:
 * http://tutorials.jenkov.com/svg/svg-gradients.html
 * */
Heatmap.prototype.showHintPath = function(id,pathData,x,y){

 //Save some important information
 var ref = this;
 this.draggedCellX = x + this.cellSize/2; //Save the center coordinates of the dragged cell
 this.draggedCellY = y + this.cellSize/2;

 this.checkAmbiguous(pathData); //Check for ambiguous cases

 //Create any array with the hint path coordinates
 var coords = pathData.map(function (d){return [d[2]+ref.draggedCellX,d[3]+ref.draggedCellY,d[4]];});

 //TODO: if the colour does not change for the entire hint path the gradient is not drawn
 //Find the translation amounts, based on the current view
 var translateX = -this.xSpacing*this.currentView;
 var translateY = -this.ySpacing*pathData[this.currentView][4];

 //Draw the interaction path(s) (if any)
  if (this.isAmbiguous ==1){
    this.svg.select("#hintPath").selectAll(".interactionPath")
        .data(this.interactionPaths.map(function (d,i){return {points:d,id:i}}))
        .enter().append("path").attr("d",function (d){return ref.interactionPathGenerator(d.points)})
        .attr("transform","translate("+translateX+","+translateY+")")
        .attr("class","interactionPath");
  }
//Append a clear cell with a black border to show which cell is currently selected and dragged
    this.svg.select("#hintPath").append("rect")
        .attr("x",x).attr("y",y).attr("id","draggedCell")
        .attr("width",this.cellSize).attr("height",this.cellSize);

//Append a linear gradient tag which defines the gradient along the hint path
this.svg.append("linearGradient").attr("id", "line-gradient")
        .attr("spreadMethod","pad")
        .attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%")
        .selectAll("stop").data(pathData).enter().append("stop")
        .attr("offset", function(d) { return d[5]+"%"; })
        .attr("stop-color", function(d) { return d[0]; })
        .attr("stop-opacity",1);

//Draw the white underlayer of the hint path
this.svg.select("#hintPath").append("svg:path")
      .attr("d", this.lineGenerator(coords))
      .attr("id","pathUnderlayer")
      .attr("transform","translate("+translateX+","+translateY+")")
      .attr("filter", "url(#blur)");

//Draw the main hint path line
 this.svg.select("#hintPath").append("svg:path")
      .attr("d",this.lineGenerator(coords))
      .style("stroke", "url(#line-gradient)")
      .attr("transform","translate("+translateX+","+translateY+")")
      .attr("id","path")
      .attr("filter", "url(#blur)");
	
//Draw the hint path labels								  
this.svg.select("#hintPath").selectAll("text")
       .data(coords).enter().append("text")
       .attr("x",function (d){return d[0]}).attr("y",function (d) {return d[1]})
       .attr("transform","translate("+translateX+","+translateY+")")
       .text(function (d,i){ return ref.labels[i];})
       .attr("class","hintLabels")
       .on("click",this.clickHintLabelFunction);

//Save the y-coordinates for finding dragging boundaries
this.hintYValues = coords.map(function (d){return d[1]});
}
/** Clears the hint path for a dragged cell by removing all of
 * it's svg components
 * */
Heatmap.prototype.clearHintPath = function(){
   this.isAmbiguous = 0;
   this.interactionPaths = [];
   this.svg.select("#hintPath").selectAll("rect").remove();
   this.svg.select("#hintPath").selectAll("path").remove();
   this.svg.select("#line-gradient").remove();
   this.svg.select("#hintPath").selectAll("text").remove();
}
/** Re-calculates the x-values for the moving hint path x-coordinates
 * (for both points comprising the path and labels)
 * index: the view index
 * */
Heatmap.prototype.findHintX = function (index){
   return index*this.xSpacing;
}
/** Re-calculates the y-values for the moving hint path
 * (for both points comprising the path and labels)
 * origOffset: original y-offset of the point
 * */
Heatmap.prototype.findHintY = function (origOffset){
    return this.ySpacing*origOffset;
}
/** Search for stationary ambiguous cases in a list of yoffsets of colours (repeated colours).
 *  This information is stored in the ambiguousBars array, which gets re-populated each time a
 *  new cell is dragged.  This array is in  the format: [[type, newY]...number of views]
 *  data: an array containing the yOffsets of the hint path (this will likely be d.values)
 * */
Heatmap.prototype.checkAmbiguous = function (data){
    var j, currentCellOffset;
    var stationaryCells = [];
    this.isAmbiguous = 0;
    this.ambiguousCells = [];
    var yOffsets = data.map(function (d){return d[4];}); //Flatten the array to only contain y-offsets

    //Re-set the ambiguousCells array
    for (j=0;j<=this.lastView;j++){
        this.ambiguousCells[j] = 0;
    }

    //Populate the stationary cells array by searching for sequences of continuous equal y-offsets
    for (j=0;j<=this.lastView;j++){
        currentCellOffset= yOffsets[j];
        for (var k=j;k<=this.lastView;k++){
            if (j!=k && yOffsets[k]== currentCellOffset){ //Repeated colour is found
                if (Math.abs(k-j)==1){ //Stationary colour
                    this.isAmbiguous = 1;
                    //If the bar's index does not exist in the array of all stationary bars, add it
                    if (stationaryCells.indexOf(j)==-1){
                        stationaryCells.push(j);
                        this.ambiguousCells[j] = 1;
                    }if (stationaryCells.indexOf(k)==-1){
                        stationaryCells.push(k);
                        this.ambiguousCells[k] = 1;
                    }
                }
            }
        }
    }
    //First check if there exists any stationary colours in the dataset..
    if (this.isAmbiguous ==1){
        this.findPaths(d3.min(stationaryCells),yOffsets);//Then, generate points for drawing an interaction path
    }
}
/** This function will populate an array containing all data for drawing a sine wave:
 * interactionPaths[] = [[points for the sine wave]..number of paths]
 * startIndex: the index of the first stationary cell (optional, just set to 0 if not known)
 * pathData: d.values
 * */
Heatmap.prototype.findPaths = function (startIndex,offsets){
    var pathInfo = [];
    pathInfo[0] = offsets[startIndex];
    pathInfo[1] = [];
    for (var j=startIndex; j<=this.lastView;j++){
        if (this.ambiguousCells[j]==1){
            if (j!=startIndex && this.ambiguousCells[j-1]!=1){ //Starting a new path
                this.interactionPaths.push(this.calculatePathPoints(pathInfo[0],pathInfo[1]));
                pathInfo = [];
                pathInfo[0] = offsets[j];
                pathInfo[1] = [];
            }
            pathInfo[1].push(j);
        }
    }
    this.interactionPaths.push(this.calculatePathPoints(pathInfo[0],pathInfo[1]));
}
/** Calculates a set of points to compose a sine wave (for an interaction path)
 * indices: the corresponding year indices, this array's length is the number of peaks of the path
 * offset: view offset of the stationary points
 * @return an array of points for drawing the sine wave: [[x,y], etc.]
 * */
Heatmap.prototype.calculatePathPoints = function (offset,indices){
    var angle = 0;
    var pathPoints = [];

    //Find the period of the sine function
    var length = indices.length;
    var totalPts = 3*length + (length-3);

    //Calculate the points (5 per gap between views)
    for (var j=0;j<totalPts;j++){
        var theta = angle + (Math.PI/4)*j;
        var y = this.amplitude*Math.sin(theta) + this.ySpacing*offset +this.draggedCellY;
        var x = (this.xSpacing/4)*j + this.draggedCellX;
        pathPoints.push([x,y]);
    }

    //Insert the end direction (1=peak, -1=trough) of the sine wave into ambiguousBars array
    // (first direction will always be -1)
    var endDirection = (indices.length % 2==0)?-1:1;
    this.ambiguousCells[indices[indices.length-1]] = [1,endDirection];

    return pathPoints;
}

//Todo:ambiguous interaction along hint path (same colour, interaction path?)
//Todo: non-existent data values in cell (white?), this would involve screening the dataset as well, similar to ambiguous cases

//TODO: draw colour scale legend next to heatmap?