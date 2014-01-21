/** Draws partial hint paths for each visualization
 *  Will be used in the user study
 * */

 //Variables for the hint path line
var pathColour = "#EDEDED";
var forwardPathLength = 0;
var backwardPathLength = 0;
var interpolateStroke = function (length,amount){
    return  d3.interpolateString("0," + length, length + "," + length)(amount);
}

/**Hides the small hint path whenever the user stops dragging */
function hidePartialHintPath (objectRef){
    objectRef.svg.select("#hintPath").selectAll("path").style("stroke","none");
    objectRef.svg.select("#hintPath").selectAll("circle").style("stroke","none");
    objectRef.svg.select("#hintPath").selectAll("text").remove();
}

/////////////////////////////////////////////////////// For the scatterplot \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
var radius = 16;
var radiusThickness = 1;
var circleColour = "#BDBDBD";
var ref = null;
var labelCoords = [];
var loopViews = [];

/** Displays small hint path by appending its svg components to the main svg
 *  translate: amount the path should be translated by in order to align with the
 *  dragged data object
 *  pathData: an array of points to appear along the entire hint path
 * */
function drawPartialHintPath_line (objectRef,translate,pathData){


    //Partial hint path by drawing individual segments...
    //Draw the hint path line segment at current and next view
    objectRef.svg.select("#hintPath").append("path").datum(pathData)//.attr("clip-path", "url(#clip)")
        .attr("transform","translate("+(-translate)+")").attr("id","path").style("stroke",pathColour)
        .attr("d", function (d) {
            return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
        });

    //Draw the next hint path line segment to show dragging direction (shown when travelling forwards)
    objectRef.svg.select("#hintPath").append("path").datum(pathData)
        .attr("transform","translate("+(-translate)+")").attr("id","forwardPath");

    //Draw the current hint path line segment to show dragging direction (shown when travelling backwards)
    objectRef.svg.select("#hintPath").append("path").datum(pathData)
        .attr("transform","translate("+(-translate)+")").attr("id","backwardPath").style("stroke","none");

    //Draw the markers along the path
    objectRef.svg.select("#hintPath").append("circle").datum(pathData).attr("id","backwardMarker")
        .style("stroke","none").style("fill","none").style("stroke-width",radiusThickness)
        .attr("cx",0).attr("cy",0).attr("r",radius);
    objectRef.svg.select("#hintPath").append("circle").datum(pathData).attr("id","forwardMarker")
        .style("stroke","none").style("fill","none").attr("cx",0).attr("cy",0).attr("r",radius).style("stroke-width",radiusThickness);
    objectRef.svg.select("#hintPath").append("circle").datum(pathData).attr("id","currentMarker")
       .style("stroke","none").style("fill","none").style("stroke-width",radiusThickness).attr("cx",0).attr("cy",0).attr("r",radius);

    if (objectRef.nextView != objectRef.lastView){ //Assume when the hint path is first drawn, user is moving forward in time
        objectRef.svg.select("#nextPath").attr("d", function (d) {
            return objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]]);
            //(typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.nextView]: piechart
        });
    }

    //Make the interaction paths (if any) invisible
    if (objectRef.isAmbiguous ==1){
        objectRef.svg.select("#hintPath").selectAll(".loops").style("stroke","none");
        ref = objectRef;
        labelCoords = objectRef.placeLabels(pathData);

        objectRef.ambiguousPoints.forEach(function (d,i){
            if (d[0]==1){
                loopViews.push(i);
            }
        });
    }
}
/**Redraws the shortened hint path, where the full path segment is always displayed between next and current view.
 * Depending on the time direction, the next path segment the user is approaching is partially visible.
 * Currently, the entire interaction path is displayed, because setting the stroke-dasharray property won't work
 * */
function redrawPartialHintPath_line (objectRef,ambiguousObjects){

    //Partial hint path by drawing individual segments...
    //Limit the visibility of the next time interval sub-path
    if (objectRef.timeDirection == 1){ //Moving forward

        if (ambiguousObjects.length > 0){
            if (ambiguousObjects[objectRef.nextView][0]==1){
                objectRef.svg.select("#loop"+ambiguousObjects[objectRef.nextView][1]).style("stroke",pathColour);
                drawLoopLabels();
                return;
            }else{
                objectRef.svg.selectAll(".loops").style("stroke","none");
                objectRef.svg.selectAll(".hintLabels").remove();
                objectRef.hideAnchor();
            }
        }
        //Clear the backward path
        objectRef.svg.select("#backwardPath").style("stroke","none");
        objectRef.svg.select("#backwardMarker").style("stroke","none");

        //Create the interpolation function and get the total length of the path
        forwardPathLength = d3.select("#forwardPath").node().getTotalLength();

        //Full sub-path of current time interval is always visible
        objectRef.svg.select("#path").attr("d", function (d) {
            return objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
        });

        objectRef.svg.select("#currentMarker").attr("cx", function (d) {return d[objectRef.nextView][0];})
            .attr("cy", function (d) {return d[objectRef.nextView][1];}).style("stroke",circleColour);

        if (objectRef.nextView < objectRef.lastView){
            objectRef.svg.select("#forwardPath").attr("stroke-dasharray",interpolateStroke(forwardPathLength,objectRef.interpValue)).style("stroke",pathColour)
                .attr("d", function (d) {
                    return objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]]);
                }).attr("filter", "url(#blur2)");
            if (objectRef.interpValue > 0.95){
                objectRef.svg.select("#forwardMarker").attr("cx", function (d) {return d[objectRef.nextView+1][0];})
                    .attr("cy", function (d) {return d[objectRef.nextView+1][1];}).style("stroke",circleColour);
            }
        }

    }else{ //Moving backward
        if (ambiguousObjects.length > 0){
            if (ambiguousObjects[objectRef.currentView][0]==1){
                objectRef.svg.select("#loop"+ambiguousObjects[objectRef.currentView][1]).style("stroke",pathColour);
                drawLoopLabels();
                return;
            }else{
                objectRef.svg.selectAll(".loops").style("stroke","none");
                objectRef.svg.selectAll(".hintLabels").remove();
                objectRef.hideAnchor();
            }
        }
        //Clear the forward path
        objectRef.svg.select("#forwardPath").style("stroke","none");
        objectRef.svg.select("#forwardMarker").style("stroke","none");

        //Create the interpolation function and get the total length of the path
        backwardPathLength = d3.select("#backwardPath").node().getTotalLength();

        //Full sub-path of current time interval is always visible
        objectRef.svg.select("#path").attr("d", function (d) {
            return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
        }).attr("filter", "url(#blur2)");

        objectRef.svg.select("#currentMarker").attr("cx", function (d) {return d[objectRef.currentView][0];})
            .attr("cy", function (d) {return d[objectRef.currentView][1];}).style("stroke",circleColour);

        if (objectRef.currentView > 0){
            objectRef.svg.select("#backwardPath").attr("stroke-dasharray",interpolateStroke(backwardPathLength,(1-objectRef.interpValue)))
                .style("stroke",pathColour).attr("d", function (d) {
                    return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                        objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.currentView-1]]);
                }).attr("filter", "url(#blur2)");
            if (objectRef.interpValue < 0.05){
                objectRef.svg.select("#backwardMarker").attr("cx", function (d) {return d[objectRef.currentView-1][0];})
                    .attr("cy", function (d) {return d[objectRef.currentView-1][1];}).style("stroke",circleColour);
            }
        }

    }
}
//Draws only a subset of labels to show the years contained in a loop
function drawLoopLabels (){

    ref.svg.select("#hintPath").selectAll("text")
        .data(loopViews.map(function (d,i) {
        var xPos = labelCoords[d][0] + ref.pointRadius*2;
        var yPos = labelCoords[d][1] + ref.pointRadius*2;
        return {x:xPos,y:yPos,id:d}
    })).enter().append("svg:text")
        .text(function(d) { return ref.labels[d.id]; })
        .attr("x", function(d) {return d.x;})
        .attr("y", function (d) {  return d.y; })
        .attr("class","hintLabels")
        .attr("id",function (d){return "hintLabels"+ d.id});
}