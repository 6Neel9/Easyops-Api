const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define user schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: Number,
    required: true,
    unique: true,
  },
});

// Define user model
const User = mongoose.model('User', userSchema);

// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Serve static files
app.use(express.static('public'));

// Handle POST request to add a new user
app.post('/api/users', async (req, res) => {
  try {
    const { firstName, lastName, contactNumber } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ firstName :firstName , lastName:lastName});
    const contactuser = await User.findOne({ contactNumber : contactNumber});
    if (existingUser) {
      return res.status(409).send('User already exists');
    }
    if(contactuser){
      return res.status(409).send('User already exists');
    }

    // Create new user
    const newUser = new User({ firstName, lastName, contactNumber });
    await newUser.save();

    res.status(201).send(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Handle GET request to retrieve all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Handle GET request to search for users by name
app.get('/api/users/search', async (req, res) => {
  try {
    const query = req.query.q;
    const users = await User.find({ $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } }
    ]});
    res.status(200).send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Handle DELETE request to delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).send('User not found');
    }
    res.status(200).send(deletedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Handle GET request to retrieve users sorted by name
app.get('/api/users/sort', async (req, res) => {
  try {
    const users = await User.find().sort({ firstName: 'asc' });
    const sortedUsers = users.sort((a, b) => a.firstName.localeCompare(b.firstName));
    res.status(200).send(sortedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


