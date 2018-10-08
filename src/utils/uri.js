export const getURISuffix = uri => uri.split('/').pop()

export const getURIProtocol = uri => uri.replace('/', '').substr(0, 4)

export const getHttpUri = uri => {
  const protocol = getURIProtocol(uri)

  let preValidated = false
  switch (protocol) {
    case 'http':
      break
    case 'ipfs':
      const ipfsID = getURISuffix(uri)
      uri = `${process.env.IPFS_GATEWAY_URI}/${ipfsID}`
      preValidated = true
      break
    default:
      throw new Error(`Unrecognized protocol ${protocol}`)
  }

  return {
    uri,
    preValidated
  }
}
