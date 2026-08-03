"use client";

import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

export function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem("qarzname_install_dismissed");
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (!dismissed && isIOS && !isStandalone) {
      setTimeout(() => setShow(true), 1200);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="install-banner animate-fade-up" role="dialog" aria-label="دامەزراندن">
      <button
        className="install-close"
        aria-label="داخستن"
        onClick={() => {
          localStorage.setItem("qarzname_install_dismissed", "1");
          setShow(false);
        }}
      >
        <X size={18} />
      </button>
      <div className="install-body">
        <p className="install-title">دامەزراندن لەسەر ئایپاد</p>
        <p className="install-text">
          لە Safari کرتە لە <Share size={14} className="inline-icon" /> بکە، پاشان{" "}
          <strong>Add to Home Screen</strong> هەڵبژێرە.
        </p>
      </div>
    </div>
  );
}
