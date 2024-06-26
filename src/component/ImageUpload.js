import './upload.css'
import * as React from 'react';
import { useState } from 'react';
import { Button } from './Button';


function ImageUpload() {
    const [file, setFile] = useState(null)
    const [selectedFileName, setSelectedFileName] = useState('Choose a file');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    
    const handleFileChange = (event) => {
        const fileName = event.target.files[0]?.name || 'Choose a file';
        setFile(event.target.files[0])
        setSelectedFileName(fileName);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const uploadFile = async () => {
        if (!file || !name) {
            setMessage('Please select a file and enter a name.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('name', name);

        try {
            const response = await fetch('http://localhost:7000/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setMessage('File uploaded successfully');
            } else {
                setMessage(`Error uploading file: ${result.message}`);
            }
        } catch (err) {
            console.error(err);
            setMessage(`Error uploading file: ${err.message}`);
        }
    };

        
    return (
        <div className="upload">
            <div className='box'>
                <div className='yt'>
                    <p> <p>{message}</p></p>
                </div>
                <label htmlFor="file-input" className="custom-file-input">
                    {selectedFileName}
                </label> 
                <input
                    type="file"
                    id="file-input"
                    className="actual-file-input"
                    onChange={handleFileChange}
                    name='image'
                />
                <input
                    type="text"
                    placeholder="Masukkan nama pejabat"
                    value={name}
                    onChange={handleNameChange}
                    className="name-input"
                />
               
                <Button 
                    buttonStyle='btn--outline' 
                    buttonText={"Scan"} 
                    onClick={uploadFile}
                    className="periksa-button"
                    > 
                    Periksa</Button>
            </div>

        </div>
    )
}

export default ImageUpload
