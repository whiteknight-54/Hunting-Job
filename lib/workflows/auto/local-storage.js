export function readStrLs(key, defaultVal = null) {
  try {
    const v = localStorage.getItem(key);
    return v === null || v === "" ? defaultVal : v;
  } catch {
    return defaultVal;
  }
}

export function writeStrLs(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}
