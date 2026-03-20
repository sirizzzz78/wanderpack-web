// Spacing tokens (matching iOS AppTheme)
export const spacing = {
  pagePadding: 20,
  cardPadding: 16,
  stackSpacing: 12,
} as const;

// Corner radius tokens
export const radius = {
  card: 14,
  button: 20,
  chip: 12,
  iconBox: 9,
  badge: 20,
} as const;

// Typography — Tailwind class strings mapping to iOS semantic tokens
// All use Quicksand via font-family in globals.css
export const typography = {
  heroTitle: 'text-[32px] font-semibold tracking-tight',
  pageTitle: 'text-[28px] font-semibold tracking-tight',
  screenHeading: 'text-[26px] font-semibold',
  sheetTitle: 'text-[22px] font-semibold',
  cardTitle: 'text-[17px] font-semibold',
  bodyMedium: 'text-[16px] font-medium',
  bodySemibold: 'text-[16px] font-semibold',
  bodyRegular: 'text-[16px] font-normal',
  bodySmall: 'text-[15px] font-normal',
  bodySmallMed: 'text-[15px] font-medium',
  calloutSB: 'text-[14px] font-semibold',
  callout: 'text-[14px] font-normal',
  caption: 'text-[13px] font-normal',
  captionMed: 'text-[13px] font-medium',
  captionSB: 'text-[13px] font-semibold',
  detail: 'text-[12px] font-normal',
  detailMed: 'text-[12px] font-medium',
  detailSB: 'text-[12px] font-semibold',
  sectionLabel: 'text-[11px] font-semibold uppercase tracking-[1.5px]',
  small: 'text-[11px] font-medium',
  badgeText: 'text-[11px] font-semibold',
  tiny: 'text-[10px] font-normal',
  tinySB: 'text-[10px] font-semibold',
} as const;
