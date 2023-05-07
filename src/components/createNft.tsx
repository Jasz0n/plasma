import { ethers } from 'ethers';
import { useState } from 'react';
import { useRouter } from 'next/router';
import NFT from '../engine/NFT.json';
import Market from '../engine/Market.json';
import { hhnft, hhmarket } from '../engine/configuration';
import { Card, Container, Image, Text, Group, Badge, createStyles, Center, Button, Select, TextInput } from '@mantine/core';
import { create } from 'ipfs-http-client';
import 'sf-font';
import MainLayout from './Layout';

const client = create({
  host: 'ipfs.mainnet.iotx',
  port: 5001,
  protocol: 'https',
});

export default function createMarket() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.mainnet.iotx/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function createMarket() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.mainnet.iotx/ipfs/${added.path}`
      createNFT(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function createNFT(url) {
    const iotexProvider = new ethers.providers.JsonRpcProvider('https://rpc.graph.mainnet.iotex.io');
    const signer = iotexProvider.getSigner();
    let contract = new ethers.Contract(hhnft, NFT, signer)
    let transaction = await contract.createNFT(url)
    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    contract = new ethers.Contract(hhmarket, Market, signer)
    let listingFee = await contract.listingFee()
    listingFee = listingFee.toString()
    transaction = await contract.createVaultItem(hhnft, tokenId, price, { value: listingFee })
    await transaction.wait()
    router.push('/')
  }

  async function buyNFT(tokenId) {
    const iotexProvider = new ethers.providers.JsonRpcProvider('https://rpc.graph.mainnet.iotex.io');
    const signer = iotexProvider.getSigner();
    let contract = new ethers.Contract(hhmarket, Market, signer);

    let tokenData = await contract.getVaultItem(tokenId);

    if (!tokenData.isForSale) {
      console.log('This token is not for sale');
      return;
    }

    let transaction = await contract.buyVaultItem(tokenId, { value: tokenData.price });
    await transaction.wait();
    router.push('/success');
  }

  async function mintNFT(url) {
    const iotexProvider = new ethers.providers.JsonRpcProvider('https://rpc.graph.mainnet.iotex.io');
    const signer = iotexProvider.getSigner();
    let contract = new ethers.Contract(hhnft, NFT, signer)
    let cost = await contract.cost()
    let transaction = await contract.mintNFT(url, { value: cost })
    await transaction.wait()
    router.push('/portal')
  }
  return (
    <MainLayout>
    <Container>
      <Card>
        {fileUrl && <img src={fileUrl} alt="Product Preview" />}
        <div>
          <input type="file" onChange={onChange} />
          {fileUrl && <img src={fileUrl} alt="product" />}
        </div>

        <div>
          <label>Name:</label>
          <input
            type="text"
            value={formInput.name}
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <br />
          <label>Description:</label>
          <input
            type="text"
            value={formInput.description}
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
          />
          <br />
          <label>Price (in ETH):</label>
          <input
            type="text"
            value={formInput.price}
            onChange={(e) =>
              updateFormInput({ ...formInput, price: e.target.value })
            }
          />
        </div>

      <Group>
        <Button onClick={createMarket}>Create NFT and List in Market</Button>
        
        <Button onClick={buyNFT}>Mint NFT</Button>
        </Group>
      </Card>
    </Container>
    </MainLayout>
  )
}
