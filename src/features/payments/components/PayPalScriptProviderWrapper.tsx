"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getPublicPayPalClientId,
  hasPublicPayPalClientId,
} from "@/features/payments/utils/paypal-client-config";

type PayPalScriptContextValue = {
  ready: boolean;
  configured: boolean;
  clientId: string | null;
};

const PayPalScriptContext = createContext<PayPalScriptContextValue>({
  ready: false,
  configured: false,
  clientId: null,
});

declare global {
  interface Window {
    paypal?: {
      Buttons?: (config: Record<string, unknown>) => {
        render: (container: HTMLElement) => Promise<void>;
        close: () => void;
      };
    };
  }
}

function loadPayPalSdk(clientId: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.paypal?.Buttons) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-mystic-paypal-sdk="true"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("paypal_sdk_failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=capture&components=buttons`;
    script.async = true;
    script.dataset.mysticPaypalSdk = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("paypal_sdk_failed"));
    document.body.appendChild(script);
  });
}

type PayPalScriptProviderWrapperProps = {
  children: ReactNode;
};

export function PayPalScriptProviderWrapper({
  children,
}: PayPalScriptProviderWrapperProps) {
  const clientId = getPublicPayPalClientId();
  const configured = hasPublicPayPalClientId();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let cancelled = false;
    loadPayPalSdk(clientId)
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReady(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const value = useMemo(
    () => ({
      ready,
      configured,
      clientId,
    }),
    [ready, configured, clientId],
  );

  return (
    <PayPalScriptContext.Provider value={value}>{children}</PayPalScriptContext.Provider>
  );
}

export function usePayPalScript(): PayPalScriptContextValue {
  return useContext(PayPalScriptContext);
}
