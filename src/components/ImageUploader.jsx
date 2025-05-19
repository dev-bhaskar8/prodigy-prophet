import { useState, useRef } from 'react'

const ImageUploader = ({ onImageUpload, isAnalyzing }) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // Basic validation
    if (!file.type.match('image.*')) {
      alert('Please upload an image file (jpg, png, etc.)')
      return
    }
    
    // Size validation (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Please upload an image smaller than 10MB')
      return
    }
    
    onImageUpload(file)
  }

  const openFileDialog = () => {
    fileInputRef.current.click()
  }

  return (
    <div className="image-uploader">
      <h2>Upload Your Artwork</h2>
      
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''} ${isAnalyzing ? 'analyzing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInput} 
          accept="image/*" 
          style={{ display: 'none' }}
          disabled={isAnalyzing}
        />
        
        <div className="upload-icon">
          {isAnalyzing ? (
            <div className="analyzing-spinner"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          )}
        </div>
        
        <p>
          {isAnalyzing 
            ? 'Analyzing your artwork...' 
            : 'Drag & drop your image here or click to browse'}
        </p>
      </div>
    </div>
  )
}

export default ImageUploader 