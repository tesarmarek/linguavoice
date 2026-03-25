export interface IImageClient {
  /** Generate image from prompt, save to outputPath, return path */
  generate(prompt: string, outputPath: string): Promise<string>;
  /** Probe if the service is available — returns true if working */
  probe(): Promise<boolean>;
  /** Provider name for logging */
  readonly provider: string;
}
