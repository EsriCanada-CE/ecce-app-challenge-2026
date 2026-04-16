type UiIconName =
  | "explore"
  | "search"
  | "directions"
  | "bike"
  | "dashboard"
  | "history"
  | "eco"
  | "settings"
  | "location"
  | "plus"
  | "minus"
  | "walk"
  | "car"
  | "pin"
  | "flag"
  | "weather";

type UiIconProps = {
  name: UiIconName;
  className?: string;
};

export default function UiIcon({ name, className }: UiIconProps) {
  const props = {
    "aria-hidden": true,
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  switch (name) {
    case "explore":
      return (
        <svg {...props}>
          <path d="m14.8 9.2-4 1.9-1.9 4 4-1.9z" />
          <circle cx="12" cy="12" r="8.2" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.2-4.2" />
        </svg>
      );
    case "directions":
      return (
        <svg {...props}>
          <path d="M13 4h5l-1.7 3L18 10h-5" />
          <path d="M11 20H6l1.7-3L6 14h5" />
          <path d="M13 7h-2a4 4 0 0 0-4 4v3" />
          <path d="M11 17h2a4 4 0 0 0 4-4v-3" />
        </svg>
      );
    case "bike":
      return (
        <svg {...props}>
          <circle cx="6" cy="17" r="3.2" />
          <circle cx="18" cy="17" r="3.2" />
          <path d="M6 17 10 9h3l2 8" />
          <path d="M9 12h7" />
          <path d="M13 6h2.5" />
          <path d="m15.5 6 2.5 5" />
        </svg>
      );
    case "dashboard":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
        </svg>
      );
    case "history":
      return (
        <svg {...props}>
          <path d="M4.5 7.5H8v-3" />
          <path d="M4.8 12a7.2 7.2 0 1 0 2.1-5.1L4.5 9.2" />
          <path d="M12 8.5V12l2.5 1.8" />
        </svg>
      );
    case "eco":
      return (
        <svg {...props}>
          <path d="M19 5c-5.7 0-9.5 2.7-11 7.8" />
          <path d="M8 12c-1.2-2.4-1.2-4.9 0-7 4.5.3 7.8 2.2 9.7 5.8-2.2 2.8-5.4 4.2-9.7 4.2" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.5 1.5 0 0 1-2.1 2.1l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V19a1.5 1.5 0 0 1-3 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1.5 1.5 0 0 1-2.1-2.1l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H5a1.5 1.5 0 0 1 0-3h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1.5 1.5 0 0 1 2.1-2.1l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V5a1.5 1.5 0 0 1 3 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a1.5 1.5 0 0 1 2.1 2.1l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H19a1.5 1.5 0 0 1 0 3h-.2a1 1 0 0 0-.9.7 1 1 0 0 0 .2 1.1" />
        </svg>
      );
    case "location":
      return (
        <svg {...props}>
          <path d="M12 20s6-5.7 6-10a6 6 0 1 0-12 0c0 4.3 6 10 6 10Z" />
          <circle cx="12" cy="10" r="2.1" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "minus":
      return (
        <svg {...props}>
          <path d="M5 12h14" />
        </svg>
      );
    case "walk":
      return (
        <svg {...props}>
          <circle cx="12" cy="5.2" r="1.8" />
          <path d="m10 10 2-2 2 1.5" />
          <path d="m12 8 1 5" />
          <path d="m10 20 1.3-4.5" />
          <path d="m14.5 20-1-4.2" />
          <path d="m9 13 3 1 2.5-2.2" />
        </svg>
      );
    case "car":
      return (
        <svg {...props}>
          <path d="m5 14 1.3-4h11.4L19 14" />
          <path d="M4.5 14h15v4h-15z" />
          <circle cx="7.5" cy="18" r="1.2" />
          <circle cx="16.5" cy="18" r="1.2" />
        </svg>
      );
    case "pin":
      return (
        <svg {...props}>
          <path d="M12 20s5.3-5.2 5.3-9.1a5.3 5.3 0 1 0-10.6 0C6.7 14.8 12 20 12 20Z" />
          <circle cx="12" cy="10.7" r="1.8" />
        </svg>
      );
    case "flag":
      return (
        <svg {...props}>
          <path d="M8 20V5.5" />
          <path d="M9.5 6.5H18l-2.6 4.1L18 14.7H9.5Z" />
        </svg>
      );
    case "weather":
      return (
        <svg {...props}>
          <path d="M7.5 17.5h9a3.5 3.5 0 0 0 .5-7 5 5 0 0 0-9.8-1A3.2 3.2 0 0 0 7.5 17.5Z" />
          <path d="M8.3 6.2 9.6 4.5" />
          <path d="m14.4 5 1-1.7" />
        </svg>
      );
  }
}
