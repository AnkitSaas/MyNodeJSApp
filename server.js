const express = require('express');
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint to download audio
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('YouTube URL is required.');
    }

    // Create a unique output file path to avoid collisions
    const outputFilePath = path.resolve(__dirname, `${Date.now()}_%(title)s.%(ext)s`);

    try {
        const downloadOutput = await youtubedl(videoUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: outputFilePath,
        });

        // Log the download output to inspect the structure
        console.log('Download Output:', downloadOutput);

        // Use the unique path we defined
        const downloadedFileName = outputFilePath; 

        // Send the file with a 200 status code
        res.download(downloadedFileName, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                return res.status(500).send('Error downloading file.');
            }

            // Optionally, delete the file after sending
            fs.unlink(downloadedFileName, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                }
            });
        });

        // If you want to send a custom success response, use the following:
        // res.status(200).send({ message: 'Download successful', file: downloadedFileName });

    } catch (err) {
        console.error('Error:', err);
        return res.status(500).send('Error downloading video.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
