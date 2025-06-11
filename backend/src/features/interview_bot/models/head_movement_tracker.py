import cv2
import numpy as np

def detect_head_movement(current_frame, prev_frame):
    """ Calculate head movement using frame difference """
    if prev_frame is None:
        return 0  # No penalty on first frame

    diff = cv2.absdiff(current_frame, prev_frame)
    movement = np.mean(diff)

    if movement > 30:  # Threshold for excessive movement
        return 2  # Deduct 2 points
    return 0
