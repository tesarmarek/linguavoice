export interface ImageModelOption {
  id: string;
  label: string;
  provider: string;
  price: string;
}

export const IMAGE_MODELS: ImageModelOption[] = [
  // FLUX family
  { id: 'black-forest-labs/FLUX.2-pro', label: 'FLUX.2 Pro', provider: 'Black Forest Labs', price: '~$0.03' },
  { id: 'black-forest-labs/FLUX.2-dev', label: 'FLUX.2 Dev', provider: 'Black Forest Labs', price: '~$0.015' },
  { id: 'black-forest-labs/FLUX.2-flex', label: 'FLUX.2 Flex', provider: 'Black Forest Labs', price: '~$0.03' },
  { id: 'black-forest-labs/FLUX.1-schnell', label: 'FLUX.1 Schnell', provider: 'Black Forest Labs', price: 'Free' },
  { id: 'black-forest-labs/FLUX.1.1-pro', label: 'FLUX 1.1 Pro', provider: 'Black Forest Labs', price: '~$0.04' },
  { id: 'black-forest-labs/FLUX.1-kontext-pro', label: 'FLUX.1 Kontext Pro', provider: 'Black Forest Labs', price: 'See pricing' },
  { id: 'black-forest-labs/FLUX.1-kontext-max', label: 'FLUX.1 Kontext Max', provider: 'Black Forest Labs', price: 'See pricing' },
  // Google
  { id: 'google/gemini-3-pro-image', label: 'Gemini 3 Pro Image', provider: 'Google', price: '~$0.13' },
  { id: 'google/flash-image-3.1', label: 'Flash Image 3.1', provider: 'Google', price: '~$0.047' },
  { id: 'google/flash-image-2.5', label: 'Flash Image 2.5', provider: 'Google', price: '~$0.039' },
  { id: 'google/imagen-4.0-fast', label: 'Imagen 4.0 Fast', provider: 'Google', price: 'See pricing' },
  { id: 'google/imagen-4.0-preview', label: 'Imagen 4.0 Preview', provider: 'Google', price: 'See pricing' },
  // Qwen
  { id: 'Qwen/Qwen-Image-2.0-Pro', label: 'Qwen Image 2.0 Pro', provider: 'Qwen', price: '~$0.075' },
  { id: 'Qwen/Qwen-Image-2.0', label: 'Qwen Image 2.0', provider: 'Qwen', price: '~$0.035' },
  // Other
  { id: 'Wan-AI/Wan2.6-image', label: 'Wan 2.6 Image', provider: 'Wan-AI', price: '~$0.03' },
];

export const DEFAULT_IMAGE_MODEL = 'black-forest-labs/FLUX.2-pro';
