export interface RuntimeCapabilities {
  packaged: boolean
  liveProviders: boolean
}

export function getRuntimeCapabilities(target: Window = window): RuntimeCapabilities {
  const packaged = '__TAURI_INTERNALS__' in target
  return {
    packaged,
    liveProviders: !packaged,
  }
}

