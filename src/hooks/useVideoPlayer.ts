import { useRef, useCallback } from 'react';

interface UseVideoPlayerOptions {
  debugMode: boolean;
  videoTimeout: number;
  addDebugLog: (type: string, message: string) => void;
  onVideoFailure: () => void;
}

export const useVideoPlayer = ({ debugMode, videoTimeout, addDebugLog, onVideoFailure }: UseVideoPlayerOptions) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Function to try to play the video
  const tryPlayVideo = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Check if video is still in DOM
      if (!document.contains(video)) {
        console.log('⚠️ Video removed from DOM - aborting playback');
        if (debugMode) {
          addDebugLog('WARNING', 'Video removed from DOM - aborting playback');
        }
        return;
      }
      
      // Reset video state
      video.currentTime = 0;
      video.load();
      
      // Timer to check if the video started (customizable via timeout query param)
      const timeoutId = setTimeout(() => {
        // Check again if video is still in DOM
        if (!document.contains(video)) {
          console.log('⚠️ Video removed from DOM during timeout');
          if (debugMode) {
            addDebugLog('WARNING', 'Video removed from DOM during timeout');
          }
          return;
        }
        
        if (video.readyState < 2 || video.paused) { // HAVE_CURRENT_DATA or video paused
          console.log(`⏰ Video didn't start after ${videoTimeout}ms - readyState: ${video.readyState}, paused: ${video.paused}`);
          if (debugMode) {
            addDebugLog('TIMEOUT', `Video didn't start after ${videoTimeout}ms - readyState: ${video.readyState}, paused: ${video.paused}`);
          }
          onVideoFailure();
          return false; // Signal timeout
        }
      }, videoTimeout);
      
      // Clear timeout if the video starts playing
      const handleCanPlay = () => {
        clearTimeout(timeoutId);
        video.removeEventListener('canplay', handleCanPlay);
      };
      
      video.addEventListener('canplay', handleCanPlay);
      
      // Try to play
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Check if video is still in DOM
            if (!document.contains(video)) {
              console.log('⚠️ Video removed from DOM after starting playback');
              if (debugMode) {
                addDebugLog('WARNING', 'Video removed from DOM after starting playback');
              }
              return;
            }
            console.log('✅ Video playing successfully');
            if (debugMode) {
              addDebugLog('SUCCESS', 'Video playing successfully');
            }
            return true; // Signal success
          })
          .catch((error) => {
            // Check if error is due to DOM removal
            if (error.message && error.message.includes('removed from the document')) {
              console.log('⚠️ Video removed from DOM during playback - ignoring error');
              if (debugMode) {
                addDebugLog('WARNING', 'Video removed from DOM during playback - ignoring error');
              }
              return;
            }
            console.error('❌ Failed to play video:', error);
            if (debugMode) {
              addDebugLog('ERROR', `Failed to play video: ${error.message || error}`);
            }
            onVideoFailure();
            return false; // Signal failure
          });
      }
    }
  }, [debugMode, videoTimeout, addDebugLog]);

  // Function to handle video failure
  const handleVideoFailure = useCallback(() => {
    console.log('❌ Video failure detected - going to fallback');
    if (debugMode) {
      addDebugLog('FAILURE', 'Video failure detected - going to fallback');
    }
    onVideoFailure();
  }, [debugMode, addDebugLog, onVideoFailure]);

  return {
    videoRef,
    tryPlayVideo,
    handleVideoFailure
  };
}; 