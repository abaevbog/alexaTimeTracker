// This function is ran on AWS Lambda. It is the endpoint 
// where all Alexa commands are sent. Then, it sends requests
// to the node app from server folder to process them.

const Alexa = require('ask-sdk-core');
const request = require('request');

const host = "http://internal-alexaAppELB-464974694.us-east-1.elb.amazonaws.com";

const sendQuery = function(query, handlerInput) {
  return new Promise(function(resolve,reject) {
    const username = handlerInput.requestEnvelope.session.user.userId;
      request.post({
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          url: host + "/graphql",
          body: JSON.stringify({ "query": query })
      }, (err, result) => {
          if (err) {
            resolve(handlerInput.responseBuilder
              .speak("Something went wrong!")
              .withSimpleCard('Oops...', "Something broken on our part")
              .getResponse());   
          } else {
            console.log("body");
            console.log(result.body);
              const data = JSON.parse(result.body).data.time;
              const key = Object.keys(data)[0];
          var output = data[`${key}`];
          if (handlerInput.requestEnvelope.request.intent.name == "ls"){
            var temp = "Your activities are: ";
            output.forEach((prj)=>{
              temp = temp + prj + ", ";
            });
            output = temp;
          } else if  (handlerInput.requestEnvelope.request.intent.name == "report"){
            const days = handlerInput.requestEnvelope.request.intent.slots.days.value;
            var temp = `Here is the breakdown of your activities for the last ${days} days:\n`;
            console.log(output);
            output.forEach((prj) => {
              temp  += `You spent total of ${prj.totalTime} minutes on ${prj._id}. Among those: `;
              prj.brief.forEach((session)=>{
                temp += `${session.timeSpent} minutes were spent on day ${session.day}, `
              });
            });
            output = temp;
          }
          console.log("Result");
          console.log(output);
          resolve(handlerInput.responseBuilder
            .speak(output)
            .withSimpleCard('Got it!!!', output)
            .getResponse());
          }
        });
      });
};




const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Describe time tracker';
  
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};



const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Help intent';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

// const SessionEndedRequestHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
//   },
//   handle(handlerInput) {
//     console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

//     return handlerInput.responseBuilder.getResponse();
//   },
// };

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}`);
    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};



/////////////////////////////

const createProjectIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'createProject';
  },
  
  handle(handlerInput) {
    const project = handlerInput.requestEnvelope.request.intent.slots.projectName.value;
    console.log("Create project");
      var query = `{
          time(username: "username"){
          create(projectName: "${project}")
        }
      }`;
    return sendQuery(query,handlerInput);
    }
  };
  
const startProjectIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'startProject';
  },
  handle(handlerInput) {
    console.log("Start project");
    const token = handlerInput.requestEnvelope.context.System.apiAccessToken;
    const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
    const project = handlerInput.requestEnvelope.request.intent.slots.projectName.value;
    return new Promise((resolve,reject) => {
    request.get({
      headers: {
        "Authorization": `Bearer ${token}`
      },
      url: `https://api.amazonalexa.com/v2/devices/${deviceId}/settings/System.timeZone`
    }, function(err,res) {
      if (err){
      resolve(handlerInput.responseBuilder
              .speak("Something went wrong!")
              .withSimpleCard('Oops...', "Something broken on our part")
              .getResponse());      
      } else {
      var query = `{
          time(username: "username", timeZone: ${res.body}){
          start(projectName: "${project}")
        }
      }`; 
      resolve(sendQuery(query,handlerInput));
      }
    });    
    })

  }
};
  
  
const finishProjectIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'finishProject';
  },
  handle(handlerInput) {
    console.log("Finish project");
      var query = `{
          time(username: "username"){
          end
        }
      }`;
    return sendQuery(query,handlerInput);
    }
  };
  
  
const deleteProjectIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'deleteProject';
  },
  handle(handlerInput) {
    console.log("Delete project");
    const project = handlerInput.requestEnvelope.request.intent.slots.projectName.value;
      var query = `{
          time(username: "username"){
          remove(projectName: "${project}")
        }
      }`;
    return sendQuery(query,handlerInput);
    }
  };
  
  
const lsIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ls';
  },
  handle(handlerInput) {
    console.log("Ls");
      var query =  `{
          time(username: "username"){
          ls
        }
      }`;
    return sendQuery(query,handlerInput);
    }
  };
  
const currentIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'current';
  },
  handle(handlerInput) {
    console.log("Current project");
      var query =  `{
          time(username: "username"){
          current
        }
      }`;
    return sendQuery(query,handlerInput);
    }
  };
  
  
const reportIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'report';
  },
  handle(handlerInput) {
  var query=`{
        time(username: "username"){
            report(days: 4){ 
                _id
                totalTime
                 brief{
                timeSpent
                day
                month
                  }
              }
          }
        }`;
    return sendQuery(query,handlerInput);
    }
  };
  


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    //SessionEndedRequestHandler,
    createProjectIntentHandler,
    startProjectIntentHandler,
    finishProjectIntentHandler,
    reportIntentHandler,
    lsIntentHandler,
    currentIntentHandler,
    deleteProjectIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();