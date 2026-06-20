import { colorSchemes } from "../assets/assets"

const ColorSchemeSelector = ({ value, onChange }: { value: string; onChange: (id: string) => void }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-200">Color Scheme</label>
      <div className="grid grid-cols-2 gap-2">
        {colorSchemes.map((scheme) => (
          <button
            key={scheme.id}
            onClick={() => onChange(scheme.id)}
            className={`flex items-center p-2 rounded-lg border ${value === scheme.id ? 'ring-2 ring-pink-500' : 'border-white/20'} transition-colors hover:bg-white/10`}
            title={scheme.name}
          >
            <span className="text-xs mr-2 text-zinc-200 flex-shrink-0 w-12">{scheme.name}</span>
            <div className="flex flex-wrap gap-0.5">
              {scheme.colors.map((color, i) => (
                <div key={i} className="w-5 h-5 rounded" style={{ backgroundColor: color }} />
              ))}
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-zinc-400">
        Selected: {colorSchemes.find((s) => s.id === value)?.name}
      </p>
    </div>
  )
}

export default ColorSchemeSelector
