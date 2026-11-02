import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Bot } from 'lucide-react';
import { ChatMessage, SentenceAnalysis, ErrorAnnotation } from '../types.ts';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentText?: string;
  activeSentence?: SentenceAnalysis | null;
  activeAnnotation?: ErrorAnnotation | null;
}

const QUICK_PROMPTS = [
  'Mengapa "agar supaya" dinilai tidak efektif?',
  'Kapan tanda koma wajib sebelum kata "tetapi"?',
  'Jelaskan ciri kalimat efektif menurut Tata Bahasa Baku!',
  'Bagaimana aturan penulisan bentuk terikat "pasca-" dan "antar-"?',
];

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentText = '',
  activeSentence = null,
  activeAnnotation = null,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Halo! Saya **Asisten KOTARI**, siap mendampingi Anda membedah struktur kalimat, menjelaskan aturan ejaan SK EYD 2022, serta menyarankan diksi yang efektif dan bernas. Ada kalimat atau kaidah yang ingin didiskusikan?',
      timestamp: 'Baru saja',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (activeAnnotation) {
      const promptText = `Bisa jelaskan lebih dalam mengapa kata "${activeAnnotation.faultyText}" dianggap salah dan mengapa saran "${activeAnnotation.suggestion}" lebih sesuai kaidah? (${activeAnnotation.ruleReference})`;
      handleSend(promptText);
    } else if (activeSentence) {
      const promptText = `Tolong jelaskan struktur sintaksis dan kelemahan kalimat ini: "${activeSentence.original}"`;
      handleSend(promptText);
    }
  }, [activeAnnotation, activeSentence]);

  const handleSend = async (textToSend?: string) => {
    const userText = textToSend || inputMessage;
    if (!userText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/kotari/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText.trim(),
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          currentText,
          sentenceContext: activeSentence || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi asisten');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.reply || 'Maaf, saya tidak dapat merespons saat ini.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: 'Maaf, terjadi kendala koneksi ke server. Silakan coba kembali dalam beberapa saat.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white/95 dark:bg-[#0c1824]/95 backdrop-blur-2xl border-l border-[#84c1b9]/30 dark:border-[#347899]/40 shadow-2xl flex flex-col transition-all animate-in slide-in-from-right duration-200">
      {/* Header with authentic KOTARI logo */}
      <div className="p-4 border-b border-[#84c1b9]/25 dark:border-[#347899]/35 flex items-center justify-between bg-white/60 dark:bg-[#10202e]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs ring-1 ring-[#539ab7]/40 bg-[#347899]">
            <img
              src="/assets/aistudio/KOTARI_a466f6ed.png"
              alt="Logo KOTARI"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              Asisten Linguistik KOTARI
            </h3>
            <span className="text-[11px] font-medium text-[#539ab7] dark:text-[#84c1b9]">
              EYD V & Tata Bahasa Baku
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#152737] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-0.5 ring-1 ring-[#539ab7]/30 bg-[#347899]">
                <img
                  src="/assets/aistudio/KOTARI_a466f6ed.png"
                  alt="Avatar Bot"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#347899] text-white rounded-tr-none shadow-md shadow-[#347899]/15'
                  : 'bg-slate-100/80 dark:bg-[#142636]/90 text-slate-800 dark:text-slate-200 rounded-tl-none border border-[#84c1b9]/25 dark:border-[#347899]/30 whitespace-pre-line'
              }`}
            >
              {msg.content}
              <div
                className={`text-[10px] mt-1 text-right ${
                  msg.role === 'user' ? 'text-white/70' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-[#142636] flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 ring-1 ring-[#539ab7]/30 bg-[#347899]">
              <img
                src="/assets/aistudio/KOTARI_a466f6ed.png"
                alt="Avatar Bot"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-slate-100 dark:bg-[#142636] rounded-2xl rounded-tl-none px-4 py-3 border border-[#84c1b9]/25 dark:border-[#347899]/30 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#53aca2] animate-bounce" />
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#53aca2] animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#53aca2] animate-bounce"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-[#84c1b9]/25 dark:border-[#347899]/35 bg-slate-50/60 dark:bg-[#0a1723]/60 overflow-x-auto">
        <div className="flex gap-1.5 pb-1 no-scrollbar">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-[#142636] border border-[#84c1b9]/30 dark:border-[#347899]/40 text-slate-600 dark:text-slate-300 hover:border-[#539ab7] hover:text-[#347899] dark:hover:text-[#9cbfe5] transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-[#84c1b9]/25 dark:border-[#347899]/35 bg-white dark:bg-[#0c1824]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tanyakan kaidah atau kesalahan kalimat..."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#84c1b9]/35 dark:border-[#347899]/45 bg-slate-50/70 dark:bg-[#142636]/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#539ab7]"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#347899] hover:bg-[#539ab7] disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
