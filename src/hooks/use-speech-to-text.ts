"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
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

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = event.error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        setSpeechError(
          "Microphone permission denied. Allow access to use voice input.",
        );
      } else if (code === "no-speech") {
        /* ignore — user may pause */
      } else if (code !== "aborted") {
        setSpeechError(`Voice input error: ${code}`);
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
