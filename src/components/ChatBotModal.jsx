import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const ChatBotModal = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await axios.post('http://localhost:5001/api/gemini/chat', { prompt: input });
      const reply = res.data.response || '⚠️ Lỗi phản hồi từ AI.';

      setMessages([...newMessages, { sender: 'ai', text: reply }]);
    } catch (err) {
      setMessages([...newMessages, { sender: 'ai', text: '⚠️ Lỗi phản hồi từ AI.' }]);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
        <div className="flex items-center space-x-2">
          {/* <img src="/logo.png" alt="JoBook Logo" className="w-6 h-6 rounded-full" /> */}
          <span className="font-semibold">Trợ lý AI JoBook</span>
        </div>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-white hover:text-gray-200" />
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${msg.sender === 'user'
              ? 'ml-auto bg-blue-500 text-white'
              : 'mr-auto bg-gray-100 text-gray-900'
              }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center border-t p-3 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Nhập câu hỏi về CV, xin việc..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBotModal;
