// src/components/dragAndDrop.jsx
import React, { useState, useRef } from 'react';

export const FileDrop = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (
      file &&
      (file.type.includes('audio') ||
        file.name.endsWith('.wav') ||
        file.name.endsWith('.mp3'))
    ) {
      onFileSelect(file);
    } else {
      alert('Please provide a WAV or MP3 file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()} // Makes the whole box clickable
      style={{
        border: isDragging ? '2px solid #007bff' : '2px dashed #ccc',
        padding: '40px',
        cursor: 'pointer',
        backgroundColor: isDragging ? '#f0f7ff' : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      <input
        type='file'
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept='.wav,.mp3,audio/*'
        onChange={(e) => processFile(e.target.files[0])}
      />
      <p>
        {isDragging ? 'Drop to Master' : 'Drag audio here or click to browse'}
      </p>
      <span style={{ fontSize: '12px', color: '#666' }}>
        WAV or MP3 (Max 100MB suggested)
      </span>
    </div>
  );
};
