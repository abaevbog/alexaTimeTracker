# alexaTimeTracker
Making time tracker as Alexa skill with node, GraphQl and MongoDB.

Client folder contains the CLI for testing the backend for alexa skill. 
If cloned, can be used by running node CLI.js help to see available commands. 
It sends requests to http://54.237.77.73/graphql, which can also be used directly.

Server folder contains the node-mongoDB backend for the alexa skill. timeTracker has the implementations
of the alexa commands, server.js has graphQl logic, and mongoUtils has functions needed to talk to mongodb. 

alexa_lambda.js is the lambda function that is the endpoint for the alexa skill.
