from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

parking_system_data = {
    "zones": [],
    "requests": []
}

@app.route('/')
def dashboard():
    return "<h1>Smart Parking System Dashboard</h1><p>System is running.</p>"

@app.route('/request-parking', methods=['POST'])
def handle_request():
    # Logic for allocation will go here later
    return jsonify({"message": "Request received"})

if __name__ == '__main__':
    # Codespaces usually uses port 5000
    app.run(debug=True, port=5000)