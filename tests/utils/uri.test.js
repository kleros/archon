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
    const ipfsGateway = 'https://gateway.ipfs.io'

    it('http://', () => {
      const testURI = 'http://test.com'

      const uriData = getHttpUri(testURI, ipfsGateway)
      expect(uriData.uri).toEqual(testURI)
      expect(uriData.preValidated).toBeFalsy()
    })
    it('https://', () => {
      const testURI = 'https://test.com'

      const uriData = getHttpUri(testURI, ipfsGateway)
      expect(uriData.uri).toEqual(testURI)
      expect(uriData.preValidated).toBeFalsy()
    })
    it("https://ipfs.kleros.io", () => {
      const testURI = "https://ipfs.kleros.io/ipfs/hash";
      const trustedGateway = "https://ipfs.kleros.io";

      const uriData = getHttpUri(testURI, trustedGateway);
      expect(uriData.uri).toEqual(testURI);
      expect(uriData.preValidated).toBeTruthy();
    });
    it('/ipfs/', () => {
      const testURI = '/ipfs/hash'

      const uriData = getHttpUri(testURI, ipfsGateway)
      expect(uriData.uri).toEqual(`${ipfsGateway}${testURI}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('ipfs/', () => {
      const testURI = 'ipfs/hash'

      const uriData = getHttpUri(testURI, ipfsGateway)
      expect(uriData.uri).toEqual(`${ipfsGateway}/${testURI}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('ipfs:/', () => {
      const uriSuffix = 'ipfs/hash'
      const testURI = `ipfs:/${uriSuffix}`

      const uriData = getHttpUri(testURI, ipfsGateway)
      expect(uriData.uri).toEqual(`${ipfsGateway}/${uriSuffix}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('ipfs://', () => {
      const uriSuffix = 'ipfs/hash'
      const testURI = `ipfs://${uriSuffix}`

      const uriData = getHttpUri(testURI, ipfsGateway)
      expect(uriData.uri).toEqual(`${ipfsGateway}/${uriSuffix}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('fs:/', () => {
      const uriSuffix = 'ipfs/hash'
      const testURI = `fs:/${uriSuffix}`

      const uriData = getHttpUri(testURI, ipfsGateway)
      expect(uriData.uri).toEqual(`${ipfsGateway}/${uriSuffix}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('fs://', () => {
      const uriSuffix = '/ipfs/hash'
      const testURI = `fs:/${uriSuffix}`

      const uriData = getHttpUri(testURI, ipfsGateway)
      expect(uriData.uri).toEqual(`${ipfsGateway}${uriSuffix}`)
      expect(uriData.preValidated).toBeTruthy()
    })
    it('fs:/ non ipfs', () => {
      const testURI = 'fs:/usr/local/bin'

      let errored = false
      try {
        getHttpUri(testURI, ipfsGateway)
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
        getHttpUri(testURI, ipfsGateway)
      } catch (err) {
        expect(err).toBeTruthy()
        errored = true
      }
      expect(errored).toBeTruthy()
    })
  })
})
