/**
 * This file contains functions which can be used across all prototypes,
 * mostly shared across barchart, heatmap and piechart (since they are very similar)
 *
 * All functions must be passed a variable containing a reference to the object (this)
 * in order to access object variables and/or functions
 */
//TODO: move functions related to user study to a separate file
/**Clears the visualization elements appended to the SVG (used when the dataset is changed
 * objectClass: is the class name e.g., ".bars", assigned to all data objects associated with the
 * visualization
 * */
function clearVis (objectClass){
    if (!d3.selectAll(objectClass).empty()){
        d3.selectAll(objectClass).remove();
        d3.selectAll(".axisLabel").remove();
        d3.selectAll(".axis").remove();
        d3.select("#hintPath").remove();
        d3.select("#legend").remove();
    }
}
/**Checks if a mobile device is being used, called when the page loads
 * @return true if mobile, false otherwise
 * This code is from: http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-handheld-device-in-jquery
 * */
function checkDevice (){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        return true;
    }
    return false;
}
/**Changes some display properties of the hint path, such as increasing the stroke width and
 * making the colour lighter.  To make the hint path look nicer in it's non-blurred form
 * */
function drawMobileHintPath (objectRef){
    objectRef.svg.select("#path").style("stroke-opacity",0.5).style("stroke-width",4);
    objectRef.svg.select("#underlayer").style("stroke-width",5);
}
/**Resolves the user's coordinates depending on whether there is touch or mouse interaction
 * */
function getUserCoords (objectRef){
    if (d3.touches(objectRef).length > 0){
        return [d3.touches(objectRef)[0][0],d3.touches(objectRef)[0][1]];
    }
    return [d3.event.x,d3.event.y];
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
        //objectRef.timeDirection = 1;
    }else if (draggingDirection !=0){
        if (draggingDirection != objectRef.previousDragDirection){ //Flip the direction when at the end of the hint path
            objectRef.timeDirection = (objectRef.timeDirection==1)?-1:1;
        }
    }
}
/**Finds the pixel distance from the user's point to the dragged data object's point
 * @return the pixel distance (calculated with the euclidean distance formula)
 * */
function findPixelDistance (userX,userY,objectX,objectY){
    var term1 = userX - objectX;
    var term2 = userY - objectY;
    return Math.sqrt((term1*term1)+(term2*term2));
}
/** Updates the view tracking variables when the view is being changed by an external
 * visualization (e.g., slider)
 * */
function changeView (objectRef,newView){
    if (newView ==0){
        objectRef.currentView = newView
        objectRef.nextView = newView+1;
    }else if (newView == objectRef.lastView){
        objectRef.nextView = newView;
        objectRef.currentView = newView -1;
    }else {
        objectRef.currentView = newView;
        objectRef.nextView = newView + 1;
    }
}
/**Adjusts the view variables in case they have gone out of bounds
 * @return the view to draw the visualization at */
function adjustView (objectRef){
    if (objectRef.nextView > objectRef.lastView){
        objectRef.nextView--;
        objectRef.currentView--;
        objectRef.interpValue = 0;
        return objectRef.nextView;
    }else if (objectRef.nextView == objectRef.lastView){
        return objectRef.nextView;
    }
    return objectRef.currentView;
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
        objectRef.interpValue = 0;
        //objectRef.timeDirection = -1;
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
        return start;
    }else if (mouse >= end) {
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
    //objectRef.timeDirection = (currentInterpValue > objectRef.interpValue)? 1 : (currentInterpValue < objectRef.interpValue)?-1 : objectRef.timeDirection;

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
        var yCoord = i*h*spacing + y ;
        return {colour:d,id:i,label:labels[i],y:yCoord};
    })).enter().append("g").attr("class","legend");

    //Draw the colours as rectangles
    objectRef.svg.selectAll(".legend").append("rect")
        .attr("x", x).attr("y",function(d){return d.y})
        .attr("width",w).attr("height",h)
        .style("fill",function (d){return d.colour});

    //Draw the labels for each colour
    objectRef.svg.selectAll(".legend").append("text").attr("x",x+w+5)
        .attr("y",function(d){return (d.y + h/2*spacing)})
		.style("fill","#666")
        .text(function (d){return d.label})
}
/** Search for ambiguous cases in a list of values along the hint path.  Ambiguous objects are tagged as 1, this is stored in
 *  ambiguousObjs
 *
 *  To alleviate interaction in regions where the heights are very similar (within valueThreshold), we also consider
 *  these objects to be stationary in value.
 * */
function checkAmbiguous(objectRef,values,valueThreshold){
    var j, currentObj;
    var ambiguousObjs = [];
    var length = values.length;
    objectRef.isAmbiguous = 0;

    for (j=0;j<=length;j++){
        ambiguousObjs[j] = [0];
    }

    //Search for values that match
    for (j=0;j<length;j++){
        currentObj = values[j];
        for (var k=0;k<length;k++){
            if (j!=k && Math.abs(values[k] - currentObj)<= valueThreshold){ //A repeated (or almost repeated) value is found
                    if (Math.abs(k-j)==1){ //Stationary value
                        objectRef.isAmbiguous = 1;
                        ambiguousObjs[j] = [1];
                    }

            }
        }
    }
    if (objectRef.isAmbiguous ==1){
        //Generate points for drawing an interaction path
        return findInteractionPaths(ambiguousObjs,values,valueThreshold);
    }
    return [ambiguousObjs,[]];
}
/** Creates an array containing all data for drawing a sine wave:
 * interactionPaths[] = [[points for the sine wave]..number of paths]
 * */
function findInteractionPaths(ambiguousObjs,values,valueThreshold){
    var indices = [];
    var pathNumber = 0;
    var firstPath = false;
    var length = values.length;
    var interactionPaths = [];

    for (var j=0; j< length;j++){
        if (ambiguousObjs[j][0]==1){
            if (j!=0 && (ambiguousObjs[j-1][0]!=1||
                (ambiguousObjs[j-1][0]==1 && Math.abs(values[j]-values[j-1])>valueThreshold))){ //Starting a new path
                if (!firstPath){
                    firstPath = true;
                }else{
                    interactionPaths.push(indices);
                    indices = [];
                    pathNumber++;
                }
            }
            ambiguousObjs[j].push(pathNumber);
            indices.push(j);
        }
    }
    interactionPaths.push(indices);

    return [ambiguousObjs,interactionPaths];
}
/**Highlights data object(s) with the specified id in the highlightColour from the class of data objects
 * Used for completing the tasks in the user evaluation
 * id2 and newColour2 are optional, if N/A then set it as -1
 * */
function highlightDataObject (id1,id2,className,origColour,newColour1,newColour2){
    d3.selectAll(className).style("fill", function (d){
        return (d.id==id1)?newColour1:(d.id==id2)?newColour2:origColour;
    });
}
/**Function which shows info (year labels, middle ticks) on the slider widget */
function showSliderInfo(sliderRef){
    sliderRef.widget.selectAll(".tickLabels").style("fill",sliderRef.displayColour);
}
/**Function which hides info (year labels, middle ticks) on the slider widget.
 * This is used during the user evaluation to remove information about time */
function hideSliderInfo(sliderRef){
   //Hide the tick labels
    sliderRef.widget.selectAll(".tickLabels").style("fill","none");
   //Hide all ticks except the end ones
   /** sliderRef.widget.selectAll(".ticks")
        .style("fill",function(d,i){return ((i==0)||(i==sliderRef.numTicks-1))?sliderRef.displayColour:"none"});*/

}