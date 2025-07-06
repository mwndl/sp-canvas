import { useState, useEffect } from 'react';

interface ClockConfig {
  mode: '12h' | '24h';
  timezone: string;
  showDate: boolean;
}

export const useClock = (config: ClockConfig) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, timezone: string, mode: '12h' | '24h') => {
    try {
      // Converter para o fuso horário especificado
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const timezoneOffset = parseInt(timezone.replace('UTC', ''));
      const targetTime = new Date(utc + (timezoneOffset * 3600000));
      
      return targetTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: mode === '12h'
      });
    } catch (error) {
      // Fallback para horário local
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: mode === '12h'
      });
    }
  };

  const formatDate = (date: Date, timezone: string) => {
    try {
      // Converter para o fuso horário especificado
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const timezoneOffset = parseInt(timezone.replace('UTC', ''));
      const targetTime = new Date(utc + (timezoneOffset * 3600000));
      
      return targetTime.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      // Fallback para data local
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return {
    currentTime,
    formattedTime: formatTime(currentTime, config.timezone, config.mode),
    formattedDate: config.showDate ? formatDate(currentTime, config.timezone) : null
  };
}; 