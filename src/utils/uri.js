export const getURISuffix = uri => uri.split('/').pop()

export const getURIProtocol = uri => uri.split(':')[0].toLowerCase()
