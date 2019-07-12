
const { MongoClient} = require('mongodb');

const connectionUrl = process.env.DB_URL? process.env.DB_URL: 'mongodb://127.0.0.1:27017/';
//const connectionUrl = 'mongodb://127.0.0.1:27017';

const database = 'task_manager'
var db;
var dbClient;

const connectToDb = function (doMoreStuff) {
    return MongoClient.connect(connectionUrl, { useNewUrlParser: true }).then(
        (client) => {
            console.log('connectiong to db successful');
            db = client.db(database);
            return doMoreStuff().then((yes) => {
                console.log("resolved");
                client.close();
                return yes;
            }).catch((e) => {
                client.close();
                console.log(e);
                return e;
            });     
        }).catch((error) => {
            console.log(error);
            return error;
        })
}


const getDb = function () {
    return db;
}
getClient = function () {
    return dbClient;
}


module.exports = {
    getDb: getDb,
    connectToDb: connectToDb,
    getClient: getClient
}
