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
        time:String!
    }

    type Session{
        start: Date!
        finish: Date!
        duration: Int!
    }

    type Report{
        _id: String!
        timeSpent:Int!
        workSessions: [Session]!
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
        time(username: String!): TimeTracker
        signup(username:String!): String!
    }
`);




class TimeTracker{

    constructor(user){
        this.username = user.username;
    }

    start(project){
        var outcome = notes.addLog(this.username,'start',project.projectName);
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
            console.log(result);
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

var root = {
    time: function (username) {
      return new TimeTracker(username);
    },
    signup:function(username){
        return signup(username);
    }
  }


app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));



app.listen(port, () => console.log(`Time tracker listening on port ${port}!`));