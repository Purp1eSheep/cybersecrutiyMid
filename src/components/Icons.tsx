import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconCheck = (props: IconProps) => (
  <Svg {...props}>
    <path d="m5 12 4 4L19 6" />
  </Svg>
);

export const IconX = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconChevronLeft = (props: IconProps) => (
  <Svg {...props}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const IconChevronRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const IconArrowLeft = (props: IconProps) => (
  <Svg {...props}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

export const IconSun = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </Svg>
);

export const IconMoon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </Svg>
);

export const IconMonitor = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </Svg>
);

export const IconPlay = (props: IconProps) => (
  <Svg {...props}>
    <path d="m8 5 11 7-11 7V5Z" />
  </Svg>
);

export const IconShield = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.1 7.5 9.5 4.3-1.4 7.5-5 7.5-9.5V6L12 3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

export const IconBookOpen = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 6.5C10.5 5 8.5 4.5 4 4.5v14c4.5 0 6.5.5 8 2 1.5-1.5 3.5-2 8-2v-14c-4.5 0-6.5.5-8 2Z" />
    <path d="M12 6.5v14" />
  </Svg>
);

export const IconRepeat = (props: IconProps) => (
  <Svg {...props}>
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </Svg>
);

export const IconBarChart = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 3v18h18" />
    <path d="M7 16v-5M12 16V7M17 16v-3" />
  </Svg>
);

export const IconFlame = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 22c4 0 7-2.7 7-6.5 0-2.4-1.2-4.2-3-6-1.1-1.1-1.5-2.3-1.5-3.5C14.5 4 13.5 2 12 2c0 3-2 4.5-3.5 6.5C7 10.5 5 12.5 5 15.5 5 19.3 8 22 12 22Z" />
    <path d="M12 18c1.7 0 3-1.2 3-2.8 0-1.7-1.5-2.6-3-4.2-1.5 1.6-3 2.5-3 4.2 0 1.6 1.3 2.8 3 2.8Z" />
  </Svg>
);

export const IconTarget = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </Svg>
);

export const IconRotateCcw = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
);

export const IconListOrdered = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10 6h11M10 12h11M10 18h11" />
    <path d="M4 6h1v4M4 10h2" />
    <path d="M6 18H4c0-1 2-1.5 2-3 0-1-.7-1.5-1.5-1.5S3.5 14 3.5 15" />
  </Svg>
);

export const IconShuffle = (props: IconProps) => (
  <Svg {...props}>
    <path d="M16 3h5v5M4 20 21 3" />
    <path d="M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </Svg>
);

export const IconSettings = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
    <path d="M1 14h6M9 8h6M17 16h6" />
  </Svg>
);

export const IconAlertTriangle = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10.3 4.2 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Svg>
);
