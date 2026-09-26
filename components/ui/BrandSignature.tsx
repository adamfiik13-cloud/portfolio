import Image from "next/image"
import siteConfig from "@/data/site-config.json"

export default function BrandSignature() {
  return (
    <a href="#hero" className="inline-flex min-h-11 min-w-11 items-center gap-3" aria-label="Adam’s Work — Kembali ke atas">
      <Image src="/assets/avatar/avatar-circle-64.png" alt="" width={36} height={36} className="rounded-full shrink-0" />
      <span className="font-display font-semibold text-soft text-base">{siteConfig.name}</span>
    </a>
  )
}
