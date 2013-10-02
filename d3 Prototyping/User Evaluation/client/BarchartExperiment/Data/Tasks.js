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
var objectiveTasks = [
    [
        //Retrieve value tasks
        //Object-centric
        ["When is the orange bar at 100?",0,0,[0],5],
        ["When is the orange bar greater than 160?",0,0,[6],9],
        ["When is the orange bar less than 100?",0,0,[3],6],

        //Multiple values
        ["Find a moment when the orange bar is shorter than the green bar",1,0,[11,6],9],
        ["Find a moment when the orange bar is equal to the green bar",1,0,[3,0],9],
        ["Find a moment when the orange bar is taller than the green bar",1,0,[4,2],9],

        //Distribution tasks
        //Object-centric
        ["When does the height of the orange bar start to decrease?",0,0,[2],6],
        ["When does the height of the orange bar start to increase?",0,0,[1],5],

        //Multiple values
        ["Find a moment when the height of both the orange bar and the green bar start to increase",1,0,[10,4],6],
        ["Find a moment when the height of the orange bar starts to increase and the green bar starts to decrease",1,0,[9,11],6],
        /**["Find a moment when the height of the orange bar and the green bar start to increase",0,0,[1],0],
        ["Find a moment when the height of the orange bar starts to decrease and the green bar starts to increase",0,0,[1],0],
        ["Find a moment when the height of the orange bar starts to increase and the green bar starts to decrease",0,0,[1],0]*/

        //Add tasks for ambiguous cases
        //Retrieve value
        //Object-centric
        ["When is the orange bar at 150?",0,0,[5],9],
        ["When is the orange bar at 100?",0,0,[7],7]

    ], //Tasks for dimpvis

    [
        //Retrieve value tasks
        //Object-centric
        ["When is the orange bar at 100?",0,0,[0],5],
        ["When is the orange bar greater than 160?",0,0,[6],9],
        ["When is the orange bar less than 100?",0,0,[3],6],

        //Multiple values
        ["Find a moment when the orange bar is shorter than the green bar",1,0,[11,6],9],
        ["Find a moment when the orange bar is equal to the green bar",1,0,[3,0],9],
        ["Find a moment when the orange bar is taller than the green bar",1,0,[4,2],9],

        //Distribution tasks
        //Object-centric
        ["When does the height of the orange bar start to decrease?",0,0,[2],6],
        ["When does the height of the orange bar start to increase?",0,0,[1],5],

        //Multiple values
        ["Find a moment when the height of both the orange bar and the green bar start to increase",1,0,[10,4],6],
        ["Find a moment when the height of the orange bar starts to increase and the green bar starts to decrease",1,0,[9,11],6],

        //Add tasks for ambiguous cases
        //Retrieve value
        //Object-centric
        ["When is the orange bar at 150?",0,0,[5],9],
        ["When is the orange bar at 100?",0,0,[7],7]

    ], //Tasks for time slider

    [
        ["When is the orange bar at 3?",0,0,1,100]
    ] //Tasks for multiples
];