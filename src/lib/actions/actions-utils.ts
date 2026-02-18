/**
 * Simple action result resolver for Supabase-based actions
 */
export async function resolveActionResult<T>(promise: Promise<T>): Promise<T> {
  return promise;
}
