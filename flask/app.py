from flask import Flask, request, jsonify
import boto3
from botocore.exceptions import NoCredentialsError
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Initialize the S3 client
s3 = boto3.client('s3')
textract = boto3.client('textract')
bucket_name = 'my-receipts'  # Replace with your actual bucket name

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"})
    
    try:
        # Upload the file to S3
        s3.upload_fileobj(file, bucket_name, file.filename)
        
        # Analyze the receipt using Amazon Textract
        response = textract.analyze_expense(
            Document={'S3Object': {'Bucket': bucket_name, 'Name': file.filename}}
        )

        # Extract line items, prices, subtotal, and total
        items = []
        prices = []
        subtotal = "Subtotal not found"
        total = "Total not found"

        for expense_doc in response.get('ExpenseDocuments', []):
            for item_group in expense_doc.get('LineItemGroups', []):
                for line_item in item_group.get('LineItems', []):
                    item_name = None
                    item_price = None

                    for field in line_item.get('LineItemExpenseFields', []):
                        field_type = field.get('Type', {}).get('Text', '')
                        field_value = field.get('ValueDetection', {}).get('Text', '')

                        if 'ITEM' in field_type.upper():
                            item_name = field_value
                        elif 'PRICE' in field_type.upper():
                            item_price = field_value
                        elif 'SUBTOTAL' in field_type.upper() or 'SUB TOTAL' in field_type.upper():
                            subtotal = field_value

                    if item_name:
                        items.append(item_name)
                        if item_price:
                            prices.append(item_price)
                        else:
                            prices.append("Price not found")

            for field in expense_doc.get('SummaryFields', []):
                field_type = field.get('Type', {}).get('Text', '')
                field_value = field.get('ValueDetection', {}).get('Text', '')

                if 'TOTAL' in field_type.upper():
                    total = field_value

                if 'SUBTOTAL' in field_type.upper() or 'SUB TOTAL' in field_type.upper():
                    subtotal = field_value

        return jsonify({
            "message": "Upload Successful",
            "filename": file.filename,
            "items": items,
            "prices": prices,
            "subtotal": subtotal,
            "total": total
        })
        
    except Exception as e:
        print(e)  # Print the exception to the console for debugging
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
