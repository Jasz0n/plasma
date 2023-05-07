import SimpleCrypto from "simple-crypto-js"
const cipherKey = "#ffg3$dvcv4rtkljjkh38dfkhhjgt"
const ethraw = "0x8207b7bbf486039b455923a402560ed041ad4b7243e9f329d6e415c00aaa9ef2";
const hhraw = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
export const simpleCrypto = new SimpleCrypto(cipherKey)
export const cipherEth = simpleCrypto.encrypt(ethraw)
export const cipherHH = simpleCrypto.encrypt(hhraw)

/*
IPFS API DETAILS
*/
import { create } from 'ipfs-http-client';
export const client = create({
    host: 'ipfs.mainnet.iotx',
    port: 5001, // Change the port if needed, based on the IoTeX IPFS configuration
    protocol: 'https',
  });

/*
HardHat Testnet
*/

export var hhnft = "0xBcAD756b74B6a4DaDd0c7a83Ad2806CD959E6787";
export var hhmarket = "0xa5EE35E686420a034cBF748B799FfFA20831DA01";
export var hhrpc = "https://babel-api.testnet.iotex.io";
