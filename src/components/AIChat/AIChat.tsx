import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Trash2,
  Loader2,
  Copy,
  Check,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';

import { WeatherData, ChatMessage } from '../../types/weather';
import { useLanguage } from '../../i18n/context/LanguageContext';
import { askWeatherAI } from '../../services/aiService';
import { useWeatherVoice } from '../../hooks/useWeatherVoice';
import { getLocalizedWelcomeMessage } from '../../i18n/utils';

import {
  loadSavedChatMessages,
  saveChatMessages,
  clearSavedChatMessages,
} from '../../services/storageService';

interface AIChatProps {
  weather: WeatherData;
}

export const AIChat: React.FC<AIChatProps> = ({
  weather,
}) => {
  const { t, language } = useLanguage();

  // =========================
  // CHAT MESSAGES
  // =========================

  const [messages, setMessages] =
    useState<ChatMessage[]>(() => {
      const saved = loadSavedChatMessages();

      if (saved && saved.length > 0) {
        return saved;
      }

      return [
        {
          id: 'welcome-1',
          sender: 'ai',
          text: getLocalizedWelcomeMessage(
            weather,
            t
          ),
          timestamp:
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
        },
      ];
    });


  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      saveChatMessages(messages);
    }
  }, [messages]);


  // Update welcome message
  useEffect(() => {
    setMessages((prev) => {
      if (
        prev.length === 1 &&
        prev[0].sender === 'ai' &&
        prev[0].id.startsWith('welcome')
      ) {
        return [
          {
            id: 'welcome-1',
            sender: 'ai',
            text: getLocalizedWelcomeMessage(
              weather,
              t
            ),
            timestamp:
              new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
          },
        ];
      }

      return prev;
    });
  }, [
    weather.city,
    weather.temperature,
    language,
  ]);


  // =========================
  // STATES
  // =========================

  const [input, setInput] =
    useState('');

  const [isTyping, setIsTyping] =
    useState(false);

  const [copiedId, setCopiedId] =
    useState<string | null>(null);


  // =========================
  // REFS
  // =========================

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const chatContainerRef =
    useRef<HTMLDivElement>(null);

  const isInitialMount =
    useRef(true);


  // =========================
  // VOICE HOOK
  // =========================

  const {
    isListening,
    interimTranscript,
    isSpeechSupported,

    isTtsSupported,
    isSpeaking,
    speakingId,

    autoSpeak,
    toggleAutoSpeak,

    startListening,
    stopListening,

    speak,
    stopSpeaking,

  } = useWeatherVoice(language);


  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top:
          chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [
    messages,
    isTyping,
    interimTranscript,
  ]);


  // =========================
  // SUGGESTED QUESTIONS
  // =========================

  const suggestedQuestions = [
    t(
      'suggestedQ1',
      'Will it rain today?'
    ),

    t(
      'suggestedQ2',
      'How is the air quality?'
    ),

    t(
      'suggestedQ3',
      'Should I go outside?'
    ),

    t(
      'suggestedQ4',
      'What should I wear today?'
    ),

    t(
      'suggestedQ5',
      'Is it safe to exercise outside?'
    ),

    t(
      'suggestedQ6',
      'What will the weather be like tomorrow?'
    ),
  ];


  // =========================
  // SEND MESSAGE
  // =========================

  const handleSend = async (
    queryText?: string
  ) => {

    const textToSend =
      (queryText || input).trim();


    if (!textToSend || isTyping) {
      return;
    }


    // Stop any AI voice
    stopSpeaking();


    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,

      sender: 'user',

      text: textToSend,

      timestamp:
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
    };


    setMessages((prev) => [
      ...prev,
      userMsg,
    ]);


    setInput('');

    setIsTyping(true);


    try {

      const aiReply = await askWeatherAI(
  textToSend,
  weather,
  messages,
  language
);

const aiReplyText = aiReply.answer;


      const aiMsgId =
        `ai-${Date.now()}`;


      const aiMsg: ChatMessage = {
  id: aiMsgId,
  sender: 'ai',
  text: aiReplyText,
  timestamp: new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
  sources: aiReply.sources || [],
  researchUsed: aiReply.researchUsed || false,
};


      setMessages((prev) => [
        ...prev,
        aiMsg,
      ]);


      // Auto speak AI response
      if (
        autoSpeak &&
        isTtsSupported
      ) {

        setTimeout(() => {

          speak(
            aiReplyText,
            aiMsgId
          );

        }, 200);

      }

    } catch (err: any) {

      const errorText =
        err?.message ||
        t(
          'aiError',
          'Unable to generate an AI response. Please try again.'
        );


      const errorMsg: ChatMessage = {
        id:
          `ai-err-${Date.now()}`,

        sender: 'ai',

        text: errorText,

        timestamp:
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
      };


      setMessages((prev) => [
        ...prev,
        errorMsg,
      ]);

    } finally {

      setIsTyping(false);

    }

  };


  // =========================
  // KEYBOARD
  // =========================

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {

      e.preventDefault();

      handleSend();

    }

  };


  // =========================
  // COPY
  // =========================

  const handleCopy = (
    id: string,
    text: string
  ) => {

    navigator.clipboard.writeText(text);

    setCopiedId(id);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);

  };


  // =========================
  // CLEAR HISTORY
  // =========================

  const handleClearHistory = () => {

    stopSpeaking();

    clearSavedChatMessages();


    setMessages([
      {
        id:
          `welcome-${Date.now()}`,

        sender: 'ai',

        text:
          `${t(
            'conversationCleared',
            'Conversation cleared.'
          )} ${t(
            'aiReadyPrompt',
            "I'm ready to answer any questions about the weather in"
          )} **${weather.city}**.`,

        timestamp:
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
      },
    ]);

  };


  // =========================
  // VOICE TOGGLE
  // =========================

  const handleToggleVoice = () => {
  if (!isSpeechSupported) {
    alert(
      'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
    );
    return;
  }

  if (isListening) {
    stopListening();
    return;
  }

  stopSpeaking();

  startListening((text: string) => {
    console.log('🎤 RECEIVED VOICE TEXT:', text);

    if (text.trim()) {
      setInput(text.trim());
    }
  });
};
  return (

    <section
      id="ai-weather-assistant-section"
      className="w-full space-y-4"
    >

      {/* =====================
          HEADER
      ===================== */}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">

        <div>

          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest font-['Space_Grotesk'] flex items-center gap-1.5">

            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />

            {t(
              'aiAssistantTitle',
              'AI WEATHER ASSISTANT'
            )}

          </div>


          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Space_Grotesk']">

            {t(
              'aiAssistantSubtitle',
              'Ask anything about your weather'
            )}

          </h2>

        </div>


        {/* CONTROLS */}

        <div className="flex items-center flex-wrap gap-2">

          <div
            id="ai-online-status"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
          >

            <span className="relative flex h-2 w-2">

              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />

            </span>

            <span>
              {t(
                'aiOnline',
                'AI Online'
              )}
            </span>

          </div>


          {/* AUTO VOICE */}

          {isTtsSupported && (

            <button
              onClick={toggleAutoSpeak}
              id="ai-auto-voice-toggle"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                autoSpeak
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >

              {autoSpeak ? (

                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />

                  <span>
                    {t(
                      'autoSpeak',
                      'Voice Mode'
                    )}
                    :
                    {' '}
                    {t(
                      'onState',
                      'ON'
                    )}
                  </span>
                </>

              ) : (

                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />

                  <span>
                    {t(
                      'autoSpeak',
                      'Voice Mode'
                    )}
                    :
                    {' '}
                    {t(
                      'offState',
                      'OFF'
                    )}
                  </span>
                </>

              )}

            </button>

          )}


          {/* CLEAR */}

          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors text-xs"
            title={t(
              'clearChat',
              'Clear History'
            )}
          >

            <Trash2 className="w-4 h-4" />

          </button>

        </div>

      </div>


      {/* =====================
          CHAT CONTAINER
      ===================== */}

      <div className="glass-panel rounded-3xl overflow-hidden border border-cyan-500/20 shadow-2xl flex flex-col h-[530px]">


        {/* SUGGESTED QUESTIONS */}

        <div className="p-3 sm:p-3.5 bg-slate-950/80 border-b border-slate-800/80">

          <div className="flex items-center justify-between gap-1.5 mb-2">

            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">

              <Zap className="w-3 h-3 text-amber-400" />

              <span>
                {t(
                  'suggestedQuestionsTitle',
                  'Suggested Questions'
                )}
              </span>

            </div>


            {isSpeaking && (

              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium animate-pulse">

                <Radio className="w-3 h-3 text-cyan-400 animate-spin" />

                <span>
                  {t(
                    'speakingAiResponse',
                    'Speaking AI response...'
                  )}
                </span>

                <button
                  onClick={stopSpeaking}
                  className="ml-1 underline text-rose-400 hover:text-rose-300"
                >
                  {t(
                    'stopSpeaking',
                    'Stop'
                  )}
                </button>

              </div>

            )}

          </div>


          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">

            {suggestedQuestions.map(
              (q, idx) => (

                <button
                  key={`suggested-q-${idx}`}
                  onClick={() =>
                    handleSend(q)
                  }
                  disabled={isTyping}
                  className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/90 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-400/40 transition-all shrink-0 disabled:opacity-40"
                >
                  {q}
                </button>

              )
            )}

          </div>

        </div>


        {/* =====================
            MESSAGES
        ===================== */}

        <div
          ref={chatContainerRef}
          className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4"
        >

          {messages.map(
            (msg) => {

              const isCurrentlySpeaking =
                isSpeaking &&
                speakingId === msg.id;


              return (

                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.sender === 'user'
                      ? 'flex-row-reverse'
                      : 'flex-row'
                  }`}
                >

                  {/* AVATAR */}

                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      msg.sender === 'user'
                        ? 'bg-blue-600/30 border-blue-400/50 text-blue-300'
                        : isCurrentlySpeaking
                        ? 'bg-cyan-500/30 border-cyan-300 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.6)] animate-pulse'
                        : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                    }`}
                  >

                    {msg.sender === 'user'
                      ? (
                        <User className="w-4 h-4" />
                      )
                      : (
                        <Bot className="w-4 h-4" />
                      )}

                  </div>


                  {/* MESSAGE */}

                  <div
                    className={`relative group max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed border transition-all ${
                      msg.sender === 'user'
                        ? 'bg-blue-600/20 border-blue-500/30 text-slate-100 rounded-tr-none'
                        : isCurrentlySpeaking
                        ? 'bg-slate-900/95 border-cyan-500/50 text-slate-100 rounded-tl-none shadow-[0_0_15px_rgba(56,189,248,0.15)] ring-1 ring-cyan-400/30'
                        : 'bg-slate-900/85 border-slate-800/80 text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >

                    {isCurrentlySpeaking && (

                      <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-cyan-400">

                        <span className="inline-block w-1 h-3 bg-cyan-400 rounded-full animate-bounce" />

                        <span className="inline-block w-1 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.15s]" />

                        <span className="inline-block w-1 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.3s]" />

                        <span className="inline-block w-1 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.45s]" />

                        <span className="text-[10px] uppercase tracking-wider ml-1.5">
                          {t(
                            'speakingAudio',
                            'Speaking audio...'
                          )}
                        </span>

                      </div>

                    )}


                    {/* TEXT */}

                    <div className="whitespace-pre-wrap">

                      {msg.text
                        .split('\n')
                        .map(
                          (
                            paragraph,
                            pIdx
                          ) => {

                            const parts =
                              paragraph.split(
                                /(\*\*.*?\*\*)/g
                              );


                            return (

                              <p
                                key={pIdx}
                                className={
                                  pIdx > 0
                                    ? 'mt-2'
                                    : ''
                                }
                              >

                                {parts.map(
                                  (
                                    part,
                                    partIdx
                                  ) => {

                                    if (
                                      part.startsWith('**') &&
                                      part.endsWith('**')
                                    ) {

                                      return (
                                        <strong
                                          key={partIdx}
                                          className="font-semibold text-cyan-300"
                                        >
                                          {part.slice(
                                            2,
                                            -2
                                          )}
                                        </strong>
                                      );

                                    }

                                    return part;

                                  }
                                )}

                              </p>

                            );

                          }
                        )}

                    </div>


                    {/* TINYFISH LIVE WEB SOURCES */}
                    {msg.sender === 'ai' &&
                      msg.researchUsed &&
                      Array.isArray(msg.sources) &&
                      msg.sources.length > 0 && (
                        <div className="mt-3 border-t border-slate-700/70 pt-3">
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-cyan-300">
                            <span aria-hidden="true">🌐</span>
                            <span>Live Web Sources · TinyFish</span>
                          </div>

                          <div className="space-y-2">
                            {msg.sources.map((source, index) => {
                              let safeUrl = '';

                              try {
                                const parsedUrl = new URL(source.url);
                                if (
                                  parsedUrl.protocol === 'https:' ||
                                  parsedUrl.protocol === 'http:'
                                ) {
                                  safeUrl = parsedUrl.href;
                                }
                              } catch {
                                // Skip invalid source URLs.
                              }

                              if (!safeUrl) return null;

                              return (
                                <a
                                  key={`${safeUrl}-${index}`}
                                  href={safeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block rounded-lg border border-slate-700/70 bg-slate-800/60 p-2 transition-colors hover:border-cyan-400/50"
                                >
                                  <div className="text-xs font-medium text-cyan-200">
                                    {source.title || 'Weather source'}
                                  </div>

                                  {source.snippet && (
                                    <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
                                      {source.snippet}
                                    </p>
                                  )}

                                  <div className="mt-1 text-[10px] text-slate-500">
                                    {source.fetched
                                      ? 'Content retrieved'
                                      : 'Search result'}
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* FOOTER */}

                    <div className="mt-2.5 flex items-center justify-between gap-4 text-[10px] text-slate-400 border-t border-slate-800/50 pt-1.5">

                      <span>
                        {msg.timestamp}
                      </span>


                      <div className="flex items-center gap-2">

                        {msg.sender === 'ai' &&
                          isTtsSupported && (

                            <button
                              onClick={() => {

                                if (
                                  isCurrentlySpeaking
                                ) {

                                  stopSpeaking();

                                } else {

                                  speak(
                                    msg.text,
                                    msg.id
                                  );

                                }

                              }}
                              className={`flex items-center gap-1 transition-all px-1.5 py-0.5 rounded ${
                                isCurrentlySpeaking
                                  ? 'text-cyan-300 bg-cyan-500/20 font-medium'
                                  : 'text-slate-400 hover:text-cyan-300'
                              }`}
                            >

                              {isCurrentlySpeaking
                                ? (
                                  <>
                                    <VolumeX className="w-3 h-3 text-rose-400" />

                                    <span className="text-rose-400 font-medium">
                                      {t(
                                        'stopSpeaking',
                                        'Stop'
                                      )}
                                    </span>
                                  </>
                                )
                                : (
                                  <>
                                    <Volume2 className="w-3 h-3" />

                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      {t(
                                        'speakResponse',
                                        'Listen'
                                      )}
                                    </span>
                                  </>
                                )}

                            </button>

                          )}


                        {msg.sender === 'ai' && (

                          <button
                            onClick={() =>
                              handleCopy(
                                msg.id,
                                msg.text
                              )
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-cyan-300 flex items-center gap-1"
                          >

                            {copiedId === msg.id
                              ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              )
                              : (
                                <Copy className="w-3 h-3" />
                              )}

                            <span>

                              {copiedId === msg.id
                                ? t(
                                    'copied',
                                    'Copied'
                                  )
                                : t(
                                    'copy',
                                    'Copy'
                                  )}

                            </span>

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

              );

            }
          )}


          {/* TYPING */}

          {isTyping && (

            <div className="flex items-center gap-3">

              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center shrink-0 animate-pulse">

                <Bot className="w-4 h-4" />

              </div>


              <div className="px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-cyan-300 flex items-center gap-2 shadow-md">

                <Loader2 className="w-3.5 h-3.5 animate-spin" />

                <span>

                  {t(
                    'aiTyping',
                    'WeatherGPT AI is analyzing meteorological data...'
                  )}

                </span>

              </div>

            </div>

          )}


          {/* VOICE LISTENING */}

          {isListening && (

            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-cyan-500/20 border border-rose-500/40 text-slate-100 flex items-center justify-between gap-3 animate-pulse shadow-lg">

              <div className="flex items-center gap-2.5">

                <div className="relative flex h-3 w-3">

                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />

                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />

                </div>


                <div>

                  <div className="text-xs font-bold text-rose-300 font-['Space_Grotesk']">

                    {t(
                      'voiceListening',
                      'Listening... Speak your weather question now'
                    )}

                  </div>


                  {interimTranscript && (

                    <div className="text-xs text-cyan-200 mt-0.5 italic">

                      "
                      {interimTranscript}
                      "

                    </div>

                  )}

                </div>

              </div>


              <button
                onClick={stopListening}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shrink-0 shadow"
              >

                {t(
                  'stopMic',
                  'Stop Mic'
                )}

              </button>

            </div>

          )}


          <div
            ref={messagesEndRef}
          />

        </div>


        {/* =====================
            INPUT BAR
        ===================== */}

        <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800/80">

          <form
            onSubmit={(e) => {

              e.preventDefault();


              if (isListening) {
                stopListening();
              }


              handleSend();

            }}
            className="relative flex items-center gap-2"
          >


            {/* MIC BUTTON */}

            {isSpeechSupported && (

              <button
                type="button"
                id="ai-voice-mic-btn"
                onClick={handleToggleVoice}
                disabled={isTyping}
                className={`p-3 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                    : 'bg-slate-900/90 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-cyan-200'
                }`}
                title={
                  isListening
                    ? t(
                        'stopSpeaking',
                        'Stop voice input'
                      )
                    : t(
                        'voiceInput',
                        'Voice Input (Click to speak)'
                      )
                }
              >

                {isListening
                  ? (
                    <MicOff className="w-4 h-4 text-white animate-bounce" />
                  )
                  : (
                    <Mic className="w-4 h-4" />
                  )}

              </button>

            )}


            {/* INPUT */}

            <input
              id="ai-chat-input"
              type="text"
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              disabled={isTyping}
              placeholder={
                isListening
                  ? t(
                      'voiceListening',
                      'Listening... Speak now'
                    )
                  : t(
                      'aiPlaceholder',
                      'Ask a question or tap the mic (e.g. Will it rain today?)...'
                    )
              }
              className={`flex-1 pl-4 pr-24 py-3 rounded-xl text-xs sm:text-sm bg-slate-900/90 border text-slate-100 placeholder-slate-400 focus:outline-none transition-all ${
                isListening
                  ? 'border-rose-500/60 ring-2 ring-rose-500/20'
                  : 'border-cyan-500/20 focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400'
              }`}
            />


            {/* SEND */}

            <button
              id="ai-send-btn"
              type="submit"
              disabled={
                !input.trim() ||
                isTyping
              }
              className="absolute right-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >

              <Send className="w-3.5 h-3.5" />

              <span className="hidden sm:inline">

                {t(
                  'aiSend',
                  'Ask AI'
                )}

              </span>

            </button>

          </form>


          {/* DISCLAIMER */}

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">

            <span>

              {t(
                'aiDisclaimer',
                'AI predictions are synthesized using live weather sensor telemetry and Google Gemini.'
              )}

            </span>


            {isSpeechSupported && (

              <span className="hidden sm:inline-flex items-center gap-1 text-cyan-400/80">

                <Mic className="w-3 h-3" />

                {t(
                  'voiceEnabled',
                  'Voice-enabled'
                )}

              </span>

            )}

          </div>

        </div>

      </div>

    </section>

  );

};



