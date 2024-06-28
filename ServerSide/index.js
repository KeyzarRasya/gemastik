import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import multer from 'multer'
import cors from 'cors';
import path from 'path';
import axios from 'axios';
import fs from 'fs'
import tf from '@tensorflow/tfjs-node';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import mongoose, { mongo } from 'mongoose';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  const schema = new mongoose.Schema({}, { strict: false });
  const Model = mongoose.model('Menteri', schema, 'menteri');

  async function checkInfo(namaMenteri, namaKendaraan){
    const response = await Model.find({});
    let status = [false, false];
    let isValid = false;
    const kendaraan = namaKendaraan;
    const name = namaMenteri;
    let obj = null;
    response.forEach(res => {
      if(res.nama.toUpperCase().includes(name.toUpperCase())){
        obj = res;
        status[0] = true
      }
    })
    obj.kendaraan.forEach(k => {
      if(k.toUpperCase().includes(kendaraan.toUpperCase())){
        kendaraan = k;
        status[1] = true;
      }
    })
    status.forEach(st => {
      if(st){
        isValid = true;
      }else{
        isValid = false;
      }
    })
    return {isValid, kendaraan}
  }

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
      const imageUrl = req.file.path;
      let summary;
      
      console.log(': ', req.file.filename);

      const uriName = `http://localhost:8000/${req.file.filename}`;

      console.log(uriName);
      
      const newFile = new FileModel({
        imageUrl: imageUrl
      });
  
      await newFile.save();

      const predictFace = await axios.post('http://localhost:7000/predict', {
        filename:uriName
      });

      const predictCar = await axios.post('http://localhost:8000/predict', {
        filename:uriName
      });

      let menteriName = predictFace.data.predictions[0].displayNames;
      menteriName[0] = menteriName[0].replace(/_/g, " ");
      console.log(menteriName);

      let carName = predictCar.data.predictedLabel;

      const check = await checkInfo(menteriName[0], carName);

      if(check.isValid){
        summary = {stat:200, message:`Terdeteksi ${menteriName} dengan kendaraan ${check.kendaraan}, aset sesuai dengan e-LKHPN`};
      }else{
        summary = {stat:404, message:`Terdeteksi ${menteriName} dengan kendaraan ${check.kendaraan}, aset tidak sesuai dengan e-LKHPN`}
      }
      console.log(summary);
      res.status(200).json({ message: 'File uploaded successfully', data: newFile, faceClassification:menteriName, predictCar:carName, summary});
    } catch (error) {
      res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
  });

  app.post('/predict', async (req, res) => {
    try {
        const modelURL ='http://localhost:8080/model.json';
        const dictURL = 'http://localhost:8080/dict.txt';

        let model = await tf.loadGraphModel(modelURL);
        console.log('Model loaded from', modelURL);

        const dictResponse = await fetch(dictURL);
        
        const dictData = await dictResponse.text();
        console.log(dictData);
        let labels = dictData.split('\n').map(label => label.trim()).filter(label => label !== '');
        console.log('Labels loaded from', dictURL);
        
        
        const { filename } = req.body;
        if (!filename) {
            throw new Error('filename is required');
        }

        console.log('Fetching image from URL:', filename);
        const imageResponse = await fetch(filename);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from URL: ${filename}`);
        }

        console.log('Image fetched successfully');
        const imageBuffer = await imageResponse.arrayBuffer();

        console.log('Decoding image buffer');
        const imageTensor = tf.node.decodeImage(new Uint8Array(imageBuffer), 3);

        console.log('Resizing image tensor');
        const resizedImageTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);

        console.log('Normalizing image tensor');
        const normalizedImageTensor = resizedImageTensor.toFloat().div(tf.scalar(255));

        console.log('Expanding dimensions of image tensor');
        const inputTensor = normalizedImageTensor.expandDims();

        console.log('Making prediction');
        const prediction = await model.predict(inputTensor).data();
        const highestProbIndex = Array.from(prediction).indexOf(Math.max(...prediction));
        const predictedLabel = labels[highestProbIndex];

        res.status(200).json({ predictedLabel });
    } catch (error) {
        console.error('Error predicting:', error);
        res.status(500).send(`Error predicting: ${error.message}`);
    }
});
  
app.listen("8000", () => {
    console.log('server running at 8000')
})