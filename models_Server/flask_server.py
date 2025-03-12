from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
from torchvision import models, transforms
import io
import base64
import torch.nn as nn

# Initialize Flask app
app = Flask(__name__)

# Load a pre-trained model (e.g., DenseNet)
Densenet = models.densenet121()
Densenet.classifier = nn.Linear(Densenet.classifier.in_features, 13)
Densenet.load_state_dict(torch.load('D:\Graduation_Project_Web\Back-end\models_Server\densenet_trained_model_epoch_2.pth'))
Densenet.eval()

# Define image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

class_labels = [
    "Cardiomegaly", "Effusion", "Infiltration",
    "Mass", "Nodule", "Pneumonia", "Pneumothorax",
    "Consolidation", "Edema", "Emphysema", "Fibrosis",
    "Pleural_Thickening", "Hernia"
]

# Route to handle image upload and processing
@app.route('/predict', methods=['POST'])
def predict():
    # Check if the request contains image data
    if 'file' not in request.files and 'image' not in request.json:
        return jsonify({"error": "No image data provided"}), 400

    try:
        # Handle binary image data (e.g., from form-data)
        if 'file' in request.files:
            file = request.files['file']
            image = Image.open(io.BytesIO(file.read())).convert('RGB')

        # Handle base64-encoded image data (e.g., from JSON)
        elif 'image' in request.json:
            image_data = request.json['image']
            image_bytes = base64.b64decode(image_data)  # Decode base64
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        input_tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            output = Densenet(input_tensor)
            probabilities = torch.sigmoid(output).squeeze(0).cpu().numpy()

        # Confidence threshold
        threshold = 0.5
        predicted_classes = [class_labels[i] for i, prob in enumerate(probabilities) if prob > threshold]


        # Return the prediction
        return jsonify({
            "message": "Image processed successfully",
            "predicted_class": predicted_classes
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to process image: {str(e)}"}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(port = 3000)
    CORS(app)  