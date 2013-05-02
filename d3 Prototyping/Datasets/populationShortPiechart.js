
//Generate data for the piechart
//Format of array:
// pieDataset = ["clusterLabel":name, "values":[list of all values, one per view]
var dataset = [];
//Initiliaze general information for all clusters
 dataset[0] = [];
 dataset[0] = {"clusterLabel":"South Asia","values":[0,0,0,0,0,0,0,0,0,0,0]};
 dataset[1] = [];
 dataset[1] = {"clusterLabel":"Europe & Central Asia","values":[0,0,0,0,0,0,0,0,0,0,0]};
 dataset[2] = [];
 dataset[2] = {"clusterLabel":"Sub-Saharan Africa","values":[0,0,0,0,0,0,0,0,0,0,0]};
 dataset[3] = [];
 dataset[3] = {"clusterLabel":"America","values":[0,0,0,0,0,0,0,0,0,0,0]};
 dataset[4] = [];
 dataset[4] = {"clusterLabel":"East Asia & Pacific","values":[0,0,0,0,0,0,0,0,0,0,0]};
 dataset[5] = [];
 dataset[5] = {"clusterLabel":"Middle East & North Africa","values":[0,0,0,0,0,0,0,0,0,0,0]};
 var totals = [0,0,0,0,0,0,0,0,0,0,0];
 //Populate the values array for each cluster, with population totals
 for (j = 0;j<data.length;j++){
 // if (dataset[j].Cluster == 0 || dataset[j].Cluster==1 || dataset[j].Cluster==2 || dataset[j].Cluster==3){
 var clusterNumber = data[j].Cluster;
 dataset[clusterNumber].values[0] += data[j].Pop1955;
 dataset[clusterNumber].values[1] += data[j].Pop1960;
 dataset[clusterNumber].values[2] += data[j].Pop1965;
 dataset[clusterNumber].values[3] += data[j].Pop1970;
 dataset[clusterNumber].values[4] += data[j].Pop1975;
 dataset[clusterNumber].values[5] += data[j].Pop1980;
 dataset[clusterNumber].values[6] += data[j].Pop1985;
 dataset[clusterNumber].values[7] += data[j].Pop1990;
 dataset[clusterNumber].values[8] += data[j].Pop1995;
 dataset[clusterNumber].values[9] += data[j].Pop2000;
 dataset[clusterNumber].values[10] += data[j].Pop2005;
 //}
 }
 //Get the totals for each view (to divide the values by)
 for (j=0;j<totals.length;j++){
     for (var k=0;k<dataset.length;k++){
        totals[j] += dataset[k].values[j];
     }
 }
 //Now, update the piedataset to contain percentages, using the totals array
 for (j=0;j<dataset.length;j++){
     for (k=0;k<totals.length;k++){
        dataset[j].values[k] = dataset[j].values[k]/totals[k];
     }
 }


