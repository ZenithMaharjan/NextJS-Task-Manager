"use client";

import { X, Send, MessageSquare, Bot } from "lucide-react";
import { useState, useRef, useEffect, useCallback, useMemo, type FormEvent } from "react";

type Role = "user" | "ai" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  visibleTo?: Role[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    content: "Hey there! I'm your assistant. How can I help you with your tasks today?",
    timestamp: new Date(),
  },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  const handleSendMessage = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      if (!inputValue.trim()) return;

      const newMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: inputValue.trim(),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      setInputValue("");
      setIsTyping(true);

      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "what's next?",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1000);
    },
    [inputValue],
  );

  const visibleMessages = useMemo(
    () => messages.filter(msg => !msg.visibleTo || msg.visibleTo.includes("user")),
    [messages],
  );

  const openChatbot = useCallback(() => setIsOpen(true), []);
  const closeChatbot = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        onClick={openChatbot}
        className={`fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 z-100 ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        } cursor-pointer`}
        aria-label="Open Chatbot"
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-100 md:hidden transition-opacity"
          onClick={closeChatbot}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-100 bg-white dark:bg-[#0f172a] shadow-2xl z-101 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-700 bg-blue-600">
          {" "}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-xl">
              <Bot size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-blue-100 font-medium">Online</p>
            </div>
          </div>
          <button
            onClick={closeChatbot}
            className="p-2 text-white hover:bg-blue-700 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0a0f1c]">
          {visibleMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm shadow-md"
                    : "bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-slate-700 shadow-sm"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 text-right opacity-70 ${
                    msg.role === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3.5 bg-white dark:bg-slate-800 rounded-bl-sm border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-1.5 h-10">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-typing-dot"
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-typing-dot"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-typing-dot"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 p-1 pl-4 bg-slate-100 dark:bg-slate-800 rounded-full focus-within:ring-2 focus-within:ring-blue-500/50 transition-shadow"
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent border-none text-sm focus:outline-none dark:text-gray-100 placeholder-slate-400 dark:placeholder-slate-500 py-2"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} className={inputValue.trim() ? "translate-x-px" : ""} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
