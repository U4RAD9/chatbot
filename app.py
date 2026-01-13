from flask import Flask, render_template, request, jsonify
from flask_cors import CORS, cross_origin
from flask_mysqldb import MySQL
from chat import get_response
from twilio.rest import Client
import sqlite3
import os
import requests
from waitress import serve
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.wsgi_app = ProxyFix(
    app.wsgi_app,
    x_for=1,
    x_proto=1,
    x_host=1,
    x_port=1
)
app.config["TRUSTED_HOSTS"] = [
    "chatbot.xraidigital.com",
    "127.0.0.1",
    "localhost"
]

# --------------------------------------------------
# CORS
# --------------------------------------------------
CORS(app, support_credentials=True)

# --------------------------------------------------
# MYSQL CONFIG (MOVE BEFORE ROUTES)
# --------------------------------------------------
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'your_current_password'
app.config['MYSQL_DB'] = 'chatbot'

mysql = MySQL(app)

# --------------------------------------------------
# ROUTES
# --------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login")
@cross_origin(supports_credentials=True)
def login():
    return jsonify({'success': 'ok'})


@app.post("/predict")
def predict():
    data = request.get_json()
    text = data.get("message", "")
    response = get_response(text)
    return jsonify({"answer": response})


API_URL = "https://app2.cunnekt.com/v1/sendnotification"
API_KEY = "2cf92a4cd9d7741831313ef65de6af61209e56cf"
TEMPLATE_ID = "2585365148502796"


@app.route("/book-appointment", methods=["POST"])
def book_appointment():
    try:
        data = request.json or {}

        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email")

        if not name or not phone:
            return jsonify({
                "answer": "❌ Name and phone are required."
            }), 400
        DB_PATH = os.path.join(os.path.dirname(__file__), "sqlite.db")

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO callback_requests (name, phone, email)
            VALUES (?, ?, ?)
        """, (name, phone, email))

        conn.commit()
        conn.close()

        # Send WhatsApp notification (optional)
        # ---------- Send WhatsApp via Cunnekt ----------
        try:
            payload = {
                "mobile": 919122878369,  # format: 91XXXXXXXXXX
                "templateid": TEMPLATE_ID,
                "overridebot": "yes",
                "template": {
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {"type": "text", "text": name},
                                {"type": "text", "text": phone},
                                {"type": "text", "text": email}
                            ]
                        }
                    ]
                }
            }

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            }

            response = requests.post(API_URL, json=payload, headers=headers, timeout=10)
            response.raise_for_status()

        except Exception as e:
            print("⚠️ WhatsApp API error:", e)

        return jsonify({
            "answer": "✅ Thank you! Your call-back request has been saved."
        }), 200

    except Exception as e:
        print("❌ SQLite Error:", e)
        return jsonify({
            "answer": "❌ Internal server error."
        }), 500


@app.route("/admin")
def admin_page():
    try:
        DB_PATH = os.path.join(os.path.dirname(__file__), "sqlite.db")
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM callback_requests ORDER BY id DESC")
        requests = cursor.fetchall()
        conn.close()

        return render_template("admin.html", requests=requests)

    except Exception as e:
        return f"Error fetching requests: {e}"






if __name__ == "__main__":
    print("🚀 Starting Flask app with Waitress on 127.0.0.1:5000")
    serve(app, host="0.0.0.0", port=5000)
