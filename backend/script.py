import boto3
from botocore.exceptions import NoCredentialsError

# Initialize the S3 client
s3 = boto3.client('s3')

# Define bucket and file details
bucket_name = 'my-receipts'  # Replace with your actual bucket name
file_name = 'c:/Users/hasee/Downloads/receipt.png'  # Path to your local file
s3_object_name = '2.png'

# Function to upload file to S3
def upload_to_s3(file_name, bucket, object_name=None):
    if object_name is None:
        object_name = file_name

    try:
        s3.upload_file(file_name, bucket, object_name)
        print(f"Upload Successful: {object_name}")
    except FileNotFoundError:
        print("The file was not found")
    except NoCredentialsError:
        print("Credentials not available")

# Upload the file
upload_to_s3(file_name, bucket_name, s3_object_name)

# Initialize the Textract client
textract = boto3.client('textract')

# Function to analyze the receipt using Textract's AnalyzeExpense API
def analyze_expense_receipt(bucket, document):
    response = textract.analyze_expense(
        Document={'S3Object': {'Bucket': bucket, 'Name': document}}
    )

    items = []
    prices = []
    subtotal = "Subtotal not found"
    total = "Total not found"

    # Extract line items and prices
    for expense_doc in response['ExpenseDocuments']:
        print("Items and Prices:")
        for item_group in expense_doc.get('LineItemGroups', []):
            for line_item in item_group['LineItems']:
                item_name = None
                item_price = None

                # Check each field to determine if it's an item name or price
                for field in line_item['LineItemExpenseFields']:
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

    # Extract subtotal and total
    for expense_doc in response['ExpenseDocuments']:
        for field in expense_doc['SummaryFields']:
            field_type = field.get('Type', {}).get('Text', '')
            field_value = field.get('ValueDetection', {}).get('Text', '')

          
            if 'TOTAL'in field_type.upper():
                total = field_value

            if 'SUBTOTAL' in field_type.upper() or 'SUB TOTAL' in field_type.upper():
                subtotal = field_value
          

    # Print all items, their corresponding prices, and the total/subtotal
    for i in range(len(items)):
        print(f"{items[i]}: {prices[i]}")

    print(f"Subtotal: {subtotal}")
    print(f"Total: {total}")


# Call the function to analyze the receipt
analyze_expense_receipt(bucket_name, s3_object_name)
