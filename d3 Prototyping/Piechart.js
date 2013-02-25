 function Piechart(width,height,x,y,id,l){
   //Widget initializaton variables
   this.width = width;
   this.height = height;
   this.xPos = x;
   this.yPos = y;
   this.id = id;
   this.radius = 120;
   this.labelOffset = 140;
   this.widget = null; //Reference to svg container
   //Display variables
   this.displayData = null;    
   this.hintColour = "#aec7e8";
   this.fadeColour = "#c7c7c7";
   this.barColour = "steelblue";
   //View index tracker variables
   this.currentView = 0; //Starting view of the piechart (first year)   
   this.previousAngleStart = 0; //An accumulation of all previous angles when the piechart is drawn   
   this.previousAngleEnd = 0;  
   this.startAngle = [];
   this.endAngle = [];
   //View information variables
   this.labels = l;
   this.numArcs = -1; //Total number of arcs in the piechart
   this.numViews = l.length;
   this.draggedBar = -1;   
   //Event functions, all declared in main.js  
   this.placeholder = function() { 
		//console.log("Not implemented"); 
   }; 
   this.mouseoverFunction = this.placeholder;
   this.mouseoutFunction  = this.placeholder;  
   this.dragEvent = null;   
 }
 Piechart.prototype.init = function(){
    // Initialize the main container
   this.widget = d3.select(this.id).append("svg")      
      .attr("width", this.width)
      .attr("height", this.height)
      .style("position", "absolute")
      .style("left", this.xPos + "px")
      .style("top", this.yPos + "px")  
     .append("g")
     .attr("transform", "translate(" + this.xPos/3 + "," + this.yPos/3 + ")")
   ;     
 }
 Piechart.prototype.render = function(data){
      var ref = this;
	  this.displayData = data;
	  this.numArcs = data.length;
	  //Initialize all angle tracker variables to 0, assuming the order of the piechart segments never changes (e.g., no sorting of angle values)
	  //TODO: might move this to init
	  for (var j=0;j<this.numViews;j++){
	      this.startAngle[j] = 0;
		  this.endAngle[j] = 0;
	  }
	  //Functions for drawing the pie segments (svg arcs)
      var arcs = d3.svg.arc()
	                   .outerRadius(ref.radius)
					   .startAngle(function (d) {                          
							return d[0];
					   })
					   .endAngle(function (d) { 				        													
							return d[1]; 
					   });
	var hintArcs = d3.svg.arc()
	                   .outerRadius(ref.radius)
					   .innerRadius(0) //Need to set this for arc.centroid function to work..
					   .startAngle(function (d) {                           				   
							return d[0];
					   })
					   .endAngle(function (d) { 					       											
							return d[0] + (d[1] / 100) * 2 * Math.PI;			
					   });
	 //Here, each "d" node represents a view
	this.widget.selectAll("path")
                 .data(this.displayData.map(function (d,i) { 
                      //An array of all start and end angles for each view
					  //Format: allAngles[] = {start, end} angles in rads
                      var allValues = [];					
					  for (var j=0;j< ref.numViews;j++){					      
					      allValues[j] = [];
						  allValues[j][0] = ref.startAngle[j];
						  ref.endAngle[j] += (d.value[j] / 100) * 2 * Math.PI;							  
						  allValues[j][1] = ref.endAngle[j];
						  ref.startAngle[j] += (d.value[j] / 100) * 2 * Math.PI;				  
					  }					 
                      //An array of previous values (angles) for drawing the segments					  
	                  return {nodes:allValues,id:i,startAngle:0,endAngle:0,outerRadius:ref.radius};
	              }))
				 .enter()
                 .append("g")
                 .attr("class","gDisplayArcs");
                				 
this.widget.selectAll(".gDisplayArcs").append("path")
				 .attr("fill","steelblue")
				 .style("stroke","white")
				 .style("stroke-width",2)
				 .attr("class","displayArcs")
				 .attr("id", function (d) {return "displayArcs"+d.id;})				
				 .attr("class","DisplayArcs")
				 .attr("d", function (d) {return arcs(d.nodes[ref.currentView]);})
				 .on("mouseover",function (d) { 
				   //console.log(d.nodes);
				 })				
				.on("click",function (d,i){                                    
				    /** ref.widget.selectAll(".DisplayArcs").transition().duration(1000)
					 .attr("d", enlargearcs);	*/
					 /**ref.widget.selectAll("path").attr("d", function(d){ 
							return arcs(d.nodes[0]); 
					  });*/
				 });
this.widget.selectAll(".gDisplayArcs").append("g")                                  
								  .attr("id",function (d){return "gInner"+d.id;})
                                  .attr("class","gInner");

//Render the hint pie segments						   
this.widget.selectAll(".gInner").selectAll("path").data(function (d) {return d.nodes;}).enter().append("path")
                                             .attr("d", function (d) { 											       
											       return hintArcs(d);
											 })											 										                                       												
											.style("fill","none")
											.style("stroke",this.hintColour)
											.attr("class","hintArcs");
											
//Render the hint labels
  this.widget.selectAll(".gInner").selectAll("text").data(function (d){return d.nodes;}).enter()	                                     						  
								            .append("svg:text")
                                            .text(function(d,i) { return ref.labels[i]; })									  
                                               .attr("transform", function (d){
											        var center = hintArcs.centroid(d);
													var x = center[0];
													var y = center[1];
													var hypot = Math.sqrt(x*x + y*y);
													var transX = (x/hypot)*(ref.labelOffset);
													var transY = (y/hypot)*(ref.labelOffset);													
													return "translate("+transX+","+transY+")";
												})	
                                               	.attr("text-anchor", function (d){
												    var angleSum = (d[0] + d[1])/2;
													if (angleSum > Math.PI)
													    return "end";
													return "start";
												})											
											   .attr("fill", ref.hintColour)
											   .attr("class","hintLabels"); 
 }

 //Updates the angle of a dragged pie segment
Piechart.prototype.updateDraggedSegment = function (id,mouseX, mouseY){
     var ref = this;	
	 //Function for re-drawing a dragged arc
	 var draggedArc = d3.svg.arc()
	                   .outerRadius(ref.radius)
					   .innerRadius(0) 
					   .startAngle(function (d) {                          					   
							return d.startAngle;
					   })
					   .endAngle(function (d) {                            					   
							return d.endAngle;								
					   });
     this.widget.select("#displayArcs"+id)
	            .attr("d", function (d) {    
                     d.startAngle = d.nodes[ref.currentView][0];				
                     var centroid = draggedArc.centroid(d);
					 var x = centroid[0]/ref.radius;
					 var y = centroid[1]/ref.radius;
                     var opp = Math.abs(mouseX - x);
					 var adj = Math.abs (mouseY - y);
                     //Get the angle
                     var angle = Math.atan(opp/adj);
                     d.endAngle = angle + d.startAngle;					 
 					 console.log(angle);                    			 
				     return draggedArc(d);
				});
	            
}

 Piechart.prototype.redrawView = function (view){      
       var displayView = this.currentView;
       if (view!=-1){
	     displayView = view;
	    }	   
       this.widget.selectAll(".displayBars")
		          //.transition().duration(400)
		          .attr("height", function (d){				          
		                  return d.nodes[displayView][2];
		           })
				   .attr("y", function (d){
				         return d.nodes[displayView][1];
				   });	
}
//Updates the tracker variables according to the new view
//Then calls the redraw function to update the display
Piechart.prototype.changeView = function (newView){    
     this.currentView = newView;  
     this.redrawView(-1); 
}
//Snaps to the nearest view (in terms of mouse location distance and the bar being dragged)
Piechart.prototype.snapToView = function (id, mouseY,h){
       var ref = this;    
	   var current =  ref.yPos - h[ref.currentViewIndex][0];
	   var next = ref.yPos - h[ref.nextViewIndex][0];	
	   var currentDist = Math.abs(current - mouseY);
	   var nextDist = Math.abs(next - mouseY);
	   if (currentDist > nextDist && ref.nextViewIndex != ref.totalHeights){ //Passed next, advance the variables forward
			//Make sure the nextViewIndex wasn't the last one to avoid index out of bounds
			ref.currentViewIndex = ref.nextViewIndex;
			ref.nextViewIndex++;			
            ref.currentView = h[ref.currentViewIndex][1];   					                    				
		}
      if (ref.nextViewIndex == ref.totalHeights){
	      ref.redrawView(ref.currentView+1);		
       }else{
	      ref.redrawView(-1);		
       }	   
      		
}
//Resolves the view variable indices, called when a new bar is dragged
//This function is needed because currentView and currentViewIndex do not match
// Need to pass the id of the bar being dragged and the sorted array of heights
Piechart.prototype.resolveViews = function (id,h){
       var ref = this;       
	   var newIndex = -1;
	   //Search for the index corresponding to 'currentView'
		for (var j=0; j<= ref.totalHeights;j++){
		   if (h[j][1] == ref.currentView){
			   newIndex = j;
			   break;
		  }
	  }
	   //Next, update the view index variables for this bar
	   if (newIndex == ref.totalHeights){ //At the last (highest) bar height
			ref.nextViewIndex = newIndex;
			ref.currentViewIndex = newIndex-1;
		}else { //At the lowest bar or greater					 
		     ref.currentViewIndex = newIndex;
			 ref.nextViewIndex = newIndex + 1;					
		}		  
			    
}
//Displays hint info
Piechart.prototype.showHintPath = function (id,d){    
        var ref = this;      
        /**this.widget.select("#gInner"+id).selectAll(".hintBars")                                  
								  .style("fill", this.hintColour);	
		/**this.widget.selectAll(".displayBars")
		                                   .transition().duration(400)
		                                   .style("fill", function (d){
		                                           if (id != d.id)
												      return ref.fadeColour;
		                                    });		*/
	//Render the hint bars							   
	 this.widget.select("#gInner"+id).selectAll("rect").data(d).enter()
											 .append("svg:rect")
											 .attr("x", function (d) {return d[0];})
											 .attr("y", function (d) {return d[1];})
											 .attr("width", ref.barWidth)
											.attr("height", function(d) { return 3; })											                                       												
											.style("fill",ref.hintColour);
											
	//Render the hint labels
   this.widget.select("#gInner"+id).selectAll("text").data(d).enter()	                                     						  
								            .append("svg:text")
                                            .text(function(d,i) { return ref.labels[i]; })
												.attr("x", function (d,i){return (d[0]+(ref.barWidth*1.5));})
												.attr("y", function (d) {return d[1];})												
											   .attr("fill", ref.hintColour); 
											   
}
//Clears hint info
 Piechart.prototype.clearHintPath = function (id){
        var ref = this;
        this.widget.select("#gInner"+id).selectAll("text").remove();  
        this.widget.select("#gInner"+id).selectAll("rect").remove();    		
								  
		/**this.widget.selectAll(".displayBars")
		                                   .transition().duration(400)
		                                   .style("fill", function (d){
		                                           return ref.barColour;
		                                    });*/
        								  
 }

