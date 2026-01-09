export type LLMModel = {
  id: string;
  name: string;
};

export type LLMProvider = {
  name: string;
  models: LLMModel[];
};

export const sttProviders = [
  { label: "deepgram", value: "deepgram" },
  { label: "openai", value: "openai" },
  { label: "cartesia", value: "cartesia" },
  { label: "elevenlabs", value: "elevenlabs" },
  { label: "whisper", value: "groq" },
  { label: "google", value: "google" },
  { label: "sarvam", value: "sarvam" },
];

export const ttsProviders = [
  { label: "cartesia", value: "cartesia" },
  { label: "openai", value: "openai" },
  { label: "orpheus", value: "groq" },
  { label: "google", value: "google" },
  { label: "elevenlabs", value: "elevenlabs" },
  { label: "sarvam", value: "sarvam" },
];

export const llmProviders: LLMProvider[] = [
  {
    name: "OpenAI",
    models: [
      { id: "openai/gpt-5.2-chat", name: "GPT-5.2 Chat" },
      { id: "openai/gpt-5.2-pro", name: "GPT-5.2 Pro" },
      { id: "openai/gpt-5.2", name: "GPT-5.2" },
      { id: "openai/gpt-5.1-codex-max", name: "GPT-5.1-Codex-Max" },
      { id: "openai/gpt-5.1", name: "GPT-5.1" },
      { id: "openai/gpt-5.1-chat", name: "GPT-5.1 Chat" },
      { id: "openai/gpt-5.1-codex", name: "GPT-5.1-Codex" },
      { id: "openai/gpt-5.1-codex-mini", name: "GPT-5.1-Codex-Mini" },
      { id: "openai/gpt-oss-safeguard-20b", name: "gpt-oss-safeguard-20b" },
      { id: "openai/gpt-5-image-mini", name: "GPT-5 Image Mini" },
      { id: "openai/gpt-5-image", name: "GPT-5 Image" },
      { id: "openai/o3-deep-research", name: "o3 Deep Research" },
      { id: "openai/o4-mini-deep-research", name: "o4 Mini Deep Research" },
      { id: "openai/gpt-5-pro", name: "GPT-5 Pro" },
      { id: "openai/gpt-5-codex", name: "GPT-5 Codex" },
      { id: "openai/gpt-4o-audio-preview", name: "GPT-4o Audio" },
      { id: "openai/gpt-5-chat", name: "GPT-5 Chat" },
      { id: "openai/gpt-5", name: "GPT-5" },
      { id: "openai/gpt-5-mini", name: "GPT-5 Mini" },
      { id: "openai/gpt-5-nano", name: "GPT-5 Nano" },
      { id: "openai/gpt-oss-120b:free", name: "gpt-oss-120b (free)" },
      { id: "openai/gpt-oss-120b", name: "gpt-oss-120b" },
      { id: "openai/gpt-oss-120b:exacto", name: "gpt-oss-120b (exacto)" },
      { id: "openai/gpt-oss-20b:free", name: "gpt-oss-20b (free)" },
      { id: "openai/gpt-oss-20b", name: "gpt-oss-20b" },
      { id: "openai/o3-pro", name: "o3 Pro" },
      { id: "openai/codex-mini", name: "Codex Mini" },
      { id: "openai/o4-mini-high", name: "o4 Mini High" },
      { id: "openai/o3", name: "o3" },
      { id: "openai/o4-mini", name: "o4 Mini" },
      { id: "openai/gpt-4.1", name: "GPT-4.1" },
      { id: "openai/gpt-4.1-mini", name: "GPT-4.1 Mini" },
      { id: "openai/gpt-4.1-nano", name: "GPT-4.1 Nano" },
      { id: "openai/o1-pro", name: "o1-pro" },
      {
        id: "openai/gpt-4o-mini-search-preview",
        name: "GPT-4o-mini Search Preview",
      },
      { id: "openai/gpt-4o-search-preview", name: "GPT-4o Search Preview" },
      { id: "openai/o3-mini-high", name: "o3 Mini High" },
      { id: "openai/o3-mini", name: "o3 Mini" },
      { id: "openai/o1", name: "o1" },
      { id: "openai/gpt-4o-2024-11-20", name: "GPT-4o (2024-11-20)" },
      { id: "openai/chatgpt-4o-latest", name: "ChatGPT-4o" },
      { id: "openai/gpt-4o-2024-08-06", name: "GPT-4o (2024-08-06)" },
      { id: "openai/gpt-4o-mini-2024-07-18", name: "GPT-4o-mini (2024-07-18)" },
      { id: "openai/gpt-4o-mini", name: "GPT-4o-mini" },
      { id: "openai/gpt-4o-2024-05-13", name: "GPT-4o (2024-05-13)" },
      { id: "openai/gpt-4o", name: "GPT-4o" },
      { id: "openai/gpt-4o:extended", name: "GPT-4o (extended)" },
      { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo" },
      { id: "openai/gpt-3.5-turbo-0613", name: "GPT-3.5 Turbo (older v0613)" },
      { id: "openai/gpt-4-turbo-preview", name: "GPT-4 Turbo Preview" },
      { id: "openai/gpt-4-1106-preview", name: "GPT-4 Turbo (older v1106)" },
      { id: "openai/gpt-3.5-turbo-instruct", name: "GPT-3.5 Turbo Instruct" },
      { id: "openai/gpt-3.5-turbo-16k", name: "GPT-3.5 Turbo 16k" },
      { id: "openai/gpt-4-0314", name: "GPT-4 (older v0314)" },
      { id: "openai/gpt-4", name: "GPT-4" },
      { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    ],
  },
  {
    name: "Google",
    models: [
      { id: "google/gemini-3-flash-preview", name: "Gemini 3 Flash Preview" },
      {
        id: "google/gemini-3-pro-image-preview",
        name: "Nano Banana Pro (Gemini 3 Pro Image Preview)",
      },
      { id: "google/gemini-3-pro-preview", name: "Gemini 3 Pro Preview" },
      {
        id: "google/gemini-2.5-flash-image",
        name: "Gemini 2.5 Flash Image (Nano Banana)",
      },
      {
        id: "google/gemini-2.5-flash-preview-09-2025",
        name: "Gemini 2.5 Flash Preview 09-2025",
      },
      {
        id: "google/gemini-2.5-flash-lite-preview-09-2025",
        name: "Gemini 2.5 Flash Lite Preview 09-2025",
      },
      {
        id: "google/gemini-2.5-flash-image-preview",
        name: "Gemini 2.5 Flash Image Preview (Nano Banana)",
      },
      { id: "google/gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite" },
      { id: "google/gemma-3n-e2b-it:free", name: "Gemma 3n 2B (free)" },
      { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash" },
      { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
      {
        id: "google/gemini-2.5-pro-preview",
        name: "Gemini 2.5 Pro Preview 06-05",
      },
      { id: "google/gemma-3n-e4b-it:free", name: "Gemma 3n 4B (free)" },
      { id: "google/gemma-3n-e4b-it", name: "Gemma 3n 4B" },
      {
        id: "google/gemini-2.5-pro-preview-05-06",
        name: "Gemini 2.5 Pro Preview 05-06",
      },
      { id: "google/gemma-3-4b-it:free", name: "Gemma 3 4B (free)" },
      { id: "google/gemma-3-4b-it", name: "Gemma 3 4B" },
      { id: "google/gemma-3-12b-it:free", name: "Gemma 3 12B (free)" },
      { id: "google/gemma-3-12b-it", name: "Gemma 3 12B" },
      { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B (free)" },
      { id: "google/gemma-3-27b-it", name: "Gemma 3 27B" },
      { id: "google/gemini-2.0-flash-lite-001", name: "Gemini 2.0 Flash Lite" },
      { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
      {
        id: "google/gemini-2.0-flash-exp:free",
        name: "Gemini 2.0 Flash Experimental (free)",
      },
      { id: "google/gemma-2-27b-it", name: "Gemma 2 27B" },
      { id: "google/gemma-2-9b-it", name: "Gemma 2 9B" },
    ],
  },
  {
    name: "Anthropic",
    models: [
      { id: "anthropic/claude-opus-4.5", name: "Claude Opus 4.5" },
      { id: "anthropic/claude-haiku-4.5", name: "Claude Haiku 4.5" },
      { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5" },
      { id: "anthropic/claude-opus-4.1", name: "Claude Opus 4.1" },
      { id: "anthropic/claude-opus-4", name: "Claude Opus 4" },
      { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4" },
      {
        id: "anthropic/claude-3.7-sonnet:thinking",
        name: "Claude 3.7 Sonnet (thinking)",
      },
      { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet" },
      {
        id: "anthropic/claude-3.5-haiku-20241022",
        name: "Claude 3.5 Haiku (2024-10-22)",
      },
      { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
      { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" },
    ],
  },
  {
    name: "DeepSeek",
    models: [
      { id: "deepseek/deepseek-v3.2-speciale", name: "DeepSeek V3.2 Speciale" },
      { id: "deepseek/deepseek-v3.2", name: "DeepSeek V3.2" },
      { id: "deepseek/deepseek-v3.2-exp", name: "DeepSeek V3.2 Exp" },
      {
        id: "deepseek/deepseek-v3.1-terminus:exacto",
        name: "DeepSeek V3.1 Terminus (exacto)",
      },
      { id: "deepseek/deepseek-v3.1-terminus", name: "DeepSeek V3.1 Terminus" },
      { id: "deepseek/deepseek-chat-v3.1", name: "DeepSeek V3.1" },
      {
        id: "deepseek/deepseek-r1-0528-qwen3-8b",
        name: "DeepSeek R1 0528 Qwen3 8B",
      },
      { id: "deepseek/deepseek-r1-0528:free", name: "R1 0528 (free)" },
      { id: "deepseek/deepseek-r1-0528", name: "R1 0528" },
      { id: "deepseek/deepseek-prover-v2", name: "DeepSeek Prover V2" },
      { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3 0324" },
      {
        id: "deepseek/deepseek-r1-distill-qwen-32b",
        name: "R1 Distill Qwen 32B",
      },
      {
        id: "deepseek/deepseek-r1-distill-qwen-14b",
        name: "R1 Distill Qwen 14B",
      },
      {
        id: "deepseek/deepseek-r1-distill-llama-70b",
        name: "R1 Distill Llama 70B",
      },
      { id: "deepseek/deepseek-r1", name: "R1" },
      { id: "deepseek/deepseek-chat", name: "DeepSeek V3" },
    ],
  },
  {
    name: "Meta",
    models: [
      { id: "meta-llama/llama-guard-4-12b", name: "Llama Guard 4 12B" },
      { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick" },
      { id: "meta-llama/llama-4-scout", name: "Llama 4 Scout" },
      {
        id: "meta-llama/llama-3.3-70b-instruct:free",
        name: "Llama 3.3 70B Instruct (free)",
      },
      {
        id: "meta-llama/llama-3.3-70b-instruct",
        name: "Llama 3.3 70B Instruct",
      },
      {
        id: "meta-llama/llama-3.2-3b-instruct:free",
        name: "Llama 3.2 3B Instruct (free)",
      },
      { id: "meta-llama/llama-3.2-3b-instruct", name: "Llama 3.2 3B Instruct" },
      { id: "meta-llama/llama-3.2-1b-instruct", name: "Llama 3.2 1B Instruct" },
      {
        id: "meta-llama/llama-3.2-90b-vision-instruct",
        name: "Llama 3.2 90B Vision Instruct",
      },
      {
        id: "meta-llama/llama-3.2-11b-vision-instruct",
        name: "Llama 3.2 11B Vision Instruct",
      },
      { id: "meta-llama/llama-3.1-405b", name: "Llama 3.1 405B (base)" },
      { id: "meta-llama/llama-3.1-8b-instruct", name: "Llama 3.1 8B Instruct" },
      {
        id: "meta-llama/llama-3.1-405b-instruct:free",
        name: "Llama 3.1 405B Instruct (free)",
      },
      {
        id: "meta-llama/llama-3.1-405b-instruct",
        name: "Llama 3.1 405B Instruct",
      },
      {
        id: "meta-llama/llama-3.1-70b-instruct",
        name: "Llama 3.1 70B Instruct",
      },
      { id: "meta-llama/llama-guard-2-8b", name: "LlamaGuard 2 8B" },
      { id: "meta-llama/llama-3-70b-instruct", name: "Llama 3 70B Instruct" },
      { id: "meta-llama/llama-3-8b-instruct", name: "Llama 3 8B Instruct" },
    ],
  },
  {
    name: "Mistral",
    models: [
      {
        id: "mistralai/mistral-small-creative",
        name: "Mistral Small Creative",
      },
      { id: "mistralai/devstral-2512:free", name: "Devstral 2 2512 (free)" },
      { id: "mistralai/devstral-2512", name: "Devstral 2 2512" },
      { id: "mistralai/ministral-14b-2512", name: "Ministral 3 14B 2512" },
      { id: "mistralai/ministral-8b-2512", name: "Ministral 3 8B 2512" },
      { id: "mistralai/ministral-3b-2512", name: "Ministral 3 3B 2512" },
      { id: "mistralai/mistral-large-2512", name: "Mistral Large 3 2512" },
      {
        id: "mistralai/voxtral-small-24b-2507",
        name: "Voxtral Small 24B 2507",
      },
      { id: "mistralai/mistral-medium-3.1", name: "Mistral Medium 3.1" },
      { id: "mistralai/codestral-2508", name: "Codestral 2508" },
      { id: "mistralai/devstral-medium", name: "Devstral Medium" },
      { id: "mistralai/devstral-small", name: "Devstral Small 1.1" },
      {
        id: "mistralai/mistral-small-3.2-24b-instruct",
        name: "Mistral Small 3.2 24B",
      },
      { id: "mistralai/devstral-small-2505", name: "Devstral Small 2505" },
      { id: "mistralai/mistral-medium-3", name: "Mistral Medium 3" },
      {
        id: "mistralai/mistral-small-3.1-24b-instruct:free",
        name: "Mistral Small 3.1 24B (free)",
      },
      {
        id: "mistralai/mistral-small-3.1-24b-instruct",
        name: "Mistral Small 3.1 24B",
      },
      { id: "mistralai/mistral-saba", name: "Saba" },
      {
        id: "mistralai/mistral-small-24b-instruct-2501",
        name: "Mistral Small 3",
      },
      { id: "mistralai/pixtral-large-2411", name: "Pixtral Large 2411" },
      { id: "mistralai/ministral-8b", name: "Ministral 8B" },
      { id: "mistralai/ministral-3b", name: "Ministral 3B" },
      { id: "mistralai/pixtral-12b", name: "Pixtral 12B" },
      { id: "mistralai/mistral-nemo", name: "Mistral Nemo" },
      {
        id: "mistralai/mistral-7b-instruct:free",
        name: "Mistral 7B Instruct (free)",
      },
      { id: "mistralai/mistral-7b-instruct", name: "Mistral 7B Instruct" },
      {
        id: "mistralai/mistral-7b-instruct-v0.3",
        name: "Mistral 7B Instruct v0.3",
      },
      {
        id: "mistralai/mixtral-8x22b-instruct",
        name: "Mixtral 8x22B Instruct",
      },
      {
        id: "mistralai/mistral-7b-instruct-v0.2",
        name: "Mistral 7B Instruct v0.2",
      },
      { id: "mistralai/mixtral-8x7b-instruct", name: "Mixtral 8x7B Instruct" },
      {
        id: "mistralai/mistral-7b-instruct-v0.1",
        name: "Mistral 7B Instruct v0.1",
      },
    ],
  },
  {
    name: "Qwen",
    models: [
      { id: "qwen/qwen3-vl-32b-instruct", name: "Qwen3 VL 32B Instruct" },
      { id: "qwen/qwen3-vl-8b-thinking", name: "Qwen3 VL 8B Thinking" },
      { id: "qwen/qwen3-vl-8b-instruct", name: "Qwen3 VL 8B Instruct" },
      {
        id: "qwen/qwen3-vl-30b-a3b-thinking",
        name: "Qwen3 VL 30B A3B Thinking",
      },
      {
        id: "qwen/qwen3-vl-30b-a3b-instruct",
        name: "Qwen3 VL 30B A3B Instruct",
      },
      {
        id: "qwen/qwen3-vl-235b-a22b-thinking",
        name: "Qwen3 VL 235B A22B Thinking",
      },
      {
        id: "qwen/qwen3-vl-235b-a22b-instruct",
        name: "Qwen3 VL 235B A22B Instruct",
      },
      { id: "qwen/qwen3-max", name: "Qwen3 Max" },
      { id: "qwen/qwen3-coder-plus", name: "Qwen3 Coder Plus" },
      { id: "qwen/qwen3-coder-flash", name: "Qwen3 Coder Flash" },
      {
        id: "qwen/qwen3-next-80b-a3b-thinking",
        name: "Qwen3 Next 80B A3B Thinking",
      },
      {
        id: "qwen/qwen3-next-80b-a3b-instruct",
        name: "Qwen3 Next 80B A3B Instruct",
      },
      { id: "qwen/qwen-plus-2025-07-28", name: "Qwen Plus 0728" },
      {
        id: "qwen/qwen-plus-2025-07-28:thinking",
        name: "Qwen Plus 0728 (thinking)",
      },
      {
        id: "qwen/qwen3-30b-a3b-thinking-2507",
        name: "Qwen3 30B A3B Thinking 2507",
      },
      {
        id: "qwen/qwen3-coder-30b-a3b-instruct",
        name: "Qwen3 Coder 30B A3B Instruct",
      },
      {
        id: "qwen/qwen3-30b-a3b-instruct-2507",
        name: "Qwen3 30B A3B Instruct 2507",
      },
      {
        id: "qwen/qwen3-235b-a22b-thinking-2507",
        name: "Qwen3 235B A22B Thinking 2507",
      },
      { id: "qwen/qwen3-coder:free", name: "Qwen3 Coder 480B A35B (free)" },
      { id: "qwen/qwen3-coder", name: "Qwen3 Coder 480B A35B" },
      { id: "qwen/qwen3-coder:exacto", name: "Qwen3 Coder 480B A35B (exacto)" },
      {
        id: "qwen/qwen3-235b-a22b-2507",
        name: "Qwen3 235B A22B Instruct 2507",
      },
      { id: "qwen/qwen3-4b:free", name: "Qwen3 4B (free)" },
      { id: "qwen/qwen3-30b-a3b", name: "Qwen3 30B A3B" },
      { id: "qwen/qwen3-8b", name: "Qwen3 8B" },
      { id: "qwen/qwen3-14b", name: "Qwen3 14B" },
      { id: "qwen/qwen3-32b", name: "Qwen3 32B" },
      { id: "qwen/qwen3-235b-a22b", name: "Qwen3 235B A22B" },
      {
        id: "qwen/qwen2.5-coder-7b-instruct",
        name: "Qwen2.5 Coder 7B Instruct",
      },
      { id: "qwen/qwen2.5-vl-32b-instruct", name: "Qwen2.5 VL 32B Instruct" },
      { id: "qwen/qwq-32b", name: "QwQ 32B" },
      { id: "qwen/qwen-vl-plus", name: "Qwen VL Plus" },
      { id: "qwen/qwen-vl-max", name: "Qwen VL Max" },
      { id: "qwen/qwen-turbo", name: "Qwen-Turbo" },
      { id: "qwen/qwen2.5-vl-72b-instruct", name: "Qwen2.5 VL 72B Instruct" },
      { id: "qwen/qwen-plus", name: "Qwen-Plus" },
      { id: "qwen/qwen-max", name: "Qwen-Max" },
      { id: "qwen/qwen-2.5-7b-instruct", name: "Qwen2.5 7B Instruct" },
      {
        id: "qwen/qwen-2.5-vl-7b-instruct:free",
        name: "Qwen2.5-VL 7B Instruct (free)",
      },
      { id: "qwen/qwen-2.5-vl-7b-instruct", name: "Qwen2.5-VL 7B Instruct" },
    ],
  },
  {
    name: "xAI",
    models: [
      { id: "x-ai/grok-4.1-fast", name: "Grok 4.1 Fast" },
      { id: "x-ai/grok-4-fast", name: "Grok 4 Fast" },
      { id: "x-ai/grok-code-fast-1", name: "Grok Code Fast 1" },
      { id: "x-ai/grok-4", name: "Grok 4" },
      { id: "x-ai/grok-3-mini", name: "Grok 3 Mini" },
      { id: "x-ai/grok-3", name: "Grok 3" },
      { id: "x-ai/grok-3-mini-beta", name: "Grok 3 Mini Beta" },
      { id: "x-ai/grok-3-beta", name: "Grok 3 Beta" },
    ],
  },
  {
    name: "Perplexity",
    models: [
      { id: "perplexity/sonar-pro-search", name: "Sonar Pro Search" },
      { id: "perplexity/sonar-reasoning-pro", name: "Sonar Reasoning Pro" },
      { id: "perplexity/sonar-pro", name: "Sonar Pro" },
      { id: "perplexity/sonar-deep-research", name: "Sonar Deep Research" },
      { id: "perplexity/sonar", name: "Sonar" },
    ],
  },
  {
    name: "MoonshotAI",
    models: [
      { id: "moonshotai/kimi-k2-thinking", name: "Kimi K2 Thinking" },
      { id: "moonshotai/kimi-k2-0905", name: "Kimi K2 0905" },
      { id: "moonshotai/kimi-k2-0905:exacto", name: "Kimi K2 0905 (exacto)" },
      { id: "moonshotai/kimi-k2:free", name: "Kimi K2 0711 (free)" },
      { id: "moonshotai/kimi-k2", name: "Kimi K2 0711" },
      { id: "moonshotai/kimi-dev-72b", name: "Kimi Dev 72B" },
    ],
  },
  {
    name: "Cohere",
    models: [
      { id: "cohere/command-a", name: "Command A" },
      { id: "cohere/command-r7b-12-2024", name: "Command R7B (12-2024)" },
      { id: "cohere/command-r-08-2024", name: "Command R (08-2024)" },
      { id: "cohere/command-r-plus-08-2024", name: "Command R+ (08-2024)" },
    ],
  },
  {
    name: "Amazon",
    models: [
      { id: "amazon/nova-2-lite-v1", name: "Nova 2 Lite" },
      { id: "amazon/nova-premier-v1", name: "Nova Premier 1.0" },
      { id: "amazon/nova-lite-v1", name: "Nova Lite 1.0" },
      { id: "amazon/nova-micro-v1", name: "Nova Micro 1.0" },
      { id: "amazon/nova-pro-v1", name: "Nova Pro 1.0" },
    ],
  },
  {
    name: "NVIDIA",
    models: [
      {
        id: "nvidia/nemotron-3-nano-30b-a3b:free",
        name: "Nemotron 3 Nano 30B A3B (free)",
      },
      { id: "nvidia/nemotron-3-nano-30b-a3b", name: "Nemotron 3 Nano 30B A3B" },
      {
        id: "nvidia/nemotron-nano-12b-v2-vl:free",
        name: "Nemotron Nano 12B 2 VL (free)",
      },
      { id: "nvidia/nemotron-nano-12b-v2-vl", name: "Nemotron Nano 12B 2 VL" },
      {
        id: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
        name: "Llama 3.3 Nemotron Super 49B V1.5",
      },
      {
        id: "nvidia/nemotron-nano-9b-v2:free",
        name: "Nemotron Nano 9B V2 (free)",
      },
      { id: "nvidia/nemotron-nano-9b-v2", name: "Nemotron Nano 9B V2" },
      {
        id: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
        name: "Llama 3.1 Nemotron Ultra 253B v1",
      },
      {
        id: "nvidia/llama-3.1-nemotron-70b-instruct",
        name: "Llama 3.1 Nemotron 70B Instruct",
      },
    ],
  },
  {
    name: "Microsoft",
    models: [
      { id: "microsoft/phi-4-reasoning-plus", name: "Phi 4 Reasoning Plus" },
      {
        id: "microsoft/phi-4-multimodal-instruct",
        name: "Phi 4 Multimodal Instruct",
      },
      { id: "microsoft/phi-4", name: "Phi 4" },
    ],
  },
  {
    name: "ByteDance Seed",
    models: [
      { id: "bytedance-seed/seed-1.6-flash", name: "Seed 1.6 Flash" },
      { id: "bytedance-seed/seed-1.6", name: "Seed 1.6" },
    ],
  },
  {
    name: "MiniMax",
    models: [
      { id: "minimax/minimax-m2.1", name: "MiniMax M2.1" },
      { id: "minimax/minimax-m2", name: "MiniMax M2" },
      { id: "minimax/minimax-m1", name: "MiniMax M1" },
      { id: "minimax/minimax-01", name: "MiniMax-01" },
    ],
  },
  {
    name: "Z.AI",
    models: [
      { id: "z-ai/glm-4.7", name: "GLM 4.7" },
      { id: "z-ai/glm-4.6v", name: "GLM 4.6V" },
      { id: "z-ai/glm-4.6", name: "GLM 4.6" },
      { id: "z-ai/glm-4.6:exacto", name: "GLM 4.6 (exacto)" },
      { id: "z-ai/glm-4.5v", name: "GLM 4.5V" },
      { id: "z-ai/glm-4.5", name: "GLM 4.5" },
      { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air (free)" },
      { id: "z-ai/glm-4.5-air", name: "GLM 4.5 Air" },
      { id: "z-ai/glm-4-32b", name: "GLM 4 32B" },
    ],
  },
  {
    name: "AllenAI",
    models: [
      { id: "allenai/olmo-3.1-32b-think", name: "Olmo 3.1 32B Think" },
      { id: "allenai/olmo-3-32b-think", name: "Olmo 3 32B Think" },
      { id: "allenai/olmo-3-7b-instruct", name: "Olmo 3 7B Instruct" },
      { id: "allenai/olmo-3-7b-think", name: "Olmo 3 7B Think" },
      { id: "allenai/olmo-2-0325-32b-instruct", name: "Olmo 2 32B Instruct" },
    ],
  },
  {
    name: "Arcee AI",
    models: [
      { id: "arcee-ai/trinity-mini:free", name: "Trinity Mini (free)" },
      { id: "arcee-ai/trinity-mini", name: "Trinity Mini" },
      { id: "arcee-ai/spotlight", name: "Spotlight" },
      { id: "arcee-ai/maestro-reasoning", name: "Maestro Reasoning" },
      { id: "arcee-ai/virtuoso-large", name: "Virtuoso Large" },
      { id: "arcee-ai/coder-large", name: "Coder Large" },
    ],
  },
  {
    name: "Deep Cogito",
    models: [
      { id: "deepcogito/cogito-v2.1-671b", name: "Cogito v2.1 671B" },
      {
        id: "deepcogito/cogito-v2-preview-llama-405b",
        name: "Cogito V2 Preview Llama 405B",
      },
      {
        id: "deepcogito/cogito-v2-preview-llama-70b",
        name: "Cogito V2 Preview Llama 70B",
      },
    ],
  },
  {
    name: "Baidu",
    models: [
      {
        id: "baidu/ernie-4.5-21b-a3b-thinking",
        name: "ERNIE 4.5 21B A3B Thinking",
      },
      { id: "baidu/ernie-4.5-21b-a3b", name: "ERNIE 4.5 21B A3B" },
      { id: "baidu/ernie-4.5-vl-28b-a3b", name: "ERNIE 4.5 VL 28B A3B" },
      { id: "baidu/ernie-4.5-vl-424b-a47b", name: "ERNIE 4.5 VL 424B A47B" },
      { id: "baidu/ernie-4.5-300b-a47b", name: "ERNIE 4.5 300B A47B" },
    ],
  },
  {
    name: "Nous",
    models: [
      { id: "nousresearch/hermes-4-70b", name: "Hermes 4 70B" },
      { id: "nousresearch/hermes-4-405b", name: "Hermes 4 405B" },
      {
        id: "nousresearch/deephermes-3-mistral-24b-preview",
        name: "DeepHermes 3 Mistral 24B Preview",
      },
      {
        id: "nousresearch/hermes-3-llama-3.1-70b",
        name: "Hermes 3 70B Instruct",
      },
      {
        id: "nousresearch/hermes-3-llama-3.1-405b:free",
        name: "Hermes 3 405B Instruct (free)",
      },
      {
        id: "nousresearch/hermes-3-llama-3.1-405b",
        name: "Hermes 3 405B Instruct",
      },
    ],
  },
  {
    name: "AI21",
    models: [
      { id: "ai21/jamba-mini-1.7", name: "Jamba Mini 1.7" },
      { id: "ai21/jamba-large-1.7", name: "Jamba Large 1.7" },
    ],
  },
  {
    name: "Inflection",
    models: [
      { id: "inflection/inflection-3-pi", name: "Inflection 3 Pi" },
      {
        id: "inflection/inflection-3-productivity",
        name: "Inflection 3 Productivity",
      },
    ],
  },
  {
    name: "IBM",
    models: [
      { id: "ibm-granite/granite-4.0-h-micro", name: "Granite 4.0 Micro" },
    ],
  },
  {
    name: "Tencent",
    models: [
      { id: "tencent/hunyuan-a13b-instruct", name: "Hunyuan A13B Instruct" },
    ],
  },
  {
    name: "StepFun",
    models: [{ id: "stepfun-ai/step3", name: "Step3" }],
  },
  {
    name: "Morph",
    models: [
      { id: "morph/morph-v3-large", name: "Morph V3 Large" },
      { id: "morph/morph-v3-fast", name: "Morph V3 Fast" },
    ],
  },
  {
    name: "Inception",
    models: [
      { id: "inception/mercury", name: "Mercury" },
      { id: "inception/mercury-coder", name: "Mercury Coder" },
    ],
  },
  {
    name: "Prime Intellect",
    models: [{ id: "prime-intellect/intellect-3", name: "INTELLECT-3" }],
  },
];
