# alexaTimeTracker
Time tracking  Alexa skill with Node.js, GraphQl and MongoDB.

Client folder contains the CLI for testing the backend for alexa skill. 

alexa_lambda.js is the lambda function that is the endpoint for the alexa skill.

Server folder contains the node-mongoDB backend for the alexa skill. timeTracker has the implementations
of the alexa commands, server.js has graphQl logic, and mongoUtils has functions needed to talk to mongodb.
Supported commands are create/delete activity, start logging activity, finish logging, report progress over the last X days. 
The skill is published on Amazon at: https://www.amazon.com/Kuku-LLC-time-tracker/dp/B07VT382TG/.




