export const BLAZE_PRICING = {
  storageUsdPerGbMonth: 0.026,
  uploadOpUsdPer10k: 0.05,
};

const BYTES_IN_GB = 1024 ** 3;

export function bytesToMb(bytes) {
  return bytes / (1024 ** 2);
}

export function estimateSessionCost(files = []) {
  const totalBytes = files.reduce((sum, file) => sum + (file?.size || file?.sizeBytes || 0), 0);
  const totalGb = totalBytes / BYTES_IN_GB;
  const storageUsd = totalGb * BLAZE_PRICING.storageUsdPerGbMonth;
  const uploadOps = files.length;
  const operationUsd = (uploadOps / 10000) * BLAZE_PRICING.uploadOpUsdPer10k;
  const totalUsd = storageUsd + operationUsd;
  return { totalBytes, storageUsd, operationUsd, totalUsd, uploadOps };
}
