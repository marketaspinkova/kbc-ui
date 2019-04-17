const scoreStyle = (score) => {
  if (score >= 0.9) return 'success';
  if (score >= 0.7) return 'info';
  if (score >= 0.5) return 'warning';

  return 'danger';
};

export { scoreStyle };
