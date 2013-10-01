/** Constructor for a small multiples display
 * id: id of the div tag to append the svg container
 * spacing: spacing between images
 * size: dimension of the images (should be square)
 * imagesX: number of images along the x
 * imagesY: number of images along the y
 */
function Multiples(id,spacing,size,imagesX,imagesY) {
    // Save the display properties
    this.id = id;
    this.spacing = spacing;
    this.imgSize = size;
    //this.svgSize = imagesX*imagesY*size + imagesX*imagesY*spacing;
    this.svg = null;
    this.clickImageFunction = {};
    this.selectedImage = -1; //Index of the selected (clicked) image
}
/**Draw the multiples display by adding the images
 * imageArray: strings containing the image file name, assume that the image is placed in the same
 *  directory as this file and the images are ordered by time */
Multiples.prototype.render = function (imageArray){
    var ref = this;
    //Draw the main svg container
    //TODO: for now, appends to the same svg as the main visualization because of ordering issues, fixing this problem later
    //TODO: will require one shared svg among all visualizations and each visualization assigned to its own 'g' (g can be used to simulate layers)

    this.svg = d3.select("#mainSvg");//.attr("x", "0").attr("y", "0").attr("width", this.svgSize).attr("height", this.svgSize);

    //Draw the images, ordered by time from left to right, then top to bottom
    var row = 0;
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
        .on("click",this.clickImageFunction).attr("id",function (d){return "image"+ d.id})
        .attr("class","images");


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
    console.log("view selected: "+this.clickedImage);
}