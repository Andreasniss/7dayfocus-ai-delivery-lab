import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  createInitialWeekState,
  materializeAction,
  weekReducer,
} from '../domain/weekState'
import {
  getBrowserStorage,
  loadWeekState,
  persistWeekState,
  removeLegacyState,
} from '../lib/storage'
import type { Action, StorageIssue } from '../types'

export function useWeekStore() {
  const [storage] = useState(getBrowserStorage)
  const [initialLoad] = useState(() => loadWeekState(storage))
  const [state, domainDispatch] = useReducer(
    weekReducer,
    initialLoad.state ?? createInitialWeekState(),
  )
  const [storageIssue, setStorageIssue] = useState<StorageIssue | null>(() => (
    initialLoad.issue ? { kind: 'load', message: initialLoad.issue } : null
  ))
  const [persistenceBlocked, setPersistenceBlocked] = useState(initialLoad.source === 'error')
  const firstPersistencePass = useRef(true)

  useEffect(() => {
    if (persistenceBlocked) return

    if (firstPersistencePass.current) {
      firstPersistencePass.current = false
      if (!initialLoad.needsPersistence) return
    }

    const issue = persistWeekState(storage, state)
    if (issue) {
      setStorageIssue({ kind: 'save', message: issue })
      return
    }

    if (initialLoad.source === 'legacy') removeLegacyState(storage)
    setStorageIssue(current => current?.kind === 'save' ? null : current)
  }, [initialLoad.needsPersistence, initialLoad.source, persistenceBlocked, state, storage])

  const dispatch = useCallback((action: Action) => {
    domainDispatch(materializeAction(action))
  }, [])

  const resolveStorageIssue = useCallback(() => {
    const issue = persistWeekState(storage, state)
    if (issue) {
      setStorageIssue({ kind: 'save', message: issue })
      return
    }

    if (initialLoad.source === 'legacy') removeLegacyState(storage)
    setPersistenceBlocked(false)
    setStorageIssue(null)
  }, [initialLoad.source, state, storage])

  return { state, dispatch, storageIssue, resolveStorageIssue }
}
