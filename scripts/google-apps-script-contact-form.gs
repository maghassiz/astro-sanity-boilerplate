// Backend for the /contact-us form (src/components/contact/ContactForm.tsx).
// The site is a static Astro build with no server, so form submissions are
// sent straight to a Google Apps Script Web App, which appends a row to a
// Google Sheet.
//
// One-time setup:
// 1. Create a new Google Sheet (or open an existing one), then
//    Extensions -> Apps Script.
// 2. Delete the default Code.gs contents and paste this whole file in.
// 3. Deploy -> New deployment -> type "Web app".
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the resulting /exec URL into PUBLIC_CONTACT_FORM_ENDPOINT in .env
//    (see .env.example).
// 5. Re-run "Deploy -> Manage deployments" and create a new version any time
//    this file changes — edits to the script don't apply to an existing
//    deployment until you do.

const SHEET_NAME = 'Sheet1';

function doPost(e) {
  // The client submits as FormData (multipart/form-data), not JSON -- see
  // the comment in ContactForm.tsx explaining why (CORS preflight avoidance).
  // Apps Script parses multipart/form-urlencoded fields into e.parameter,
  // not e.postData.contents (that's only JSON-parseable for a literal
  // application/json body, which this isn't).
  const data = e.parameter;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Message']);
  }

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.message || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
