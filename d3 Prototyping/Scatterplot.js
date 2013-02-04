////////////////////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////////////////////
function Scatterplot(x, y, w, h, id) {

   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.width = w;
   this.height = h;
   this.id = id; 

   // Reference to the main widget
   this.widget = null;  
 
   this.currentView = -1;
   this.nextView = -1;
   //The number of different instances across dimension (e.g., 4 different views for each year)
   this.numViews = -1;
   
   this.direction = 1; //Forward along the data dimension (e.g., time)
   // Data used for display
   this.displayData = [];
   this.dataLength = 0;
   
   this.clickedPoint = -1;
   this.hoveredPoint = -1;
   this.dragEvent = null;
   
  
   this.placeholder = function() { 
		console.log("Not implemented"); 
   }; 
   this.mouseoverFunction = this.placeholder;
   this.mouseoutFunction  = this.placeholder;  
   this.clickFunction = this.placeholder;
}

////////////////////////////////////////////////////////////////////////////////
// Prototype functions
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Initializes a container group 
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.init = function() {
   
   var myRef = this;
  
   // Initialize the main container
   this.widget = d3.select(this.id).append("svg")      
      .attr("width", this.width)
      .attr("height", this.height)
      .style("position", "absolute")
      .style("left", this.xpos + "px")
      .style("top", this.ypos + "px")  
     
   ; 
}
////////////////////////////////////////////////////////////////////////////////
// Render
// start = year or instance the view represents
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.render = function( vdata, start) {
    
   this.displayData = vdata;   
   this.currentView = start;
   if (this.currentView ==0){//First point on path			        
			this.nextView = this.currentView+1;
	}else if (this.currentView == 2){  //Last point of path				
		   this.nextView = this.currentView;
		   this.currentView = this.currentView -1;
	}else { //A point somewhere in the middle				     
		this.nextView = this.currentView + 1;
	}
   var myRef = this; 
   //Remove everything in the svg
	this.widget.selectAll("g").remove(); 
   // Draw the data points
   this.widget.selectAll("circle")
     .data(this.displayData.map(function (d,i) {
            //TODO: need point with the largest and smallest x of the nodes, to define path bounds	 
			//var sX = [50,10];
			//var lX = [300,95];
			//var sX = [100,33];
			//var lX = [400,10];
	        return {nodes:d,id:i,x:d[myRef.currentView][0], y:d[myRef.currentView][1]/*,smallestX:sX,largestX:lX*/};
	  }))	
      .enter()
      .append("g")
	  .attr("id",function (d) {return "g"+d.id;});
   
   this.widget.selectAll("g").append("svg:circle")
      .attr("cx", function(d) {	     
        return d.x;
       })
     .attr("cy", function(d) {
        return d.y;
      })
	  .attr("r", function(d) {
         return 10;		 
      })
	  .attr("stroke", "none")
	  .attr("stroke-width", "0")
	  .attr("class", "displayPoints")
	   .attr("id", function (d){return "displayPoints"+d.id;})
	  .style("cursor", "pointer")  
       .on("mouseover", myRef.mouseoverFunction)
       .on("mouseout", myRef.mouseoutFunction)	
       .on("click", myRef.clickFunction)		   
   ;  
   
 //Drawing paths between points
 var line = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .interpolate("linear"); //Interpolate curve should pass through all points, however concaved interpolations falsify the data

    this.widget.selectAll("g").append("g")                                  
								  .attr("id",function (d){return "gInner"+d.id;})
                                   .attr("class","gInner")										  
								   ;
	this.widget.selectAll("g").selectAll(".gInner").selectAll("circle")
                                             .data(function(d) {return d.nodes;})
											 .enter().append("svg:circle")
											 .attr("cx", function(d) { return d[0]; })
											.attr("cy", function(d) { return d[1]; })
											.attr("r",4)
											.attr("class","hintPoints")
											.style("fill","none");
											    
    this.widget.selectAll("g").selectAll(".gInner").append("svg:path")
                                  .attr("d", function(d){ 
								         return line(d.nodes); 
								  })
								  .attr("id",function (d){return "p"+d.id;})
								  .style("stroke-width", 2)
								  .style("stroke", "none")
								   .style("fill", "none");
  
}


//Updates the display when a point is being dragged - for mousemove event
/**Scatterplot.prototype.updateDrag = function(clickedPoint) {	 
       var ref = this;
	   var mouseX = d3.event.pageX;
	  this.widget.select("#displayPoints"+clickedPoint)     
        .attr("cx", function(d){		      
			    //Check to make sure mouse is within the defined path of the node
                if (mouseX < d.x){
			        return d.x;
				  }else if (mouseX > d.nodes[d.nodes.length-1][0]){
					 return d.nodes[d.nodes.length-1][0];
				  }	              			  
               return mouseX;			
		})
        .attr("cy", function(d){		   
		     //Check to make sure mouse is within the defined path of the node
              if (mouseX < d.x){
			     return d.y;
              }else if (mouseX > d.nodes[d.nodes.length-1][0]){
			     return d.nodes[d.nodes.length-1][1];
			  }				  
			  var x0 = d.nodes[ref.currentView][0];
			  var y0 = d.nodes[ref.currentView][1];			  
			  var x1 = d.nodes[ref.currentView+1][0];
			  var y1 = d.nodes[ref.currentView+1][1]; 
              		  
			  var interpY = ref.findInterpY(mouseX,x0,y0,x1,y1);
              //Check for a view transition
              if (mouseX <= x0 || mouseX >=x1){
                  ref.currentView = ref.currentView + 1;
				  ref.updateView(clickedPoint,ref.currentView);
              }				  
              return interpY;   
		})
		.attr("stroke","none")
		.attr("stroke-width",0);
  
}
//Update the rest of the view - for mousemove event
Scatterplot.prototype.updateView = function(id,newView){    
	  this.widget.selectAll(".displayPoints")     
        .attr("cx", function(d){		      	
			return d.nodes[newView][0];
		})
        .attr("cy", function(d){		   
		  return d.nodes[newView][1];
		});  	 
}
*/
//Updates the dragged point - for drag mouse event
Scatterplot.prototype.updateDraggedPoint = function(id,mouseX) {	 
       var ref = this;
	   
	  this.widget.select("#displayPoints"+id)     
        .attr("cx", function(d){		
                 //Get the two points which compose the current sub-path dragged along		
		        var pt1 = d.nodes[ref.currentView][0];
                var pt2 = d.nodes[ref.nextView][0];		
                var bounds = ref.checkBounds(pt1,pt2,mouseX);				
                if (ref.currentView ==0 && bounds == pt1){//First point on path, out of bounds				
					   return pt1;									
				  }else if (ref.nextView == (d.nodes.length-1) && bounds == pt2){  //Last point of path, out of bounds									  
					  return pt2;				
				  }	else { //A point somewhere in the middle
				     if (bounds == pt1){ //Passed current					    
					    return pt1;
					 }else if (bounds == pt2){ //Passed next			    
					    return pt2;
					 }
				 }
                  return mouseX;             		
		})
        .attr("cy", function(d){	
             //Get the two points which compose the current sub-path dragged along		
		        var pt1 = d.nodes[ref.currentView][0];
                var pt2 = d.nodes[ref.nextView][0];	
                var pt1_y = d.nodes[ref.currentView][1];
                var pt2_y = d.nodes[ref.nextView][1];					
                var bounds = ref.checkBounds(pt1,pt2,mouseX);		
		     //Check to make sure mouse is in bounds
                if (ref.currentView ==0){//First point on path			       
					if (bounds == pt1){  //Out of Bounds
					   return pt1_y;
					}else if (bounds == pt2){  //Beyond nextView
					  ref.currentView = ref.nextView;
					  ref.nextView = ref.currentView +1;
					  return ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					}else{ //Within current sub-path
					   return ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					}					
				  }else if (ref.nextView == (d.nodes.length-1)){  //Last point of path
					if (bounds == pt1){  //Beyond 					    
					    ref.nextView = ref.currentView;
						ref.currentView = ref.currentView - 1;
					    return ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					}else if (bounds == pt2){  //Out of Bounds					  
					  return pt2_y;
					}else{ //Within current sub-path
					   return ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					}
				  }	else { //A point somewhere in the middle
				     if (bounds == pt1){ //Passed current					    
					    ref.nextView = ref.currentView;
						ref.currentView = ref.currentView-1;
					    return pt1_y;
					 }else if (bounds == pt2){ //Passed next
					    ref.currentView = ref.nextView;
					    ref.nextView = ref.nextView +1;
					    return pt2_y;
					 }else{
					    return ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					 }
				 }		  
		})
		.attr("stroke","none")
		.attr("stroke-width",0);
  
}
////////////////////////////////////////////////////////////////////////////////
// Snap the draggable point to the nearest view
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.snapToView = function( mouseX, mouseY) {
     var ref = this;
    this.widget.selectAll(".displayPoints")
	           .attr("cx",function (d){	
			        var distanceCurrent = ref.calculateDistance(mouseX,mouseY, d.nodes[ref.currentView][0], d.nodes[ref.currentView][1]);
					var distanceNext = 	ref.calculateDistance(mouseX,mouseY, d.nodes[ref.nextView][0], d.nodes[ref.nextView][1]);	
                    if (distanceCurrent > distanceNext){ //Snap to next view					    
					    return d.nodes[ref.nextView][0];
                     }else { //Snap to current View					    
					    return d.nodes[ref.currentView][0];
                    }					 
	             })
				 .attr("cy",function (d){	
			        var distanceCurrent = ref.calculateDistance(mouseX,mouseY, d.nodes[ref.currentView][0], d.nodes[ref.currentView][1]);
					var distanceNext = 	ref.calculateDistance(mouseX,mouseY, d.nodes[ref.nextView][0], d.nodes[ref.nextView][1]);	
                    if (distanceCurrent > distanceNext){ //Snap to next view
					    ref.currentView = ref.nextView;
						ref.nextView = ref.nextView +1;
					    return d.nodes[ref.currentView][1];
                     }else { //Snap to current View					    
					    return d.nodes[ref.currentView][1];
                    }					 
	             });
	
  
}
//Finds the interpolated value of the unknown y-coordinate
Scatterplot.prototype.findInterpY = function(x,x0,y0,x1,y1){      
	var interpY = y0 + (y1 - y0)*((x - x0)/(x1 - x0));
	return interpY;
    
}
//Calculates the distance between two points
Scatterplot.prototype.calculateDistance = function(x1,y1,x2,y2){ 
    var term1 = x1 - x2;
    var term2 = y1 - y2;	
	var distance = Math.sqrt((term1*term1)+(term2*term2));
	return distance;    
}
//Checks if a mouse position is within bounds of a defined path
//Returns a point if the mouse position is equal to it or has crossed it
//Returns 'ok' if the mouse is within bounds
Scatterplot.prototype.checkBounds = function(x1,x2,mouseX){ 
    var start,end;
	if (x1>x2){
	 end = x1;
	 start = x2;
	}else{
	  start = x1;
	  end = x2;
	}
	//Check if mouse is between path defined by (start,end)
	if (mouseX <= start){
	   return start;
	}else if (mouseX >=end){
	   return end;
	}
	return "ok";	
}
Scatterplot.prototype.showHintPath = function (id){
        this.widget.select("#g"+id).select("#p"+id)                                  
								  .style("stroke", "steelblue");
        this.widget.select("#g"+id).select("#gInner"+id).selectAll(".hintPoints")                                  
								  .style("fill", "steelblue");								  
}

Scatterplot.prototype.clearHintPath = function (id) {
      this.widget.select("#g"+id).select("#p"+id)                                  
								  .style("stroke", "none");
	   this.widget.select("#g"+id).select("#gInner"+id).selectAll(".hintPoints")                                  
								  .style("fill", "none");	
}


