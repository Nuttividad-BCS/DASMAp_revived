from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
@app.route('/')
def home():
    return jsonify(message="Flask backend is running successfully on Railway!")

@app.route('/test-button', methods=['POST'])
def test_button():
    print("✅ Button clicked! Backend received the signal.")
    return jsonify(message="Backend received the button click!")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
