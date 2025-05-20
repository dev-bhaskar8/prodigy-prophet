import { useState, useRef, useEffect } from 'react'
import './App.css'
import ImageUploader from './components/ImageUploader'
import ChatInterface from './components/ChatInterface'
import ArtworkDisplay from './components/ArtworkDisplay'

// The new API endpoint for our Cloudflare Function proxy
const PROXY_API_URL = '/openrouter-proxy';

function App() {
  const [artwork, setArtwork] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'system', content: 'I am Prodigy Prophet, an AI art critic. I can analyze your artwork and provide detailed feedback on composition, technique, creativity, and overall quality.' }
  ])
  const [isWaiting, setIsWaiting] = useState(false)
  const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches)
  const timeoutRef = useRef(null)

  // Apply dark/light mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode)
  }

  const handleImageUpload = (image) => {
    setArtwork(image)
    const updatedMessages = [...messages]
    updatedMessages.push({ role: 'user', content: 'I\'ve uploaded a new artwork for you to analyze.' })
    setMessages(updatedMessages)
    
    // Auto-analyze the uploaded image
    analyzeArtwork(image)
  }

  const analyzeArtwork = async (image) => {
    setIsAnalyzing(true)
    setIsWaiting(true)
    setMessages(prev => [...prev, { role: 'assistant', content: 'I\'m analyzing your artwork now...' }]);

    try {
      const imageBase64 = await convertImageToBase64(image)
      
      timeoutRef.current = setTimeout(async () => {
        try {
          console.log('[analyzeArtwork] Calling proxy:', PROXY_API_URL);

          const requestBody = {
            model: 'google/gemma-3-27b-it:free',
            messages: [
              ...messages,
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Please analyze this artwork and provide detailed feedback on composition, technique, creativity, and overall quality. Rate it on a scale of 1-10 and explain your reasoning.' },
                  { type: 'image_url', image_url: { url: imageBase64 } }
                ]
              }
            ]
          };

          const response = await fetch(PROXY_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorText = await response.text();
            let detail = errorText;
            try { detail = JSON.parse(errorText).error.message || errorText } catch (e) {}
            throw new Error(`API error ${response.status}: ${detail}`);
          }

          const data = await response.json()
          
          if (data.choices && data.choices[0] && data.choices[0].message) {
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: data.choices[0].message.content }
            ])
          } else {
            throw new Error('Unexpected API response format from proxy')
          }
        } catch (error) {
          console.error('[analyzeArtwork] Error during analysis via proxy:', error)
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: `Error analyzing artwork: ${error.message}. Please ensure the proxy is set up correctly and your OpenRouter key is configured in Cloudflare.` }
          ])
        } finally {
          setIsAnalyzing(false)
          setIsWaiting(false)
        }
      }, 3000)
      
    } catch (error) {
      console.error('[analyzeArtwork] Error processing image for proxy:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing image. Try a different file.'}]);
      setIsAnalyzing(false)
      setIsWaiting(false)
    }
  }
  
  const generateMockAnalysis = () => {
    return `# Artwork Analysis

## Overall Rating: 8/10

### Composition (7/10)
The composition shows strong understanding of visual balance and use of space. The central placement creates a focal point that draws the viewer's attention immediately. 

### Technique (8/10)
The pixel art technique is executed with skill, showing careful attention to color relationships and lighting effects. The flame animation suggests technical proficiency.

### Creativity (9/10)
The concept of a computer on fire creates an interesting visual metaphor that can be interpreted in multiple ways. The contrast between technology and primal elements (fire) creates narrative tension.

### Overall Quality
This is a compelling piece that successfully combines technical skill with conceptual depth. The limited palette enhances rather than restricts the visual impact.

I particularly appreciate how the warm colors of the flame contrast with the cooler tones of the computer components, creating visual interest through temperature contrast.`;
  }
  
  const handleSendMessage = async (message) => {
    if (!message.trim() || isWaiting) return
    
    // Add user message to state
    const userMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])
    
    // Set waiting state with 3-second delay
    setIsWaiting(true)
    
    // Use timeout to enforce 3-second delay
    timeoutRef.current = setTimeout(async () => {
      try {
        console.log('[handleSendMessage] Calling proxy:', PROXY_API_URL);
        
        const requestBody = {
          model: 'anthropic/claude-3-haiku-20240307',
          messages: [...messages, userMessage]
        };

        const response = await fetch(PROXY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorText = await response.text();
          let detail = errorText;
          try { detail = JSON.parse(errorText).error.message || errorText } catch (e) {}
          throw new Error(`API error ${response.status}: ${detail}`);
        }
        
        const data = await response.json()
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const assistantMessage = { role: 'assistant', content: data.choices[0].message.content }
          setMessages(prev => [...prev, assistantMessage])
        } else {
          throw new Error('Unexpected API response format from proxy for chat')
        }
      } catch (error) {
        console.error('[handleSendMessage] Error processing message via proxy:', error)
        setMessages(prev => [...prev, { role: 'assistant', content: `Error processing message: ${error.message}. Check proxy setup.` }])
      } finally {
        setIsWaiting(false)
      }
    }, 3000)
  }
  
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="app-header">
        <h1>Prodigy Prophet</h1>
        <p>AI Art Critic</p>
        <button onClick={toggleDarkMode} className="theme-toggle">
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </header>
      
      <main className="app-main">
        <div className="left-panel">
          <ImageUploader 
            onImageUpload={handleImageUpload} 
            isAnalyzing={isAnalyzing} 
          />
          {artwork && (
            <ArtworkDisplay 
              artwork={artwork} 
              isAnalyzing={isAnalyzing} 
            />
          )}
        </div>
        
        <div className="right-panel">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isWaiting={isWaiting} 
          />
        </div>
      </main>
      
      <footer className="app-footer">
        <p>© 2023 Prodigy Prophet - Powered by KEVAI</p>
      </footer>
    </div>
  )
}

export default App
