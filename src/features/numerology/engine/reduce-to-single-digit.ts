/**
 * Sujok personal-day reduction — matches Flutter `reduceToDigit1to9`
 * in `lib/core/utils/card_cluster_utils.dart`.
 */
export function sumDigits(n: number): number {
  let sum = 0;
  let x = Math.abs(Math.floor(n));

  while (x > 0) {
    sum += x % 10;
    x = Math.floor(x / 10);
  }

  return sum;
}

export function reduceToSingleDigit(value: number): number {
  let n = Math.abs(Math.floor(value));

  if (n === 0) {
    return 1;
  }

  while (n > 9) {
    n = sumDigits(n);
  }

  return n === 0 ? 1 : n;
}
