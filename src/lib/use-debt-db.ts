"use client";

import { useCallback, useEffect, useState } from "react";
import { loadDb, type DebtDB } from "./debt-db";

export function useDebtDb() {
  const [db, setDb] = useState<DebtDB>(() =>
    typeof window === "undefined"
      ? { people: [], debts: [], payments: [], version: 1 }
      : loadDb()
  );
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setDb(loadDb());
  }, []);

  useEffect(() => {
    setDb(loadDb());
    setReady(true);
    const onChange = () => refresh();
    window.addEventListener("qarzname-db-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("qarzname-db-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return { db, ready, refresh };
}
