import { Injectable, signal } from '@angular/core';

type SpeechCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

@Injectable({ providedIn: 'root' })
export class SpeechToTextService {
  readonly listening = signal(false);
  readonly supported = hasSpeechRecognition();

  private active: SpeechRecognitionLike | null = null;

  start(onText: (transcript: string, isFinal: boolean) => void, onError?: (message: string) => void): void {
    const Ctor = speechCtor();
    if (!Ctor) {
      onError?.('Voice input is not available in this browser.');
      return;
    }
    this.stop();
    const recognition = new Ctor();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let transcript = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        transcript += result[0].transcript;
        isFinal = result.isFinal;
      }
      onText(transcript.trim(), isFinal);
    };
    recognition.onerror = (event) => {
      this.listening.set(false);
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        onError?.('Could not hear that. Try typing instead.');
      }
    };
    recognition.onend = () => {
      this.listening.set(false);
      this.active = null;
    };
    this.active = recognition;
    this.listening.set(true);
    recognition.start();
  }

  stop(): void {
    this.active?.stop();
    this.active = null;
    this.listening.set(false);
  }
}

function speechCtor(): SpeechCtor | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const holder = window as Window & {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  return holder.SpeechRecognition ?? holder.webkitSpeechRecognition ?? null;
}

function hasSpeechRecognition(): boolean {
  return speechCtor() !== null;
}
