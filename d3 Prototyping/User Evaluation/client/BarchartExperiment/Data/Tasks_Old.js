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

//Warm-up tasks (24 regular tasks + 4 ambiguous = 28 total tasks)
var warmUpTasks = [
        //Retrieve value tasks
        //Object-centric
        ["When is the orange bar at 100?",0,0,[0],5],
        ["When is the orange bar greater than 160?",0,0,[6],9],
        ["When is the orange bar less than 100?",0,0,[3],6],
        ["When is the orange bar at 40?",0,0,[12],6],
        ["When is the orange bar greater than 180?",0,0,[1],9],
        ["When is the orange bar at 40?",0,0,[12],6],
        //Ambiguous
        ["When is the orange bar greater than 180?",0,0,[1],9],
        ["When is the orange bar at 40?",0,0,[12],6],

        //Multiple values
        ["Find the moment when the orange bar is shorter than the green bar",1,0,[11,6],9],
        ["Find the moment when the orange bar is equal to the green bar",1,0,[3,0],9],
        ["Find the moment when the orange bar is taller than the green bar",1,0,[4,2],9],
        ["Find the moment when the orange bar is equal to the green bar",1,0,[3,0],9],
        ["Find the moment when the orange bar is shorter than the green bar",1,0,[1,12],9],
        ["Find the moment when the orange bar is equal to the green bar",1,0,[3,0],9],

        //Distribution tasks
        //Object-centric
        ["When does the height of the orange bar change from increasing to decreasing?",0,0,[2],6],
        ["When does the height of the orange bar change from decreasing to increasing?",0,0,[1],5],
        ["When does the height of the orange bar change from decreasing to increasing?",0,0,[12],5],
        ["When does the height of the orange bar change from increasing to decreasing?",0,0,[8],8],
        ["When does the height of the orange bar change from decreasing to increasing?",0,0,[3],6],
        ["When does the height of the orange bar change from increasing to decreasing?",0,0,[8],8],
        //Ambiguous
        ["When does the height of the orange bar change from increasing to decreasing?",0,0,[2],6],
        ["When does the height of the orange bar change from decreasing to increasing?",0,0,[1],5],


        //Multiple values
        ["Find the moment when the height of both the orange bar and the green bar change from decreasing to increasing",1,0,[10,4],6],
        ["Find the moment when the height of the orange bar changes from decreasing to increasing AND the height of the green bar changes from increasing to decreasing",1,0,[8,11],6],
        ["Find the moment when the height of both the orange bar and the green bar change from decreasing to increasing",1,0,[7,5],8],
        ["Find the moment when the height of the orange bar changes from increasing to decreasing AND the height of the green bar changes from decreasing to increasing",1,0,[5,9],7],
        ["Find the moment when the height of both the orange bar and the green bar change from increasing to decreasing",1,0,[9,7],5],
        ["Find the moment when the height of the orange bar changes from decreasing to increasing AND the height of the green bar changes from increasing to decreasing",1,0,[8,11],6]
];
//Tasks for the modified sugar consumption data set
/**var objectiveTasks = [
    [
        //Retrieve value tasks
        //Object-centric
        ["When is the orange bar at 100?",0,0,[0],5],
        ["When is the orange bar greater than 160?",0,0,[6],9],
        ["When is the orange bar less than 100?",0,0,[3],6],
        ["When is the orange bar at 40?",0,0,[12],6],
        ["When is the orange bar greater than 180?",0,0,[1],7],

        //Multiple values
        ["Find the moment when the orange bar is shorter than the green bar",1,0,[11,6],9],
        ["Find the moment when the orange bar is equal to the green bar",1,0,[3,0],9],
        ["Find the moment when the orange bar is taller than the green bar",1,0,[4,2],9],
        ["Find the moment when the orange bar is taller than the green bar",1,0,[12,4],9],
        ["Find the moment when the orange bar is shorter than the green bar",1,0,[1,12],9],

        //Distribution tasks
        //Object-centric
        ["When does the height of the orange bar change from increasing to decreasing?",0,0,[2],6],
        ["When does the height of the orange bar change from decreasing to increasing?",0,0,[1],5],
        ["When does the height of the orange bar change from decreasing to increasing?",0,0,[12],5],
        ["When does the height of the orange bar change from increasing to decreasing?",0,0,[8],8],
        ["When does the height of the orange bar change from decreasing to increasing?",0,0,[3],6],

        //Multiple values
        ["Find the moment when the height of both the orange bar and the green bar change from decreasing to increasing",1,0,[10,4],6],
        ["Find the moment when the height of the orange bar changes from decreasing to increasing AND the height of the green bar changes from increasing to decreasing",1,0,[8,11],6],
        ["Find the moment when the height of the orange bar changes from increasing to decreasing AND the height of the green bar changes from decreasing to increasing",1,0,[5,9],7],
        ["Find the moment when the height of both the orange bar and the green bar change from decreasing to increasing",1,0,[7,5],8],
        ["Find the moment when the height of both the orange bar and the green bar change from increasing to decreasing",1,0,[9,7],5]

    ], //Tasks for dimpvis

    [


    ], //Tasks for time slider

    [

    ] //Tasks for multiples
];//Set 1*/

/**var objectiveTasks = [
    [
        //Retrieve value tasks
        //Object-centric

        ["When is the orange bar at 165?",0,0,[3],5],
        ["When is the orange bar greater than 140?",0,0,[9],7],
        ["When is the orange bar less than 20?",0,0,[5],4],
        ["When is the orange bar at 100?",0,0,[11],5],
        ["When is the orange bar less than 80?",0,0,[7],5],

        //Multiple values

        ["Find the moment when the orange bar is equal to the green bar",1,0,[3,12],8],
        ["Find the moment when the orange bar is taller than the green bar",1,0,[2,6],7],
        ["Find the moment when the orange bar is taller than the green bar",1,0,[11,9],9],
        ["Find the moment when the orange bar is shorter than the green bar",1,0,[9,2],9],
        ["Find the moment when the orange bar is shorter than the green bar",1,0,[7,4],9],

        //Distribution tasks
        //Object-centric
        ["When does the height of the orange bar change from increasing to decreasing?",0,0,[5],7],
        ["When does the height of the orange bar change from decreasing to increasing?",0,0,[1],5],
        ["When does the height of the orange bar change from decreasing to increasing?",0,0,[12],7],
        ["When does the height of the orange bar change from increasing to decreasing?",0,0,[6],5],
        ["When does the height of the orange bar change from increasing to decreasing?",0,0,[0],5],

        //Multiple values
        ["Find the moment when the height of both the orange bar and the green bar change from decreasing to increasing",1,0,[4,1],5],
        ["Find the moment when the height of the orange bar changes from decreasing to increasing AND the height of the green bar changes from increasing to decreasing",1,0,[8,10],7],
        ["Find the moment when the height of the orange bar changes from increasing to decreasing AND the height of the green bar changes from decreasing to increasing",1,0,[10,4],5],
        ["Find the moment when the height of both the orange bar and the green bar change from increasing to decreasing",1,0,[8,0],5],
        ["Find the moment when the height of both the orange bar and the green bar change from increasing to decreasing",1,0,[11,5],7]

    ], //Tasks for dimpvis

    [


    ], //Tasks for time slider

    [

    ] //Tasks for multiples
]; //Set 2

/**var objectiveTasks = [
    [
        //Retrieve value tasks
        //Object-centric
        ["When is the orange bar at 90?",0,0,[6],4],
        ["When is the orange bar greater than 140?",0,0,[9],6],
        ["When is the orange bar less than 120?",0,0,[2],5],
        ["When is the orange bar at 150?",0,0,[7],5],
        ["When is the orange bar less than 80?",0,0,[4],6],

        //Multiple values
        ["Find the moment when the orange bar is shorter than the green bar",1,0,[12,4],5],
        ["Find the moment when the orange bar is equal to the green bar",1,0,[11,8],9],
        ["Find the moment when the orange bar is taller than the green bar",1,0,[4,9],9],
        ["Find the moment when the orange bar is taller than the green bar",1,0,[1,7],9],
        ["Find the moment when the orange bar is shorter than the green bar",1,0,[6,3],4],

        //Distribution tasks
        //Object-centric
        ["When does the height of the orange bar change from increasing to decreasing?",0,0,[0],4],
        ["When does the height of the orange bar change from decreasing to increasing?",0,0,[0],7],
        ["When does the height of the orange bar change from decreasing to increasing?",0,0,[10],4],
       ["When does the height of the orange bar change from increasing to decreasing?",0,0,[11],5],
        ["When does the height of the orange bar change from increasing to decreasing?",0,0,[3],4],

        //Multiple values
        ["Find the moment when the height of both the orange bar and the green bar change from decreasing to increasing",1,0,[5,0],7],
        ["Find the moment when the height of the orange bar changes from decreasing to increasing AND the height of the green bar changes from increasing to decreasing",1,0,[1,5],4],
        ["Find the moment when the height of the orange bar changes from increasing to decreasing AND the height of the green bar changes from decreasing to increasing",1,0,[5,10],4],
        ["Find the moment when the height of both the orange bar and the green bar change from increasing to decreasing",1,0,[8,2],8],
        ["Find the moment when the height of both the orange bar and the green bar change from increasing to decreasing",1,0,[12,9],6]

    ], //Tasks for dimpvis

    [


    ], //Tasks for time slider

    [

    ] //Tasks for multiples
];//Set 3*/

//Ambiguous tasks
/**var objectiveTasks = [
 [
 //Retrieve value tasks
 //Object-centric
 ["When is the orange bar at 120?",0,0,[3],4],
 ["When is the orange bar greater than 150?",0,0,[0],5],
 ["When is the orange bar less than 120?",0,0,[11],6],
 ["When is the orange bar at 140?",0,0,[7],4],
 ["When is the orange bar less than 100?",0,0,[4],4],

 ["When is the orange bar at 140?",0,0,[6],5],
 ["When is the orange bar greater than 90?",0,0,[8],6],
 ["When is the orange bar less than 120?",0,0,[5],9],
 ["When is the orange bar at 150?",0,0,[2],4],
 ["When is the orange bar greater than 120?",0,0,[12],5],

 ["When is the orange bar at 120?",0,0,[9],4],
 ["When is the orange bar greater than 160?",0,0,[4],9],
 ["When is the orange bar less than 90?",0,0,[10],5],
 ["When is the orange bar at 130?",0,0,[1],4],
 ["When is the orange bar less than 100?",0,0,[2],9]

 //TODO:Distribution tasks
 //Object-centric
 ["When does the height of the orange bar change from increasing to decreasing?",0,0,[1],6],
 ["When does the height of the orange bar change from decreasing to increasing?",0,0,[12],6],
// ["When does the height of the orange bar change from decreasing to increasing?",0,0,[10],4],
// ["When does the height of the orange bar change from increasing to decreasing?",0,0,[11],5],
// ["When does the height of the orange bar change from increasing to decreasing?",0,0,[3],4],

 /**["When does the height of the orange bar change from increasing to decreasing?",0,0,[0],4],
 ["When does the height of the orange bar change from decreasing to increasing?",0,0,[0],7],
 ["When does the height of the orange bar change from decreasing to increasing?",0,0,[10],4],
 ["When does the height of the orange bar change from increasing to decreasing?",0,0,[11],5],
 ["When does the height of the orange bar change from increasing to decreasing?",0,0,[3],4],

 ["When does the height of the orange bar change from increasing to decreasing?",0,0,[0],4],
 ["When does the height of the orange bar change from decreasing to increasing?",0,0,[0],7],
 ["When does the height of the orange bar change from decreasing to increasing?",0,0,[10],4],
 ["When does the height of the orange bar change from increasing to decreasing?",0,0,[11],5],
 ["When does the height of the orange bar change from increasing to decreasing?",0,0,[3],4]

 ]
 ];//Set 4*/

var objectiveTasks = [
    [
        //Retrieve value tasks
        //Object-centric
        ["When is the orange bar at 120?",0,0,[3],4],
        ["When is the orange bar greater than 150?",0,0,[0],5],

        ["When is the orange bar at 140?",0,0,[6],5],
        ["When is the orange bar greater than 120?",0,0,[12],5],

        ["When is the orange bar at 120?",0,0,[9],4],
        ["When is the orange bar greater than 90?",0,0,[8],6],


      //Distribution tasks
      //Object-centric
      ["When does the height of the orange bar change from increasing to decreasing?",0,0,[1],6],
      ["When does the height of the orange bar change from decreasing to increasing?",0,0,[12],6],


    /**["When does the height of the orange bar change from increasing to decreasing?",0,0,[0],4],
       ["When does the height of the orange bar change from decreasing to increasing?",0,0,[0],7],


      ["When does the height of the orange bar change from increasing to decreasing?",0,0,[0],4],
      ["When does the height of the orange bar change from decreasing to increasing?",0,0,[0],7],


 ]
 ];//Set 4