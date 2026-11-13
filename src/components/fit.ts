/** Font size that lets a condensed display title span the width without running off-screen. */
export const fitW = (text: string, maxVw: number, k = 225) =>
  `min(${maxVw}vw, ${(k / Math.max(text.length, 3)).toFixed(1)}vw)`;

/** Font size for a title set vertically along a frame of the given height (in vh). */
export const fitH = (text: string, frameVh: number, maxVh = 30) =>
  `min(${maxVh}vh, ${((frameVh * 2.4) / Math.max(text.length, 3)).toFixed(1)}vh)`;
