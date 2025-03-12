const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function process_image(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Path to the uploaded file
        const imagePath = req.file.path;

        // Create a FormData object and append the image
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));

        // Send the image to the Flask API using fetch
        const flaskResponse = await fetch('http://127.0.0.1:3000/predict', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(), // Automatically sets Content-Type
        });

        // Check if the request was successful
        if (!flaskResponse.ok) {
            throw new Error(`HTTP error! Status: ${flaskResponse.status}`);
        }

        // Parse the JSON response
        const responseData = await flaskResponse.json();

        // Send the Flask API response back to the client
        res.status(200).json({
            message: 'Image uploaded successfully',
            data: responseData,
        });
    } catch (error) {
        console.error('Error uploading image:', error.message);
        res.status(500).json({
            message: 'Failed to upload image',
            error: error.message,
        });
    }
}

module.exports = {
    process_image
}