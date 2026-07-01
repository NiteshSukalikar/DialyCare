export function calculateWeightLossKg(preWeightKg: number, postWeightKg: number) {
  if (!Number.isFinite(preWeightKg) || !Number.isFinite(postWeightKg)) return undefined;
  return Number((preWeightKg - postWeightKg).toFixed(1));
}

export function calculateWeightGainVsDryKg(preWeightKg: number, dryWeightKg: number) {
  if (!Number.isFinite(preWeightKg) || !Number.isFinite(dryWeightKg)) return undefined;
  return Number((preWeightKg - dryWeightKg).toFixed(1));
}

export function nextDialyzerUseNumber(currentUsage: number) {
  if (!Number.isInteger(currentUsage) || currentUsage < 0) return 1;
  return currentUsage + 1;
}

export function calculateUfVarianceLiters(preWeightKg: number, postWeightKg: number, ufRemovedLiters: number) {
  const weightLossKg = calculateWeightLossKg(preWeightKg, postWeightKg);
  if (weightLossKg === undefined || !Number.isFinite(ufRemovedLiters)) return undefined;
  return Number((weightLossKg - ufRemovedLiters).toFixed(1));
}
