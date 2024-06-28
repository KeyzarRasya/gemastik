import './upload.css';
import React, { useState } from 'react';
import axios from 'axios';
import { Button } from './Button';
import { TextField, Dialog, DialogContent, DialogActions, DialogTitle } from '@mui/material'; // Import Dialog components from Material-UI

function ImageUpload() {
    const [file, setFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('Choose a file');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [openDialog, setOpenDialog] = useState(false); // State for controlling dialog visibility
    const [imagePreview, setImagePreview] = useState(''); // State for image preview URL
    const [isFetching, setIsFetching] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile) {
            setFile(selectedFile);
            setSelectedFileName(selectedFile.name);

            // Check if the selected file is an image (you can add more checks based on file type)
            if (selectedFile.type.startsWith('image')) {
                const reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
            } else {
                setImagePreview('');
                setMessage('Please select a valid image file.');
                setOpenDialog(true);
            }
        } else {
            setFile(null);
            setSelectedFileName('Choose a file');
            setImagePreview('');
        }
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false); // Close the dialog
    };

    const uploadFile = async () => {
        setIsFetching(true);
        if (!file) {
            setMessage('Please select a file and enter a name.');
            setOpenDialog(true); // Open dialog if validation fails
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('http://localhost:8000/upload', formData);

            if (response.status === 200) {
                setMessage(response.data.summary.message);
                setIsFetching(false)
            } else {
                setMessage('Error uploading file');
                setIsFetching(false)
            }
        } catch (err) {
            console.error(err);
            setMessage(`Error uploading file: ${err.response.data.message}`);
            setIsFetching(false);
        }

        setOpenDialog(true); // Open dialog after attempting upload
    };

    return (
        <div className="upload">
            <div className='box'>
                <div className='yt'>
                    {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%' }} />}
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
               
                <button className='btn-periksa'
                    onClick={uploadFile}
                >
                    {isFetching? 'Memeriksa...' : 'Periksa'}
                </button>

                {/* Dialog component for displaying message */}
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Informasi</DialogTitle>
                    <DialogContent>
                        <p>{message}</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Tutup</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}

export default ImageUpload;
