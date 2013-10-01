/** Draws partial hint paths for each visualization
 *  Will be used in the user study
 * */

 //Variables for the hint path line (barchart, heatmap)
var lineWidth= 6;
var lineThickness = 3;
 /** Displays small hint path by appending its svg components to the main svg
 *  translate: amount the path should be translated by in order to align with the
 *  dragged data object
 *  pathData: an array of points to appear along the entire hint path
 * */
function drawPartialHintPath_line (objectRef,translate,pathData){
    //Trying out clipping..
    //http://stackoverflow.com/questions/10486896/svg-clip-path-within-rectangle-does-not-work
    /** var clippingFrame = 2;
     var clipWidth = Math.abs(objectRef.pathData[objectRef.currentView][0] - objectRef.pathData[objectRef.currentView + clippingFrame][0]);

     objectRef.svg.append("svg:clipPath").attr("id","clip")
     .append("rect").attr("id","clip-rect").attr("width",clipWidth).attr("height",objectRef.height)
     .attr("x",objectRef.pathData[objectRef.currentView][0]).attr("y",0).attr("transform","translate("+(translate+objectRef.barWidth/2)+")");

     //Draw a white underlayer
     objectRef.svg.select("#hintPath").append("path")
     .attr("filter", "url(#blur)")
     .attr("d",  objectRef.hintPathGenerator( objectRef.pathData))
     .attr("transform","translate("+(-translate)+")")
     .attr("id","underLayer").attr("clip-path","url(#clip)");

     //Draw the hint path line
     objectRef.svg.select("#hintPath").append("path")
     .attr("d",  objectRef.hintPathGenerator( objectRef.pathData))
     .attr("filter", "url(#blur)")
     .attr("transform","translate("+(-translate)+")")
     .attr("id","path").attr("clip-path","url(#clip)");*/

      //Partial hint path by drawing individual segments...
      //Draw the hint path line segment at current and next view
    objectRef.svg.select("#hintPath").append("path").datum(pathData)//.attr("clip-path", "url(#clip)")
        .attr("transform","translate("+(-translate)+")").attr("id","path").style("stroke","#bdbdbd")
        .attr("d", function (d) {
            return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
        });

    //Set the small path to only show 20% of it
    /** var length = d3.select("#path").node().getTotalLength();
     var interpStr = d3.interpolateString("0," + length, length + "," + length);
     objectRef.svg.select("#path").attr("stroke-dasharray",interpStr(0.2));*/

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
    //CLIPPING:
    //objectRef.svg.select("#clip-rect").attr("transform","translate(" + (translateAmount) + ")");

    //Partial hint path by drawing individual segments...
    //Limit the visibility of the next time interval sub-path
    if (objectRef.timeDirection == 1){ //Moving forward

        if (ambiguousObjects.length > 0){
            if (ambiguousObjects[objectRef.nextView][0]==1){
                objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.nextView][1]).style("stroke","#bdbdbd");
                return;
            }else{
                objectRef.svg.selectAll(".interactionPath").style("stroke","none");
            }
        }
        //Clear the backward path
        objectRef.svg.select("#backwardPath").style("stroke","none");
        objectRef.svg.select("#backwardMarker").style("stroke","none");

        //Create the interpolation function and get the total length of the path
        var length = d3.select("#forwardPath").node().getTotalLength();
        var interpStr = d3.interpolateString("0," + length, length + "," + length);

        //Full sub-path of current time interval is always visible
        objectRef.svg.select("#path").attr("d", function (d) {
            return objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
        });
        objectRef.svg.select("#currentMarker").attr("d", function (d) {
            return objectRef.hintPathGenerator([[d[objectRef.nextView][0]-lineWidth,d[objectRef.nextView][1]],
                [d[objectRef.nextView][0]+lineWidth,d[objectRef.nextView][1]]]);
        }).style("stroke","#636363").style("stroke-width",lineThickness);

        if (objectRef.nextView < objectRef.lastView){
            objectRef.svg.select("#forwardPath").attr("stroke-dasharray",interpStr(objectRef.interpValue)).style("stroke","#bdbdbd")
                .attr("d", function (d) {
                    return objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]]);
                });
            if (objectRef.interpValue > 0.95){
                objectRef.svg.select("#forwardMarker").style("stroke","#636363").style("stroke-width",lineThickness)
                    .attr("d", function (d) {
                        return objectRef.hintPathGenerator([[d[objectRef.nextView+1][0]-lineWidth,d[objectRef.nextView+1][1]],
                            [d[objectRef.nextView+1][0]+lineWidth,d[objectRef.nextView+1][1]]]);
                    });
            }
        }


        //Clear the backward path
        //Trying to reduce the partial hint path even more here
        /**objectRef.svg.select("#backwardPath").style("stroke","none");
         if (objectRef.interpValue+0.2 >1){ //Overflow, draw the next segment

         //Create the interpolation function and get the total length of the path
         var length = d3.select("#forwardPath").node().getTotalLength();
         var interpStr = d3.interpolateString("0," + length, length + "," + length);
         objectRef.svg.select("#forwardPath").attr("stroke-dasharray",interpStr(objectRef.interpValue*0.2)).style("stroke","#666")
         .attr("d", function (d) {
         return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.nextView]:
         objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]]);
         });
         //Remove part of the trailing hint path
         length = d3.select("#path").node().getTotalLength();
         var interpStr2 = d3.interpolateString("0," + length, length + "," + length);
         objectRef.svg.select("#path").attr("stroke-dasharray",interpStr2(0.8)).attr("d", function (d) {
         return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
         objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
         });
         }else{ //Keep drawing the #path element
         //Set the small path to only show 20% of it
         var length = d3.select("#path").node().getTotalLength();
         var interpStr = d3.interpolateString("0," + length, length + "," + length);
         objectRef.svg.select("#path").attr("stroke-dasharray",interpStr(0.2+objectRef.interpValue)).attr("d", function (d) {
         return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
         objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
         });
         objectRef.svg.select("#forwardPath").style("stroke","none");
         }*/


    }else{ //Moving backward
        if (ambiguousObjects.length > 0){
            if (ambiguousObjects[objectRef.currentView][0]==1){
                objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.currentView][1]).style("stroke","#bdbdbd");
                return;
            }else{
                objectRef.svg.selectAll(".interactionPath").style("stroke","none");
            }
        }
        //Clear the forward path
        objectRef.svg.select("#forwardPath").style("stroke","none");
        objectRef.svg.select("#forwardMarker").style("stroke","none");

        //Create the interpolation function and get the total length of the path
        var length = d3.select("#backwardPath").node().getTotalLength();
        var interpStr = d3.interpolateString("0," + length, length + "," + length);

        //Full sub-path of current time interval is always visible
        objectRef.svg.select("#path").attr("d", function (d) {
            return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
        });
        objectRef.svg.select("#currentMarker").attr("d", function (d) {
            return objectRef.hintPathGenerator([[d[objectRef.currentView][0]-lineWidth,d[objectRef.currentView][1]],
                [d[objectRef.currentView][0]+lineWidth,d[objectRef.currentView][1]]]);
        }).style("stroke","#636363").style("stroke-width",lineThickness);

        if (objectRef.currentView > 0){
            objectRef.svg.select("#backwardPath").attr("stroke-dasharray",interpStr(1-objectRef.interpValue)).style("stroke","#bdbdbd")
                .attr("d", function (d) {
                    return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                        objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.currentView-1]]);
                });
            if (objectRef.interpValue < 0.05){
                objectRef.svg.select("#backwardMarker").style("stroke","#636363").style("stroke-width",lineThickness)
                    .attr("d", function (d) {
                        return objectRef.hintPathGenerator([[d[objectRef.currentView-1][0]-lineWidth,d[objectRef.currentView-1][1]],
                            [d[objectRef.currentView-1][0]+lineWidth,d[objectRef.currentView-1][1]]]);
                    });
            }
        }
        //Trying to reduce the partial hint path even more here
        /** objectRef.svg.select("#forwardPath").style("stroke","none");
         if (objectRef.interpValue+0.2 >1){ //Overflow, draw the next segment

         //Create the interpolation function and get the total length of the path
         var length = d3.select("#backwardPath").node().getTotalLength();
         var interpStr = d3.interpolateString("0," + length, length + "," + length);
         objectRef.svg.select("#backwardPath").attr("stroke-dasharray",interpStr(objectRef.interpValue*0.2)).style("stroke","#666")
         .attr("d", function (d) {
         return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
         objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.currentView-1]]);
         });
         }else{ //Keep drawing the #path element
         //Set the small path to only show 20% of it
         var length = d3.select("#path").node().getTotalLength();
         var interpStr = d3.interpolateString("0," + length, length + "," + length);
         objectRef.svg.select("#path").attr("stroke-dasharray",interpStr(0.2+objectRef.interpValue)).attr("d", function (d) {
         return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
         objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
         });
         objectRef.svg.select("#backwardPath").style("stroke","none");
         }*/

    }
}
/**Hides the small hint path whenever the user stops dragging */
function hidePartialHintPath (objectRef){
    objectRef.svg.select("#hintPath").selectAll("path").style("stroke","none");
}