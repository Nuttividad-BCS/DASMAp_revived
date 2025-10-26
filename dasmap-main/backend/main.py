import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from flask import Flask, jsonify, request
from flask_cors import CORS
from batch_predict_dengue import run_batch_prediction

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify(message="Flask backend is running successfully on Railway!")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    year = data.get('year', 2023)
    month = data.get('month', 1)

    # Optional: custom weather data from frontend
    shared_weather = data.get('weather', None)

    try:
        results = run_batch_prediction(year, month, shared_weather)
        return jsonify(results.to_dict(orient='records'))
    except Exception as e:
        return jsonify(error=str(e)), 500


if __name__ == '__main__':
    app.run(host='-1.0.0.0', port=8080)
