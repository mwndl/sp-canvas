'use client';

import { useState } from 'react';
import { getTranslation, type Language } from '../lib/i18n';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function HowToUseModal({ isOpen, onClose, language }: HowToUseModalProps) {
  const t = getTranslation(language);

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
                    {language === 'pt' ? 'Modo Automático:' : 'Auto Mode:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? 'O SpotSaver detecta automaticamente a música que está tocando no Spotify e exibe o Canvas correspondente.'
                      : 'SpotSaver automatically detects the music playing on Spotify and displays the corresponding Canvas.'
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    {language === 'pt' ? 'Modo Específico:' : 'Specific Mode:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? 'Insira o Track ID de uma música específica para exibir seu Canvas. Encontre o Track ID na URL do Spotify: spotify.com/track/[ID]'
                      : 'Enter a specific track ID to display its Canvas. Find the Track ID in the Spotify URL: spotify.com/track/[ID]'
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
                    {language === 'pt' ? 'Canvas:' : 'Canvas:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? '• Exibir informações da faixa: Mostra título, artista e álbum sobrepostos no Canvas'
                      : '• Show track information: Displays title, artist and album overlaid on the Canvas'
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">
                    {language === 'pt' ? 'Fallbacks:' : 'Fallbacks:'}
                  </h4>
                  <p>
                    {language === 'pt'
                      ? '• Estático: Exibição fixa da capa do álbum ou relógio\n• Fade In/Out: Transição suave com movimento\n• Movimento DVD: Animação clássica de quicar nas bordas'
                      : '• Static: Fixed display of album cover or clock\n• Fade In/Out: Smooth transition with movement\n• DVD Movement: Classic bouncing animation on edges'
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
              <div className="bg-gray-700 rounded-lg p-4">
                <p>
                  {language === 'pt'
                    ? 'Pressione ESC para sair do screensaver e voltar à tela de configurações.'
                    : 'Press ESC to exit the screensaver and return to the settings screen.'
                  }
                </p>
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