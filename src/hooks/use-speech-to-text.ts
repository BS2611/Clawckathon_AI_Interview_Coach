"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike> & { length: number };
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Maps SpeechRecognitionError codes to helpful copy (browser emits short codes like "network"). */
function messageForSpeechError(code: string): string | null {
  switch (code) {
    case "aborted":
      return null;
    case "no-speech":
      return null;
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission denied. Allow access to use voice input.";
    case "network":
      return "Voice recognition couldn’t reach the speech service. In Chrome and Edge, speech is processed online—check your internet connection, VPN, or firewall, then try again.";
    case "audio-capture":
      return "No microphone was found or it’s in use by another app.";
    case "language-not-supported":
      return "This language isn’t supported for voice input. Try switching your browser language.";
    default:
      return `Voice input error: ${code}`;
  }
}

export interface UseSpeechToTextOptions {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

export interface UseSpeechToTextResult {
  isRecording: boolean;
  transcript: string;
  browserSupported: boolean;
  speechError: string | null;
  toggleRecording: () => void;
}

export function useSpeechToText({
  value,
  onChange,
  disabled = false,
}: UseSpeechToTextOptions): UseSpeechToTextResult {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const prefixRef = useRef("");
  const finalBufferRef = useRef("");
  const valueRef = useRef(value);
  valueRef.current = value;

  const browserSupported =
    typeof window !== "undefined" && getRecognitionCtor() !== null;

  const stopRecognition = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) {
      setIsRecording(false);
      return;
    }
    try {
      r.stop();
    } catch {
      try {
        r.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      setIsRecording(false);
    }
  }, []);

  const startRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSpeechError("Voice input not supported in this browser");
      return;
    }
    setSpeechError(null);
    prefixRef.current = valueRef.current;
    finalBufferRef.current = "";
    setTranscript("");

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang =
      typeof navigator !== "undefined" ? navigator.language : "en-US";

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result?.[0]) continue;
        const piece = result[0].transcript;
        if (result.isFinal) {
          finalBufferRef.current += piece;
        } else {
          interim += piece;
        }
      }
      const speechPart = finalBufferRef.current + interim;
      setTranscript(speechPart);
      onChange(prefixRef.current + speechPart);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      const code = event.error;
      const msg = messageForSpeechError(code);
      if (msg) {
        setSpeechError(msg);
      }
      recognitionRef.current = null;
      setIsRecording(false);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsRecording(true);
    } catch {
      setSpeechError("Could not start voice input. Try again.");
      recognitionRef.current = null;
      setIsRecording(false);
    }
  }, [onChange]);

  const toggleRecording = useCallback(() => {
    if (disabled) return;
    if (!browserSupported) {
      setSpeechError("Voice input not supported in this browser");
      return;
    }
    if (isRecording) {
      stopRecognition();
    } else {
      startRecognition();
    }
  }, [browserSupported, disabled, isRecording, startRecognition, stopRecognition]);

  useEffect(() => {
    if (disabled && recognitionRef.current) {
      stopRecognition();
    }
  }, [disabled, stopRecognition]);

  useEffect(() => {
    return () => {
      const r = recognitionRef.current;
      if (r) {
        try {
          r.abort();
        } catch {
          /* ignore */
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isRecording,
    transcript,
    browserSupported,
    speechError,
    toggleRecording,
  };
}
