 function Piechart(width,height,x,y,id,l){
   //Widget initializaton variables
   this.width = width;
   this.height = height;
   this.xPos = x;
   this.yPos = y;
   this.cx = x/3; //Center of the piechart
   this.cy = y/3;
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
   this.currentView = 1; //Starting view of the piechart (first year)   
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
	
	 //Here, each "d" node represents a view
	this.widget.selectAll("path")
                 .data(this.displayData.map(function (d,i) {                     					  
                      //An array of all start and end angles for each view
					  //Format: allAngles[] = {start, end} angles in rads
                      var allValues = [];					
					  for (var j=0;j< ref.numViews;j++){					      
					      allValues[j] = [];
						  allValues[j][0] = ref.startAngle[j];
						  ref.endAngle[j] += d.values[j] * 2 * Math.PI;							  
						  allValues[j][1] = ref.endAngle[j];
						  ref.startAngle[j] += d.values[j] * 2 * Math.PI;				  
					  }	                    					  
                      //An array of previous values (angles) for drawing the segments					  
	                  return {nodes:allValues,/**cluster:d.clusterLabel,*/id:i,startAngle:0,endAngle:0,outerRadius:ref.radius};
	              }))
				 .enter()
                 .append("g")				
                 .attr("class","gDisplayArcs");
                				 
this.widget.selectAll(".gDisplayArcs").append("path")
				 .attr("fill","steelblue")
				 .style("stroke","white")
				 .style("stroke-width",2)
				 .attr("class","displayArcs")
				 .attr("transform", "translate(" + this.cx + "," + this.cy + ")")	 
				 .attr("id", function (d) {return "displayArcs"+d.id;})	                			 
				 .attr("class","DisplayArcs")
				 .attr("d", function (d) {return arcs(d.nodes[ref.currentView]);})
				 .attr("title", function (d){ return d.cluster;})
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
//Trying to find the center point of the piegraph
//this.widget.selectAll(".gDisplayArcs").append("circle").attr("cx",-this.xPos).attr("cy",-this.yPos).attr("r",10);

 
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
                    /** var centroid = draggedArc.centroid(d);
					 var centroidX = centroid[0];
					 var centroidY= centroid[1];				
				     var hypot = Math.sqrt(x*x + y*y);
					 var x = (centroidX/hypot);
					var y = (centroidY/hypot);*/	                 		
					var adj = mouseX - ref.cx;
					var opp = ref.cy - mouseY;	                   	
                     var angle = Math.atan(opp/adj);				
                     d.endAngle = d.startAngle + (Math.PI/2 - angle);	
                     //console.log(angle*(180/Math.PI));								 
 					// console.log("Start: "+d.nodes[ref.currentView][0]+"End: "+d.nodes[ref.currentView][1]+" Computed: "+d.endAngle);                    			 
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
Piechart.prototype.showHintPath = function (id){    
        var ref = this; 
		var hintArcs = d3.svg.arc()
	                   .outerRadius(ref.radius+5)
					   .innerRadius(0) //Need to set this for arc.centroid function to work..
					   .startAngle(function (d) { 
                            //TODO: hints not always drawn from start angle (pie layout changes everytime different data is displayed..)						
							return startingAngle;
					   })
					   .endAngle(function (d) { 					       											
							return Math.abs(d[1]-d[0]) + startingAngle;			
		               });
		var startingAngle=0;
        //Render the hint pie segments						   
        this.widget.select("#gInner"+id).selectAll("path").data(function (d) {
		                                              startingAngle = d.nodes[ref.currentView][0];
		                                               return d.nodes;
											}).enter().append("path")
                                             .attr("d", function (d) {                                                     											 
											       return hintArcs(d);
											 })											 										                                       												
											.style("fill","none")
											.style("stroke",this.hintColour)
											.style("stroke-width",3)
											.attr("class","hintArcs")
											 .attr("transform", "translate(" + this.cx + "," + this.cy + ")")	 
											;
											
	//Render the hint labels
	  this.widget.select("#gInner"+id).selectAll("text").data(function (d){return d.nodes;}).enter()	                                     						  
								            .append("svg:text")
                                            .text(function(d,i) { return ref.labels[i]; })									  
                                              .attr("transform", function (d){
											        /**var center = hintArcs.centroid(d);
													var x = center[0];
													var y = center[1];
													var hypot = Math.sqrt(x*x + y*y);
													var transX = (x/hypot)*(ref.labelOffset);
													var transY = (y/hypot)*(ref.labelOffset);													
													return "translate("+transX+","+transY+")"; */                                                   													
													var x = ref.cx + ref.radius*Math.cos(d[1]);
                                                    var y = ref.cy+ ref.radius*Math.sin(d[1]);
													return "translate("+x+","+y+")";
												})	
                                               /**	.attr("text-anchor", function (d){
												    var angleSum = (d[0] + d[1])/2;
													if (angleSum > Math.PI)
													    return "end";
													return "start";
												})	*/												
											   .attr("fill", this.hintColour)
											   .attr("class","hintLabels");		
        
		this.widget.selectAll(".DisplayArcs").style("fill", function (d) {
		    if (d.id != id)
			   return "none";
		});
											   
}
//Clears hint info
 Piechart.prototype.clearHintPath = function (id){
        var ref = this;
        this.widget.select("#gInner"+id).selectAll("text").remove();  
        this.widget.select("#gInner"+id).selectAll("path").remove();	
       this.widget.selectAll(".DisplayArcs").style("fill", "steelblue");								  
        								  
 }

