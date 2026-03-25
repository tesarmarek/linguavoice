export interface TranscriptResult {
  text: string;
  language: 'cs' | 'sk';
  confidence: number;
}

export interface ISTTClient {
  transcribe(audioBuffer: Buffer, language: 'cs' | 'sk' | 'auto'): Promise<TranscriptResult>;
  readonly provider: string;
}
