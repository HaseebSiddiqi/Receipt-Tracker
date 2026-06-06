import React, { useState, useEffect } from 'react';

export default function Home() {
    const [image, setImage] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [items, setItems] = useState([]);
    const [prices, setPrices] = useState([]);
    const [subtotal, setSubtotal] = useState('');
    const [total, setTotal] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
        
        setIsLoading(true);
        setUploadStatus('');

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
            
            // Extraction completed.
        } catch (error) {
            setUploadStatus('Upload failed');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="home-wrapper">
            <h1>Upload Receipts</h1>
            <div className="main-content">
                <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '500px' }}>
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
                            disabled={isLoading}
                        />
                        <br />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Extracting text...' : 'Upload Image'}
                        </button>
                        {uploadStatus && <p>{uploadStatus}</p>}
                    </form>

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

                <div className='container'>
                    {image && (
                        <div className='image'>
                            <img src={image} alt="Preview" style={{ maxWidth: '400px', height: 'auto' }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
