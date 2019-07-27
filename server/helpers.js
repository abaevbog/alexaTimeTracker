// File with helper utility functions used in time tracker implementation.

const mongoUtils = require('./mongoUtils.js');
const moment = require('moment-timezone');

const subtractDates = function (date, timeZone) {
    return Math.round((computeTime(timeZone) - date) / 60000);
}

const getLowerBound = function (timeZone, days) {
    var d = computeTime(timeZone);
    d.setDate(d.getDate() - days);
    const daysAgo = new Date(d);
    console.log(daysAgo);
    return daysAgo;
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

const setTimeZone = (username, timeZone) => {
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

const insertLogToDb = (log) => {
    const db = mongoUtils.getDb();
    const addToCollection = db.collection('logs').insertOne(log);

    addToCollection.then((suc) => {
    }).catch((e) => console.log(e));

}

const computeTime = function (timeZone) {
    const now = new Date();
    var mom = moment.tz(now, timeZone);
    const date = mom.format().substring(0, 19) + "Z";
    return new Date(date);
}

module.exports = {
    subtractDates:subtractDates,
    getLowerBound:getLowerBound,
    updateLogInDb:updateLogInDb,
    nullifyCurrentProject:nullifyCurrentProject,
    setTimeZone:setTimeZone,
    insertLogToDb:insertLogToDb,
    computeTime:computeTime
}