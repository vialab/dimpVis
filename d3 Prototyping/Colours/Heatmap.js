//Heatmap layout taken from Mike Bobstock: http://bl.ocks.org/mbostock/4063318
////////////////////////////////////////////////////////////////////////////////
// Used to draw the heatmap
////////////////////////////////////////////////////////////////////////////////
function Heatmap(x, y, w, h, id) {

   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.width = w;
   this.height = h;
   this.id = id;   
   this.cellSize = 17;

   // Reference to the main widget
   this.widget = null;  
   //Variables to track dragged point location within path ("view switches")
   this.currentView = -1;
   this.nextView = -1;
   this.totalViews = -1; //Last index of the points (nodes) array
   //The number of different instances across dimension (e.g., 4 different views for each year)
   this.numViews = 10;
   
   this.direction = 1; //Forward along the data dimension (e.g., time)
   // Data used for display
   this.displayData = [];   
   this.labels = [];
   this.clickedPoint = -1;
   this.hoveredPoint = -1;
   this.draggedPoint = -1;
   this.dragging = 0;
   this.dragEvent = null;
}

////////////////////////////////////////////////////////////////////////////////
// Prototype functions
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Initializes the svg 
////////////////////////////////////////////////////////////////////////////////
Heatmap.prototype.init = function() {
  
   // Initialize the main container
   this.widget = d3.select(this.id)
      .append("svg")	   
      .attr("width", this.width)
      .attr("height", this.height)  
	   .attr("class", "RdYlGn")
     .append("g") ; 
     //.attr("transform", "translate(" + ((this.width - this.cellSize * 53) / 2) + "," + (this.height - this.cellSize * 7 - 1) + ")");	 
 
}
////////////////////////////////////////////////////////////////////////////////
// Render
////////////////////////////////////////////////////////////////////////////////
Heatmap.prototype.render = function(data) {
  var ref = this; 
  var day = d3.time.format("%w"),
    week = d3.time.format("%U"),
    percent = d3.format(".1%"),
    format = d3.time.format("%Y-%m-%d");
 var startYear = 1990;	
 var color = d3.scale.quantize()
    .domain([-.05, .05])
    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));
//Label of the heatmap
/**this.widget.append("text")
    .attr("transform", "translate(-6," + ref.cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text("1999");*/
//Draw the cells for each day	
this.widget.selectAll(".day")
    .data(function(d) { return d3.time.days(new Date(startYear, 0, 1), new Date(startYear+1, 0, 1)); })
  .enter().append("rect")
    .attr("class", "day")
    .attr("width", this.cellSize)
    .attr("height", this.cellSize)
	.attr("id", function (d,i) {return i;})
    .attr("x", function(d) { return week(d) * ref.cellSize; })
    .attr("y", function(d) { return day(d) * ref.cellSize; })
    .datum(format)
	.append("title")
    .text(function(d) { return d; });
//Draw the paths to surround each month
this.widget.selectAll(".month")
    .data(function(d) { return d3.time.months(new Date(startYear, 0, 1), new Date(startYear+1, 0, 1)); })
  .enter().append("path")
    .attr("class", "month")
    .attr("d", function (d) {return ref.monthPath(d);});
/** this.widget.selectAll(".day").filter(function(d) { return d in dates; })
        .attr("class", function(d) { return "day q" + Math.round(color(dates[d])) + "-9"; })
        .select('title')
        .text(function(d) { return fullFormat(d) + ": " + dates[d].toFixed(1); });*/
//Debugging: Find real daily data to populate calendar		
this.widget.selectAll(".day")
        .attr("class", function(d) { return color(0.01); });        
//Still need to figure out what this does..
d3.select(self.frameElement).style("height", "2910px");

//Draw the colour indicator

}
//Draws the outline for each month in black
//t0: the node representing a month, for each month this function is called
Heatmap.prototype.monthPath = function(t0){
   var ref = this;  
   var day = d3.time.format("%w"), week = d3.time.format("%U");
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);  
  return "M" + (w0 + 1) * ref.cellSize + "," + d0 * ref.cellSize
      + "H" + w0 * ref.cellSize + "V" + 7 * ref.cellSize
      + "H" + w1 * ref.cellSize + "V" + (d1 + 1) * ref.cellSize
      + "H" + (w1 + 1) * ref.cellSize + "V" + 0
      + "H" + (w0 + 1) * ref.cellSize + "Z";
}



