import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {useEffect, useRef, useState} from "react";
import {Contract, providers, utils} from "ethers";
import {PromisesNFTAddress} from "../contracts/PromisesNFTAddress";
import {PromisesNFTAbi} from "../contracts/PromisesNFTAbi";
import Web3Modal from "web3modal";

export default function Home() {
    const [walletConnected, setWalletConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
    const web3ModalRef = useRef();

    const publicMint = async () => {
        try {
            console.log(" Minting my dude");
            const signer = await getProviderOrSigner(true);
            const nftContract = new Contract(PromisesNFTAddress, PromisesNFTAbi, signer);
            const tx = await nftContract.mint({
                value: utils.parseEther("0.00001")
            })
            setLoading(true);
            await tx.wait();
            setLoading(false);
            window.alert("You succesfully minted a NFT from Brandon");
        } catch (error) {
            console.error(error);
        }
    }

    const checkTokenURI= async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const nftContract = new Contract(PromisesNFTAddress, PromisesNFTAbi, signer);
            const result = await nftContract.tokenURI(1);
            console.log("Whats the base URI", result)
        } catch (error) {
            console.error(error)
        }
    }

    const connectWallet = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // When used for the first time, it prompts the user to connect their wallet
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (err) {
            console.error(err);
        }
    };

    const getTokenIdsMinted = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(PromisesNFTAddress, PromisesNFTAbi, provider);
            const _tokenIds = await nftContract.tokenIds();
            console.log("Token IDS: ", _tokenIds);
            setTokenIdsMinted(_tokenIds.toString());
        } catch (error) {
            console.error(error);
        }
    }

    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        // @ts-ignore
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        // If user is not connected to the Mumbai network, let them know and throw an error
        const {chainId} = await web3Provider.getNetwork();
        if (chainId !== 5) {
            window.alert("Change the network to Goerli");
            throw new Error("Change network to Goerli");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };

    useEffect(() => {
        if (!walletConnected) {
            // @ts-ignore
            web3ModalRef.current = new Web3Modal({
                network: "goerli",
                providerOptions: {},
                disableInjectedProvider: false,
            })

            connectWallet();
            getTokenIdsMinted();
            checkTokenURI();
            setInterval(async () => {
                await getTokenIdsMinted()
            }, 5*1000)
        }
    }, [walletConnected])

    const renderButton = () => {
        if(!walletConnected) {
            return (
                <button onClick={connectWallet} className={styles.button}>
                    Connect Your Wallet
                </button>
            )
        }

        if(loading) {
            return <button className={styles.button}>Loading...</button>
        }

        return (
            <button className={styles.button} onClick={publicMint}>
                Miiiiiiiiiiiinnt
            </button>
        )
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Brandon's NFT Pile</title>
                <meta name="description" content="Some NFTs"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Welcome to Brandons NFT Pile
                </h1>

                <p className={styles.description}>
                    Practice run using IPFS to store the NFT images.
                </p>
                <p className={styles.description}>
                    {tokenIdsMinted}/5 have been minted.
                </p>
                {renderButton()}
            </main>

            <footer className={styles.footer}>
                Made with &#10084; by Timothy Mendez
            </footer>
        </div>
    )
}
