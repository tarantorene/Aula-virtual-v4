// Material de apoyo por lección (documentos PDF con vista previa y enlaces oficiales) y bloqueo por video obligatorio
import { useState } from 'react';
import { ExternalLink, Eye, EyeOff, FileText, Globe, Lock, PlayCircle } from 'lucide-react';
import type { RecursoApoyo } from '../../types';
import { getGoogleDriveEmbedUrl } from '../../lib/videoUtils';

const esPdf = (url: string) => /\.pdf($|\?)/i.test(url) || /drive\.google\.com\/file/i.test(url);
const urlVista = (url: string) => {
  const drive = getGoogleDriveEmbedUrl(url);
  return drive.isDrive && drive.embedUrl ? drive.embedUrl : url;
};

/** Convierte el texto del administrador ("Título | URL" por línea) en recursos. */
export function parsearRecursos(texto: string): RecursoApoyo[] {
  return texto.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [a, b] = l.includes('|') ? l.split('|').map((x) => x.trim()) : ['', l];
    const url = b || a;
    return { titulo: a && b ? a : url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0], url };
  }).filter((r) => /^https?:\/\//i.test(r.url));
}
export const recursosATexto = (r: RecursoApoyo[] = []) => r.map((x) => `${x.titulo} | ${x.url}`).join('\n');

export function RecursosApoyo({ recursos }: { recursos?: RecursoApoyo[] }) {
  const docs = (recursos ?? []).filter((r) => esPdf(r.url));
  const enlaces = (recursos ?? []).filter((r) => !esPdf(r.url));
  const [vista, setVista] = useState<string | null>(docs[0]?.url ?? null);
  if (!recursos?.length) return null;

  return (
    <div className="mt-5 rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-slate-200">
        <p className="text-sm font-bold text-[#0F172A]">Material de apoyo y documentos de estudio ({recursos.length})</p>
        <p className="text-[11px] text-slate-500">Guías oficiales con vista previa y enlaces a normativa vigente.</p>
      </div>
      <div className="p-3 space-y-2">
        {docs.map((r) => (
          <div key={r.url} className="rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 px-3 py-2">
              <FileText className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="flex-1 text-sm font-semibold text-[#0F172A] truncate">{r.titulo}</span>
              <button onClick={() => setVista(vista === r.url ? null : r.url)} className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline">
                {vista === r.url ? <><EyeOff className="h-3.5 w-3.5" />Ocultar</> : <><Eye className="h-3.5 w-3.5" />Vista previa</>}
              </button>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-semibold text-[#64748B] hover:text-[#2563EB]"><ExternalLink className="h-3.5 w-3.5" />Abrir</a>
            </div>
            {vista === r.url && <iframe src={urlVista(r.url)} title={r.titulo} className="w-full h-[60vh] border-t border-slate-200 bg-slate-50" />}
          </div>
        ))}
        {enlaces.map((r) => (
          <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 hover:border-[#2563EB] group">
            <Globe className="h-4 w-4 text-[#2563EB] shrink-0" />
            <span className="flex-1 min-w-0"><span className="block text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] truncate">{r.titulo}</span><span className="block text-[11px] text-slate-400 truncate">{r.url}</span></span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
        ))}
      </div>
    </div>
  );
}

export function BloqueoVideo({ tituloVideo, onIrAlVideo }: { tituloVideo: string; onIrAlVideo: () => void }) {
  return (
    <div className="py-12 px-4 text-center max-w-lg mx-auto space-y-4">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center"><Lock className="h-7 w-7" /></div>
      <h3 className="text-lg font-bold text-[#0F172A]">Video obligatorio pendiente</h3>
      <p className="text-sm text-slate-600">Para avanzar a las lecturas, actividades y la prueba final, primero termina de ver la clase principal: <strong>{tituloVideo}</strong>.</p>
      <button onClick={onIrAlVideo} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold"><PlayCircle className="h-4 w-4" />Ir al video principal</button>
    </div>
  );
}
