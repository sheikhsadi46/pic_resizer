import React, { useState } from 'react';
import axios from 'axios';
import './style.css'; // Import CSS file

const App = () => {
  const [file, setFile] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [format, setFormat] = useState('png');
  const [resizedImage, setResizedImage] = useState(null);
  const [originalWidth, setOriginalWidth] = useState(null);
  const [originalHeight, setOriginalHeight] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [resizedFileSize, setResizedFileSize] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    // Fetch original image dimensions
    const image = new Image();
    image.src = URL.createObjectURL(uploadedFile);
    image.onload = () => {
      setOriginalWidth(image.width);
      setOriginalHeight(image.height);
    };

    // Fetch file size
    setFileSize(uploadedFile.size);
  };

  const handleWidthChange = async (e) => {
    const newWidth = parseInt(e.target.value);
    setWidth(newWidth);

    // Calculate height based on aspect ratio
    const aspectRatio = originalWidth / originalHeight;
    const newHeight = Math.round(newWidth / aspectRatio);
    setHeight(newHeight);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', file);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('format', format);

    // If format is jpg, default to PNG file size
    if (format === 'jpg') {
      const pngMaxFileSizeKB = Math.round(fileSize / 1024);
      formData.append('maxFileSizeKB', pngMaxFileSizeKB);
    }

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });

      const imageUrl = URL.createObjectURL(response.data);
      setResizedImage(imageUrl);

      // Fetch resized image file size in kilobytes
      const resizedBlob = response.data;
      const resizedBlobSize = resizedBlob.size;
      const resizedFileSizeKB = Math.round(resizedBlobSize / 1024);
      setResizedFileSize(resizedFileSizeKB);
    } catch (error) {
      console.error(error);
    }
  };

  const getDownloadFilename = () => {
    if (format === 'jpg') {
      return 'resized_image.jpg';
    } else if (format === 'png') {
      return 'resized_image.png';
    } else if (format === 'bmp') {
      return 'resized_image.bmp';
    }
    // Add more file format conditions as needed
  };

  return (
    <div className="container">
      <h1>Image Resizer</h1>
      <p>It does not store any data after resizing.</p>

      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        {originalWidth && originalHeight && (
          <p>
            Original Pixel Size: {originalWidth} x {originalHeight}
          </p>
        )}
        {fileSize && (
          <p>Original File Size: {Math.round(fileSize / 1024)} KB</p>
        )}
        <div className="input-row">
          <input
            type="text"
            placeholder="Width"
            value={width}
            onChange={handleWidthChange}
          />
          <input
            type="text"
            placeholder="Height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="bmp">BMP</option>
            {/* Add more format options as needed */}
          </select>
        </div>
        {/* {format === 'jpg' && (
                    <input
                        type="text"
                        placeholder="Max File Size (KB)"
                        value={maxFileSizeKB}
                        onChange={(e) => setMaxFileSizeKB(e.target.value)}
                    />
                )} */}
        <button type="submit">Resize and Save</button>
      </form>
      {resizedImage && (
        <div className="resized-image-container">
          <h2>Resized Image:</h2>
          <img src={resizedImage} alt="Resized" />
          <p>Resized File Size: {resizedFileSize} KB</p>
          <a href={resizedImage} download={getDownloadFilename()}>
            Download Resized Image
          </a>
        </div>
      )}
    </div>
  );
};

export default App;
