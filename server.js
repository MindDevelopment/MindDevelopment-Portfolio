const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Project Schema
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [String],
  imageUrl: String,
  githubUrl: String,
  liveUrl: String,
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
app.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/admin', (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/login', (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin');
    }
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.admin = true;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.post('/admin/projects', upload.single('image'), async (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const { title, description, technologies, githubUrl, liveUrl, featured } = req.body;
    const project = new Project({
      title,
      description,
      technologies: technologies.split(',').map(tech => tech.trim()),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      githubUrl,
      liveUrl,
      featured: featured === 'on'
    });
    
    await project.save();
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/admin/projects/:id', upload.single('image'), async (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const { title, description, technologies, githubUrl, liveUrl, featured } = req.body;
    
    const updateData = {
      title,
      description,
      technologies: technologies.split(',').map(tech => tech.trim()),
      githubUrl: githubUrl || null,
      liveUrl: liveUrl || null,
      featured: featured === 'on'
    };
    
    // Only update image if new one is uploaded
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/admin/projects/:id', async (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create default admin user
async function createDefaultAdmin() {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        username: 'admin',
        password: hashedPassword
      });
      await admin.save();
      console.log('Default admin created: username=admin, password=admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultAdmin();
});
