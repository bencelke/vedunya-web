type RuneMeaningCardProps = {
  label: string;
  body: string;
};

export function RuneMeaningCard({ label, body }: RuneMeaningCardProps) {
  return (
    <section className="mystic-cosmic-card space-y-3 p-5">
      <h2 className="mystic-eyebrow">{label}</h2>
      <p className="text-sm leading-[1.72] text-text-muted">{body}</p>
    </section>
  );
}
