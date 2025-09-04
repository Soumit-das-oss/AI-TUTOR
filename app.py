import os
import re
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# ✅ Setup Gemini API (read from env variable)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# ✅ Initialize model
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route("/")
def index():
    return render_template("index.html")

# ✅ AI-powered Quiz Generator
@app.route("/generate_quiz", methods=["POST"])
def generate_quiz():
    data = request.json
    topic = data.get("topic", "").strip()

    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    prompt = f"""
You are an AI quiz generator. Create 3 unique multiple-choice questions based on the topic: "{topic}".

Each question must:
- Be directly related to the topic
- Have exactly 4 answer options
- Indicate the correct answer clearly

Respond ONLY with valid JSON like:

[
  {{
    "question": "Your question here",
    "options": ["A", "B", "C", "D"],
    "answer": "Correct option text"
  }},
  ...
]
DO NOT include ```json, explanation, markdown, or any notes. Only output raw JSON.
"""

    try:
        response = model.generate_content(prompt)
        ai_text = response.text.strip()

        # Extract only JSON
        json_match = re.search(r"\[\s*{.*?}\s*]", ai_text, re.DOTALL)
        if not json_match:
            raise ValueError("Could not find JSON array in AI response.")

        quiz_data = json.loads(json_match.group(0))
        return jsonify(quiz_data)

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": "Failed to generate quiz", "details": str(e)}), 500

# ✅ Text Explanation
@app.route("/explain", methods=["POST"])
def explain():
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        response = model.generate_content(text)
        return jsonify({"result": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Local run
if __name__ == "__main__":
    app.run(debug=True)
