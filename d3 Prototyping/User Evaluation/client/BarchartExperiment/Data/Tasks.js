/**
 * Task descriptions to complete for the bar chart experiment,
 * dimpVis tasks are at index 0, time slider tasks are 1
 */

//Task array entry format: [datasetNumber, taskId, taskType, techniqueType, description, objectType, ambiguity , barIndices, solution]
//Codes:
// datasetNumber: 0 - set 1, 1 - set 2 and 2 - set 3
// techniqueType: the type of technique the task is assigned to (0 - dimp, 1 - slider and 2 - multiples)
// taskId: unique id assigned to each task (go from 0 to number of tasks)
// taskType: 0 - retrieve value, 1 - distribution
// task description: text explaining what to do for the task
// objectType: 0 - Single object, 1 - Multiple objects
// ambiguity: 0 -  nonAmbigous, 1 - ambiguous
// barIndices: one or two indices of the bars involved in the task
// solution: the solution (view index) to the task
// type of distribution image (for DI-MO tasks ONLY, just to decide which helper image to use): 0 if orange inc-dec and green dec-inc
//                                                                                              1 if orange dec-inc and green inc-dec

var tasks = [
    [
        //Objective
        [0,0,0,0,"When is A at 100?",0,0,[0],5],
        [2,0,2,0,"When is A less than 120?",0,0,[2],5],
        [0,0,3,0,"When is A greater than 160?",0,0,[6],6],
        [2,0,5,0,"When is A equal to B?",1,0,[11,8],9],
        [0,0,7,0,"When is A shorter than B?",1,0,[11,6],9],
        [1,0,6,0,"When is A taller than B?",1,0,[2,6],8],
        [1,0,11,1,"When does the height of A change from decreasing to increasing?",0,0,[1],5],
        [2,0,12,1,"When does the height of A change from increasing to decreasing?",0,0,[0],4],
        [1,0,31,1,"When does the height of A change from increasing to decreasing?",0,0,[5],7],
        /**[3,0,18,1,"When does the height of the orange bar change from <span style='color:#D95F02'> increasing to decreasing </span>" +
            " <span style='font-weight:bold'>AND</span> the height of the green bar change from <span style='color:#1B9E77'>decreasing to increasing</span>?",1,0,[10,7],8,0],*/
        [3,0,16,1,"When do the heights of A <span style='font-weight:bold'>AND</span> B change from decreasing to increasing?",1,0,[9,5],8],
        [3,0,17,1,"When do the heights of A <span style='font-weight:bold'>AND</span> B change from increasing to decreasing?",1,0,[4,1],7],
        [3,0,18,1,"When does the height of A change from increasing to decreasing" +
            " <span style='font-weight:bold'>AND</span> the height of B change from decreasing to increasing?",1,0,[10,7],8,0],

        //Objective - Ambiguous
        [4,0,62,0,"When is A less than 100?",0,1,[4],4],
        [4,0,63,0,"When is A at 120?",0,1,[2],6],
        [4,0,60,0,"When is A greater than 160?",0,1,[0],9],
        [4,0,69,1,"When does the height of A change from increasing to decreasing?",0,1,[1],6],
        [4,0,70,1,"When does the height of A change from decreasing to increasing?",0,1,[12],6],
        [4,0,76,1,"When does the height of A change from increasing to decreasing?",0,1,[11],8],

        //Practice
        [5,0,78,0,"When is A at 80?",0,0,[0],3],
        [5,0,79,0,"When is A less than 40?",0,0,[8],5],
        [5,0,80,0,"When is A greater than 120?",0,0,[3],5],
        [5,0,81,0,"When is A shorter than the green bar?",1,0,[10,8],7],
        [5,0,82,0,"When is A equal to B?",1,0,[3,8],8],
        [5,0,83,0,"When is A taller than B?",1,0,[5,7],4],
        [5,0,84,1,"When does the height of A change from increasing to decreasing?",0,0,[1],3],
        [5,0,85,1,"When does the height of A change from increasing to decreasing?",0,0,[5],3],
        [5,0,86,1,"When does the height of A change from decreasing to increasing?",0,0,[2],4],
        [5,0,87,1,"When do the heights of A <span style='font-weight:bold'>AND</span> B change from decreasing to increasing?",1,0,[11,1],6],
        [5,0,88,1,"When do the heights of A <span style='font-weight:bold'>AND</span> B change from increasing to decreasing?",1,0,[9,4],7],
        [5,0,89,1,"When does the height of A change from decreasing to increasing" +
            " <span style='font-weight:bold'>AND</span> the height of B from increasing to decreasing?",1,0,[12,2],7,1],
        /**
        [5,0,89,1,"When does the height of the orange bar change from <span style='color:#D95F02'>decreasing to increasing </span>" +
            " <span style='font-weight:bold'>AND</span> the height of the green bar change from <span style='color:#1B9E77'>increasing to decreasing</span>?",1,0,[12,2],7,1],*/

        //Practice - Ambiguous
        [6,0,114,0,"When is A less than 60?",0,1,[5],7],
        [6,0,115,0,"When is A at 120?",0,1,[3],6],
        [6,0,116,1,"When does the height of A change from increasing to decreasing?",0,1,[7],5],
        [6,0,117,1,"When does the height of A change from decreasing to increasing?",0,1,[9],6]

    ], //Tasks for dimpvis

    [
        //Objective
        [0,1,20,0,"When is A at 40?",0,0,[12],5],
        [1,1,21,0,"When is A less than 80?",0,0,[7],5],
        [2,1,22,0,"When is A greater than 140?",0,0,[9],6],
        [0,1,25,0,"When is A taller than B?",1,0,[4,2],9],
        [1,1,26,0,"When is A equal to B",1,0,[3,12],8],
        [2,1,27,0,"When is A shorter than B?",1,0,[12,4],9],
        [0,1,30,1,"When does the height of A change from decreasing to increasing?",0,0,[1],5],
        [2,1,33,1,"When does the height of A change from increasing to decreasing?",0,0,[3],4],
        [2,1,32,1,"When does the height of A change from decreasing to increasing?",0,0,[0],7],
        [3,1,35,1,"When do the heights of A <span style='font-weight:bold'>AND</span> B change from increasing to decreasing?",1,0,[5,0],7],
        [3,1,36,1,"When do the heights of A <span style='font-weight:bold'>AND</span> B change from decreasing to increasing?",1,0,[4,0],8],
        [3,1,38,1,"When does the height of A change from increasing to decreasing" +
            "<span style='font-weight:bold'>AND</span> the height of B change from decreasing to increasing?",1,0,[12,8],8,0],

        //Objective - Ambiguous
        [4,1,64,0,"When is A less than 120?",0,1,[5],9],
        [4,1,65,0,"When is A greater than 90?",0,1,[8],6],
        [4,1,61,0,"When is A at 140?",0,1,[7],4],
        [4,1,72,1,"When does the height of A change from increasing to decreasing?",0,1,[6],6],
        [4,1,73,1,"When does the height of A change from increasing to decreasing?",0,1,[3],6],
        [4,1,74,1,"When does the height of A change from decreasing to increasing?",0,1,[10],8],

        //Practice
        [5,1,90,0,"When is A greater than 140?",0,0,[0],8],
        [5,1,91,0,"When is A at 60?",0,0,[8],3],
        [5,1,92,0,"When is A less than 80?",0,0,[10],4],
        [5,1,93,0,"When is A equal to the green bar?",1,0,[0,8],9],
        [5,1,94,0,"When is A shorter than B?",1,0,[7,10],4],
        [5,1,95,0,"When is A taller than B?",1,0,[5,2],4],
        [5,1,96,1,"When does the height of A change from decreasing to increasing?",0,0,[1],6],
        [5,1,97,1,"When does the height of A change from increasing to decreasing?",0,0,[4],7],
        [5,1,98,1,"When does the height of A change from decreasing to increasing?",0,0,[0],3],
        [5,1,99,1,"When do the heights of A <span style='font-weight:bold'>AND</span> B change from decreasing to increasing?",1,0,[9,4],8],
        [5,1,100,1,"When do the heights of the orange <span style='font-weight:bold'>AND</span> B change from increasing to decreasing?",1,0,[11,0],8],
        [5,1,101,1,"When does the height of A change from increasing to decreasing" +
            "<span style='font-weight:bold'>AND</span> the height of the green bar change from decreasing to increasing?",1,0,[12,2],4,0]
    ], //Tasks for time slider

    [
        //Objective
        [2,2,24,0,"When is A at 160?",0,0,[7],5],
        [1,2,42,0,"When is A greater than 100?",0,0,[11],5],
        [2,2,44,0,"When is A less than 80?",0,0,[4],6],
        [0,2,48,0,"When is A taller than B?",1,0,[4,11],9],
        [0,2,47,0,"When is A equal to B?",1,0,[3,0],8],
        [0,2,49,0,"When is A shorter than B?",1,0,[1,12],9],
        [1,2,52,1,"When does the height of A change from increasing to decreasing?",0,0,[0],5],
        [2,2,53,1,"When does the height of A change from decreasing to increasing?",0,0,[10],4],
        [1,2,34,1,"When does the height of A change from decreasing to increasing?",0,0,[12],7],
        [3,2,56,1,"When do the heights of A <span style='font-weight:bold'>AND</span> B change from decreasing to increasing?",1,0,[1,4],8],
        [3,2,59,1,"When does the height of A change from increasing to decreasing" +
            " <span style='font-weight:bold'>AND</span> the height of B change from decreasing to increasing",1,0,[3,5],8],
        [3,2,57,1,"When do the heights of A <span style='font-weight:bold'>AND</span> B change from increasing to decreasing?",1,0,[8,5],7,0],

        //Objective - Ambiguous
        [4,2,66,0,"When is A at 140?",0,1,[1],4],
        [4,2,67,0,"When is A greater than 160?",0,1,[4],9],
        [4,2,68,0,"When is A less than 120?",0,1,[11],6],
        [4,2,75,1,"When does the height of A change from decreasing to increasing?",0,1,[3],8],
        [4,2,77,1,"When does the height of A change from increasing to decreasing?",0,1,[9],6],
        [4,2,71,1,"When does the height of A change from increasing to decreasing?",0,1,[8],6],

        //Practice
        [5,2,102,0,"When is A at 120?",0,0,[0],6],
        [5,2,103,0,"When is A greater than 120?",0,0,[8],9],
        [5,2,104,0,"When is A less than 60?",0,0,[3],3],
        [5,2,105,0,"When is A equal to the green bar?",1,0,[8,10],9],
        [5,2,106,0,"When is A shorter than the green bar?",1,0,[7,3],4],
        [5,2,107,0,"When is A taller than the green bar?",1,0,[5,10],4],
        [5,2,108,1,"When does the height of A change from increasing to decreasing?",0,0,[2],7],
        [5,2,109,1,"When does the height of A change from increasing to decreasing?",0,0,[6],4],
        [5,2,110,1,"When does the height of A change from decreasing to increasing?",0,0,[8],5],
        [5,2,111,1,"When do the heights of A <span style='font-weight:bold'>AND</span> B change from decreasing to increasing?",1,0,[9,2],2],
        [5,2,112,1,"When do the heights of A <span style='font-weight:bold'>AND</span> B change from increasing to decreasing?",1,0,[12,3],8],
        [5,2,113,1,"When does the height of A change from decreasing to increasing" +
            " <span style='font-weight:bold'>AND</span> the height of B change from increasing to decreasing?",1,0,[11,1],3,1]

    ] //Tasks for multiples
];
