// Domainr API integration for real-time domain availability checking
export interface DomainrStatus {
  domain: string;
  status: 'available' | 'taken' | 'unknown';
  summary: string;
  registerURL?: string;
  price?: string;
  currency?: string;
}

export interface DomainrResponse {
  status: Array<{
    domain: string;
    summary: string;
    status: string;
    registerURL?: string;
    price?: number;
    currency?: string;
  }>;
}

/**
 * Check domain availability using Domainr API
 * @param domains Array of domain names to check
 * @returns Array of domain status objects with purchase links
 */
export async function checkDomainAvailability(domains: string[]): Promise<DomainrStatus[]> {
  try {
    const domainQuery = domains.join(',');
    const response = await fetch(`https://domainr.p.rapidapi.com/v2/status?domain=${domainQuery}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'domainr.p.rapidapi.com',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Domainr API Error:', response.status, response.statusText);
      // Return fallback status for all domains
      return domains.map(domain => ({
        domain,
        status: 'unknown' as const,
        summary: 'Unable to check availability',
        registerURL: `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain.replace('.', '%2E')}`
      }));
    }

    const data: DomainrResponse = await response.json();
    
    return data.status.map(item => {
      let status: 'available' | 'taken' | 'unknown' = 'unknown';
      
      // Parse Domainr status
      if (item.summary === 'inactive' || item.status === 'available') {
        status = 'available';
      } else if (item.summary === 'active' || item.status === 'taken' || item.status === 'registered') {
        status = 'taken';
      }

      return {
        domain: item.domain,
        status,
        summary: item.summary,
        registerURL: item.registerURL || `https://www.godaddy.com/domainsearch/find?domainToCheck=${item.domain.replace('.', '%2E')}`,
        price: item.price ? `$${item.price}` : undefined,
        currency: item.currency
      };
    });

  } catch (error) {
    console.error('Error checking domain availability:', error);
    
    // Return fallback with GoDaddy links
    return domains.map(domain => ({
      domain,
      status: 'unknown' as const,
      summary: 'Unable to check availability',
      registerURL: `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain.replace('.', '%2E')}`
    }));
  }
}

/**
 * Check single domain availability (convenience function)
 * @param domain Single domain name to check
 * @returns Domain status object with purchase link
 */
export async function checkSingleDomain(domain: string): Promise<DomainrStatus> {
  const results = await checkDomainAvailability([domain]);
  return results[0];
} 