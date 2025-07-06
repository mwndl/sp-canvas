# Sistema de Cache - SpCanvas

## Visão Geral

O sistema de cache foi implementado para otimizar as requisições ao Spotify, evitando múltiplas chamadas simultâneas para os mesmos dados. Isso é especialmente útil quando você tem múltiplos painéis smart home fazendo requisições simultâneas.

## Como Funciona

### 1. Cache Inteligente
- **Deduplicação**: Se múltiplas abas fazem requisições simultâneas para os mesmos dados, apenas uma requisição é feita ao Spotify
- **TTL (Time To Live)**: Cada tipo de dado tem um tempo de vida específico no cache
- **Limpeza Automática**: Cache expirado é removido automaticamente
- **Compensação de Tempo**: Para player progress, o tempo passado é compensado automaticamente

### 2. Compensação de Tempo (Player Progress)

O sistema de cache inclui compensação inteligente de tempo para o player progress:

```typescript
// Exemplo: Cache criado às 10:00:00 com progress = 30s
// Às 10:00:03, uma nova requisição busca o cache
// O sistema retorna: progress = 30s + 3s = 33s
```

**Como funciona:**
1. Quando o cache é criado, guardamos o progresso original e timestamp
2. Quando o cache é acessado, calculamos quanto tempo passou
3. Adicionamos esse tempo ao progresso original
4. Retornamos o progresso compensado

**Benefícios:**
- ✅ Letras sincronizadas mesmo com cache
- ✅ Sem delay na sincronização
- ✅ Mantém precisão temporal
- ✅ Reduz requisições ao Spotify

### 3. Tipos de Cache

| Tipo | TTL | Compensação | Descrição |
|------|-----|-------------|-----------|
| Canvas | 30s | ❌ | Canvas de uma música específica |
| Lyrics | 60s | ❌ | Letras de uma música |
| Player Progress | 2s | ✅ | Progresso atual do player (com compensação) |
| Current Track | 5s | ❌ | Música atual |
| Client Token | 1h | ❌ | Token de autenticação |

### 4. APIs com Cache

- `/api/spotify/canvas` - Canvas de músicas
- `/api/spotify/lyrics` - Letras sincronizadas
- `/api/spotify/player-progress` - Progresso do player (com compensação)
- `/api/spotify/client-token` - Token de cliente

## Benefícios

### Antes (Sem Cache)
```
Aba 1 → API → Spotify (Canvas)
Aba 2 → API → Spotify (Canvas)     ← Requisições duplicadas
Aba 3 → API → Spotify (Canvas)
Aba 4 → API → Spotify (Canvas)
Aba 5 → API → Spotify (Canvas)
```

### Depois (Com Cache)
```
Aba 1 → API → Spotify (Canvas) ← Apenas 1 requisição
Aba 2 → API → Cache (Canvas)
Aba 3 → API → Cache (Canvas)   ← Dados do cache
Aba 4 → API → Cache (Canvas)
Aba 5 → API → Cache (Canvas)
```

### Compensação de Tempo
```
Cache criado: progress = 30s, timestamp = 10:00:00
Cache acessado: timestamp = 10:00:03 (3s depois)
Retornado: progress = 30s + 3s = 33s ✅
```

## Funcionalidades

### 1. Forçar Refresh
Adicione `?forceRefresh=true` na URL para forçar uma nova requisição:
```
/api/spotify/canvas?trackUri=spotify:track:123&forceRefresh=true
```

### 2. Debug do Cache
Em modo debug, um painel mostra estatísticas do cache:
- Número de entradas no cache
- Requisições pendentes
- Botões para limpar cache

### 3. API de Gerenciamento
- `GET /api/cache` - Ver estatísticas
- `POST /api/cache/clear` - Limpar cache (todo ou específico)

### 4. Logs de Compensação
O sistema gera logs detalhados sobre compensação de tempo:
```
⏰ Cache Progress Compensation: {
  original: 30,
  timePassed: 3,
  compensated: 33,
  cacheAge: 3
}
```

## Configuração

### TTLs Personalizáveis
Os TTLs podem ser ajustados em `src/lib/cache.ts`:

```typescript
export const CACHE_TTLS = {
  CANVAS: 30000,        // 30 segundos
  LYRICS: 60000,        // 1 minuto
  PLAYER_PROGRESS: 2000, // 2 segundos (com compensação)
  CURRENT_TRACK: 5000,   // 5 segundos
  CLIENT_TOKEN: 3600000  // 1 hora
};
```

### Limpeza Automática
- Cache expirado é removido automaticamente
- Requisições pendentes antigas (>30s) são limpas
- Limpeza acontece a cada acesso ao cache

## Monitoramento

### Logs
O sistema gera logs detalhados:
- `🔄` - Nova requisição ao Spotify
- `🧹` - Cache limpo
- `📊` - Estatísticas do cache
- `⏰` - Compensação de tempo

### Debug Panel
Em modo debug, você pode:
- Ver estatísticas em tempo real
- Limpar cache manualmente
- Monitorar requisições pendentes
- Ver compensação de tempo em ação

## Exemplo de Uso

```typescript
// Buscar Canvas com cache
const response = await fetch('/api/spotify/canvas?trackUri=spotify:track:123');

// Forçar refresh
const response = await fetch('/api/spotify/canvas?trackUri=spotify:track:123&forceRefresh=true');

// Ver estatísticas do cache
const stats = await fetch('/api/cache').then(r => r.json());

// Limpar cache específico
await fetch('/api/cache/clear', {
  method: 'POST',
  body: JSON.stringify({ key: 'canvas:123' })
});
```

## Performance

### Redução de Requisições
- **90%+ de redução** em requisições ao Spotify
- **Latência reduzida** para dados em cache
- **Menor chance** de rate limits

### Compensação de Tempo
- **Sincronização precisa** das letras
- **Sem delay** na reprodução
- **Estimação em tempo real** do progresso

### Uso de Memória
- Cache em memória (não persistente)
- Limpeza automática previne vazamentos
- Tamanho controlado por TTLs

## Troubleshooting

### Cache não atualiza
1. Use `?forceRefresh=true`
2. Aguarde o TTL expirar
3. Limpe o cache manualmente

### Muitas requisições pendentes
1. Verifique se há erros de rede
2. Ajuste TTLs se necessário
3. Monitore logs do servidor

### Letras dessincronizadas
1. Verifique logs de compensação de tempo
2. Ajuste TTL do player progress se necessário
3. Monitore se a compensação está funcionando

### Debug
1. Ative modo debug na URL
2. Use o Cache Debug Panel
3. Verifique logs do console
4. Monitore logs de compensação de tempo 