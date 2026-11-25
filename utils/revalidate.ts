export async function revalidatePortfolioCache(): Promise<void> {
  try {
    await fetch("/api/revalidate", { method: "POST" });
  } catch {
    // Non-blocking: cache still expires naturally via revalidate interval
  }
}
