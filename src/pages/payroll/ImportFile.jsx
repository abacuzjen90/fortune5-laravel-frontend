
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ImportFile = () => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Handle file change and load the content using XLSX
    const handleFileChange = (e) => {
        const inputFile = e.target.files[0];
        setFile(inputFile);

        // Read the Excel file
        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert Excel sheet to JSON
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
            setData(sheetData);
        };
        reader.readAsArrayBuffer(inputFile);
    };

    // Function to send the file to the Laravel backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Please upload a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);  // The key 'file' should match the key expected by your Laravel API

        try {
            const response = await fetch('http://127.0.0.1:8000/api/import-biometric', {
                method: 'POST',
                body: formData,
                headers: {
                    // No need to manually set Content-Type, browser will handle it
                },
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error('Error:', error);
            alert('File upload failed.');
        }
    };

    // Convert underscore to space and make uppercase
    const formatHeader = (header) => {
        return header.replace(/_/g, ' ').toUpperCase();
    };

    // Filter data based on search term
    const filteredData = data.filter((row) => {
        return Object.values(row).some((val) =>
            val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <>
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">Import Excel</h1>
        <p className="text-sm text-gray-600 font-medium">Southseas Cargo - Payroll</p>
      </header>
            <div className="container font-medium flex-1 mx-auto py-4 flex flex-col items-center justify-center">
                
                <form onSubmit={handleSubmit} className="w-full max-w-md">

                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                <p className="mb-2 text-xl text-gray-500 dark:text-gray-400"><span className="font-bold">Click to upload</span> or drag and drop</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">.CSV-comma delimited file (recommended) </p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                    <br />
                    <button type="submit" className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-full">
                        UPLOAD .CSV FILE
                    </button>

                </form>

                {data.length > 0 && (
                    <div className="table-container w-full max-w-3xl">
                        <br />

                        <form className="flex items-center max-w-sm mx-auto">
                            <label htmlFor="simple-search" className="sr-only">Search</label>
                            <div className="relative w-full">
                                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} id="simple-search" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search employees data..." required />
                            </div>
                            <button type="submit" className="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                </svg>
                            </button>
                        </form>
                        <br />
                        <span className="text-2xl font-semibold inline-block py-1 px-2 upperCase rounded-full text-indigo-600 bg-indigo-200 uppercase last:mr-0 mr-1">
                            IMPORT EXCEL PREVIEW
                        </span>

                        <div className="table-wrapper overflow-auto">
                            <table className="preview-table w-full text-left">
                                <thead>
                                    <tr>
                                        {Object.keys(data[0]).map((key) => (
                                            <th key={key} className="px-4 py-2">{formatHeader(key)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={index}>
                                            {Object.values(row).map((val, i) => (
                                                <td key={i} className="px-4 py-2">{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </>
    );
};

export default ImportFile;

