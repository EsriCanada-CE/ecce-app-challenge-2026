"use client";

type AddressLoadingBarProps = {
  className?: string;
  label?: string;
};

export default function AddressLoadingBar({
  className,
  label = "Loading address",
}: AddressLoadingBarProps) {
  const classes = ["address-loading-bar", className].filter(Boolean).join(" ");

  return (
    <span className={classes} role="status" aria-live="polite" aria-label={label}>
      <span className="address-loading-bar__track" aria-hidden={true}>
        <span className="address-loading-bar__fill" />
      </span>
      <span className="address-loading-bar__spinner" aria-hidden={true} />
    </span>
  );
}
