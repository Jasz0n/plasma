import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NFT from '../engine/NFT.json';
import Market from '../engine/Market.json';
import { hhnft, hhmarket } from '../engine/configuration';
import { Card, Container, Image, Text, Group, Badge, createStyles, Center, Button, Select, TextInput } from '@mantine/core';
import MainLayout from '../components/Layout/index';
import * as IPFS from 'ipfs';

export default function Home() {
  const [ipfs, setIpfs] = useState(null);
  const [ipfsReady, setIpfsReady] = useState(false);


  useEffect(() => {
    async function createClient() {
      console.log("Creating IPFS client..."); // Add this line
      try {
        const client = await IPFS.create({
          repo: '/ipfs-' + Math.random(),
          config: {
            Addresses: {
              // ...
            },
          },
        });
        console.log("IPFS client created successfully"); // Add this line
        setIpfs(client);
        setIpfsReady(true);
      } catch (error) {
        console.error('Error creating IPFS client:', error);
      }
    }
  
    createClient();
  }, []);

  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e) {
    console.log("File input onChange triggered"); // Add this line
    if (!ipfs) {
      console.error('IPFS client is not initialized yet');
      return;
    }
  
    const file = e.target.files[0];
    try {
      const added = await ipfs.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      );
      const url = `https://ipfs.mainnet.iotx.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }

  async function createMarket() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const client = await IPFS.create()
      const added = await client.add(data)
      const url = `https://ipfs.mainnet.iotx/ipfs/${added.cid.toString()}`
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
  let listingFee = await contract.getListingFee()
  listingFee = listingFee.toString()
  transaction = await contract.createVaultItem(hhnft, tokenId, price, { value: listingFee })
  await transaction.wait()
  router.push('/')
}

async function buyNFT(tokenId) {
  const iotexProvider = new ethers.providers.JsonRpcProvider("https://rpc.graph.mainnet.iotex.io");
  console.log("IoTeX Provider:", iotexProvider);

  const signer = iotexProvider.getSigner();
  console.log("Signer:", signer);

  let contract = new ethers.Contract(hhmarket, Market, signer);
  console.log("Market Contract:", contract);

  let availableNfts = await contract.getAvailableNft();

  let tokenData = availableNfts.find((nft) => nft.tokenId == tokenId);

  if (!tokenData) {
    console.log("This token is not for sale");
    return;
  }

  let transaction = await contract.MarketSale(tokenData.nftContract, tokenId, { value: tokenData.price });
  await transaction.wait();
  router.push("/success");
}

  async function mintNFT() {
    const { name, description } = formInput;
    if (!name || !description || !fileUrl) return;
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
  
    try {
      const client = await IPFS.create();
      const added = await client.add(data);
      const url = `https://ipfs.mainnet.iotx.io/ipfs/${added.cid.toString()}`;
      const iotexProvider = new ethers.providers.JsonRpcProvider(
        "https://rpc.graph.mainnet.iotex.io"
      );
      const signer = iotexProvider.getSigner();
      let contract = new ethers.Contract(hhnft, NFT, signer);
      let cost = await contract.cost();
      let transaction = await contract.mintNFT(url, { value: cost });
      await transaction.wait();
      router.push("/portal");
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  return (
    <MainLayout>
    <Container>
      <Card>
        {fileUrl && <img src={fileUrl} alt="Product Preview" />}
        <div>
        <input
  type="file"
  name="Asset"
  className="form-input"
  onChange={onChange}
  disabled={!ipfsReady} // Add this line
/>
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
