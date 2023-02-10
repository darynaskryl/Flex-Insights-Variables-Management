# Flex Insights Variables Management Plugin

# Overview

Flex plugin to automate the step of assigning variable value to a newly created/updated worker. The plugin lets you avoid manual steps of configuring users associated variable filters, described for the Variable Filters solutions in https://www.twilio.com/blog/separate-data-in-flex-insights.

# Configuration

### Deploy the Twilio Serverless Service

1. Set the environment variables (.env) 
```
ACCOUNT_SID=
AUTH_TOKEN=
GOODDATA_WORKSPACE_ID=
GOODDATA_LOGIN=
GOODDATA_PASSWORD=
```

2. Deploy the serverless project using Twilio Cli:  
```
twilio serverless:deploy
```

### Configure the Plugin

Set your Twilio Serverless Function URL in the VariableManagementPlugin.js

```
fetch('https://YOUR_TWILIO_RUNTIME_DOMAIN/variable_update', options)
```

### TBD 
* Local development (n/a at this moment)
* Assign the variable only when a new worker logs in (Add worker attribute flag or record in sync map that will indicate the variable has been assigned + value of the variable)
* Remove existing variable and add a new one in case if worker data permissions have changed