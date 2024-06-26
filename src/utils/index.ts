export function humanizeNum(val: number | string) {
  return val;
  const num = typeof val === 'number' ? val : parseFloat(val);

  if (num >= 1e7) {
    return (num / 1e7).toFixed(2) + ' Cr';
  }

  if (num >= 1e5) {
    return (num / 1e5).toFixed(2) + ' L';
  }

  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + ' K';
  }

  return isNaN(num) ? 0 : num;
}

export function getFormattedSmallPrice(price: number, decimalpoints = 1) {
  if (!price) return 0;
  const parsedPrice = parseFloat(price.toFixed(decimalpoints));

  if (decimalpoints >= 5) return parsedPrice;

  if (parsedPrice === 0) {
    return getFormattedSmallPrice(price, decimalpoints + 1);
  }

  return parseFloat(price.toFixed(decimalpoints + 1));
}
