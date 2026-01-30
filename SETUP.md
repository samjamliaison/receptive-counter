# Setup Guide: Google Sheets Backend

## Step 1: Deploy the Apps Script (for write access)

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1iecchZvo4qq1P7DENuRec7siw0_ubOjtN7CorJzUv9Y
2. Click **Extensions** → **Apps Script**
3. Delete any code there and paste this:

```javascript
const SHEET_ID = '1iecchZvo4qq1P7DENuRec7siw0_ubOjtN7CorJzUv9Y';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Update totalUsers (row 2)
    if (data.totalUsers !== undefined) {
      sheet.getRange('B2').setValue(data.totalUsers);
    }
    
    // Update lastUpdated (row 4)
    sheet.getRange('B4').setValue(new Date().toISOString());
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  const data = {
    totalUsers: sheet.getRange('B2').getValue(),
    goal: sheet.getRange('B3').getValue(),
    lastUpdated: sheet.getRange('B4').getValue()
  };
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Deploy** → **New deployment**
5. Click the gear ⚙️ next to "Select type" → Choose **Web app**
6. Set:
   - Description: "Receptive Counter API"
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy**
8. Click **Authorize access** and allow permissions
9. Copy the **Web app URL** (looks like: `https://script.google.com/macros/s/xxx/exec`)

## Step 2: Configure the Counter

Open the counter page and run this in the browser console (F12):

```javascript
localStorage.setItem('receptive_apps_script_url', 'YOUR_WEB_APP_URL_HERE');
```

Replace `YOUR_WEB_APP_URL_HERE` with the URL from step 9.

## Done!

The counter will now:
- ✅ Read from Google Sheets
- ✅ Write changes back to Google Sheets
- ✅ Sync across all browsers/devices
