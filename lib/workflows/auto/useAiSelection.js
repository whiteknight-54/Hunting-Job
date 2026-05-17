import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import {
  AI_LS_KEYS,
  AI_MODEL_OPTIONS,
  getDefaultModel,
  normalizeAiSelection,
  normalizeProvider,
} from "../../core/ai-config";
import { readStrLs, writeStrLs } from "./local-storage";

function resolveModel(provider, preferred) {
  return normalizeAiSelection(provider, preferred).model;
}

/** Auto workflow: provider/model picker. Init priority: env (if set) → localStorage → defaults (`lib/core/ai-config.js`). */
export function useAiSelection(aiConfig) {
  const [aiProvider, setAiProvider] = useState("openai");
  const [aiModel, setAiModel] = useState(getDefaultModel("openai"));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    if (!aiConfig || initialized) return;

    const providerFromEnv = aiConfig.providerFromEnv === true;
    const modelFromEnv = aiConfig.modelFromEnv === true;

    const envProvider = normalizeProvider(aiConfig.provider);
    const storedProviderRaw = readStrLs(AI_LS_KEYS.provider, null);
    const normalizedStored = storedProviderRaw ? normalizeProvider(storedProviderRaw) : null;

    const provider = providerFromEnv
      ? envProvider
      : normalizedStored && AI_MODEL_OPTIONS[normalizedStored]?.length
        ? normalizedStored
        : envProvider;

    const storedModel = readStrLs(AI_LS_KEYS.model, null);
    const storedTrimmed = storedModel ? String(storedModel).trim() : "";

    let model;
    if (modelFromEnv) {
      model = resolveModel(provider, aiConfig.model);
    } else if (storedTrimmed) {
      model = resolveModel(provider, storedTrimmed);
    } else {
      model = getDefaultModel(provider);
    }

    startTransition(() => {
      setAiProvider(provider);
      setAiModel(model);
      setInitialized(true);
    });
  }, [aiConfig, initialized]);

  const aiModelOptions = useMemo(
    () => AI_MODEL_OPTIONS[aiProvider] || AI_MODEL_OPTIONS.openai,
    [aiProvider]
  );

  const keyActive = aiConfig?.keys?.[aiProvider] === true;

  const setProvider = (next) => {
    const provider = normalizeProvider(next);
    const model = resolveModel(provider, aiModel);
    setAiProvider(provider);
    setAiModel(model);
    writeStrLs(AI_LS_KEYS.provider, provider);
    writeStrLs(AI_LS_KEYS.model, model);
  };

  const setModel = (next) => {
    setAiModel(next);
    writeStrLs(AI_LS_KEYS.model, next);
  };

  return {
    aiProvider,
    aiModel,
    aiModelOptions,
    keyActive,
    settingsOpen,
    setSettingsOpen,
    settingsRef,
    setAiProvider: setProvider,
    setAiModel: setModel,
  };
}
