import { describe, expect, test } from 'bun:test'
import { resolveProductProfile } from './product-profile'

describe('product profile', () => {
  test('defaults the fork to Magic Cabinet while preserving an explicit Pascal restore path', () => {
    expect(resolveProductProfile()).toBe('magic-cabinet')
    expect(resolveProductProfile('magic-cabinet')).toBe('magic-cabinet')
    expect(resolveProductProfile('pascal')).toBe('pascal')
  })
})
