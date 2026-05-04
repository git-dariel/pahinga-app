const stretches = [
  { type: 'neck', label: 'Neck', description: 'Relieve neck tension from looking at your screen.' },
  {
    type: 'shoulder',
    label: 'Shoulder',
    description: 'Release shoulder tightness from poor posture.'
  },
  { type: 'wrist', label: 'Wrist', description: 'Reduce wrist strain from typing and mouse use.' },
  {
    type: 'eyes',
    label: 'Eyes (20-20-20)',
    description: 'Rest your eyes to reduce digital eye strain.'
  }
]

export default function StretchGuide(): React.JSX.Element {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Stretch Guide</h1>
        <p className="text-sm text-muted mt-1">
          Quick stretches to ease computer-related discomfort.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {stretches.map(({ type, label, description }) => (
          <div
            key={type}
            className="bg-surface border border-border rounded-xl p-5 hover:border-primary transition-colors cursor-pointer"
          >
            <p className="text-base font-semibold text-foreground">{label}</p>
            <p className="text-sm text-muted mt-1">{description}</p>
            <button className="mt-4 px-4 py-1.5 bg-primary-soft text-primary text-xs font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
              Start
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
