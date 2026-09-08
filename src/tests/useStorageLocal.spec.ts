import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useStorageLocal } from '../composables/useStorageLocal'

const store = new Map<string, string>()

vi.mock('webextension-polyfill', () => {
  const listeners: Array<(changes: any, area: string) => void> = []
  const browser = {
    runtime: { id: 'test-extension-id' },
    storage: {
      local: {
        get: async (key: string) => ({ [key]: store.get(key) }),
        set: async (items: Record<string, string>) => {
          for (const [k, v] of Object.entries(items))
            store.set(k, v)
        },
        remove: async (key: string) => { store.delete(key) },
      },
      onChanged: { addListener: (fn: any) => listeners.push(fn) },
    },
  }
  return { default: browser, storage: browser.storage }
})

describe('useStorageLocal persistence', () => {
  beforeEach(() => {
    store.clear()
  })

  it('persists changes made after init', async () => {
    const data = useStorageLocal('test-key', { foo: 'bar' })
    await new Promise(r => setTimeout(r, 0))

    data.value.foo = 'baz'
    await new Promise(r => setTimeout(r, 0))

    expect(store.get('test-key')).toBe(JSON.stringify({ foo: 'baz' }))
  })

  it('keeps persisting many consecutive changes', async () => {
    const data = useStorageLocal('test-key-2', 'init')
    await new Promise(r => setTimeout(r, 0))

    for (let i = 0; i < 3; i++) {
      data.value = `value-${i}`
      await new Promise(r => setTimeout(r, 0))
      expect(store.get('test-key-2')).toBe(`value-${i}`)
    }
  })
})
