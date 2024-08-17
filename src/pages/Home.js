import React, { useState, useEffect } from 'react';

export default function Home() {
    const [image, setImage] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [items, setItems] = useState([]);
    const [prices, setPrices] = useState([]);
    const [subtotal, setSubtotal] = useState('');
    const [total, setTotal] = useState('');
    const [fileList, setFileList] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');

    // Fetch the list of files from the backend when the component mounts
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/list');
                const result = await response.json();
                if (result.files) {
                    setFileList(result.files);
                }
            } catch (error) {
                console.error('Error fetching file list:', error);
            }
        };

        fetchFiles();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:5000/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            setUploadStatus(result.message || result.error);
            setItems(result.items || []);
            setPrices(result.prices || []);
            setSubtotal(result.subtotal || 'Subtotal not found');
            setTotal(result.total || 'Total not found');
            
            // Refresh the file list after a new upload
            const fetchFiles = async () => {
                try {
                    const response = await fetch('http://127.0.0.1:5000/list');
                    const result = await response.json();
                    if (result.files) {
                        setFileList(result.files);
                    }
                } catch (error) {
                    console.error('Error fetching file list:', error);
                }
            };

            fetchFiles();
        } catch (error) {
            setUploadStatus('Upload failed');
        }
    };

    const handleFileSelect = async (filename) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/file/${filename}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setImage(url);
        } catch (error) {
            console.error('Error fetching file:', error);
            alert('Failed to fetch the selected file.');
        }
    };

    const handleExtract = async () => {
        if (!selectedFile) {
            alert('Please select a file to extract.');
            return;
        }

        try {
            // Extract text from the selected file
            const response = await fetch('http://127.0.0.1:5000/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename: selectedFile }),
            });
            const result = await response.json();
            setUploadStatus(result.message || result.error);
            setItems(result.items || []);
            setPrices(result.prices || []);
            setSubtotal(result.subtotal || 'Subtotal not found');
            setTotal(result.total || 'Total not found');
        } catch (error) {
            setUploadStatus('Extraction failed');
        }
    };

    return (
        <>
            <h1>Upload Receipts</h1>

            <form onSubmit={handleUpload} className='form'>
                <label htmlFor="fileInput" className="custom-file-upload">
                Choose a receipt to upload. Ensure the file name is unique and the image is clear.
                </label>
                <br />
                <input
                    type="file"
                    id="fileInput"
                    name="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                />
                <br />
                <button type="submit">Upload Image</button>
                {uploadStatus && <p>{uploadStatus}</p>}

                <h3>Select a receipt to extract text from:</h3>
                <select
                    onChange={(e) => {
                        const file = e.target.value;
                        setSelectedFile(file);
                        handleFileSelect(file);
                    }}
                    value={selectedFile} 
                    className='picker'
                >
                    <option value="">-- Select a file --</option>
                    {fileList.map((file, index) => (
                        <option key={index} value={file}>{file}</option>
                    ))}
                </select>
                <button type="button" onClick={handleExtract}>Extract Text</button>
            </form>

            <div className='container'>
                {image && (
                    <div className='image'>
                        <img src={image} alt="Preview" style={{ maxWidth: '400px', height: 'auto' }} />
                    </div>
                )}

                {items.length > 0 && (
                    <div className='extracted'>
                        <h3>Extracted Items and Prices</h3>
                        <ul>
                            {items.map((item, index) => (
                                <li key={index}>{item}: {prices[index]}</li>
                            ))}
                        </ul>
                        <p>SUBTOTAL: {subtotal}</p>
                        <p>TOTAL: {total}</p>
                    </div>
                )}
            </div>
        </>
    );
}
