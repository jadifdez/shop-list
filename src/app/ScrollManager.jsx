import { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Posición de scroll guardada por cada entrada de historial (location.key).
// Vive en memoria: basta para "atrás/adelante" dentro de la misma sesión SPA.
const positions = new Map();

// El propio `ScrollRestoration` de react-router no engancha bien sin loaders
// de data router, así que lo controlamos a mano:
// - Navegación nueva (push/replace, ej. hacer clic en un link): siempre al top.
// - Volver atrás/adelante (pop): restaura la posición que tenía esa página.
export function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType(); // 'PUSH' | 'REPLACE' | 'POP'

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    if (navType === 'POP') {
      window.scrollTo(0, positions.get(location.key) ?? 0);
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      positions.set(location.key, window.scrollY);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  return null;
}
