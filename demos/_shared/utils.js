/**
 * Shared utility functions for demos
 * Usage: <script src="../_shared/utils.js"></script>
 */

const DemoUtils = (function() {
  'use strict';

  /**
   * Shuffle an array in place (Fisher-Yates)
   * @param {Array} arr - Array to shuffle
   * @returns {Array} The shuffled array (same reference)
   */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Format seconds as MM:SS
   * @param {number} s - Seconds
   * @returns {string} Formatted time string
   */
  function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  /**
   * Create a simple timer with callback
   * @param {Function} onTick - Called every second with elapsed seconds
   * @returns {Object} Timer control { start, stop, reset, getSeconds }
   */
  function createTimer(onTick) {
    let seconds = 0;
    let timerId = null;
    let running = false;

    function tick() {
      seconds += 1;
      if (onTick) onTick(seconds);
    }

    return {
      start() {
        if (running) return;
        running = true;
        timerId = setInterval(tick, 1000);
      },
      stop() {
        if (timerId) clearInterval(timerId);
        timerId = null;
        running = false;
      },
      reset() {
        this.stop();
        seconds = 0;
        if (onTick) onTick(0);
      },
      getSeconds() {
        return seconds;
      },
      setSeconds(s) {
        seconds = s;
      }
    };
  }

  /**
   * Simple localStorage wrapper with error handling
   */
  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.warn('Storage set failed:', key, err);
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
  };

  /**
   * Create a Set-based wrong answer tracker
   * @param {string} storageKey - localStorage key
   * @returns {Object} WrongSet { add, remove, has, clear, size, save, load }
   */
  function createWrongSet(storageKey) {
    let wrongSet = new Set();

    function load() {
      const raw = storage.get(storageKey, []);
      wrongSet = new Set(Array.isArray(raw) ? raw : []);
      return wrongSet;
    }

    function save() {
      return storage.set(storageKey, [...wrongSet]);
    }

    return {
      add(id) {
        wrongSet.add(id);
        save();
      },
      remove(id) {
        wrongSet.delete(id);
        save();
      },
      has(id) {
        return wrongSet.has(id);
      },
      clear() {
        wrongSet = new Set();
        save();
      },
      get size() {
        return wrongSet.size;
      },
      load,
      save,
      toArray() {
        return [...wrongSet];
      }
    };
  }

  /**
   * Simple toast notification (non-blocking)
   * @param {string} message - Message to show
   * @param {number} duration - Duration in ms (default 2500)
   */
  function toast(message, duration = 2500) {
    const existing = document.querySelector('.demo-toast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'demo-toast';
    el.textContent = message;
    el.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #374151;
      color: #e5e7eb;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 0.95rem;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      animation: fadeIn 0.2s ease;
    `;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration);
  }

  return {
    shuffle,
    formatTime,
    createTimer,
    storage,
    createWrongSet,
    toast
  };
})();

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DemoUtils;
}
