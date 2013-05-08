var years = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000","2005"]; //Hard coded years for view labels      
var yearsElect = ["1867","1872","1874","1878","1882","1887","1891","1896","1900","1904","1908","1911","1917","1921","1925","1926","1930","1935","1940","1945","1949","1953","1957","1958","1962","1963","1965","1968","1972","1974","1979","1980","1984","1988","1993","1997","2000","2004","2006","2008","2011"];        
var yearsElect_short = [1949,1953,1957,1958,1962,1963,1965,1968,1972,1974,1979,1980,1984,1988,1993,1997,2000,2004,2006,2008,2011];
//Fake data for debugging
piedata = [{"label":"one", "values":[0.2,0.5,0.1,0.4]},
    {"label":"two", "values":[0.5,0.3,0.1,0.2]},
    {"label":"three", "values":[0.3,0.2,0.8,0.4]}];

var pieLabels = ["1990","1995","2000","2005"];
////////////////////////////////////////////////////////////////////////////////
// Create new pie chart
////////////////////////////////////////////////////////////////////////////////

var piechart   = new Piechart(50, 50 , 180,"#piegraph","Test Piechart",pieLabels);
piechart.init();
piechart.render(piedata,0);

////////////////////////////////////////////////////////////////////////////////
// TODO: Define some interaction functions for the piechart
////////////////////////////////////////////////////////////////////////////////
/**piechart.clickHintLabelFunction = function (){

 };*/

piechart.dragEvent = d3.behavior.drag()
/**.origin(function(d){ //TODO:Set the starting point of the drag interaction
 return {x:d3.event.x,y:d3.event.y};
 })*/
    .on("dragstart", function(d){
        piechart.clearHintPath();
        piechart.showHintPath(d.id, d.hDirections, d.nodes);

    })
    .on("drag", function(d){
        piechart.updateDraggedSegment(d.id,d3.event.x,d3.event.y);
        //slider.animateTick(piechart.interpValue,piechart.currentView,piechart.nextView);
    })
    .on("dragend",function (d){
        //piechart.clearHintPath(d.id);
        piechart.snapToView(d.id,d.endAngle,d.nodes);
        //slider.updateSlider(piechart.currentView);
        //piechart.redrawView();
        //piechart.redrawSegments(d.id,d.startAngle,d.endAngle);
    });

piechart.svg.selectAll(".displayArcs")
    .call(piechart.dragEvent);

////////////////////////////////////////////////////////////////////////////////
// TODO: Create new slider facilitating changing to different views of the visualization
////////////////////////////////////////////////////////////////////////////////   
/**var slider   = new Slider(15, 700, 700, 200, "#time",20,yearsElect_short, "Years","#666",50);
slider.init();
slider.render();
				  
////////////////////////////////////////////////////////////////////////////////
// Define some interaction functions for the slider
////////////////////////////////////////////////////////////////////////////////
 slider.dragEvent = d3.behavior.drag()  
						.on("dragstart", function(){                               
                           						
					     }) 
                      .on("drag", function(){                             	
						    slider.updateDraggedSlider(d3.event.x);  
                            //piechart.updateSegments(slider.interpValue,slider.currentTick,slider.nextTick);							
					  })
					  .on("dragend",function (){
					      slider.snapToTick(d3.event.x);
                          piechart.changeView(slider.currentTick);	
                          piechart.redrawView(-1,-1);						  
					  });	

slider.widget.select("#slidingTick")				                 			  
                   .call(slider.dragEvent);	   */


				   

