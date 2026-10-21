/**
 * ==============================================================================
 * CINEMATIC SPLIT-SCREEN INTRO CONTROLLER — SREE LEKSHMI
 * Pure Vanilla JavaScript Motion Engine
 * ==============================================================================
 */

(function () {
  'use strict';

  let hasRun = false;
  let introTimer1 = null;
  let introTimer2 = null;
  let introTimer3 = null;
  let introTimer4 = null;

  function initCinematicIntro() {
    const introEl = document.getElementById('cinematic-intro');
    if (!introEl) return;

    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      skipIntroDirectly(introEl);
      return;
    }

    // Set initial active state on body
    document.body.classList.add('intro-active');

    // Attach skip button listener
    const skipBtn = document.getElementById('intro-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        skipIntroDirectly(introEl);
      });
    }

    // Keyboard shortcut (Escape, Enter to skip)
    const keyHandler = (e) => {
      if (!hasRun) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          skipIntroDirectly(introEl);
          window.removeEventListener('keydown', keyHandler);
        }
      }
    };
    window.addEventListener('keydown', keyHandler);

    // ==========================================================================
    // CINEMATIC TIMELINE SEQUENCE (Total: ~2.2s - 2.5s)
    // ==========================================================================
    // Initial State: SREE and LEKSHMI are already 100% visible, solid & centralized (No appear effect)

    // Step 1 (1.10s): THE SPLIT — SREE splits left, LEKSHMI splits right, curtains open
    introTimer1 = setTimeout(() => {
      introEl.classList.add('is-splitting', 'is-revealing');
      document.body.classList.add('intro-revealing');
    }, 1100);

    // Step 2 (2.20s): Mark Complete & Restore Body Scrolling
    introTimer2 = setTimeout(() => {
      completeIntroSequence(introEl);
    }, 2200);

    // Step 3 (2.50s): Clean up DOM visibility entirely
    introTimer3 = setTimeout(() => {
      introEl.style.display = 'none';
      hasRun = true;
    }, 2500);
  }

  function completeIntroSequence(introEl) {
    if (!introEl) return;
    introEl.classList.add('is-completed');
    document.body.classList.remove('intro-active');
    document.body.classList.remove('intro-revealing');
    document.body.classList.add('intro-complete');
    hasRun = true;
  }

  function skipIntroDirectly(introEl) {
    // Clear all pending timeouts
    clearTimeout(introTimer1);
    clearTimeout(introTimer2);
    clearTimeout(introTimer3);
    clearTimeout(introTimer4);

    if (introEl) {
      introEl.classList.add('is-completed');
      introEl.style.display = 'none';
    }

    document.body.classList.remove('intro-active');
    document.body.classList.remove('intro-revealing');
    document.body.classList.add('intro-complete');
    hasRun = true;
  }

  /**
   * Replay Intro Feature
   * Call `window.replayIntro()` to watch the split intro animation again at any time.
   */
  window.replayIntro = function () {
    const introEl = document.getElementById('cinematic-intro');
    if (!introEl) return;

    // Reset styles and classes
    introEl.style.display = 'block';
    introEl.classList.remove('is-completed', 'is-animating', 'is-splitting', 'is-revealing');
    document.body.classList.remove('intro-complete');

    // Force browser reflow
    void introEl.offsetWidth;

    hasRun = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    initCinematicIntro();
  };

  // Run automatically when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCinematicIntro);
  } else {
    initCinematicIntro();
  }
})();
