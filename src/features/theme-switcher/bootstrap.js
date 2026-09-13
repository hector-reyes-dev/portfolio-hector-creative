/**
 * Arranque temprano del tema. Se emite inline en <head> antes del contenido pintable,
 * así que no puede tener imports, red ni consultas al DOM del dock.
 *
 * Resuelve una sola vez —storage válido `light`/`dark`, después `prefers-color-scheme`,
 * finalmente claro—, aplica `html.light` / `html.dark`, `color-scheme` y el único
 * `meta[name="theme-color"]`, y publica el controlador descrito en ./types.ts:
 *
 *   window.__portfolioTheme.getTheme()      -> 'light' | 'dark'
 *   window.__portfolioTheme.toggle()        -> void (alterna, persiste si puede)
 *   window.__portfolioTheme.subscribe(fn)   -> () => void (baja suscripción)
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'theme';
  var THEME_COLOR = { light: '#F9F9F9', dark: '#020617' };

  if (window.__portfolioTheme) return;

  var root = document.documentElement;
  var theme = 'light';
  var manual = false;
  var listeners = [];
  var system = null;

  function readStoredTheme() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function openSystemQuery() {
    try {
      if (typeof window.matchMedia !== 'function') return null;
      var query = window.matchMedia('(prefers-color-scheme: dark)');
      return query && typeof query.matches === 'boolean' ? query : null;
    } catch (error) {
      return null;
    }
  }

  function apply(next) {
    theme = next;
    var other = next === 'dark' ? 'light' : 'dark';
    root.classList.add(next);
    root.classList.remove(other);
    root.style.colorScheme = next;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[next]);
    for (var i = 0; i < listeners.length; i += 1) listeners[i](next);
  }

  function handleSystemChange(event) {
    if (manual) return;
    apply(event.matches ? 'dark' : 'light');
  }

  function stopFollowingSystem() {
    if (!system) return;
    system.removeEventListener('change', handleSystemChange);
    system = null;
  }

  function toggle() {
    manual = true;
    stopFollowingSystem();
    apply(theme === 'dark' ? 'light' : 'dark');
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      /* Sin storage la elección vive solo en memoria durante esta sesión. */
    }
  }

  function subscribe(listener) {
    listeners.push(listener);
    return function () {
      var index = listeners.indexOf(listener);
      if (index !== -1) listeners.splice(index, 1);
    };
  }

  var stored = readStoredTheme();
  if (stored) {
    manual = true;
    apply(stored);
  } else {
    system = openSystemQuery();
    if (system && typeof system.addEventListener === 'function') {
      system.addEventListener('change', handleSystemChange);
    }
    apply(system && system.matches ? 'dark' : 'light');
  }

  window.__portfolioTheme = {
    getTheme: function () {
      return theme;
    },
    toggle: toggle,
    subscribe: subscribe
  };
})();
