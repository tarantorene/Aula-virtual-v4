import { useEffect, useRef, useState } from 'react';
import { useExtras } from '../lib/extras';

const INTERVALO = 60_000;       // un registro por minuto
const INACTIVIDAD = 3 * 60_000; // sin interacción por 3 min = no cuenta

/**
 * Registra tiempo efectivo de estudio mientras un material está abierto.
 * Solo suma con la pestaña visible y actividad reciente (mouse, teclado, toque, scroll),
 * o con el foco dentro de un video incrustado.
 */
export function useLatido(userId: string, topicId: string | null, materialId: string | null, pausado: boolean) {
  const { registrarTiempo } = useExtras();
  const ultimaActividad = useRef(0);
  const [activo, setActivo] = useState(true);
  const [segundosSesion, setSegundosSesion] = useState(0);

  useEffect(() => {
    if (!topicId || !materialId || pausado) return;
    ultimaActividad.current = Date.now();
    const marcar = () => { ultimaActividad.current = Date.now(); };
    const eventos = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const;
    eventos.forEach((e) => window.addEventListener(e, marcar, { passive: true }));

    const contando = () => {
      const visible = document.visibilityState === 'visible';
      const enVideo = document.activeElement?.tagName === 'IFRAME' || document.activeElement?.tagName === 'VIDEO';
      return visible && (Date.now() - ultimaActividad.current < INACTIVIDAD || enVideo);
    };
    const revisar = window.setInterval(() => setActivo(contando()), 5_000);
    const latir = window.setInterval(() => {
      if (!contando()) return;
      const sumado = registrarTiempo(userId, topicId, materialId, 60);
      if (sumado > 0) setSegundosSesion((s) => s + sumado);
    }, INTERVALO);

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, marcar));
      window.clearInterval(revisar);
      window.clearInterval(latir);
    };
  }, [userId, topicId, materialId, pausado, registrarTiempo]);

  return { activo, segundosSesion };
}
