const { google } = require('googleapis');

const KEYFILEPATH = './config/service_account_info.json'; // Path to your service account JSON key
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Create a Google Auth client
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

/**
 * Deletes a file from Google Drive by its file ID.
 * @param {String} fileId - The ID of the file you want to delete.
 * @returns {Object} - An object indicating success or failure with a message.
 */
async function deleteUserProfilePictureById(fileId) {
  const driveService = google.drive({ version: 'v3', auth });

  try {
    // Delete the file using the Drive API
    await driveService.files.delete({
      fileId: fileId,
    });

    console.log(`✅ Profile picture (fileId: ${fileId}) deleted successfully`);

    return {
      success: true,
      message: 'Profile picture deleted successfully',
    };

  } catch (error) {
    console.error(`❌ Failed to delete profile picture with fileId: ${fileId}`, error.message);

    return {
      success: false,
      message: 'Failed to delete profile picture',
      error: error.message,
    };
  }
}

module.exports = { deleteUserProfilePictureById };
