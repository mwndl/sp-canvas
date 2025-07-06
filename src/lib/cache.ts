interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  originalData?: any; // Para dados que precisam de compensação de tempo
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class SpotifyCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private readonly DEFAULT_TTL = 5000; // 5 segundos por padrão

  // Limpar cache expirado
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }

    // Limpar requisições pendentes antigas (mais de 30 segundos)
    for (const [key, pending] of this.pendingRequests.entries()) {
      if (now - pending.timestamp > 30000) {
        this.pendingRequests.delete(key);
      }
    }
  }

  // Obter dados do cache
  get<T>(key: string): T | null {
    this.cleanup();
    
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Se for player progress, compensar o tempo passado
    if (key === CACHE_KEYS.PLAYER_PROGRESS() && entry.originalData) {
      const timePassed = now - entry.timestamp;
      const originalProgress = entry.originalData.progress;
      const compensatedProgress = originalProgress + timePassed;
      
      // Log para debug
      console.log(`⏰ Cache Progress Compensation:`, {
        original: Math.round(originalProgress / 1000),
        timePassed: Math.round(timePassed / 1000),
        compensated: Math.round(compensatedProgress / 1000),
        cacheAge: Math.round((now - entry.timestamp) / 1000)
      });
      
      const compensatedData = {
        ...entry.data,
        progress: compensatedProgress,
        timestamp: now
      };
      return compensatedData as T;
    }

    return entry.data as T;
  }

  // Definir dados no cache
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    
    // Para player progress, guardar dados originais para compensação
    const originalData = key === CACHE_KEYS.PLAYER_PROGRESS() ? { ...data } : undefined;
    
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      originalData
    });
  }

  // Verificar se há uma requisição pendente
  hasPendingRequest(key: string): boolean {
    this.cleanup();
    return this.pendingRequests.has(key);
  }

  // Adicionar requisição pendente
  addPendingRequest<T>(key: string, promise: Promise<T>): void {
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });
  }

  // Obter requisição pendente
  getPendingRequest<T>(key: string): Promise<T> | null {
    this.cleanup();
    const pending = this.pendingRequests.get(key);
    return pending ? pending.promise : null;
  }

  // Remover requisição pendente
  removePendingRequest(key: string): void {
    this.pendingRequests.delete(key);
  }

  // Executar função com cache e deduplicação
  async executeWithCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Verificar cache primeiro
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Verificar se há requisição pendente
    const pending = this.getPendingRequest<T>(key);
    if (pending) {
      return pending;
    }

    // Criar nova requisição
    const promise = fn().then(result => {
      this.set(key, result, ttl);
      this.removePendingRequest(key);
      return result;
    }).catch(error => {
      this.removePendingRequest(key);
      throw error;
    });

    this.addPendingRequest(key, promise);
    return promise;
  }

  // Limpar cache específico
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    } else {
      this.cache.clear();
      this.pendingRequests.clear();
    }
  }

  // Obter estatísticas do cache
  getStats() {
    this.cleanup();
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      totalEntries: this.cache.size + this.pendingRequests.size
    };
  }
}

// Instância global do cache
export const spotifyCache = new SpotifyCache();

// Chaves de cache para diferentes tipos de dados
export const CACHE_KEYS = {
  CANVAS: (trackId: string) => `canvas:${trackId}`,
  LYRICS: (trackId: string) => `lyrics:${trackId}`,
  PLAYER_PROGRESS: () => 'player:progress',
  CURRENT_TRACK: () => 'player:current-track',
  CLIENT_TOKEN: () => 'auth:client-token'
} as const;

// TTLs específicos para diferentes tipos de dados
export const CACHE_TTLS = {
  CANVAS: 30000, // 30 segundos (Canvas não muda durante a música)
  LYRICS: 60000, // 1 minuto (Letras não mudam)
  PLAYER_PROGRESS: 2000, // 2 segundos (Progresso muda rapidamente)
  CURRENT_TRACK: 5000, // 5 segundos (Música pode mudar)
  CLIENT_TOKEN: 3600000 // 1 hora (Token é válido por 1 hora)
} as const; 