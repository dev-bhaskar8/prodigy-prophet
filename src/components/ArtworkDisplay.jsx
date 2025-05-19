import { useState, useEffect } from 'react'

const ArtworkDisplay = ({ artwork, isAnalyzing }) => {
  const [imageUrl, setImageUrl] = useState(null)
  
  useEffect(() => {
    if (artwork) {
      const url = URL.createObjectURL(artwork)
      setImageUrl(url)
      
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [artwork])
  
  if (!artwork || !imageUrl) {
    return null
  }
  
  return (
    <div className="artwork-display">
      <h2>Your Artwork</h2>
      <div className={`artwork-container ${isAnalyzing ? 'analyzing' : ''}`}>
        <img
          src={imageUrl}
          alt="Uploaded artwork"
          className="artwork-image"
        />
        {isAnalyzing && (
          <div className="analysis-overlay">
            <div className="analysis-spinner"></div>
            <p>Analyzing...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtworkDisplay 