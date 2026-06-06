# Reciept Tracker

### Overview

The goal of this project is to  simplify the process of tracking and managing receipts by leveraging Amazon Web Services (AWS). This projects automates the extraction and storage of receipt data, offering an easy way to handle receipts digitally.

### Features

Receipt Upload: Users can upload receipts via a React frontend, which sends the receipts to an Amazon S3 bucket.

Text Extraction: Amazon Textract analyzes the uploaded receipts and extracts important information, such as items and prices.

Data Storage: Extracted data is then stored in an Amazon DynamoDB table and is displayed on the React frontend

### Technologies Used
React: Frontend framework used for the user interface and receipt upload functionality.

Amazon S3: Storage for uploaded receipt images.

Amazon Textract: Service for extracting text from images.

Amazon DynamoDB: NoSQL database for storing extracted data.

This project was created by Haseeb Siddiqi


### 

## Receipt Upload

![Receipt Upload](https://github.com/HaseebSiddiqi/Receipt-Tracker/raw/master/images/Receipt%20upload.png)

## S3 Bucket

Receipts are uploaded to an S3 bucket:

![S3 Bucket](https://github.com/HaseebSiddiqi/Receipt-Tracker/raw/master/images/s3%20bucket.png)

## DynamoDB Table

The extracted information is stored in DynamoDB and then displayed here:

![DynamoDB Table](https://github.com/HaseebSiddiqi/Receipt-Tracker/raw/master/images/Reciepts%20table.png)




---

## Setup Instructions

### 1. Install Python dependencies

Run inside the `flask/` folder:

```bash
python -m pip install flask boto3 flask-cors python-dotenv

### 2. Create .env file 
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

AWS_BUCKET_NAME=my-receipts
DYNAMODB_TABLE=Receipts

#3 Run backend 
cd flask
python app.py

#4 Install npm dependencies
npm install

#5 Run frontend
npm start