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

var objectiveTasks = [
    [

        [0,0,0,0,"When is the orange bar at 100?",0,0,[0],5],
        [1,0,1,0,"When is the orange bar greater than 140?",0,0,[9],7],
        [2,0,2,0,"When is the orange bar less than 120?",0,0,[2],5],
        [0,0,3,0,"When is the orange bar greater than 160?",0,0,[6],9],
        [1,0,4,0,"When is the orange bar at 165?",0,0,[3],5],
        [2,0,5,0,"Find the moment when the orange bar is equal to the green bar",1,0,[11,8],9],
        [1,0,6,0,"Find the moment when the orange bar is taller than the green bar",1,0,[2,6],7],
        [0,0,7,0,"Find the moment when the orange bar is shorter than the green bar",1,0,[11,6],9],
        [2,0,8,0,"Find the moment when the orange bar is taller than the green bar",1,0,[4,9],9],
        [1,0,9,0,"Find the moment when the orange bar is shorter than the green bar",1,0,[7,4],9],
        [0,0,10,1,"When does the height of the orange bar change from increasing to decreasing?",0,0,[2],6],
        [1,0,11,1,"When does the height of the orange bar change from decreasing to increasing?",0,0,[1],5],
        [2,0,12,1,"When does the height of the orange bar change from increasing to decreasing?",0,0,[0],4],
        [0,0,13,1,"When does the height of the orange bar change from decreasing to increasing?",0,0,[12],5],
        [1,0,14,1,"When does the height of the orange bar change from increasing to decreasing?",0,0,[6],5],
        [2,0,15,1,"Find the moment when the height of both the orange bar and the green bar change from decreasing to increasing",1,0,[5,0],7],
        [1,0,16,1,"Find the moment when the height of both the orange bar and the green bar change from increasing to decreasing",1,0,[11,5],7],
        [0,0,17,1,"Find the moment when the height of both the orange bar and the green bar change from increasing to decreasing",1,0,[9,7],5],
        [1,0,18,1,"Find the moment when the height of the orange bar changes from increasing to decreasing AND the height of the green bar changes from decreasing to increasing",1,0,[10,4],5],
        [2,0,19,1,"Find the moment when the height of the orange bar changes from decreasing to increasing AND the height of the green bar changes from increasing to decreasing",1,0,[1,5],4],

        [3,0,60,0,"When is the orange bar greater than 150?",0,1,[0],5],
        [3,0,61,0,"When is the orange bar at 120?",0,1,[3],4],
        [3,0,62,0,"When is the orange bar less than 100?",0,1,[2],9],
        [3,0,63,0,"When is the orange bar at 140?",0,1,[7],4],
        [3,0,64,0,"When is the orange bar less than 100?",0,1,[4],4]


    ], //Tasks for dimpvis

    [

        [0,1,20,0,"When is the orange bar at 40?",0,0,[12],6],
        [1,1,21,0,"When is the orange bar less than 80?",0,0,[7],5],
        [2,1,22,0,"When is the orange bar greater than 140?",0,0,[9],6],
        [0,1,23,0,"When is the orange bar less than 100?",0,0,[3],6],
        [2,1,24,0,"When is the orange bar at 150?",0,0,[7],5],
        [0,1,25,0,"Find the moment when the orange bar is taller than the green bar",1,0,[4,2],9],
        [1,1,26,0,"Find the moment when the orange bar is equal to the green bar",1,0,[3,12],8],
        [2,1,27,0,"Find the moment when the orange bar is shorter than the green bar",1,0,[12,4],5],
        [1,1,28,0,"Find the moment when the orange bar is shorter than the green bar",1,0,[9,2],9],
        [2,1,29,0,"Find the moment when the orange bar is taller than the green bar",1,0,[1,7],9],
        [0,1,30,1,"When does the height of the orange bar change from decreasing to increasing?",0,0,[1],5],
        [1,1,31,1,"When does the height of the orange bar change from increasing to decreasing?",0,0,[5],7],
        [2,1,32,1,"When does the height of the orange bar change from decreasing to increasing?",0,0,[0],7],
        [2,1,33,1,"When does the height of the orange bar change from increasing to decreasing?",0,0,[3],4],
        [1,1,34,1,"When does the height of the orange bar change from decreasing to increasing?",0,0,[12],7],
        [2,1,35,1,"Find the moment when the height of both the orange bar and the green bar change from increasing to decreasing",1,0,[12,9],6],
        [1,1,36,1,"Find the moment when the height of the orange bar changes from decreasing to increasing AND the height of the green bar changes from increasing to decreasing",1,0,[8,10],7],
        [0,1,37,1,"Find the moment when the height of both the orange bar and the green bar change from decreasing to increasing",1,0,[7,5],8],
        [0,1,38,1,"Find the moment when the height of the orange bar changes from increasing to decreasing AND the height of the green bar changes from decreasing to increasing",1,0,[5,9],7],
        [1,1,39,1,"Find the moment when the height of both the orange bar and the green bar change from decreasing to increasing",1,0,[4,1],5],

        [3,1,65,0,"When is the orange bar greater than 120?",0,1,[12],5],
        [3,1,66,0,"When is the orange bar at 150?",0,1,[2],4],
        [3,1,67,0,"When is the orange bar less than 120?",0,1,[5],9],
        [3,1,68,0,"When is the orange bar greater than 90?",0,1,[8],6],
        [3,1,69,0,"When is the orange bar at 140?",0,1,[6],5]


    ], //Tasks for time slider

    [

        [0,2,40,0,"When is the orange bar greater than 180?",0,0,[1],9],
        [1,2,41,0,"When is the orange bar less than 20?",0,0,[5],4],
        [1,2,42,0,"When is the orange bar at 100?",0,0,[11],5],
        [2,2,43,0,"When is the orange bar at 90?",0,0,[6],4],
        [2,2,44,0,"When is the orange bar less than 80?",0,0,[4],6],
        [2,2,45,0,"Find the moment when the orange bar is shorter than the green bar",1,0,[6,3],4],
        [1,2,46,0,"Find the moment when the orange bar is taller than the green bar",1,0,[11,9],9],
        [0,2,47,0,"Find the moment when the orange bar is equal to the green bar",1,0,[3,0],9],
        [0,2,48,0,"Find the moment when the orange bar is taller than the green bar",1,0,[12,4],9],
        [0,2,49,0,"Find the moment when the orange bar is shorter than the green bar",1,0,[1,12],9],
        [0,2,50,1,"When does the height of the orange bar change from increasing to decreasing?",0,0,[8],8],
        [0,2,51,1,"When does the height of the orange bar change from decreasing to increasing?",0,0,[3],6],
        [1,2,52,1,"When does the height of the orange bar change from increasing to decreasing?",0,0,[0],5],
        [2,2,53,1,"When does the height of the orange bar change from decreasing to increasing?",0,0,[10],4],
        [2,2,54,1,"When does the height of the orange bar change from increasing to decreasing?",0,0,[11],5],
        [2,2,55,1,"Find the moment when the height of the orange bar changes from increasing to decreasing AND the height of the green bar changes from decreasing to increasing",1,0,[5,10],4],
        [2,2,56,1,"Find the moment when the height of both the orange bar and the green bar change from increasing to decreasing",1,0,[8,2],8],
        [1,2,57,1,"Find the moment when the height of both the orange bar and the green bar change from increasing to decreasing",1,0,[8,0],5],
        [0,2,58,1,"Find the moment when the height of both the orange bar and the green bar change from decreasing to increasing",1,0,[10,4],6],
        [0,2,59,1,"Find the moment when the height of the orange bar changes from decreasing to increasing AND the height of the green bar changes from increasing to decreasing",1,0,[8,11],6],

        [3,2,70,0,"When is the orange bar less than 90?",0,1,[10],5],
        [3,2,71,0,"When is the orange bar at 120?",0,1,[9],4],
        [3,2,72,0,"When is the orange bar at 130?",0,1,[1],4],
        [3,2,73,0,"When is the orange bar greater than 160?",0,1,[4],9],
        [3,2,74,0,"When is the orange bar less than 120?",0,1,[11],6]

    ] //Tasks for multiples
];

