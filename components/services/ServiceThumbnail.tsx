import { catalogServices, type CatalogService } from "@/data/service-catalog"

/** Decorative category motifs, not product screenshots or performance charts. */
export default function ServiceThumbnail({ service }: { service: CatalogService }) {
  const identifier = service.category.slice(0, 3).toUpperCase() + " / " + String(catalogServices.filter(item => item.category === service.category).findIndex(item => item.id === service.id) + 1).padStart(2, "0")
  const variant = [...service.id].reduce((total, letter) => total + letter.charCodeAt(0), 0) % 3
  return <div aria-hidden="true" className="aspect-[16/10] overflow-hidden bg-paper text-ink border-b border-line">
    <svg viewBox="0 0 320 200" className="h-full w-full" fill="none" focusable="false">
      <text x="14" y="190" stroke="none" fill="currentColor" className="font-display" fontSize="10" letterSpacing="1">{identifier}</text>
      <path d="M0 168H320M32 0V200" stroke="currentColor" opacity=".08" />
      <rect x={248 - variant * 24} y="18" width="48" height="10" fill="var(--color-red)" />
      <g transform={`translate(${variant * 4} ${variant * -3})`} stroke="currentColor" strokeWidth="2">
        {service.category === "websites" && <>
          <rect x="54" y="38" width="200" height="132" rx="6" fill="var(--color-soft)" />
          <path d="M54 61H254M68 50H87" /><rect x="70" y="78" width="74" height="52" fill="var(--color-red)" stroke="none" />
          <path d="M159 82H237M159 95H227M159 108H216M70 146H148M164 146H236" />
          {variant !== 1 && <rect x="229" y="112" width="38" height="67" rx="4" fill="var(--color-ink)" />}
        </>}
        {service.category === "seo" && <>
          <rect x="57" y="40" width="202" height="32" rx="16" fill="var(--color-soft)" />
          <circle cx="76" cy="55" r="6" /><path d="M81 60L86 65M101 55H218" />
          {[90, 122, 154].map((y, i) => <g key={y}><rect x="64" y={y} width="12" height="12" fill={i === variant ? "var(--color-red)" : "currentColor"} stroke="none" /><path d={`M91 ${y + 2}H${235 - i * 18}M91 ${y + 13}H${204 + i * 8}`} /></g>)}
        </>}
        {service.category === "tracking" && <>
          <path d="M78 61L159 102L246 51M159 102L242 157M159 102L75 156" />
          {[[78, 61], [246, 51], [242, 157], [75, 156]].map(([x, y], i) => <rect key={x} x={x - 13} y={y - 13} width="26" height="26" rx={i === variant ? 13 : 3} fill="var(--color-soft)" />)}
          <circle cx="159" cy="102" r="26" fill="var(--color-red)" stroke="none" /><path d="M149 102H169M159 92V112" stroke="var(--color-white)" />
        </>}
        {service.category === "ads" && <>
          {[64, 125, 186].map((x, i) => <g key={x} transform={`translate(0 ${i === variant ? -8 : 8})`}><rect x={x} y="49" width="57" height="101" rx="4" fill="var(--color-soft)" /><rect x={x + 8} y="60" width="41" height="42" fill={i === variant ? "var(--color-red)" : "var(--color-ink)"} stroke="none" /><path d={`M${x + 8} 117H${x + 47}M${x + 8} 129H${x + 34}`} /></g>)}
          <path d="M100 175H225M218 169L225 175L218 181" />
        </>}
        {service.category === "strategy" && <>
          <path d="M72 146H147V98H230V53" strokeWidth="3" />
          {[[72, 146], [147, 98], [230, 53]].map(([x, y], i) => <g key={x}><rect x={x - 24} y={y - 19} width="48" height="38" rx="3" fill={i === variant ? "var(--color-red)" : "var(--color-soft)"} /><path d={`M${x - 12} ${y - 3}H${x + 12}M${x - 12} ${y + 6}H${x + 5}`} stroke={i === variant ? "var(--color-white)" : "currentColor"} /></g>)}
        </>}
        {service.category === "career" && <>
          <rect x="97" y="26" width="132" height="153" rx="3" fill="var(--color-soft)" />
          <circle cx="126" cy="58" r="13" fill="var(--color-red)" stroke="none" /><path d="M151 52H210M151 64H194" />
          {[91, 117, 143].map((y, i) => <g key={y}><path d={`M114 ${y}H${i === variant ? 210 : 196}M114 ${y + 10}H180`} /><rect x="83" y={y - 3} width="7" height="14" fill={i === variant ? "var(--color-red)" : "currentColor"} stroke="none" /></g>)}
        </>}
      </g>
    </svg>
  </div>
}
