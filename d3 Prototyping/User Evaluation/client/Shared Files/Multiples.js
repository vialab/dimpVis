/** Constructor for a small multiples display
 * id: id of the div tag to append the svg container
 * spacing: spacing between images
 * size: dimension of the images (should be square)
 * imagesX: number of images along the x
 * imagesY: number of images along the y
 */
function Multiples(spacing,size,imagesX,imagesY) {
    // Save the display properties
    this.spacing = spacing;
    this.imgSize = size;
    //this.svgSize = imagesX*imagesY*size + imagesX*imagesY*spacing;
    this.svg = null;
    this.clickImageFunction = {};
    this.selectedImage = -1; //Index of the selected (clicked) image
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
    var id = "#gMultiples";
    this.drawStaticBarchart(dataset, id,0,highlightBars,this.imgSize,this.imgSize);
    //Draw the images, ordered by time from left to right, then top to bottom
    /**var row = 0;
    var col = 0;
    this.svg.selectAll(".images").data(imageArray.map(function (d,i) {
           var imgY = row*ref.spacing + row*ref.imgSize;
           var imgX = ref.imgSize*col + ref.spacing*col;

           col++;
           if (col >= 2){
               row++;
               col = 0;
           }
           return {id:i,name:d,x:imgX,y:imgY};
    })).enter().append("svg:image").attr("xlink:href",function (d){return d.name})
        .attr("x", function (d){return d.x}).attr("y", function (d){return d.y})
        .attr("width", this.imgSize).attr("height", this.imgSize).style("cursor","pointer")
        .on("click",this.clickImageFunction).attr("id",function (d){return "image"+ d.id});*/

    //Add a blank rectangle used for highlighting a selected image
    this.svg.append("rect").attr("id","border");
}
//Clears the small multiples display
Multiples.prototype.remove = function (){
    this.svg.selectAll(".images").remove();
    this.svg.select("rect").remove();
}
//Draws a border around an image when it is selected, at position x,y (of the image)
Multiples.prototype.highlightImage = function (x,y){
    this.svg.select("#border").attr("x", x).attr("y", y)
        .attr("width", this.imgSize).attr("height", this.imgSize)
        .style("fill","none").style("stroke","black").style("stroke-width",5);
    console.log("view selected: "+this.selectedImage);
}

////////////////////////////////////functions added for the user study///////////////////////////////////////////////////
/** Draws a static barchart without hint path, time direction prediction etc.
 *   data: set adhere to the same format as accepted by the render function
 *   id: id of g element to draw the barchart on
 *   view: to set the barchart at
 *   highlightBars: bar or bars to highlight in the view
 *   width, height: of the barchart
 * */
Multiples.prototype.drawStaticBarchart = function (data,id,view,highlightBars,width,height){
    var ref = this;

    //Find the max value of the heights, used to scale the axes and the dataset
    var max_h = d3.max(data.map(function (d){return d3.max(d.heights);}));
    var numBars = data.length;
    var base = height-5;

    //Create the scales
    var xScale = d3.scale.linear().domain([0,numBars]).range([0,width]);
    var yScale =  d3.scale.linear().domain([0,max_h]).range([0,height]);

    //Draw the axes
    yScale =  d3.scale.linear().domain([max_h,0]).range([0,height]); //Reverse the scale to get the corect axis display
    this.drawAxes(xScale,yScale);

    //Assign data values to a set of rectangles representing the bars of the chart and draw the bars
    d3.select(id).selectAll("rect")
        .data(data.map(function (d,i) {
        //Need to adjust the dataset to contain y-positions and heights
        //Array format is: data[viewIndex] = [y of top of bar, height of bar]
        var data = [];
        for (var j=0;j< d.heights.length;j++){
            data[j] = [base - yScale(d.heights[j]),yScale(d.heights[j])];
        }
        return {nodes:data,id:i,label:d.label,xPos:(xScale(i)+ref.spacing)};
    })).enter().append("rect")
        .attr("x", function(d){return d.xPos;})
        .attr("y", function(d){ return d.nodes[view][0];})
        .attr("width", 10)
        .attr("height", function(d) {return d.nodes[view][1]})
        .style("fill", function (d){
            return (d.id==highlightBars[0])?"#D95F02":(d.id==highlightBars[1])?"#1B9E77":"#BDBDBD";
        });
}

/** Draws the axes  and the graph title on the SVG
 *  xScale: a function defining the scale of the x-axis
 *  yScale: a function defining the scale of the y-axis
 * */
Multiples.prototype.drawAxes = function (xScale,yScale){

    //Define the axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    // Add the y-axis
    this.svg.append("g").attr("class", "axis")
        .attr("transform", "translate("+ this.spacing+ ",0)")
        .call(yAxis);

    //Add the x-axis
    this.svg.append("g").attr("class", "axis")
        .attr("transform", "translate("+this.spacing+"," + this.imgSize + ")")
        .call(xAxis);
}