const express = require('express');
//const mongoose = require('mongoose');
//const Papa = require('papaparse');
//const fs = require('fs');

const app = express();
app.use(express.static('build/public'));

/*
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define a Mongoose schema for your data
const yourSchema = new mongoose.Schema({
  // Define your schema fields here based on your CSV data
});

// Create a Mongoose model
const YourModel = mongoose.model('YourModel', yourSchema);

// Handle file uploads
app.post('/upload', (req, res) => {
  const file = req.files.file;
  
  if (!file) {
    return res.status(400).send('No file uploaded');
  }
  
  const data = fs.readFileSync(file.path, 'utf8');
  const parsedData = Papa.parse(data, { header: true }).data;
  
  YourModel.insertMany(parsedData, (err) => {
    if (err) {
      console.error('Error uploading data to MongoDB:', err);
      return res.status(500).send('Error uploading data to MongoDB');
    }
    res.send('Data uploaded successfully');
  });
});
*/
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});