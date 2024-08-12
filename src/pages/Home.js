import React, { useState } from 'react';


export default function Home(){
    const [image, setImage] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [items, setItems] = useState([]);
    const [prices, setPrices] = useState([]);
    const [subtotal, setSubtotal] = useState('');
    const [total, setTotal] = useState ('');

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

    const handleSubmit = async (e) => {
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
        } catch (error) {
            setUploadStatus('Upload failed');
        }
    };

    return(
        <>
            
            <h1>Home Page</h1>

           <form onSubmit={handleSubmit} className='form'>
                <label for = "fileInput" className="custom-file-upload">
                    Choose a receipt to upload for best results make sure the image is clear and the text is visable:
                </label>
                <br />
                <input 
                    type = "file"
                    id = "fileInput" 
                    name= "file" 
                    accept= "image/*" 
                    required 
                    onChange={handleFileChange}
                    
                />
                <br />

                <button type="submit">Upload Image</button>
                {uploadStatus && <p>{uploadStatus}</p>}

           
           </form>
        <div className='container'> 
           {image && (
            
                <div className='image'>
                    <img src={image} alt="Preview"  style={{ maxWidth: '400px', height: 'auto' }} />
                    
                </div>
            )}
           
            {items.length > 0 && (
                <div className='extracted'>
                    <h3> Extracted Items and Prices</h3>
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
    )
}