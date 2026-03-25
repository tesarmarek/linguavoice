export interface ITTSClient {
  synthesize(text: string, outputPath: string): Promise<void>;
  /** Quick health check — returns true if the service is reachable and authorized */
  probe(): Promise<boolean>;
}
