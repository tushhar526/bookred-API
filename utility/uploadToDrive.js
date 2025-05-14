const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const KEYFILEPATH = '../config/service_account_info.json'; 
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const folderId = process.env.UserDrive;

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

async function uploadToDrive(filePath, fileName) {
  const driveService = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    'name': fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: 'image/jpeg', // adjust if needed
    body: fs.createReadStream(filePath),
  };

  const file = await driveService.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  const fileId = file.data.id;

  // Make the file public
  await driveService.permissions.create({
    fileId: fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  console.log('Public URL:', publicUrl);

  return publicUrl;
}

module.exports = uploadToDrive;
