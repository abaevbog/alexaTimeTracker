
const {MongoClient, ObjectId} = require('mongodb');
const connectionUrl = 'mongodb://127.0.0.1:27017';
const database = 'task_manager'

var db;


const connectToDb = (doMoreStuff) => MongoClient.connect(connectionUrl,{ useNewUrlParser:true}).then(
    (client) => {
        console.log('connectiong to db successful');
        db = client.db(database);   
        doMoreStuff();
        //client.close();        
    }).catch((error)=>console.log(error) );
    

const getDb = function(){
    return db;
}



module.exports = {
    getDb: getDb,
    connectToDb:connectToDb,
}
