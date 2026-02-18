/**
 * Simplified cache invalidation without Redis
 * Uses Next.js revalidateTag/revalidatePath instead
 */
export async function invalidateCache() {
  // No-op for now - use revalidatePath/revalidateTag directly in actions
  return Promise.resolve();
}
