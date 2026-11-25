// Lectura en voz alta con la voz en español del navegador (Web Speech API).
// Lee frase por frase: así se puede pausar y reanudar en cualquier navegador
// (Chrome en Android no reanuda bien con speechSynthesis.pause) y mostrar subtítulos.

const PREFERENCIA_IDIOMA = ['es-EC', 'es-US', 'es-MX', 'es-419', 'es-CO', 'es-PE'];

export const vozDisponible = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function elegirVoz(): SpeechSynthesisVoice | null {
  if (!vozDisponible()) return null;
  const voces = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('es'));
  if (!voces.length) return null;
  const puntaje = (v: SpeechSynthesisVoice) => {
    const i = PREFERENCIA_IDIOMA.findIndex((l) => v.lang.toLowerCase() === l.toLowerCase());
    return (i >= 0 ? 100 - i * 5 : v.lang.toLowerCase() === 'es-es' ? 40 : 50) + (/natural|neural|online|google/i.test(v.name) ? 20 : 0);
  };
  return [...voces].sort((a, b) => puntaje(b) - puntaje(a))[0];
}

/** Convierte Markdown en texto para leer en voz alta y lo divide en frases. */
export function frasesParaLeer(markdown: string): string[] {
  const texto = markdown
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      let t = l.replace(/^#{1,6}\s+/, '').replace(/^>\s?/, '').replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
      t = t.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/[🏭]/gu, '');
      // Abreviaturas que la voz lee mal
      t = t.replace(/\bArts?\.\s*/g, (m) => (m.startsWith('Arts') ? 'artículos ' : 'artículo '))
        .replace(/\bN\.º\s*/g, 'número ').replace(/\bej\.\s*/gi, 'por ejemplo ').replace(/\s%/g, ' por ciento').replace(/%/g, ' por ciento');
      return /[.!?:;]$/.test(t) ? t : `${t}.`;
    })
    .join(' ');
  return (texto.match(/[^.!?]+[.!?]+["»)]*|[^.!?]+$/g) ?? [texto]).map((f) => f.trim()).filter((f) => f.length > 1);
}

export type EstadoLector = 'detenido' | 'leyendo' | 'pausado';

/** Lector controlado por frases. `alCambiar` informa el estado y la frase actual. */
export class Lector {
  private frases: string[] = [];
  private indice = 0;
  private turno = 0;
  velocidad = 1;
  estado: EstadoLector = 'detenido';
  constructor(private alCambiar: (estado: EstadoLector, indice: number, total: number) => void) {
    if (vozDisponible()) window.speechSynthesis.getVoices();
  }
  get fraseActual() { return this.frases[this.indice] ?? ''; }
  cargar(frases: string[]) { this.detener(); this.frases = frases; this.indice = 0; }
  leer(desde = this.indice) {
    if (!vozDisponible() || !this.frases.length) return;
    window.speechSynthesis.cancel();
    this.indice = Math.max(0, Math.min(desde, this.frases.length - 1));
    this.estado = 'leyendo';
    const mio = ++this.turno;
    const voz = elegirVoz();
    const siguiente = () => {
      if (mio !== this.turno) return;
      if (this.indice >= this.frases.length) { this.estado = 'detenido'; this.indice = 0; this.alCambiar(this.estado, 0, this.frases.length); return; }
      const u = new SpeechSynthesisUtterance(this.frases[this.indice]);
      u.lang = voz?.lang ?? 'es-419';
      if (voz) u.voice = voz;
      u.rate = this.velocidad;
      u.onend = () => { if (mio !== this.turno) return; this.indice++; siguiente(); };
      u.onerror = u.onend;
      this.alCambiar(this.estado, this.indice, this.frases.length);
      window.speechSynthesis.speak(u);
    };
    siguiente();
  }
  pausar() {
    if (this.estado !== 'leyendo') return;
    this.turno++;
    window.speechSynthesis.cancel();
    this.estado = 'pausado';
    this.alCambiar(this.estado, this.indice, this.frases.length);
  }
  detener() {
    this.turno++;
    if (vozDisponible()) window.speechSynthesis.cancel();
    this.estado = 'detenido';
    this.indice = 0;
    this.alCambiar(this.estado, 0, this.frases.length);
  }
  cambiarVelocidad(v: number) {
    this.velocidad = v;
    if (this.estado === 'leyendo') this.leer(this.indice);
  }
}
