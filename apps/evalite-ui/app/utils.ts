export const scoreToPercent = (score: number) => {
  return `${Math.round(score * 1000) / 10}%`;
};

export const formatTime = (time: number) => {
  if (time < 1000) {
    return `${time}ms`;
  }
  return `${(time / 1000).toFixed(1)}s`;
};
