// Teste da API SpotSaver
const API_BASE = 'http://localhost:3000/api/spotify';

async function testAPI() {
  console.log('🎵 Testando API SpotSaver...\n');

  // Teste 1: Buscar música atual
  console.log('1️⃣ Testando busca da música atual:');
  try {
    const response = await fetch(`${API_BASE}/canvas`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Sucesso!');
      console.log('Música:', data.track?.name || 'N/A');
      console.log('Artista:', data.track?.artists?.[0]?.name || 'N/A');
      console.log('Canvas encontrados:', data.canvas?.canvasesList?.length || 0);
    } else {
      console.log('❌ Erro:', data.error);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 2: Buscar por Track ID específico
  console.log('2️⃣ Testando busca por Track ID específico:');
  const trackId = '4lILbjkdIihRgg3Z1QP5Qh'; // Exemplo
  try {
    const response = await fetch(`${API_BASE}/canvas?trackUri=spotify:track:${trackId}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Sucesso!');
      console.log('Track ID:', trackId);
      console.log('Canvas encontrados:', data.canvas?.canvasesList?.length || 0);
      
      if (data.canvas?.canvasesList?.length > 0) {
        console.log('URL do Canvas:', data.canvas.canvasesList[0].canvasUrl);
      }
    } else {
      console.log('❌ Erro:', data.error);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 3: Verificar token
  console.log('3️⃣ Testando endpoint de token:');
  try {
    const response = await fetch(`${API_BASE}/token`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Token disponível!');
      console.log('Token (primeiros 10 chars):', data.accessToken?.substring(0, 10) + '...');
    } else {
      console.log('❌ Erro:', data.error);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
}

// Executar teste
testAPI(); 