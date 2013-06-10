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
   this.labelColour = "#c7c7c7";
   this.chartTitle = title;
   this.svg = null;
   this.width = null;
   this.height = null;

   //Variables to track interaction events
   this.currentView = 0;
   this.nextView = 1;
   this.lastView = hLabels.length-1;
   this.viewChange = 1; //Decrement or increment the currentview
   this.mouseY=null; //To track the mouse position
   this.interpValue = 0; //Value to track the progress of colour interpolation when switching between views
   this.pixelTolerance = 2; //Number of pixels to move before an interpolation in colour occurs (slow down the colour switching)
   this.draggedCell = -1; //Keeps track of the id of the dragged cell
   this.draggedCellX = -1; //Saved x coordinate of the dragged cell
   this.draggedCellY = -1; //Saved y coordinate of the dragged cell

   //Display properties
   this.labels = hLabels;
   this.numViews = hLabels.length;
   this.xSpacing = 50; //Spacing across x for hint path
   this.ySpacing = 20; //Spacing for the y of hint path

   //Declare some interaction event functions
   this.dragEvent = {};
   this.clickHintLabelFunction = {};
   this.clickSVG = {};

  //Function for drawing the hint path line
  //Note: array of points should be in the format [[x,y]..etc.]
   this.lineGenerator = d3.svg.line().x(function(d){return d[0];}).y(function(d){return d[1];}).interpolate("linear");
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
                //Convert scores into colours
                var allValues = [];
                var xCoord = d.row*ref.cellSize;
                var yCoord = d.column*ref.cellSize;
                var hintX,hintY,hintLength, j,yOffset;
                var prevHintX = 0,prevHintY = 0, cumulativeLengthTotal=0;
                var hintLengths = [];
                var hintLengthTotal = 0;
                var currentYOffset = 0;
                for(j=0;j< d.values.length;j++){
                    yOffset = hintYOffset(d.values[j]);
                    if (j==0){ currentYOffset = yOffset;}  //Always start the visualization at currentview = 0
                    hintX = ref.findHintX(j,ref.currentView);
                    hintY = ref.findHintY(yOffset, currentYOffset);
                    hintLength = ref.calculateDistance(prevHintX,prevHintY,hintX,hintY);
                    hintLengthTotal+= hintLength;
                    hintLengths.push(hintLength+cumulativeLengthTotal);
                    allValues[j] = [generateColour(d.values[j]),d.values[j],hintX,hintY,yOffset];
                    prevHintX = hintX;
                    prevHintY = hintY;
                    cumulativeLengthTotal+=hintLength;
                }
                //Calculate the offsets (for linear gradient on hint path)
                for (j=0;j<hintLengths.length;j++){
                    allValues[j].push((hintLengths[j]/hintLengthTotal).toFixed(2)*100);
                 }
                return {id:i,values:allValues,x:xCoord,y:yCoord,colours:[],pathData:[]};
             })).enter().append("rect").attr("class", "cell")
                .attr("width", this.cellSize).attr("height", this.cellSize)
                .attr("id", function (d) {return "cell"+d.id;})
                .attr("x", function(d) {return d.x; })
                .attr("y", function(d) {return d.y; })
                .attr("fill", function(d) {return d.values[ref.currentView][0]; })
                .style("cursor", "pointer");

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
        .attr("x",-10).attr("y",-10).attr("fill",this.labelColour)
        .text(this.chartTitle);

    this.svg.selectAll(".axisVertical").data(yLabels)
        .enter().append("svg:text")
        .text(function(d) {return d;})
        .attr("x",this.xpos+this.width-100)
        .attr("y",function (d,i){return ref.cellSize*i+ref.cellSize/2;})
        .attr("fill",this.labelColour)
        .attr("class","axisVertical");

    this.svg.selectAll(".axisHorizontal").data(xLabels)
        .enter().append("svg:text")
        .text(function(d) { return d;})
        .attr("transform",function (d,i) {
            return "translate("+(ref.cellSize*i+ref.cellSize/2)+
                ","+(ref.ypos+ref.height-100)+") rotate(-65)";
        }).attr("fill",this.labelColour)
        .attr("class","axisHorizontal")
        .style("text-anchor", "end");
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
   this.mouseY = mouseY;

   this.svg.select("#cell"+id).each(function (d){
       var currentY = ref.draggedCellY; //Current will always be the center of the dragged cell
       var currentYOffset = d.values[ref.currentView][4];
       var nextYOffset = d.values[ref.nextView][4];
       var nextY =  ref.findHintY(d.values[ref.nextView][4],currentYOffset);
       //console.log(currentY+" "+nextY+" "+mouseY+" "+ref.currentView);
       console.log(currentYOffset+" "+nextYOffset+" "+mouseY+" "+ref.currentView);
       //TODO: Shrink the bounding coordinates such that the mouse does not move off the dragged cell?
       /**var direction;
       var difference = Math.abs(currentYOffset - nextYOffset);
       if (currentY > nextY){ //Dragging upwards
          direction = -1;
       }else if (currentY< nextY){ //Dragging downwards
          direction = 1;
       }else{ //Ambiguous case
          direction = 0;
       }
       console.log(direction+" "+difference);*/
       //console.log(ref.currentView+" "+ref.nextView);
       var bounds = ref.checkBounds(currentY,nextY,mouseY);
       if (ref.currentView ==0){ //First view
           if (bounds==currentY){ //Exceeding the first view, out of bounds
              return;
           }else if (bounds==nextY){ //Passed the next view, update the variables
               ref.currentView = ref.nextView;
               ref.nextView++;
           }else{  //Otherwise, somewhere between current and next
               ref.interpolateColours(ref.currentView, ref.nextView,bounds);
               ref.animateHintPath(currentYOffset,nextYOffset,bounds);
           }
       }else if (ref.nextView ==  ref.lastView){ //At the last view
           if (bounds == currentY){//Passing the current view, update the variables
               ref.nextView = ref.currentView;
               ref.currentView--;
           }else if (bounds == nextY){ //Exceeding the last view, going out of bounds
               return;
           }else{ //Somewhere between next and current
               ref.interpolateColours(ref.currentView, ref.nextView,bounds);
               ref.animateHintPath(currentYOffset,nextYOffset,bounds);
           }
       }else{ //At a view somewhere between current and next
           if(bounds == currentY){ //Passing current view, update variables
               ref.nextView = ref.currentView;
               ref.currentView--;
           }else if (bounds == nextY){
               ref.currentView = ref.nextView;
               ref.nextView++;
           }else{ //Mouse is in bounds
               ref.interpolateColours(ref.currentView, ref.nextView,bounds);
               ref.animateHintPath(currentYOffset,nextYOffset,bounds);
           }
       }
    });
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
    //Check if the mouse is between start and end values
    if (mouseY <= start) return start;
    else if (mouseY >=end) return end;

    //Find the amount travelled from current to next view (remember: y1 is current and y2 is next)
    var distanceTravelled = Math.abs(mouseY-y1);
    var totalDistance = Math.abs(y2 - y1);
    var distanceRatio = distanceTravelled/totalDistance;
    this.interpValue = distanceRatio;
    return distanceRatio;
}
/** Translates the hint path according to the amount dragged from current to next view
 * currentOffset,nextOffset: y-value offsets of the two bounding views
 * interpAmount: amount travelled between the views
 * */
Heatmap.prototype.animateHintPath = function (currentOffset,nextOffset,interpAmount){
 var ref = this;
 var newCoords = this.svg.select("#hintPath").selectAll("text").data().map(function (d,i){
     var current = ref.findHintX(i,ref.currentView);
     var next = ref.findHintX(i,ref.nextView);
     var interpolator = d3.interpolate(current,next);
     var interpolatedPt = interpolator(interpAmount);
     return [interpolatedPt,d[1]];
    /** var currentPt = [ref.findHintX(i,ref.currentView),ref.findHintY(d[2],currentOffset)];
     var nextPt = [ref.findHintX(i,ref.nextView),ref.findHintY(d[2],nextOffset)];
     var interpolator = d3.interpolate(currentPt,nextPt);
     var interpolatedPt = interpolator(interpAmount);
     return [interpolatedPt[0],interpolatedPt[1]];*/
     });
 this.svg.select("#hintPath").selectAll("text").attr("transform", function(d,i){return "translate("+newCoords[i][0]+","+newCoords[i][1]+")";});
 this.svg.select("#hintPath").selectAll("path").attr("d", function (d){return ref.lineGenerator(newCoords)});
}
/**Updates the colour of the cells by interpolating the colour between views
 * current, next: the views to interpolate between
 * interpAmount: the amount to interpolate by
 */
Heatmap.prototype.interpolateColours = function(current,next,interpAmount){
  //Re-colour all cells
  this.svg.selectAll(".cell").attr("fill", function (d){
      var interpolator = d3.interpolateRgb(d.values[current][0],d.values[next][0]);
      return interpolator(interpAmount);
  });
}
/** Animates the colours of the cells by interpolation within the given view boundaries
 *  start,end: the bounding views
 *  id: of the most recently dragged cell
 * */
Heatmap.prototype.animateColours = function (id,start,end){
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
    //TODO: this needs to be changed to coincide with the coordinates in updateDraggedCell()
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
        this.redrawHintPath( y+this.cellSize/2-points[this.currentView+1][3],points[this.currentView+1][2],this.currentView+1);
    } else {
        this.redrawView(this.currentView);
        this.redrawHintPath( y+this.cellSize/2-points[this.currentView][3],points[this.currentView][2],this.currentView);
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
  * currentX, currentY: coordinates of the current view, where to translate the hint path to
 *  view: the view index to draw at
 * */
Heatmap.prototype.redrawHintPath = function(currentX,currentY,view){
    //TODO: redrawing the hint path - doesn't work, maybe wait until figure out how to properly animate the hint path
    var ref = this;
   //Translate by x
    var newCoords = this.svg.select("#hintPath").selectAll("text").data().map(function (d,i){
        return [ref.findHintX(i,view),d[1]];
    });
    this.svg.select("#hintPath").selectAll("text").attr("transform", function(d,i){return "translate("+newCoords[i][0]+","+newCoords[i][1]+")";});
    this.svg.select("#hintPath").selectAll("path").attr("d", function (d){return ref.lineGenerator(newCoords)});
  /**
    //Create the translation coordinates: to the centre of the dragged cell, offset by the current view's y-position along the hint path
    //var translateY = y+ref.cellSize/2- pathData[ref.currentView][3];
    // var coords = pathData.map(function (d){return [d[2],d[3]+translateY];});
    /**var coords = this.svg.select("#hintPath").selectAll("text").data();
     var currentPt = [coords[current][0],currentY];
     var nextPt = [coords[next][0],nextY];
     var interpolator = d3.interpolate(currentPt,nextPt);
     var interpolatedPt = interpolator(interpAmount);
     console.log(interpolatedPt);
     var translateStr = "translate("+(currentPt[0]-interpolatedPt[0])+","+(currentPt[1]-interpolatedPt[1])+")";
     this.svg.select("#hintPath").selectAll("text").attr("transform", translateStr);
     this.svg.select("#hintPath").selectAll("path").attr("transform", translateStr);*/
   /** var newCoords = points.map(function (d){return [d[2],d[3]+translateY];});
    this.svg.select("#hintPath").selectAll("text").attr("x",function (d,i) {return newCoords[i][0]})
        .attr("y",function (d,i){return newCoords[i][1]});
    this.svg.select("#hintPath").selectAll("path").attr("d",this.lineGenerator(newCoords));*/
    /**console.log(currentX+" "+currentY);
    var translateStr = "translate("+currentX+","+currentY+")";
    this.svg.select("#hintPath").selectAll("text").attr("transform", translateStr);
    this.svg.select("#hintPath").selectAll("path").attr("transform", translateStr);*/

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
 this.draggedCellX = x+this.cellSize/2;
 this.draggedCellY = y + this.cellSize/2;
 var currentOffset = pathData[ref.currentView][4];

 //Create the hint path coordinates: centre the path at the dragged cell
 var coords = pathData.map(function (d,i){return [ref.findHintX(i,ref.currentView),ref.findHintY(d[4],currentOffset),d[4]];});
 //TODO: if the colour does not change for the entire hint path the gradient is not drawn
//Append a clear cell with a black border to show which cell is currently selected and dragged
    this.svg.select("#hintPath").append("rect")
        .attr("x",x).attr("y",y)
        .attr("width",this.cellSize).attr("height",this.cellSize)
        .attr("stroke-width",2).attr("fill","none").attr("stroke","#000");

//Append a linear gradient tag which defines the gradient along the hint path
this.svg.append("linearGradient")
        .attr("id", "line-gradient")
        .attr("spreadMethod","pad")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%")
        .selectAll("stop").data(pathData)
        .enter().append("stop")
        .attr("offset", function(d) { return d[5]+"%"; })
        .attr("stop-color", function(d) { return d[0]; })
        .attr("stop-opacity",1);

//Draw the white underlayer of the hint path
this.svg.select("#hintPath").append("svg:path")
      .attr("d", this.lineGenerator(coords))
      .style("stroke-width", 10)
      .style("stroke", "white")
      .style("fill","none")
      .attr("filter", "url(#blur)");

//Draw the main hint path line
 this.svg.select("#hintPath").append("svg:path")
      .attr("d",this.lineGenerator(coords))
      .style("stroke-width", 4)
      .style("stroke", "url(#line-gradient)")
      .style("fill","none")
      .attr("filter", "url(#blur)");
	
//Draw the hint path labels								  
this.svg.select("#hintPath").selectAll("text")
       .data(coords).enter().append("text")
       .attr("transform", function (d){return "translate("+d[0]+","+d[1]+")"})
       .text(function (d,i){ return ref.labels[i];})
       .style("text-anchor", "middle")
       .style("cursor", "pointer")
       .attr("class","hintLabels")
       .on("click",this.clickHintLabelFunction);
}
/** Clears the hint path for a dragged cell by removing all of
 * it's svg components
 * */
Heatmap.prototype.clearHintPath = function(){
   this.svg.select("#hintPath").selectAll("rect").remove();
   this.svg.select("#hintPath").selectAll("path").remove();
   this.svg.select("#line-gradient").remove();
   this.svg.select("#hintPath").selectAll("text").remove();
}
/** Re-calculates the x-values for the moving hint path x-coordinates
 * (for both points comprising the path and labels)
 * index: the view index
 * view: the current view
 * */
Heatmap.prototype.findHintX = function (index,view){
   return ((index*this.xSpacing+this.draggedCellX) - (view*this.xSpacing));
}
/** Re-calculates the y-values for the moving hint path
 * (for both points comprising the path and labels)
 * origOffset: original y-offset of the point
 * viewOffset: y-offset of the current view
 * */
Heatmap.prototype.findHintY = function (origOffset,viewOffset){
    return (this.ySpacing*origOffset + this.draggedCellY - this.ySpacing*viewOffset);
}
//TODO: might want to wait until barchart is working perfectly and then just re-use the code
/** Search for stationary ambiguous cases in a list of yoffsets of colours (repeated colours).
 *  This information is stored in the ambiguousBars array, which gets re-populated each time a
 *  new bar is dragged.  This array is in  the format: [[type, newY]...number of views]
 * */
/**Heatmap.prototype.checkAmbiguous = function (pathData){
    var j, currentCellOffset;
    var stationaryCells = [];
    this.isAmbiguous = 0;
    this.ambiguousCells = [];

    //Re-set the ambiguousPoints array
    for (j=0;j<this.lastView;j++){
        this.ambiguousCells[j] = [0];
    }
    //Populate the stationary and revisiting bars array
    //Search for heights that are equal (called "repeated bars")
    for (j=0;j<this.lastView;j++){
        currentCellOffset= pathData[j][1];
        for (var k=j;k<this.lastView;k++){
            if (j!=k && pathData[k][1]== currentCellOffset){ //Repeated bar is found
                if (Math.abs(k-j)==1){ //Stationary bar
                    this.isAmbiguous = 1;
                    //If the bar's index does not exist in the array of all stationary bars, add it
                    if (stationaryCells.indexOf(j)==-1){
                        stationaryCells.push(j);
                        this.ambiguousCells[j] = [1];
                    }if (stationaryCells.indexOf(k)==-1){
                        stationaryCells.push(k);
                        this.ambiguousCells[k] = [1];
                    }
                }
            }
        }
    }
    //First check if there exists any stationary bars in the dataset
    if (stationaryCells.length>0){
        //Then, generate points for drawing an interaction path
        this.findPaths(d3.min(stationaryCells));
    }
    /**console.log(this.ambiguousBars);
     console.log(stationaryPoints);
     console.log(revisitingPoints);

}*/
//Todo:ambiguous interaction along hint path (same colour, interaction path?)
//Todo: non-existent data values in cell (white?), this would involve screening the dataset as well, similar to ambiguous cases
//TODO:y should be centered on the cell as well (this means translating hint path in the y when dragging)

//TODO: draw colour scale legend next to heatmap?