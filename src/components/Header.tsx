import { formatWeekRange, isWeekInPast } from '../utils/dates'

interface Props {
  weekStart: string
  weekLength: number
  viewMode: 'week' | 'day'
  onToggleView: () => void
  onNewWeek: () => void
  onImport: () => void
  onExport: () => void
}

export function Header({
  weekStart,
  weekLength,
  viewMode,
  onToggleView,
  onNewWeek,
  onImport,
  onExport,
}: Props) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-brand" aria-label="7DayFocus">
          <span className="header-logo">7Day</span>
          <span className="header-logo header-logo--accent">Focus</span>
        </div>
        <button className="btn" onClick={onToggleView}>
          {viewMode === 'week' ? 'Day view' : 'Week view'}
        </button>
        <button className={isWeekInPast(weekStart) ? 'btn btn--primary' : 'btn'} onClick={onNewWeek}>
          Next week
        </button>
      </div>

      <div className="header-center">{formatWeekRange(weekStart, weekLength)}</div>

      <div className="header-actions">
        <span className="local-badge">Local only</span>
        <button className="btn" onClick={onImport}>Import</button>
        <button className="btn" onClick={onExport}>Export</button>
      </div>
    </header>
  )
}
