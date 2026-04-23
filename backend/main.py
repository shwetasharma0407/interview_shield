import os
import pickle
import numpy as np
import librosa
from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile

app = Flask(__name__)
CORS(app) # Allow CORS from Next.js frontend

# Load the trained model
MODEL_PATH = "stress_model.pkl"
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print("Model loaded successfully.")
except FileNotFoundError:
    print("WARNING: Model not found. Please run train.py first.")
    model = None

def extract_features(audio_path):
    """Same feature extraction pipeline used in training."""
    try:
        y, sr = librosa.load(audio_path, sr=22050)
        if len(y) == 0:
            return None
        
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfccs_mean = np.mean(mfccs.T, axis=0)
        
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
        centroid_mean = np.mean(spectral_centroids)
        
        rms = librosa.feature.rms(y=y)
        rms_mean = np.mean(rms)
        
        features = np.hstack([mfccs_mean, centroid_mean, rms_mean])
        return features
    except Exception as e:
        print(f"Feature extraction error: {e}")
        return None

@app.route("/api/analyze-audio", methods=["POST"])
def analyze_audio():
    """Receives a chunk of audio from the browser, predicts stress, and returns the score."""
    if model is None:
        return jsonify({"error": "Model not loaded", "score": 25}), 500

    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided", "score": 25}), 400
        
    audio_file = request.files['audio']
    
    try:
        # Save uploaded audio chunk to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name
            
        # Extract features
        features = extract_features(temp_path)
        
        # Clean up temp file
        os.remove(temp_path)
        
        if features is None:
            return jsonify({"error": "Could not process audio", "score": 25}), 400
            
        # Predict stress score
        score = model.predict([features])[0]
        
        return jsonify({
            "score": float(score),
            "status": "success"
        })
        
    except Exception as e:
        print(f"Server error: {e}")
        return jsonify({"error": str(e), "score": 25}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "model_loaded": model is not None})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
