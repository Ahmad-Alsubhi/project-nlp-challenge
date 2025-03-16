# from flask import Flask, render_template, request, send_file
# import pandas as pd
# import joblib
# import os

# app = Flask(__name__)

# # تحميل النموذج المحفوظ
# model = joblib.load('NLP_model.pkl')  # نموذج التصنيف
# vectorizer = joblib.load('tfidf_vectorizer.pkl')  # نموذج تحويل النصوص إلى أرقام

# @app.route('/templates')
# def index():
#     return render_template('index.html')

# @app.route('/uploadfile', methods=['POST'])
# def upload_file():
#     if 'file' not in request.files:
#         return "لم يتم العثور على ملف!", 400

#     file = request.files['file']
#     if file.filename == '':
#         return "لم يتم اختيار ملف!", 400

#     # قراءة ملف CSV
#     df = pd.read_csv(file)

#     # التحقق من وجود العمود المطلوب
#     if 'text' not in df.columns:
#         return "يجب أن يحتوي الملف على عمود 'text'.", 400

#     # تحويل النصوص إلى أرقام باستخدام TF-IDF
#     X_transformed = vectorizer.transform(df['text'])

#     # تنفيذ التنبؤ
#     predictions = model.predict(X_transformed)

#     # إضافة القيم المتوقعة إلى العمود الجديد
#     df['target'] = predictions

#     # حفظ الملف الجديد
#     new_filename = "after_predict.csv"
#     df.to_csv(new_filename, index=False)

#     return send_file(new_filename, as_attachment=True)

# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
import joblib
import os

app = Flask(__name__)

# تحميل النموذج والـ TF-IDF Vectorizer
model = joblib.load('NLP_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

@app.route('/templates')
def index():
    return render_template('index.html')

# الطريقة 1: معالجة إدخال نص مباشر
@app.route('/predict_text', methods=['POST'])
def predict_text():
    text = request.form.get("text")
    
    if not text:
        return jsonify({"error": "لم يتم إدخال أي نص"}), 400

    # تحويل النص إلى شكل مناسب للنموذج
    X_transformed = vectorizer.transform([text])
    prediction = model.predict(X_transformed)[0]

    return jsonify({"prediction": int(prediction)})

# الطريقة 2: رفع ملف نصي (txt) وتحليل محتواه
@app.route('/predict_file', methods=['POST'])
def predict_file():
    if 'file' not in request.files:
        return jsonify({"error": "لم يتم العثور على ملف!"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "لم يتم اختيار ملف!"}), 400

    # قراءة محتوى الملف
    text = file.read().decode("utf-8").strip()

    # تحويل النص إلى شكل مناسب للنموذج
    X_transformed = vectorizer.transform([text])
    prediction = model.predict(X_transformed)[0]

    return jsonify({"prediction": int(prediction)})

# الطريقة 3: رفع ملف CSV أو Excel وتحليل عمود text
@app.route('/predict_csv', methods=['POST'])
def predict_csv():
    if 'file' not in request.files:
        return jsonify({"error": "لم يتم العثور على ملف!"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "لم يتم اختيار ملف!"}), 400

    file_ext = file.filename.split('.')[-1].lower()
    
    # قراءة البيانات من CSV أو Excel
    if file_ext == 'csv':
        df = pd.read_csv(file)
    elif file_ext in ['xlsx', 'xls']:
        df = pd.read_excel(file)
    else:
        return jsonify({"error": "يجب رفع ملف بصيغة CSV أو Excel!"}), 400

    # التحقق من وجود العمود المطلوب
    if 'text' not in df.columns:
        return jsonify({"error": "يجب أن يحتوي الملف على عمود 'text'!"}), 400

    # تنفيذ التنبؤ
    X_transformed = vectorizer.transform(df['text'])
    predictions = model.predict(X_transformed)

    # إضافة القيم المتوقعة إلى العمود الجديد
    df['target'] = predictions

    # حفظ الملف الجديد
    new_filename = "after_predict.csv"
    df.to_csv(new_filename, index=False)

    return send_file(new_filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
