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
  lyricsHelp: string;
  backgroundMode: string;
  themeColor: string;
  fixedColor: string;
  albumCover: string;
  lyricsMode: string;
  lyricsMode5Lines: string;
  lyricsModeLeft: string;
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
  howToUse: string;
  seconds: string;
  second: string;
  // Novas traduções
  operationMode: string;
  standard: string;
  screenSaver: string;
  showCanvas: string;
  showCanvasHelp: string;
  showTrackInfoOnCanvas: string;
  showTrackInfoOnCanvasHelp: string;
  showLyrics: string;
  showLyricsHelp: string;
  lyricsModeTitle: string;
  lyricsMode5LinesDesc: string;
  lyricsModeLeftDesc: string;
  musicDetection: string;
  autoDetectCurrentTrack: string;
  searchSpecificTrack: string;
  trackIdOrUrl: string;
  updateIntervalTitle: string;
  updateIntervalHelpText: string;
  loading: string;
  // Screen Saver traduções
  albumCover1: string;
  albumCover1Desc: string;
  albumCover2: string;
  albumCover2Desc: string;
  clock: string;
  clockDesc: string;
  clockSettings: string;
  clockFallbackMessage: string;
  clockFormat: string;
  clockFormat12h: string;
  clockFormat24h: string;
  timezone: string;
  showDate: string;
  showDateHelp: string;
  showTrackInfoInClock: string;
  showTrackInfoInClockHelp: string;
  movement: string;
  staticDesc: string;
  fadeInOutDesc: string;
  dvdMovementDesc: string;
  displayTime: string;
  displayTimeHelp: string;
  // How to use modal traduções
  standardMode: string;
  screenSaverMode: string;
  standardModeDescription: string;
  screenSaverModeDescription: string;
  standardModeFeatures: string;
  screenSaverModeFeatures: string;
  standardModeFeaturesList: string;
  screenSaverModeFeaturesList: string;
  displayModeParam: string;
  clockFormatParam: string;
  movementModeParam: string;
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
    lyricsHelp: 'Mostra a letra sincronizada da música atual',
    backgroundMode: 'Modo de Fundo',
    themeColor: 'Cor tema (extraída da capa)',
    fixedColor: 'Cor fixa',
    albumCover: 'Capa do álbum',
    lyricsMode: 'Modo de Letras',
    lyricsMode5Lines: '5 Linhas',
    lyricsModeLeft: 'Esquerda',
    fallbacks: 'Fallbacks',
    fallbacksDescription: 'Configurações para quando não há canvas disponível (capa do álbum) ou música tocando (relógio)',
    displayMode: 'Modo de Exibição',
    static: 'Estático',
    fadeInOut: 'Fade In/Out',
    dvdMovement: 'Movimento DVD',
    fadeInterval: 'Intervalo do Fade (segundos)',
    fadeIntervalHelp: 'Fade in/out a cada {interval} segundo{plural}',
    startScreensaver: 'Iniciar',
    searchAndStart: 'Buscar e Iniciar',
    starting: 'Iniciando...',
    pressEscToExit: 'Pressione ESC para sair do screensaver',
    howToUse: 'Como usar',
    seconds: 's',
    second: '',
    // Novas traduções
    operationMode: 'Modo de Operação',
    standard: 'Padrão',
    screenSaver: 'Proteção de Tela',
    showCanvas: 'Exibir Canvas',
    showCanvasHelp: 'Exibir Canvas do Spotify quando disponível',
    showTrackInfoOnCanvas: 'Exibir informações da música sobre o Canvas',
    showTrackInfoOnCanvasHelp: 'Exibir informações da música sobre o Canvas',
    showLyrics: 'Exibir letras da música sincronizadas',
    showLyricsHelp: 'Exibir letras da música sincronizadas',
    lyricsModeTitle: 'Modo de Letras',
    lyricsMode5LinesDesc: '5 linhas (centralizado)',
    lyricsModeLeftDesc: 'Alinhado à esquerda',
    musicDetection: 'Detecção de Música',
    autoDetectCurrentTrack: 'Detectar música atual automaticamente',
    searchSpecificTrack: 'Buscar faixa específica',
    trackIdOrUrl: 'ID da Faixa do Spotify ou URL',
    updateIntervalTitle: 'Intervalo de Atualização',
    updateIntervalHelpText: 'Verificar novas faixas a cada X segundos',
    loading: 'Carregando...',
    // Screen Saver traduções
    albumCover1: 'Capa do álbum 1',
    albumCover1Desc: 'Capa centralizada com informações abaixo',
    albumCover2: 'Capa do álbum 2',
    albumCover2Desc: 'Capa à esquerda com informações à direita',
    clock: 'Relógio',
    clockDesc: 'Exibir relógio e data centralizados',
    clockSettings: 'Configurações do Relógio',
    clockFallbackMessage: 'Quando não houver faixa em reprodução, exibiremos o relógio como fallback',
    clockFormat: 'Formato do Horário',
    clockFormat12h: '12 horas (AM/PM)',
    clockFormat24h: '24 horas',
    timezone: 'Fuso Horário',
    showDate: 'Exibir Data',
    showDateHelp: 'Mostrar data atual abaixo do horário',
    showTrackInfoInClock: 'Exibir Dados da Faixa',
    showTrackInfoInClockHelp: 'Mostrar informações da música atual',
    movement: 'Movimento',
    staticDesc: 'Centralizado na tela sem movimento',
    fadeInOutDesc: 'Desaparecer e aparecer em posições diferentes',
    dvdMovementDesc: 'Movimento clássico de descanso de tela de DVD',
    displayTime: 'Tempo de Exibição',
    displayTimeHelp: 'Tempo que o elemento fica visível antes do fade (segundos)',
    // How to use modal traduções
    standardMode: 'Modo Padrão',
    screenSaverMode: 'Modo Screen Saver',
    standardModeDescription: 'Exibe Canvas do Spotify com letras sincronizadas e informações da música. Detecta automaticamente a música atual e sincroniza as letras com o progresso da música.',
    screenSaverModeDescription: 'Exibe capas de álbum, relógio ou ambos com animações de movimento. Quando não há música tocando, automaticamente mostra o relógio.',
    standardModeFeatures: 'Características do Modo Padrão:',
    screenSaverModeFeatures: 'Características do Modo Screen Saver:',
    standardModeFeaturesList: '• Canvas: Vídeo animado do Spotify quando disponível\n• Letras: Sincronizadas com o progresso da música\n• Informações: Nome da música, artista e álbum\n• Detecção: Automática da música atual\n• Fallback: Capa do álbum quando não há Canvas',
    screenSaverModeFeaturesList: '• Exibição: Capas de álbum (2 estilos), relógio, ou ambos\n• Relógio: Formato 12h/24h, fuso horário, data opcional\n• Movimento: Fade in/out suave ou animação DVD\n• Fallback: Relógio quando não há música tocando',
    displayModeParam: 'Modo de exibição',
    clockFormatParam: 'Formato do relógio',
    movementModeParam: 'Modo de movimento'  
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
    lyricsHelp: 'Shows synchronized lyrics of the current song',
    backgroundMode: 'Background Mode',
    themeColor: 'Theme color (extracted from cover)',
    fixedColor: 'Fixed color',
    albumCover: 'Album cover',
    lyricsMode: 'Lyrics Mode',
    lyricsMode5Lines: '5 Lines',
    lyricsModeLeft: 'Left',
    fallbacks: 'Fallbacks',
    fallbacksDescription: 'Settings for when no canvas is available (album cover) or no music is playing (clock)',
    displayMode: 'Display Mode',
    static: 'Static',
    fadeInOut: 'Fade In/Out',
    dvdMovement: 'DVD Movement',
    fadeInterval: 'Fade Interval (seconds)',
    fadeIntervalHelp: 'Fade in/out every {interval} second{plural}',
    startScreensaver: 'Start',
    searchAndStart: 'Search and Start',
    starting: 'Starting...',
    pressEscToExit: 'Press ESC to exit screensaver',
    howToUse: 'How to use',
    seconds: 's',
    second: '',
    // Novas traduções
    operationMode: 'Operation Mode',
    standard: 'Standard',
    screenSaver: 'Screen Saver',
    showCanvas: 'Show Canvas',
    showCanvasHelp: 'Display Spotify Canvas when available',
    showTrackInfoOnCanvas: 'Show track info on Canvas',
    showTrackInfoOnCanvasHelp: 'Display music information over the Canvas',
    showLyrics: 'Show Lyrics',
    showLyricsHelp: 'Display synchronized song lyrics',
    lyricsModeTitle: 'Lyrics Mode',
    lyricsMode5LinesDesc: '5 lines (centered)',
    lyricsModeLeftDesc: 'Left aligned',
    musicDetection: 'Music Detection',
    autoDetectCurrentTrack: 'Detectar música atual automaticamente',
    searchSpecificTrack: 'Buscar faixa específica',
    trackIdOrUrl: 'ID da Faixa do Spotify ou URL',
    updateIntervalTitle: 'Update Interval',
    updateIntervalHelpText: 'Check for new tracks every X seconds',
    loading: 'Loading...',
    // Screen Saver traduções
    albumCover1: 'Album Cover 1',
    albumCover1Desc: 'Centered cover with info below',
    albumCover2: 'Album Cover 2',
    albumCover2Desc: 'Cover on left with info on right',
    clock: 'Clock',
    clockDesc: 'Display clock and date centered',
    clockSettings: 'Clock Settings',
    clockFallbackMessage: 'When no track is playing, we will display the clock as fallback',
    clockFormat: 'Time Format',
    clockFormat12h: '12 hours (AM/PM)',
    clockFormat24h: '24 hours',
    timezone: 'Timezone',
    showDate: 'Show Date',
    showDateHelp: 'Show current date below time',
    showTrackInfoInClock: 'Show Track Info',
    showTrackInfoInClockHelp: 'Show current music information',
    movement: 'Movement',
    staticDesc: 'Centered on screen without movement',
    fadeInOutDesc: 'Disappear and appear in different positions',
    dvdMovementDesc: 'Classic DVD screensaver bouncing movement',
    displayTime: 'Display Time',
    displayTimeHelp: 'Time the element stays visible before fade (seconds)',
    // How to use modal traduções
    standardMode: 'Standard Mode',
    screenSaverMode: 'Screen Saver Mode',
    standardModeDescription: 'Displays Spotify Canvas with synchronized lyrics and music information. Automatically detects current music and synchronizes lyrics with music progress.',
    screenSaverModeDescription: 'Displays album covers, clock, or both with movement animations. When no music is playing, automatically shows the clock.',
    standardModeFeatures: 'Standard Mode Features:',
    screenSaverModeFeatures: 'Screen Saver Mode Features:',
    standardModeFeaturesList: '• Canvas: Animated Spotify video when available\n• Lyrics: Synchronized with music progress\n• Information: Song name, artist and album\n• Detection: Automatic current music detection\n• Fallback: Album cover when no Canvas available',
    screenSaverModeFeaturesList: '• Display: Album covers (2 styles), clock, or both\n• Clock: 12h/24h format, timezone, optional date\n• Movement: Smooth fade in/out or DVD animation\n• Fallback: Clock when no music is playing',
    displayModeParam: 'Display mode',
    clockFormatParam: 'Clock format',
    movementModeParam: 'Movement mode'
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