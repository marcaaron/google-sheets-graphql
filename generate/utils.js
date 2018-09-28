require('dotenv').config();
const { google } = require('googleapis');
const sheets = google.sheets('v4');

function buildRequests(schema, currentSheets){
  const requests = [];
  // Loop over schema keys
  schema.forEach((_, key)=>{
    // If Sheet does not exist in spreadsheet then create a new request for it
    if(!currentSheets.has(key)){
      const request = {
        addSheet: {
          properties: {
            title: key
          }
        }
      };
      // push it into the requests array
      requests.push(request);
    }
  });
  // If the sheet is NOT in the schema then delete it
  currentSheets.forEach((sheet, title) => {
    if(!schema.has(title)){
      const request = {
        deleteSheet: {
          sheetId: sheet.sheetId
        }
      };
      requests.push(request);
    }
  });
  return requests;
}

async function getCurrentSheets(auth, spreadsheetId){
  // Check to See if Sheets exist
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    auth
  });
  const currentSheets = new Map();
  spreadsheet.data.sheets.forEach(sheet => {
    currentSheets.set(sheet.properties.title, sheet.properties);
  });  
  return currentSheets;
}

async function authenticate(){
  const auth = await google.auth.getClient({
    // Scopes can be specified either as an array or as a single, space-delimited string.
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive ', 'https://www.googleapis.com/auth/drive.file']
  }); 
  return auth;
}

function buildUpdateRequests({addSheetResponse, spreadsheetId, schema, auth}){
  const updateRequests = [];
  addSheetResponse.data.replies.forEach(reply=>{
    if(Object.keys(reply).length>0){
      const { title } = reply.addSheet.properties;
      // Add Field Row for Newly Created Sheet
      const request = {
        auth,
        spreadsheetId,
        range: `${title}!A1:Z`,
        resource: {
          values: [schema.get(title)]
        },
        valueInputOption: 'USER_ENTERED'
      };
      updateRequests.push(request);
    }
  });
  return updateRequests;
}

module.exports = {
  sheets, buildRequests, getCurrentSheets, authenticate, buildUpdateRequests
};