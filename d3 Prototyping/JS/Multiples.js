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
    this.svgSize = imagesX*imagesY*size + imagesX*imagesY*spacing;
    this.svg = null;
    this.clickImageFunction = {};
}
/**Draw the multiples display by adding the images
 * imageArray: strings containing the image file name, assume that the image is placed in the same
 *  directory as this file and the images are ordered by time */
Multiples.prototype.render = function (imageArray){
    var ref = this;
    //Draw the main svg container
    this.svg = d3.select("#multiples").append("svg") .attr("x", "0").attr("y", "0").attr("width", this.svgSize).attr("height", this.svgSize);

    //Draw the images, ordered by time from left to right, then top to bottom
    var row = 0;
    var col = 0;
    this.svg.selectAll(".images")
        .data(imageArray.map(function (d,i) {
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
        .attr("width", this.imgSize).attr("height", this.imgSize)
        .on("click",this.clickImageFunction);
}
