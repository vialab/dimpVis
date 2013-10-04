/** For creating a barchart visualization:
 * Parses the JSON array stored in 'data', to extract the fertility rate and life expectancy.
 *  This data is then placed into another array which is formatted according to the requirements
 *  specified in Scatterplot.js
 *  Also, a label array is created to show the different years this dataset evolves across
 * */
/**var data = [
{"Country":"Albania","Pop1955":1392164,"Pop1960":1623114,"Pop1965":1883652,"Pop1970":2156612,"Pop1975":2401108,"Pop1980":2671412,"Pop1985":2956697,"Pop1990":3250778,"Pop1995":3400516,"Pop2000":3473835,"Pop2005":3563112,"Group":"Europe & Central Asia","Cluster":1,"F1950":5.597,"F1955":5.978,"F1960":5.763,"F1965":5.113,"F1970":4.658,"F1975":4.202,"F1980":3.403,"F1985":3.076,"F1990":2.78,"F1995":2.483,"F2000":2.245,"F2005":2.064,"L1950":55.23,"L1955":59.28,"L1960":64.82,"L1965":66.22,"L1970":67.69,"L1975":68.93,"L1980":70.42,"L1985":72,"L1990":71.581,"L1995":72.95,"L2000":75.651,"L2005":76.423},
{"Country":"Algeria","Pop1955":9841851,"Pop1960":10909294,"Pop1965":11963091,"Pop1970":13931846,"Pop1975":16140252,"Pop1980":18806061,"Pop1985":22008450,"Pop1990":25093154,"Pop1995":28082573,"Pop2000":30409300,"Pop2005":32531853,"Group":"Middle East & North Africa","Cluster":5,"F1950":7.278,"F1955":7.278,"F1960":7.38,"F1965":7.38,"F1970":7.38,"F1975":7.175,"F1980":6.49,"F1985":5.29,"F1990":4.131,"F1995":2.885,"F2000":2.526,"F2005":2.383,"L1950":43.077,"L1955":45.685,"L1960":48.303,"L1965":51.407,"L1970":54.518,"L1975":58.014,"L1980":61.368,"L1985":65.799,"L1990":67.744,"L1995":69.152,"L2000":70.994,"L2005":72.301},
{"Country":"Afghanistan","Pop1955":8891209,"Pop1960":8000000,"Pop1965":10997885,"Pop1970":12430623,"Pop1975":14132019,"Pop1980":15112149,"Pop1985":13796928,"Pop1990":14669339,"Pop1995":20881480,"Pop2000":23898198,"Pop2005":29928987,"Group":"South Asia","Cluster":0,"F1950":7.7,"F1955":7.7,"F1960":7.7,"F1965":7.7,"F1970":7.7,"F1975":7.7,"F1980":7.8,"F1985":7.9,"F1990":8,"F1995":8,"F2000":7.4792,"F2005":7.0685,"L1950":28.801,"L1955":30.332,"L1960":31.997,"L1965":34.02,"L1970":36.088,"L1975":38.438,"L1980":39.854,"L1985":40.822,"L1990":41.674,"L1995":41.763,"L2000":42.129,"L2005":43.828},
{"Country":"Angola","Pop1955":4423223,"Pop1960":4797344,"Pop1965":5134818,"Pop1970":5605626,"Pop1975":5884241,"Pop1980":6741465,"Pop1985":7581504,"Pop1990":8290856,"Pop1995":9421477,"Pop2000":10442812,"Pop2005":11827315,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":7,"F1955":7.2,"F1960":7.4,"F1965":7.4,"F1970":7.2,"F1975":7.2,"F1980":7.2,"F1985":7.2,"F1990":7.1,"F1995":6.9,"F2000":6.75,"F2005":6.432,"L1950":30.015,"L1955":31.999,"L1960":34,"L1965":35.985,"L1970":37.928,"L1975":39.483,"L1980":39.942,"L1985":39.906,"L1990":40.647,"L1995":40.963,"L2000":41.003,"L2005":42.731},
{"Country":"Argentina","Pop1955":18927821,"Pop1960":20616009,"Pop1965":22283100,"Pop1970":23962313,"Pop1975":26081880,"Pop1980":28369799,"Pop1985":30675059,"Pop1990":33022202,"Pop1995":35311049,"Pop2000":37497728,"Pop2005":39537943,"Group":"America","Cluster":3,"F1950":3.154,"F1955":3.1265,"F1960":3.0895,"F1965":3.049,"F1970":3.1455,"F1975":3.44,"F1980":3.15,"F1985":3.053,"F1990":2.9,"F1995":2.63,"F2000":2.35,"F2005":2.254,"L1950":62.485,"L1955":64.399,"L1960":65.142,"L1965":65.634,"L1970":67.065,"L1975":68.481,"L1980":69.942,"L1985":70.774,"L1990":71.868,"L1995":73.275,"L2000":74.34,"L2005":75.32},
{"Country":"Armenia","Pop1955":1565329,"Pop1960":1868852,"Pop1965":2205833,"Pop1970":2519745,"Pop1975":2834136,"Pop1980":3115289,"Pop1985":3373532,"Pop1990":3376783,"Pop1995":3068751,"Pop2000":3042556,"Pop2005":2982904,"Group":"Europe & Central Asia","Cluster":1,"F1950":4.494,"F1955":4.494,"F1960":4.453,"F1965":3.447,"F1970":3.037,"F1975":2.503,"F1980":2.376,"F1985":2.575,"F1990":2.38,"F1995":1.75,"F2000":1.345,"F2005":1.388,"L1950":62.809,"L1955":64.928,"L1960":67.055,"L1965":69.211,"L1970":70.786,"L1975":70.595,"L1980":70.916,"L1985":68.408,"L1990":68.663,"L1995":70.377,"L2000":71.403,"L2005":71.965},
{"Country":"Guatemala","Pop1955":3433887,"Pop1960":3975707,"Pop1965":4531949,"Pop1970":4950548,"Pop1975":5473584,"Pop1980":6064228,"Pop1985":6917947,"Pop1990":8001019,"Pop1995":9266312,"Pop2000":10625732,"Pop2005":12013907,"Group":"America","Cluster":3,"F1950":7,"F1955":6.6,"F1960":6.5,"F1965":6.3,"F1970":6.2,"F1975":6.2005,"F1980":6.1,"F1985":5.7005,"F1990":5.45,"F1995":5.0005,"F2000":4.6,"F2005":4.152,"L1950":42.023,"L1955":44.142,"L1960":46.954,"L1965":50.016,"L1970":53.738,"L1975":56.029,"L1980":58.137,"L1985":60.782,"L1990":63.373,"L1995":66.322,"L2000":68.978,"L2005":70.259},
{"Country":"Guinea","Pop1955":2786879,"Pop1960":3028117,"Pop1965":3321330,"Pop1970":3661175,"Pop1975":4053377,"Pop1980":4508009,"Pop1985":5327721,"Pop1990":6278696,"Pop1995":7682082,"Pop2000":8638858,"Pop2005":9452670,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.9955,"F1955":6.9955,"F1960":6.9955,"F1965":6.9955,"F1970":6.9955,"F1975":6.9955,"F1980":6.9955,"F1985":6.8425,"F1990":6.4959,"F1995":6.1566,"F2000":5.8443,"F2005":5.436,"L1950":33.609,"L1955":34.558,"L1960":35.753,"L1965":37.197,"L1970":38.842,"L1975":40.762,"L1980":42.891,"L1985":45.552,"L1990":48.576,"L1995":51.455,"L2000":53.676,"L2005":56.007},
{"Country":"Guinea-Bissau","Pop1955":591909,"Pop1960":616682,"Pop1965":603780,"Pop1970":620020,"Pop1975":680919,"Pop1980":789053,"Pop1985":885234,"Pop1990":995991,"Pop1995":1143057,"Pop2000":1278273,"Pop2005":1413446,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":5.583,"F1955":5.583,"F1960":5.99,"F1965":6.5,"F1970":7.1,"F1975":7.1,"F1980":7.1,"F1985":7.1,"F1990":7.1,"F1995":7.1,"F2000":7.1,"F2005":7.069,"L1950":32.5,"L1955":33.489,"L1960":34.488,"L1965":35.492,"L1970":36.486,"L1975":37.465,"L1980":39.327,"L1985":41.245,"L1990":43.266,"L1995":44.873,"L2000":45.504,"L2005":46.388},
{"Country":"Guyana","Pop1955":491180,"Pop1960":571083,"Pop1965":640316,"Pop1970":714811,"Pop1975":767977,"Pop1980":759352,"Pop1985":758329,"Pop1990":750903,"Pop1995":747929,"Pop2000":755171,"Pop2005":765283,"Group":"America","Cluster":3,"F1950":6.68,"F1955":6.77,"F1960":6.15,"F1965":6.11,"F1970":4.9,"F1975":3.94,"F1980":3.26,"F1985":2.7,"F1990":2.55,"F1995":2.5,"F2000":2.4254,"F2005":2.3338,"L1950":52.31,"L1955":54.815,"L1960":57.32,"L1965":59.187,"L1970":59.958,"L1975":60.651,"L1980":60.923,"L1985":61.79,"L1990":62.531,"L1995":62.06,"L2000":63.578,"L2005":66.827},
{"Country":"Haiti","Pop1955":3376419,"Pop1960":3722743,"Pop1965":4137405,"Pop1970":4604915,"Pop1975":4828338,"Pop1980":5029725,"Pop1985":5517977,"Pop1990":6126101,"Pop1995":6675578,"Pop2000":7306302,"Pop2005":8121622,"Group":"America","Cluster":3,"F1950":6.3,"F1955":6.3,"F1960":6.3,"F1965":6,"F1970":5.6005,"F1975":5.8,"F1980":6.2099,"F1985":5.69985,"F1990":5.14985,"F1995":4.61995,"F2000":4,"F2005":3.5445,"L1950":37.579,"L1955":40.696,"L1960":43.59,"L1965":46.243,"L1970":48.042,"L1975":49.923,"L1980":51.461,"L1985":53.636,"L1990":55.089,"L1995":56.671,"L2000":58.137,"L2005":60.916},
{"Country":"Honduras","Pop1955":1662219,"Pop1960":1951640,"Pop1965":2329159,"Pop1970":2760666,"Pop1975":2857540,"Pop1980":3401940,"Pop1985":4076514,"Pop1990":4792271,"Pop1995":5546185,"Pop2000":6347658,"Pop2005":7167902,"Group":"America","Cluster":3,"F1950":7.497,"F1955":7.497,"F1960":7.418,"F1965":7.421,"F1970":7.05,"F1975":6.6,"F1980":5.9995,"F1985":5.37,"F1990":4.916,"F1995":4.3005,"F2000":3.723,"F2005":3.308,"L1950":41.912,"L1955":44.665,"L1960":48.041,"L1965":50.924,"L1970":53.884,"L1975":57.402,"L1980":60.909,"L1985":64.492,"L1990":66.399,"L1995":67.659,"L2000":68.565,"L2005":70.198},
{"Country":"Madagascar","Pop1955":5002657,"Pop1960":5481721,"Pop1965":6070004,"Pop1970":6765644,"Pop1975":7603790,"Pop1980":8676821,"Pop1985":9981292,"Pop1990":11522099,"Pop1995":13340359,"Pop2000":15506472,"Pop2005":18040341,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.8,"F1955":6.8,"F1960":6.8,"F1965":6.8,"F1970":6.7,"F1975":6.6,"F1980":6.4,"F1985":6.3,"F1990":6.124,"F1995":5.801,"F2000":5.278,"F2005":4.776,"L1950":36.681,"L1955":38.865,"L1960":40.848,"L1965":42.881,"L1970":44.851,"L1975":46.881,"L1980":48.969,"L1985":49.35,"L1990":52.214,"L1995":54.978,"L2000":57.286,"L2005":59.443},
{"Country":"Malawi","Pop1955":3088155,"Pop1960":3450444,"Pop1965":3914095,"Pop1970":4489313,"Pop1975":5267679,"Pop1980":6129035,"Pop1985":7123455,"Pop1990":9286655,"Pop1995":9912344,"Pop2000":11258163,"Pop2005":12707464,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.78,"F1955":6.84,"F1960":7,"F1965":7.2,"F1970":7.4,"F1975":7.6,"F1980":7.488,"F1985":7.159,"F1990":6.763,"F1995":6.44,"F2000":6.032,"F2005":5.593,"L1950":36.256,"L1955":37.207,"L1960":38.41,"L1965":39.487,"L1970":41.766,"L1975":43.767,"L1980":45.642,"L1985":47.457,"L1990":49.42,"L1995":47.495,"L2000":45.009,"L2005":48.303},
{"Country":"Malaysia","Pop1955":7311720,"Pop1960":8428493,"Pop1965":9647654,"Pop1970":10910216,"Pop1975":12267303,"Pop1980":13764352,"Pop1985":15545028,"Pop1990":17503607,"Pop1995":19611116,"Pop2000":21793293,"Pop2005":23953136,"Group":"East Asia & Pacific","Cluster":4,"F1950":6.833,"F1955":6.944,"F1960":6.724,"F1965":5.941,"F1970":5.15,"F1975":4.161,"F1980":4.242,"F1985":3.996,"F1990":3.47,"F1995":3.1,"F2000":2.8745,"F2005":2.5972,"L1950":48.463,"L1955":52.102,"L1960":55.737,"L1965":59.371,"L1970":63.01,"L1975":65.256,"L1980":68,"L1985":69.5,"L1990":70.693,"L1995":71.938,"L2000":73.044,"L2005":74.241},
{"Country":"Saudi Arabia","Pop1955":4243218,"Pop1960":4718301,"Pop1965":5327432,"Pop1970":6109051,"Pop1975":7204820,"Pop1980":9999161,"Pop1985":13330067,"Pop1990":16060761,"Pop1995":19966998,"Pop2000":23153090,"Pop2005":26417599,"Group":"Middle East & North Africa","Cluster":5,"F1950":7.175,"F1955":7.175,"F1960":7.257,"F1965":7.257,"F1970":7.298,"F1975":7.278,"F1980":7.015,"F1985":6.217,"F1990":5.446,"F1995":4.621,"F2000":3.81,"F2005":3.352,"L1950":39.875,"L1955":42.868,"L1960":45.914,"L1965":49.901,"L1970":53.886,"L1975":58.69,"L1980":63.012,"L1985":66.295,"L1990":68.768,"L1995":70.533,"L2000":71.626,"L2005":72.777},
{"Country":"Zambia","Pop1955":2869000,"Pop1960":3254000,"Pop1965":3694000,"Pop1970":4251612,"Pop1975":4923730,"Pop1980":5699777,"Pop1985":6779477,"Pop1990":7941694,"Pop1995":9001866,"Pop2000":10116606,"Pop2005":11261795,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.75,"F1955":6.9,"F1960":7.15,"F1965":7.4,"F1970":7.425,"F1975":7.375,"F1980":6.95,"F1985":6.658,"F1990":6.28,"F1995":5.999,"F2000":5.648,"F2005":5.176,"L1950":42.038,"L1955":44.077,"L1960":46.023,"L1965":47.768,"L1970":50.107,"L1975":51.386,"L1980":51.821,"L1985":50.821,"L1990":46.1,"L1995":40.238,"L2000":39.193,"L2005":42.384},
{"Country":"Zimbabwe","Pop1955":3409017,"Pop1960":4010933,"Pop1965":4685272,"Pop1970":5514536,"Pop1975":6341797,"Pop1980":7169968,"Pop1985":8560378,"Pop1990":10152933,"Pop1995":11111992,"Pop2000":11751323,"Pop2005":12160782,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.8,"F1955":7,"F1960":7.3,"F1965":7.4,"F1970":7.4,"F1975":7.3,"F1980":6.74,"F1985":5.656,"F1990":4.773,"F1995":4.054,"F2000":3.563,"F2005":3.186,"L1950":48.451,"L1955":50.469,"L1960":52.358,"L1965":53.995,"L1970":55.635,"L1975":57.674,"L1980":60.363,"L1985":62.351,"L1990":60.377,"L1995":46.809,"L2000":39.989,"L2005":43.487}];
*/
/**Test dataset for the ambiguous cases
 * Modified Argentina: example of multiple revisiting bars
 * Modified Algeria: example of stationary bar sequences
 * Modified Armenia: zero value
 * Modified Afghanistan: long stationary sequence of bars
 */
/**var data = [{"Country":"Afghanistan","Pop1955":8000000,"Pop1960":8000000,"Pop1965":8000000,"Pop1970":8000000,"Pop1975":8000000,"Pop1980":8000000,"Pop1985":8000000,"Pop1990":14669339,"Pop1995":20881480,"Pop2000":23898198,"Pop2005":29928987,"Group":"South Asia","Cluster":0,"F1950":7.7,"F1955":7.7,"F1960":7.7,"F1965":7.7,"F1970":7.7,"F1975":7.7,"F1980":7.8,"F1985":7.9,"F1990":8,"F1995":8,"F2000":7.4792,"F2005":7.0685,"L1950":28.801,"L1955":30.332,"L1960":31.997,"L1965":34.02,"L1970":36.088,"L1975":38.438,"L1980":39.854,"L1985":40.822,"L1990":41.674,"L1995":41.763,"L2000":42.129,"L2005":43.828},
    {"Country":"Albania","Pop1955":1392164,"Pop1960":1623114,"Pop1965":1883652,"Pop1970":2156612,"Pop1975":2401108,"Pop1980":2671412,"Pop1985":2956697,"Pop1990":3250778,"Pop1995":3400516,"Pop2000":3473835,"Pop2005":3563112,"Group":"Europe & Central Asia","Cluster":1,"F1950":5.597,"F1955":5.978,"F1960":5.763,"F1965":5.113,"F1970":4.658,"F1975":4.202,"F1980":3.403,"F1985":3.076,"F1990":2.78,"F1995":2.483,"F2000":2.245,"F2005":2.064,"L1950":55.23,"L1955":59.28,"L1960":64.82,"L1965":66.22,"L1970":67.69,"L1975":68.93,"L1980":70.42,"L1985":72,"L1990":71.581,"L1995":72.95,"L2000":75.651,"L2005":76.423},
    {"Country":"Algeria","Pop1955":9841851,"Pop1960":10909294,"Pop1965":11963091,"Pop1970":11963091,"Pop1975":11963091,"Pop1980":18806061,"Pop1985":22008450,"Pop1990":25093154,"Pop1995":28082573,"Pop2000":28082573,"Pop2005":32531853,"Group":"Middle East & North Africa","Cluster":5,"F1950":7.278,"F1955":7.278,"F1960":7.38,"F1965":7.38,"F1970":7.38,"F1975":7.175,"F1980":6.49,"F1985":5.29,"F1990":4.131,"F1995":2.885,"F2000":2.526,"F2005":2.383,"L1950":43.077,"L1955":45.685,"L1960":48.303,"L1965":51.407,"L1970":54.518,"L1975":58.014,"L1980":61.368,"L1985":65.799,"L1990":67.744,"L1995":69.152,"L2000":70.994,"L2005":72.301},
    {"Country":"Angola","Pop1955":4423223,"Pop1960":4797344,"Pop1965":5134818,"Pop1970":5605626,"Pop1975":5884241,"Pop1980":6741465,"Pop1985":7581504,"Pop1990":8290856,"Pop1995":9421477,"Pop2000":10442812,"Pop2005":11827315,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":7,"F1955":7.2,"F1960":7.4,"F1965":7.4,"F1970":7.2,"F1975":7.2,"F1980":7.2,"F1985":7.2,"F1990":7.1,"F1995":6.9,"F2000":6.75,"F2005":6.432,"L1950":30.015,"L1955":31.999,"L1960":34,"L1965":35.985,"L1970":37.928,"L1975":39.483,"L1980":39.942,"L1985":39.906,"L1990":40.647,"L1995":40.963,"L2000":41.003,"L2005":42.731},
    //{"Country":"Argentina","Pop1955":18927821,"Pop1960":20616009,"Pop1965":22283100,"Pop1970":17962313,"Pop1975":22283100,"Pop1980":28369799,"Pop1985":22283100,"Pop1990":33022202,"Pop1995":22283100,"Pop2000":37497728,"Pop2005":39537943,"Group":"America","Cluster":3,"F1950":3.154,"F1955":3.1265,"F1960":3.0895,"F1965":3.049,"F1970":3.1455,"F1975":3.44,"F1980":3.15,"F1985":3.053,"F1990":2.9,"F1995":2.63,"F2000":2.35,"F2005":2.254,"L1950":62.485,"L1955":64.399,"L1960":65.142,"L1965":65.634,"L1970":67.065,"L1975":68.481,"L1980":69.942,"L1985":70.774,"L1990":71.868,"L1995":73.275,"L2000":74.34,"L2005":75.32},
    {"Country":"Argentina","Pop1955":18927821,"Pop1960":10616009,"Pop1965":22283100,"Pop1970":17962313,"Pop1975":30083800,"Pop1980":10369799,"Pop1985":20283100,"Pop1990":33022202,"Pop1995":22283100,"Pop2000":37497728,"Pop2005":39537943,"Group":"America","Cluster":3,"F1950":3.154,"F1955":3.1265,"F1960":3.0895,"F1965":3.049,"F1970":3.1455,"F1975":3.44,"F1980":3.15,"F1985":3.053,"F1990":2.9,"F1995":2.63,"F2000":2.35,"F2005":2.254,"L1950":62.485,"L1955":64.399,"L1960":65.142,"L1965":65.634,"L1970":67.065,"L1975":68.481,"L1980":69.942,"L1985":70.774,"L1990":71.868,"L1995":73.275,"L2000":74.34,"L2005":75.32},
    {"Country":"Armenia","Pop1955":1565329,"Pop1960":0,"Pop1965":2205833,"Pop1970":2519745,"Pop1975":2834136,"Pop1980":3115289,"Pop1985":3373532,"Pop1990":3376783,"Pop1995":3068751,"Pop2000":3042556,"Pop2005":2982904,"Group":"Europe & Central Asia","Cluster":1,"F1950":4.494,"F1955":4.494,"F1960":4.453,"F1965":3.447,"F1970":3.037,"F1975":2.503,"F1980":2.376,"F1985":2.575,"F1990":2.38,"F1995":1.75,"F2000":1.345,"F2005":1.388,"L1950":62.809,"L1955":64.928,"L1960":67.055,"L1965":69.211,"L1970":70.786,"L1975":70.595,"L1980":70.916,"L1985":68.408,"L1990":68.663,"L1995":70.377,"L2000":71.403,"L2005":71.965},
    {"Country":"Guatemala","Pop1955":3433887,"Pop1960":3975707,"Pop1965":4531949,"Pop1970":4950548,"Pop1975":5473584,"Pop1980":6064228,"Pop1985":6917947,"Pop1990":8001019,"Pop1995":9266312,"Pop2000":10625732,"Pop2005":12013907,"Group":"America","Cluster":3,"F1950":7,"F1955":6.6,"F1960":6.5,"F1965":6.3,"F1970":6.2,"F1975":6.2005,"F1980":6.1,"F1985":5.7005,"F1990":5.45,"F1995":5.0005,"F2000":4.6,"F2005":4.152,"L1950":42.023,"L1955":44.142,"L1960":46.954,"L1965":50.016,"L1970":53.738,"L1975":56.029,"L1980":58.137,"L1985":60.782,"L1990":63.373,"L1995":66.322,"L2000":68.978,"L2005":70.259},
    {"Country":"Guinea","Pop1955":2786879,"Pop1960":3028117,"Pop1965":3321330,"Pop1970":3661175,"Pop1975":4053377,"Pop1980":4508009,"Pop1985":5327721,"Pop1990":6278696,"Pop1995":7682082,"Pop2000":8638858,"Pop2005":9452670,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.9955,"F1955":6.9955,"F1960":6.9955,"F1965":6.9955,"F1970":6.9955,"F1975":6.9955,"F1980":6.9955,"F1985":6.8425,"F1990":6.4959,"F1995":6.1566,"F2000":5.8443,"F2005":5.436,"L1950":33.609,"L1955":34.558,"L1960":35.753,"L1965":37.197,"L1970":38.842,"L1975":40.762,"L1980":42.891,"L1985":45.552,"L1990":48.576,"L1995":51.455,"L2000":53.676,"L2005":56.007},
    {"Country":"Guinea-Bissau","Pop1955":591909,"Pop1960":616682,"Pop1965":603780,"Pop1970":620020,"Pop1975":680919,"Pop1980":789053,"Pop1985":885234,"Pop1990":995991,"Pop1995":1143057,"Pop2000":1278273,"Pop2005":1413446,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":5.583,"F1955":5.583,"F1960":5.99,"F1965":6.5,"F1970":7.1,"F1975":7.1,"F1980":7.1,"F1985":7.1,"F1990":7.1,"F1995":7.1,"F2000":7.1,"F2005":7.069,"L1950":32.5,"L1955":33.489,"L1960":34.488,"L1965":35.492,"L1970":36.486,"L1975":37.465,"L1980":39.327,"L1985":41.245,"L1990":43.266,"L1995":44.873,"L2000":45.504,"L2005":46.388},
    {"Country":"Guyana","Pop1955":491180,"Pop1960":571083,"Pop1965":640316,"Pop1970":714811,"Pop1975":767977,"Pop1980":759352,"Pop1985":758329,"Pop1990":750903,"Pop1995":747929,"Pop2000":755171,"Pop2005":765283,"Group":"America","Cluster":3,"F1950":6.68,"F1955":6.77,"F1960":6.15,"F1965":6.11,"F1970":4.9,"F1975":3.94,"F1980":3.26,"F1985":2.7,"F1990":2.55,"F1995":2.5,"F2000":2.4254,"F2005":2.3338,"L1950":52.31,"L1955":54.815,"L1960":57.32,"L1965":59.187,"L1970":59.958,"L1975":60.651,"L1980":60.923,"L1985":61.79,"L1990":62.531,"L1995":62.06,"L2000":63.578,"L2005":66.827},
    {"Country":"Haiti","Pop1955":3376419,"Pop1960":3722743,"Pop1965":4137405,"Pop1970":4604915,"Pop1975":4828338,"Pop1980":5029725,"Pop1985":5517977,"Pop1990":6126101,"Pop1995":6675578,"Pop2000":7306302,"Pop2005":8121622,"Group":"America","Cluster":3,"F1950":6.3,"F1955":6.3,"F1960":6.3,"F1965":6,"F1970":5.6005,"F1975":5.8,"F1980":6.2099,"F1985":5.69985,"F1990":5.14985,"F1995":4.61995,"F2000":4,"F2005":3.5445,"L1950":37.579,"L1955":40.696,"L1960":43.59,"L1965":46.243,"L1970":48.042,"L1975":49.923,"L1980":51.461,"L1985":53.636,"L1990":55.089,"L1995":56.671,"L2000":58.137,"L2005":60.916},
    {"Country":"Honduras","Pop1955":1662219,"Pop1960":1951640,"Pop1965":2329159,"Pop1970":2760666,"Pop1975":2857540,"Pop1980":3401940,"Pop1985":4076514,"Pop1990":4792271,"Pop1995":5546185,"Pop2000":6347658,"Pop2005":7167902,"Group":"America","Cluster":3,"F1950":7.497,"F1955":7.497,"F1960":7.418,"F1965":7.421,"F1970":7.05,"F1975":6.6,"F1980":5.9995,"F1985":5.37,"F1990":4.916,"F1995":4.3005,"F2000":3.723,"F2005":3.308,"L1950":41.912,"L1955":44.665,"L1960":48.041,"L1965":50.924,"L1970":53.884,"L1975":57.402,"L1980":60.909,"L1985":64.492,"L1990":66.399,"L1995":67.659,"L2000":68.565,"L2005":70.198},
    {"Country":"Madagascar","Pop1955":5002657,"Pop1960":5481721,"Pop1965":6070004,"Pop1970":6765644,"Pop1975":7603790,"Pop1980":8676821,"Pop1985":9981292,"Pop1990":11522099,"Pop1995":13340359,"Pop2000":15506472,"Pop2005":18040341,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.8,"F1955":6.8,"F1960":6.8,"F1965":6.8,"F1970":6.7,"F1975":6.6,"F1980":6.4,"F1985":6.3,"F1990":6.124,"F1995":5.801,"F2000":5.278,"F2005":4.776,"L1950":36.681,"L1955":38.865,"L1960":40.848,"L1965":42.881,"L1970":44.851,"L1975":46.881,"L1980":48.969,"L1985":49.35,"L1990":52.214,"L1995":54.978,"L2000":57.286,"L2005":59.443},
    {"Country":"Malawi","Pop1955":3088155,"Pop1960":3450444,"Pop1965":3914095,"Pop1970":4489313,"Pop1975":5267679,"Pop1980":6129035,"Pop1985":7123455,"Pop1990":9286655,"Pop1995":9912344,"Pop2000":11258163,"Pop2005":12707464,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.78,"F1955":6.84,"F1960":7,"F1965":7.2,"F1970":7.4,"F1975":7.6,"F1980":7.488,"F1985":7.159,"F1990":6.763,"F1995":6.44,"F2000":6.032,"F2005":5.593,"L1950":36.256,"L1955":37.207,"L1960":38.41,"L1965":39.487,"L1970":41.766,"L1975":43.767,"L1980":45.642,"L1985":47.457,"L1990":49.42,"L1995":47.495,"L2000":45.009,"L2005":48.303},
    {"Country":"Malaysia","Pop1955":7311720,"Pop1960":8428493,"Pop1965":9647654,"Pop1970":10910216,"Pop1975":12267303,"Pop1980":13764352,"Pop1985":15545028,"Pop1990":17503607,"Pop1995":19611116,"Pop2000":21793293,"Pop2005":23953136,"Group":"East Asia & Pacific","Cluster":4,"F1950":6.833,"F1955":6.944,"F1960":6.724,"F1965":5.941,"F1970":5.15,"F1975":4.161,"F1980":4.242,"F1985":3.996,"F1990":3.47,"F1995":3.1,"F2000":2.8745,"F2005":2.5972,"L1950":48.463,"L1955":52.102,"L1960":55.737,"L1965":59.371,"L1970":63.01,"L1975":65.256,"L1980":68,"L1985":69.5,"L1990":70.693,"L1995":71.938,"L2000":73.044,"L2005":74.241},
    {"Country":"Saudi Arabia","Pop1955":4243218,"Pop1960":4718301,"Pop1965":5327432,"Pop1970":6109051,"Pop1975":7204820,"Pop1980":9999161,"Pop1985":13330067,"Pop1990":16060761,"Pop1995":19966998,"Pop2000":23153090,"Pop2005":26417599,"Group":"Middle East & North Africa","Cluster":5,"F1950":7.175,"F1955":7.175,"F1960":7.257,"F1965":7.257,"F1970":7.298,"F1975":7.278,"F1980":7.015,"F1985":6.217,"F1990":5.446,"F1995":4.621,"F2000":3.81,"F2005":3.352,"L1950":39.875,"L1955":42.868,"L1960":45.914,"L1965":49.901,"L1970":53.886,"L1975":58.69,"L1980":63.012,"L1985":66.295,"L1990":68.768,"L1995":70.533,"L2000":71.626,"L2005":72.777},
    {"Country":"Zambia","Pop1955":2869000,"Pop1960":3254000,"Pop1965":3694000,"Pop1970":4251612,"Pop1975":4923730,"Pop1980":5699777,"Pop1985":6779477,"Pop1990":7941694,"Pop1995":9001866,"Pop2000":10116606,"Pop2005":11261795,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.75,"F1955":6.9,"F1960":7.15,"F1965":7.4,"F1970":7.425,"F1975":7.375,"F1980":6.95,"F1985":6.658,"F1990":6.28,"F1995":5.999,"F2000":5.648,"F2005":5.176,"L1950":42.038,"L1955":44.077,"L1960":46.023,"L1965":47.768,"L1970":50.107,"L1975":51.386,"L1980":51.821,"L1985":50.821,"L1990":46.1,"L1995":40.238,"L2000":39.193,"L2005":42.384},
    {"Country":"Zimbabwe","Pop1955":3409017,"Pop1960":4010933,"Pop1965":4685272,"Pop1970":5514536,"Pop1975":6341797,"Pop1980":7169968,"Pop1985":8560378,"Pop1990":10152933,"Pop1995":11111992,"Pop2000":11751323,"Pop2005":12160782,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.8,"F1955":7,"F1960":7.3,"F1965":7.4,"F1970":7.4,"F1975":7.3,"F1980":6.74,"F1985":5.656,"F1990":4.773,"F1995":4.054,"F2000":3.563,"F2005":3.186,"L1950":48.451,"L1955":50.469,"L1960":52.358,"L1965":53.995,"L1970":55.635,"L1975":57.674,"L1980":60.363,"L1985":62.351,"L1990":60.377,"L1995":46.809,"L2000":39.989,"L2005":43.487}];

var dataset = [];
for (var j = 0;j<data.length;j++){
    dataset[j] = [];
    dataset[j] = {"heights":[],"label":data[j].Country};
    var pts = [];
    pts[0] = data[j].Pop1955;
    pts[1] = data[j].Pop1960;
    pts[2] = data[j].Pop1965;
    pts[3] = data[j].Pop1970;
    pts[4] = data[j].Pop1975;
    pts[5] = data[j].Pop1980;
    pts[6] = data[j].Pop1985;
    pts[7] = data[j].Pop1990;
    pts[8] = data[j].Pop1995;
    pts[9] = data[j].Pop2000;
    pts[10] = data[j].Pop2005;
    dataset[j].heights = pts;
}
var labels = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000","2005"]; //Hard coded years for view labels*/
dataset = [{"label":"Australia","heights":[150,130,120,133,120,100,120,160,175,160]},
{"label":"Brazil","heights":[160,142,135,125,110,100,156,165,170,175]},
{"label":"Canada","heights":[110,120,130,135,139,154,160,145,140,122]},
{"label":"3","heights":[110,115,120,130,120,110,80,120,130,160]},
{"label":"4","heights":[100,80,100,120,110,100,112,120,130,145]},
{"label":"Iran","heights":[60,75,75,75,75,90,100,120,120,150]}, //Ambiguous
{"label":"6","heights":[80,140,120,140,130,100,130,135,137,175]},
{"label":"7","heights":[80,92,115,130,130,130,120,100,100,100]},//Ambiguous
{"label":"8","heights":[90,70,65,55,45,30,40,50,87,95]},
{"label":"Portugal","heights":[89,76.71,76.71,82.19,87.67,84.93,79.45,87.67,87.67,93.15,93.15,93.15,93.15]}, //Ambiguous
{"label":"United Kingdom","heights":[100,115,100,119,95,80,70,100,115,119]},
{"label":"United States","heights":[150,165,175,185,193,199,180,170,150,120]}];

var labels = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000"];