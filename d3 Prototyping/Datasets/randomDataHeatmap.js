//Test data for the heatmap visualization
var data = [];
var max = 0.05;
var min = -0.05;
var matrixColours = [];
var labels = [1,2,3,4];
var xLabels = ["a","b","c"];
var yLabels = ["d","e","f"];
var counter = 0;
for (var row =0;row < xLabels.length;row++){
    for (var col=0;col<yLabels.length;col++){
        data[counter] = {"row":row,"column":col,"values":[]};
        for (var j=0;j<labels.length;j++){
            var randomValue = Math.random() * (max - min) + min;
            data[counter].values.push(randomValue);
        }
        counter++;
    }
}

