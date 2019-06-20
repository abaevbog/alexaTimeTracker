
const { MongoClient, ObjectId } = require('mongodb');
const connectionUrl = 'mongodb://127.0.0.1:27017';
const database = 'task_manager'

var db;
var dbClient;

const connectToDb = function (doMoreStuff) {
    MongoClient.connect(connectionUrl, { useNewUrlParser: true }).then(
        (client) => {
            console.log('connectiong to db successful');
            db = client.db(database);
            doMoreStuff().then((yes) => {
                console.log('closing');
                client.close()
            }).catch((e) => console.log(e));     
        }).catch((error) => {
            client.close()
            console.log(error);
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
