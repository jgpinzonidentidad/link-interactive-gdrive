import express from 'express';
import fs from 'fs';
import { GoogleDriveService } from './services/googleDriveservice.js';

const app = express();
const port = 3000;

app.use(express.static('src'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.get('/', (req, res) => {
 res.sendFile(__dirname + '/src/index.html');
});

app.post('/capture', async (req, res) => {
    const imageData = req.body.data;
    const fileName = 'image.png';
    const folderName = 'superwurdfolder';
    const mimeType = 'image/png'
    const googleDriveService = new GoogleDriveService();
    // Save image data to a temporary file
    // fs.writeFileSync(fileName, imageData, 'base64');

    try {
        // Create a new file in Google Drive
        let folder = await googleDriveService.searchFolder(folderName);
        if (!folder) {
            folder = await googleDriveService.createFolder(folderName);
          }
          
        const response = googleDriveService.saveFile(fileName, imageData, mimeType, folder.id)         
        // fs.unlinkSync(fileName); // Delete temporary file after upload
        res.json({ message: 'Image uploaded successfully!', fileId: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading image' });
    }
});

app.listen(port, () => {
 console.log(`Server is running at http://localhost:${port}`);
});