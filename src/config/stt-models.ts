export interface STTModelOption {
  id: string;
  label: string;
  price: string;
}

export const STT_MODELS: STTModelOption[] = [
  { id: 'browser', label: 'Browser (Web Speech API)', price: 'Free' },
  { id: 'openai/whisper-large-v3', label: 'Whisper Large v3', price: '$0.0015/min' },
];

export const DEFAULT_STT_MODEL = 'browser';
