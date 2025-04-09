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
        const disease = responseData.predicted_class[0]
        const report = await GenerateReport(disease)
        // Send the Flask API response back to the client
        res.status(200).json({
            message: 'Image uploaded successfully',
            predicted_disease: disease,
            generated_report : report
        });
    } catch (error) {
        console.error('Error uploading image:', error.message);
        res.status(500).json({
            message: 'Failed to upload image',
            error: error.message,
        });
    }
}

async function GenerateReport(predictedClasses) {
    const openRouterApiKey = "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";
    const model = "deepseek/deepseek-r1-zero:free";
    
    const messages = [
      {
        role: "system",
        content: "You are an expert radiologist. Based on the input disease or condition, your task is to provide a brief and factual description of the disease or condition, focusing only on general characteristics. Your response should be concise, accurate, and free from unnecessary details."
      },
      {
        role: "user",
        content: `Disease: ${predictedClasses}`
      }
    ];
  
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "<YOUR_SITE_URL>",  // Optional
          "X-Title": "<YOUR_SITE_NAME>",      // Optional
        },
        body: JSON.stringify({
          model: model,
          messages: messages
        })
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error fetching radiology description:", error);
      return null;
    }
  }

module.exports = {
    process_image
}