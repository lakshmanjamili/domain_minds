// GoDaddy API integration for real-time domain availability checking
export interface GoDaddyDomainStatus {
  domain: string;
  status: 'available' | 'taken' | 'unknown';
  price?: number;
  currency?: string;
  period?: number;
  registerURL: string;
  summary: string;
}

export interface GoDaddyAvailabilityResponse {
  domain: string;
  available: boolean;
  price?: number;
  currency?: string;
  period?: number;
}

/**
 * Check domain availability using GoDaddy API
 * @param domains Array of domain names to check
 * @returns Array of domain status objects with pricing and purchase links
 */
export async function checkDomainsWithGoDaddy(domains: string[]): Promise<GoDaddyDomainStatus[]> {
  try {
    console.log('🔍 GoDaddy API: Checking availability for', domains.length, 'domains');
    
    const results: GoDaddyDomainStatus[] = [];
    
    for (const domain of domains) {
      try {
        // Clean domain format for GoDaddy API
        const cleanDomain = domain.toLowerCase().trim();
        
        // Use the correct GoDaddy API endpoint for domain availability
        const response = await fetch(`https://api.godaddy.com/v1/domains/available?domain=${cleanDomain}`, {
          method: 'GET',
          headers: {
            'Authorization': `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data: GoDaddyAvailabilityResponse = await response.json();
          
          results.push({
            domain: domain,
            status: data.available ? 'available' : 'taken',
            price: data.price,
            currency: data.currency || 'USD',
            period: data.period || 1,
            registerURL: `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
            summary: data.available ? 'Available for registration on GoDaddy' : 'Already registered'
          });
          
          console.log(`✅ ${domain}: ${data.available ? 'Available' : 'Taken'}`);
        } else {
          console.warn(`GoDaddy API ${response.status} for ${domain}, using DNS fallback`);
          // Use DNS fallback for this domain
          const dnsResult = await checkSingleDomainWithDNS(domain);
          results.push(dnsResult);
        }
      } catch (error) {
        console.warn(`Error checking ${domain}:`, error);
        // Use DNS fallback for this domain
        const dnsResult = await checkSingleDomainWithDNS(domain);
        results.push(dnsResult);
      }
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    console.log('✅ GoDaddy API: Completed availability check');
    return results;

  } catch (error) {
    console.error('GoDaddy API Error:', error);
    
    // Return DNS-based results for all domains
    return await checkDomainsWithDNS(domains);
  }
}

/**
 * Check single domain with DNS (helper function)
 */
async function checkSingleDomainWithDNS(domain: string): Promise<GoDaddyDomainStatus> {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      const hasRecords = data.Answer && data.Answer.length > 0;
      
      return {
        domain: domain,
        status: hasRecords ? 'taken' : 'available',
        registerURL: `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
        summary: hasRecords ? 'Domain has DNS records (likely taken)' : 'No DNS records found (likely available)',
        currency: 'USD'
      };
    }
  } catch (error) {
    console.warn(`DNS check failed for ${domain}:`, error);
  }
  
  return createFallbackStatus(domain);
}

/**
 * Alternative method using GoDaddy domain search API (more lenient rate limits)
 */
export async function checkDomainsWithGoDaddySearch(domains: string[]): Promise<GoDaddyDomainStatus[]> {
  try {
    console.log('🔍 GoDaddy Search API: Checking availability for', domains.length, 'domains');
    
    const results: GoDaddyDomainStatus[] = [];
    
    for (const domain of domains) {
      try {
        // Use the domain search endpoint which is more permissive
        const response = await fetch(`https://api.godaddy.com/v1/domains/suggest?query=${domain.split('.')[0]}&country=US&city=&sources=CC&tlds=${domain.split('.')[1]}&lengthMax=25&lengthMin=1&limit=1&waitMs=1000`, {
          method: 'GET',
          headers: {
            'Authorization': `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const suggestions = await response.json();
          const exactMatch = suggestions.find((s: any) => s.domain === domain);
          
          if (exactMatch) {
            results.push({
              domain: domain,
              status: exactMatch.available ? 'available' : 'taken',
              price: exactMatch.price / 1000000, // GoDaddy returns price in microdollars
              currency: 'USD',
              period: 1,
              registerURL: `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
              summary: exactMatch.available ? 'Available for registration' : 'Already registered'
            });
          } else {
            results.push(createFallbackStatus(domain));
          }
        } else {
          results.push(createFallbackStatus(domain));
        }
      } catch (error) {
        console.warn(`Error checking ${domain} with search API:`, error);
        results.push(createFallbackStatus(domain));
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return results;
  } catch (error) {
    console.error('GoDaddy Search API Error:', error);
    return domains.map(createFallbackStatus);
  }
}

/**
 * Fastest method: Use a combination of DNS lookup and GoDaddy links
 * This doesn't require API keys but provides good UX
 */
export async function checkDomainsWithDNS(domains: string[]): Promise<GoDaddyDomainStatus[]> {
  console.log('🔍 DNS-based availability check for', domains.length, 'domains');
  
  const results: GoDaddyDomainStatus[] = [];
  
  for (const domain of domains) {
    try {
      // Simple heuristic: check if domain resolves
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const hasRecords = data.Answer && data.Answer.length > 0;
        
        results.push({
          domain: domain,
          status: hasRecords ? 'taken' : 'available',
          registerURL: `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
          summary: hasRecords ? 'Domain appears to be registered (has DNS records)' : 'Domain appears available (no DNS records found)',
          currency: 'USD'
        });
      } else {
        results.push(createFallbackStatus(domain));
      }
    } catch (error) {
      console.warn(`DNS check failed for ${domain}:`, error);
      results.push(createFallbackStatus(domain));
    }
  }
  
  console.log('✅ DNS-based check completed');
  return results;
}

/**
 * Creates fallback status when API calls fail
 */
function createFallbackStatus(domain: string): GoDaddyDomainStatus {
  return {
    domain: domain,
    status: 'unknown',
    registerURL: `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
    summary: 'Click to check availability on GoDaddy',
    currency: 'USD'
  };
}

/**
 * Main function that tries multiple methods with fallbacks
 */
export async function checkDomainAvailabilityWithGoDaddy(domains: string[]): Promise<GoDaddyDomainStatus[]> {
  // Try methods in order of preference
  try {
    // Method 1: Direct GoDaddy API (most accurate)
    if (process.env.GODADDY_API_KEY && process.env.GODADDY_API_SECRET) {
      console.log('🎯 Using GoDaddy API with credentials');
      return await checkDomainsWithGoDaddy(domains);
    }
    
    // Method 2: DNS-based check (no API key needed)
    console.log('🎯 Using DNS-based availability check');
    return await checkDomainsWithDNS(domains);
    
  } catch (error) {
    console.error('All domain checking methods failed:', error);
    return domains.map(createFallbackStatus);
  }
} 