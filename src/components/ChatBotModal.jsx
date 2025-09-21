import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import axios from 'axios';

const ChatBotModal = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await axios.post(`${__API_BASE_URL__}/gemini/chat`, { prompt: input });
      const reply = res.data.response || 'Xin lỗi, hiện tại trợ lý AI đang gặp sự cố. Bạn thử hỏi lại sau nhé!';
      const links = Array.isArray(res.data.links) ? res.data.links : [];

      setMessages([...newMessages, { sender: 'ai', text: reply, links }]);
    } catch (err) {
      setMessages([...newMessages, { sender: 'ai', text: 'Xin lỗi, hiện tại trợ lý AI đang gặp sự cố. Bạn thử hỏi lại sau nhé!' }]);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Trợ lý AI JoBook</span>
        </div>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-white hover:text-gray-200" />
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`max-w-[80%] ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}>
            <div
              className={`px-3 py-2 rounded-lg text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'ai' && Array.isArray(msg.links) && msg.links.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="text-xs text-gray-600 hover:text-gray-900 underline"
                >
                  {expanded[i] ? 'Ẩn đường dẫn' : `Hiện ${msg.links.length} đường dẫn`}
                </button>
                {expanded[i] && (
                  <div className="mt-2 grid grid-cols-1 gap-1">
                    {msg.links.map((l, idx) => (
                      <Link
                        key={`${l.type}-${idx}-${l.href}`}
                        to={l.href}
                        className="text-sm text-blue-600 hover:underline truncate"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
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
