import { ISTTClient, TranscriptResult } from './stt.interface';
import { getEnvConfig } from '../config/env';

export class TogetherSTTClient implements ISTTClient {
  readonly provider = 'Together.ai Whisper';
  private apiKey: string;
  private model: string;

  constructor() {
    const env = getEnvConfig();
    this.apiKey = env.TOGETHER_API_KEY;
    this.model = env.TOGETHER_STT_MODEL;
  }

  async transcribe(audioBuffer: Buffer, language: 'cs' | 'sk' | 'auto'): Promise<TranscriptResult> {
    const debug = getEnvConfig().DEBUG;

    if (debug) console.log(`[Together STT] Transcribing ${audioBuffer.length} bytes with ${this.model}, lang: ${language}...`);

    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', this.model);
    formData.append('response_format', 'json');
    if (language !== 'auto') {
      formData.append('language', language);
    }

    const response = await fetch('https://api.together.xyz/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Together STT error ${response.status}: ${errorBody.slice(0, 200)}`);
    }

    const data = await response.json();

    if (debug) console.log(`[Together STT] Result: "${data.text?.slice(0, 100)}"${data.text?.length > 100 ? '...' : ''}`);

    const detectedLang = (data.language === 'sk' || data.language === 'cs')
      ? data.language
      : (language !== 'auto' ? language : 'cs');

    return {
      text: data.text || '',
      language: detectedLang as 'cs' | 'sk',
      confidence: 0.9,
    };
  }
}
