type IconProps = {
  className?: string;
};

export function AppleProviderIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M16.365 12.146c.02 2.14 1.87 2.86 1.888 2.87-.016.05-.296.98-.974 1.94-.586.83-1.19 1.66-2.14 1.68-.93.02-1.23-.55-2.3-.55-1.07 0-1.41.53-2.29.57-.94.04-1.65-.92-2.24-1.75-1.22-1.74-2.15-4.92-.9-7.07.62-1.08 1.73-1.76 2.94-1.78.92-.02 1.79.61 2.3.61.51 0 1.47-.76 2.48-.65.42.02 1.6.17 2.36 1.28-.06.04-1.41.82-1.39 2.44ZM13.92 4.38c.5-.61 1.34-1.02 2.08-1.05.1.82-.24 1.63-.72 2.16-.47.55-1.25.97-2.01.9-.08-.76.22-1.55.65-2.01Z" />
    </svg>
  );
}

export function FacebookProviderIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M13.5 8.5V6.75c0-.69.56-1.25 1.25-1.25h1.5V3h-2.04C12.57 3 11.5 4.07 11.5 5.46V8.5H9v2.75h2.5V21h2V11.25H15.5l.42-2.75H13.5Z" />
    </svg>
  );
}
