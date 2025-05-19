import { useState, useEffect, useRef } from 'react'

const ChatInterface = ({ messages, onSendMessage, isWaiting }) => {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim() && !isWaiting) {
      onSendMessage(inputValue)
      setInputValue('')
    }
  }
  
  const renderMessage = (message, index) => {
    // Skip rendering system messages
    if (message.role === 'system') return null
    
    return (
      <div 
        key={index} 
        className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
      >
        <div className="message-avatar">
          {message.role === 'user' ? 'You' : 'AI'}
        </div>
        <div className="message-content">
          {message.content}
        </div>
      </div>
    )
  }
  
  return (
    <div className="chat-interface">
      <h2>Chat with Prodigy Prophet</h2>
      
      <div className="chat-container" ref={chatContainerRef}>
        <div className="messages">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about your artwork..."
          disabled={isWaiting}
        />
        <button 
          type="submit" 
          disabled={!inputValue.trim() || isWaiting}
          className={isWaiting ? 'waiting' : ''}
        >
          {isWaiting ? (
            <div className="button-spinner"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>
      
      {isWaiting && (
        <div className="waiting-indicator">
          <div className="waiting-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Waiting for response (3s cooldown)...</p>
        </div>
      )}
    </div>
  )
}

export default ChatInterface 