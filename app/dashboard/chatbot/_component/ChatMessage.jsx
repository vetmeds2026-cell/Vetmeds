import React from 'react';
import { LuDog } from "react-icons/lu";
import { FaUser } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

function ChatMessage({ chat }) {
  if (chat.hideInChat) return null;
  const isBot = chat.role === "model";
  
  // Special styling for the "Thinking..." message
  const isThinking = isBot && chat.text === "Thinking...";
  
  return (
    <div className={`w-full flex my-3 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot ? (
        <div className="flex items-start gap-2 w-full max-w-[90%] sm:max-w-[80%]">
          <div className=" bg-[#1b3a34] text-[#fcf8ef] text-xl rounded-full flex items-center justify-center h-8 w-8 flex-shrink-0 mt-1">
           <Image src={'/whitelogo.png'} alt="dog" width={500} height={500} className='w-40 '/>
          </div>
          <div className={`${isThinking ? 'bg-[#fcf8ef] animate-pulse' : 'bg-[#fcf8ef]'} text-[#1b3a34] rounded-2xl px-5 py-4 shadow-sm sm:text-base w-full break-words prose prose-sm max-w-none`}>
            {isThinking ? (
              <span className="text-gray-600 font-medium">Thinking...</span>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {chat.text}
              </ReactMarkdown>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 max-w-[90%] sm:max-w-[80%] justify-end">
          <div className="flex flex-col items-end gap-2 w-full">
            {chat.imageUrl && (
              <div className="rounded-2xl overflow-hidden shadow-md max-w-xs border-2 border-[#1b3a34]">
                <Image src={chat.imageUrl} alt="Uploaded pet" width={300} height={300} className="object-cover" />
              </div>
            )}
            <div className="bg-[#1b3a34] text-[#fcf8ef] rounded-2xl px-5 py-3 shadow-sm sm:text-base w-full break-words text-left ml-auto font-medium">
              {chat.text}
            </div>
          </div>
          <div className="p-2 bg-[#1b3a34] text-[#fcf8ef] text-sm rounded-full flex items-center justify-center h-8 w-8 flex-shrink-0 mt-1">
            <FaUser />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
