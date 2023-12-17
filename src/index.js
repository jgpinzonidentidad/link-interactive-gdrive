
import dotenv from 'dotenv';
import { GoogleDriveService } from './services/googleDrive.service.js';
import { takepicture, clearphoto } from './webcam.js';

console.log(dotenv);
dotenv.config();

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || '';
const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '';

const googleDriveService = new GoogleDriveService(driveClientId, driveClientSecret, driveRedirectUri, driveRefreshToken);

// Define the file to upload
const fileName = 'image';
const folderName = 'pictures';
const mimeType = 'image/png'

let width = 320;
let height = 0;

let streaming = false;

let video = null;
let canvas = null;
let photo = null;
let startbutton = null;

(function() {
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  photo = document.getElementById('photo');
  startbutton = document.getElementById('startbutton');

  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(function(stream) {
    video.srcObject = stream;
    video.play();
  })
  .catch(function(err) {
    console.log("An error occurred: " + err);
  });

  video.addEventListener('canplay', function(ev){
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);
    
      // Firefox currently has a bug where the height can't be read from
      // the video, so we will make assumptions if this happens.
    
      if (isNaN(height)) {
        height = width / (4/3);
      }
    
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  startbutton.addEventListener('click', function(ev){
    let data = takepicture();

    saveImage(extractedBase64(data));
    ev.preventDefault();
  }, false);
  
  clearphoto();
})();

let extractedBase64 = (imageData) => imageData.split(',')[1];

let folder = await googleDriveService.searchFolder(folderName).catch((error) => {
  console.error(error);
  return null;
});

let saveImage = async function(imageData) {
  if (!folder) {
    folder = await googleDriveService.createFolder(folderName);
  }
  
  // Upload the file to Google Drive
  googleDriveService.saveFile(fileName, imageData, mimeType, folder.id).catch((error) => {
      console.error(error);
      var div = document.getElementById('result');
      div.innerHTML += `<p>${error}</p>`;
  });
}

