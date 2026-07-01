// ✏️ EDITABLE — theme the ads to match this site. Devs own this file.
// You control the LOOK here (radius, border, shadow, background, label color).
// You CANNOT change the ad's shape/fit from here — that stays locked in
// src/lib/ad-slots.ts, so the ad always displays correctly no matter what.

import type { AdSkin } from '@/lib/ads/ad-frame'

// Site-wide default skin — tuned to the premium warm-paper palette.
export const adSkin: AdSkin = {
  radius: '16px',
  border: '1px solid rgba(23,20,18,0.08)',
  shadow: '0 8px 30px rgba(23,20,18,0.06)',
  background: '#ffffff',
  labelClassName: 'bg-[#C6432E] text-white',
}

// Optional per-slot overrides — adjust only where you need to.
export const adSkinBySlot: Partial<Record<string, AdSkin>> = {
  sidebar: { radius: '16px', shadow: 'none', border: '1px solid rgba(23,20,18,0.10)' },
  popup: { radius: '24px' },
  header: { radius: '20px', background: '#F4F1EA' },
}

/** Merge site default + per-slot override for a slot. */
export function skinFor(slot: string): AdSkin {
  return { ...adSkin, ...(adSkinBySlot[slot] ?? {}) }
}
// junior tweak
