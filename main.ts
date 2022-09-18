import { AbiItem, toChecksumAddress,  } from 'web3-utils'
import Web3 from 'web3'
import { Configuration, OpenAIApi } from "openai";

import { client } from './utils/axiosClient'

require("dotenv").config()

type NetworksT = {[chainId: string]: {
  networkName: string,
  providerUrlHost: string,
  etherscanAPIHost: string,
  ehterscanAPIKey: string
}}

const parseFunctionCodeByName = (functionName: string, SCcode: string): string => {
  // parse data from the contract code to get needed method
  // TODO: rewrite for quallity parsing :)
  if (SCcode.indexOf(functionName) == -1) return ''

  let functionData1 = SCcode.substring(0, SCcode.indexOf(functionName))
  let functionData2 = SCcode.substring(SCcode.indexOf(functionName))
  functionData2 = functionData2.substring(0, functionData2.indexOf('function'))

  functionData1 = functionData1.substring(functionData1.lastIndexOf('}') + 1)
  functionData2 = functionData2.substring(0, functionData2.lastIndexOf('}'))
  return functionData1 + functionData2
}



export const main = async (txHash: string, chainId = '4'): Promise<string> => {

  if (txHash.length != 66) return 'ERROR incorrect transaction hash'

  const networks: NetworksT = {
    '4': { 
      networkName: 'rinkeby',
      providerUrlHost: 'https://rinkeby.infura.io/v3/',
      etherscanAPIHost: 'https://api.bscscan.com/api',
      ehterscanAPIKey: process.env.BSCSCAN_API_TOKEN || ''
    },
    '1': { 
      networkName: 'ethereum',
      providerUrlHost: 'https://mainnet.infura.io/v3/',
      etherscanAPIHost: 'https://api.etherscan.com/api',
      ehterscanAPIKey: process.env.ETHERSCAN_API_TOKEN || ''
    }
  }

  if (!networks[chainId]) return `The chainId ${chainId} is not supported`

  const web3 = new Web3(new Web3.providers.HttpProvider(
    `${networks[chainId].providerUrlHost}${process.env.INFURA_API_KEY}`
  ))

  // Getting txData for parsing to address and methodId
  const txData = await web3.eth.getTransaction(txHash)
  if (!txData) return 'ERROR: tx data was not found'

  if (txData.to === null) {
    console.log('contract creation')
    return 'Creation of the contract'
  }

  // Check if it is a contract interaction
  const contractCode = await web3.eth.getCode(txData.to!)
  if (contractCode == '0x') {
    console.error('not a contract interaction')
    return `ERROR: Not a contract interaction`
  }
  
  const contractAddress = txData.to!

  const contractDatas: {contractABI: string, contractCodeData: string}[] = []

  // Get Smartcontract ABI + Source code
  const ehterscanAPIClient = await client(networks[chainId].etherscanAPIHost)
  try {
    const { data } = await ehterscanAPIClient.get(`?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${networks[chainId].ehterscanAPIKey}`)
    if (data.result[0] && data.result[0].ABI == 'Contract source code not verified') {
      console.error('Contract source code not verified')
      // internal mapping

      // try to get code from 4byte

      // else if decompile
      return `ERROR: Contract source code is not added yet to etherscan`
    } else {
      data.result.forEach((result: any) => {
        contractDatas.push({
          contractCodeData: result.SourceCode,
          contractABI: result.ABI
        })
      })
    }
  } catch (e) {
    console.error(e)
    return `Error: ${e.message}`
  }

  let functionData
  let functionName

  // Find corresponding function name and data for methodId
  const methodId = txData.input.substring(0, 10)
  for (const contractData of contractDatas) {
    JSON.parse(contractData.contractABI).forEach((abiElement: AbiItem) => {
      if (abiElement.type != 'function') return null
      if (methodId == web3.eth.abi.encodeFunctionSignature(abiElement)) {
        functionName = abiElement.name
        functionData = parseFunctionCodeByName(functionName!, contractData.contractCodeData)
      }
    })
    if (functionName) break
  }


  // Set up a prompt regarding function name and if function source code exists
  let prompt
  if (functionName && functionData) {
    prompt = `explain ${functionName} function:\n ${functionData}. \n\n`
  } else if (functionName) {
    prompt = `Explain ${functionName} in Smart Contracts in one sentence. \n`
  } else {
    console.error('no function for this input data was found')
    return `ERROR no function for this input data was found`
  }


  // Get text data from the openAI by our prompt
  const configuration = new Configuration({
    organization: "org-oK2TwB88fG2WfVMTGCDByiZQ",
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const {data} = await openai.createCompletion({
    model: "text-davinci-002",
    prompt,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })

  return  data.choices && data.choices[0] && `You are about to execute "${functionName}" method:\n` + data.choices[0].text || 'ERROR: no data from openAI'
}

// 0x05330c4512eae8098784aede0155a3e7d2f821a6a200d87569dc96fd280f910a
// 0xaffc2aaa46a45c4578453e088a3b6042974bb6e64ed8e4cecc7c6460e9e204da
// 0x1e67d8b63ee8343194d01691694884ac711f892d4d17e7b0f4d015abaffbe691