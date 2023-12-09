
import * as path from 'path';
import dotenv from 'dotenv';
import { GoogleDriveService } from './services/googleDrive.service.js';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || '';
const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '';

const googleDriveService = new GoogleDriveService(driveClientId, driveClientSecret, driveRedirectUri, driveRefreshToken);

// Define the file to upload
const filePath = path.resolve(__dirname, '../public/image.png');
const fileName = 'image';
const folderName = 'pictures';
const mimeType = 'image/jpg'


let folder = await googleDriveService.searchFolder(folderName).catch((error) => {
  console.error(error);
  return null;
});

if (!folder) {
  folder = await googleDriveService.createFolder(folderName);
}

// Upload the file to Google Drive
googleDriveService.saveFile(fileName, filePath, mimeType, folder.id).catch((error) => {
    console.error(error);
    var div = document.getElementById('result');
    div.innerHTML += `<p>${error}</p>`;
});

