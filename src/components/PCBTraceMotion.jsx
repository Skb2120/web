export default function PCBTraceMotion({ density = 'normal', variant = 'flow' }) {
  const compact = density === 'compact'

  return (
    <div className={`pcb-trace-motion pcb-trace-${variant}`} aria-hidden="true">
      <svg className="pcb-trace-svg" viewBox="0 0 1200 420" preserveAspectRatio="none">
        <defs>
          <filter id="pcb-blue-glow" x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className="pcb-trace-grid" filter="url(#pcb-blue-glow)">
          <path d="M-40 92 H180 V152 H360 V96 H570 V146 H760 V88 H1240" />
          <path d="M-20 290 H130 V236 H300 V306 H490 V246 H710 V298 H1240" />
          <path d="M96 -20 V92 M360 96 V222 H506 M760 88 V188 H912 V330" />
          <path d="M184 420 V328 H292 V238 M570 146 V224 H664 V420" />
          {!compact && <path d="M0 198 H220 V182 H450 V210 H620 V184 H830 V220 H1200" />}
          {!compact && <path d="M1010 0 V88 H1088 V202 H1172 V420 M430 0 V96" />}
        </g>
        <g className="pcb-trace-nodes">
          {[
            [180, 92],
            [360, 152],
            [570, 146],
            [760, 88],
            [130, 290],
            [490, 306],
            [710, 298],
            [912, 188],
            [1088, 202],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
          ))}
        </g>
      </svg>
    </div>
  )
}
