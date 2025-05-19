import { useState, useRef, useEffect } from 'react'
import './App.css'
import ImageUploader from './components/ImageUploader'
import ChatInterface from './components/ChatInterface'
import ArtworkDisplay from './components/ArtworkDisplay'

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
    
    try {
      const imageBase64 = await convertImageToBase64(image)
      
      // Add a message to show we're analyzing
      const newMessage = {
        role: 'assistant',
        content: 'I\'m analyzing your artwork now...'
      }
      
      setMessages(prevMessages => [...prevMessages, newMessage])
      
      // Wait for 3 seconds before making the API call - simulating analysis if API key isn't set
      timeoutRef.current = setTimeout(async () => {
        try {
          const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
          const apiUrl = import.meta.env.VITE_OPENROUTER_API_URL
          
          // Check if we have a valid API key, otherwise use a mock response
          if (apiKey && apiKey !== 'your_openrouter_api_key' && apiUrl) {
            // Real API call
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Prodigy Prophet'
              },
              body: JSON.stringify({
                model: 'anthropic/claude-3-opus-20240229',
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
              })
            })
            
            const data = await response.json()
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
              setMessages(prevMessages => [
                ...prevMessages.slice(0, -1), // Remove the "analyzing" message
                { role: 'assistant', content: data.choices[0].message.content }
              ])
            } else {
              throw new Error('Unexpected API response format')
            }
          } else {
            // Mock response for demo purposes or when API key isn't set
            const mockAnalysis = generateMockAnalysis()
            setMessages(prevMessages => [
              ...prevMessages.slice(0, -1), // Remove the "analyzing" message
              { role: 'assistant', content: mockAnalysis }
            ])
          }
        } catch (error) {
          console.error('Error analyzing artwork:', error)
          setMessages(prevMessages => [
            ...prevMessages.slice(0, -1), // Remove the "analyzing" message
            { role: 'assistant', content: 'I encountered an error while analyzing your artwork. This is likely because an OpenRouter API key hasn\'t been configured. Please check your .env file and try again.' }
          ])
        } finally {
          setIsAnalyzing(false)
          setIsWaiting(false)
        }
      }, 3000)
      
    } catch (error) {
      console.error('Error processing image:', error)
      setIsAnalyzing(false)
      setIsWaiting(false)
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: 'I encountered an error while processing your image. Please try uploading again with a smaller file or different format.' }
      ])
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
    setMessages(prevMessages => [...prevMessages, userMessage])
    
    // Set waiting state with 3-second delay
    setIsWaiting(true)
    
    // Use timeout to enforce 3-second delay
    timeoutRef.current = setTimeout(async () => {
      try {
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
        const apiUrl = import.meta.env.VITE_OPENROUTER_API_URL
        
        // Logic for API vs mock responses
        if (apiKey && apiKey !== 'your_openrouter_api_key' && apiUrl) {
          // Real API call
          const apiMessages = artwork 
            ? [...messages, userMessage] 
            : [...messages, userMessage]
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Prodigy Prophet'
            },
            body: JSON.stringify({
              model: 'anthropic/claude-3-haiku-20240307',
              messages: apiMessages
            })
          })
          
          const data = await response.json()
          
          if (data.choices && data.choices[0] && data.choices[0].message) {
            const assistantMessage = { role: 'assistant', content: data.choices[0].message.content }
            setMessages(prevMessages => [...prevMessages, assistantMessage])
          } else {
            throw new Error('Unexpected API response format')
          }
        } else {
          // Mock response
          const mockResponse = "I can provide more insights about this artwork if you have specific questions. What aspects would you like me to elaborate on?"
          const assistantMessage = { role: 'assistant', content: mockResponse }
          setMessages(prevMessages => [...prevMessages, assistantMessage])
        }
      } catch (error) {
        console.error('Error processing message:', error)
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'assistant', content: 'I encountered an error. This is likely because the OpenRouter API key is not configured properly. For a full experience, please set up your API key.' }
        ])
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
