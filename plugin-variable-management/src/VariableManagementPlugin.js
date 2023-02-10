import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';
import { getFlexState } from './helpers/manager';


const PLUGIN_NAME = 'VariableManagementPlugin';

export default class VariableManagementPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {

      // Get the value of current worker team name
    const workerTeamName = getFlexState().worker.attributes['market'];  
  
// Use setInterval to check the value of the key every 1000 milliseconds (1 second)
const intervalId = setInterval(() => {
  let initialworkerProfileId = undefined;
  let currentWorkerProfileId = getFlexState().insights.profileInfo.links.self; 

  // Check if the value has changed
  if (typeof initialworkerProfileId !== currentWorkerProfileId) {
    console.log("GD profile id is set to ", currentWorkerProfileId);
    initialworkerProfileId = currentWorkerProfileId;

            // Get GoodData user profile of current worker
            const workerProfileId = currentWorkerProfileId;  
            
            //Get Flex Token
            const flexToken = getFlexState().session.ssoTokenPayload.token;
            
            // Add the Token, worker team name and profile id to the body of the request
            const context = {
            Token: flexToken,
            workerProfileId: workerProfileId, 
            workerTeamName: workerTeamName
    };
    
            // Set up the HTTP options for your request
            const options = {
              method: 'POST',
              body: new URLSearchParams(context),
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
              }
            };
              
            // Make the request to the serverless function, insert your URL
            fetch('https://variables-update-5917.twil.io/variable_update', options)
              .then(resp => resp.json())
              .then(data => console.log(data));
              
    clearInterval(intervalId);
  }

}, 1000); 
    

}
}
