/** Constructor for a small multiples display
 * id: id of the div tag to append the svg container
 * spacing: spacing between images
 * size: dimension of the images (will be square)
 */
function Multiples(spacing,size) {
    // Save the display properties
    this.spacing = spacing;
    this.imgSize = size;
    this.svg = null;
    this.clickedImage = -1; //Index of the selected (clicked) image
    this.imageSpacingX = this.spacing+60; //Horizontal spacing between the images
    this.imageSpacingY = this.spacing+60; //Vertical spacing between the images
    this.marginWidth = 25; //Margins around the entire display
    this.baseOffset = 10; //Offset of the base of the bars
    this.backgroundColour = "#2C2D2D";    //Behind the visualization
    this.imageBorderColour = "#1C1C1C";
    this.highlightColour = "#EDEDED"; //Highlight the border of the image when its clicked
}
/**Initializes the container which will hold the multiples display (in the main svg)
 * */
Multiples.prototype.init = function (){
    this.svg = d3.select("#mainSvg").append("g").attr("id","gMultiples");
}
/**Draw the multiples display by adding the images
 * dataset to render
 * toHighlight  the data objects to be highlighted
 * type   the type of chart to render (0 - barchart and 1 - scatterplot)
 * labels names of the time slices
*/
Multiples.prototype.render = function (dataset,toHighlight,type,labels){
    var ref = this;

    //Draw the images, ordered by time from left to right, then top to bottom
    var row = 0;
    var col = 0;

    var imageLayout = [];
    for (var i=0;i<labels.length;i++){
        var imgY = row*ref.imageSpacingY + row*ref.imgSize + ref.marginWidth;
        var imgX = ref.imgSize*col + ref.imageSpacingX*col + 15;

        col++;
        if (col >= 4){
            row++;
            col = 0;
        }
        imageLayout[i] = {"id":i,"x":imgX,"y":imgY,"label":labels[i]};
    }
    this.svg.selectAll(".multiples").data(imageLayout).enter().append("g")
        .attr("transform",function (d){return "translate("+ d.x+","+ d.y+")";})
        .attr("class","multiples").attr("id",function (d){return "multiples"+ d.id});

    this.svg.selectAll(".multiples").append("rect").attr("width",(this.imgSize+this.spacing+30)).attr("height",(this.imgSize+this.marginWidth+15))
        .on("click",function (d,i){
           if (i != ref.clickedImage) {
                d3.select("#multiplesBackground"+ref.clickedImage).style("stroke", ref.imageBorderColour); //Clear the previously selected image border
            }
            //Highlight the image by colouring its border
            d3.select("#multiplesBackground"+i).style("stroke",ref.highlightColour);
            ref.clickedImage = i;
            logTouchDown(i,d3.mouse(this)[0],d3.mouse(this)[1]);
            logTouchUp(i,d3.mouse(this)[0],d3.mouse(this)[1]);
        })
        .attr("transform","translate(-7,0)")
        .attr("class","multiples").attr("id",function (d,i){return "multiplesBackground"+i})
        .style("fill",this.backgroundColour).style("stroke",this.imageBorderColour).style("stroke-width",10)
        .each(function(d){
            if (type==0){
                ref.drawStaticBarchart(dataset,d.id, toHighlight);
            }else if (type==1){
                ref.drawStaticScatterplot(dataset,d.id, toHighlight,ref.imgSize);
            }

        });
    this.svg.selectAll(".multiples").append("text")
        .style("fill","#EDEDED").style("font-family","sans-serif").style("font-size","20px")
        .style("font-weight","bold")
        .attr("transform","translate(-10,-10)")
        .text(function (d){return d.label});
}
////////////////////////////////////functions added for the user study///////////////////////////////////////////////////
Multiples.prototype.drawStaticScatterplot = function (data,view,highlightPoints,height){
    var ref = this;

    //Find the max and min values of the points, used to scale the axes and the dataset
    var max_x = d3.max(data.map(function (d){return d3.max(d.points.map(function (a){return a[0];}) ); }));
    var max_y = d3.max(data.map(function (d){return d3.max(d.points.map(function (a){return a[1];}) ); }));

    //Create the scales by mapping the x,y to the svg size
    var xScale = d3.scale.linear().domain([0,max_x]).range([0,height]);
    var yScale =  d3.scale.linear().domain([0, max_y]).range([height,0]);

    this.drawAxes_scatterplot(view,xScale,yScale);

    d3.select("#multiples"+view).selectAll(".multiplesPoints")
        .data(data.map(function (d,i) {
        var scaledPoints = [];
        for (var j=0;j< d.points.length;j++){
            scaledPoints[j] = [xScale(d.points[j][0])+ref.baseOffset+ref.spacing,yScale(d.points[j][1])+10];
        }
        return {nodes:scaledPoints,id:i,label:d.label};
    })).enter().append("svg:circle").attr("r", 8)
        .attr("cx", function(d) {return d.nodes[view][0];})
        .attr("cy", function(d) {return d.nodes[view][1];})
        .style("fill", function (d){
            return (d.id==highlightPoints[0])?"#D95F02":(d.id==highlightPoints[1])?"#1B9E77":"#BDBDBD";
        }).style("pointer-events","none").attr("class","multiplesPoints");

}
/** Draws a static barchart without hint path, time direction prediction etc.
 *   data: set adhere to the same format as accepted by the render function
 *   id: id of g element to draw the barchart on
 *   view: to set the barchart at
 *   highlightBars: bar or bars to highlight in the view
 *   height: of the barchart image
 * */
Multiples.prototype.drawStaticBarchart = function (data,view,highlightBars){
    var ref = this;

    //Find the max value of the heights, used to scale the axes and the dataset
    var max_h = d3.max(data.map(function (d){return d3.max(d.heights);}));
    var numBars = data.length;
    var base = this.imgSize -5;
    var height = this.imgSize;

    //Create the scales
    var xScale = d3.scale.linear().domain([0,numBars]).range([0,height]);
    var yScale =  d3.scale.linear().domain([0,max_h]).range([0,height]);

    //Draw the axes
    yScale =  d3.scale.linear().domain([max_h,0]).range([0,height]); //Reverse the scale to get the corect axis display
    this.drawAxes_barchart(view,xScale,yScale);

    //Assign data values to a set of rectangles representing the bars of the chart and draw the bars
    d3.select("#multiples"+view).selectAll(".multiplesBars")
        .data(data.map(function (d,i) {
        var newData = [base - yScale(d.heights[view]),yScale(d.heights[view])+10];
        return {nodes:newData,id:i,xPos:(xScale(i)+ref.spacing+ref.baseOffset)};
    })).enter().append("rect").attr("x", function(d){return d.xPos;})
        .attr("y", function(d){ return d.nodes[1];})
        .attr("width", 15).attr("height", function(d) {return d.nodes[0]})
        .style("fill", function (d){
            return (d.id==highlightBars[0])?"#D95F02":(d.id==highlightBars[1])?"#1B9E77":"#BDBDBD";
        }).style("pointer-events","none").attr("class","multiplesBars");
}

/** Draws the axes  and the graph title on the SVG for the barchart multiples
 *  xScale: a function defining the scale of the x-axis
 *  yScale: a function defining the scale of the y-axis
 *  id: of the g element to append the axes within
 * */
Multiples.prototype.drawAxes_barchart = function (id,xScale,yScale){
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(0,0,0);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(-this.imgSize,0,0);

    // Add the y-axis
    d3.select("#multiples"+id).append("g").attr("class", "axis")
        .attr("transform", "translate("+ (this.spacing-5+this.baseOffset)+ ","+(this.baseOffset)+")")
        .call(yAxis)
    .append("g").attr("class", "axis").style("pointer-events","none")
        .attr("transform", "translate(0," + (this.imgSize) + ")")
        .call(xAxis).selectAll("text").text("");
}
/** Draws the axes  and the graph title on the SVG for the scatterplot multiples
 *  xScale: a function defining the scale of the x-axis
 *  yScale: a function defining the scale of the y-axis
 *  id: of the g element to append the axes within
 * */
Multiples.prototype.drawAxes_scatterplot = function (id,xScale,yScale){
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-this.imgSize,0,0);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(-this.imgSize,0,0);

    // Add the y-axis
    d3.select("#multiples"+id).append("g").attr("class", "yAxis")
        .attr("transform", "translate("+ (this.spacing+this.baseOffset)+ ","+(this.baseOffset)+")")
        .call(yAxis)
        .append("g").attr("class", "xAxis").style("pointer-events","none")
        .attr("transform", "translate(0," + (this.imgSize) + ")")
        .call(xAxis);
}
/** Removes the multiples from its g element
 * */
Multiples.prototype.remove = function (){
     this.svg.selectAll(".multiples").remove();
     this.svg.selectAll(".axis").remove();
}
