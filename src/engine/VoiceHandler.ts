import { VOICE_COMMANDS } from '../data/catalanAudioCatalog';

export type SpeechCommand = 'whistle' | 'forward' | 'stop' | 'reverse' | 'color_groc' | 'color_vermell' | 'color_blau' | 'color_verd' | 'color_blanc' | 'color_negre';

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      length: number;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export class VoiceHandler {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private catalanVoice: SpeechSynthesisVoice | null = null;
  private onCommandCallbacks: ((command: SpeechCommand, rawText: string) => void)[] = [];
  private onSpeakStateCallbacks: ((isSpeaking: boolean, text: string) => void)[] = [];
  private onListenStateCallbacks: ((isListening: boolean, lastHeard: string) => void)[] = [];
  private speechQueue: string[] = [];
  private isProcessingQueue: boolean = false;

  constructor() {
    this.initTTS();
    this.initSTT();
  }

  private initTTS(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported on this browser.');
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Look for Catalan voice: ca-ES or starts with ca
      const caVoice = voices.find(v => v.lang.toLowerCase().startsWith('ca') || v.name.toLowerCase().includes('catalan'));
      if (caVoice) {
        this.catalanVoice = caVoice;
      } else {
        // Fallback to Spanish or default
        const esVoice = voices.find(v => v.lang.toLowerCase().startsWith('es'));
        this.catalanVoice = esVoice || voices[0] || null;
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  private initSTT(): void {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionAPI = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
                                (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.info('SpeechRecognition not supported in this browser. Touch controls are fully active.');
      return;
    }

    try {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'ca-ES';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notifyListenState(true, 'Escoltant ordres en català...');
      };

      this.recognition.onend = () => {
        // Auto-restart if user still wants listening
        if (this.isListening) {
          try {
            this.recognition?.start();
          } catch {
            this.isListening = false;
            this.notifyListenState(false, '');
          }
        } else {
          this.notifyListenState(false, '');
        }
      };

      this.recognition.onerror = (e) => {
        console.warn('SpeechRecognition error:', e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          this.isListening = false;
          this.notifyListenState(false, 'Micròfon no disponible');
        }
      };

      this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && lastResult[0]) {
          const rawText = lastResult[0].transcript.trim().toLowerCase();
          this.notifyListenState(true, `He sentit: "${rawText}"`);
          this.matchAndDispatchCommand(rawText);
        }
      };
    } catch (err) {
      console.warn('Could not initialize SpeechRecognition:', err);
    }
  }

  private matchAndDispatchCommand(text: string): void {
    const t = text.toLowerCase();

    // Whistle
    if (VOICE_COMMANDS.whistle.some(w => t.includes(w))) {
      this.dispatchCommand('whistle', text);
      return;
    }
    // Forward / drive
    if (VOICE_COMMANDS.forward.some(w => t.includes(w))) {
      this.dispatchCommand('forward', text);
      return;
    }
    // Stop
    if (VOICE_COMMANDS.stop.some(w => t.includes(w))) {
      this.dispatchCommand('stop', text);
      return;
    }
    // Reverse
    if (VOICE_COMMANDS.reverse.some(w => t.includes(w))) {
      this.dispatchCommand('reverse', text);
      return;
    }
    // Colors
    for (const [colorKey, keywords] of Object.entries(VOICE_COMMANDS.colors)) {
      if (keywords.some(k => t.includes(k))) {
        this.dispatchCommand(`color_${colorKey}` as SpeechCommand, text);
        return;
      }
    }
  }

  private dispatchCommand(command: SpeechCommand, rawText: string): void {
    this.onCommandCallbacks.forEach(cb => cb(command, rawText));
  }

  public onCommand(callback: (command: SpeechCommand, rawText: string) => void): () => void {
    this.onCommandCallbacks.push(callback);
    return () => {
      this.onCommandCallbacks = this.onCommandCallbacks.filter(c => c !== callback);
    };
  }

  public onSpeakState(callback: (isSpeaking: boolean, text: string) => void): () => void {
    this.onSpeakStateCallbacks.push(callback);
    return () => {
      this.onSpeakStateCallbacks = this.onSpeakStateCallbacks.filter(c => c !== callback);
    };
  }

  public onListenState(callback: (isListening: boolean, lastHeard: string) => void): () => void {
    this.onListenStateCallbacks.push(callback);
    return () => {
      this.onListenStateCallbacks = this.onListenStateCallbacks.filter(c => c !== callback);
    };
  }

  private notifySpeakState(isSpeaking: boolean, text: string): void {
    this.isSpeaking = isSpeaking;
    this.onSpeakStateCallbacks.forEach(cb => cb(isSpeaking, text));
  }

  private notifyListenState(isListening: boolean, lastHeard: string): void {
    this.isListening = isListening;
    this.onListenStateCallbacks.forEach(cb => cb(isListening, lastHeard));
  }

  /**
   * Speak Catalan text to the child with friendly pitch and cadence.
   * Also guarantees on-screen subtitles even if offline / speech synthesis fails.
   */
  public speak(text: string, priority: boolean = false): void {
    if (priority) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.speechQueue = [text];
    } else {
      this.speechQueue.push(text);
    }

    if (!this.isProcessingQueue) {
      this.processNextSpeech();
    }
  }

  private processNextSpeech(): void {
    if (this.speechQueue.length === 0) {
      this.isProcessingQueue = false;
      this.notifySpeakState(false, '');
      return;
    }

    this.isProcessingQueue = true;
    const text = this.speechQueue.shift()!;
    this.notifySpeakState(true, text);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Offline fallback: display text for 3 seconds then continue
      setTimeout(() => {
        this.processNextSpeech();
      }, Math.max(2000, text.length * 60));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.catalanVoice) {
      utterance.voice = this.catalanVoice;
      utterance.lang = this.catalanVoice.lang;
    } else {
      utterance.lang = 'ca-ES';
    }

    utterance.pitch = 1.15; // Friendly, energetic tone for kids
    utterance.rate = 0.95;  // Clear, easy to follow

    utterance.onend = () => {
      setTimeout(() => {
        this.processNextSpeech();
      }, 350);
    };

    utterance.onerror = () => {
      setTimeout(() => {
        this.processNextSpeech();
      }, 500);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      setTimeout(() => {
        this.processNextSpeech();
      }, 2000);
    }
  }

  public toggleListening(): boolean {
    if (!this.recognition) {
      return false;
    }

    if (this.isListening) {
      this.isListening = false;
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
      this.notifyListenState(false, '');
      return false;
    } else {
      try {
        this.isListening = true;
        this.recognition.start();
        return true;
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
        this.isListening = false;
        this.notifyListenState(false, 'Error en activar el micròfon');
        return false;
      }
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public isSTTSupported(): boolean {
    return this.recognition !== null;
  }
}

export const voiceHandler = new VoiceHandler();
