# End-of-Track Polling Feature

## Visão Geral

Esta feature implementa um sistema inteligente de pooling que detecta quando uma música está próxima do fim e agenda uma verificação automática do player do Spotify para atualizar as interfaces imediatamente após o término da música.

## Como Funciona

### 1. Detecção de Progresso da Música
- O sistema monitora constantemente o progresso da música em reprodução
- Quando a música atinge 95% da sua duração total, o sistema agenda uma verificação

### 2. Agendamento Inteligente
- Calcula o tempo restante até o fim da música: `duration - progress`
- Adiciona um buffer de 2 segundos para garantir que a música realmente acabou
- Agenda uma verificação do player para esse momento específico

### 3. Atualização das Interfaces
- Quando a verificação é executada, detecta se:
  - A música mudou para uma nova faixa
  - A reprodução parou
  - A música continua (caso raro de música muito longa)
- Atualiza automaticamente o Canvas e outras interfaces

## Benefícios

### Performance
- **Redução de Latência**: Atualização imediata após o fim da música
- **Menos Requisições**: Pooling inteligente apenas quando necessário
- **Sincronização Precisa**: Buffer de 2s garante que a música realmente acabou

### Experiência do Usuário
- **Transições Suaves**: Mudança automática de música sem delays
- **Interface Responsiva**: Atualização em tempo real
- **Detecção Confiável**: Funciona mesmo com músicas de duração variada

## Implementação Técnica

### Hook: `usePlayerProgress`
```typescript
// Função principal de agendamento
const scheduleEndOfTrackPolling = (progress: PlayerProgress) => {
  const remainingTime = progress.duration - progress.progress;
  const timeoutDelay = remainingTime + 2000; // Buffer de 2s
  
  endOfTrackTimeoutRef.current = setTimeout(() => {
    fetchPlayerProgress(); // Verificação automática
  }, timeoutDelay);
};
```

### Integração com Canvas
- O hook `useCanvasFetch` reage às mudanças detectadas pelo player progress
- Atualização automática do Canvas quando uma nova música é detectada
- Logs detalhados para debugging

## Configuração

### Parâmetros Ajustáveis
- **Buffer de Tempo**: 2 segundos (configurável)
- **Threshold de Detecção**: 95% da duração da música
- **Intervalo de Pooling Regular**: 5 segundos (fallback)

### Debug Mode
Quando ativado, mostra logs detalhados:
```
[SCHEDULE] Scheduling end-of-track polling in 127s (track ends in 125s)
[POLL] Track should have ended, fetching new player progress
[INFO] Track changed detected via player progress: old_id -> new_id
```

## Casos de Uso

### 1. Música Normal
- Música de 3:30 → Pooling agendado para 3:32
- Atualização imediata para próxima música

### 2. Música Pausada
- Sistema detecta que não está tocando
- Não agenda pooling desnecessário

### 3. Música Muito Longa
- Pooling regular (5s) como fallback
- Sistema continua funcionando normalmente

### 4. Múltiplas Músicas
- Cada música agenda seu próprio pooling
- Timeouts são limpos automaticamente

## Monitoramento

### Logs de Debug
- `SCHEDULE`: Quando o pooling é agendado
- `POLL`: Quando a verificação é executada
- `INFO`: Mudanças de música detectadas
- `WARNING`: Rate limits e outros avisos

### Métricas
- Tempo de resposta após fim da música
- Taxa de sucesso na detecção de mudanças
- Uso de recursos (requisições à API)

## Compatibilidade

- ✅ Funciona com todas as durações de música
- ✅ Compatível com playlists e reprodução aleatória
- ✅ Respeita rate limits da API do Spotify
- ✅ Fallback para pooling regular em caso de falha 