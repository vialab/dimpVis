/** CO2 Emissions per person (metric tons), from Gapminder website
 * Selected the G8+5 countries group, which consists of the G8 countries and the 5 leading emerging economies
 * Trying to tackle global warming
 */
var data = [
  ["Canada","15.72302558","15.99096401","17.05605798","16.87339602","17.04511867","17.1593927","17.0515943","16.80246211","16.92509634","17.63385691","17.47853749","16.79719566","15.99971677","15.71734354","15.923864","15.54871362","14.78760134","15.50451762","16.11905076","16.1114233","16.24627409","16.00659734","16.47303828","16.64813358","15.66582206","15.68996052","15.81493777","16.18712728","17.17383324","16.96193179","17.42683142","16.97414433","16.59485318","17.49953067","17.28981435","17.43992599","16.86231777","17.0041237","16.35039863","15.26009889","15.39945891","15.58069705"],
  ["France","8.647469614","9.037871603","9.320518208","9.937511769","9.530918369","8.480986533","9.543478828","9.035339325","9.466648897","9.862765616","9.378557143","8.398516322","8.029095846","7.725745567","7.3707307","7.250959552","6.937972859","6.755887314","6.626696928","6.920428447","7.035870965","7.508045487","6.941837134","6.776778032","6.41039434","6.798462428","7.029040313","6.511920453","6.992889001","6.319416725","6.190346876","6.495829652","6.364131908","6.43215383","6.430571156","6.423165725","6.227735158","6.08393324","6.070348368","5.818304186","5.873259793","5.451181469"],
  ["Germany","13.13717155","13.24500653","13.27670135","13.82791189","13.53017658","12.7655002","13.89876401","13.42240344","13.77597736","14.29281903","14.08973538","13.45958881","13.07022381","13.04715204","13.34292912","13.48265026","13.51195079","13.28708809","13.1974408","12.93279745","12.81357045","11.68550026","11.12390959","10.86152022","10.63976443","10.56609593","10.84204854","10.4935962","10.40797579","10.01194071","10.10364498","10.3864384","10.07901549","10.13021769","10.03881566","9.807556969","9.835780459","9.539493352","9.537169835","8.913646985","9.338626861","9.017172722"],
  ["Italy","5.564280706","5.801855763","6.083147883","6.508083385","6.560143356","6.21247774","6.63231043","6.402255774","6.68227425","6.912721791","6.917933696","6.704712921","6.541255216","6.381463163","6.482438518","6.55428279","6.450061693","6.751373435","6.858719302","7.30006485","7.481938537","7.649263907","7.523751496","7.432568191","7.24242207","7.700007601","7.541292065","7.621274204","7.783509003","7.683320118","7.863283608","7.815042602","7.813087286","8.093183668","8.113530975","8.067625767","7.957277529","7.749980952","7.468942285","6.652425243","6.771701917","6.573252492"],
  ["Japan","7.412508012","7.584418988","8.003161914","9.172298497","8.826766135","8.31130952","8.50723939","8.840575238","8.678470931","8.913204656","8.61832684","8.309197445","7.983605404","7.861760657","8.285399498","8.032221627","8.023562986","7.92803084","8.681509755","8.888541491","8.953148462","8.968201108","9.12065002","8.964271279","9.459647302","9.509754247","9.658303371","9.605144837","9.247590692","9.542878595","9.699960096","9.54899042","9.652170604","9.805352018","9.97268285","9.795391135","9.735405481","9.888557572","9.542690492","8.700269981","9.264409221","9.299848548"],
  ["Russia","","","","","","","","","","","","","","","","","","","","","","","14.33112222","13.1843922","11.5701013","11.17949456","10.99145683","10.52452842","10.3324115","10.44693374","10.61594912","10.65854383","10.70318054","11.07690138","11.10699781","11.23123971","11.63299408","11.63634066","11.9828969","11.00376147","11.42195086","11.75987617"],
  ["United Kingdom","11.73509611","11.83821087","11.5863756","11.76813856","10.99418576","10.73346463","10.64201121","10.74232089","10.74747294","11.45427768","10.28786897","9.957271922","9.73479352","9.678931902","9.37840835","9.905083036","10.04408295","10.07541517","10.0244547","10.19431519","9.965427047","10.34988391","10.21113104","9.837994837","9.746507908","9.732749787","9.982557922","9.49304413","9.47353452","9.127136584","9.233474647","9.315212813","8.963441072","9.069662877","9.022277533","9.001928878","8.952961552","8.680079534","8.522876171","7.696975098","7.923624751","7.336315928"],
  ["United States","20.66471465","20.61159223","21.40459783","22.1679634","21.17817597","20.10844789","20.85663136","21.23777748","21.68539","21.52639004","20.54059203","19.52885838","18.35646376","18.32700114","18.7187054","18.60508308","18.44289823","19.0467892","19.68028544","19.73482698","19.25850666","19.03696467","18.87734264","19.81192809","19.838014","19.66588771","19.83352878","20.17604887","19.7422366","19.7910708","20.2230275","19.61464335","19.58781178","19.5033538","19.69044938","19.62757965","19.1514501","19.28039782","18.5459917","17.22232659","17.73020252","17.25534888"],
  ["Brazil","0.975797824","1.042472413","1.134125212","1.282912896","1.357039173","1.396648509","1.400122656","1.436386109","1.523261646","1.583783569","1.537018062","1.378865308","1.350126977","1.277159639","1.265490911","1.330177158","1.430177161","1.46349809","1.449049079","1.454938642","1.395708069","1.44144039","1.427627544","1.46967197","1.519035072","1.596088561","1.732704312","1.800931853","1.843227636","1.861992226","1.880196477","1.907555762","1.853076585","1.770560438","1.837108443","1.867213313","1.849542336","1.913505574","2.023772836","1.899717681","2.147173672","2.157933215"],
  ["China","0.947122148","1.047967861","1.085901867","1.102640383","1.100777286","1.251860181","1.285083865","1.386847429","1.526796094","1.540667927","1.492171294","1.456222109","1.563582436","1.626078589","1.744278059","1.861076426","1.92661235","2.023534778","2.133840102","2.134473877","2.148559702","2.226313247","2.293794638","2.421521433","2.545073561","2.734777555","2.824139241","2.802597286","2.661320024","2.634231569","2.682866158","2.728882884","2.872547831","3.498358878","4.065723468","4.427592167","4.879028386","5.139069376","5.29789957","5.758007485","6.178707252","6.761066524"],
  ["India","0.352291988","0.363275029","0.375651318","0.377949339","0.381779392","0.405368929","0.414073363","0.483922042","0.47611623","0.485350271","0.497886422","0.523086995","0.543384535","0.576349784","0.582768945","0.62514475","0.655586912","0.6849349","0.723699697","0.774663982","0.79025578","0.82719615","0.860997141","0.87718252","0.913860302","0.953837431","1.019927418","1.043262704","1.05237575","1.104247446","1.125872914","1.123541705","1.126744136","1.159068258","1.200723575","1.237672175","1.300067332","1.372484618","1.513182716","1.638799739","1.714719667","1.817840429"],
  ["Mexico","2.199080936","2.363829973","2.40458325","2.541404516","2.649821412","2.730733464","2.97117254","3.026048894","3.400916548","3.58664437","3.902927318","4.045940417","4.245928952","3.802303316","3.717522616","3.786995954","3.788630408","3.87265278","3.790136783","4.37716836","3.729095063","3.797725471","3.752618578","3.706715679","3.836662183","3.554776503","3.630828618","3.754669077","3.849167281","3.875742211","3.816378713","3.89584638","3.811742861","3.903615383","3.904951024","4.0851864","4.096585267","4.181958594","4.308137429","3.982712211","3.988212621","4.003070054"],
  ["South Africa","6.654888317","7.294587551","7.234083195","7.115962579","7.057259989","7.20602784","7.327089107","7.402268493","7.302103865","7.718014363","7.856101801","8.6273645","9.170623963","9.302943963","9.809658409","9.828723712","9.806766751","9.545995954","9.745863561","9.483255351","9.063547758","9.188038656","8.405987127","8.647372569","8.852466117","8.536373092","8.502692147","8.660250638","8.55278692","8.40559603","8.234447518","7.991048987","7.555187225","8.165662922","9.043477622","8.28745699","8.789515822","9.082425042","9.426622156","10.02926484","10.20110451","10.29106147"]
];

var dataset = [];
for (var j = 0;j<data.length;j++){
    dataset[j] = [];
    dataset[j] = {"heights":[],"label":data[j][0]};
    var pts = [];
    for (var k=1;k<42;k++){
        if (data[j][k]==""){
            pts[k-1] = 0;
        }else{
            pts[k-1] = parseFloat(data[j][k]);
        }
    }
    dataset[j].heights = pts;
}
console.log(dataset);
var labels = [];
var year = 1970;
for (var j=0;j<42;j++){
    labels[j] = year;
    year++;
}
console.log(labels);
