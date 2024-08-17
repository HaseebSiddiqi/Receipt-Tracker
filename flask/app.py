from flask import Flask, request, jsonify, send_file
import boto3
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app)

# Initialize the S3 and Textract clients
s3 = boto3.client('s3')
textract = boto3.client('textract')
bucket_name = 'my-receipts'  # Replace with your actual bucket name.



dynamodb = boto3.resource('dynamodb')
table_name = 'Receipts'  # Replace with your actual table name
table = dynamodb.Table(table_name)


def parse_textract_response(response):
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

    return items, prices, subtotal, total

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

        items, prices, subtotal, total = parse_textract_response(response)
        
        for idx, (item, price) in enumerate(zip(items, prices)):
            table.put_item(
                Item={
                    'ReceiptName': f"{file.filename}: Item #{idx + 1}",     # Partition Key
                    'Item Name': item,                # Item name
                    'Price': price,                   # Item price
                }
            )

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

@app.route('/list', methods=['GET'])
def list_files():
    try:
        response = s3.list_objects_v2(Bucket=bucket_name)
        files = [obj['Key'] for obj in response.get('Contents', [])]
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/file/<filename>', methods=['GET'])
def get_file(filename):
    try:
        s3_response = s3.get_object(Bucket=bucket_name, Key=filename)
        return send_file(io.BytesIO(s3_response['Body'].read()), mimetype='image/jpeg')
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/extract', methods=['POST'])
def extract_text():
    data = request.json
    filename = data.get('filename')

    if not filename:
        return jsonify({"error": "No filename provided"}), 400

    try:
        response = textract.analyze_expense(
            Document={'S3Object': {'Bucket': bucket_name, 'Name': filename}}
        )

        items, prices, subtotal, total = parse_textract_response(response)

        return jsonify({
            "message": "Extraction Successful",
            "filename": filename,
            "items": items,
            "prices": prices,
            "subtotal": subtotal,
            "total": total
        })

    except Exception as e:
        print(e)  # Print the exception to the console for debugging
        return jsonify({"error": str(e)}), 400


@app.route('/get-receipts', methods=['GET'])
def get_receipts():
    try:
        response = table.scan()  # Scan the entire table
        items = response.get('Items', [])
        return jsonify(items)
    except Exception as e:
        print(e)  # Print the exception to the console for debugging
        return jsonify({"error": str(e)}), 400





if __name__ == '__main__':
    app.run(debug=True)
