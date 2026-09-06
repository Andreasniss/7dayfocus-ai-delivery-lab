import { formatWeekRange, isWeekInPast } from '../utils/dates'

interface Props {
  weekStart: string
  weekLength: number
  viewMode: 'week' | 'day'
  onToggleView: () => void
  onNewWeek: () => void
  onImport: () => void
  onExport: () => void
  exportEnabled?: boolean
}

export function Header({
  weekStart,
  weekLength,
  viewMode,
  onToggleView,
  onNewWeek,
  onImport,
  onExport,
  exportEnabled = true,
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
        <button className={isWeekInPast(weekStart, weekLength) ? 'btn btn--primary' : 'btn'} onClick={onNewWeek}>
          Next week
        </button>
      </div>

      <div className="header-center">{formatWeekRange(weekStart, weekLength)}</div>

      <div className="header-actions">
        <span className="local-badge">Local only</span>
        <button className="btn" onClick={onImport}>Import</button>
        <button
          className="btn"
          onClick={onExport}
          disabled={!exportEnabled}
          aria-describedby={!exportEnabled ? 'android-export-note' : undefined}
        >Export</button>
        {!exportEnabled ? (
          <span id="android-export-note" className="header-export-note">
            JSON export is unavailable in this Android build. Use disposable demo data only.
          </span>
        ) : null}
      </div>
    </header>
  )
}
