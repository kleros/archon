import fs from 'fs'
import path from 'path'

import Web3 from 'web3'
import solc from 'solc'

export const _deplyTestArbitrableContract = async (provider, account) => {
  // compile contract
  const inputFile = fs.readFileSync(
    path.resolve(__dirname, './contracts/TestArbitrable.sol')
  )
  const compiledContract = solc.compile(inputFile.toString(), 1)
  const bytecode = compiledContract.contracts[':TestArbitrable'].bytecode
  const abi = JSON.parse(
    compiledContract.contracts[':TestArbitrable'].interface
  )
  // web3 contract
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(abi)
  // deploy
  return contract
    .deploy({
      data: bytecode
    })
    .send({
      from: account,
      gas: 500000
    })
}

export const _deplyTestArbitratorContract = async (provider, account) => {
  // compile contract
  const inputFile = fs.readFileSync(
    path.resolve(__dirname, './contracts/TestArbitrator.sol')
  )
  const compiledContract = solc.compile(inputFile.toString(), 1)
  const bytecode = compiledContract.contracts[':TestArbitrator'].bytecode
  const abi = JSON.parse(
    compiledContract.contracts[':TestArbitrator'].interface
  )
  // web3 contract
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(abi)

  // deploy
  return contract
    .deploy({
      data: bytecode
    })
    .send({
      from: account,
      gas: 500000
    })
}
