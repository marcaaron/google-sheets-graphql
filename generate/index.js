const GoogleSheetSchema = require('./GoogleSheetSchema.js');
const { authenticate } = require('./utils.js');

const keyValues = [
  ['User', ['id', 'name', 'interests']],
  ['Book', ['id', 'title', 'new']]
];

(async function init(){
  const auth = await authenticate();
  const schema = new GoogleSheetSchema({
    spreadsheetId: process.env.SPREADSHEET_ID,
    keyValues,
    auth
  });
  await schema.generateSheets();
  console.log('done');
})();