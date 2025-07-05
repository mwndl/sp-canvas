export type Language = 'pt' | 'en';

export interface Translations {
  title: string;
  subtitle: string;
  musicSearch: string;
  searchMode: string;
  autoDetect: string;
  specificTrack: string;
  trackId: string;
  trackIdPlaceholder: string;
  trackIdHelp: string;
  autoUpdate: string;
  updateInterval: string;
  updateIntervalHelp: string;
  canvas: string;
  showTrackInfo: string;
  showTrackInfoHelp: string;
  lyrics: string;
  showLyrics: string;
  showLyricsHelp: string;
  backgroundMode: string;
  themeColor: string;
  fixedColor: string;
  albumCover: string;
  fallbacks: string;
  fallbacksDescription: string;
  displayMode: string;
  static: string;
  fadeInOut: string;
  dvdMovement: string;
  fadeInterval: string;
  fadeIntervalHelp: string;
  startScreensaver: string;
  searchAndStart: string;
  starting: string;
  pressEscToExit: string;
  seconds: string;
  second: string;
}

const translations: Record<Language, Translations> = {
  pt: {
    title: 'SpotSaver',
    subtitle: 'Spotify Canvas Screensaver',
    musicSearch: 'Busca de Música',
    searchMode: 'Modo de Busca',
    autoDetect: 'Detectar automaticamente',
    specificTrack: 'Buscar faixa específica',
    trackId: 'Track ID',
    trackIdPlaceholder: 'Ex: 4iV5W9uYEdYUVa79Axb7Rh',
    trackIdHelp: 'Encontre o Track ID na URL do Spotify: spotify.com/track/[ID]',
    autoUpdate: 'Atualizar automaticamente',
    updateInterval: 'Intervalo de Atualização (segundos)',
    updateIntervalHelp: 'Verificar mudanças na música a cada {interval} segundo{plural}',
    canvas: 'Canvas',
    showTrackInfo: 'Exibir informações da faixa',
    showTrackInfoHelp: 'Mostra título, artista e álbum sobrepostos no canvas',
    lyrics: 'Letra da Música',
    showLyrics: 'Exibir letra da música',
    showLyricsHelp: 'Mostra a letra sincronizada da música atual',
    backgroundMode: 'Modo de Fundo',
    themeColor: 'Cor tema (extraída da capa)',
    fixedColor: 'Cor fixa',
    albumCover: 'Capa do álbum',
    fallbacks: 'Fallbacks',
    fallbacksDescription: 'Configurações para quando não há canvas disponível (capa do álbum) ou música tocando (relógio)',
    displayMode: 'Modo de Exibição',
    static: 'Estático',
    fadeInOut: 'Fade In/Out',
    dvdMovement: 'Movimento DVD',
    fadeInterval: 'Intervalo do Fade (segundos)',
    fadeIntervalHelp: 'Fade in/out a cada {interval} segundo{plural}',
    startScreensaver: 'Iniciar Screensaver',
    searchAndStart: 'Buscar e Iniciar',
    starting: 'Iniciando...',
    pressEscToExit: 'Pressione ESC para sair do screensaver',
    seconds: 's',
    second: ''
  },
  en: {
    title: 'SpotSaver',
    subtitle: 'Spotify Canvas Screensaver',
    musicSearch: 'Music Search',
    searchMode: 'Search Mode',
    autoDetect: 'Auto-detect',
    specificTrack: 'Search specific track',
    trackId: 'Track ID',
    trackIdPlaceholder: 'Ex: 4iV5W9uYEdYUVa79Axb7Rh',
    trackIdHelp: 'Find the Track ID in the Spotify URL: spotify.com/track/[ID]',
    autoUpdate: 'Auto-update',
    updateInterval: 'Update Interval (seconds)',
    updateIntervalHelp: 'Check for music changes every {interval} second{plural}',
    canvas: 'Canvas',
    showTrackInfo: 'Show track information',
    showTrackInfoHelp: 'Shows title, artist and album overlaid on canvas',
    lyrics: 'Song Lyrics',
    showLyrics: 'Show song lyrics',
    showLyricsHelp: 'Shows synchronized lyrics of the current song',
    backgroundMode: 'Background Mode',
    themeColor: 'Theme color (extracted from cover)',
    fixedColor: 'Fixed color',
    albumCover: 'Album cover',
    fallbacks: 'Fallbacks',
    fallbacksDescription: 'Settings for when no canvas is available (album cover) or no music is playing (clock)',
    displayMode: 'Display Mode',
    static: 'Static',
    fadeInOut: 'Fade In/Out',
    dvdMovement: 'DVD Movement',
    fadeInterval: 'Fade Interval (seconds)',
    fadeIntervalHelp: 'Fade in/out every {interval} second{plural}',
    startScreensaver: 'Start Screensaver',
    searchAndStart: 'Search and Start',
    starting: 'Starting...',
    pressEscToExit: 'Press ESC to exit screensaver',
    seconds: 's',
    second: ''
  }
};

export function getTranslation(lang: Language): Translations {
  return translations[lang];
}

export function formatTranslation(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
} 