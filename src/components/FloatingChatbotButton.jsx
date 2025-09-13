import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatBotModal from './ChatBotModal';

const FloatingChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition"
        >
          <MessageSquare className="text-white w-7 h-7" />
        </button>
      </div>
      {isOpen && <ChatBotModal onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default FloatingChatbotButton;
