/** Constructor for a heatmap visualization
 * p: the margins
 * cs: pixel size of the cells
 * title: of the chart
 * hLabels: labels to appear along the hint paths
 */
function Heatmap(p, cs,title,hLabels) {
   // Position and size attributes
   this.padding = p;
   this.cellSize = cs;
   this.chartTitle = title;
   this.svg = null;
   this.width = null;
   this.height = null;

   //Variables to track interaction events
   this.currentView = 0;
   this.nextView = 1;
   this.lastView = hLabels.length-1;
   this.previousDragDirection = 1; //Dragging direction of the user: 1 if up, -1 if down
   this.timeDirection = 1 //Direction travelling over time, 1: forward, -1: backward

  // this.useMobile = false;
   this.hintPathType = 0;

   this.mouseY= 0;
   this.mouseX = 0;
   this.interpValue = 0; //Value to track the progress of colour interpolation when switching between views
   this.draggedCell = -1; //Keeps track of the id of the dragged cell
   this.draggedCellX = -1; //Saved x coordinate of the dragged cell
   this.draggedCellY = -1; //Saved y coordinate of the dragged cell
   this.hintYValues = []; //Saves the hint y-values (at the first view)
   this.numCells = -1; //Set this later in render()

   this.ambiguousCells = []; //Keeps track of which cells are part of an ambiguous case
   this.isAmbiguous = 0;  //A flag to quickly check whether or not there exists ambiguous cases in the data
   this.allStationary = 0; //A flag which indicates whether or not all cells have the same colour for the entire hint path
   this.amplitude = 10; //Of the sine wave (interaction path)
   this.interactionPaths = [];
   this.atPeak = -1;
   this.passedMiddle = -1; //Passed the mid point of the peak of the sine wave
   this.peakValue = null;
   this.pathDirection = -1;
   this.heightThreshold = 0;

   //Display properties
   this.labels = hLabels;
   this.xSpacing = 50; //Spacing across x for hint path
   this.ySpacing = 10; //Spacing for the y of hint path
   this.colours = [];

   //Declare some interaction event functions
   this.dragEvent = {};
   this.clickHintLabelFunction = {};
   this.clickSVG = {};

  //Function for drawing the hint path line
  //Note: array of points should be in the format [[x,y]..etc.]
   this.hintPathGenerator = d3.svg.line().interpolate("linear");

   //Function for drawing a sine wave (interaction path)
   this.interactionPathGenerator = d3.svg.line().interpolate("monotone");

   //Interpolate function between two values, at the specified amount
   this.interpolator = function (a,b,amount) {return d3.interpolate(a,b)(amount)};
}
/** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
 *  will be drawn. Also, add a blur filter for the hint path effect.
 * */
Heatmap.prototype.init = function() {
    /**this.svg = d3.select(this.id)
      .append("svg").attr("id","mainSvg")
      .on("click",this.clickSVG)
      .append("g")
      .attr("transform", "translate(" + this.xpos + "," + this.ypos + ")");*/

   this.svg = d3.select("#mainSvg")
        .append("g").attr("id","gHeatmap")
        .attr("transform", "translate(" + this.padding + "," + this.padding + ")");

   this.svg.append("svg:defs").append("svg:filter")
      .attr("id", "blur").append("svg:feGaussianBlur")
      .attr("stdDeviation", 2);

   this.svg.append("svg:defs").append("svg:filter")
       .attr("id", "blur2").append("svg:feGaussianBlur")
       .attr("stdDeviation", 1);
}
/**Calls the util function to draw a legend on the screen
 * x,y: position of the legend on the screen
 * */
Heatmap.prototype.showLegend = function(colourLabels,x,y){
    drawColourLegend(this,this.colours,colourLabels,x,y,30,15,1.2);
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

    this.colours = colorbrewer.YlOrRd[7];
    //Set the width and height of the svg, now that the dimensions are known
    this.width = xLabels.length*this.cellSize+100;
    this.height = yLabels.length*this.cellSize+100;
    d3.select(this.id).select("#mainSvg").attr("width", this.width).attr("height", this.height);

    this.numCells = data.length;

    //Find the max and min score in the dataset (used for the colour scale)
    var maxScore = d3.max(data.map(function (d){return d3.max(d.values); }));
    var minScore = d3.min(data.map(function (d){return d3.min(d.values); }));

    var generateColour = d3.scale.quantize().domain([maxScore,minScore]).range(this.colours);

    //Find the hint y value (of the colour along the colour scale)
    var hintYOffset = d3.scale.quantize().domain([minScore,maxScore])
        .range(ref.colours.map(function(d,i){return i;}).reverse());//Lower colours on scale have lower offsets
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
                var hintLengthTotal = 0;

               //Convert scores into colours and find hint path drawing information
                for(j=0;j< d.values.length;j++){
                    yOffset = hintYOffset(d.values[j]);
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
                var newValues = ref.findPeaks(allValues);
                return {id:i,values:newValues,x:xCoord,y:yCoord};
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
/**Finds the peaks in a set of values (e.g., dragging direction is ambiguous at these parts)
 * data: a multi-dimension array of all values, but only interested in the yOffset (at index 4)
 * @return the same array with added values to each array entry: 0 or 1/-1 flag if it is a peak/trough respectively
 * */
Heatmap.prototype.findPeaks = function (data){
    var newData = data;
    var endIndex = data.length-1;
    newData[0].push(0); //First view is not a peak

    for (var j=0;j<data.length;j++){
        var currentY = data[j][4];
        if (j>0 && j < endIndex){
            if (data[j-1][4] < currentY && data[j+1][4] < currentY){ //Upwards peak
                newData[j].push(-1);
            }else if (data[j-1][4] > currentY && data[j+1][4] > currentY){ //Downwards peak
                newData[j].push(1);
            }else{ //No peak
                newData[j].push(0);
            }
        }
    }
    newData[endIndex].push(0); //Last view is not a peak
    return newData;
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
    this.svg.append("text").attr("id","chartTitle").attr("class","axis")
        .attr("x",-10).attr("y",/**-10*/-50).text(this.chartTitle);

    this.svg.selectAll(".axisVertical").data(yLabels)
        .enter().append("svg:text")
        .text(function(d) {return d;})
        .attr("x",this.padding+this.width-/**100*/160)
        .attr("y",function (d,i){return ref.cellSize*i+ref.cellSize/2;})
        .attr("class","axisVertical");

    this.svg.selectAll(".axisHorizontal").data(xLabels)
        .enter().append("svg:text")
        .text(function(d) { return d;})
        .attr("transform",function (d,i) {
            return "translate("+(ref.cellSize*i+ref.cellSize/2)+",-10)"/**+
                ","+(ref.padding+ref.height-100)+")" "rotate(-65)";*/
        }).attr("class","axisHorizontal");
}
/** Compares the vertical distance of the mouse with the two bounding views (using the
 *  y-position along the hint path).  From this comparison, the views are resolved and
 *  (if needed), the heatmap is recoloured based on the dragging distance (how close the
 *  user is to one of the bounding views)
 *  id: The id of the dragged cell
 * */
 Heatmap.prototype.updateDraggedCell = function(id, mouseY,mouseX,values){

       //Find the current vertical dragging direction of the user
       var draggingDirection = (mouseY > this.mouseY)? -1 : (mouseY <this.mouseY)? 1 : this.previousDragDirection;

       //Re-set the time direction and dragging direction if the dragging has just started
       if (this.timeDirection ==0){
           this.timeDirection = 1; //Forward in time by default
           draggingDirection = this.previousDragDirection;
       }

       var current = values[this.currentView];
       var next = values[this.nextView];
       var currentY = this.hintYValues[this.currentView];
       var nextY = this.hintYValues[this.nextView];

       /**var smallCurrentY = ref.draggedCellY; //Center of the dragged cell
       var smallNextY;
       var diff = Math.abs(ref.draggedCellY - nextY)/2;
       if (nextY > ref.draggedCellY){
           smallNextY = smallCurrentY + diff;
       }else{
           smallNextY = smallCurrentY - diff;
       }

       console.log(smallCurrentY+" "+smallNextY);
       var translateFactor = Math.abs(smallCurrentY - smallNextY);
       console.log(translateFactor);*/

       //Old code for shrinking the dragging frame and then translating vertically as well as horizontally
       //Determine the slop of the line between views
       /** var slope;
       if (current[4]>next[4]){ //Upwards slope
           slope = 1;
       }else{ //Downwards
           slope = -1;
       }
       var smallCurrentY,smallNextY;
       if (current[6]==0){ //Non-peak
           smallCurrentY = (slope==1)? (ref.draggedCellY - current[4]*4):(ref.draggedCellY + current[4]*4);
       }else{ //Changed direction, interaction ambiguity
           smallCurrentY = ref.draggedCellY; //Start boundary at the center of the dragged cell
       }
       smallNextY = (slope==1)? (ref.draggedCellY - next[4]*4):(ref.draggedCellY + next[4]*4);*/
       //console.log(smallCurrentY+" "+smallNextY);

       if (this.isAmbiguous==1){ //At least one ambiguous region exists on the hint path

           var currentAmbiguous = this.ambiguousCells[this.currentView];
           var nextAmbiguous = this.ambiguousCells[this.nextView];

           //Check where the mouse is w.r.t the sine wave (e.g., at an end point, in the middle of it etc.)
           if (currentAmbiguous[0] == 1 && nextAmbiguous[0] ==0){ //Approaching sine wave from right (along hint path)
               setSineWaveVariables(this,currentAmbiguous[1],currentY,1);
               //hideAnchor(ref,2);

               if((currentY>nextY && this.pathDirection==1) || (currentY<nextY && this.pathDirection==1)){ //Detect if the sine wave and regular hint path form a peak at end point
                   this.atPeak = this.currentView;
               }

               this.handleDraggedCell(current,next,currentY,nextY,mouseY,draggingDirection);
           }else if (currentAmbiguous[0] == 0 && nextAmbiguous[0]==1){ //Approaching sine wave from the left
               setSineWaveVariables(this,nextAmbiguous[1],nextY,0);
               //hideAnchor(ref,2);

               if(currentY>nextY){ //Detect if the sine wave and regular hint path form a peak at end point
                   this.atPeak = this.nextView;
               }

               this.handleDraggedCell(current,next,currentY,nextY,mouseY,draggingDirection);
           }else if(currentAmbiguous[0]==1 && nextAmbiguous[0]==1){ //In middle of sine wave

               //Dragging has started in the middle of a sequence, need to determine the time direction based on the vertical dragging direction
               if (this.passedMiddle == -1){
                   setSineWaveVariables(this,draggingDirection,currentY,0);
                   //If vertical dragging indicates the time direction should move backwards, in this case need to update the view variables
                   if (this.pathDirection != currentAmbiguous[1] && this.currentView>0){
                       this.passedMiddle = 1;
                       moveBackward(this,draggingDirection);
                   }
               }

               this.handleDraggedCell_stationary(currentY,mouseY,draggingDirection);
           }else{ //Not encountering the sine wave
               this.atPeak = -1;
               //hideAnchor(ref,2);
               this.handleDraggedCell(current,next,currentY,nextY,mouseY,draggingDirection);
           }
       }else{
           this.handleDraggedCell(current,next,currentY,nextY,mouseY,draggingDirection);
       }
console.log(this.timeDirection);
     this.previousDragDirection = draggingDirection;
     this.mouseY = mouseY;
     this.mouseX = mouseX;
}
/** Resolves a dragging interaction by comparing the current mouse position with the bounding
 *  y positions of current and next views.  Ensures the mouse dragging does not cause the dragged
 *  bar to be drawn out of bounds and keeps track of time by updating the view variables.
 *  current, next: The nodes for each cell of current and next views (i.e., [y-pos,height])
 * */
Heatmap.prototype.handleDraggedCell = function (current,next,currentY,nextY,mouseY,draggingDirection){
    var bounds = checkBounds(this,currentY,nextY,mouseY);
    //console.log(currentY+" "+nextY+" "+mouseY+" "+ref.currentView+" "+ref.nextView);
    if (bounds == mouseY){
        findInterpolation(this,currentY,nextY,mouseY,0,draggingDirection);
        this.interpolateColours(this.currentView, this.nextView,this.interpValue);
        this.animateHintPath(current[4],this.interpValue);
    }else if (bounds == currentY){ //Passing current view
        if (current[6]!=0 || this.atPeak == this.currentView){ //At a peak
            inferTimeDirection(this,draggingDirection,1);
        }else{
            moveBackward(this,draggingDirection);
        }
    }else{ //Passing next view
        if (next[6]!=0 || this.atPeak == this.nextView){ //At a peak
            inferTimeDirection(this,draggingDirection,0);
        }else{
            moveForward(this,draggingDirection);
            //console.log(findPixelDistance(this.mouseX,this.mouseY,this.draggedCellX,this.draggedCellY));
        }
    }
}
/** Resolves a dragging interaction in a similar method as handleDraggedCell, except
 *  this function is only called when in the middle of a stationary sequence.
 *  cellY: The y-position of the stationary bar
 * */
Heatmap.prototype.handleDraggedCell_stationary = function  (cellY,mouseY,draggingDirection){

    //If the atPeak variable is set to and index, it means that the first or last point on the sine wave is forming
    //A peak with the hint path
    if (this.atPeak!=-1){ //At one end point on the sine wave
        if (draggingDirection != this.previousDragDirection){ //Permit view updates when the dragging direction changes
            this.atPeak = -1;
        }
    }
    var bounds = checkBounds(this,this.peakValue,cellY,mouseY);
    //var newY; //To re-position the anchor

    if (bounds == mouseY){
        findInterpolation(this,cellY,this.peakValue, mouseY, 1,draggingDirection);
        this.interpolateColours(this.currentView, this.nextView,this.interpValue);
        this.animateHintPath(0,this.interpValue);
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
                setSineWaveVariables(this,newPathDirection,cellY,0);
            }else if (this.timeDirection==-1 && this.currentView >0){
                moveBackward(this,draggingDirection);
                setSineWaveVariables(this,newPathDirection,cellY,1);
            }else if (this.nextView == this.lastView){ //TODO:Kind of a redundant solution (because the code in util already does this) figure out a better way
                if (draggingDirection != this.previousDragDirection){ //Flip the direction when at the end of the hint path
                    this.timeDirection = (this.timeDirection==1)?-1:1;
                    this.atPeak= this.nextView;
                }
            }
        }
        //newY=cellY;
    }
   // redrawAnchor(this,-1,-1,-1,newY,2);
}
/** Translates the hint path according to the amount dragged from current to next view
 * currentOffset,nextOffset: y-value offsets of the two bounding views
 * interpAmount: amount travelled between the views
 * */
Heatmap.prototype.animateHintPath = function (currentOffset,interpAmount){
    var ref = this;
    var translateX = -(this.xSpacing*interpAmount + this.xSpacing*this.currentView);

    this.svg.select("#path").attr("transform","translate("+translateX+")");
    this.svg.select("#pathUnderlayer").attr("transform","translate("+translateX+")");
    this.svg.selectAll(".interactionPath").attr("transform","translate("+translateX+")");

    this.svg.select("#hintPath").selectAll("text").attr("transform","translate("+translateX+")")
        .attr("fill-opacity",function (d){
            if (d.id == ref.currentView){
                return d3.interpolate(1,0.3)(interpAmount);
            }else if (d.id == ref.nextView){
                return d3.interpolate(0.3,1)(interpAmount);
            }
            return 0.3;
        });
    if (this.hintPathType ==1){
        this.svg.select("#forwardPath").attr("transform","translate("+translateX+")");
        this.svg.select("#backwardPath").attr("transform","translate("+translateX+")");
        redrawSmallHintPath(this,this.ambiguousCells,translateX);
    }
}
/**Updates the colour of the cells by interpolating the colour between views
 * current, next: the views to interpolate between
 * interpAmount: the amount to interpolate by
 */
Heatmap.prototype.interpolateColours = function(current,next,interpAmount){
  var ref = this;
  this.svg.selectAll(".cell").attr("fill", function (d){
      return ref.interpolator(d.values[current][0],d.values[next][0],interpAmount);
  });
}
/** Animates the colours of the cells by interpolation within the given view boundaries
 *  start,end: the bounding views
 *  id: of the dragged cell
 * */
 Heatmap.prototype.animateColours = function (id,start,end){
    var ref = this;

    if (start== end){return;}

    //Determine the travel direction (e.g., forward or backward in time)
    var direction = 1;
    if (start>end) direction=-1;

    //Define some counter variables to keep track of the views passed during the transition
    var totalCells = this.numCells;
    var viewCounter = -1; //Identifies when a new view is reached
    var animateView = start; //Indicates when to switch the views (after all points are finished transitioning)

    //Apply multiple transitions to each display point by chaining them
    this.svg.selectAll(".cell").each(animate());

    //Recursively invoke this function to chain transitions, a new transition is added once
    //the current one is finished
    function animate() {
        viewCounter++;
        if (viewCounter==totalCells) {
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

           //Animate hint path if it is visible
            if (d.id == id){
                var translate = -animateView*ref.xSpacing;
                //Re-draw the hint path and labels
                d3.select("#path").attr("transform","translate("+translate+")");
                d3.select("#pathUnderlayer").attr("transform","translate("+translate+")");
                d3.selectAll(".interactionPath").attr("transform","translate("+translate+")");

                d3.selectAll(".hintLabels").attr("transform","translate("+translate+")")
                    .attr("fill-opacity", function (b) {return (b.id==animateView)?1:0.3});
            }
        };
    }
}
 /** Snaps to the nearest view once the dragging on a cell stops
 *  Nearest view is the closest point on the hint path (either current or next) to the
 *  most recent y-position of the mouse. View tracking variables are
 *  updated according to which view is "snapped" to.
 **/
Heatmap.prototype.snapToView = function (){

    var currentDist, nextDist;

    if (this.ambiguousCells[this.currentView][0]==1 && this.ambiguousCells[this.nextView][0]==1){

        if (this.interpValue > 0.5){ //Snap to nextView
            currentDist = 1;
            nextDist = 0;
        }else{ //Snap to current view
            currentDist = 0;
            nextDist = 1;
        }
    }else{
        currentDist = Math.abs(this.hintYValues[this.currentView] - this.mouseY);
        nextDist = Math.abs(this.hintYValues[this.nextView] - this.mouseY);
    }

    //Ensure the nextView wasn't the last one to avoid the index going out of bounds
    if (currentDist > nextDist && this.nextView <= this.lastView){
        this.currentView = this.nextView;
        this.nextView++;
    }

     this.redrawView(this.currentView);
     this.redrawHintPath(this.currentView);
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
Heatmap.prototype.redrawHintPath = function(view){
    if (this.hintPathType==1){
        hideSmallHintPath(this);
    }else{
        var translateX = -this.xSpacing*view;

        this.svg.select("#hintPath").selectAll("text").attr("transform", "translate("+translateX+")")
            .attr("fill-opacity",function (d){return (d.id==view)?1:0.3});

        this.svg.select("#path").attr("transform", "translate("+translateX+")");
        this.svg.select("#pathUnderlayer").attr("transform", "translate("+translateX+")");
        this.svg.selectAll(".interactionPath").attr("transform", "translate("+translateX+")");
    }
}
/** Called each time a new bar is dragged.  Searches for ambiguous regions, and draws the hint path
 * id: of the dragged cell
 * pathData: information for drawing the path (x,y coords of the line,
 * colouring information for the gradient - This would be d.values)
 * x,y: coordinates of the dragged cell
 *  */
Heatmap.prototype.selectCell = function (id,pathData,x,y){
    //In case next view went out of bounds (from snapping to view), re-adjust the view variables
    var drawingView = adjustView(this);

    this.timeDirection = 0;  //In case dragging starts at a peak..
    this.previousDragDirection = (pathData[this.nextView][1]>pathData[this.currentView][1])?1:-1;

    //Save some important information
    var ref = this;
    this.draggedCellX = x + this.cellSize/2; //Save the center coordinates of the dragged cell
    this.draggedCellY = y + this.cellSize/2;

    this.allStationary = 0;
    var yOffsets = pathData.map(function(d){return d[4]});
    var ambiguousData = checkAmbiguous(this,yOffsets,this.heightThreshold);
    this.ambiguousCells = ambiguousData[0];

    //Create any array with the hint path coordinates
    var translateY = -this.ySpacing*pathData[drawingView][4];
    var coords = pathData.map(function (d){return [d[2]+ref.draggedCellX,d[3]+ref.draggedCellY+translateY,d[4]];});

    //Find the translation amounts, based on the current view
    var translateX = -this.xSpacing*drawingView;

    //Draw the interaction path(s) (if any)
    if (this.isAmbiguous ==1){
        this.interactionPaths = [];
        ambiguousData[1].forEach(function (d){ref.interactionPaths.push(ref.calculatePathPoints(yOffsets[d[0]],d))});
        this.drawInteractionPaths(translateX,translateY);
    }

    //Append a clear cell with a black border to show which cell is currently selected and dragged
    this.svg.select("#hintPath").append("rect")
        .attr("x",x).attr("y",y).attr("id","draggedCell")
        .attr("width",this.cellSize).attr("height",this.cellSize);

     if (this.hintPathType ==0){
        this.drawHintPath(id,pathData,coords,translateX,drawingView);
     }else{
        drawSmallHintPath(this,translateX,coords,false);
        this.svg.select("#hintPath").selectAll("path").attr("transform","translate("+translateX+")");
     }

    //Save the y-coordinates for finding dragging boundaries
    this.hintYValues = coords.map(function (d){return d[1]});
}
/**Draws a hint path for the dragged cell on the heatmap
 * view: the view to start drawing the path at
 * Good tutorial on svg line gradients: http://tutorials.jenkov.com/svg/svg-gradients.html
 * */
Heatmap.prototype.drawHintPath = function(id,pathData,coords,translateX,view){
 var ref = this;
//Append a linear gradient tag which defines the gradient along the hint path (only if cell colour changes at least once)
if (this.allStationary == 0){
    this.svg.append("linearGradient").attr("id", "line-gradient")
        .attr("spreadMethod","pad")
        .attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%")
        .selectAll("stop").data(pathData).enter().append("stop")
        .attr("offset", function(d) { return d[5]+"%"; })
        .attr("stop-color", function(d) { return d[0]; })
        .attr("stop-opacity",1);

    //Draw the white underlayer of the hint path
    this.svg.select("#hintPath").append("svg:path")
        .attr("d", this.hintPathGenerator(coords))
        .attr("id","pathUnderlayer")
        .attr("transform","translate("+translateX+")")
        .attr("filter", "url(#blur2)");

    //Draw the main hint path line
    this.svg.select("#hintPath").append("svg:path")
        .attr("d",this.hintPathGenerator(coords))
        .style("stroke", "url(#line-gradient)")
        .attr("transform","translate("+translateX+")")
        .attr("id","path").attr("filter", "url(#blur)");

//TODO: this solution should be applied to the barchart as well, even though the scenario seems unlikely..
}else{ //All points on the hint path are stationary, can't use blur on svg path..

    //Current solution: draw the hint path as a rectangle (not very elegant, find the real problem later..)
    var pathWidth = Math.abs(coords[0][0] - coords[coords.length-1][0]);
    this.drawHintRect(coords[0][0],coords[0][1],pathWidth,translateX,pathData[0][0]);
}
	
//Draw the hint path labels								  
this.svg.select("#hintPath").selectAll("text")
       .data(coords.map( function (d,i){
           return {x:d[0],y:d[1],label:ref.labels[i],id:i}
       })).enter().append("text")
       .attr("x",function (d){return d.x}).attr("y",function (d) {return d.y})
       .attr("transform","translate("+translateX+")")
       .attr("fill-opacity",function (d){ return ((d.id==view)?1:0.3)})
       .text(function (d){ return d.label;})
       .attr("class","hintLabels")
       .on("click",this.clickHintLabelFunction);

}
/**Draws the hint path as a rectangle (in the case where all colours are the same along the hint path) */
Heatmap.prototype.drawHintRect = function (startX,startY,width,translateAmount,colour){

    this.svg.append("svg:defs").append("svg:filter")
        .attr("id", "blur3").append("svg:feGaussianBlur")
        .attr("stdDeviation", 1);

    this.svg.select("#hintPath").append("rect")
        .attr("x",startX).attr("y",startY).attr("height",6).attr("width",width)
        .style("fill",colour).style("stroke","#FFF").style("stroke-width",1)
        .attr("transform","translate("+translateAmount+")")
        .attr("id","path").attr("filter", "url(#blur3)");
}
/** Clears the hint path for a dragged cell by removing all of
 * it's svg components
 * */
Heatmap.prototype.clearHintPath = function(){
   this.interactionPaths = [];
  // removeAnchor(this);
   this.svg.select("#hintPath").selectAll("rect").remove();
   this.svg.select("#path").remove();
   this.svg.select("#pathUnderlayer").remove();
   this.svg.selectAll(".interactionPath").remove();
   this.svg.select("#line-gradient").remove();
   this.svg.select("#hintPath").selectAll("text").remove();

  if (this.hintPathType ==1){
        this.svg.select("#forwardPath").remove();
        this.svg.select("#backwardPath").remove();
  }
}
/** Re-calculates the x-values for the moving hint path x-coordinates
 * (for both points comprising the path and labels)
 * index: the view index
 * */
Heatmap.prototype.findHintX = function (index){
   return index*this.xSpacing;
}
/** Calculates the y-values for the peaks along the hint path
 * origOffset: y-offset of the colour
 * */
Heatmap.prototype.findHintY = function (yOffset){
    return this.ySpacing*yOffset;
}
/** Calculates a set of points to compose a sine wave (for an interaction path)
 * indices: the corresponding year indices, this array's length is the number of peaks of the path
 * offset: view offset of the stationary points
 * @return an array of points for drawing the sine wave: [[x,y], etc.]
 * */
Heatmap.prototype.calculatePathPoints = function (offset,indices){
    var angle = 0;
    var pathPoints = [];
    var quarterPi = Math.PI/4;
    var startX = indices[0]*this.xSpacing;

    var sign = -1;
    var indexCounter = 0;

    //Find the period of the sine function
    var length = indices.length;
    var totalPts = 3*length + (length-3);

    //Calculate the points (5 per gap between views)
    for (var j=0;j<totalPts;j++){
        var theta = angle + quarterPi*j;
        var y = this.amplitude*Math.sin(theta) + this.ySpacing*offset + this.draggedCellY;
        var x = (this.xSpacing/4)*j + startX + this.draggedCellX;
        if (j%4==0){ //Add the sign (+1 for peak, -1 for trough) to each ambiguous cell along the sine wave
            this.ambiguousCells[indices[indexCounter]] = [1,sign];
            indexCounter++;
            sign = (sign==-1)?1:-1; //Flip the sign of the sine wave direction
        }
        pathPoints.push([x,y]);
    }

    //Insert the end direction of the sine wave
    var endDirection = (indices.length % 2==0)?-1:1;
    this.ambiguousCells[indices[indices.length-1]] = [1,endDirection];

    return pathPoints;
}
/** Draws interaction paths as sine waves with a dashed line, also sets the passedMiddle variable
 *  translateX,Y: the amount to translate the path by initially
 * */
Heatmap.prototype.drawInteractionPaths = function(translateX,translateY){
    var ref = this;
    this.svg.select("#hintPath").selectAll(".interactionPath")
        .data(this.interactionPaths.map(function (d,i){
        var adjustedPoints = d.map(function (b){return [b[0],b[1]+translateY]})
        return {points:adjustedPoints,id:i}
    }))
        .enter().append("path").attr("d",function (d){return ref.interactionPathGenerator(d.points)})
        .attr("transform","translate("+translateX+")")
        .attr("class","interactionPath");

    //appendAnchor(this,this.draggedCellX,this.draggedCellY,2);
    this.passedMiddle = -1; //In case dragging has started in the middle of a sine wave..
}
