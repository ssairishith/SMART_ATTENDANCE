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
        print(">>> Loading AI Model (buffalo_s Singleton) <<<")
        # buffalo_s is a smaller, faster ensemble than buffalo_l (512MB RAM safe)
        _model = insightface.app.FaceAnalysis(
            name="buffalo_s", 
            providers=['CPUExecutionProvider']
        )
        _model.prepare(ctx_id=-1, det_size=(640, 640))
    return _model
