export const formatOneDecimal = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0.0";
  }

  return numericValue.toFixed(1);
};
