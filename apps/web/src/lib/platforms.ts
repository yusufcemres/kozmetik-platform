/**
 * Affiliate platform visual identity.
 * Brand colors applied to product-detail affiliate buttons so each marketplace
 * is recognizable at a glance (screenshot feedback 2026-04-21).
 */
export interface PlatformInfo {
  label: string;
  logo: string;
  /** Brand primary background color. */
  color: string;
  /** Slightly darkened hover variant. */
  colorHover: string;
  /** Foreground color paired with `color` for WCAG AA contrast. */
  textColor: string;
}

export const PLATFORM_INFO: Record<string, PlatformInfo> = {
  trendyol: {
    label: 'Trendyol',
    logo: '/logos/trendyol.svg',
    color: '#F27A1A',
    colorHover: '#D86A14',
    textColor: '#FFFFFF',
  },
  hepsiburada: {
    label: 'Hepsiburada',
    logo: '/logos/hepsiburada.svg',
    color: '#FF6000',
    colorHover: '#E05500',
    textColor: '#FFFFFF',
  },
  amazon_tr: {
    label: 'Amazon TR',
    logo: '/logos/amazon_tr.svg',
    color: '#232F3E',
    colorHover: '#1A2330',
    textColor: '#FF9900',
  },
  n11: {
    label: 'n11',
    logo: '/logos/n11.svg',
    color: '#5C2D91',
    colorHover: '#4A2475',
    textColor: '#FBC706',
  },
  pttavm: {
    label: 'PttAVM',
    logo: '/logos/pttavm.svg',
    color: '#003F88',
    colorHover: '#002F66',
    textColor: '#FFC000',
  },
  dermoeczanem: {
    label: 'Dermoeczanem',
    logo: '/logos/dermoeczanem.svg',
    color: '#00A99D',
    colorHover: '#008A80',
    textColor: '#FFFFFF',
  },
  gratis: {
    label: 'Gratis',
    logo: '/logos/gratis.svg',
    color: '#4A0E78',
    colorHover: '#3A0A5E',
    textColor: '#FFFFFF',
  },
  rossmann: {
    label: 'Rossmann',
    logo: '/logos/rossmann.svg',
    color: '#D40E14',
    colorHover: '#B10B10',
    textColor: '#FFFFFF',
  },
  watsons: {
    label: 'Watsons',
    logo: '/logos/watsons.svg',
    color: '#00B0A0',
    colorHover: '#008F82',
    textColor: '#FFFFFF',
  },
};

export function platformLabel(platform: string): string {
  return PLATFORM_INFO[platform]?.label || platform;
}

/**
 * Brand-colored inline style for a button (background + text).
 * Pair with an onMouseEnter/Leave for hover state, or rely on CSS filter.
 */
export function platformButtonStyle(platform: string): {
  backgroundColor: string;
  color: string;
  borderColor: string;
} {
  const info = PLATFORM_INFO[platform];
  if (!info) {
    return {
      backgroundColor: 'transparent',
      color: 'inherit',
      borderColor: 'rgba(0,0,0,0.12)',
    };
  }
  return {
    backgroundColor: info.color,
    color: info.textColor,
    borderColor: info.color,
  };
}
