import { Fragment, type ReactNode } from 'react';

/**
 * Renderizador de Markdown mínimo y seguro (sin HTML crudo) para materiales de lectura.
 * Soporta: ## y ### títulos, párrafos, listas (- y 1.), > destacados, **negrita** y *cursiva*.
 * El texto sin formato se muestra igual que antes (párrafos).
 */
function enLinea(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i} className="font-bold text-[#1E3A8A]">{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function Markdown({ texto }: { texto: string }) {
  const lineas = texto.replace(/\r/g, '').trim().split('\n');
  const bloques: ReactNode[] = [];
  let i = 0, k = 0;
  while (i < lineas.length) {
    const l = lineas[i];
    if (!l.trim()) { i++; continue; }
    if (l.startsWith('### ')) {
      bloques.push(<h4 key={k++} className="mt-5 mb-2 text-base font-bold text-[#0F172A]">{enLinea(l.slice(4))}</h4>); i++;
    } else if (l.startsWith('## ')) {
      bloques.push(<h3 key={k++} className="mt-6 mb-2.5 text-lg sm:text-xl font-bold text-[#1E3A8A] first:mt-0 pb-1.5 border-b border-[#E0E0E0]">{enLinea(l.slice(3))}</h3>); i++;
    } else if (l.startsWith('> ')) {
      const t: string[] = [];
      while (i < lineas.length && lineas[i].startsWith('> ')) { t.push(lineas[i].slice(2)); i++; }
      const texto = t.join(' ');
      const ejemplo = texto.match(/^\*\*(Ejemplo[^*]*?):?\*\*:?\s*(.*)$/i);
      if (ejemplo) {
        // "> **Ejemplo práctico en planta:** texto" → recuadro de caso práctico
        bloques.push(
          <div key={k++} className="my-4 rounded-[6px] border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1">🏭 {ejemplo[1]}</p>
            <p className="leading-relaxed text-slate-800">{enLinea(ejemplo[2])}</p>
          </div>);
      } else {
        bloques.push(<blockquote key={k++} className="my-4 border-l-4 border-[#2563EB] bg-[#2563EB]/5 px-4 py-3 rounded-r-[4px] font-semibold text-[#1E3A8A]">{enLinea(texto)}</blockquote>);
      }
    } else if (/^[-*] /.test(l)) {
      const items: string[] = [];
      while (i < lineas.length && /^[-*] /.test(lineas[i])) { items.push(lineas[i].slice(2)); i++; }
      bloques.push(
        <ul key={k++} className="my-3 space-y-1.5 pl-1">
          {items.map((it, j) => (
            <li key={j} className="flex gap-2.5 leading-relaxed"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" aria-hidden /><span>{enLinea(it)}</span></li>
          ))}
        </ul>);
    } else if (/^\d+\. /.test(l)) {
      const items: string[] = [];
      while (i < lineas.length && /^\d+\. /.test(lineas[i])) { items.push(lineas[i].replace(/^\d+\. /, '')); i++; }
      bloques.push(
        <ol key={k++} className="my-3 space-y-1.5">
          {items.map((it, j) => (
            <li key={j} className="flex gap-2.5 leading-relaxed"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#1E3A8A] text-[10px] font-bold text-white mt-0.5">{j + 1}</span><span>{enLinea(it)}</span></li>
          ))}
        </ol>);
    } else {
      const t: string[] = [];
      while (i < lineas.length && lineas[i].trim() && !/^(#{2,3} |> |[-*] |\d+\. )/.test(lineas[i])) { t.push(lineas[i]); i++; }
      bloques.push(<p key={k++} className="my-2.5 leading-relaxed">{enLinea(t.join(' '))}</p>);
    }
  }
  return <div className="text-slate-800 text-sm sm:text-[15px]">{bloques}</div>;
}
