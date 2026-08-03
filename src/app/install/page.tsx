"use client";

import { useEffect, useState } from "react";
import { Share, PlusSquare, Check } from "lucide-react";

export default function InstallPage() {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    setStandalone(isStandalone);
  }, []);

  if (standalone) {
    return (
      <div className="animate-fade-up hero-brand" style={{ paddingTop: "2rem" }}>
        <h1>قەرزنامە</h1>
        <p>ئەپەکە دامەزراوە. بڕۆ بۆ سەرەکی بۆ دەستپێکردن.</p>
        <a href="../dashboard/" className="btn btn-primary" style={{ marginTop: "1.25rem" }}>
          کردنەوەی ئەپ
        </a>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="hero-brand">
        <h1>قەرزنامە</h1>
        <p>بەبێ Mac و بەبێ App Store — لە Safari لەسەر ئایپادەکەت دایبمەزرێنە.</p>
      </div>

      <div className="panel form-grid" style={{ gap: "1.25rem" }}>
        <div className="install-step">
          <span className="install-num">١</span>
          <div>
            <p className="m-0 font-semibold text-lg">لە Safari بمێنەرەوە</p>
            <p className="m-0 mt-1 text-ink-400 text-sm">
              ئەگەر لە Chrome یان ئەپێکی تردایت، لینکەکە لە <strong>Safari</strong> بکەرەوە.
            </p>
          </div>
        </div>

        <div className="install-step">
          <span className="install-num">٢</span>
          <div>
            <p className="m-0 font-semibold text-lg inline-flex items-center gap-2">
              کرتە لە Share بکە <Share size={18} />
            </p>
            <p className="m-0 mt-1 text-ink-400 text-sm">
              دوگمەی هاوبەشکردن (چوارگۆشە + تیر) لەسەرەوە یان خوارەوەی Safari.
            </p>
          </div>
        </div>

        <div className="install-step">
          <span className="install-num">٣</span>
          <div>
            <p className="m-0 font-semibold text-lg inline-flex items-center gap-2">
              Add to Home Screen <PlusSquare size={18} />
            </p>
            <p className="m-0 mt-1 text-ink-400 text-sm">
              لە لیستەکە بگەڕێ بۆ «Add to Home Screen» / «زیادکردن بۆ شاشەی سەرەکی».
            </p>
          </div>
        </div>

        <div className="install-step">
          <span className="install-num">٤</span>
          <div>
            <p className="m-0 font-semibold text-lg inline-flex items-center gap-2">
              Add / زیادکردن <Check size={18} />
            </p>
            <p className="m-0 mt-1 text-ink-400 text-sm">
              ناو: <strong>قەرزنامە</strong> — دوای زیادکردن، ئایکۆنەکە لە Home Screen دەردەکەوێت.
            </p>
          </div>
        </div>
      </div>

      <div className="panel mt-4">
        <p className="m-0 text-sm text-ink-500 leading-relaxed">
          ئەمە وەک ئەپی ڕاستەقینە کار دەکات (fullscreen)، داتا لەسەر ئایپادەکەت دەمێنێتەوە، و پێویستی بە
          App Store یان Mac نییە.
        </p>
        <a href="../dashboard/" className="btn btn-secondary mt-4 inline-flex">
          سەرەتا تاقیبکەرەوە لە وێب
        </a>
      </div>
    </div>
  );
}
