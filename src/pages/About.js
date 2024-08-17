import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

export default function About() {
    const [receipts, setReceipts] = useState([]);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'ReceiptName', direction: 'ascending' });

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/get-receipts');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Received data:', data);  // Debugging output
                setReceipts(data);
            } catch (error) {
                console.error('Error fetching receipts:', error);
                setError(error.message);
            }
        };

        fetchReceipts();
    }, []);

    const sortReceipts = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        const sortedReceipts = [...receipts].sort((a, b) => {
            let aValue = a[key];
            let bValue = b[key];

            // Parse prices as numbers for sorting
            if (key === 'Price') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }

            if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
            return 0;
        });

        setReceipts(sortedReceipts);
        setSortConfig({ key, direction });
    };

    return (
        <>
            <h1>Receipts</h1>
            {error && <p>Error: {error}</p>}
            <table>
                <thead>
                    <tr>
                        <th onClick={() => sortReceipts('ReceiptName')}>Receipt Name</th>
                        <th onClick={() => sortReceipts('Item Name')}>Item Name</th>
                        <th onClick={() => sortReceipts('Price')}>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {receipts.length > 0 ? (
                        receipts.map((receipt, index) => (
                            <tr key={index}>
                                <td>{receipt.ReceiptName}</td>
                                <td>{receipt['Item Name']}</td>
                                <td>{receipt.Price}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No receipts found</td>
                        </tr>
                    )}
                </tbody>
            </table>
            
        </>
    );
}
