'use client';

import { useState } from 'react';
import { getTranslation, type Language } from '../lib/i18n';

export interface ScreenSaverConfig {
  displayMode: 'album1' | 'album2' | 'clock';
  clockMode: '12h' | '24h';
  timezone: string;
  showDate: boolean;
  showTrackInfo: boolean;
  movement: 'fade' | 'dvd' | 'static';
  fadeSpeed: number;
}

interface ScreenSaverSettingsProps {
  config: ScreenSaverConfig;
  onConfigChange: (config: ScreenSaverConfig) => void;
  language?: Language;
}

export const ScreenSaverSettings = ({ config, onConfigChange, language = 'pt' }: ScreenSaverSettingsProps) => {
  const t = getTranslation(language);
  const updateConfig = (updates: Partial<ScreenSaverConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="divide-y divide-gray-700">
      {/* Display Mode */}
      <div className="p-4 hover:bg-gray-750 transition-colors">
        <h3 className="text-white font-medium mb-3">{t.displayMode}</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="displayMode"
              value="album1"
              checked={config.displayMode === 'album1'}
              onChange={(e) => updateConfig({ displayMode: e.target.value as 'album1' | 'album2' | 'clock' })}
              className="mr-3 accent-blue-400"
            />
            <div>
              <span className="text-gray-300 block">{t.albumCover1}</span>
              <span className="text-gray-400 text-xs">{t.albumCover1Desc}</span>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="displayMode"
              value="album2"
              checked={config.displayMode === 'album2'}
              onChange={(e) => updateConfig({ displayMode: e.target.value as 'album1' | 'album2' | 'clock' })}
              className="mr-3 accent-blue-400"
            />
            <div>
              <span className="text-gray-300 block">{t.albumCover2}</span>
              <span className="text-gray-400 text-xs">{t.albumCover2Desc}</span>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="displayMode"
              value="clock"
              checked={config.displayMode === 'clock'}
              onChange={(e) => updateConfig({ displayMode: e.target.value as 'album1' | 'album2' | 'clock' })}
              className="mr-3 accent-blue-400"
            />
            <div>
              <span className="text-gray-300 block">{t.clock}</span>
              <span className="text-gray-400 text-xs">{t.clockDesc}</span>
            </div>
          </label>
        </div>
      </div>

            {/* Clock Settings - Always visible */}
      <div className="p-4 bg-gray-750/30">
        <h3 className="text-white font-medium mb-3">{t.clockSettings}</h3>
        <p className="text-gray-400 text-sm mb-4">
          {t.clockFallbackMessage}
        </p>
        <div className="space-y-4">
          {/* Clock Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t.clockFormat}</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="clockMode"
                  value="12h"
                  checked={config.clockMode === '12h'}
                  onChange={(e) => updateConfig({ clockMode: e.target.value as '12h' | '24h' })}
                  className="mr-3 accent-blue-400"
                />
                <span className="text-gray-300">{t.clockFormat12h}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="clockMode"
                  value="24h"
                  checked={config.clockMode === '24h'}
                  onChange={(e) => updateConfig({ clockMode: e.target.value as '12h' | '24h' })}
                  className="mr-3 accent-blue-400"
                />
                <span className="text-gray-300">{t.clockFormat24h}</span>
              </label>
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t.timezone}</label>
            <select
              value={config.timezone}
              onChange={(e) => updateConfig({ timezone: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="UTC-8">UTC-8 (PST)</option>
              <option value="UTC-5">UTC-5 (EST)</option>
              <option value="UTC-3">UTC-3 (BRT)</option>
              <option value="UTC+0">UTC+0 (GMT)</option>
              <option value="UTC+1">UTC+1 (CET)</option>
              <option value="UTC+2">UTC+2 (EET)</option>
              <option value="UTC+5:30">UTC+5:30 (IST)</option>
              <option value="UTC+8">UTC+8 (CST)</option>
              <option value="UTC+9">UTC+9 (JST)</option>
            </select>
          </div>

          {/* Show Date */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">{t.showDate}</h4>
              <p className="text-gray-400 text-sm">{t.showDateHelp}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.showDate}
                onChange={(e) => updateConfig({ showDate: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Show Track Info */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">{t.showTrackInfoInClock}</h4>
              <p className="text-gray-400 text-sm">{t.showTrackInfoInClockHelp}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.showTrackInfo}
                onChange={(e) => updateConfig({ showTrackInfo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Movement */}
      <div className="p-4 hover:bg-gray-750 transition-colors">
        <h3 className="text-white font-medium mb-3">{t.movement}</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="movement"
              value="static"
              checked={config.movement === 'static'}
              onChange={(e) => updateConfig({ movement: e.target.value as 'fade' | 'dvd' | 'static' })}
              className="mr-3 accent-blue-400"
            />
            <div>
              <span className="text-gray-300 block">{t.static}</span>
              <span className="text-gray-400 text-xs">{t.staticDesc}</span>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="movement"
              value="fade"
              checked={config.movement === 'fade'}
              onChange={(e) => updateConfig({ movement: e.target.value as 'fade' | 'dvd' | 'static' })}
              className="mr-3 accent-blue-400"
            />
            <div>
              <span className="text-gray-300 block">{t.fadeInOut}</span>
              <span className="text-gray-400 text-xs">{t.fadeInOutDesc}</span>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="movement"
              value="dvd"
              checked={config.movement === 'dvd'}
              onChange={(e) => updateConfig({ movement: e.target.value as 'fade' | 'dvd' | 'static' })}
              className="mr-3 accent-blue-400"
            />
            <div>
              <span className="text-gray-300 block">{t.dvdMovement}</span>
              <span className="text-gray-400 text-xs">{t.dvdMovementDesc}</span>
            </div>
          </label>
        </div>
      </div>

      {/* Fade Speed */}
      {config.movement === 'fade' && (
        <div className="flex items-center justify-between p-4 bg-gray-750/30">
          <div className="flex-1">
            <h3 className="text-white font-medium">{t.displayTime}</h3>
            <p className="text-gray-400 text-sm">{t.displayTimeHelp}</p>
          </div>
          <input
            type="number"
            value={config.fadeSpeed}
            onChange={(e) => updateConfig({ fadeSpeed: parseFloat(e.target.value) || 15 })}
            min="5"
            max="60"
            step="1"
            className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
}; 