// The main file of time tracker. Contains actual 
// implementations of the following commands: 
// createProject, deleteProject, start project, 
// finish current project, output current project,
// signup (won't be used), report.

// All requests from Alexa are provided with the ID of the devise.
// that ID is used as the username

const assert = require('assert');
const mongoUtils = require('./mongoUtils.js');
const moment = require('moment-timezone');


const createProject =  function (username, title) {
    return mongoUtils.connectToDb(
        () => new Promise(async function (resolve, reject) {
            if(!username){
                reject("No username provided");
            }
            const db = await mongoUtils.getDb();
            var usr = await db.collection('userData').findOne({ "user.username": username});
            
            if (!usr){
                db.collection('userData').insertOne({ user: {username:username}, projectNames: [title], currentProject: null });
                resolve("Project created!");
                return;
            }
            if (usr.projectNames.includes(title)) {
                reject("Project title already taken");
                return;
            }
            db.collection('userData').updateOne({
                "user.username": 'username'
            }, {
                    $push: { projectNames: title }
                }).then((_) => {
                    resolve("Project created!");
            });
        })
    );
}

const computeTime = function(timeZone){
    const now = new Date();
    var mom = moment.tz(now,timeZone);
    const date = mom.format().substring(0,19) + "Z";
    return new Date(date);  
}



const addLog = function (username, activity, projectName, timeZone) {
    return mongoUtils.connectToDb(
        () => new Promise(async function (resolve, reject) {        
            assert(activity == 'start' || activity == 'end');
            const db = mongoUtils.getDb();
            const result = await db.collection('userData').findOne({ "user.username": username });
            if (!result){
                reject("To create a new log, create the activity first.");
                db.collection('userData').insertOne({ user: {username:username}, projectNames: [], currentProject: null });
                usr ={ user: {username:username}, projectNames: [], currentProject: null }
                return;
            }
            console.log(timeZone);
            if (result.projectNames.includes(projectName) || result.currentProject) {
                const date = computeTime(timeZone);
                if (activity == 'start') {

                    if (!result.currentProject) {
                        log = { user: username, projectName: projectName, start: date, finish: null,duration: null };
                        insertLogToDb(log);
                        setTimeZone(username,timeZone );
                        db.collection('userData').updateOne({ "user.username": username },
                            {
                                $set: {
                                    currentProject: projectName
                                }
                            }).then((suc) => resolve("Work on " + projectName + " started!")).catch((e) => console.log(e));
                    } else {
                        reject("You are already working on " + result.currentProject);
                    }
                } else {
                    if (result.currentProject) {
                        db.collection('userData').findOne({ "user.username": username }).then((result) => {
                            db.collection('logs').findOne({ projectName: result.currentProject, finish: null })
                                .then((log) => {
                                    const date = computeTime(timeZone);
                                    updateLog = { projectName: result.currentProject, finish: date, id: log._id, duration: subtractDates(log.start, result.timeZone)}
                                    updateLogInDb(updateLog);
                                    nullifyCurrentProject(username);
                                    resolve("Work on " + result.currentProject + " complete!");
                                }).catch((e) => console.log(e));
                        }).catch((e) => console.log(e));
                    } else {
                        reject("Work on this project has already been finished");
                    }
                }
            } else {
                reject("Either your work is complete or you are trying to work on non existing project");
            }
        })
    );
}





const insertLogToDb = (log) => {
    const db = mongoUtils.getDb();
    const addToCollection = db.collection('logs').insertOne(log);

    addToCollection.then((suc) => {
        console.log("DB updated");
    }).catch((e) => console.log(e));

}


const updateLogInDb = (log) => {
    const db = mongoUtils.getDb();

    db.collection('logs').updateOne({
        _id: log.id
    }, {
            $set: {
                finish: log.finish,
                duration: Number(log.duration)
            }
        }).then((suc) => console.log(suc))
        .catch((e) => console.log(e));
}

//
const nullifyCurrentProject = (username) => {
    const db = mongoUtils.getDb();
    db.collection('userData').updateOne({
        "user.username": username
    }, {
            $set: {
                currentProject: null
            }
        }).then((suc) => console.log("current project nulled"))
        .catch((e) => console.log(e))
}

const setTimeZone = (username,timeZone) => {
    const db = mongoUtils.getDb();
    db.collection('userData').updateOne({
        "user.username": username
    }, {
            $set: {
                timeZone: timeZone
            }
        }).then((suc) => console.log("current project nulled"))
        .catch((e) => console.log(e))
}


const removeProject = function (username, projectName) {
    return mongoUtils.connectToDb(
        () => new Promise(async function (resolve, reject) {
            if(!username){
                reject("User not found");
            }
            const db = mongoUtils.getDb();
            db.collection('userData').updateOne({
                "user.username": username
            }, {
                    $pull: {
                        projectNames: projectName
                    },
                    $set: {
                        currentProject: null,
                        finish:new Date()
                    }
                }).then((suc) => {
                    suc.matchedCount ==0 ? reject("You are new to time tracker. Create a project first")  :  
                    suc.modifiedCount >0 ? resolve("Project removed"): reject("Project does not exist");
                })
                .catch((e) => reject(e))
        })
    );
}

const listProjects = function (username) {
    return mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            if(!username){
                reject("User not provided");
            }
            const db = mongoUtils.getDb();
            db.collection('userData').findOne({ "user.username": username })
                .then(async function(suc) {
                    var result = [];
                    console.log(suc);
                    if (!suc){
                        await db.collection('userData').insertOne({ user: {username:username}, projectNames: [], currentProject: null });
                    } else {
                        result = suc.projectNames;
                    }
                    resolve(result);
                })
                .catch((e) => reject(e))
        })
    );
}

const subtractDates = function (date, timeZone){
    return Math.round((computeTime(timeZone) - date) / 60000);
}



const getLowerBound = function(timeZone,days){
    var d = computeTime(timeZone);
    d.setDate(d.getDate()-days);
    const daysAgo = new Date(d);
    console.log(daysAgo);
    return daysAgo;
}

const report = function (username, days) {
    return mongoUtils.connectToDb(
        () => new Promise(async function (resolve, reject) {
            if(!username){
                reject("Username empty");
                return;
            }
            const db = mongoUtils.getDb();
            var usr = await db.collection('userData').findOne({ "user.username": username});
            
            if (!usr){
                await db.collection('userData').insertOne({ user: {username:username}, projectNames: [], currentProject: null });
                usr ={ user: {username:username}, projectNames: [], currentProject: null }  
                resolve([]);
                return;
            }
            

            const daysAgo = getLowerBound(usr.timeZone, days);
            db.collection('logs').aggregate([
                {'$match': {
                    $and:[
                            {"start": { $gte: daysAgo } },               
                            {"user": { $eq: username} },
                            {"currentProject": {$exists:false} }
                       ]  
                   } },
                   {$group: {
                    _id : {
                        "day":{ $dayOfMonth: "$start"},
                        "month" : {$month: "$start"},
                        "projectName" :"$projectName",
                        
                    },
                    timeSpent:{ $sum: "$duration"},
                    workSessions:  { $push: {start:"$start",finish:"$finish", timeZone:"$timeZone", duration:"$duration"} }
                }},
                {$group: {
                    _id : "$_id.projectName",
                    totalTime: { $sum: "$timeSpent"},
                    // full: {$push: {
                    //     workSessions: "$workSessions"
                    // }},
                    brief:{$push: {
                        day: "$_id.day",
                        month: "$_id.month",
                        timeSpent: {$sum: "$workSessions.duration"},                        
                    }}
                }}, 
                    
            ]).toArray().then((res) => {
                console.log(res[0].brief);
                resolve(res);
            }).catch((e) => {
                reject(e);
            });
 
        })
    );
}

const getCurrentProjData = function (username) {
    return mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            if(!username){
                reject("Empty username");
            }
            const db = mongoUtils.getDb();
            db.collection('userData').findOne({ "user.username": username }).then(async function(usr) {
                if (!usr){
                    await db.collection('userData').insertOne({ user: {username:username}, projectNames: [], currentProject: null });  
                    resolve("No current project");
                    return; 
                }     
                if (usr.currentProject) {
                    console.log("Current project: " + usr.currentProject);
                    resolve("Current project: " + usr.currentProject);
                } else {
                    console.log("No current project");
                    resolve("No current project");
                }
            }).catch((e) => reject(e));
        })
    );
}



//
const signup = function (username) {
    return mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            if(!username){
                reject("User must not be null");
            }
            const db = mongoUtils.getDb();
            const checkUserNames = db.collection('userData').findOne({ "user.username": username});
            checkUserNames.then((usr) => {
                console.log(usr);
                if (usr) {
                    reject("Username already exists");
                } else {
                    db.collection('userData').insertOne({ user: username, projectNames: [], currentProject: null }).
                    then((_) => {
                        resolve("Username registered")
                    }).catch((e) => reject(e));
                }
            });
        })
    );
}


module.exports = {
    createProject: createProject,
    addLog: addLog,
    removeProject: removeProject,
    listProjects: listProjects,
    currentProject: getCurrentProjData,
    report: report,
    signup: signup
}




