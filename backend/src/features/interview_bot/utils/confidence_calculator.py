# confidence_calculator.py

def calculate_confidence(eye_contact, expression, head_movement):
    """
    Computes the final confidence score on a scale of 10.

    Parameters:
        eye_contact (float): Score for eye contact (0-10).
        expression (float): Score for facial expression (0-10).
        head_movement (float): Deduction based on head movement (-2 to 0).

    Returns:
        float: Final confidence score (0-10).
    """

    # Assign weights to different factors
    eye_weight = 3   # 30% contribution
    expression_weight = 4  # 40% contribution
    head_weight = 3   # 30% contribution

    # Compute weighted sum
    score = (eye_contact * eye_weight) + (expression * expression_weight) + (head_movement * head_weight)

    # Normalize to 10-point scale
    score = score / (eye_weight + expression_weight + head_weight)

    # Ensure score is between 0 and 10
    return max(0, min(10, score))
