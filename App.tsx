import React, { useState, useRef, useEffect, useMemo } from 'react';
import { sendMessageToGemini } from './services/gemini';
import { ChatMessage, LocationData } from './types';
import ChatMessageComponent from './components/ChatMessage';
import { v4 as uuidv4 } from 'uuid'; 

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | undefined>(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate random particles for the background
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
      duration: `${15 + Math.random() * 20}s`, // Slow duration between 15-35s
      size: `${2 + Math.random() * 4}px`, // Size between 2px-6px
      opacity: 0.1 + Math.random() * 0.3,
      color: Math.random() > 0.6 ? 'bg-blue-400' : (Math.random() > 0.5 ? 'bg-green-400' : 'bg-gray-400')
    }));
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'model',
        text: "היי! אני ג'ני בוט. אשמח לעזור, מה את/ה מחפש/ת היום?",
        timestamp: Date.now(),
      }
    ]);

    // Request location immediately on load
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setLocationError("הגישה למיקום נדחתה. התוצאות עשויות להיות פחות רלוונטיות.");
        }
      );
    } else {
      setLocationError("הדפדפן שלך לא תומך במיקום.");
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    
    // Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await sendMessageToGemini(userText, history, location);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        groundingMetadata: response.groundingChunks ? { groundingChunks: response.groundingChunks } : undefined,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Failed to send message", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "מצטער, נתקלתי בשגיאה בחיפוש. אנא נסה שנית.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationRetry = () => {
    if ("geolocation" in navigator) {
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => setLocationError("הגישה למיקום נדחתה.")
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#202124] text-[#e8eaed] overflow-hidden relative">
      
      {/* Animated Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full animate-float ${p.color}`}
            style={{
              left: p.left,
              bottom: '-20px', // Start slightly below screen
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="flex-none p-4 border-b border-gray-800/50 bg-[#202124]/80 backdrop-blur-md z-10 flex justify-between items-center shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-full border border-blue-500/20">
            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-green-400 bg-clip-text text-transparent drop-shadow-sm">
            ג'ני בוט
          </h1>
        </div>

        {/* Location Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-surface/50 backdrop-blur border border-gray-700/50 shadow-inner">
          {location ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-400/90">מיקום פעיל</span>
            </>
          ) : locationError ? (
            <button onClick={handleLocationRetry} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>מיקום כבוי</span>
            </button>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              <span className="text-yellow-400">מאתר מיקום...</span>
            </>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth z-10 relative">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full justify-end">
           {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center text-center text-gray-500/80 h-64">
               <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
               </div>
               <p className="text-lg font-light">אפשר להתחיל בשאלה על מקום כלשהו...</p>
             </div>
           )}
           
           {messages.map((msg) => (
             <ChatMessageComponent key={msg.id} message={msg} />
           ))}
           
           {loading && (
             <div className="flex justify-start mb-6">
               <div className="bg-surface/80 backdrop-blur border border-gray-700/50 rounded-2xl rounded-br-none px-5 py-4 shadow-lg">
                 <div className="flex space-x-2 items-center h-6">
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none p-4 bg-[#202124]/80 backdrop-blur-xl border-t border-gray-800/50 z-20 relative">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="למשל: מסעדות איטלקיות טובות בסביבה..."
              // RTL padding: pr-6 (padding-right) for text start, pl-14 (padding-left) for button space
              className="relative w-full bg-[#303134] text-gray-100 rounded-full pr-6 pl-14 py-4 focus:outline-none border border-gray-700 focus:border-gray-600 transition-all shadow-xl placeholder-gray-500 text-right z-10"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              // RTL position: left-2
              className="absolute left-2 top-2 bottom-2 aspect-square bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center z-20 shadow-lg"
            >
              <svg className="w-5 h-5 translate-x-0.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default App;