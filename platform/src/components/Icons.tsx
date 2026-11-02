// Small line icons for the navigation (stroke only, 1.7px). The active icon takes the full olive hue.
import { ReactNode } from 'react';

const Svg = ({ children }: { children: ReactNode }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const IconOverview = () => (
  <Svg>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
  </Svg>
);

export const IconBatches = () => (
  <Svg>
    <path d="M4 7.5 12 3.5l8 4-8 4-8-4Z" />
    <path d="m4 12 8 4 8-4" />
    <path d="m4 16.5 8 4 8-4" />
  </Svg>
);

export const IconSuppliers = () => (
  <Svg>
    <path d="M12 20.5v-9" />
    <path d="M12 11.5c0-3.5-2.5-6-6.5-6 0 3.5 2.5 6 6.5 6Z" />
    <path d="M12 14.5c0-3 2.2-5 5.5-5 0 3-2.2 5-5.5 5Z" />
    <path d="M7 20.5h10" />
  </Svg>
);

export const IconSamples = () => (
  <Svg>
    <path d="M9.5 3.5h5" />
    <path d="M10.5 3.5v6L5 19a1.5 1.5 0 0 0 1.3 2.2h11.4A1.5 1.5 0 0 0 19 19l-5.5-9.5v-6" />
    <path d="M7.5 15.5h9" />
  </Svg>
);

export const IconClimate = () => (
  <Svg>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
  </Svg>
);

export const IconTrace = () => (
  <Svg>
    <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
    <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
    <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
    <path d="M14.5 14.5h2.5v2.5M20.5 14.5v0M14.5 20.5h3M20.5 17.5v3" />
  </Svg>
);

export const IconSearch = () => (
  <Svg>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Svg>
);
