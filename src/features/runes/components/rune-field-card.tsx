type RuneFieldCardProps = {
  label: string;
  body: string;
  tone?: "gold" | "muted";
};

export function RuneFieldCard({
  label,
  body,
  tone = "gold",
}: RuneFieldCardProps) {
  const labelClass =
    tone === "gold"
      ? "text-xs font-medium uppercase tracking-[0.14em] text-accent-gold"
      : "text-xs font-medium uppercase tracking-[0.14em] text-text-subtle";

  return (
    <section className="mystic-cosmic-card space-y-3 p-5">
      <h2 className={labelClass}>{label}</h2>
      <p className="text-sm leading-[1.72] text-text-primary">{body}</p>
    </section>
  );
}
