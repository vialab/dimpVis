/**
 * This file contains functions which can be used across all prototypes,
 * mostly shared across barchart, heatmap and piechart (since they are very similar)
 *
 * All functions must be passed a variable containing a reference to the object (this)
 * in order to access object variables and/or functions
 */

//////////////////////Updating important object variables//////////////////////

/** Updates the view variables to move the visualization forward
 * (passing the next view), also sets the direction travelling in time
 * draggingDirection: set to 1/-1 (physical dragging direction of user)
 *                    set to 0, if unknown
 * */
function moveForward(objectRef,draggingDirection){
    if (objectRef.nextView < objectRef.lastView){ //Avoid index out of bounds
        objectRef.currentView = objectRef.nextView;
        objectRef.nextView++;
        objectRef.timeDirection = 1;
    }else if (draggingDirection !=0){
        if (draggingDirection != objectRef.previousDragDirection){ //Flip the direction when at the end of the hint path
            objectRef.timeDirection = (objectRef.timeDirection==1)?-1:1;
        }
    }
}

/** Updates the view variables to move the visualization backward
 * (passing the current view), also sets the direction travelling
 *  over time
 * draggingDirection: set to 1/-1 (physical dragging direction of user)
 *                    set to 0, if unknown
 * */
function moveBackward (objectRef,draggingDirection){
    if (objectRef.currentView > 0){ //Avoid index out of bounds
        objectRef.nextView = objectRef.currentView;
        objectRef.currentView--;
        objectRef.timeDirection = -1;
    }else if (draggingDirection !=0){
        if (draggingDirection != objectRef.previousDragDirection){ //Flip the direction when at the end of the hint path
            objectRef.timeDirection = (objectRef.timeDirection==1)?-1:1;
        }
    }
}

/** Checks if the mouse is in bounds defined by a and b, updates the interpolation amount
 *  mouse: the mouse position
 *  @return start,end: boundary values are returned if the given
 *                     mouse position is equal to or has crossed it
 *          mouse: The mouse value, if in bounds
 * */
function checkBounds (objectRef,a,b,mouse){
    //Resolve the boundaries for comparison, start is lower value, end is higher
    var start,end;
    if (a>b){
        end = a;
        start =b;
    }else{
        start = a;
        end = b;
    }

    //Check if the mouse is between start and end values
    if (mouse <= start) {
        //if (this.timeDirection == -1) {this.interpValue = 1; }
        //else{this.interpValue = 0;}
        objectRef.interpValue = 0;
        return start;
    }else if (mouse >=end) {
        //if (this.timeDirection == -1) {this.interpValue = 1; }
        //else{this.interpValue = 0;}
        objectRef.interpValue = 0;
        return end;
    }

    return mouse;
}
/** Calculates the interpolation amount  (percentage travelled) of the mouse, between views.
 *   Uses the interpolation amount to find the direction travelling over time and saves it
 *   in the global variable (interpValue). Also, updates the direction travelling over time (
 *   if there is a change in dragging direction)
 *
 *   a,b: position of boundary values (mouse is currently in between)
 *   mouse: position of the mouse
 *   draggingDirection: physical dragging direction of the user
 *   ambiguity: a flag, = 1, ambiguous case
 *                      = 0, normal case
 */
function findInterpolation (objectRef,a,b,mouse,ambiguity,draggingDirection){
    var distanceTravelled, currentInterpValue;
    var total = Math.abs(b - a);
    //Calculate the new interpolation amount
    if (ambiguity == 0){
        distanceTravelled = Math.abs(mouse-a);
        currentInterpValue = distanceTravelled/total;
    }else{
        if (objectRef.passedMiddle ==0 ){ //Needs to be re-mapped to lie between [0,0.5] (towards the peak/trough)
            distanceTravelled = Math.abs(mouse - a);
            currentInterpValue = distanceTravelled/(total*2);
        }else{ //Needs to be re-mapped to lie between [0.5,1] (passed the peak/trough)
            distanceTravelled = Math.abs(mouse - b);
            currentInterpValue = (distanceTravelled+total)/(total*2);
        }
    }
    //Set the direction travelling over time (1: forward, -1: backward)
    if (draggingDirection != objectRef.previousDragDirection){
        objectRef.timeDirection = (objectRef.timeDirection==-1) ? 1:-1;
    }

    //Save the current interpolation value
    objectRef.interpValue = currentInterpValue;
}
/**Infers the time direction when user arrives at areas on the hint path where interaction is ambiguous (e.g., peaks)
 * Inference is based on previous direction travelling over time.  The views are updated (forward or backward)
 * whenever the dragging direction changes.
 * draggingDirection: physical dragging direction of the user
 * atCurrent: the view which user is currently at or passing (=0 if at next view, =1 if at current)
 * */
function inferTimeDirection (objectRef,draggingDirection,atCurrent){

    if (objectRef.previousDragDirection != draggingDirection){
        if (atCurrent==0 && objectRef.timeDirection ==1){
            moveForward(objectRef,draggingDirection);
        }else if (atCurrent ==1 && objectRef.timeDirection ==-1){
            moveBackward(objectRef,draggingDirection);
        }
    }
}

/**Updates variables for dragging along the sine wave:
 *  pathDirection: vertical direction of the approaching portion of the sine wave (e.g., at next view)
 *  value: of the stationary object
 *  passedMiddle: a flag to determine how to calculate the interpolation (0: interp is between 0 and <0.5,
 *  1: interp is between 0.5 and < 1)
 * */
function setSineWaveVariables (objectRef,pathDirection,value,passedMiddle){
    objectRef.passedMiddle = passedMiddle;
    objectRef.pathDirection = pathDirection;
    objectRef.peakValue = (pathDirection==1)?(value-objectRef.amplitude):(objectRef.amplitude+value);
}
//////////////////////Indicators along the hint path//////////////////////

/** Appends a progress indicator to the svg (with id "progress"), if there isn't already one
 *  data: 2d array of points for drawing the entire hint path line
 * */
function appendProgress (objectRef,data){

    if (objectRef.svg.select("#progress").empty()){
        //Add the blur filter to the SVG so other elements can call it
        objectRef.svg.append("svg:defs").append("svg:filter")
            .attr("id", "blurProgress")
            .append("svg:feGaussianBlur")
            .attr("stdDeviation", 3);

        objectRef.svg.select("#hintPath").append("path").datum(data)
            .attr("id","progress").attr("filter", "url(#blurProgress)");
    }
}


/** Re-draws a progress indicator using the stroke dash interpolation example by mike bobstock:
 * http://bl.ocks.org/mbostock/5649592
 * interpAmount: how far travelled between views
 * translateAmount: to animate the progress path with the hint path
 * type: of progress path (small segments or entire path)
 * */
function drawProgress (objectRef,interpAmount,translateAmount,type){
    var myRef = objectRef;

    if (!objectRef.svg.select("#progress").empty()){

        //Create the interpolation function and get the total length of the path
        var length = d3.select("#progress").node().getTotalLength();
        var interpStr = d3.interpolateString("0," + length, length + "," + length);
        //Make some adjustments according to the type of progress path selected
        if (type == 0 && interpAmount==0){ //Small progress paths, at the point of transitioning views
            this.svg.select("#progress").attr("d", function (d) {return myRef.hintPathGenerator([d[myRef.currentView],d[myRef.nextView]])});
        }else if (type==1){ //Large progress path, adjust the interpolation
            interpAmount = (objectRef.currentView-1)/objectRef.lastView + interpAmount/objectRef.lastView;
        }

        //Re-colour the progress path
        this.svg.select("#progress").attr("stroke-dasharray",interpStr(interpAmount))
            .attr("transform","translate(" + (-translateAmount) + ")");
    }
}

//////////////////////Indicators along a sine wave (interaction path)//////////////////////

/** Appends an anchor to the svg (with id 'anchor), if there isn't already one
 *  x,y: starting position of the anchor
 *  type: of anchor 0 - inner elastic, 1 - outer elastic, 2 - circle, 3 - circle and elastic
 * */
function appendAnchor (objectRef,x,y,type){
    var myRef = objectRef;
    if (objectRef.svg.select("#anchor").empty()){
        if (type ==0 || type ==1){ //Inner or outer elastic
            objectRef.svg.select("#hintPath").append("path").datum([[x,y]])
                .attr("d", myRef.hintPathGenerator).attr("id","anchor");
        }else if (type == 2){ //Circle
            objectRef.svg.select("#hintPath").append("circle").attr("cx", x).attr("cy", y).attr("r",4).attr("stroke","none").attr("id","anchor");
        }else if (type==3){ //Circle + elastic
            objectRef.svg.select("#hintPath").append("g").attr("id","anchor");
            objectRef.svg.select("#anchor").append("circle").attr("cx", x).attr("cy", y).attr("r",4).attr("stroke","none");
            objectRef.svg.select("#anchor").append("path").datum([[x,y]])
                .attr("d", objectRef.hintPathGenerator);
        }
    }
}

/** Re-draws the anchor, depends on the type of anchor (see function above for the scheme)
 * objY = y-value of the data object
 * mouseX, mouseY: mouse coordinates during dragging
 * newY = newY lies along the sine wave somewhere
 * */
function redrawAnchor (objectRef,objY,mouseX,mouseY,newY,type){
    var myRef = objectRef;
    if (type ==0){ //Outer elastic
        objectRef.svg.select("#anchor").attr("d",function (d) {return myRef.hintPathGenerator([[mouseX,mouseY],[d[0][0],newY]]);});
    }else if (type == 1){ //Inner Elastic
        objectRef.svg.select("#anchor").attr("d",function (d) {return myRef.hintPathGenerator([[d[0][0],objY],[d[0][0],newY]]);});
    }else if (type ==2){ //Circle
        objectRef.svg.select("#anchor").attr("cy",newY).attr("stroke","#c7c7c7");
    }else if (type==3){ //Circle and elastic
        objectRef.svg.select("#anchor").select("path").attr("d",function (d) {return myRef.hintPathGenerator([[d[0][0],objY],[d[0][0],newY]]);});
        objectRef.svg.select("#anchor").select("circle").attr("cy",newY).attr("stroke","#c7c7c7");
    }
}

/**Hides an anchor by removing it's colour
 * */
function hideAnchor (objectRef,type){
    if (type == 0 || type == 1 || type ==2){
        objectRef.svg.select("#anchor").attr("stroke","none");
    }else if (type ==3){
        objectRef.svg.select("#anchor").select("circle").attr("stroke","none");
        objectRef.svg.select("#anchor").select("path").attr("stroke","none");
    }

}
/** Removes an anchor from the svg
 * */
function removeAnchor (objectRef){
    if (!objectRef.svg.select("#anchor").empty()){
        objectRef.svg.select("#anchor").remove();
    }
}

//TODO: still deciding if these functions should be in this file?
//////////////////////Detecting Ambiguity (stationary sequences) in the dataset //////////////////////

/** Search for ambiguous cases in a list of data values.  Ambiguous cases are tagged by type.
 *  ambiguousFlag: 0: not ambiguous, 1: stationary data object (which doesn't move for at least 2 consecutive years)
 *  This information is stored in the ambiguousObjects array, which gets re-populated each time a
 *  new object is dragged.
 *  This array is in  the format: [[ambiguousFlag,groupNum,sineWaveDirection]...all years along the hint path]
 *
 *  To alleviate interaction in regions where values are very similar (within threshold), we also consider
 *  these objects to be stationary.
 *
 *  values: array of values to deem two objects "equal"
 * */
function checkAmbiguous (objectRef,values,threshold){
    var j, currentObj;
    var stationaryObjects = [];
    objectRef.isAmbiguous = 0;
    objectRef.ambiguousObjects = [];

    //Re-set the ambiguousPoints array
    for (j=0;j<=objectRef.lastView;j++){
        objectRef.ambiguousObjects[j] = [0];
    }

    //Search for values that are equal
    for (j=0;j<=objectRef.lastView;j++){
        currentObj= values[j];
        for (var k=j;k<=objectRef.lastView;k++){
            if (j!=k && (Math.abs(this.pathData[k][1]- currentObj))< threshold){ //An almost repeated bar, less than one pixel difference
                if (Math.abs(k-j)==1){ //Stationary bar
                    objectRef.isAmbiguous = 1;
                    //If the bar's index does not exist in the array of all stationary bars, add it
                    if (stationaryObjects.indexOf(j)==-1){
                        stationaryObjects.push(j);
                        objectRef.ambiguousObjects[j] = [1];
                    }if (stationaryObjects.indexOf(k)==-1){
                        stationaryObjects.push(k);
                        objectRef.ambiguousObjects[k] = [1];
                    }
                }
            }
        }

    }
    //First check if there exists any stationary bars in the dataset
    if (stationaryObjects.length>0){
        //Then, generate points for drawing an interaction path
         findPaths(objectRef,d3.min(stationaryObjects));
    }
}
/** Populates interactionPaths array (of the object) which contains data for drawing a sine wave.
 * Format: interactionPaths[] = [[points for the sine wave]..number of paths]
 * startIndex: the index of the first stationary bar (only for reducing the search, can just
 * set this to 0)
 * */
function findPaths (objectRef,startIndex){
    var pathInfo = [];
    var pathNumber = 0;

    for (var j=startIndex; j<=objectRef.lastView;j++){
        if (objectRef.ambiguousObjects[j][0]==1){
            if (j!=startIndex && objectRef.ambiguousObjects[j-1][0]!=1){ //Starting a new path
                objectRef.interactionPaths.push(calculatePathPoints(objectRef,pathInfo));
                pathInfo = [];
                pathNumber++;
            }
            objectRef.ambiguousObjects[j].push(pathNumber);
            pathInfo.push(j);
        }
    }

    objectRef.interactionPaths.push(calculatePathPoints(pathInfo));
}
/** Calculates a set of points to compose a sine wave (for an interaction path)
 * indices: the corresponding year indices, this array's length is the number of peaks needed on the path
 * @return an array of points for drawing the sine wave: [[x,y], etc.]
 * */
function calculatePathPoints (objectRef,indices){
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
        var y = objectRef.amplitude*Math.sin(theta)+yPos;
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