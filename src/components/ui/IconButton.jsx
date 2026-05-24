import clsx from 'clsx'

export default function IconButton({ icon: Icon, label, className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        'grid h-10 w-10 place-items-center rounded-lg border border-cyan-300/20 bg-slate-950/70 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,.12)] transition hover:border-emerald-300/50 hover:text-emerald-200',
        className,
      )}
      {...props}
    >
      <Icon size={18} />
    </button>
  )
}
