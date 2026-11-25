// Confirmación de nombres y apellidos completos antes de emitir un certificado
import { useState } from 'react';
import { Award, Download, PenLine, Printer } from 'lucide-react';
import { Aviso, Boton, Modal, campo, etiqueta } from './ui';

export type ModoCertificado = 'descargar' | 'imprimir';

export default function ConfirmarNombre({ nombreActual, titulo, onCerrar, onConfirmar }:
  { nombreActual: string; titulo: string; onCerrar: () => void; onConfirmar: (nombre: string, modo: ModoCertificado) => Promise<void> | void }) {
  const [nombre, setNombre] = useState(nombreActual);
  const [editando, setEditando] = useState(false);
  const [trabajando, setTrabajando] = useState<ModoCertificado | null>(null);
  const valido = nombre.trim().split(/\s+/).length >= 2;

  const emitir = async (modo: ModoCertificado) => {
    setTrabajando(modo);
    try { await onConfirmar(nombre.replace(/\s+/g, ' ').trim(), modo); } finally { setTrabajando(null); }
  };

  return (
    <Modal titulo="Confirma tu nombre para el certificado" onCerrar={onCerrar} icono={<Award className="h-5 w-5 text-[#F2A900]" />}>
      <p className="text-xs text-[#64748B] mb-3">Certificado: <strong className="text-[#0F172A]">{titulo}</strong></p>
      {editando ? (
        <div className="space-y-1.5">
          <label className={etiqueta}>Nombres y apellidos completos</label>
          <input className={campo} value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
          <p className="text-[11px] text-[#64748B]">Escríbelos tal como constan en tu cédula, con tildes.</p>
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-center">
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Así aparecerá tu nombre</p>
          <p className="text-xl font-bold text-[#1E3A8A] mt-1">{nombre.toUpperCase()}</p>
          <button onClick={() => setEditando(true)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"><PenLine className="h-3.5 w-3.5" />Corregir nombres</button>
        </div>
      )}
      {!valido && <div className="mt-3"><Aviso tipo="error">Escribe al menos un nombre y un apellido.</Aviso></div>}
      <div className="flex flex-wrap justify-end gap-2 mt-5">
        <Boton variante="secundario" disabled={!valido} cargando={trabajando === 'imprimir'} onClick={() => emitir('imprimir')}><Printer className="h-4 w-4" />Abrir para imprimir</Boton>
        <Boton disabled={!valido} cargando={trabajando === 'descargar'} onClick={() => emitir('descargar')}><Download className="h-4 w-4" />Confirmar y descargar PDF</Boton>
      </div>
    </Modal>
  );
}
