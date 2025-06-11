import cv2
import mediapipe as mp

# Initialize MediaPipe FaceMesh solution
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,         # For video stream
    max_num_faces=1,                 # One face at a time
    refine_landmarks=True,          # Iris landmarks included
    min_detection_confidence=0.5,    # Face detection threshold
    min_tracking_confidence=0.5      # Landmark tracking threshold
)

def get_eye_contact_ratio(frame):
    """
    Detect eye contact using facial landmarks.
    Returns 10 if face/eyes are detected, otherwise 3.
    """
    try:
        # Convert BGR frame to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Run FaceMesh
        results = face_mesh.process(frame_rgb)

        if results.multi_face_landmarks:
            return 10  # Eye contact detected
        else:
            return 3   # No eye contact

    except Exception as e:
        print(f"Eye Contact Detection Error: {e}")
        return 3  # Return default low value on error
