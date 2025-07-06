'use client';

interface Track {
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
}

interface AlbumDisplayProps {
  mode: 'album1' | 'album2';
  track: Track | null;
}

export const AlbumDisplay = ({ mode, track }: AlbumDisplayProps) => {
  if (!track || !track.album.images[0]) {
    return null;
  }

  if (mode === 'album1') {
    // Modo 1: Capa centralizada com informações abaixo
    return (
      <div className="text-center text-white">
        {/* Album Cover */}
        <div className="mb-6">
          <img
            src={track.album.images[0].url}
            alt={track.album.name}
            className="w-64 h-64 rounded-lg shadow-2xl mx-auto"
          />
        </div>
        
        {/* Track Info */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {track.name}
          </h2>
          <p className="text-xl text-gray-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {track.artists.map(artist => artist.name).join(', ')}
          </p>
          <p className="text-lg text-gray-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {track.album.name}
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'album2') {
    // Modo 2: Capa à esquerda com informações à direita
    return (
      <div className="flex items-center space-x-8 text-white">
        {/* Album Cover */}
        <div>
          <img
            src={track.album.images[0].url}
            alt={track.album.name}
            className="w-48 h-48 rounded-lg shadow-2xl"
          />
        </div>
        
        {/* Track Info */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {track.name}
          </h2>
          <p className="text-2xl text-gray-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {track.artists.map(artist => artist.name).join(', ')}
          </p>
          <p className="text-xl text-gray-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {track.album.name}
          </p>
        </div>
      </div>
    );
  }

  return null;
}; 