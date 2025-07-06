'use client';

import { type Language } from '../lib/i18n';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function HowToUseModal({ isOpen, onClose, language }: HowToUseModalProps) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {language === 'pt' ? 'Como Usar o SpotSaver' : 'How to Use SpotSaver'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-6 text-gray-300">
            {/* Configuração Inicial */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {language === 'pt' ? '1. Configuração Inicial' : '1. Initial Setup'}
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <p>
                  {language === 'pt' 
                    ? 'Para que o SpotSaver funcione, você precisa configurar uma variável de ambiente com seu cookie sp_dc do Spotify:'
                    : 'For SpotSaver to work, you need to configure an environment variable with your Spotify sp_dc cookie:'
                  }
                </p>
                <div className="bg-gray-900 rounded p-3 font-mono text-sm">
                  <code className="text-green-400">SPOTIFY_SP_DC=seu_cookie_sp_dc_aqui</code>
                </div>
                <p className="text-sm text-gray-400">
                  {language === 'pt'
                    ? 'Adicione esta variável ao seu arquivo .env ou configure no seu servidor de hospedagem.'
                    : 'Add this variable to your .env file or configure it on your hosting server.'
                  }
                </p>
              </div>
            </div>

            {/* Como obter o sp_dc */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {language === 'pt' ? '2. Como obter o sp_dc' : '2. How to get sp_dc'}
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    {language === 'pt'
                      ? 'Abra o Spotify Web Player (open.spotify.com)'
                      : 'Open Spotify Web Player (open.spotify.com)'
                    }
                  </li>
                  <li>
                    {language === 'pt'
                      ? 'Faça login na sua conta do Spotify'
                      : 'Log in to your Spotify account'
                    }
                  </li>
                  <li>
                    {language === 'pt'
                      ? 'Abra as Ferramentas do Desenvolvedor (F12)'
                      : 'Open Developer Tools (F12)'
                    }
                  </li>
                  <li>
                    {language === 'pt'
                      ? 'Vá para a aba Application/Storage → Cookies → https://open.spotify.com'
                      : 'Go to Application/Storage tab → Cookies → https://open.spotify.com'
                    }
                  </li>
                  <li>
                    {language === 'pt'
                      ? 'Procure pelo cookie "sp_dc" e copie seu valor'
                      : 'Look for the "sp_dc" cookie and copy its value'
                    }
                  </li>
                </ol>
              </div>
            </div>

            {/* Como usar */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {language === 'pt' ? '3. Como usar' : '3. How to use'}
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    {language === 'pt' ? 'Modo Padrão:' : 'Standard Mode:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? 'Exibe o Canvas do Spotify da música atual com letras sincronizadas e informações da faixa. Ideal para acompanhar a música que está tocando.'
                      : 'Displays the Spotify Canvas of the current song with synchronized lyrics and track information. Perfect for following along with the music.'
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    {language === 'pt' ? 'Modo Screen Saver:' : 'Screen Saver Mode:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? 'Exibe capas de álbum, relógio ou ambos com animações de movimento. Quando não há música tocando, automaticamente mostra o relógio.'
                      : 'Displays album covers, clock, or both with movement animations. When no music is playing, automatically shows the clock.'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    {language === 'pt' ? 'Detecção de Música:' : 'Music Detection:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? '• Automática: Detecta automaticamente a música que está tocando no Spotify\n• Específica: Insira o Track ID de uma música específica. Encontre o ID na URL: spotify.com/track/[ID]'
                      : '• Auto: Automatically detects the music playing on Spotify\n• Specific: Enter a specific track ID. Find the ID in the URL: spotify.com/track/[ID]'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Configurações */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {language === 'pt' ? '4. Configurações' : '4. Settings'}
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    {language === 'pt' ? 'Modo Padrão:' : 'Standard Mode:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? '• Canvas: Exibir Canvas do Spotify quando disponível\n• Informações da faixa: Mostrar título, artista e álbum sobrepostos\n• Letras: Mostrar letras sincronizadas da música\n• Modos de letra: 5 linhas centralizadas ou alinhadas à esquerda\n• Detecção: Automática ou faixa específica'
                      : '• Canvas: Display Spotify Canvas when available\n• Track Info: Show title, artist and album overlaid\n• Lyrics: Show synchronized song lyrics\n• Lyrics Modes: 5 lines centered or left-aligned\n• Detection: Auto or specific track'
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    {language === 'pt' ? 'Modo Screen Saver:' : 'Screen Saver Mode:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? '• Exibição: Capas de álbum (2 estilos), relógio, ou ambos\n• Relógio: Formato 12h/24h, fuso horário, data opcional\n• Movimento: Fade in/out suave ou animação DVD\n• Fallback: Relógio quando não há música tocando'
                      : '• Display: Album covers (2 styles), clock, or both\n• Clock: 12h/24h format, timezone, optional date\n• Movement: Smooth fade in/out or DVD animation\n• Fallback: Clock when no music is playing'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Controles */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {language === 'pt' ? '5. Controles' : '5. Controls'}
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    {language === 'pt' ? 'Navegação:' : 'Navigation:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? '• ESC: Sair do screensaver e voltar à tela de configurações\n• Mouse: Clique para sair (quando disponível)'
                      : '• ESC: Exit screensaver and return to settings screen\n• Mouse: Click to exit (when available)'
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    {language === 'pt' ? 'Modo Padrão:' : 'Standard Mode:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? '• Canvas: Reproduz automaticamente quando disponível\n• Letras: Sincronizadas com o progresso da música\n• Fallback: Capa do álbum quando não há Canvas'
                      : '• Canvas: Automatically plays when available\n• Lyrics: Synchronized with music progress\n• Fallback: Album cover when no Canvas available'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    {language === 'pt' ? 'Modo Screen Saver:' : 'Screen Saver Mode:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? '• Movimento: Contínuo com animações suaves\n• Transições: Automáticas entre capas e relógio\n• Fallback: Relógio quando não há música tocando'
                      : '• Movement: Continuous with smooth animations\n• Transitions: Automatic between covers and clock\n• Fallback: Clock when no music is playing'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Query Parameters */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {language === 'pt' ? '6. Parâmetros de URL' : '6. URL Parameters'}
              </h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <p className="text-sm">
                  {language === 'pt'
                    ? 'Você pode personalizar o comportamento usando parâmetros na URL:'
                    : 'You can customize behavior using URL parameters:'
                  }
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-sm">
                    {language === 'pt' ? 'Modo Padrão:' : 'Standard Mode:'}
                  </h4>
                  <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-1">
                    <div><code className="text-blue-400">showCanvas=true/false</code> - {language === 'pt' ? 'Mostrar Canvas' : 'Show Canvas'}</div>
                    <div><code className="text-blue-400">showLyrics=true/false</code> - {language === 'pt' ? 'Mostrar letras' : 'Show lyrics'}</div>
                    <div><code className="text-blue-400">lyricsMode=5lines/left</code> - {language === 'pt' ? 'Modo de letras' : 'Lyrics mode'}</div>
                    <div><code className="text-blue-400">searchMode=auto/specific</code> - {language === 'pt' ? 'Detecção de música' : 'Music detection'}</div>
                    <div><code className="text-blue-400">trackId=ID_DA_FAIXA</code> - {language === 'pt' ? 'ID específico da faixa' : 'Specific track ID'}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-sm">
                    {language === 'pt' ? 'Modo Screen Saver:' : 'Screen Saver Mode:'}
                  </h4>
                  <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-1">
                    <div><code className="text-green-400">displayMode=album1/album2/clock</code> - {language === 'pt' ? 'Modo de exibição' : 'Display mode'}</div>
                    <div><code className="text-green-400">clockFormat=12h/24h</code> - {language === 'pt' ? 'Formato do relógio' : 'Clock format'}</div>
                    <div><code className="text-green-400">movementMode=fade/dvd</code> - {language === 'pt' ? 'Modo de movimento' : 'Movement mode'}</div>
                    <div><code className="text-green-400">fadeSpeed=5-60</code> - {language === 'pt' ? 'Velocidade do fade (segundos)' : 'Fade speed (seconds)'}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-sm">
                    {language === 'pt' ? 'Geral:' : 'General:'}
                  </h4>
                  <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-1">
                    <div><code className="text-yellow-400">mode=standard/screensaver</code> - {language === 'pt' ? 'Modo de operação' : 'Operation mode'}</div>
                    <div><code className="text-yellow-400">lang=en/pt</code> - {language === 'pt' ? 'Idioma' : 'Language'}</div>
                    <div><code className="text-yellow-400">debug=true/false</code> - {language === 'pt' ? 'Modo debug' : 'Debug mode'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {language === 'pt' ? 'Fechar' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 