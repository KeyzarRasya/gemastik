import './upload.css'
import * as React from 'react';
import { useState } from 'react';
import { Button } from './Button';


function ImageUpload() {
    const [file, setFile] = useState(null)
    const [selectedFileName, setSelectedFileName] = useState('Choose a file');
    const [name, setName] = useState('');

    const handleFileChange = (event) => {
        const fileName = event.target.files[0]?.name || 'Choose a file';
        setFile(event.target.files[0])
        setSelectedFileName(fileName);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const uploadFile = () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('name', name);
        fetch('http://localhost:1000/upload', {
            method:'POST',
            body:formData
        })
        .then(res => console.log(res))
        .catch(err => console.error(err))
    }
        
    return (
        <div className="upload">
            <div className='box'>
                <div className='yt'>
                    <p></p>
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
