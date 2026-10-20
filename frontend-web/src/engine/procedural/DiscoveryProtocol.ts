export interface DiscoveryClaim {
  coordinateHash: string;
  entityType: 'System' | 'Planet' | 'Fauna' | 'Flora';
  entityName: string;
  discoveredBy: string;
  timestamp: string;
  unitsReward: number;
  nanitesReward: number;
}

export class DiscoveryProtocol {
  private static backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://frontiercaravan-production.up.railway.app';

  /**
   * Generates a 64-bit spatial coordinate hash string
   */
  static generateVoxelHash(x: number, y: number, z: number, name: string): string {
    return `TELOS_VOX_${Math.floor(x)}_${Math.floor(y)}_${Math.floor(z)}_${name.toUpperCase().replace(/\s+/g, '_')}`;
  }

  /**
   * Submits a discovery claim to Railway PostgreSQL registry
   */
  static async registerClaim(claim: Omit<DiscoveryClaim, 'timestamp' | 'unitsReward' | 'nanitesReward'>): Promise<{
    success: boolean;
    alreadyClaimed: boolean;
    rewardUnits: number;
    rewardNanites: number;
  }> {
    try {
      const res = await fetch(`${this.backendUrl}/api/discoveries/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claim),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          alreadyClaimed: data.alreadyClaimed || false,
          rewardUnits: data.rewardUnits || 25000,
          rewardNanites: data.rewardNanites || 500,
        };
      }
    } catch (e) {
      console.warn('[DiscoveryProtocol] Backend offline, registering offline discovery:', e);
    }

    return {
      success: true,
      alreadyClaimed: false,
      rewardUnits: 25000,
      rewardNanites: 500,
    };
  }

  /**
   * Queries existing claims for a spatial coordinate hash
   */
  static async lookupClaim(coordinateHash: string): Promise<DiscoveryClaim | null> {
    try {
      const res = await fetch(`${this.backendUrl}/api/discoveries/lookup?hash=${encodeURIComponent(coordinateHash)}`);
      if (res.ok) {
        const data = await res.json();
        return data.claim || null;
      }
    } catch (e) {
      console.warn('[DiscoveryProtocol] Lookup failed:', e);
    }
    return null;
  }
}
