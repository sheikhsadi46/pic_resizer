import multer, { memoryStorage } from 'multer';
import sharp from 'sharp';

const storage = memoryStorage();
const upload = multer({ storage });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle multipart/form-data using multer
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload error' });
    }

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

      res.setHeader('Content-Type', `image/${format}`);
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Content-Length', resizedImage.length);
      res.setHeader('Access-Control-Allow-Origin', '*');

      res.send(resizedImage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
