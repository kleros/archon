import fs from 'fs'
import path from 'path'
import Web3 from 'web3'
import solc from 'solc'

export const _deplyTestArbitrableContract = async (provider) => {
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
  const accounts = await web3.eth.getAccounts()
  const contract = new web3.eth.Contract(abi)
  // deploy
  return contract
    .deploy({
      data: bytecode
    })
    .send({
      from: accounts[0],
      gas: 500000
    })
}
