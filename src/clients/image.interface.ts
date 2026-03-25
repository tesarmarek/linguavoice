export interface IImageClient {
  /** Generate image from prompt, save to outputPath. Optional model override. */
  generate(prompt: string, outputPath: string, modelOverride?: string): Promise<string>;
  /** Probe if the service is available */
  probe(): Promise<boolean>;
  /** Provider name for logging */
  readonly provider: string;
}
