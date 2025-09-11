import { useState } from 'react';
import axios from 'axios';

export default function ChatBotModal({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/gemini/chat', { prompt: input });
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.response || '⚠️ AI không trả lời' }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [...prev, { role: 'bot', text: '⚠️ Lỗi phản hồi từ AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border z-50 flex flex-col">
      <div className="flex justify-between items-center p-3 border-b bg-gray-100">
        <strong>Chat với trợ lý AI</strong>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-200'}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="text-gray-500">Đang trả lời...</div>}
      </div>

      <div className="p-2 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Nhập câu hỏi về CV, xin việc..."
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
}
