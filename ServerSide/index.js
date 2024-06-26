const mongoose = require('mongoose')
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const axios = require('axios')
const fs = require('fs');

const app = express();
app.use(express.json())
app.use(cors())

app.use(express.static('upload'))

mongoose.connect('mongodb://127.0.0.1:27017/dbconnect',{ useNewUrlParser: true, useUnifiedTopology: true }) .then (() => {
    console.log('Connected to MongoDB'); 
})
    .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const uploadDir = path.join(__dirname, 'upload');
    if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'upload/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only images with .jpeg or .jpg format are allowed!');
    }
  };
  
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter
  });

  const FileSchema = new mongoose.Schema({
    name: String,
    imageUrl: String
  });
  
  const FileModel = mongoose.model('File', FileSchema);

  app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      const { name } = req.body;
      const imageUrl = req.file.path;
      
      console.log(': ', name);
      console.log(': ', req.file.filename);

      const uriName = `http://localhost:8000/${req.file.filename}`;

      console.log(uriName);
      
      const newFile = new FileModel({
        name: name,
        imageUrl: imageUrl
      });
  
      await newFile.save();

      const predict = await axios.post('http://localhost:7000/predict', {
        filename:uriName
      });

      console.log(predict.data.predictions);
      res.status(200).json({ message: 'File uploaded successfully', data: newFile });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
  });
  
app.listen("8000", () => {
    console.log('server running at 7000')
})