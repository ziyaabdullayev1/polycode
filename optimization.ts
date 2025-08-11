import { createHash } from 'crypto';

interface CacheEntry {
  result: any;
  timestamp: number;
  hitCount: number;
  originalCode: string;
}

class SmartExecutionCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 dakika (mülakatlar için uygun)
  private readonly MAX_SIZE = 1000;

  // Kodu normalizasyonu
  private normalizeCode(code: string): string {
    return code
      .replace(/\/\/.*$/gm, '') // Tek satır yorumları kaldır
      .replace(/\/\*[\s\S]*?\*\//g, '') // Çok satır yorumları kaldır
      .replace(/\s+/g, ' ') // Birden fazla boşluğu tek boşluğa çevir
      .trim();
  }

  private generateKey(code: string, language: string, input: string): string {
    const normalizedCode = this.normalizeCode(code);
    return createHash('sha256')
      .update(`${language}:${normalizedCode}:${input}`)
      .digest('hex');
  }

  get(code: string, language: string, input: string): any | null {
    const key = this.generateKey(code, language, input);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // TTL kontrolü
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hitCount++;
    console.log(`📋 Önbellek İsabeti! Kod çalıştırma süresi: ~0ms`);
    
    return {
      ...entry.result,
      cached: true,
      cacheHitCount: entry.hitCount
    };
  }

  set(code: string, language: string, input: string, result: any): void {
    // Önbellek boyutu kontrolü
    if (this.cache.size >= this.MAX_SIZE) {
      this.cleanup();
    }
    
    const key = this.generateKey(code, language, input);
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      hitCount: 1,
      originalCode: code
    });
    
    console.log(` Sonuç önbelleğe kaydedildi: ${language}`);
  }

  private cleanup(): void {
    // En az kullanılan %25'ini temizle
    const entries = Array.from(this.cache.entries())
      .sort(([,a], [,b]) => a.hitCount - b.hitCount);
    
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    console.log(`🧹 ${toRemove} önbellek girdisi temizlendi`);
  }

  // İstatistikler
  getStats() {
    const totalHits = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.hitCount, 0);
    
    return {
      cacheSize: this.cache.size,
      totalHits,
      averageHitsPerEntry: totalHits / Math.max(this.cache.size, 1),
      oldestEntry: Math.min(...Array.from(this.cache.values()).map(e => e.timestamp))
    };
  }

  // Önbelleği temizle (yeni mülakat için)
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Önbellek tamamen temizlendi');
  }
}

export const smartCache = new SmartExecutionCache();