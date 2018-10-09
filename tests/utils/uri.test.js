/* eslint-disable prettier/prettier */
import {
  getURIProtocol,
  getHttpUri
} from '../../src/utils/uri'

describe('URI', () => {
  describe('getURIProtocol', () => {
    it('http://', () => {
      const testURI = 'http://test.com'

      expect(getURIProtocol(testURI)).toEqual('http')
    })
    it('https://', () => {
      const testURI = 'https://test.com'

      expect(getURIProtocol(testURI)).toEqual('https')
    })
    it('/ipfs/', () => {
      const testURI = '/ipfs/hash'

      expect(getURIProtocol(testURI)).toEqual('ipfs')
    })
    it('ipfs:/', () => {
      const testURI = 'ipfs:/ipfs/hash'

      expect(getURIProtocol(testURI)).toEqual('ipfs')
    })
    it('fs:/', () => {
      const testURI = 'fs:/ipfs/hash'

      expect(getURIProtocol(testURI)).toEqual('fs')
    })
  })
  describe('getHttpUri', () => {
    let ipfsGateway

    beforeAll(() => {
      ipfsGateway = 'https://gateway.ipfs.io'
      process.env.IPFS_GATEWAY_URI = ipfsGateway
    })

    it('http://', () => {
      const testURI = 'http://test.com'

      const uriData = getHttpUri(testURI)
      expect(uriData.uri).toEqual(testURI)
      expect(uriData.preValidated).toBeFalsy()
    })
    it('https://', () => {
      const testURI = 'https://test.com'

      const uriData = getHttpUri(testURI)
      expect(uriData.uri).toEqual(testURI)
      expect(uriData.preValidated).toBeFalsy()
    })
    it('/ipfs/', () => {
      const testURI = '/ipfs/hash'

      const uriData = getHttpUri(testURI)
      expect(uriData.uri).toEqual(`${ipfsGateway}/${testURI}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('ipfs/', () => {
      const testURI = 'ipfs/hash'

      const uriData = getHttpUri(testURI)
      expect(uriData.uri).toEqual(`${ipfsGateway}/${testURI}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('ipfs:/', () => {
      const uriSuffix = 'ipfs/hash'
      const testURI = `ipfs:/${uriSuffix}`

      const uriData = getHttpUri(testURI)
      expect(uriData.uri).toEqual(`${ipfsGateway}/${uriSuffix}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('ipfs://', () => {
      const uriSuffix = 'ipfs/hash'
      const testURI = `ipfs://${uriSuffix}`

      const uriData = getHttpUri(testURI)
      expect(uriData.uri).toEqual(`${ipfsGateway}/${uriSuffix}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('fs:/', () => {
      const uriSuffix = 'ipfs/hash'
      const testURI = `fs:/${uriSuffix}`

      const uriData = getHttpUri(testURI)
      expect(uriData.uri).toEqual(`${ipfsGateway}/${uriSuffix}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('fs://', () => {
      const uriSuffix = '/ipfs/hash'
      const testURI = `fs:/${uriSuffix}`

      const uriData = getHttpUri(testURI)
      expect(uriData.uri).toEqual(`${ipfsGateway}/${uriSuffix}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('fs:/ non ipfs', () => {
      const testURI = 'fs:/usr/local/bin'

      let errored = false
      try {
        getHttpUri(testURI)
      } catch (err) {
        expect(err).toBeTruthy()
        errored = true
      }
      expect(errored).toBeTruthy()
    })
    it('Unrecognized protocol', () => {
      const testURI = 'kleros://test.com'

      let errored = false
      try {
        getHttpUri(testURI)
      } catch (err) {
        expect(err).toBeTruthy()
        errored = true
      }
      expect(errored).toBeTruthy()
    })
  })
})
