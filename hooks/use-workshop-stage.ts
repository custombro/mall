"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type WorkshopStageState,
  readWorkshopState,
  writeWorkshopState,
} from "../lib/cb-workshop-stage-store";

import { useSyncExternalStore } from "react";
import { getKeyringProductionDraftState, resetKeyringProductionDraftState, setKeyringProductionDraftState, subscribeKeyringProductionDraftState } from "../lib/cb-workshop-stage-store";
export function useWorkshopStage() {
  const [stageState, setStageState] = useState<WorkshopStageState>(() => readWorkshopState());

  useEffect(() => {
    const syncFromStore = () => {
      setStageState(readWorkshopState());
    };

    syncFromStore();

    window.addEventListener("storage", syncFromStore);
    window.addEventListener("cb-workshop-state-changed", syncFromStore);

    return () => {
      window.removeEventListener("storage", syncFromStore);
      window.removeEventListener("cb-workshop-state-changed", syncFromStore);
    };
  }, []);

  const writeStageState = useCallback((next: WorkshopStageState) => {
    const safe = writeWorkshopState(next);
    setStageState(safe);
    return safe;
  }, []);

  const updateStageState = useCallback(
    (updater: (prev: WorkshopStageState) => WorkshopStageState) => {
      const current = readWorkshopState();
      return writeStageState(updater(current));
    },
    [writeStageState],
  );

  return {
    stageState,
    writeStageState,
    updateStageState,
  };
}

/* STEPB_KEYRING_DRAFT_SHARED_HOOK_START */
export function useKeyringProductionDraft() {
  const keyringProductionDraft = useSyncExternalStore(
    subscribeKeyringProductionDraftState,
    getKeyringProductionDraftState,
    getKeyringProductionDraftState,
  );

  return {
    keyringProductionDraft,
    setKeyringProductionDraft: setKeyringProductionDraftState,
    resetKeyringProductionDraft: resetKeyringProductionDraftState,
  };
}
/* STEPB_KEYRING_DRAFT_SHARED_HOOK_END */
