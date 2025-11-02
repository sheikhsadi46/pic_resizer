import express from 'express';
import multer, { memoryStorage } from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Multer storage configuration
const storage = memoryStorage();
const upload = multer({ storage });

// Image upload & resize route
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { width, height, format } = req.body;

    if (!width || !height || !format) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const resizedImage = await sharp(req.file.buffer)
      .resize({
        width: parseInt(width),
        height: parseInt(height),
        fit: 'fill',
        position: 'centre',
      })
      .toFormat(format)
      .toBuffer();

    res.set({
      'Content-Type': `image/${format}`,
      'Content-Disposition': 'inline',
      'Content-Length': resizedImage.length,
    });

    res.send(resizedImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Correct static build middleware
app.use(express.static(path.join(__dirname, '/frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
