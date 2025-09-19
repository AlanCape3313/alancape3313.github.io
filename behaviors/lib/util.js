export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function sigmoid(value, range, coef) {
  return (range * 2) / (1 + Math.pow(coef, -value)) - range;
}