const timestamp = require('time-stamp');
const assert = require('assert');
const mongoUtils = require('./mongoUtils.js');
const fs = require('fs');


const createProject =  function (username, title) {
    return mongoUtils.connectToDb(
        () => new Promise(async function (resolve, reject) {
            if(!username){
                reject("User not signed in");
            }
            const db = await mongoUtils.getDb();
            var usr = await db.collection('userData').findOne({ "user.username": username});
            
                if (!usr){
                    await db.collection('userData').insertOne({ user: {username:username}, projectNames: [], currentProject: null });
                    usr ={ user: {username:username}, projectNames: [], currentProject: null }  
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

//
const addLog = function (username, activity, projectName) {
    return mongoUtils.connectToDb(
        () => new Promise(async function (resolve, reject) {          
            assert(activity == 'start' || activity == 'end');
            const db = mongoUtils.getDb();
            const result = await db.collection('userData').findOne({ "user.username": username });
            if (!result){
                reject("Username not found");
                return;
            }
            console.log(result);
            console.log(projectName);
            if (result.projectNames.includes(projectName) || result.currentProject) {

                if (activity == 'start') {

                    if (!result.currentProject) {
                        log = { user: username, projectName: projectName, start: { year: Number(timestamp('YYYY')), month: Number(timestamp('MM')), day: Number(timestamp('DD')), time: timestamp('HH:mm:ss') }, finish: null, duration: null };
                        insertLogToDb(log);
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
                                    const fin = { year: Number(timestamp('YYYY')), month: Number(timestamp('MM')), day: Number(timestamp('DD')), time: timestamp('HH:mm:ss') };
                                    updateLog = { projectName: result.currentProject, finish: fin, id: log._id, duration: durationInMins(subtractTimeStamps(fin, log.start)) }
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




// log = {user:..., projectName:..., start:...,finish:...,duration:...}
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


//finish/start = {year:...,date:day/mon,time:...}
const subtractTimeStamps = function (finish, start) {
    const timesOne = start.time.split(':');
    const timesTwo = finish.time.split(':');
    var durationDay = parseInt(finish.day - start.day);
    var durationHour = parseInt(timesTwo[0] - timesOne[0]);
    var durationMin = parseInt(timesTwo[1] - timesOne[1]);
    var durationSec = parseInt(timesTwo[2] - timesOne[2]);
    if (durationHour < 0) {
        assert(durationDay > 0);
        durationDay--;
        durationHour = 24 + durationHour;
    }
    if (durationMin < 0) {
        durationHour--;
        durationMin = 60 + durationMin;
    }
    if (durationSec < 0) {
        durationMin--;
        durationSec = 60 + durationSec;
    }
    assert(durationHour >= 0);
    console.log(`${durationHour}:${durationMin}:${durationSec}`);
    return `${durationHour}:${durationMin}:${durationSec}`;
}

const durationInMins = function(duration){
    const times = duration.split(':');
    console.log(times);
    return parseInt(times[1]) + parseInt(times[0]*60) + Math.round( parseFloat(times[2])/60 );
}


const dateSeverDaysAgoLastMonth = function (month, currentDate) {
    if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
        return 31 + currentDate;
    } else if ([4, 6, 9, 11].includes(month)) {
        return 30 + currentDate;
    } else {
        return 28 + currentDate;
    }
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
                resolve(["No recent projects"]);
            }
            
            const { today, thisMonth, thisYear } = { today: timestamp('DD'), thisMonth: timestamp('MM'), thisYear: timestamp('YYYY') };
            var lastWeek = parseInt(today) - days;
            var lastMonth = thisMonth;
            var lastYear = thisYear;
            
            if (lastWeek < 1) {
                console.log("AAAA");
                lastMonth--;
                if (lastMonth < 0) {
                    lastMonth = 0;
                    lastYear--;
                }
                lastWeek = dateSeverDaysAgoLastMonth(lastMonth, lastWeek);
            }
            console.log(`${lastWeek > 0} ${lastMonth > 0} && ${lastYear > 0} && ${today>0} && ${thisMonth>0} && ${thisYear>0}`)
            assert(lastWeek > 0 && lastMonth > 0 && lastYear > 0 &&today>0 &&thisMonth>0 &&thisYear>0);
            db.collection('logs').aggregate([
                {'$match': {
                    $and:[
                           { $or: [
                                {$and: [ {"start.day": { $gte: parseInt(lastWeek)} },{"start.month": { $eq: parseInt(lastMonth)} }] } ,
                                {$and: [ {"start.day": { $lte:parseInt( today)} },{"start.month": { $eq: parseInt(thisMonth)} }] } ,
                           ]},
                          {"user": { $eq: username} },
                           {$or: [ {"start.year": { $eq: parseInt(thisYear)} },{"start.year": { $eq: parseInt(lastYear)} }] } ,
                       ]  
                   } },
                {$group: {
                    _id : "$projectName",
                    timeSpent:{ $sum: "$duration"},
                    workSessions:  { $push: {start:"$start",finish:"$finish", duration:"$duration"} }
                }}
                
            ]).toArray().then((res) => {
                console.log(res);
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


