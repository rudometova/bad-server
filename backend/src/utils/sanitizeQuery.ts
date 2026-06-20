export const sanitizeQuery = (query: any) => {
    if (typeof query !== 'object' || !query) return query
    const clean: any = {}
    for (const key in query) {
        if (key.startsWith('$')) continue
        const value = query[key]
        if (typeof value === 'object' && value !== null) {
            clean[key] = sanitizeQuery(value)
        } else {
            clean[key] = value
        }
    }
    return clean
}

export const escapeRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')