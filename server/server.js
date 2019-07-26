// Definitions of the schema for graphQL, as well as 
// other server's logic necessary to serve the content
// upon request. 
// All requests' inputs are send to timeTracker.js for processing



const notes = require('./timeTracker.js');
const express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
const port = 3000;
const app = express();

var schema = buildSchema(`
    type Date{
        year:Int!
        month: Int!
        day: Int!
        time:String
    }

    type Session{
        start: Date!
        finish: Date!
        duration: Int!
    }

    type DailyBreakdown{
        day: String!
        month: String!
        timeSpent: Int!
    }

    type Report{
        _id: String!
        totalTime:Int!
        full: [Session]!
        brief: [DailyBreakdown]!
    }

    type TimeTracker {
        username: String!
        start(projectName:String!): String!
        end: String!
        create(projectName:String!): String!
        remove(projectName:String!): String!
        ls: [String]  
        current: String!
        report(days:Int!): [Report]!
    }

    type Query {
        time(username: String!, timeZone: String): TimeTracker
        hello: String!
    }
`);




class TimeTracker{

    constructor(user){
        this.username = user.username;
        this.timeZone = user.timeZone
    }

    start(project){
        var outcome = notes.addLog(this.username,'start',project.projectName,this.timeZone);
        return outcome.then((result) => {
            return(result);
        }).catch((e) => {
            return(e);
        }); 
    }

    end(){
        var outcome = notes.addLog(this.username,'end');
        return outcome.then((result) => {
            return(result);
        }).catch((e) => {
            return(e)
        });
    }


    create(project){
        var outcome = notes.createProject(this.username, project.projectName);
        return outcome.then((result) => {
            return(result);
        }).catch((e) => {
            return(e)
        });
    }

    remove(project){
        var outcome = notes.removeProject(this.username,project.projectName);
        return outcome.then((result) => {
            return(result);
        }).catch((e) => {
            return(e)
        });
    }

    ls(){
        var outcome = notes.listProjects(this.username);
        return outcome.then((result) => {
            return(result);
        }).catch((e) => {
            return(e)
        });
    }

    current(){
        var outcome = notes.currentProject(this.username);
        return outcome.then((result) => {
            return(result);
        }).catch((e) => {
            return(e)
        });
    }

    report(days){
        var outcome = notes.report(this.username,days.days);
        return outcome.then((result) => {
            

            return(result);
        }).catch((e) => {
            return(e)
        });
    }
}
signup=function(username){
    var outcome = notes.signup(username);
    return outcome.then((result) => {
        return(result);
    }).catch((e) => {
        return(e)
    });
}

hello=function(){
    return "Hello!";  
}


var root = {
    time: function (username) {
      return new TimeTracker(username);
    },
    hello: "Hi!"
  }


app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));



app.listen(port, () => console.log(`Time tracker listening on port ${port}!`));