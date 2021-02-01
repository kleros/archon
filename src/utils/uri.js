/* eslint-disable no-fallthrough */
export const getURISuffix = uri => uri.split('/').pop()

export const getURIProtocol = uri => {
  const uriParts = uri.replace(':', '').split('/')
  switch (uri.substr(0, 1)) {
    case '/':
      return uriParts[1]
    default:
      return uriParts[0]
  }
}

export const getHttpUri = (uri, ipfsGateway) => {
  const protocol = getURIProtocol(uri)
  let preValidated = false
  switch (protocol) {
    case 'http':
      break
    case 'https': {
      if (ipfsGateway === 'https://ipfs.kleros.io') preValidated = true
      break
    } case 'fs':
      // check to see if fs is appended by /ipfs/
      if (uri.includes('/ipfs/')) uri = uri.split(':/').pop()
      else throw new Error(`Unrecognized protocol ${protocol}`)
    case 'ipfs':
      // NOTE the current WIP standard for IPFS uris: https://github.com/ipfs/go-ipfs/issues/1678#issuecomment-157478515
      // :// -> :/
      uri = uri.replace('://', ':/')
      // NURI
      if (uri.substr(0, 5) === '/ipfs' || uri.substr(0, 5) === 'ipfs/') {
        if (uri.substr(0, 1) === '/') uri = uri.substr(1, uri.length - 1)
        uri = `${ipfsGateway}/${uri}`
      }
      // compatability scheme
      else if (uri.substr(0, 6) === 'ipfs:/')
        uri = `${ipfsGateway}/${uri.split(':/').pop()}`
      else throw new Error(`Unrecognized protocol ${protocol}`)

      preValidated = true
      break
    case 'ipns':
      // TODO we cannot validate these right now
      break
    default:
      throw new Error(`Unrecognized protocol ${protocol}`)
  }

  return {
    uri,
    preValidated
  }
}
