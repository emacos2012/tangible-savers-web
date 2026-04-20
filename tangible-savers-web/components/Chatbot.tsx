'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatbotMessage } from '@/lib/types';

const WELCOME_MESSAGE = `Hello! 👋  

Welcome back to Tangiblesavers—your partner in smart saving, secure payments, and easy investing.  

Is there anything specific you'd like help with today?

For example:

- Setting up a savings plan 🎯
- Learning how to use the digital wallet 💳
- Exploring investment options 📈
- Finding shopping or transport discounts 🛍️🚌
- Troubleshooting an issue 🔧

Just let me know, and I'll guide you step by step! 😊`;

const QUICK_REPLIES = [
  { label: '💳 Digital Wallet', action: 'wallet' },
  { label: '🎯 Savings Plan', action: 'savings' },
  { label: '📈 Investments', action: 'investments' },
  { label: '🛍️ Shopping', action: 'shopping' },
  { label: '🏠 Housing', action: 'housing' },
  { label: '🚌 Transport', action: 'transport' },
];

const RESPONSES: Record<string, string> = {
  wallet: `💳 **Digital Wallet Help**

Your Tangiblesavers wallet is your gateway to seamless transactions!

**Features:**
- Send and receive Pi cryptocurrency
- View transaction history
- Add funds to your wallet
- Pay with QR code

**How to use:**
1. Go to the Wallet section from the menu
2. Click "Add Funds" to top up
3. Use "Send" to transfer to others
4. Tap "Pay with QR" for in-store payments

Need more help? Ask me anything!`,

  savings: `🎯 **Savings Plan Help**

Achieve your financial goals with Tangiblesavers savings plans!

**Features:**
- Create multiple savings goals
- Track progress with visual charts
- Set target amounts and deadlines
- Earn interest on savings

**How to create a savings goal:**
1. Go to Savings section
2. Click "Create New Goal"
3. Enter your goal name (e.g., "New Phone")
4. Set target amount and deadline
5. Start saving!

**Tips:**
- Set realistic targets
- Make regular contributions
- Celebrate milestones!

What would you like to know more about?`,

  investments: `📈 **Investment Options**

Grow your wealth with Tangiblesavers investment features!

**Available Options:**
- **Stocks**: Invest in verified companies
- **Bonds**: Steady returns with lower risk
- **Crypto**: Diversify with Pi and other coins
- **Real Estate**: Property investment opportunities

**Getting Started:**
1. Visit the Investments section
2. Browse available options
3. Check risk levels and expected returns
4. Start with small amounts
5. Diversify your portfolio

**Risk Levels:**
- 🟢 Low: Bonds, savings accounts
- 🟡 Medium: Some stocks, real estate
- 🔴 High: Crypto, startup investments

Remember: All investments carry risk. Only invest what you can afford to lose!

Any questions about specific investment types?`,

  shopping: `🛍️ **Shopping Mall Help**

Find the best deals with Tangiblesavers Shopping!

**Categories:**
- 🏠 Groceries - Daily essentials
- 📱 Electronics - Gadgets and devices
- 🏠 Home Goods - Furniture and decor

**How to Shop:**
1. Browse categories or search products
2. Add items to your cart
3. Review your cart
4. Checkout with Pi cryptocurrency
5. Track delivery status

**Features:**
- Exclusive member discounts
- Deal notifications
- Secure payments
- Order tracking

Happy shopping! 🛒`,

  housing: `🏠 **Housing & Estates Help**

Find your perfect home with Tangiblesavers!

**Features:**
- Browse available estates
- View property details
- Pay monthly dues
- Link to your property
- Request mover services

**How to Use:**
1. Visit the Housing section
2. Browse available estates
3. View property details and amenities
4. Select your preferred unit
5. Link to your profile
6. Pay dues easily with Pi

**Services:**
- Estate browsing
- Monthly dues payment
- Property management
- Mover requests

Need help finding housing?`,

  transport: `🚌 **Transportation Help**

Book rides and save on transport with Tangiblesavers!

**Features:**
- Inter-city transportation booking
- Compare prices
- Save for vehicle purchases
- Track your bookings

**How to Book:**
1. Go to Transportation section
2. Enter your travel details
3. Browse available options
4. Select your preferred ride
5. Pay with Pi
6. Track your booking

**Tips:**
- Book in advance for better prices
- Compare different providers
- Save trips for future reference

Need help with a specific booking?`,
};

// Helper function to create welcome message
const createWelcomeMessage = (): ChatbotMessage => ({
  id: 'welcome',
  role: 'assistant',
  content: WELCOME_MESSAGE,
  timestamp: new Date(),
});

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate unique IDs using useRef to avoid calling Date.now() during render
  const idCounter = useRef(0);
  const generateId = () => {
    idCounter.current += 1;
    return `msg-${idCounter.current}`;
  };

  // Initialize messages when chat is opened for the first time
  useEffect(() => {
    if (isOpen && !isInitialized) {
      // Use setTimeout to defer state update and avoid the lint error
      const timer = setTimeout(() => {
        setMessages([createWelcomeMessage()]);
        setIsInitialized(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isInitialized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickReply = useCallback((action: string) => {
    const userMsg: ChatbotMessage = {
      id: generateId(),
      role: 'user',
      content: QUICK_REPLIES.find(r => r.action === action)?.label || action,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response = RESPONSES[action] || 'Thank you for your message! How can I help you further?';
      const botMsg: ChatbotMessage = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatbotMessage = {
      id: generateId(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const lowerInput = inputMessage.toLowerCase();
      let response = 'Thank you for your message! Our team will get back to you shortly. In the meantime, you can explore our quick options below.';
      
      if (lowerInput.includes('wallet') || lowerInput.includes('balance')) {
        response = RESPONSES.wallet;
      } else if (lowerInput.includes('saving') || lowerInput.includes('goal')) {
        response = RESPONSES.savings;
      } else if (lowerInput.includes('invest')) {
        response = RESPONSES.investments;
      } else if (lowerInput.includes('shop') || lowerInput.includes('buy')) {
        response = RESPONSES.shopping;
      } else if (lowerInput.includes('house') || lowerInput.includes('estate') || lowerInput.includes('rent')) {
        response = RESPONSES.housing;
      } else if (lowerInput.includes('transport') || lowerInput.includes('bus') || lowerInput.includes('ride')) {
        response = RESPONSES.transport;
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
        response = WELCOME_MESSAGE;
      }
      
      const botMsg: ChatbotMessage = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  }, [inputMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-90' 
            : 'bg-gold hover:bg-yellow-500'
        }`}
        style={{ backgroundColor: isOpen ? '#F44336' : '#FFD700' }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-navy p-4 text-white flex items-center gap-3" style={{ backgroundColor: '#1A237E' }}>
            <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h3 className="font-bold">Tangiblesavers</h3>
              <p className="text-xs text-gray-300">AI Assistant</p>
            </div>
            <div className="ml-auto">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-gold text-gray-900 rounded-br-md'
                      : 'bg-white shadow-md text-gray-800 rounded-bl-md'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: '#FFD700' } : {}}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white shadow-md rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-gray-100 border-t flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply.action}
                  onClick={() => handleQuickReply(reply.action)}
                  className="text-xs px-3 py-1.5 bg-white rounded-full shadow-sm hover:bg-gold hover:text-gray-900 transition-colors border border-gray-200"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="w-10 h-10 rounded-full bg-gold hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

