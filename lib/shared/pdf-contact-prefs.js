import { useEffect, useState, startTransition } from "react";
import { readBoolLs } from "../workflows/manual/local-storage.js";

export const PDF_CONTACT_LS_KEYS = {
  phone: "pdf_showPhone",
  linkedin: "pdf_showLinkedin",
};

export const PDF_CONTACT_DEFAULTS = {
  showPhone: false,
  showLinkedin: true,
};

/** API/body flags — phone only when `showPhone: true`; LinkedIn on unless `showLinkedin: false`. */
export function parsePdfContactFlags(body = {}) {
  return {
    showPhone: body.showPhone === true,
    showLinkedin: body.showLinkedin !== false,
  };
}

export function usePdfContactPrefs() {
  const [showPhone, setShowPhone] = useState(PDF_CONTACT_DEFAULTS.showPhone);
  const [showLinkedin, setShowLinkedin] = useState(PDF_CONTACT_DEFAULTS.showLinkedin);

  useEffect(() => {
    startTransition(() => {
      setShowPhone(readBoolLs(PDF_CONTACT_LS_KEYS.phone, PDF_CONTACT_DEFAULTS.showPhone));
      setShowLinkedin(readBoolLs(PDF_CONTACT_LS_KEYS.linkedin, PDF_CONTACT_DEFAULTS.showLinkedin));
    });
  }, []);

  return { showPhone, setShowPhone, showLinkedin, setShowLinkedin };
}
