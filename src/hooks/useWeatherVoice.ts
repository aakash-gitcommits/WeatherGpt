import { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageCode } from '../types/weather';

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;

  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

const LANGUAGE_LOCALE_MAP: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  hinglish: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  ur: 'ur-IN',
  kn: 'kn-IN',
  or: 'or-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  as: 'as-IN',
  sa: 'sa-IN',
  kok: 'kok-IN',
  sd: 'sd-IN',
  ne: 'ne-NP',
  doi: 'doi-IN',
  ks: 'ks-IN',
  sat: 'sat-IN',
  mni: 'mni-IN',
  brx: 'brx-IN',
  bho: 'bho-IN',
  mai: 'mai-IN',
  har: 'hi-IN',
  raj: 'hi-IN',
  awa: 'hi-IN',
  hne: 'hi-IN',
  mag: 'hi-IN',
  bra: 'hi-IN',
  bns: 'hi-IN',
  gbm: 'hi-IN',
};

export function useWeatherVoice(language: LanguageCode = 'en') {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    try {
      return localStorage.getItem('weathergpt_auto_speak') === 'true';
    } catch {
      return false;
    }
  });

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const onResultCallbackRef = useRef<
    ((text: string) => void) | null
  >(null);

  const finalTranscriptRef = useRef('');

  const isSpeechSupported =
    typeof window !== 'undefined' &&
    !!(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition
    );

  const isTtsSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window;

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak((prev) => {
      const nextValue = !prev;

      try {
        localStorage.setItem(
          'weathergpt_auto_speak',
          String(nextValue)
        );
      } catch {
        // Ignore storage errors
      }

      return nextValue;
    });
  }, []);

  /*
   * INITIALIZE SPEECH RECOGNITION
   */
  useEffect(() => {
    if (!isSpeechSupported) return;

    const SpeechRecognitionClass =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang =
      LANGUAGE_LOCALE_MAP[language] || 'en-IN';

    recognition.onstart = () => {
      console.log('Speech recognition started');

      finalTranscriptRef.current = '';
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (
      event: SpeechRecognitionEvent
    ) => {
      let finalText = '';
      let interimText = '';

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const result = event.results[i];

        if (!result || !result[0]) continue;

        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalText += transcript + ' ';
        } else {
          interimText += transcript;
        }
      }

      // Show live speech in input
      if (interimText.trim()) {
        setInterimTranscript(interimText.trim());
      }

      // Handle final recognized speech
      if (finalText.trim()) {
        const recognizedText = finalText.trim();

        console.log(
          'Final voice recognized:',
          recognizedText
        );

        finalTranscriptRef.current = recognizedText;

        setInterimTranscript('');

        if (onResultCallbackRef.current) {
          onResultCallbackRef.current(
            recognizedText
          );
        }
      }
    };

    recognition.onerror = (
      event: SpeechRecognitionErrorEvent
    ) => {
      console.warn(
        'Speech recognition error:',
        event.error
      );

      // Do not crash on normal "no-speech" events
      if (event.error === 'no-speech') {
        console.log('No speech detected');
      }

      if (event.error === 'not-allowed') {
        console.error(
          'Microphone permission was denied'
        );
      }

      if (event.error === 'service-not-allowed') {
        console.error(
          'Speech recognition service is not allowed'
        );
      }

      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');

      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // Ignore cleanup errors
      }

      recognitionRef.current = null;
    };
  }, [isSpeechSupported, language]);

  /*
   * START LISTENING
   */
  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (!recognitionRef.current) {
        console.error(
          'Speech recognition is not available.'
        );
        return;
      }

      // Save callback BEFORE starting recognition
      onResultCallbackRef.current = onResult;

      finalTranscriptRef.current = '';

      try {
        recognitionRef.current.lang =
          LANGUAGE_LOCALE_MAP[language] || 'en-IN';

        recognitionRef.current.start();
      } catch (error) {
        console.warn(
          'Recognition start error:',
          error
        );

        // Recognition may already be running
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }

        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (retryError) {
            console.error(
              'Could not restart microphone:',
              retryError
            );
          }
        }, 300);
      }
    },
    [language]
  );

  /*
   * STOP LISTENING
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }

    setIsListening(false);
    setInterimTranscript('');
  }, []);

  /*
   * TEXT TO SPEECH
   */
  const speakText = useCallback(
    (
      text: string,
      utteranceId?: string
    ) => {
      if (!isTtsSupported) return;

      try {
        window.speechSynthesis.cancel();

        if (!text || !text.trim()) {
          setSpeakingId(null);
          setIsSpeaking(false);
          return;
        }

        const cleanText = text
          .replace(/[*_#`~\[\]\(\)]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        const utterance =
          new SpeechSynthesisUtterance(
            cleanText
          );

        utterance.lang =
          LANGUAGE_LOCALE_MAP[language] ||
          'en-IN';

        utterance.rate = 1;
        utterance.pitch = 1;

        const targetId =
          utteranceId || String(Date.now());

        setSpeakingId(targetId);
        setIsSpeaking(true);

        utterance.onend = () => {
          setSpeakingId(null);
          setIsSpeaking(false);
        };

        utterance.onerror = () => {
          setSpeakingId(null);
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn(
          'TTS playback error:',
          error
        );

        setSpeakingId(null);
        setIsSpeaking(false);
      }
    },
    [isTtsSupported, language]
  );

  /*
   * STOP SPEAKING
   */
  const stopSpeaking = useCallback(() => {
    if (!isTtsSupported) return;

    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }

    setSpeakingId(null);
    setIsSpeaking(false);
  }, [isTtsSupported]);

  return {
    isListening,
    interimTranscript,

    startListening,
    stopListening,

    isSpeechSupported,

    speak: speakText,
    speakText,

    stopSpeaking,

    speakingId,
    isSpeaking,

    isTtsSupported,

    autoSpeak,
    toggleAutoSpeak,
  };
}
