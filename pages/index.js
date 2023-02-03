import styles from "../styles/Home.module.css";
import { useMemo, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { MetaplexProvider } from "../components/MetaplexProvider";
import { MintNFTs } from "../components/MintNFTs";
import { ShowNFTs } from "../components/ShowNFTs";
import "@solana/wallet-adapter-react-ui/styles.css";
import dynamic from "next/dynamic";
import Head from "next/head";

export default function Home() {
  const [network, setNetwork] = useState(
    process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL
  );
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL,
    [network]
  );
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  const handleChange = (event) => {
    switch (event.target.value) {
      // case "devnet":
      // 	setNetwork(WalletAdapterNetwork.Devnet);
      // 	break;
      case "mainnet":
        setNetwork(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
        break;
      // case "testnet":
      // 	setNetwork(WalletAdapterNetwork.Testnet);
      // 	break;
      default:
        setNetwork(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
        break;
    }
  };

  const ButtonWrapper = dynamic(() =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    )
  );

  useEffect(() => {
    document.title = "Echo Forest NFT";
  }, []);

  return (
    <>
      <div>
       <h2 className="text-center md:text-lg pt-4">
          We are using Vercel hosting server for Mint as Sugar V3 supports NEXT
          JS
        </h2>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <MetaplexProvider>
                <div className={styles.App}>
                  <WalletMultiButton />
                  {/* <ButtonWrapper /> */}
                  {/* <ShowNFTs onClusterChange={handleChange} /> */}
                  <MintNFTs onClusterChange={handleChange} />
                </div>
              </MetaplexProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </div>
    </>
  );
}
