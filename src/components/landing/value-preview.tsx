import { getTranslations } from "next-intl/server";

import {
  Card,
  CardBody,
  CardLabel,
  CardTitle,
} from "@/components/ui/card";

export async function ValuePreview() {
  const t = await getTranslations("landing.preview");

  const items = [
    {
      label: t("guidanceLabel"),
      title: t("guidanceTitle"),
      body: t("guidanceBody"),
    },
    {
      label: t("moonLabel"),
      title: t("moonTitle"),
      body: t("moonBody"),
    },
    {
      label: t("actionLabel"),
      title: t("actionTitle"),
      body: t("actionBody"),
    },
  ];

  return (
    <section aria-labelledby="value-preview-heading" className="space-y-4">
      <div className="space-y-2">
        <h2
          id="value-preview-heading"
          className="text-xl font-medium text-text-primary"
        >
          {t("heading")}
        </h2>
        <p className="text-sm leading-relaxed text-text-muted">
          {t("description")}
        </p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.label} elevated>
            <CardLabel>{item.label}</CardLabel>
            <CardTitle>{item.title}</CardTitle>
            <CardBody>{item.body}</CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
