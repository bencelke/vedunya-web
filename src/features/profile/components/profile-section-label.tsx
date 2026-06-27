type ProfileSectionLabelProps = {
  title: string;
};

export function ProfileSectionLabel({ title }: ProfileSectionLabelProps) {
  return (
    <div className="mystic-profile-section-label">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-gold/80">
        {title}
      </p>
      <span className="mystic-profile-section-label-line" aria-hidden="true" />
    </div>
  );
}
