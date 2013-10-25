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
    this.imageSpacingY = this.spacing+20; //Vertical spacing between the images
    this.marginWidth = 15; //Margins around the entire display
    this.baseOffset = 10; //Offset of the base of the bars
    this.visSpacing = 10; //Offset the visualization within the image to make room for the axis
    this.backgroundColour = "#2C2D2D";    //Behind the visualization
    this.imageBorderColour = "black";
    this.highlightColour = "white"; //Highlight the border of the image when its clicked
}
/**Initializes the container which will hold the multiples display (in the main svg)
 * */
Multiples.prototype.init = function (){
    this.svg = d3.select("#mainSvg").append("g").attr("id","gMultiples");
}
/**Draw the multiples display by adding the images
*/
Multiples.prototype.render = function (dataset,highlightBars){
    var ref = this;

    //Draw the images, ordered by time from left to right, then top to bottom
    var row = 0;
    var col = 0;

    var imageLayout = [];
    for (var i=0;i<10;i++){
        var imgY = row*ref.imageSpacingY + row*ref.imgSize + ref.marginWidth;
        var imgX = ref.imgSize*col + ref.imageSpacingX*col + ref.marginWidth;

        col++;
        if (col >= 3){
            row++;
            col = 0;
        }
        imageLayout[i] = {"id":i,"x":imgX,"y":imgY};
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
            ref.drawStaticBarchart(dataset,d.id, highlightBars,ref.imgSize, d.x);
        });
}
////////////////////////////////////functions added for the user study///////////////////////////////////////////////////
/** Draws a static barchart without hint path, time direction prediction etc.
 *   data: set adhere to the same format as accepted by the render function
 *   id: id of g element to draw the barchart on
 *   view: to set the barchart at
 *   highlightBars: bar or bars to highlight in the view
 *   height: of the barchart image
 * */
Multiples.prototype.drawStaticBarchart = function (data,view,highlightBars,height,xOffset){
    var ref = this;

    //Find the max value of the heights, used to scale the axes and the dataset
    var max_h = d3.max(data.map(function (d){return d3.max(d.heights);}));
    var numBars = data.length;
    var base = height+this.baseOffset;

    //Create the scales
    var xScale = d3.scale.linear().domain([0,numBars]).range([0,height]);
    var yScale =  d3.scale.linear().domain([0,max_h]).range([0,height]);

    //Draw the axes
    yScale =  d3.scale.linear().domain([max_h,0]).range([0,height]); //Reverse the scale to get the corect axis display
    this.drawAxes(view,xScale,yScale);

    //Assign data values to a set of rectangles representing the bars of the chart and draw the bars
    d3.select("#multiples"+view).selectAll(".mulitplesBars")
        .data(data.map(function (d,i) {
        var data = [base - yScale(d.heights[view]),yScale(d.heights[view])];
        return {nodes:data,id:i,xPos:(xScale(i)+ref.spacing+ref.baseOffset)};
    })).enter().append("rect").attr("x", function(d){return d.xPos;})
        .attr("y", function(d){ return d.nodes[0];})
        .attr("width", 20).attr("height", function(d) {return d.nodes[1]})
        .style("fill", function (d){
            return (d.id==highlightBars[0])?"#D95F02":(d.id==highlightBars[1])?"#1B9E77":"#BDBDBD";
        }).style("pointer-events","none").attr("class","multiplesBars");
}

/** Draws the axes  and the graph title on the SVG
 *  xScale: a function defining the scale of the x-axis
 *  yScale: a function defining the scale of the y-axis
 *  id: of the g element to append the axes within
 * */
Multiples.prototype.drawAxes = function (id,xScale,yScale){

    //Define the axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    // Add the y-axis
    d3.select("#multiples"+id).append("g").attr("class", "axis")
        .attr("transform", "translate("+ (this.spacing-5+this.baseOffset)+ ","+(this.baseOffset+5)+")")
        .call(yAxis)
    .append("g").attr("class", "axis")
        .attr("transform", "translate(0," + (this.imgSize) + ")")
        .call(xAxis).selectAll("text").text("");
}
/** Removes the multiples from its g element
 * */
Multiples.prototype.remove = function (){
     this.svg.selectAll(".multiples").remove();
     this.svg.selectAll(".axis").remove();
}
