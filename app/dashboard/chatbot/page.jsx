"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LuDog } from "react-icons/lu";
import { HiMiniPaperAirplane } from "react-icons/hi2";
import { IoHome, IoMenu, IoClose } from "react-icons/io5";
import { FaCamera, FaPlus, FaTrash, FaEdit, FaImage, FaHistory } from "react-icons/fa";
import ChatMessage from "./_component/ChatMessage";
import { useUser } from "@clerk/nextjs";
import { Info } from "@/app/_components/_context/Info";
import Image from "next/image";
import { useToast } from "@/components/ToastProvider";

function Chatbot() {
  const { user } = useUser();
  const inputRef = useRef();
  const ChatbodyRef = useRef();
  const { showToast } = useToast();


  
  const [inputValue, setInputValue] = useState("");
  const [chatHistory, setChatHistory] = useState([{
    hideInChat: true,
    role: "model",
    text: Info
  }]);

  
  const [savedChats, setSavedChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchSavedChats();
    }
  }, [user]);

  
  useEffect(() => {
    if (ChatbodyRef.current) {
      ChatbodyRef.current.scrollTo({ top: ChatbodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chatHistory]);

  const fetchSavedChats = async () => {
    setIsLoadingHistory(true);
    try {
      const email = user.primaryEmailAddress.emailAddress;
      const res = await fetch(`/api/chats?userEmail=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setSavedChats(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch chats", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleStartNewChat = () => {
    setChatHistory([{
      hideInChat: true,
      role: "model",
      text: Info
    }]);
    setInputValue("");
    setActiveChatId(null);
    setSelectedImage(null);
    setPreviewImage(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const saveOrUpdateChatInDB = async (historyToSave, newChatName = null, newImageUrl = null) => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const email = user.primaryEmailAddress.emailAddress;

      
      if (!activeChatId) {
        
        const chatName = newChatName || historyToSave.find(m => m.role === 'user')?.text?.substring(0, 30) + '...' || 'New Chat';

        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: email,
            chatName,
            chatHistory: JSON.stringify(historyToSave),
            uploadedImage: newImageUrl
          })
        });
        const data = await res.json();

        if (data.success) {
          setActiveChatId(data.data.id);
          setSavedChats(prev => [data.data, ...prev]);
        }
      } else {
        
        const res = await fetch('/api/chats', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: activeChatId,
            chatName: newChatName, 
            chatHistory: JSON.stringify(historyToSave)
          })
        });
        if (res.ok) {
          
          setSavedChats(prev => prev.map(c =>
            c.id === activeChatId ? { ...c, chatHistory: JSON.stringify(historyToSave), ...(newChatName && { chatName: newChatName }) } : c
          ));
        }
      }
    } catch (err) {
      console.error("Failed to save chat", err);
    }
  };

  const loadPreviousChat = (chat) => {
    if (chat.id === activeChatId) return;

    try {
      const parsedHistory = JSON.parse(chat.chatHistory);
      setChatHistory(parsedHistory);
      setActiveChatId(chat.id);
      setSelectedImage(null);
      setPreviewImage(null);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      console.error("Failed to parse history", err);
    }
  };

  const deleteChat = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const res = await fetch(`/api/chats?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSavedChats(prev => prev.filter(c => c.id !== id));
        if (activeChatId === id) handleStartNewChat();
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const updateChatName = async (id, currentName, e) => {
    e.stopPropagation();
    const newName = prompt("Enter new chat name:", currentName);
    if (!newName || newName.trim() === currentName) return;

    try {
      const res = await fetch('/api/chats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, chatName: newName.trim() })
      });
      if (res.ok) {
        setSavedChats(prev => prev.map(c => c.id === id ? { ...c, chatName: newName.trim() } : c));
      }
    } catch (err) {
      console.error("Failed to update name", err);
    }
  };

  
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chatbot"); 
    formData.append("folder", "chatbot");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error("Cloudinary upload failed");
    return data.secure_url;
  };

  
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const generateResponse = async (historyToGemini, imageBase64 = null, imageMime = null, cloudinaryUrl = null) => {
    
    let systemInstruction = `\n\n(INSTRUCTIONS: Please format your response professionally using Markdown. Use clearly bolded headlines, styled bullet points, and actionable step-by-step instructions. `;
    if (imageBase64) {
      systemInstruction += `The user has provided an image of their pet. Act as an expert veterinarian. Visually analyze the pet's condition from the image. State the potential visible problems, how to care for/cure it, and general medical advice. Always add a disclaimer to consult a real vet.)`;
    } else {
      systemInstruction += `Answer the user's veterinary questions directly but comprehensively.)`;
    }

    try {
      const formattedHistory = historyToGemini.map(({ role, text }) => ({ role, parts: [{ text }] }));

      
      if (imageBase64) {
        formattedHistory[formattedHistory.length - 1].parts.push({
          inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: imageMime
          }
        });
      }

      
      formattedHistory[formattedHistory.length - 1].parts[0].text += systemInstruction;

      const requestOption = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedHistory })
      };

      
      const response = await fetch('/api/chats/generate', requestOption);

      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error('Response is not JSON:', contentType);
        throw new Error('Server error - please restart the development server');
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error || data?.details || "Something went wrong.");
      }

      const apiResponseText = data.candidates[0].content.parts[0].text.trim();

      
      const updatedHistory = [
        ...historyToGemini.map(msg => ({ ...msg, text: msg.text === "Thinking..." ? apiResponseText : msg.text })),
      ];

      if (!historyToGemini.find(m => m.text === "Thinking...")) {
        updatedHistory.push({ role: "model", text: apiResponseText });
      } else {
        updatedHistory[updatedHistory.length - 1] = { role: "model", text: apiResponseText };
      }

      setChatHistory(updatedHistory);

      
      await saveOrUpdateChatInDB(updatedHistory, null, cloudinaryUrl);

    } catch (error) {
      console.error(error.message);

      const errorHistory = [...historyToGemini];
      if (errorHistory[errorHistory.length - 1].text === "Thinking...") {
        errorHistory[errorHistory.length - 1] = { role: "model", text: "Sorry, I encountered an error processing your request. Please try again." };
      } else {
        errorHistory.push({ role: "model", text: "Sorry, I encountered an error processing your request. Please try again." });
      }
      setChatHistory(errorHistory);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userMessage = inputRef.current?.value.trim() || "";
    if (!userMessage && !selectedImage) return;

    setInputValue("");
    setIsUploading(true);

    let cloudinaryUrl = null;
    let base64Data = null;
    let mimeType = null;
    let currentImage = selectedImage;

    
    setSelectedImage(null);
    setPreviewImage(null);

    try {
      
      if (currentImage) {
        cloudinaryUrl = await uploadImageToCloudinary(currentImage);
        base64Data = await fileToBase64(currentImage);
        mimeType = currentImage.type;
      }

      
      const userMessageObj = {
        role: "user",
        text: userMessage || "Analyze this image",
        imageUrl: cloudinaryUrl
      };

      const updatedHistory = [...chatHistory, userMessageObj];
      setChatHistory(updatedHistory);

      
      await saveOrUpdateChatInDB(updatedHistory, null, cloudinaryUrl);

      
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: "model", text: "Thinking..." }]);

        
        const historyForGemini = [...updatedHistory];
        generateResponse(historyForGemini, base64Data, mimeType, cloudinaryUrl);
      }, 300);

    } catch (err) {
      showToast("Error processing request: " + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] md:h-[calc(100vh-80px)] w-full overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className={`absolute md:relative inset-y-0 left-0 z-40 w-72 bg-white shadow-xl transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0 ml-0 md:shadow-none' : '-translate-x-full md:-ml-72'}`}>
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className="font-bold text-[#1b3a34] flex items-center gap-2">
            <FaHistory /> Chat History
          </h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={handleStartNewChat}
            className="w-full py-3 bg-[#1b3a34] text-[#fcf8ef] flex justify-center items-center gap-2 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <FaPlus /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {isLoadingHistory ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-[#1b3a34] border-t-transparent rounded-full"></div>
            </div>
          ) : savedChats.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 text-sm">No recent chats</div>
          ) : (
            <ul className="space-y-2">
              {savedChats.map(chat => (
                <li key={chat.id} className="relative group">
                  <button
                    onClick={() => loadPreviousChat(chat)}
                    className={`w-full text-left truncate px-4 py-3 rounded-lg text-sm transition-all ${activeChatId === chat.id
                      ? 'bg-[#1b3a34] text-[#fcf8ef] font-semibold'
                      : 'text-gray-500 hover:bg-[#1b3a34] hover:text-[#fcf8ef]'
                      }`}
                  >
                    {chat.chatName}
                  </button>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => updateChatName(chat.id, chat.chatName, e)} className="p-1.5 text-blue-50 cursor-pointer hover:text-blue-500 rounded-md">
                      <FaEdit />
                    </button>
                    <button onClick={(e) => deleteChat(chat.id, e)} className="p-1.5 text-red-50 cursor-pointer hover:text-red-500 rounded-md">
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col relative h-full max-w-5xl mx-auto">
        <div className="p-4 bg-white/80 backdrop-blur-md border-b flex items-center justify-between z-10 sticky top-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600 hover:text-gray-900 focus:outline-none bg-gray-100 p-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
            <IoMenu size={28} />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold flex items-center justify-center gap-2 text-[#1b3a34]">
              <LuDog className="text-[#1b3a34] text-2xl" /> VetMeds Vision Assistant
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">Ask questions or upload pet photos for instant AI Veterinary Analysis</p>
          </div>

          <div className="w-8"></div> {}
        </div>
        <div
          ref={ChatbodyRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 bg-gray-50/30 w-full"
        >
          {chatHistory.length <= 1 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
              <Image src="/logo.png" alt="Logo" width={100} height={100} />
              <h2 className="text-2xl font-bold text-gray-400">How can I help {user?.fullName?.split(' ')[0]}?</h2>
              <p className="max-w-md text-sm text-gray-500">I can analyze your pet's symptoms. Upload a clear photo of an injury, skin condition, or abnormal behavior along with a description.</p>
            </div>
          )}

          
          <div className="flex flex-col gap-4 w-full">
            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}
          </div>
        </div>

        
        <div className="bg-white border-t p-3 sm:p-4 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20 sticky bottom-0">

          
          {previewImage && (
            <div className="relative inline-block mb-3 ml-2 group">
              <div className="border-4 border-[#1b3a34] rounded-xl overflow-hidden shadow-md">
                <Image src={previewImage} alt="selected" width={80} height={80} className="object-cover w-20 h-20" />
              </div>
              <button
                onClick={() => { setSelectedImage(null); setPreviewImage(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-[#fcf8ef] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <IoClose size={16} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">

            
            <label className={`cursor-pointer p-3 sm:p-4 rounded-full border border-gray-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#1b3a34] ${isUploading ? 'bg-gray-100 opacity-50' : 'bg-white hover:bg-[#1b3a34] text-[#1b3a34]'}`}>
              <FaCamera className="text-lg sm:text-xl" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                disabled={isUploading}
              />
            </label>

            
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={previewImage ? "Add context about this image..." : "Describe your pet's symptoms or ask a question..."}
                required={!previewImage}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isUploading}
                ref={inputRef}
                className="w-full border-2 border-[#1b3a34]/30 hover:border-[#1b3a34]/60 transition-colors p-3 sm:p-4 rounded-full pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-[#1b3a34] focus:border-transparent disabled:bg-gray-50"
              />

              
              <button
                type="submit"
                disabled={isUploading || (!inputValue.trim() && !selectedImage)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 sm:p-3 text-[#fcf8ef] rounded-full bg-[#1b3a34] flex items-center justify-center shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <HiMiniPaperAirplane className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
