/** Draws partial hint paths for each visualization
 *  Will be used in the user study
 * */

 //Variables for the hint path line (barchart, heatmap)
var lineWidth= 12;
var lineThickness = 2;
var pathColour = "#EDEDED";
    //969696
//var tickColour = "#636363";
//var pathColour = "#969696";
var tickColour = "#EDEDED";
var forwardPathLength = 0;
var backwardPathLength = 0;
var interpolateStroke = function (length,amount){
    return  d3.interpolateString("0," + length, length + "," + length)(amount);
}
////////////////////////////////////////////////////// For the barchart \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
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
    objectRef.svg.select("#hintPath").append("path").datum(pathData).attr("id","backwardMarker")
        .attr("transform","translate("+(-translate)+")").style("stroke","none").style("stroke-width",lineThickness);
    objectRef.svg.select("#hintPath").append("path").datum(pathData).attr("id","forwardMarker")
        .attr("transform","translate("+(-translate)+")").style("stroke","none").style("stroke-width",lineThickness);
    objectRef.svg.select("#hintPath").append("path").datum(pathData).attr("id","currentMarker")
        .attr("transform","translate("+(-translate)+")").style("stroke","none").style("stroke-width",lineThickness);

    if (objectRef.nextView != objectRef.lastView){ //Assume when the hint path is first drawn, user is moving forward in time
        objectRef.svg.select("#nextPath").attr("d", function (d) {
            return objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]]);
            //(typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.nextView]: piechart
        });
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
//TODO: this code is slightly inefficient, refactor later
function redrawPartialHintPath_line (objectRef,ambiguousObjects){

    //Partial hint path by drawing individual segments...
    //Limit the visibility of the next time interval sub-path
    if (objectRef.timeDirection == 1){ //Moving forward

        if (ambiguousObjects.length > 0){
            if (ambiguousObjects[objectRef.nextView][0]==1){
                objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.nextView][1]).style("stroke",pathColour);
                return;
            }else{
                objectRef.svg.selectAll(".interactionPath").style("stroke","none");
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
        objectRef.svg.select("#currentMarker").attr("d", function (d) {
            return objectRef.hintPathGenerator([[d[objectRef.nextView][0]-lineWidth,d[objectRef.nextView][1]],
                [d[objectRef.nextView][0]+lineWidth,d[objectRef.nextView][1]]]);
        }).style("stroke",tickColour).style("stroke-width",lineThickness);

        if (objectRef.nextView < objectRef.lastView){
            objectRef.svg.select("#forwardPath").attr("stroke-dasharray",interpolateStroke(forwardPathLength,objectRef.interpValue)).style("stroke",pathColour)
                .attr("d", function (d) {
                    return objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]]);
                }).attr("filter", "url(#blur2)");
            if (objectRef.interpValue > 0.95){
                objectRef.svg.select("#forwardMarker").style("stroke",tickColour).style("stroke-width",lineThickness)
                    .attr("d", function (d) {
                        return objectRef.hintPathGenerator([[d[objectRef.nextView+1][0]-lineWidth,d[objectRef.nextView+1][1]],
                            [d[objectRef.nextView+1][0]+lineWidth,d[objectRef.nextView+1][1]]]);
                    });
            }
        }

    }else{ //Moving backward
        if (ambiguousObjects.length > 0){
            if (ambiguousObjects[objectRef.currentView][0]==1){
                objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.currentView][1]).style("stroke",pathColour);
                return;
            }else{
                objectRef.svg.selectAll(".interactionPath").style("stroke","none");
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

        objectRef.svg.select("#currentMarker").attr("d", function (d) {
            return objectRef.hintPathGenerator([[d[objectRef.currentView][0]-lineWidth,d[objectRef.currentView][1]],
                [d[objectRef.currentView][0]+lineWidth,d[objectRef.currentView][1]]]);
        }).style("stroke",tickColour).style("stroke-width",lineThickness);

        if (objectRef.currentView > 0){
            objectRef.svg.select("#backwardPath").attr("stroke-dasharray",interpolateStroke(backwardPathLength,(1-objectRef.interpValue)))
                .style("stroke",pathColour).attr("d", function (d) {
                    return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                        objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.currentView-1]]);
                }).attr("filter", "url(#blur2)");
            if (objectRef.interpValue < 0.05){
                objectRef.svg.select("#backwardMarker").style("stroke",tickColour).style("stroke-width",lineThickness)
                    .attr("d", function (d) {
                        return objectRef.hintPathGenerator([[d[objectRef.currentView-1][0]-lineWidth,d[objectRef.currentView-1][1]],
                            [d[objectRef.currentView-1][0]+lineWidth,d[objectRef.currentView-1][1]]]);
                    });
            }
        }

    }
}
/**Hides the small hint path whenever the user stops dragging */
function hidePartialHintPath (objectRef){
    objectRef.svg.select("#hintPath").selectAll("path").style("stroke","none");
}

/////////////////////////////////////////////////////// For the scatterplot \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
var radius = 10;
var radiusThickness = 1;
var circleColour = "#BDBDBD";

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
        objectRef.svg.select("#hintPath").selectAll(".interactionPath").style("stroke","none");
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
                objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.nextView][1]).style("stroke",pathColour);
                return;
            }else{
                objectRef.svg.selectAll(".interactionPath").style("stroke","none");
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
                objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.currentView][1]).style("stroke",pathColour);
                return;
            }else{
                objectRef.svg.selectAll(".interactionPath").style("stroke","none");
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