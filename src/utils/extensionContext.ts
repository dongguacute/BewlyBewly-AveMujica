// default import only — this package is CJS and has no named exports
import browser from 'webextension-polyfill'

/**
 * Detects whether the extension context is still valid.
 * After the extension is reloaded or updated, old content scripts keep running
 * with a nuked runtime binding, and any `browser.*` call throws
 * `Error: Extension context invalidated.`
 */
export function isExtensionContextValid(): boolean {
  try {
    return browser.runtime?.id != null
  }
  catch {
    return false
  }
}
