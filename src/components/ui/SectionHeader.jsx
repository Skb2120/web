export default function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-10 max-w-3xl text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-sm leading-7 text-cyan-100/72 md:text-base">{description}</p>}
    </div>
  )
}
