# Reciept Tracker

### Overview

The goal of this project is to  simplifu the process of tracking and managing receipts by leveraging Amazon Web Services (AWS). This solution automates the extraction and storage of receipt data, offering an efficient way to handle receipts digitally.

### Features

Receipt Upload: Users can upload receipts via a React frontend, which sends the receipts to an Amazon S3 bucket.
Text Extraction: Amazon Textract analyzes the uploaded receipts and extracts relevant information, such as items and prices.
Data Storage: Extracted data is then stored in an Amazon DynamoDB table and is displayed on the React frontend

### Technologies Used
React: Frontend framework used for the user interface and receipt upload functionality.
Amazon S3: Storage for uploaded receipt images.
Amazon Textract: Service for extracting text from images.
Amazon DynamoDB: NoSQL database for storing extracted data.

This project was created by Haseeb Siddiqi


### 

React Home page 
(https://github.com/HaseebSiddiqi/Receipt-Tracker/blob/master/images/Receipt%20home%20page.png)


(https://github.com/HaseebSiddiqi/Receipt-Tracker/blob/master/images/Receipt%20upload.png)

Receipts are uploaded to a S3 bucket
(https://github.com/HaseebSiddiqi/Receipt-Tracker/blob/master/images/s3%20bucket.png)

The extracted information is stored in DynamoDB and then displayed here
(https://github.com/HaseebSiddiqi/Receipt-Tracker/blob/master/images/Reciepts%20table.png)


