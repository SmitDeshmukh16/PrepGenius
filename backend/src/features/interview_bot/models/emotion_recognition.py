from deepface import DeepFace
import cv2
import numpy as np

def get_facial_expression_score(frame):
    """ Analyze facial expression and return a confidence score """
    try:
        # Convert frame to RGB (DeepFace requires RGB format)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Analyze emotions using DeepFace
        result = DeepFace.analyze(frame_rgb, actions=['emotion'], enforce_detection=False)

        # Extract dominant emotion
        if isinstance(result, list):
            result = result[0]

        dominant_emotion = result.get('dominant_emotion', 'neutral')

        # Assign scores based on emotions (scale of 0-10)
        emotion_scores = {
            'angry': 2,
            'disgust': 3,
            'fear': 3,
            'happy': 9,
            'sad': 4,
            'surprise': 6,
            'neutral': 5
        }

        return emotion_scores.get(dominant_emotion, 5)

    except Exception as e:
        print(f"Emotion Recognition Error: {e}")
        return 5  # Default neutral score if detection fails
