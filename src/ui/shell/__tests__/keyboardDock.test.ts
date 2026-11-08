import { describe, expect, it } from 'vitest'
import { keyboardDockTop } from '../keyboardDock'

const base = { layoutHeight: 800, visualHeight: 800, visualTop: 0, scale: 1, editing: true }

describe('keyboardDockTop', () => {
  it('stays sticky when nothing is being edited', () => {
    expect(keyboardDockTop({ ...base, visualHeight: 450, visualTop: 300, editing: false })).toBeNull()
  })

  it('stays sticky when the layout viewport resized with the keyboard (Android resizes-content)', () => {
    expect(keyboardDockTop({ ...base, layoutHeight: 450, visualHeight: 450 })).toBeNull()
  })

  it('ignores small visual-viewport changes such as a collapsing URL bar', () => {
    expect(keyboardDockTop({ ...base, visualHeight: 740, visualTop: 60 })).toBeNull()
  })

  it('pins to the top of the visible area when only the visual viewport shrank (iOS)', () => {
    expect(keyboardDockTop({ ...base, visualHeight: 450, visualTop: 312 })).toBe(312)
  })

  it('stays sticky while pinch-zoomed, which also shrinks the visual viewport', () => {
    expect(keyboardDockTop({ ...base, visualHeight: 400, visualTop: 200, scale: 2 })).toBeNull()
  })

  it('never returns a negative offset (overscroll bounce)', () => {
    expect(keyboardDockTop({ ...base, visualHeight: 450, visualTop: -20 })).toBe(0)
  })
})
