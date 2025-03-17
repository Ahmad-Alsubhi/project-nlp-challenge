from flask import Flask, request, jsonify, render_template, send_file
import joblib
import pandas as pd

app = Flask(__name__)

# Load the trained model and TF-IDF vectorizer
model = joblib.load('models/NLP_model.pkl')
vectorizer = joblib.load('models/tfidf_vectorizer.pkl')

# Homepage route
@app.route('/templates')
def index():
    return render_template('index.html')

# Method 1: Process direct text input from the user
@app.route('/predict_text', methods=['POST'])
def predict_text():
    text = request.form.get("text")
    
    # Check if text input is provided
    if not text:
        return jsonify({"error": "No text input provided"}), 400

    # Transform the text using the TF-IDF vectorizer
    X_transformed = vectorizer.transform([text])
    # Make a prediction using the model
    prediction = model.predict(X_transformed)[0]

    # Return the prediction as a JSON response
    return jsonify({"prediction": int(prediction)})

# Method 2: Process a text file (txt) and analyze its content
@app.route('/predict_file', methods=['POST'])
def predict_file():
    # Check if a file is included in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file found!"}), 400

    file = request.files['file']
    # Check if the user selected a file
    if file.filename == '':
        return jsonify({"error": "No file selected!"}), 400

    # Read the content of the text file
    text = file.read().decode("utf-8").strip()

    # Transform the text using the TF-IDF vectorizer
    X_transformed = vectorizer.transform([text])
    # Make a prediction using the model
    prediction = model.predict(X_transformed)[0]

    # Return the prediction as a JSON response
    return jsonify({"prediction": int(prediction)})

# Method 3: Process a CSV or Excel file and analyze the 'text' column
@app.route('/predict_csv', methods=['POST'])
def predict_csv():
    # Check if a file is included in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file found!"}), 400

    file = request.files['file']
    # Check if the user selected a file
    if file.filename == '':
        return jsonify({"error": "No file selected!"}), 400

    # Extract the file extension (csv or xlsx)
    file_ext = file.filename.split('.')[-1].lower()
    
    # Read the data based on the file extension
    if file_ext == 'csv':
        df = pd.read_csv(file)
    elif file_ext in ['xlsx', 'xls']:
        df = pd.read_excel(file)
    else:
        return jsonify({"error": "File must be in CSV or Excel format!"}), 400

    # Check if the 'text' column exists in the file
    if 'text' not in df.columns:
        return jsonify({"error": "The file must contain a 'text' column!"}), 400

    # Transform the text data using the TF-IDF vectorizer
    X_transformed = vectorizer.transform(df['text'])
    # Make predictions using the model
    predictions = model.predict(X_transformed)

    # Add the predictions as a new column in the dataframe
    df['target'] = predictions

    # Save the updated dataframe with predictions to a new file
    new_filename = "after_predict.csv"
    df.to_csv(new_filename, index=False)

    # Return the new file as an attachment for download
    return send_file(new_filename, as_attachment=True)

# Run the application
if __name__ == '__main__':
    app.run()