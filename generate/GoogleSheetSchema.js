const { sheets, authenticate, buildRequests, buildUpdateRequests, getCurrentSheets } = require('./utils');

class GoogleSheetSchema {
  constructor({keyValues, spreadsheetId, auth}){
    this.spreadsheetId = spreadsheetId;
    this.schema = new Map(keyValues);
    this.auth = auth
  }

  async generateSheets(){
    const currentSheets = await getCurrentSheets(this.auth, this.spreadsheetId);
    const requests = buildRequests(this.schema, currentSheets);
    // if our requests are empty then do nothing
    if(requests.length>0){
      const addSheetResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId:this.spreadsheetId,
        resource: {
          requests: [...requests]
        },
        auth: this.auth
      });
      const updateRequests = buildUpdateRequests({
        addSheetResponse,
        spreadsheetId: this.spreadsheetId,
        schema: this.schema,
        auth: this.auth
      });
      updateRequests.forEach( async (req) => {
        try {
          const addFields = await sheets.spreadsheets.values.append(req);
          console.log(addFields.data);
        }catch(err){
          console.log(err);
        }
      });
    }
  }
}

module.exports = GoogleSheetSchema;