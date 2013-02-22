 function Piechart(width,height,x,y,id,l){
   //Widget initializaton variables
   this.width = width;
   this.height = height;
   this.xPos = x;
   this.yPos = y;
   this.id = id;
   this.radius = 120;
   this.widget = null; //Reference to svg container
   //Display variables
   this.displayData = null;    
   this.hintColour = "#aec7e8";
   this.fadeColour = "#c7c7c7";
   this.barColour = "steelblue";
   //View index tracker variables
   this.currentView = 0; //Starting view of the piechart (first year)   
   //View information variables
   this.labels = l;
   this.numArcs = -1; //Total number of arcs in the piechart
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
      var arcs = d3.svg.arc()
	                   .outerRadius(ref.radius);
      var layout = d3.layout.pie()
	                        .value(function (d) { return d.value;});
	  this.widget.selectAll("g")
	             .data(layout(this.displayData.map(function (d,i){
				     var segments = [];					 
				     return {id:i,value:d.value,label:d.label,nodes:segments};
				 })))
				 .enter()
				 .append("g")				 
				 .append("path")
				 .attr("fill","steelblue")
				 .style("stroke","white")
				 .style("stroke-width",2)
				 .attr("id",function (d,i){
				      return "displayArcs"+i;
				 })
				 .attr("d", arcs)
				 .on("mouseover",function (d,i){
				     ref.widget.select("#displayArcs"+i).transition().duration(1000)
                     .attrTween("d", tween({ value : 0 }));
				 });
				 
function tween(b) {
      return function(a) {
        var i = d3.interpolate(a, b);
        for (var key in b) a[key] = b[key]; // update data
        return function(t) {
              return arcs(i(t));
        };
      };
}
				 /**.append("text")
				 .attr("transform", function(d) {      
						//we have to make sure to set these before calling arc.centroid
						d.innerRadius = 0;
						d.outerRadius = ref.radius;
						return "translate(" + arc.centroid(d) + ")";       
                })
				.attr("text-anchor", "middle")                          //center the text on it's origin
                 .text(function(d, i) { return data[i].label; })*/  
				
	 
/**this.widget.selectAll("rect")
    .data(this.displayData.map(function (d,i) {
             //Create a list of heights (y) for each country
			 //Dataset goes from 1955 to 2005 (11 increments)
			 //Try population:
			 var heights = [];		
             var data = [];			 
			 
			 //TODO: Change this later because 'x' is being repeated
            //Reason for doing this is for the hint path of heights		
            //Array format is: data[viewIndex] = [x of top of bar, y of top of bar, height of bar]			
             data[0] = [i*ref.barWidth, ref.yPos - d.Pop1955/100000, d.Pop1955/100000];
			 data[1] = [i*ref.barWidth,ref.yPos - d.Pop1960/100000, d.Pop1960/100000];
			 data[2] = [i*ref.barWidth,ref.yPos - d.Pop1965/100000, d.Pop1965/100000];
			 data[3] = [i*ref.barWidth, ref.yPos - d.Pop1970/100000, d.Pop1970/100000];
			 data[4] = [i*ref.barWidth, ref.yPos - d.Pop1975/100000, d.Pop1975/100000];
			 data[5] = [i*ref.barWidth, ref.yPos - d.Pop1980/100000, d.Pop1980/100000];
			 data[6] = [i*ref.barWidth, ref.yPos - d.Pop1985/100000, d.Pop1985/100000];
			 data[7] = [i*ref.barWidth, ref.yPos - d.Pop1990/100000, d.Pop1990/100000];
			 data[8] = [i*ref.barWidth, ref.yPos - d.Pop1995/100000, d.Pop1995/100000];
			 data[9] = [i*ref.barWidth, ref.yPos - d.Pop2000/100000, d.Pop2000/100000];
			 data[10] = [i*ref.barWidth, ref.yPos - d.Pop2005/100000, d.Pop2005/100000];
            //Populate an array of only heights, so that they can be sorted in ascending order
			for (var j=0;j<data.length;j++){
			    heights[j] = [];
			    heights[j][0] = data[j][2];
				heights[j][1] = j;
			}
			var h = ref.sortHeights(heights);    
            ref.totalHeights = h.length -1;			
	        return {nodes:data,id:i,country:d.Country,heights:h};
	  }))
     .enter()
	 .append("g")
	 .attr("class","gDisplayBars")
	  .attr("id", function (d){return "gDisplayBars"+d.id;});

	
	//Render the bars 
this.widget.selectAll(".gDisplayBars")
     .append("rect")
     .attr("x", function(d){return d.nodes[ref.currentView][0];})
     .attr("y", function(d){ return d.nodes[ref.currentView][1];})
     .attr("width", ref.barWidth)
     .attr("height", function(d) { return d.nodes[ref.currentView][2]; })
	 .attr("fill", this.barColour)
	 .attr("stroke", "#FFF")
	 .attr("stroke-width",5)
	 .attr("class", "displayBars")
	 .attr("id", function (d){return "displayBars"+d.id;})
     .style("cursor", "ns-resize")	 
	.on("mouseover", ref.mouseoverFunction)
    .on("mouseout", ref.mouseoutFunction);

	
	this.widget.selectAll(".gDisplayBars").append("g")                                  
								  .attr("id",function (d){return "gInner"+d.id;})
                                  .attr("class","gInner");
    

	
*/    
 }

 //Update height of dragged bar
 //Base of bar is ref.yPos, top of bar is ref.yPos - barHeight, as defined during data initialization
Piechart.prototype.updateDraggedBar = function (id,mouseY){
     var ref = this;
     this.widget.select("#displayBars"+id)
	            .attr("height", function (d){
                    var current =  ref.yPos - d.heights[ref.currentViewIndex][0];
					var next = ref.yPos - d.heights[ref.nextViewIndex][0];				  
                   if (ref.currentViewIndex ==0 && mouseY >= current){ //At lowest bar and out of bounds
					    return d.heights[ref.currentViewIndex][0];
                    } else if (ref.nextViewIndex == ref.totalHeights && mouseY <= next){ //At the highest bar and out of bounds
					    return d.heights[ref.nextViewIndex][0];
					}					
				    //Somewhere in the middle                       					
                    var yDiff = Math.abs(mouseY - ref.yPos); 
					var barHeight = d.heights[ref.currentViewIndex][0];	
					var barTopY = ref.yPos - d.heights[ref.currentViewIndex][0];					
					if (mouseY > barTopY)
					   yDirection = -1;
					else 
					    yDirection = 1;                    				
				    return (barHeight + yDirection*Math.abs(yDiff - barHeight)); 
				})
				.attr("y", function(d){ 
				    var current =  ref.yPos - d.heights[ref.currentViewIndex][0];
					var next = ref.yPos - d.heights[ref.nextViewIndex][0];					
                    if (ref.currentViewIndex ==0){ //At lowest bar
					    if (mouseY >= current){ //Passed lowest bar, out of bounds
						    return current;
						}else if (mouseY <= next){ //Passed the next bar height, update tracker variables
						    ref.currentViewIndex = ref.nextViewIndex;
							ref.nextViewIndex++;
						    ref.currentView = d.heights[ref.currentViewIndex][1];
                            ref.redrawView(-1);							
						}
						//Otherwise, mouse is within bounds
						return mouseY;
                    } else if (ref.nextViewIndex == ref.totalHeights){ //At the highest bar
					    if (mouseY <= next){ //Passed highest, out of bounds
						   return next;
						}else if (mouseY >= current){ //Passed current, update tracker variables
						   ref.nextViewIndex = ref.currentViewIndex;
						   ref.currentViewIndex--;
						   ref.currentView = d.heights[ref.currentViewIndex][1];
                           ref.redrawView(-1);						   
						}
						//Otherwise, mouse is in bounds
						return mouseY;
					}else { //At a bar somewhere in  the middle
					   if (mouseY >= current){ //Passed current
					        ref.nextViewIndex = ref.currentViewIndex;
							ref.currentViewIndex--;	
                            ref.currentView = d.heights[ref.currentViewIndex][1];	
							ref.redrawView(-1);
					   }else if (mouseY <=next){ //Passed next
					       ref.currentViewIndex = ref.nextViewIndex;
						   ref.nextViewIndex++;	
                           ref.currentView = d.heights[ref.currentViewIndex][1];	
						   ref.redrawView(-1);
					   }						
					   //Within bounds
					   return mouseY;
                   }	                    
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

