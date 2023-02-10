
const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const axios = require('axios');

exports.handler = TokenValidator( async function(context, event, callback) {

  // Create a custom Twilio Response
    const response = new Twilio.Response();
  // Set the CORS headers to allow Flex to make an error-free HTTP request
  // to this Function
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  // GoodData workspace id and credentials for the user with variable editor permissions to be passed as env variables
    const login = context.GOODDATA_LOGIN;
    const password = context.GOODDATA_PASSWORD;
    const workspaceId = context.GOODDATA_WORKSPACE_ID;

  // set GD profile id; TBD: extract the value dynamically when GD user is provisioned; set a flag on a worker attribute to only update the variable once/or when data permissions are changed 
    const profileId = event.workerProfileId;

    // set worker team attribute from the event passed
    const workerTeam = event.workerTeamName;

  // set Team Name variable identifier uri, object 29220532
    const variableUri = '/gdc/md/'+workspaceId+'/obj/29220532';

  // GoodData API endpoints for authentication
    const baseUrl = 'https://analytics.ytica.com/';
    const authUrl = `${baseUrl}/gdc/account/login`;
    const sstUrl = `${baseUrl}/gdc/account/token`;

  try {
    // GoodData credentials
    const authBody = {
      postUserLogin: {
        login: login,
        password: password,
        remember: 1
      }
    };

    // AUTH TO GOODDATA
    // Make a POST request to the GoodData API to authenticate
    const authResponse = await axios.post(authUrl, authBody, {
      headers: { "Content-Type": "application/json", "Accept": "application/json" }
    });
    // Extract the SST token from the response
    const GDCAuthSST = authResponse.headers["set-cookie"][1].split(",")[0];
    console.log("SST is "+GDCAuthSST);

    // Make a GET request to the GoodData API to generate a TT
    const ttResponse = await axios.get(sstUrl, {
      headers: { Cookie: GDCAuthSST }
    });

    // Extract the temporary token from the response, token is valid within 10 minutes
    const cookies = ttResponse.headers["set-cookie"];
        let tToken;
    cookies.forEach(cookie => {
        if (cookie.includes("GDCAuthTT")) {
            tToken = cookie;
        }
    });
    
    // VARIABLE DEPENDING INPUTS
    // Obtain mapping of attribute values for Agent Name attribute (object identifer label.agents.team_name)
    const varValues = await axios.get (`${baseUrl}/gdc/md/${workspaceId}/obj/identifier:label.agents.team_name/elements`, { headers: {Cookie: tToken } 
    });

    // set Team Name attribute uri
    const teamNameAttributeUri = varValues.data.attributeElements.elementsMeta.attribute;
    console.log ("Team Name attribute uri is "+teamNameAttributeUri);

    // search for the workerTeam uri that corresponds to worker's team value
    const elementsArrays = varValues.data.attributeElements.elements;
    const teamNameValueUri = elementsArrays.find(element => element.title === workerTeam).uri;
    console.log ("Worker's Team Name attribute value is "+teamNameValueUri);

    // set expression for the variable
    const varExpression = `[${teamNameAttributeUri}] IN ([${teamNameValueUri}])`;
    console.log ("Expression is "+varExpression);
    
    // Update the user variable
    const varResponse = await axios.post(`${baseUrl}/gdc/md/${workspaceId}/variables/item/`, {
              "variable": 
                { "expression" : `${varExpression}`,
              "related": `${profileId}`,
              "level": "user",
              "type": "filter",
              "prompt": `${variableUri}`
            }
        }, { headers: {Cookie: tToken } });

    callback(null, varResponse);
  } catch (error) {
    console.error(error);
    callback(null, response);
  }
});