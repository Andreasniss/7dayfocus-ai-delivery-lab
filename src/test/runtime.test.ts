import { describe, expect, it } from 'vitest'
import { getRuntimeCapabilities } from '../lib/runtime'

describe('runtime capabilities', () => {
  it('allows the loopback provider gateway in a normal web runtime', () => {
    expect(getRuntimeCapabilities(window)).toEqual({
      packaged: false,
      liveProviders: true,
    })
  })

  it('disables live providers in the packaged Tauri runtime', () => {
    const packagedWindow = Object.create(window) as Window
    Object.defineProperty(packagedWindow, '__TAURI_INTERNALS__', { value: {}, configurable: true })

    expect(getRuntimeCapabilities(packagedWindow)).toEqual({
      packaged: true,
      liveProviders: false,
    })
  })
})

