"use client";

import { useEffect, useRef, useState } from "react";

import { PaymentStatusNotice } from "@/features/payments/components/PaymentStatusNotice";
import { usePayPalScript } from "@/features/payments/components/PayPalScriptProviderWrapper";
import type { SupportedLocale } from "@/config/app-config";

type CoursePayPalButtonProps = {
  locale: SupportedLocale;
  courseId: string;
  disabled?: boolean;
  onVerified?: () => void;
};

export function CoursePayPalButton({
  locale,
  courseId,
  disabled = false,
  onVerified,
}: CoursePayPalButtonProps) {
  const { ready, configured } = usePayPalScript();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "verified" | "error">("idle");

  useEffect(() => {
    if (!ready || disabled || !window.paypal?.Buttons) {
      return;
    }

    const element = containerRef.current;
    if (!element) {
      return;
    }

    element.replaceChildren();
    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", shape: "pill" },
      createOrder: () =>
        fetch(`/api/paypal/orders/create?locale=${locale}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productType: "course",
            courseId,
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error("order_create_failed");
            }
            const payload = (await response.json()) as { orderId?: string };
            if (!payload.orderId) {
              throw new Error("order_create_failed");
            }
            setStatus("pending");
            return payload.orderId;
          })
          .catch(() => {
            setStatus("error");
            throw new Error("order_create_failed");
          }),
      onApprove: (data: { orderID?: string }) => {
        if (!data.orderID) {
          setStatus("error");
          return;
        }

        setStatus("pending");
        return fetch("/api/paypal/orders/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderID }),
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error("capture_failed");
            }
            setStatus("verified");
            onVerified?.();
          })
          .catch(() => {
            setStatus("error");
          });
      },
      onError: () => {
        setStatus("error");
      },
    });

    void buttons.render(element);

    return () => {
      buttons.close();
    };
  }, [ready, disabled, locale, courseId, onVerified]);

  if (!configured) {
    return <PaymentStatusNotice status="unconfigured" />;
  }

  return (
    <div className="space-y-3">
      <PaymentStatusNotice status={status} />
      <div ref={containerRef} className="min-h-11" />
    </div>
  );
}
