export async function checkDomainAvailability(domain: string): Promise<{ domain: string; available: boolean }> {
  // TODO: Integrate with a real domain API (e.g., domainsdb.info)
  return { domain, available: true };
} 