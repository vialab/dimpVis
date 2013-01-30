//Updates the display when a point is being dragged 
Scatterplot.prototype.updateDrag = function(clickedPoint) {	 
       var ref = this;
	   var mouseX = d3.event.pageX;
	  this.widget.selectAll(".displayPoints")     
        .attr("cx", function(d){
		      if(d.id==clickedPoint){			     
                  if (((ref.currentView + 1) < d.nodes.length) &&((ref.currentView -1)>=0)){
			       //Grab the points which define boundaries for the current sub-path
			       var x0 = d.nodes[ref.currentView][0];
			       var y0 = d.nodes[ref.currentView][1];
				   var x1 = d.nodes[ref.currentView+1][0];
			       var y1 = d.nodes[ref.currentView+1][1]; 
                  			  
                   //Ensure the mouse is within bounds of the current sub-path
                   var start, end;
                    if (x0 > x1){
					    start = x1;
						end = x0;
                    }else {
					    start = x0;
						end = x1;
                     }
                     var interpY;              
				  //Check for a view transition, out of bounds of the sub-path
				  if (mouseX <= start){
					  //ref.currentView = ref.currentView + 1;
					  return start;
				   }else if (mouseX >=end){
					   //ref.currentView = ref.currentView + 1;
					  return end;
				   }
				   else{			        		  
					  
					   return mouseX;	 
					}						 
				   
              }			  
			     //return mouseX;          					  
               
			}			
			return d.x;
		})
        .attr("cy", function(d){		   
		   if (d.id==clickedPoint){	 
		     	  
             //Instead of checking within entire path bounds, just keep checking within current sub-path bounds
			 //Also need to sort largest and smallest x from the two points which define the current sub-path
              //First make sure ref.currentView, doesn't cause an array out of bounds
			  //console.log((ref.currentView +1)+" "+(ref.currentView-1));
              if (((ref.currentView + 1) < d.nodes.length) &&((ref.currentView -1)>=0)){
			       //Grab the points which define boundaries for the current sub-path
			       var x0 = d.nodes[ref.currentView][0];
			       var y0 = d.nodes[ref.currentView][1];
				   var x1 = d.nodes[ref.currentView+1][0];
			       var y1 = d.nodes[ref.currentView+1][1]; 
                  			  
                   //Ensure the mouse is within bounds of the current sub-path
                   var start, end, starty, endy;
                    if (x0 > x1){
					    start = x1;
						end = x0;
						starty = y1;
						endy = y0;
                    }else {
					    start = x0;
						end = x1;
						starty = y0;
						endy = y1;
                     }
                     var interpY;              
				  //Check for a view transition, out of bounds of the sub-path
				  if (mouseX <= start){
					  ref.currentView = ref.currentView + 1;
					  return starty;
				   }else if (mouseX >=end){
					   ref.currentView = ref.currentView + 1;
					  return endy;
				   }
				   else{			        		  
					  var interpY = ref.findInterpY(mouseX,x0,y0,x1,y1);
					   return interpY;	 
					}						 
				   
              }  
               
		   }
			return d.y;
		});
  
}





//Updates the display when a point is being dragged 
Scatterplot.prototype.updateDrag = function(clickedPoint) {	 
       var ref = this;
	   var mouseX = d3.event.pageX;
	  this.widget.selectAll(".displayPoints")     
        .attr("cx", function(d){
		      if(d.id==clickedPoint){	
                        //Check 2: Avoid startPoint out of bounds, by checking for the first and last years					     
						  if (ref.startPoint == d.nodes.length-1){//At the last point
							//User can only move towards the second last point, otherwise they are going out of the bounds of the entire path
							//If they are trying to move beyond the last point, snap the point to the point's location in the last year (startPoint)
							var x0 = d.nodes[ref.startPoint][0];
							var x1 = d.nodes[ref.startPoint-1][0];
							var range = ref.findLarger(x0,x1);
							if (mouseX <= range[0]){
							   if (range[0] == x0){
							      return x0;
							   }else {
							      ref.startPoint = ref.startPoint - 1;
								   ref.direction = -1;
								  return x1;				      
							   }							   
							}else if (mouseX >= range[1]){							  
							    if (range[1] == x0){
								   return x0;
							   }else{
							      ref.startPoint = ref.startPoint - 1;
								   ref.direction = -1;
								  return x1;
							   }
							}else{
							   return mouseX;
							}						
						  }	//End last point					
						  else if (ref.startPoint == 0){ //At the first point
						   //User can only move towards the second year, otherwise they are going out of the bounds of the entire path
							//If they are trying to move beyond the first year, snap the point to the point's location in the first year (startPoint)
							var x0 = d.nodes[ref.startPoint][0];
							var x1 = d.nodes[ref.startPoint+1][0];
							var range = ref.findLarger(x0,x1);
							if (mouseX <= range[0]){
							   if (range[0] == x0){
							      return x0;
							   }else {
							      ref.startPoint = ref.startPoint + 1;
								   ref.direction = 1;
								  return x1;				      
							   }							   
							}else if (mouseX >= range[1]){							  
							    if (range[1] == x0){
								   return x0;
							   }else{
							      ref.startPoint = ref.startPoint + 1;
								  ref.direction = 1;
								  return x1;
							   }
							}else{
							   return mouseX;
							}	
						  }//End first point
						  else{ //Somewhere in between first and last
						     var x0 = d.nodes[ref.startPoint][0];
							
							 var range = ref.findLarger(x0,x1);
							if (mouseX <= range[0]){
							   if (range[0] == x0){
							      return x0;
							   }else {
							      ref.startPoint = ref.startPoint + 1;
								   ref.direction = 1;
								  return x1;				      
							   }							   
							}else if (mouseX >= range[1]){							  
							    if (range[1] == x0){
								   return x0;
							   }else{
							      ref.startPoint = ref.startPoint + 1;
								  ref.direction = 1;
								  return x1;
							   }
							}else{
							   return mouseX;
							}		
						 }//end in between //end Check 2			  
		
                 
				  
			       //Grab the points which define boundaries for the current sub-path
			      /** var x0 = d.nodes[ref.startPoint][0];
			       var y0 = d.nodes[ref.startPoint][1];
				   var x1 = d.nodes[ref.startPoint+1][0];
			       var y1 = d.nodes[ref.startPoint+1][1]; 
                  			  
                   //Ensure the mouse is within bounds of the current sub-path
                   var start, end;
                    if (x0 > x1){
					    start = x1;
						end = x0;
                    }else {
					    start = x0;
						end = x1;
                     }
                     var interpY;              
				  //Check for a view transition, out of bounds of the sub-path
				  if (mouseX <= start){
					  //ref.startPoint = ref.startPoint + 1;
					  return start;
				   }else if (mouseX >=end){
					   //ref.startPoint = ref.startPoint + 1;
					  return end;
				   }
				   else{			        		  
					  
					   return mouseX;	 
					}	*/					 
				   
              			  
			      					  
               return mouseX;
			}			
			return d.x;
		})
        .attr("cy", function(d){		   
		   /**if (d.id==clickedPoint){	 
		     	  
             //Instead of checking within entire path bounds, just keep checking within current sub-path bounds
			 //Also need to sort largest and smallest x from the two points which define the current sub-path
              //First make sure ref.startPoint, doesn't cause an array out of bounds
			  //console.log((ref.startPoint +1)+" "+(ref.startPoint-1));
              if (((ref.startPoint + 1) < d.nodes.length) &&((ref.startPoint -1)>=0)){
			       //Grab the points which define boundaries for the current sub-path
			       var x0 = d.nodes[ref.startPoint][0];
			       var y0 = d.nodes[ref.startPoint][1];
				   var x1 = d.nodes[ref.startPoint+1][0];
			       var y1 = d.nodes[ref.startPoint+1][1]; 
                  			  
                   //Ensure the mouse is within bounds of the current sub-path
                   var start, end, starty, endy;
                    if (x0 > x1){
					    start = x1;
						end = x0;
						starty = y1;
						endy = y0;
                    }else {
					    start = x0;
						end = x1;
						starty = y0;
						endy = y1;
                     }
                     var interpY;              
				  //Check for a view transition, out of bounds of the sub-path
				  if (mouseX <= start){
					  ref.startPoint = ref.startPoint + 1;
					  return starty;
				   }else if (mouseX >=end){
					   ref.startPoint = ref.startPoint + 1;
					  return endy;
				   }
				   else{			        		  
					  var interpY = ref.findInterpY(mouseX,x0,y0,x1,y1);
					   return interpY;	 
					}						 
				   
              }  
               
		   }*/
			return d.y;
		});
  
}




//Updates the display when a point is being dragged 
Scatterplot.prototype.updateDrag = function(clickedPoint) {	 
       var ref = this;
	   var mouseX = d3.event.pageX;
	  this.widget.selectAll(".displayPoints")     
        .attr("cx", function(d){
		      
		      if(d.id==clickedPoint){
                    var xForward, xBackward;	
                    var xReference = d.nodes[ref.referencePoint][0];				
                   if  (ref.referencePoint ==0){
				        xForward = d.nodes[ref.referencePoint+1][0];	
				        if (Math.abs(mouseX - xForward) > Math.abs(xForward - xReference)){
						    console.log("reached beginning");
						    //return xReference;
						}else if (mouseX == xForward){
						    ref.referencePoint = ref.referencePoint + 1; //Mouse is moving forward
							ref.direction = 1;
							console.log("Crossed Points");
							//return mouseX;
						}else{
						    //console.log("Moving Forward");
							ref.direction = 1;
						}						
				   }else if (ref.referencePoint == (d.nodes.length -1)){
				         xBackward = d.nodes[ref.referencePoint-1][0];
						 if (Math.abs(mouseX - xBackward) > Math.abs(xBackward - xReference)){
						    console.log("reached end");
						    //return xReference;
						}else if (mouseX == xBackward){
						    ref.referencePoint = ref.referencePoint - 1; //Mouse is moving backward
							ref.direction = -1;
							console.log("crossed point");							
							//return mouseX;
						}else{
						    //console.log("Moving Backward");
							ref.direction = -1;
						}
				   }else{		
                         				   
						 xForward = d.nodes[ref.referencePoint+1][0];
						 xBackward = d.nodes[ref.referencePoint-1][0];
						 //Identify when the mouse has crossed a point
						 /**if (mouseX == xReference){ 
						     console.log("crossed a point");
							 ref.referencePoint = ref.referencePoint + ref.direction;
						 }*/
						 if (Math.abs(mouseX - xForward) < Math.abs(mouseX - xBackward)) {//The mouse is somewhere between xReference and xForward								
							//Determine the nearest point
							if (Math.abs(mouseX - xForward)<Math.abs(mouseX - xReference)){	//Closer to xForward						    
							    if (Math.abs(mouseX - xReference) > Math.abs(xForward - xReference)){ //Passed xForward
								    ref.referencePoint = ref.referencePoint + 1;	
                                    console.log("passed");									
								}
								   //console.log("towards next point");
								   ref.direction = 1;
							   
							}else{
							   //console.log("towards previous point");
							   ref.direction = -1;
							}							
							//console.log("moving backward");		
							//return mouseX;
						}else{ //Mouse is somewhere between xBackward and xReference
						    if (Math.abs(mouseX - xBackward)<Math.abs(mouseX - xReference)){ //Closer to xBackward
							   //console.log("towards previous point");
							   if (Math.abs(mouseX - xReference) > Math.abs(xBackward - xReference)){ //Passed xBackward
								    ref.referencePoint = ref.referencePoint - 1;
									console.log("passed");
								}
							       ref.direction = -1;
							   
							}else{
							   //console.log("towards next point");
							   ref.direction = 1;
							}	
						    //ref.direction = 1; //Mouse is moving forward
							//console.log("moving forward");		
							//return mouseX;
						}
				   }
				    					
			       //Grab the points which define boundaries for the current sub-path
			      /** var x0 = d.nodes[ref.referencePoint][0];
			       var y0 = d.nodes[ref.referencePoint][1];
				   var x1 = d.nodes[ref.referencePoint+1][0];
			       var y1 = d.nodes[ref.referencePoint+1][1]; 
                  			  
                   //Ensure the mouse is within bounds of the current sub-path
                   var start, end;
                    if (x0 > x1){
					    start = x1;
						end = x0;
                    }else {
					    start = x0;
						end = x1;
                     }
                     var interpY;              
				  //Check for a view transition, out of bounds of the sub-path
				  if (mouseX <= start){
					  //ref.referencePoint = ref.referencePoint + 1;
					  return start;
				   }else if (mouseX >=end){
					   //ref.referencePoint = ref.referencePoint + 1;
					  return end;
				   }
				   else{			        		  
					  
					   return mouseX;	 
					}	*/		             			  
			      					  
               return mouseX;
			}			
			return d.x;
		})
        .attr("cy", function(d){		   
		   /**if (d.id==clickedPoint){	 
		     	  
             //Instead of checking within entire path bounds, just keep checking within current sub-path bounds
			 //Also need to sort largest and smallest x from the two points which define the current sub-path
              //First make sure ref.referencePoint, doesn't cause an array out of bounds
			  //console.log((ref.referencePoint +1)+" "+(ref.referencePoint-1));
              if (((ref.referencePoint + 1) < d.nodes.length) &&((ref.referencePoint -1)>=0)){
			       //Grab the points which define boundaries for the current sub-path
			       var x0 = d.nodes[ref.referencePoint][0];
			       var y0 = d.nodes[ref.referencePoint][1];
				   var x1 = d.nodes[ref.referencePoint+1][0];
			       var y1 = d.nodes[ref.referencePoint+1][1]; 
                  			  
                   //Ensure the mouse is within bounds of the current sub-path
                   var start, end, starty, endy;
                    if (x0 > x1){
					    start = x1;
						end = x0;
						starty = y1;
						endy = y0;
                    }else {
					    start = x0;
						end = x1;
						starty = y0;
						endy = y1;
                     }
                     var interpY;              
				  //Check for a view transition, out of bounds of the sub-path
				  if (mouseX <= start){
					  ref.referencePoint = ref.referencePoint + 1;
					  return starty;
				   }else if (mouseX >=end){
					   ref.referencePoint = ref.referencePoint + 1;
					  return endy;
				   }
				   else{			        		  
					  var interpY = ref.findInterpY(mouseX,x0,y0,x1,y1);
					   return interpY;	 
					}						 
				   
              }  
               
		   }*/
			return d.y;
		});
  
}


//Updates the display when a point is being dragged 
Scatterplot.prototype.updateDrag = function(clickedPoint) {	 
       var ref = this;
	   var mouseX = d3.event.pageX;
	  this.widget.selectAll(".displayPoints")     
        .attr("cx", function(d){
		      
		      if(d.id==clickedPoint){			       
                    			
                   if  (ref.subPathStart ==0){
				        ref.subPathEnd = d.nodes[ref.subPathStart+1][0];	
				        if (Math.abs(mouseX - ref.subPathEnd) > Math.abs(ref.subPathStart - ref.subPathEnd)){ //Beyond start 
						    console.log("out of bounds");						    
						} else if (Math.abs(mouseX - ref.subPathStart)> Math.abs(ref.subPathStart - ref.subPathEnd)){ //Beyond end
						    console.log("crossing point");
							ref.subPathStart = ref.subPathEnd + 1;
							ref.subPathEnd = ref.subPathStart + 1;
                        }						
				   }/**else if (ref.subpathStart == (d.nodes.length -1)){
				         xBackward = d.nodes[ref.referencePoint-1][0];
						 if (Math.abs(mouseX - xBackward) > Math.abs(xBackward - xReference)){
						    console.log("reached end");
						    //return xReference;
						}else if (mouseX == xBackward){
						    ref.referencePoint = ref.referencePoint - 1; //Mouse is moving backward
							ref.direction = -1;
							console.log("crossed point");							
							//return mouseX;
						}else{
						    //console.log("Moving Backward");
							ref.direction = -1;
						}
				   }*/else{		
                         /**if (Math.abs(mouseX - ref.subPathEnd) > Math.abs(ref.subPathStart - ref.subPathEnd)){ //Beyond start 
						    console.log("crossing point");
                            						
						} else*/ if (Math.abs(mouseX - ref.subPathEnd)> Math.abs(ref.subPathStart - ref.subPathEnd)){ //Beyond end
						    console.log("crossing point");
							ref.subPathStart = ref.subPathEnd + 1;
							ref.subPathEnd = ref.subPathStart + 1;
                        }				   
						
				   }
				    					
			       //Grab the points which define boundaries for the current sub-path
			      /** var x0 = d.nodes[ref.referencePoint][0];
			       var y0 = d.nodes[ref.referencePoint][1];
				   var x1 = d.nodes[ref.referencePoint+1][0];
			       var y1 = d.nodes[ref.referencePoint+1][1]; 
                  			  
                   //Ensure the mouse is within bounds of the current sub-path
                   var start, end;
                    if (x0 > x1){
					    start = x1;
						end = x0;
                    }else {
					    start = x0;
						end = x1;
                     }
                     var interpY;              
				  //Check for a view transition, out of bounds of the sub-path
				  if (mouseX <= start){
					  //ref.referencePoint = ref.referencePoint + 1;
					  return start;
				   }else if (mouseX >=end){
					   //ref.referencePoint = ref.referencePoint + 1;
					  return end;
				   }
				   else{			        		  
					  
					   return mouseX;	 
					}	*/		             			  
			      					  
               return mouseX;
			}			
			return d.x;
		})
        .attr("cy", function(d){		   
		   /**if (d.id==clickedPoint){	 
		     	  
             //Instead of checking within entire path bounds, just keep checking within current sub-path bounds
			 //Also need to sort largest and smallest x from the two points which define the current sub-path
              //First make sure ref.referencePoint, doesn't cause an array out of bounds
			  //console.log((ref.referencePoint +1)+" "+(ref.referencePoint-1));
              if (((ref.referencePoint + 1) < d.nodes.length) &&((ref.referencePoint -1)>=0)){
			       //Grab the points which define boundaries for the current sub-path
			       var x0 = d.nodes[ref.referencePoint][0];
			       var y0 = d.nodes[ref.referencePoint][1];
				   var x1 = d.nodes[ref.referencePoint+1][0];
			       var y1 = d.nodes[ref.referencePoint+1][1]; 
                  			  
                   //Ensure the mouse is within bounds of the current sub-path
                   var start, end, starty, endy;
                    if (x0 > x1){
					    start = x1;
						end = x0;
						starty = y1;
						endy = y0;
                    }else {
					    start = x0;
						end = x1;
						starty = y0;
						endy = y1;
                     }
                     var interpY;              
				  //Check for a view transition, out of bounds of the sub-path
				  if (mouseX <= start){
					  ref.referencePoint = ref.referencePoint + 1;
					  return starty;
				   }else if (mouseX >=end){
					   ref.referencePoint = ref.referencePoint + 1;
					  return endy;
				   }
				   else{			        		  
					  var interpY = ref.findInterpY(mouseX,x0,y0,x1,y1);
					   return interpY;	 
					}						 
				   
              }  
               
		   }*/
			return d.y;
		});
  
}