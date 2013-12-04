/**Secondary School Averages of Full Time, First Year Science Students
 * Source: http://cudo.cou.on.ca/
 */
var labels = ["2005","2006","2007","2008","2009","2010","2011"];

var data = [
        {label:"A+ (95% +)",values:[1.1,1,0.4,0.4,1.1,1.7,0.3]},
        {label:"A+ (94% - 90%)",values:[5,7.5,2.6,2.1,3.6,5.4,4.7]},
         {label:"A (89% - 85%)",values:[7.3,10.6,12.2,12.7,9.7,9.9,9.9]},
        {label:"A- (84% - 80%)",values:[14.5,16.6,20.1,21.5,19.9,21.1,18.7]},
         {label:"B+ (79% - 75%)",values:[18.4,23.1,27.5,31.2,30.3,35.7,33.2]},
        {label:"B (74% - 70%)",values:[34.6,33.7,32.3,31.6,33.2,25.2,33.2]},
         {label:"B- to D (Below 70%)",values:[19,12.3,4.8,0.4,2.2,1,0]}
];
//Adjust the values to make them lie in range 0 to 1
for (var i=0;i<labels.length;i++){
    for (var j=0;j<data[i].values.length;j++){
        data[i].values[j] = data[i].values[j]/100;
    }

}