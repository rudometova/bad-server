export const sanitizeQuery = (query: any) => {
    if (typeof query !== 'object' || !query) return query
    const clean: any = {}

    Object.keys(query).forEach((key) => {
        if (key.startsWith('$')) return

        const value = query[key]
        if (typeof value === 'object' && value !== null) {
            clean[key] = sanitizeQuery(value)
        } else {
            clean[key] = value
        }
    })

    return clean
}

export const escapeRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')