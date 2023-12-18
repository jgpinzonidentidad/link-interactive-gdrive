import express from 'express';
import fs from 'fs';
import { createFolder, saveFile, searchFolder } from './services/googleDriveservice.js';

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
    const folderName = 'pictures';
    const mimeType = 'image/png'

    // Save image data to a temporary file
    fs.writeFileSync(fileName, imageData, 'base64');

    try {
        // Create a new file in Google Drive
        let folder = await searchFolder(folderName);
        if (!folder) {
            folder = await createFolder(folderName);
          }

        const response = saveFile(fileName, fs.createReadStream(fileName), mimeType, folder.id)         
        fs.unlinkSync(fileName); // Delete temporary file after upload

        res.json({ message: 'Image uploaded successfully!', fileId: response.data.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading image' });
    }
});

app.listen(port, () => {
 console.log(`Server is running at http://localhost:${port}`);
});