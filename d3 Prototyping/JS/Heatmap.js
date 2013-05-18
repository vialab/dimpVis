/** Constructor for a heatmap visualization
 * x: the left margin
 * y: the right margin
 * p: the padding among cells
 * cs: pixel size of the cells
 * id: id of the div tag to append the svg container
 * title: of the chart
 * hLabels: labels to appear along the hint paths
 */
function Heatmap(x, y, p, cs, id,title,hLabels) {
   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.id = id;   
   this.padding = p; //surrounding the heatmap
   this.cellSize = cs;
   this.labelColour = "#c7c7c7";
   this.chartTitle = title;
   this.svg = null;

   //Variables to track interaction events
   this.currentView = 0;
   this.nextView = 1;
   this.lastView = hLabels.length-1;
   this.viewChange = 1; //Decrement or increment the currentview
   this.previousMouseY=null; //To track the old mouse positions
   this.interpValue = 0; //Value to track the progress of colour interpolation when switching between views
   this.pixelTolerance = 2; //Number of pixels to move before an interpolation in colour occurs (slow down the colour switching)
   this.selected = -1; //Variable to track whether or not a day is selected

   //Display properties
   this.displayData=[];   
   this.labels = hLabels;
   this.numViews = hLabels.length;
   this.xSpacing = 30; //Spacing across x for hint path
   this.ySpacing = 20; //Spacing for the y of hint path
   this.hintData = []; //Save the hint data - TODO: change later

   //Declare some interaction event functions
   this.dragEvent = null;
    //TODO: need a domain for this scale?
   //Function for assigning colours to each cell
   this.generateColour = d3.scale.quantize()
    //.domain([1, 8155])
    //.range(["rgb(165,0,38)","rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)", "rgb(254,224,139)"]); //red
	//.range(["rgb(255, 255, 217)","rgb(237, 248, 177)","rgb(199, 233, 180)","rgb(127, 205, 187)","rgb(65, 182, 196)","rgb(29, 145, 192)","rgb(34, 94, 168)","rgb(12, 44, 132)"]); //blue long
	.range(["rgb(254,224,139)","rgb(253,174,97)","rgb(244,109,67)","rgb(215,48,39)","rgb(165,0,38)"]);
	/**this.generateColour = d3.scale.log()  
	.range(["rgb(254,224,139)","rgb(253,174,97)","rgb(244,109,67)","rgb(215,48,39)","rgb(165,0,38)"]);*/
  //TODO:What is this for?
  this.generateHintY = d3.scale.quantize().range([1,2,3,4, 5]);
}
/** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
 *  will be drawn. Also, add a blur filter for the hint path effect.
 * */
Heatmap.prototype.init = function() {
   this.svg = d3.select(this.id)
      .append("svg")
      .attr("id","mainSvg")
      .append("g")
      .attr("transform", "translate(" + this.xpos + "," + this.ypos + ")");
   //TODO: these are almost identical, can't they be re-used?
   this.svg.append("svg:defs") //The main hint path
        .append("svg:filter")
        .attr("id", "blur")
        .append("svg:feGaussianBlur")
        .attr("stdDeviation", 2);
   this.svg.append("svg:defs") //A white background behind the main hint path
        .append("svg:filter")
        .attr("id", "blur2")
        .append("svg:feGaussianBlur")
        .attr("stdDeviation", 3);
}
/** Render the visualization onto the svg
 * data: The dataset to be visualized
 * xLabels: an array of labels to appear on the x-axis
 * yLabels: an array of labels to appear on the y-axis
 *
 * Data MUST be provided in the following array format:
 * data = [{"row","column",[colour values for all views]}...number of cells]
 * */
Heatmap.prototype.render = function(data,xLabels,yLabels) {
    var ref = this;
    this.displayData = data;

    //Set the width and height of the svg, now that the dimensions are known
    d3.select("#mainSvg").attr("width", xLabels.length*this.cellSize+this.padding*2*xLabels.length+100)
        .attr("height", yLabels.length*this.cellSize+this.padding*2*yLabels.length+100);

    //Find the max and min score in the dataset (used for the colour scale)
    var maxScore = d3.max(data.map(function (d){return d3.max(d.values); }));
    var minScore = d3.min(data.map(function (d){return d3.min(d.values); }));
    var generateColour = d3.scale.quantize().domain([minScore,maxScore])
        .range(["rgb(254,224,139)","rgb(253,174,97)","rgb(244,109,67)","rgb(215,48,39)","rgb(165,0,38)"]);

    //Draw the cells for each entry in the heatmap
    this.svg.selectAll(".cell")
        .data(ref.displayData.map(function (d,i) {
                //Convert scores into colours
                var allValues = [];
                for(var j=0;j< d.values.length;j++){
                    allValues[j] = [generateColour(d.values[j]),d.values[j]];
                }
                var xCoord = d.row*ref.cellSize+ref.padding;
                var yCoord = d.column*ref.cellSize+ref.padding;
                return {id:i,values:allValues,x:xCoord,y:yCoord,colours:[],pathData:[]};
             })) .enter().append("rect").attr("class", "cell")
            .attr("width", this.cellSize).attr("height", this.cellSize)
            .attr("id", function (d) {return "cell"+d.id;})
            .attr("x", function(d) {return d.x; })
            .attr("y", function(d) {return d.y; })
            .attr("fill", function(d) {return d.values[ref.currentView][0]; })
            .style("cursor", "pointer");

    //Add the g element to contain the hint path for the dragged tile
    this.svg.append("g").attr("id","hintPath");
    //Draw the axes labels and title
    this.addAxisLabels(xLabels,yLabels);
}
/**Draws the labels along the x and y axis, and the title
 * */
Heatmap.prototype.addAxisLabels = function (xLabels,yLabels){
    var ref = this;
    this.svg.append("text").attr("id","chartTitle")
        .attr("x",1).attr("y",1).attr("fill",this.labelColour)
        .text(this.chartTitle);

    this.svg.selectAll(".axisVertical text").data(yLabels)
            .enter().append("svg:text")
            .text(function(d) { return d; })
            .attr("x",this.cellSize*6+this.padding)
            .attr("y",function (d,i){
                return ref.cellSize*i+ref.padding+ref.cellSize/2;
            })
            .attr("fill",this.labelColour)
            .attr("class","axisVertical");

    this.svg.selectAll(".axisHorizontal").data(xLabels)
            .enter().append("svg:text")
            .text(function(d) { return d; })
            .attr("transform",function (d,i) {
                return "translate("+(ref.cellSize*i+ref.padding+ref.cellSize/2)+
                    ","+(ref.cellSize*6+ref.padding)+") rotate(-65)";
            })
            .attr("fill",this.labelColour)
            .attr("class","axisHorizontal")
            .style("text-anchor", "end");
}
 //Updates the colour of the dragged cell by interpolation
Heatmap.prototype.updateDraggedCell = function(id, mouseY){
  var ref = this;
  var yDiff = Math.abs(mouseY - ref.previousMouseY); 
  /**if (yDiff>=ref.pixelTolerance && yDiff>0 && ref.interpValue < 0.9){
     ref.interpValue += 0.1;	 
  }else if (ref.interpValue>=0.9){
     ref.interpValue = 1;
  }*/
  if (yDiff<=ref.pixelTolerance && yDiff>0 && ref.interpValue <= 0.9){
     ref.interpValue += 0.1;	 
  }else {
     ref.interpValue = 1;
  }
  var direction = ref.previousMouseY - mouseY;

  this.svg.select("#cell"+id).each(function (d){
       //Get the y coordinate of the cell and calculate the middle of it      	   
	  var middleY = d.y+ref.cellSize/2;	 	   
	  if (direction>0 && ref.currentView !=0){ //Make sure not at first view 
	         ref.viewChange = -1;			
             if (ref.interpValue < 1){ //Not yet reached the next view
			      ref.interpolateColours(-1);
             }else{			 
				 ref.currentView--;
                 ref.interpValue = 0;				 
				 ref.updateView();	
             }			 
         	        		 
	  }else if (ref.currentView < ref.allData.length){	 //Make sure not at last view 
             ref.viewChange = 1;	  
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
   
}
//Updates the colour of the rest of the cells based on the dragged cell
//Updates the hint path of the dragged cell
Heatmap.prototype.updateView = function(){
  var lineGeneratorUpdate = d3.svg.line()
					.x(function(d,i) { return ref.findHintX(i,ref.currentView); })
					.y(function(d) { return d[2]; })
					.interpolate("linear");  
  var ref = this;
  //Re-colour all other cells
  this.svg.selectAll(".cell")
 // .transition().duration(400)
  .attr("fill", function (d){      
      return d.colours[ref.currentView];  
  });
  //Re-position the hint path indicator to show current view
  /**this.svg.select("#hintIndicator")
             .attr("y",(ref.currentView*ref.cellSize/2));*/
  this.svg.select("#hintPath").selectAll("text").attr("x",function (d,i) {return ref.findHintX(i,ref.currentView);});
  //Render the hint path line									    
    this.svg.select("#hintPath").selectAll("path").attr("d", function(d){
								         return lineGeneratorUpdate(ref.hintData); 
								  });

}
//Updates the colour of the rest of the cells interpolating between views
//view: -1 if the view is transitioning backwards
//           1 if the view is transitioning forwards
Heatmap.prototype.interpolateColours = function(view){
  var ref = this; 
  var nextView = view + ref.currentView;
  //Re-colour all other cells
  this.svg.selectAll(".cell")
  //.transition().duration(400)
  .attr("fill", function (d){    
      var interpolator = d3.interpolate(d.colours[ref.currentView],d.colours[nextView]);  
      return interpolator(ref.interpValue);  
  }); 
    var travelAmount = Math.abs(nextView*ref.cellSize/2 - ref.currentView*ref.cellSize/2)*ref.interpValue;
   //Re-position the hint path indicator to show transition to next view
  /** this.svg.select("#hintIndicator")
             .attr("y",ref.currentView*ref.cellSize/2+travelAmount);*/
/**this.svg.select("#hintPath").selectAll("text").attr("x",function (d,i) {
	         var currentX = ref.findHintX(i,ref.currentView);
			 var nextX = ref.findHintX(i,nextView);
			 var addedDistance = Math.abs(nextX - currentX)*travelAmount;
	        return currentX-addedDistance;
			});
 var animateLineGenerator = d3.svg.line()
								.x(function(d,i) { 
									  var currentX = ref.findHintX(i,ref.currentView);
									  var nextX = ref.findHintX(i,nextView);
									  var addedDistance = Math.abs(nextX - currentX)*travelAmount;								
									return currentX - addedDistance;											       
								  })
								.y(function(d) { return d[2]; })
								.interpolate("linear"); 
     //Render the hint path line									    
    this.svg.select("#hintPath").selectAll("path").attr("d", function(d){
								         return animateLineGenerator(ref.hintData); 
								  });*/
  
			 
}
//Snaps to a view based on the direction of the mouse and the interpolation value (which colour is closer)
Heatmap.prototype.snapToView = function(){
  var ref = this;
  if (ref.interpValue > 0.5){ //Only update the view if the interpolation is over 50% to the next colour
      ref.currentView = ref.currentView+ref.viewChange;
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
Heatmap.prototype.showHintPath = function(id,pathData,x,y){
    /**var allColours = [];
     var hintPathData = [];
     var yValue = 0;
     var totalDistance = 570; //start index at zero..
     for (var j=0;j<ref.allData.length;j++){
     ref.generateColour.domain(colours[j]);
     ref.generateHintY.domain(colours[j]);
     if (j==1){ //TODO:Remove this hack, problem was that when you only had one whole number in the domain and the rest zeros, the quantize function returns undefined for all zeros
     var colValue = ref.allData[j][i].colourValue;
     if (colValue ==0){
     allColours[j] = "rgb(254,224,139)";
     yValue = 1;
     }else{
     allColours[j] = "rgb(165,0,38)";
     yValue = 5;
     }
     }else{
     allColours[j] = ref.generateColour(ref.allData[j][i].colourValue);
     yValue = ref.generateHintY(ref.allData[j][i].colourValue);
     }


     hintPathData[j] = [allColours[j],(j*ref.xSpacing),(yValue*ref.ySpacing),(j*ref.xSpacing)/totalDistance];
     }*/
    //console.log(allColours);
   var ref = this; 
  ref.xHint = x;
  this.hintData = pathData;
 var lineGenerator = d3.svg.line()
					.x(function(d) { return d[1]; })
					.y(function(d) { return d[2]; })
					.interpolate("linear");   
					
   this.svg.append("linearGradient")
        .attr("id", "line-gradient")            
        .attr("gradientUnits", "userSpaceOnUse")    
        .attr("x1", 0).attr("y1", 0)         
        .attr("x2", 0).attr("y2", 100)      
    .selectAll("stop")                      
        .data(pathData)                  
    .enter().append("stop")         
        .attr("offset", function(d) { return d[3]; })   
        .attr("stop-color", function(d) { return d[0]; }); 
//Render the underlayer of the hint path
this.svg.select("#hintPath").append("svg:path")
								  .attr("d", function(d){                                         							  
								         return lineGenerator(pathData); 
								  })								 
								  .style("stroke-width", 10)
								  .style("stroke", "white")
								  .style("fill","none")	
								  .attr("transform", "translate(" + x + "," + y + ")")
								  .attr("filter", "url(#blur2)");	
//Render the hint path line									    
    this.svg.select("#hintPath").append("svg:path")
                                  .attr("d", function(d){                                         							  
								         return lineGenerator(pathData); 
								  })								 
								  .style("stroke-width", 4)
								  .style("stroke", "url(#line-gradient)")
								  .style("fill","none")	
								  .attr("transform", "translate(" + x + "," + y +")")
								  .attr("filter", "url(#blur)");
	
//Draw the hint path labels								  
this.svg.select("#hintPath").selectAll("text")
            .data(pathData).enter()	   
		   .append("text")
		   .attr("x",function(d){return d[1];})		  
		   .attr("y",function (d){return d[2]-5;})
		   .text(function (d,i){ return ref.labels[i];})
		   .style("text-anchor", "middle") 
		   .attr("transform", "translate(" + x + "," + y + ")");							    

//Append a clear cell with a black border to show which cell is selected and dragged
this.svg.select("#hintPath").append("rect")
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
   this.svg.select("#hintPath").selectAll("rect").remove();
   this.svg.select("#hintPath").selectAll("path").remove();
    this.svg.select("#line-gradient").remove();
	this.svg.select("#hintPath").selectAll("text").remove();
}
//Calculates the x-values for the moving hint path x-coordinates
Heatmap.prototype.findHintX = function (index,view){
    return this.padding+((index*this.xSpacing)-view*this.xSpacing);
}



