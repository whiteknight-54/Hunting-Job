import { useEffect, useRef, useState } from "react";

/** Elapsed-second timer for long-running PDF / AI operations. */
export function useGenerationTimer() {
  const [busy, setBusy] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastDuration, setLastDuration] = useState(null);
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startRef.current = null;
    setBusy(false);
  };

  const start = () => {
    stop();
    setElapsedTime(0);
    setLastDuration(null);
    startRef.current = Date.now();
    setBusy(true);
    intervalRef.current = setInterval(() => {
      if (startRef.current) {
        setElapsedTime(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
  };

  const finish = () => {
    stop();
  };

  useEffect(() => () => stop(), []);

  const runTimed = async (fn) => {
    start();
    try {
      const result = await fn();
      if (startRef.current) {
        setLastDuration(Math.floor((Date.now() - startRef.current) / 1000));
      }
      return result;
    } finally {
      finish();
    }
  };

  return { busy, setBusy, elapsedTime, lastDuration, start, finish, stop, runTimed };
}
