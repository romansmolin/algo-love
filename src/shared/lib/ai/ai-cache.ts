import 'server-only'

import { createHash } from 'node:crypto'

const canonicalize = (value: unknown): unknown => {
    if (value === null || typeof value !== 'object') return value
    if (Array.isArray(value)) return value.map(canonicalize)

    const obj = value as Record<string, unknown>
    const sortedKeys = Object.keys(obj).sort()
    const out: Record<string, unknown> = {}
    for (const key of sortedKeys) {
        out[key] = canonicalize(obj[key])
    }
    return out
}

export const computeInputHash = (input: unknown): string => {
    const canonical = JSON.stringify(canonicalize(input))
    return createHash('sha256').update(canonical, 'utf8').digest('hex')
}

export const floorToMinute = (date: Date): Date => {
    const copy = new Date(date.getTime())
    copy.setUTCSeconds(0, 0)
    return copy
}
