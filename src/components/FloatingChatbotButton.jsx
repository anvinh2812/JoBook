// import { useState } from 'react';
// import { MessageCircle } from 'lucide-react';
// import ChatBotModal from './ChatBotModal';

// export default function FloatingChatbotButton() {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <button
//         onClick={() => setOpen(true)}
//         className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 hover:bg-blue-700"
//       >
//         <MessageCircle />
//       </button>
//       {open && <ChatBotModal onClose={() => setOpen(false)} />}
//     </>
//   );
// }
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatBotModal from './ChatBotModal';

export default function FloatingChatbotButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 hover:bg-blue-700"
      >
        <MessageCircle />
      </button>
      {open && <ChatBotModal onClose={() => setOpen(false)} />}
    </>
  );
}
