//Heatmap layout taken from Mike Bobstock: http://bl.ocks.org/mbostock/4063318
////////////////////////////////////////////////////////////////////////////////
// Used to draw the heatmap
////////////////////////////////////////////////////////////////////////////////
function Heatmap(x, y, w, h, id,l) {

   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.width = w;
   this.height = h;
   this.id = id;   
   this.cellSize = 35;
   this.selected = -1; //Variable to track whether or not a day is selected
 
   // Reference to the main widget
   this.widget = null;  
   //Variables to track dragged point location within path ("view switches")
   this.currentView = 0; //Start at the first view
   this.direction = 1; //The y-direction the mouse is travelling in
   this.previousMouseY=null; //To track the old mouse positions
   this.interpValue = 0; //Value to track the progress of colour interpolation when switching between views
   this.pixelTolerance = 2; //Number of pixels to move before an interpolation in colour occurs (slow down the colour switching)
   //Variables used for displaying the dataset
   this.allData = [];
   this.displayData=[];   
   this.labels = l;
   //Declare some functions
   this.dragEvent = null;
   //Function for assigning colours to each cell
   this.generateColour = d3.scale.quantize()
    .domain([-.05, .05])
    .range(["rgb(165,0,38)","rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)", "rgb(254,224,139)"]);
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
Heatmap.prototype.render = function(data,rows,columns) {
  var ref = this;
 //Store all data and specify the data subset to display  
 ref.allData = data;
 ref.displayData = data[ref.currentView];
 
//Label of the heatmap
/**this.widget.append("text")
    .attr("transform", "translate(-6," + ref.cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text("1999");*/
//Draw the cells for each day	
this.widget.selectAll(".cell")
    .data(ref.displayData.map(function (d,i) {   
	      var allColours = [];
          for (var j=0;j<ref.allData.length;j++){       
				allColours[j] = ref.generateColour(ref.allData[j][i].colourValue);	   
         }		 
	     return {id:i,values:d,x:d.row*ref.cellSize,y:d.column*ref.cellSize,colours:allColours};
	}))
  .enter().append("rect")
    .attr("class", "cell")
    .attr("width", this.cellSize)
    .attr("height", this.cellSize)	
	.attr("id", function (d) {return "cell"+d.id;})
    .attr("x", function(d) { 	 
	      return d.x; })
    .attr("y", function(d) {    
	    return d.y; })
	.style("cursor", "pointer")
	.append("title")
    .text(function(d) { return d.id; });
	

//TODO Later: assign data values to the days and colour them accordingly, using the colour scale
/** this.widget.selectAll(".day").filter(function(d) { return d in dates; })
        .attr("class", function(d) { return "day q" + Math.round(color(dates[d])) + "-9"; })
        .select('title')
        .text(function(d) { return fullFormat(d) + ": " + dates[d].toFixed(1); });*/
//Debugging: Find real daily data to populate calendar		
this.widget.selectAll(".cell")
        .attr("fill", function(d) { return ref.generateColour(d.values.colourValue); });
//Draw the g element to contain the hint path for the dragged tile
this.widget.append("g").attr("id","hintPath");     

}
//Updates the colour of the dragged cell by interpolation
Heatmap.prototype.updateDraggedCell = function(id, mouseY){
  var ref = this;
  var yDiff = Math.abs(mouseY - ref.previousMouseY); 
  if (yDiff<=ref.pixelTolerance && yDiff>0 && ref.interpValue <= 0.9){
     ref.interpValue += 0.1;	 
  }else{
     ref.interpValue = 1;
  }
  
  this.widget.select("#cell"+id).each(function (d){
       //Get the y coordinate of the cell and calculate the middle of it      	   
	  var middleY = d.y+ref.cellSize/2;
	  var oldColour = d.colours[ref.currentView]; //Save the previous colour	
      var nextColour;	   
	  if (mouseY<middleY && ref.currentView !=0){ //Make sure not at first view 
	         ref.direction = -1;
             if (ref.interpValue < 1){ //Not yet reached the next view
			      ref.interpolateColours(-1);
             }else{			 
				 ref.currentView--;
                 ref.interpValue = 0;				 
				 ref.updateView();	
             }			 
         	        		 
	  }else if (ref.currentView != (ref.allData.length-1)){	 //Make sure not at last view 
             ref.direction = 1;	  
		     if (ref.interpValue < 1){
			     ref.interpolateColours(1);
			 }else{
			    ref.currentView++;	
                ref.interpValue = 0;				
			    ref.updateView(); 
			 }		        		 
	  }    
	}); 
   ref.previousMouseY = mouseY;
   //console.log(ref.interpValue);
}
//Updates the colour of the rest of the cells based on the dragged cell
//Updates the hint path of the dragged cell
Heatmap.prototype.updateView = function(){
  var ref = this;
  //Re-colour all other cells
  this.widget.selectAll(".cell")
 // .transition().duration(400)
  .attr("fill", function (d){      
      return d.colours[ref.currentView];  
  });
  //Re-position the hint path indicator to show current view
  this.widget.select("#hintIndicator")
             .attr("y",(ref.currentView*ref.cellSize/2));
}
//Updates the colour of the rest of the cells interpolating between views
//view: -1 if the view is transitioning backwards
//           1 if the view is transitioning forwards
Heatmap.prototype.interpolateColours = function(view){
  var ref = this; 
  var nextView = view + ref.currentView;
  //Re-colour all other cells
  this.widget.selectAll(".cell")
  //.transition().duration(400)
  .attr("fill", function (d){    
      var interpolator = d3.interpolate(d.colours[ref.currentView],d.colours[nextView]);  
      return interpolator(ref.interpValue);  
  }); 
   //Re-position the hint path indicator to show transition to next view
   this.widget.select("#hintIndicator")
             .attr("y",(ref.interpValue*nextView*ref.cellSize/2));  
}
//Snaps to a view based on the direction of the mouse and the interpolation value (which colour is closer)
Heatmap.prototype.snapToView = function(){
  var ref = this;
  if (ref.interpValue > 0.5){ //Only update the view if the interpolation is over 50% to the next colour
       if (ref.direction == -1){
         ref.currentView--;
	  } else {
	     ref.currentView++;
	  }
  }
  //Update the view
  ref.interpValue = 0;
  ref.updateView();  
}
//Draws a hint path for the selected day tile
//id: The ID of the dragged tile
// colours: All colour states of the dragged cell
// x: the current x position of the cell
// y: the current y position of the cell
Heatmap.prototype.showHintPath = function(id,colours,x,y){
   var ref = this;   
   
  //Draw the "hint cells" and hint labels
   this.widget.select("#hintPath").selectAll("rect")
		   .data(colours).enter().append("rect")
		   .attr("x",200)
		   .attr("y",function (d,i){return i*ref.cellSize/2;})
		   .attr("width",ref.cellSize)
		   .attr("height",ref.cellSize/2)
		   .attr("fill", function (d){ return d;});
   
  this.widget.select("#hintPath").selectAll("text")
            .data(colours).enter()	   
		   .append("text")
		   .attr("x",(200+ref.cellSize))		  
		   .attr("y",function (d,i){return (i*ref.cellSize/2+ref.cellSize/3);})
		   .text(function (d,i){ return ref.labels[i];}); 
 //Position and render the indicator to show which view is currently selected
 this.widget.select("#hintPath").append("rect")
	        .attr("id","hintIndicator")
		    .attr("x",200)
		   .attr("y",(ref.currentView*ref.cellSize/2))
		   .attr("stroke","#000")
		   .attr("fill","none")
			.attr("stroke-width",1)
			.attr("width",ref.cellSize)
		   .attr("height",ref.cellSize/2);
//Append a clear cell with a black border to show which cell is selected and dragged
this.widget.select("#hintPath").append("rect")
                               .attr("x",x)
							   .attr("y",y)
							   .attr("width",ref.cellSize)
							   .attr("height",ref.cellSize)
							   .attr("stroke-width",2)
							   .attr("fill","none")
							   .attr("stroke","#000");
		   
}
//Clears a hint path for the selected day tile
//id: The ID of the dragged tile
Heatmap.prototype.clearHintPath = function(id){  
   this.widget.select("#hintPath").selectAll("rect").remove();
	this.widget.select("#hintPath").selectAll("text").remove();	   
}




