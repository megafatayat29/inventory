import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

type SearchableSelectProps = {
  value: string
  onChange: (value: string) => void
  options: string[]
  allLabel?: string
  searchPlaceholder?: string
  className?: string
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  allLabel = 'Semua',
  searchPlaceholder = 'Cari...',
  className = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((opt) => opt.toLowerCase().includes(q))
  }, [options, query])

  function handleSelect(nextValue: string) {
    onChange(nextValue)
    setIsOpen(false)
    setQuery('')
  }

  function handleToggle() {
    setIsOpen((prev) => {
      const next = !prev
      if (next) {
        setQuery('')
        requestAnimationFrame(() => inputRef.current?.focus())
      }
      return next
    })
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
      >
        <span className="truncate text-slate-800">{value || allLabel}</span>
        <ChevronDown size={16} className="text-slate-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-sm focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Bersihkan pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 ${
                  value === '' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                }`}
              >
                {allLabel}
              </button>
            </li>

            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400">Tidak ditemukan</li>
            ) : (
              filteredOptions.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 ${
                      value === opt ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
