require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// ── Reliable Public DNS for MongoDB Atlas SRV Resolution on Windows ──
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignored if custom DNS servers are restricted in current environment
}

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Cloudinary Configuration ──
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Storage setup
let storage;
try {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'portfolio-images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      transformation: [{ width: 1400, height: 1050, crop: 'limit', quality: 'auto:good' }],
    },
  });
} catch (e) {
  storage = multer.memoryStorage();
}
const upload = multer({ storage });

// ── MongoDB Connection with Diagnostic Feedback ──
let cachedDbConnection = null;

async function connectToDatabase() {
  if (cachedDbConnection && mongoose.connection.readyState === 1) {
    return cachedDbConnection;
  }
  const mongoUri = process.env.MONGODB_URI;
  
  // 1. Attempt primary MONGODB_URI (Atlas)
  if (mongoUri) {
    try {
      cachedDbConnection = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3500,
      });
      console.log('✅ Connected to MongoDB Atlas successfully!');
      return cachedDbConnection;
    } catch (err) {
      if (err.message.includes('querySrv ENOTFOUND') || err.message.includes('querySrv ECONNREFUSED')) {
        console.warn('⚠️ Atlas DNS notice: Cluster SRV record could not be resolved.');
      } else if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
        console.warn('⚠️ Atlas Authentication notice: Database user credentials in MONGODB_URI do not match Atlas.');
      } else {
        console.warn('⚠️ Atlas connection notice:', err.message);
      }
    }
  }

  // 2. Automatic Fallback to Local MongoDB Service on port 27017
  try {
    cachedDbConnection = await mongoose.connect('mongodb://127.0.0.1:27017/portfolio', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('✅ Connected to Local MongoDB (mongodb://127.0.0.1:27017/portfolio)!');
    return cachedDbConnection;
  } catch (localErr) {
    console.log('ℹ️ Running in resilient file storage mode (public/data/projects.json).');
  }

  return null;
}

// ── Mongoose Schema & Model ──
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: null },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
});
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

// ── Local Fallback Storage Helpers ──
const fallbackFilePath = path.join(__dirname, 'public', 'data', 'projects.json');

function getFallbackProjects() {
  try {
    if (fs.existsSync(fallbackFilePath)) {
      const data = fs.readFileSync(fallbackFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Fallback read error:', e);
  }
  return [];
}

function saveFallbackProjects(data) {
  try {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Fallback write error:', e);
  }
}

// ── Admin Token ──
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'portfolio2005';

function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token && token === ADMIN_TOKEN) return next();
  res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
}

// ─── API Router ───────────────────────────────────────
const apiRouter = express.Router();

// GET /projects
apiRouter.get('/projects', async (req, res) => {
  try {
    const db = await connectToDatabase();
    if (db && mongoose.connection.readyState === 1) {
      const projects = await Project.find().sort({ createdAt: -1 });
      if (projects && projects.length > 0) {
        return res.json(projects);
      }
    }
    return res.json(getFallbackProjects());
  } catch (err) {
    res.json(getFallbackProjects());
  }
});

// POST /admin/login
apiRouter.post('/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_TOKEN) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: 'Invalid admin password' });
  }
});

// POST /projects (Create)
apiRouter.post('/projects', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const db = await connectToDatabase();
    const imagePath = req.file ? (req.file.path || req.file.secure_url) : null;

    if (db && mongoose.connection.readyState === 1) {
      const newProject = new Project({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        image: imagePath,
      });
      await newProject.save();
      return res.json(newProject);
    }

    // Fallback mode: persist to projects.json
    const projects = getFallbackProjects();
    const newProject = {
      _id: 'local-' + Date.now(),
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      image: imagePath,
      createdAt: new Date().toISOString().split('T')[0],
    };
    projects.unshift(newProject);
    saveFallbackProjects(projects);
    return res.json(newProject);
  } catch (e) {
    console.error('Create project error:', e);
    res.status(500).json({ error: e.message || 'Create project failed' });
  }
});

// PUT /projects/:id (Update)
apiRouter.put('/projects/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const db = await connectToDatabase();
    const imagePath = req.file ? (req.file.path || req.file.secure_url) : null;

    if (db && mongoose.connection.readyState === 1) {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });

      project.title = req.body.title || project.title;
      project.category = req.body.category || project.category;
      project.description = req.body.description || project.description;
      if (imagePath) project.image = imagePath;

      await project.save();
      return res.json(project);
    }

    // Fallback mode
    const projects = getFallbackProjects();
    const index = projects.findIndex(p => p._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Project not found' });

    projects[index].title = req.body.title || projects[index].title;
    projects[index].category = req.body.category || projects[index].category;
    projects[index].description = req.body.description || projects[index].description;
    if (imagePath) projects[index].image = imagePath;

    saveFallbackProjects(projects);
    return res.json(projects[index]);
  } catch (e) {
    console.error('Update project error:', e);
    res.status(500).json({ error: e.message || 'Update project failed' });
  }
});

// DELETE /projects/:id (Delete)
apiRouter.delete('/projects/:id', adminAuth, async (req, res) => {
  try {
    const db = await connectToDatabase();

    if (db && mongoose.connection.readyState === 1) {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });

      if (project.image && project.image.includes('cloudinary.com')) {
        try {
          const parts = project.image.split('/');
          const fileNameWithExt = parts.pop();
          const publicId = fileNameWithExt.split('.')[0];
          await cloudinary.uploader.destroy(`portfolio-images/${publicId}`);
        } catch (cloudErr) {
          console.warn('Cloudinary delete notice:', cloudErr.message);
        }
      }

      await Project.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Project successfully deleted' });
    }

    // Fallback mode
    let projects = getFallbackProjects();
    projects = projects.filter(p => p._id !== req.params.id);
    saveFallbackProjects(projects);
    return res.json({ message: 'Project successfully deleted from local data' });
  } catch (e) {
    console.error('Delete project error:', e);
    res.status(500).json({ error: e.message || 'Delete project failed' });
  }
});

// POST /contact
const emailUser = 'sufyanmalik7998@gmail.com';
const emailPass = process.env.EMAIL_PASS;

let transporter = null;
if (emailPass && emailPass !== 'your-gmail-app-password') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass },
  });
}

apiRouter.post('/contact', async (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  if (!transporter) {
    console.log(`📨 [Message Received]:\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nMessage: ${message}`);
    return res.json({
      success: true,
      message: 'Thank you for reaching out! Your message was received successfully. I will get back to you shortly.',
    });
  }

  try {
    await transporter.sendMail({
      from: emailUser,
      to: 'sufyanmalik7998@gmail.com',
      replyTo: email,
      subject: `Portfolio Inquiry from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #9AAEA3; border-radius: 8px;">
          <h2 style="color: #597058; margin-bottom: 16px;">New Portfolio Inquiry</h2>
          <p><strong>Client Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <div style="margin-top: 20px; padding: 16px; background: #E2E2DB; border-radius: 6px;">
            <strong>Message:</strong>
            <p style="white-space: pre-wrap; margin-top: 8px;">${message}</p>
          </div>
        </div>
      `,
    });
    res.json({ success: true, message: 'Message sent successfully! I will be in touch soon.' });
  } catch (err) {
    console.error('Nodemailer error:', err);
    res.status(500).json({ error: 'Unable to send message via email right now. Please reach out directly on LinkedIn or Fiverr.' });
  }
});

// Mount router under both `/api` and `/`
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Listener when running server directly
if (require.main === module) {
  connectToDatabase();
  app.listen(PORT, () => {
    console.log(`🌿 Sufyan Malik Portfolio running on http://localhost:${PORT}`);
    console.log(`🔒 Admin password: ${ADMIN_TOKEN}`);
  });
}

module.exports = { app, connectToDatabase };
