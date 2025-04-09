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
        const flaskResponse = await fetch('http://127.0.0.1:3001/predict', {
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
            impression : report.impression,
            recommendation : report.recommendation
        });
    } catch (error) {
        console.error('Error uploading image:', error.message);
        res.status(500).json({
            message: 'Failed to upload image',
            error: error.message,
        });
    }
}

async function GenerateReport(predictedClass) {
    const openRouterApiKey = "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";
    const model = "deepseek/deepseek-r1-zero:free";
    
    const messages = [
  {
    role: "system",
    content: `You are an expert radiologist. Based on the input disease/condition, generate 
a radiology report with two clearly labeled sections. Follow these rules:
1. IMPRESSION: provide a brief and factual description of the disease or condition, focusing only on general characteristicswithout specifying location 
or laterality (since this information isn't provided). Keep it concise .
2. RECOMMENDATION: Provide appropriate clinical follow-up suggestions.
3. Use exact formatting: 'IMPRESSION:' and 'RECOMMENDATION:' in all caps with colons.
4. Never assume or invent details not provided in the input.
5. If multiple findings are provided, address each separately but concisely.`
  },
  {
    role: "user",
    content: `Finding: ${predictedClass}. Generate a report without specifying location.`
  }
];

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
            "Authorization": `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
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
        const reportData = data.choices[0].message.content;
        let impression_part = "";
        let recommendation_part =""; 

        if (reportData.includes("IMPRESSION:") && reportData.includes("RECOMMENDATION:")) {

            const parts = reportData.split("IMPRESSION:");
            console.log(parts)
            const impressionAndRecommendation = parts[1].split("RECOMMENDATION:");
            impression_part = impressionAndRecommendation[0].trim();
            recommendation_part = impressionAndRecommendation[1].trim();
        }
        return {
            impression:impression_part, 
            recommendation:recommendation_part
        };

    } catch (error) {
      console.error("Error fetching radiology description:", error);
      return null;
    }
  }



module.exports = {
    process_image
}