import { useEffect, useRef, useState } from "react";

/** Tracks PDF run phase (`uploading` | `downloading` | `generating`) and per-phase elapsed seconds. */
export function usePdfRunProgress() {
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState(null);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const phaseStartRef = useRef(null);
  const intervalRef = useRef(null);

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stop = () => {
    clearTick();
    phaseStartRef.current = null;
    setBusy(false);
    setPhase(null);
    setPhaseElapsed(0);
  };

  const beginPhase = (nextPhase) => {
    phaseStartRef.current = Date.now();
    setPhase(nextPhase);
    setPhaseElapsed(0);
  };

  const start = (initialPhase) => {
    stop();
    setBusy(true);
    beginPhase(initialPhase);
    intervalRef.current = setInterval(() => {
      if (phaseStartRef.current) {
        setPhaseElapsed(Math.floor((Date.now() - phaseStartRef.current) / 1000));
      }
    }, 1000);
  };

  const setRunPhase = (nextPhase) => {
    if (!busy) return;
    beginPhase(nextPhase);
  };

  useEffect(() => () => stop(), []);

  return { busy, phase, phaseElapsed, start, setRunPhase, stop };
}
