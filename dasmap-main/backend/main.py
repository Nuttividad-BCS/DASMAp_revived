import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from flask import Flask, jsonify, request
from flask_cors import CORS
from batch_predict_dengue import run_batch_prediction
from batch_year_predict import batch_year_prediction

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

    try:
        results = run_batch_prediction(year, month)
        return jsonify(results.to_dict(orient='records'))
    except Exception as e:
        return jsonify(error=str(e)), 500
    
@app.route('/predict_year', methods=['POST'])
def predict_year():
    data = request.json
    activeBarangay = data.get('activeBarangay', 'SALAWAG')
    year = data.get('year', 1)

     # Optional: custom weather data from frontend
    shared_weather = data.get('weather', None)

    try:
        results = batch_year_prediction(year, activeBarangay, shared_weather)
        return jsonify(results.to_dict(orient='records'))
    except Exception as e:
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run(host='-1.0.0.0', port=8080)
