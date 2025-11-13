import { useChatBot } from '@/hook/chatBot-hook';
import { motion } from 'framer-motion';
import { Bot, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';





export default function ChatBot() {
  const doChat_with_Bot = useChatBot();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Saloon Mate assistant. How can I help you today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const simulateStreamingResponse = async (text) => {
    setStreamingContent('');
    setIsTyping(true);

    for (let i = 0; i < text.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      setStreamingContent((prev) => prev + text[i]);
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
    setStreamingContent('');
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    setIsTyping(true);
    setStreamingContent('');

    const data = await doChat_with_Bot(userMessage);
    if (data.success) {
      await simulateStreamingResponse(data.message);
    } else {
      await simulateStreamingResponse(data.message || 'Sorry, something went wrong.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const panelVariants = {
    open: {
      clipPath: 'circle(150% at calc(100% - 32px) calc(100% - 32px))',
      transition: {
        type: 'spring',
        stiffness: 50,
        restDelta: 2,
      },
    },
    closed: {
      clipPath: 'circle(28px at calc(100% - 32px) calc(100% - 32px))',
      transition: {
        delay: 0.1,
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <motion.div
        ref={containerRef}
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        className="relative"
      >
        <motion.div
          variants={panelVariants}
          className="absolute bottom-0 right-0 w-[400px] h-[600px] bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl overflow-hidden max-[640px]:w-[calc(100vw-3rem)] max-[640px]:h-[60vh]"
        >
          {isOpen && (
            <div className="flex flex-col h-full">
              <div className="bg-gradient-to-r from-[#387AFF]/10 to-white px-6 py-4 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#387AFF] to-[#2C6DFF] rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 text-lg">Saloon Mate</h3>
                    <p className="text-xs text-stone-600">AI Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-[#387AFF] to-[#2C6DFF] text-white rounded-br-md'
                          : 'bg-white text-slate-800 rounded-bl-md shadow-sm border border-slate-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}

                {(isTyping || streamingContent) && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-white text-slate-800 rounded-bl-md shadow-sm border border-slate-100">
                      {streamingContent ? (
                        <p className="text-sm leading-relaxed">{streamingContent}</p>
                      ) : (
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-slate-200 px-4 py-3 bg-white">
                <div className="flex gap-2 items-end mb-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isTyping}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#387AFF] focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="w-12 h-12 bg-gradient-to-r from-[#387AFF] to-[#2C6DFF] text-white rounded-xl flex items-center justify-center hover:from-[#2E6FFF] hover:to-[#2A63E6] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-1">
                  Powered by Botivate AI
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`group relative w-16 h-16 bg-gradient-to-br from-[#387AFF] via-[#2C6DFF] to-[#387AFF] text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{
            boxShadow: '0 8px 32px rgba(56, 122, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Pulse ring animation */}
          <span className="absolute inset-0 rounded-full bg-[#387AFF] opacity-75 animate-ping" style={{ animationDuration: '2s' }}></span>
          
          {/* Button content */}
          <span className="relative z-10 flex items-center justify-center">
            <Bot className="w-7 h-7 drop-shadow-md" />
          </span>
          
          {/* Tooltip */}
          <span className="absolute -top-12 right-0 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            Chat with us
            <span className="absolute bottom-[-4px] right-4 w-2 h-2 bg-gray-900 transform rotate-45"></span>
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
