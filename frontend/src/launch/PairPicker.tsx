import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { PairToken } from './api'
import { isStock, pairName } from './launchModel'

// The quote asset for a launch: ETH or one of the ERC-20s the factory approves. A button carries the
// chosen asset's mark and ticker; it opens a searchable list of the same, grouped crypto then stocks.
type Props = { pairs: PairToken[]; value: `0x${string}`; onChange: (address: string) => void; disabled?: boolean; labelledBy: string; describedBy?: string }

const ZERO = '0x0000000000000000000000000000000000000000'
// Marks live in public/pairs by lower-case ticker (see public/ASSETS.md); USDG is the one raster.
const logoOf = (symbol: string) => `/pairs/${symbol.toLowerCase()}.${symbol === 'USDG' ? 'png' : 'svg'}`

// The asset's mark, or its first letters when the file is missing or fails to load.
export function PairMark({ symbol }: { symbol: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="pad-pair-mark" aria-hidden="true">{symbol.slice(0, 3)}</span>
  return <img className="pad-pair-mark" src={logoOf(symbol)} alt="" width="24" height="24" decoding="async" onError={() => setFailed(true)} />
}

export default function PairPicker({ pairs, value, onChange, disabled, labelledBy, describedBy }: Props) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)

  const selected = pairs.find(pair => pair.address.toLowerCase() === value.toLowerCase()) ?? pairs[0] ?? null
  const needle = query.trim().toLowerCase()
  const matches = (pair: PairToken) => !needle || pair.symbol.toLowerCase().includes(needle) || pairName(pair).toLowerCase().includes(needle)
  const groups: { label: string | null; items: PairToken[] }[] = [
    { label: null, items: pairs.filter(pair => pair.address === ZERO && matches(pair)) },
    { label: 'Crypto and dollars', items: pairs.filter(pair => pair.address !== ZERO && !isStock(pair) && matches(pair)) },
    { label: 'Robinhood stock tokens', items: pairs.filter(pair => isStock(pair) && matches(pair)) },
  ]
  const visible = groups.flatMap(group => group.items)

  function show() {
    if (disabled) return
    setQuery(''); setOpen(true)
    // The list is grouped, so the selected row's position is its place in the grouped order, not in `pairs`.
    const ordered = [...pairs.filter(pair => pair.address === ZERO), ...pairs.filter(pair => pair.address !== ZERO && !isStock(pair)), ...pairs.filter(isStock)]
    setActive(Math.max(0, ordered.findIndex(pair => pair.address === selected?.address)))
  }
  function hide(refocus = false) { setOpen(false); if (refocus) button.current?.focus() }
  function choose(pair: PairToken) { onChange(pair.address); hide(true) }

  useEffect(() => { if (open) search.current?.focus() }, [open])
  useEffect(() => {
    if (!open) return
    const away = (event: PointerEvent) => { if (root.current && !root.current.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])
  useEffect(() => { if (open) list.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }) }, [open, active])

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); hide(true); return }
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => Math.min(visible.length - 1, index + 1)); return }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(0, index - 1)); return }
    if (event.key === 'Enter') { event.preventDefault(); const pair = visible[active]; if (pair) choose(pair); return }
    if (event.key === 'Tab') hide()
  }

  let index = -1
  return <div className="pad-pair" ref={root}>
    <button ref={button} type="button" className="pad-pair-button" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined} aria-labelledby={`${labelledBy} ${id}-value`} aria-describedby={describedBy} disabled={disabled}
      onClick={() => open ? hide() : show()} onKeyDown={event => { if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) { event.preventDefault(); show() } }}>
      {selected ? <><PairMark symbol={selected.symbol} /><span id={`${id}-value`}>{selected.symbol}</span></> : <span id={`${id}-value`}>…</span>}
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
    </button>
    {open && <div className="pad-pair-menu" onKeyDown={onKey}>
      <input ref={search} className="pad-pair-search" type="search" value={query} onChange={event => { setQuery(event.target.value); setActive(0) }} placeholder="Search by ticker or name" aria-label="Search pair assets" aria-controls={`${id}-list`} aria-activedescendant={visible[active] ? `${id}-${visible[active]!.address}` : undefined} autoComplete="off" />
      <ul ref={list} id={`${id}-list`} className="pad-pair-list" role="listbox" aria-labelledby={labelledBy}>
        {groups.map(group => group.items.length === 0 ? null : <li key={group.label ?? 'eth'} role="presentation">
          {group.label && <div className="pad-pair-group" aria-hidden="true">{group.label}</div>}
          <ul role="group" aria-label={group.label ?? 'Ether'} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {group.items.map(pair => { index++; const at = index; return <li key={pair.address} id={`${id}-${pair.address}`} className="pad-pair-option" role="option" aria-selected={pair.address === selected?.address} data-active={at === active}
              onPointerMove={() => setActive(at)} onClick={() => choose(pair)}><PairMark symbol={pair.symbol} />{pair.symbol}</li> })}
          </ul>
        </li>)}
        {visible.length === 0 && <li className="pad-pair-empty" role="presentation">No pair matches “{query}”.</li>}
      </ul>
    </div>}
  </div>
}
