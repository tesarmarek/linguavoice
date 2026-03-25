export interface ILLMClient {
  complete(prompt: string, systemPrompt: string): Promise<string>;
}
