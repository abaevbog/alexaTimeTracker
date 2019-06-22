const timestamp = require('time-stamp');
const assert = require('assert');
const mongoUtils = require('./mongoUtils.js');

//
const createProject = function (title) {
    return mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            console.log(title);
            const db = mongoUtils.getDb();
            const getUser = db.collection('userData').findOne({ user: 'username' });
            getUser.then((usr) => {
                if (usr.projectNames.includes(title)) {
                    reject("Project title already taken");
                }
                db.collection('userData').updateOne({
                    user: 'username'
                }, {
                        $push: { projectNames: title }
                    }).then((_) => {
                        resolve("Project created!");
                    });
            }).catch((e) => console.log(e));
        })
    );
}

//
const addLog = function (activity, projectName) {
    return mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            console.log('project:'+projectName);
            assert(activity == 'start' || activity == 'end');
            const db = mongoUtils.getDb();
            const searchUser = db.collection('userData').findOne({ user: 'username' });
            searchUser.then((result) => {
                if (result.projectNames.includes(projectName) || result.currentProject) {

                    if (activity == 'start') {

                        if (!result.currentProject) {
                            log = { user: 'username', projectName: projectName, start: {year:timestamp('YYYY'),month:timestamp('MM'),day:timestamp('DD'),time:timestamp('HH:mm:ss') }, finish: null, duration: null };
                            insertLogToDb(log);
                            db.collection('userData').updateOne({ user: 'username' },
                                {
                                    $set: {
                                        currentProject: projectName
                                    }
                                }).then((suc) => resolve("Work on " +projectName+" started!")).catch((e) => console.log(e));
                        } else {
                            reject("You are already working on " + result.currentProject);
                        }
                    } else {
                        if (result.currentProject) {
                            db.collection('userData').findOne({ user: 'username' }).then((result) => {
                                db.collection('logs').findOne({ projectName: result.currentProject, finish: null })
                                    .then((log) => {
                                        const fin = {year:timestamp('YYYY'),month:timestamp('MM'),day:timestamp('DD'),time:timestamp('HH:mm:ss') };
                                        updateLog = { projectName: result.currentProject, finish: fin,id:log._id, duration: subtractTimeStamps(fin, log.start) }
                                        updateLogInDb(updateLog);
                                        nullifyCurrentProject('username');
                                        resolve("Work on " + result.currentProject +" complete!");
                                    }).catch((e) => console.log(e));
                            }).catch((e) => console.log(e));
                        } else {
                            reject("Work on this project has already been finished");
                        }
                    }
                } else {
                    reject("Either your work is complete or you are trying to work on non existing project");
                }
            }).catch((e) => reject(e));
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
                duration: log.duration
            }
        }).then((suc) => console.log(suc))
        .catch((e) => console.log(e));
}

//
const nullifyCurrentProject = (username) => {
    const db = mongoUtils.getDb();
    db.collection('userData').updateOne({
        user: username
    }, {
            $set: {
                currentProject: null
            }
        }).then((suc) => console.log("current project nulled"))
        .catch((e) => console.log(e))
}

const removeProject = function (projectName) {
    return mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            const db = mongoUtils.getDb();
            db.collection('userData').updateOne({
                user: 'username'
            }, {
                    $pull: {
                        projectNames: projectName
                    }
                }).then((suc) => resolve("Project removed"))
                .catch((e) => reject(e))
        })
    );
}

const listProjects = function () {
    return mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            const db = mongoUtils.getDb();
            db.collection('userData').findOne({ user: 'username' })
                .then((suc) => {
                    suc.projectNames.forEach((name) => console.log(name + '\t'));
                    resolve(suc.projectNames);
                })
                .catch((e) => reject(e))
        })
    );
}


//finish/start = {year:...,date:day/mon,time:...}
const subtractTimeStamps = function (finish, start) {
    const timesOne = start.time.split(':');
    const timesTwo = finish.time.split(':');
    var durationDay = parseInt(finish.day-start.day);
    var durationHour = parseInt(timesTwo[0] - timesOne[0]);
    var durationMin = parseInt(timesTwo[1] - timesOne[1]);
    var durationSec = parseInt(timesTwo[2] - timesOne[2]);
    if (durationHour < 0){
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
 

const dateSeverDaysAgoLastMonth=function(month,currentDate){
    if([1,3,5,7,8,10,12].includes(month)){
        return 31+currentDate;
    } else if([4,6,9,11].includes(month)){
        return 30+currentDate;
    } else{
        return 28+currentDate;
    }
}

//search only for todays tasks so far
const report = function () {
    return mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            const db = mongoUtils.getDb();
            const {today, thisMonth,thisYear} =  {today:timestamp('DD'),thisMonth:timestamp('MM'),thisYear:timestamp('YYYY')};  
            var lastWeek = parseInt(today) - 7;
            var lastMonth = thisMonth;
            var lastYear = thisYear;
            if (lastWeek < 1){
                console.log("AAAA");
              lastMonth--;
              if (lastMonth < 0){
                  lastMonth = 0;
                  lastYear--;
              }
              lastWeek = dateSeverDaysAgoLastMonth(lastMonth,lastWeek);       
            }
            console.log(lastWeek);
            console.log(lastMonth);
            console.log(lastYear);
            assert(lastWeek>0 && lastMonth> 0 &&lastYear>0);
            db.command({
                find:"logs",
                filter: {
                 $and:[
                        {"start.day": { $gt: lastWeek.toString()} },
                        {"start.day": { $lte: today.toString()} },
                        { $or: [ {"start.month": { $eq: thisMonth.toString()} },{"start.month": { $eq: lastMonth.toString()} }] } ,
                        {$or: [ {"start.year": { $eq: thisYear.toString()} },{"start.year": { $eq: lastYear.toString()} }] } ,
                    ]  
                }
            }, (err,result) => {
                if( err){
                    reject(err);
                } else {
                    resolve(result.cursor.firstBatch);
                }
            });
        })
    );
}

const getCurrentProjData=function(){
    return mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            const db = mongoUtils.getDb();
            db.collection('userData').findOne({user:'username'}).then((usr) => {
                if (usr.currentProject){
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
            const db = mongoUtils.getDb();
            const checkUserNames = db.collection('userData').findOne({ user: username });
            checkUserNames.then((usr) => {
                if (usr) {
                    reject("Username already exists");
                }
                db.collection('userData').insertOne({ user: 'username', projectNames: [], currentProject: null }).
                    then((_) => {
                        resolve("Username registered")
                    }).catch((e) => reject(e));
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