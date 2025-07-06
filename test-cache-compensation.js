// Teste para verificar a compensação de tempo do cache
const { spotifyCache, CACHE_KEYS, CACHE_TTLS } = require('./src/lib/cache.ts');

console.log('🧪 Testando compensação de tempo do cache...\n');

// Simular dados do player progress
const mockPlayerData = {
  isPlaying: true,
  progress: 30000, // 30 segundos
  trackId: 'test123',
  duration: 180000, // 3 minutos
  timestamp: Date.now()
};

// Simular cache com dados antigos (5 segundos atrás)
const oldTimestamp = Date.now() - 5000; // 5 segundos atrás
const oldPlayerData = {
  ...mockPlayerData,
  progress: 25000, // 25 segundos (5 segundos atrás)
  timestamp: oldTimestamp
};

console.log('📊 Dados originais:', {
  progress: oldPlayerData.progress / 1000 + 's',
  timestamp: new Date(oldPlayerData.timestamp).toLocaleTimeString(),
  age: Math.round((Date.now() - oldPlayerData.timestamp) / 1000) + 's'
});

// Simular entrada no cache
spotifyCache.set(CACHE_KEYS.PLAYER_PROGRESS(), oldPlayerData, CACHE_TTLS.PLAYER_PROGRESS);

// Aguardar 2 segundos para simular tempo passado
setTimeout(() => {
  console.log('\n⏰ Após 2 segundos...');
  
  // Buscar dados do cache (deve compensar o tempo)
  const compensatedData = spotifyCache.get(CACHE_KEYS.PLAYER_PROGRESS());
  
  if (compensatedData) {
    console.log('✅ Dados compensados:', {
      progress: Math.round(compensatedData.progress / 1000) + 's',
      timestamp: new Date(compensatedData.timestamp).toLocaleTimeString(),
      compensation: Math.round((compensatedData.progress - oldPlayerData.progress) / 1000) + 's'
    });
    
    const expectedProgress = oldPlayerData.progress + 2000; // +2 segundos
    const actualProgress = compensatedData.progress;
    const difference = Math.abs(actualProgress - expectedProgress);
    
    console.log(`\n🎯 Teste: ${difference < 100 ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`   Esperado: ${Math.round(expectedProgress / 1000)}s`);
    console.log(`   Obtido: ${Math.round(actualProgress / 1000)}s`);
    console.log(`   Diferença: ${Math.round(difference / 1000)}s`);
  } else {
    console.log('❌ Nenhum dado encontrado no cache');
  }
  
  // Limpar cache
  spotifyCache.clear();
  console.log('\n🧹 Cache limpo');
  
}, 2000); 