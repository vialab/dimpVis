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
            objectRef.svg.select("#anchor").append("circle").attr("cx", x).attr("cy", y).attr("r",4).attr("stroke","none");
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
        objectRef.svg.select("#anchor").select("circle").attr("cy",newY).attr("stroke","#c7c7c7");
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