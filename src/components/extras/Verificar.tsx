// Página pública: verificación de certificados por código (enlace del QR)
import { useEffect, useState, type FormEvent } from 'react';
import { BadgeCheck, GraduationCap, SearchX } from 'lucide-react';
import { buscarCertificadoRemoto, useExtras } from '../../lib/extras';
import type { CertificadoEmitido } from '../../types';
import { Boton, campo } from './ui';

export default function Verificar({ codigoInicial }: { codigoInicial: string }) {
  const { certificados } = useExtras();
  const [codigo, setCodigo] = useState(codigoInicial);
  const [res, setRes] = useState<CertificadoEmitido | null | undefined>(undefined);
  const [buscando, setBuscando] = useState(false);

  const buscar = async (c: string) => {
    const limpio = c.trim().toUpperCase();
    if (!limpio) return;
    setBuscando(true);
    const remoto = await buscarCertificadoRemoto(limpio).catch(() => null);
    setRes(remoto ?? certificados.find((x) => x.codigo === limpio) ?? null);
    setBuscando(false);
    window.history.replaceState(null, '', `?verificar=${limpio}`);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (codigoInicial) void buscar(codigoInicial); }, []);

  const enviar = (e: FormEvent) => { e.preventDefault(); void buscar(codigo); };
  const cedulaOculta = (c: string) => (c.length > 4 ? `******${c.slice(-4)}` : c);

  return (
    <div className="min-h-screen bg-[#F0F2F5] px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-10 w-10 bg-[#2563EB] text-white rounded-lg flex items-center justify-center"><GraduationCap className="h-6 w-6" /></div>
          <h1 className="text-xl font-bold text-[#0F172A]">Fundametz</h1>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-[#0F172A]">Verificación de certificados</h2>
          <p className="text-xs text-[#64748B] mt-1 mb-4">Ingrese el código impreso en el certificado (por ejemplo FZ-2026-1A2B3C4D).</p>
          <form onSubmit={enviar} className="flex gap-2">
            <input className={`${campo} uppercase`} value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="FZ-2026-XXXXXXXX" />
            <Boton type="submit" cargando={buscando}>Verificar</Boton>
          </form>
          {res && (
            <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="flex items-center gap-2 font-bold text-[#00740f] mb-2"><BadgeCheck className="h-5 w-5" />Certificado válido</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="font-semibold text-[#64748B]">Nombre</dt><dd className="font-bold text-[#0F172A]">{res.userName}</dd>
                <dt className="font-semibold text-[#64748B]">Cédula</dt><dd>{cedulaOculta(res.cedula)}</dd>
                <dt className="font-semibold text-[#64748B]">Capacitación</dt><dd>{res.titulo}</dd>
                {res.horas > 0 && <><dt className="font-semibold text-[#64748B]">Horas</dt><dd>{res.horas} h</dd></>}
                <dt className="font-semibold text-[#64748B]">Emitido</dt><dd>{new Date(res.emitidoAt).toLocaleDateString('es-EC', { dateStyle: 'long' })}</dd>
              </dl>
            </div>
          )}
          {res === null && (
            <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm font-semibold text-[#b00404]">
              <SearchX className="h-5 w-5" />No existe un certificado con ese código.
            </div>
          )}
          <a href={window.location.pathname} className="block mt-6 text-center text-xs font-semibold text-[#2563EB] hover:underline">Ir al Aula Virtual</a>
        </div>
      </div>
    </div>
  );
}
