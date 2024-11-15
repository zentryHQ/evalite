export const scoreToPercent = (score: number) => {
  return `${Math.round(score * 1000) / 10}%`;
};
