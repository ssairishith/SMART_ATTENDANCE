import insightface
import os

_model = None

def get_model():
    """
    Returns a singleton instance of the FaceAnalysis model.
    Loading it once saves memory on resource-constrained environments like Render.
    """
    global _model
    if _model is None:
        print(">>> Loading ArcFace model (CPU Singleton) <<<")
        # Ensure we use buffalo_l as established in the project
        _model = insightface.app.FaceAnalysis(name="buffalo_l")
        _model.prepare(ctx_id=-1, det_size=(640, 640))
    return _model
