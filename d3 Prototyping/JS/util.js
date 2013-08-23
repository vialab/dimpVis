/**
 * This file contains functions which can be used across all prototypes,
 * mostly shared across barchart, heatmap and piechart (since they are very similar)
 *
 * All functions must be passed a variable containing a reference to the object (this)
 * in order to access object variables and/or functions
 */

/**Clears the visualization elements appended to the SVG (used when the dataset is changed
 * objectClass: is the class name e.g., ".bars", assigned to all data objects
 * */
function clearVis (objectClass){
    d3.selectAll(objectClass).remove();
    d3.selectAll(".axisLabel").remove();
    d3.selectAll(".axis").remove();
    d3.select("#hintPath").remove();
    d3.select("#legend").remove();
}

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
        //if (objectRef.timeDirection == -1) {objectRef.interpValue = 1; }
        //else{objectRef.interpValue = 0;}
        objectRef.interpValue = 0;
        return start;
    }else if (mouse >= end) {
        //if (objectRef.timeDirection == -1) {objectRef.interpValue = 1; }
        //else{objectRef.interpValue = 0;}
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
/** Sets the type of hint path to be drawn
 *  Type: Full hint path = 0, partial hint path (removed labels) = 1
 * */
function setHintPathType (objectRef,type){
    objectRef.hintPathType = type;
}
 /** Displays small hint path by appending its svg components to the main svg
 *  translate: amount the path should be translated by in order to align with the
 *  dragged data object
 *  pathData: an array of points to appear along the entire hint path
 * */
function drawSmallHintPath (objectRef,translate,pathData){
    //Try out clipping..
    //http://stackoverflow.com/questions/10486896/svg-clip-path-within-rectangle-does-not-work
    /**this.svg.select("#hintPath").append("svg:defs").append("svg:clipPath").attr("id","clip")
     .append("rect").attr("id","clip-rect").attr("width",100).attr("height",100);*/

     //Draw the hint path line segment at current and next view
     objectRef.svg.select("#hintPath").append("path").datum(pathData)//.attr("clip-path", "url(#clip)")
        .attr("transform","translate("+(-translate)+")").attr("id","path").style("stroke","#666")
        .attr("d", function (d) {return objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]])});

    //Draw the next hint path line segment to show dragging direction (shown when travelling forwards)
    objectRef.svg.select("#hintPath").append("path").datum(pathData)
        .attr("transform","translate("+(-translate)+")").attr("id","forwardPath").style("stroke","none");

    //Draw the current hint path line segment to show dragging direction (shown when travelling backwards)
    objectRef.svg.select("#hintPath").append("path").datum(pathData)
        .attr("transform","translate("+(-translate)+")").attr("id","backwardPath").style("stroke","none");

    if (objectRef.nextView != objectRef.lastView){ //Assume when the hint path is first drawn, user is moving forward in time
        objectRef.svg.select("#nextPath").attr("d", function (d) {return objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]])});
    }

    //Make the interaction paths (if any) invisible
    if (objectRef.isAmbiguous ==1){
        objectRef.svg.select("#hintPath").selectAll(".interactionPath").style("stroke","none");
    }
}
/**Redraws the shortened hint path, where the full path segment is always displayed between next and current view.
 * Depending on the time direction, the next path segment the user is approaching is partially visible.
 * Currently, the entire interaction path is displayed, because setting the stroke-dasharray property won't work
 * */
//TODO: this code is slightly inefficient, but save refactoring for later
function redrawSmallHintPath (objectRef,ambiguousObjects){

    //Limit the visibility of the next time interval sub-path
    if (objectRef.timeDirection == 1){ //Moving forward

        if (ambiguousObjects[objectRef.nextView][0]==1){
            objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.nextView][1]).style("stroke","#969696");
        }else{
            objectRef.svg.selectAll(".interactionPath").style("stroke","none");
        }

        //Clear the backward path
        objectRef.svg.select("#backwardPath").style("stroke","none");
        //Create the interpolation function and get the total length of the path
        var length = d3.select("#forwardPath").node().getTotalLength();
        var interpStr = d3.interpolateString("0," + length, length + "," + length);
        //Full sub-path of current time interval is always visible
        objectRef.svg.select("#path").attr("d", function (d) {return objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]])});

        if (objectRef.nextView < objectRef.lastView){
            objectRef.svg.select("#forwardPath").attr("stroke-dasharray",interpStr(objectRef.interpValue)).style("stroke","#666")
                .attr("d", function (d) {return objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]])});
        }

    }else{ //Moving backward

        if (ambiguousObjects[objectRef.currentView][0]==1){
            objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.currentView][1]).style("stroke","#969696");
        }else{
            objectRef.svg.selectAll(".interactionPath").style("stroke","none");
        }

        //Clear the forward path
        objectRef.svg.select("#forwardPath").style("stroke","none");
        //Create the interpolation function and get the total length of the path
        var length = d3.select("#backwardPath").node().getTotalLength();
        var interpStr = d3.interpolateString("0," + length, length + "," + length);
        //Full sub-path of current time interval is always visible
        objectRef.svg.select("#path").attr("d", function (d) {return objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]])});

        if (objectRef.currentView > 0){
            objectRef.svg.select("#backwardPath").attr("stroke-dasharray",interpStr(1-objectRef.interpValue)).style("stroke","#666")
                .attr("d", function (d) {return objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.currentView-1]])});
        }
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
            objectRef.svg.select("#hintPath").append("path").datum([[x,y]]).style("stroke","none")
                .attr("d", myRef.hintPathGenerator).attr("id","anchor");
        }else if (type == 2){ //Circle
            objectRef.svg.select("#hintPath").append("circle").attr("cx", x).attr("cy", y).attr("r",4).style("stroke","none").attr("id","anchor");
        }else if (type==3){ //Circle + elastic
            objectRef.svg.select("#hintPath").append("g").attr("id","anchor");
            objectRef.svg.select("#anchor").append("circle").attr("cx", x).attr("cy", y).attr("r",4).style("stroke","none");
            objectRef.svg.select("#anchor").append("path").datum([[x,y]]).style("stroke","none")
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
        objectRef.svg.select("#anchor").attr("d",function (d) {return myRef.hintPathGenerator([[mouseX,mouseY],[d[0][0],newY]]);})
            .style("stroke","#c7c7c7");
    }else if (type == 1){ //Inner Elastic
        objectRef.svg.select("#anchor").attr("d",function (d) {return myRef.hintPathGenerator([[d[0][0],objY],[d[0][0],newY]]);})
            .style("stroke","#c7c7c7");
    }else if (type ==2){ //Circle
        objectRef.svg.select("#anchor").attr("cy",newY).style("stroke","#c7c7c7");
    }else if (type==3){ //Circle and elastic
        objectRef.svg.select("#anchor").select("path").attr("d",function (d) {return myRef.hintPathGenerator([[d[0][0],objY],[d[0][0],newY]]);})
            .style("stroke","#c7c7c7");
        objectRef.svg.select("#anchor").select("circle").attr("cy",newY).style("stroke","#c7c7c7");
    }
}

/**Hides an anchor by removing it's colour
 * */
function hideAnchor (objectRef,type){
    if (type == 0 || type == 1 || type ==2){
        objectRef.svg.select("#anchor").style("stroke","none");
    }else if (type ==3){
        objectRef.svg.select("#anchor").select("circle").style("stroke","none");
        objectRef.svg.select("#anchor").select("path").style("stroke","none");
    }
}
/** Removes an anchor from the svg
 * */
function removeAnchor (objectRef){
    if (!objectRef.svg.select("#anchor").empty()){
        objectRef.svg.select("#anchor").remove();
    }
}
/**Draws a colour scale showing what is assigned to each colour
 * colours: the different colours to map the values to
 * labels: the labels to identify each colour
 * x,y: left and top margins of the scale
 * w,h: of the colour blocks in the legend
 * spacing: between the colour blocks (optional, but must be 1 if none is desired)
 * */
function drawColourLegend (objectRef,colours,labels,x,y,w,h,spacing){

    //Prepare the data for drawing the scale
    objectRef.svg.selectAll(".legend").data(colours.map(function (d,i) {
        var yCoord = i*h*spacing + y;
        return {colour:d,id:i,label:labels[i],y:yCoord};
    })).enter().append("g").attr("class","legend");

    //Draw the colours as rectangles
    objectRef.svg.selectAll(".legend").append("rect")
        .attr("x", x).attr("y",function(d){return d.y})
        .attr("width",w).attr("height",h)
        .style("fill",function (d){return d.colour});

    //Draw the labels for each colour
    objectRef.svg.selectAll(".legend").append("text").attr("x",x+w+5)
        .attr("y",function(d){return (d.y + h/2)})
        .text(function (d){return d.label})
}