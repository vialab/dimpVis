/**
 * Task descriptions to complete for the bar chart experiment,
 * dimpVis tasks are at index 0, time slider tasks are 1
 */
//Inner Array format - objective: [taskDescription,type(0 if single object, 1 if multiple objects), ambiguity (0 if ambiguous, 1 if non-ambiguous), index(ices) of bar(s) involed in the task, solution]
//Inner Array format - practice: technique: [taskDescription,type(0 if single object, 1 if multiple objects), index(ices) of bar(s) involed in the task]

var practiceTasks = [
    [
        ["",0,0,1]
    ], //Tasks for dimpvis

    [
        ["",0,0,1]
    ], //Tasks for detour

    [
        ["",0,0,1]
    ], //Tasks for time slider

    [
        ["",0,0,1]
    ] //Tasks for multiples
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
        ["When is the orange bar greater than 180?",0,0,[1],9],

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

var objectiveTasks = [
    [
        //Retrieve value tasks
        //Object-centric
        ["Find the moment when the orange bar is shorter than the green bar",1,0,[7,4],9],
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
        //Retrieve value tasks
        //Object-centric
        ["Find the moment when the orange bar is shorter than the green bar",1,0,[7,4],9],
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

    ], //Tasks for time slider

    [

    ] //Tasks for multiples
]; //Set 2