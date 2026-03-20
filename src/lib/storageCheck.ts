export interface StorageEstimate {
  usagePercent: number;
  usageMB: number;
  quotaMB: number;
}

export async function checkStorageQuota(): Promise<StorageEstimate | null> {
  if (!navigator.storage?.estimate) return null;
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return {
      usagePercent: quota > 0 ? (usage / quota) * 100 : 0,
      usageMB: Math.round(usage / (1024 * 1024)),
      quotaMB: Math.round(quota / (1024 * 1024)),
    };
  } catch {
    return null;
  }
}
