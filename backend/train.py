import os
import urllib.request
import zipfile
import librosa
import numpy as np
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

DATASET_URL = "https://zenodo.org/api/records/1188976/files/Audio_Speech_Actors_01-24.zip/content"
ZIP_PATH = "ravdess_speech.zip"
EXTRACT_PATH = "ravdess_audio"

# Emotion mapping to stress score (0-100)
# 01 = neutral, 02 = calm, 03 = happy, 04 = sad, 05 = angry, 06 = fearful, 07 = disgust, 08 = surprised
EMOTION_TO_STRESS = {
    '01': 10,  # Neutral
    '02': 5,   # Calm
    '03': 15,  # Happy
    '04': 60,  # Sad (withdrawn)
    '05': 80,  # Angry (agitated)
    '06': 95,  # Fearful (highly stressed)
    '07': 70,  # Disgust
    '08': 40   # Surprised
}

def extract_features(file_path):
    # Load audio file using librosa
    try:
        y, sr = librosa.load(file_path, sr=22050, duration=3)
        # Extract MFCCs
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        # Calculate mean of MFCCs over time
        mfccs_mean = np.mean(mfccs.T, axis=0)
        
        # Extract additional features for better accuracy
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
        centroid_mean = np.mean(spectral_centroids)
        
        rms = librosa.feature.rms(y=y)
        rms_mean = np.mean(rms)
        
        # Combine features
        features = np.hstack([mfccs_mean, centroid_mean, rms_mean])
        return features
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def download_and_extract():
    if not os.path.exists(ZIP_PATH) and not os.path.exists(EXTRACT_PATH):
        print("Downloading RAVDESS dataset (approx 200MB)...")
        urllib.request.urlretrieve(DATASET_URL, ZIP_PATH)
        print("Download complete.")
        
    if not os.path.exists(EXTRACT_PATH):
        print("Extracting zip file...")
        with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
            zip_ref.extractall(EXTRACT_PATH)
        print("Extraction complete.")

def build_dataset():
    features = []
    labels = []
    
    # RAVDESS files are organized in Actor_XX folders
    print("Extracting audio features... this may take a few minutes.")
    for root, dirs, files in os.walk(EXTRACT_PATH):
        for file in files:
            if file.endswith(".wav"):
                # Filename format: 03-01-06-01-02-01-12.wav
                # The 3rd part is the emotion
                parts = file.split("-")
                if len(parts) >= 3:
                    emotion = parts[2]
                    stress_score = EMOTION_TO_STRESS.get(emotion, 50)
                    
                    file_path = os.path.join(root, file)
                    feat = extract_features(file_path)
                    if feat is not None:
                        features.append(feat)
                        labels.append(stress_score)
                        
    return np.array(features), np.array(labels)

def train_model():
    download_and_extract()
    X, y = build_dataset()
    
    print(f"Dataset shape: X={X.shape}, y={y.shape}")
    
    # Split the dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    print("Training Random Forest Regressor model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    print(f"Model Mean Squared Error on test set: {mse:.2f}")
    
    # Save the model
    with open("stress_model.pkl", "wb") as f:
        pickle.dump(model, f)
    print("Model successfully saved to 'stress_model.pkl'")

if __name__ == "__main__":
    train_model()
