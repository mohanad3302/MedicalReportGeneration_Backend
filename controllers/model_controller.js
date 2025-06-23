const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
const Reports = require('../schemas/reports_schema');
const mongoose = require('mongoose');
const XrayImages = require('../schemas/images_schema');
const {sendEmail} = require('../controllers/notification_controller');
const dotenv = require('dotenv').config();
const {getDoctorWithLeastReports} = require('./doctor_controller');
const cloudinary = require('cloudinary').v2;

async function process_image(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const userId = req.params.userId;
        const tempPath = req.file.path;

        const cloudinaryRes = await cloudinary.uploader.upload(tempPath , {
            folder : 'xray_uploads'
        });

        const imagePath = cloudinaryRes.secure_url;

        fs.unlinkSync(tempPath)

        const flaskResponse = await fetch(`${process.env.NGROK_LINK}/predict`, {
            method: 'POST',
            headers:  { 'Content-Type': 'application/json' },
            body: JSON.stringify({image:imagePath})
        });

    
        if (!flaskResponse.ok) {
            throw new Error(`HTTP error! Status: ${flaskResponse.status}`);
        }

        // Parse the JSON response
        const responseData = await flaskResponse.json();
        const disease = responseData.predicted_class[0]
        const report = await GenerateReport(disease)
        // Send the Flask API response back to the client

       
        saveReport = await SaveReportAndImage (imagePath,userId, disease, report.impression, report.recommendation)
        
       
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
    const openRouterApiKey = process.env.MODEL_API_KEY
    const model = "meta-llama/llama-3.3-70b-instruct:free";
    
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

  const SaveReportAndImage = async (ImageUrl,userId, disease, impression, recommendation) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId)
        const newImage = new XrayImages({
            UserId: userObjectId,
            ImageUrl: ImageUrl
        });
        
        saveImage = await newImage.save();
        console.log("Image saved successfully");

        const leastDoctor = await getDoctorWithLeastReports();
        console.log("Least Doctor:", leastDoctor);
        const doctorObjectId = new mongoose.Types.ObjectId(leastDoctor._id);
        const newReport = new Reports({
            UserId: userObjectId,
            DoctorId: doctorObjectId,
            XrayImageId: saveImage._id,
            Disease: disease,
            Impression: impression,
            Findings: disease
        });

        await sendEmail({
            to: leastDoctor.Email,
            subject: 'New X-ray Report Assigned',
            text: `A new X-ray report has been assigned to you. Please check the system for details.`
        });

        await newReport.save();
        console.log("Report saved successfully");
    } catch (error) {
        console.error("Error saving report:", error);
    }
}



module.exports = {
    process_image
}