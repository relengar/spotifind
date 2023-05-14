import type { Image } from "$lib/server/spotify";

export function getBestImage(
  images: Image[],
  targetSize: number
): Image | null {
  if (images.length === 0) {
    return null;
  }

  let best: Image = images[0];
  let currentDelta = Math.abs(targetSize - best.width);

  for (const image of images) {
    const delta = Math.abs(targetSize - image.width);
    if (delta < currentDelta) {
      best = image;
      currentDelta = delta;
    }
  }

  return best;
}
