/**
 * Fullscreen API service
 */

export class FullscreenService {
  // Check if fullscreen is supported
  static isSupported() {
    return !!(
      document.fullscreenEnabled || 
      document.webkitFullscreenEnabled || 
      document.mozFullScreenEnabled || 
      document.msFullscreenEnabled
    );
  }

  // Check if currently in fullscreen
  static isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  // Request fullscreen
  static async requestFullscreen(element = document.documentElement) {
    try {
      if (element.requestFullscreen) {
        return await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        return await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        return await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        return await element.msRequestFullscreen();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      throw error;
    }
  }

  // Exit fullscreen
  static async exitFullscreen() {
    try {
      if (document.exitFullscreen) {
        return await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        return await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        return await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        return await document.msExitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
      throw error;
    }
  }

  // Toggle fullscreen
  static async toggleFullscreen(element = document.documentElement) {
    if (this.isFullscreen()) {
      return await this.exitFullscreen();
    } else {
      return await this.requestFullscreen(element);
    }
  }

  // Add fullscreen change event listener
  static addFullscreenChangeListener(callback) {
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];
    
    events.forEach(event => {
      document.addEventListener(event, callback);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, callback);
      });
    };
  }
}