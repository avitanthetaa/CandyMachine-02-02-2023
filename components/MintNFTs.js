import styles from "../styles/Home.module.css";
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import logo from "../assets/images/logo/echoforest-logo.png";
import Image from "next/image";

export const MintNFTs = ({ onClusterChange }) => {
  const { metaplex } = useMetaplex();
  const wallet = useWallet();

  const [nft, setNft] = useState(null);

  const [disableMint, setDisableMint] = useState(true);

  const candyMachineAddress = new PublicKey(
    process.env.NEXT_PUBLIC_CANDY_MACHINE_ID
  );
  let candyMachine;
  let walletBalance;

  const addListener = async () => {
    // add a listener to monitor changes to the candy guard
    metaplex.connection.onAccountChange(candyMachine.candyGuard.address, () =>
      checkEligibility()
    );

    // add a listener to monitor changes to the user's wallet
    metaplex.connection.onAccountChange(metaplex.identity().publicKey, () =>
      checkEligibility()
    );

    // add a listener to reevaluate if the user is allowed to mint if startDate is reached
    const slot = await metaplex.connection.getSlot();
    const solanaTime = await metaplex.connection.getBlockTime(slot);
    const startDateGuard = candyMachine.candyGuard.guards.startDate;
    if (startDateGuard != null) {
      const candyStartDate = startDateGuard.date.toString(10);
      const refreshTime = candyStartDate - solanaTime.toString(10);
      if (refreshTime > 0) {
        setTimeout(() => checkEligibility(), refreshTime * 1000);
      }
    }

    // also reevaluate eligibility after endDate is reached
    const endDateGuard = candyMachine.candyGuard.guards.endDate;
    if (endDateGuard != null) {
      const candyEndDate = endDateGuard.date.toString(10);
      const refreshTime = solanaTime.toString(10) - candyEndDate;
      if (refreshTime > 0) {
        setTimeout(() => checkEligibility(), refreshTime * 1000);
      }
    }
  };

  const checkEligibility = async () => {
    //wallet not connected?
    if (!wallet.connected) {
      setDisableMint(true);
      return;
    }

    // read candy machine state from chain
    candyMachine = await metaplex
      .candyMachines()
      .findByAddress({ address: candyMachineAddress });

    // enough items available?
    if (
      candyMachine.itemsMinted.toString(10) -
        candyMachine.itemsAvailable.toString(10) >
      0
    ) {
      console.error("not enough items available");
      setDisableMint(true);
      return;
    }

    // // guard checks have to be done for the relevant guard group! Example is for the default groups defined in Part 1 of the CM guide
    // const guard = candyMachine.candyGuard.guards;

    // // Calculate current time based on Solana BlockTime which the on chain program is using - startTime and endTime guards will need that
    const slot = await metaplex.connection.getSlot();
    const solanaTime = await metaplex.connection.getBlockTime(slot);

    // if (guard.startDate != null) {
    //   const candyStartDate = guard.startDate.date.toString(10);
    //   if (solanaTime < candyStartDate) {
    //     console.error("startDate: CM not live yet");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.endDate != null) {
    //   const candyEndDate = guard.endDate.date.toString(10);
    //   if (solanaTime > candyEndDate) {
    //     console.error("endDate: CM not live anymore");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.addressGate != null) {
    //   if (metaplex.identity().publicKey.toBase58() != guard.addressGate.address.toBase58()) {
    //     console.error("addressGate: You are not allowed to mint");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.mintLimit != null) {
    //   const mitLimitCounter = metaplex.candyMachines().pdas().mintLimitCounter({
    //     id: guard.mintLimit.id,
    //     user: metaplex.identity().publicKey,
    //     candyMachine: candyMachine.address,
    //     candyGuard: candyMachine.candyGuard.address,
    //   });
    //   //Read Data from chain
    //   const mintedAmountBuffer = await metaplex.connection.getAccountInfo(mitLimitCounter, "processed");
    //   let mintedAmount;
    //   if (mintedAmountBuffer != null) {
    //     mintedAmount = mintedAmountBuffer.data.readUintLE(0, 1);
    //   }
    //   if (mintedAmount != null && mintedAmount >= guard.mintLimit.limit) {
    //     console.error("mintLimit: mintLimit reached!");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.solPayment != null) {
    //   walletBalance = await metaplex.connection.getBalance(
    //     metaplex.identity().publicKey
    //   );

    //   const costInLamports = guard.solPayment.amount.basisPoints.toString(10);

    //   if (costInLamports > walletBalance) {
    //     console.error("solPayment: Not enough SOL!");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.freezeSolPayment != null) {
    //   walletBalance = await metaplex.connection.getBalance(
    //     metaplex.identity().publicKey
    //   );

    //   const costInLamports = guard.freezeSolPayment.amount.basisPoints.toString(10);

    //   if (costInLamports > walletBalance) {
    //     console.error("freezeSolPayment: Not enough SOL!");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.nftGate != null) {
    //   const ownedNfts = await metaplex.nfts().findAllByOwner({ owner: metaplex.identity().publicKey });
    //   const nftsInCollection = ownedNfts.filter(obj => {
    //     return (obj.collection?.address.toBase58() === guard.nftGate.requiredCollection.toBase58()) && (obj.collection?.verified === true);
    //   });
    //   if (nftsInCollection.length < 1) {
    //     console.error("nftGate: The user has no NFT to pay with!");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.nftBurn != null) {
    //   const ownedNfts = await metaplex.nfts().findAllByOwner({ owner: metaplex.identity().publicKey });
    //   const nftsInCollection = ownedNfts.filter(obj => {
    //     return (obj.collection?.address.toBase58() === guard.nftBurn.requiredCollection.toBase58()) && (obj.collection?.verified === true);
    //   });
    //   if (nftsInCollection.length < 1) {
    //     console.error("nftBurn: The user has no NFT to pay with!");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.nftPayment != null) {
    //   const ownedNfts = await metaplex.nfts().findAllByOwner({ owner: metaplex.identity().publicKey });
    //   const nftsInCollection = ownedNfts.filter(obj => {
    //     return (obj.collection?.address.toBase58() === guard.nftPayment.requiredCollection.toBase58()) && (obj.collection?.verified === true);
    //   });
    //   if (nftsInCollection.length < 1) {
    //     console.error("nftPayment: The user has no NFT to pay with!");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.redeemedAmount != null) {
    //   if (guard.redeemedAmount.maximum.toString(10) <= candyMachine.itemsMinted.toString(10)) {
    //     console.error("redeemedAmount: Too many NFTs have already been minted!");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.tokenBurn != null) {
    //   const ata = await metaplex.tokens().pdas().associatedTokenAccount({ mint: guard.tokenBurn.mint, owner: metaplex.identity().publicKey });
    //   const balance = await metaplex.connection.getTokenAccountBalance(ata);
    //   if (balance < guard.tokenBurn.amount.basisPoints.toNumber()) {
    //     console.error("tokenBurn: Not enough SPL tokens to burn!");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.tokenGate != null) {
    //   const ata = await metaplex.tokens().pdas().associatedTokenAccount({ mint: guard.tokenGate.mint, owner: metaplex.identity().publicKey });
    //   const balance = await metaplex.connection.getTokenAccountBalance(ata);
    //   if (balance < guard.tokenGate.amount.basisPoints.toNumber()) {
    //     console.error("tokenGate: Not enough SPL tokens!");
    //     setDisableMint(true);
    //     return;
    //   }
    // }

    // if (guard.tokenPayment != null) {
    //   const ata = await metaplex.tokens().pdas().associatedTokenAccount({ mint: guard.tokenPayment.mint, owner: metaplex.identity().publicKey });
    //   const balance = await metaplex.connection.getTokenAccountBalance(ata);
    //   if (balance < guard.tokenPayment.amount.basisPoints.toNumber()) {
    //     console.error("tokenPayment: Not enough SPL tokens to pay!");
    //     setDisableMint(true);
    //     return;
    //   }
    //   if (guard.freezeTokenPayment != null) {
    //     const ata = await metaplex.tokens().pdas().associatedTokenAccount({ mint: guard.freezeTokenPayment.mint, owner: metaplex.identity().publicKey });
    //     const balance = await metaplex.connection.getTokenAccountBalance(ata);
    //     if (balance < guard.tokenPayment.amount.basisPoints.toNumber()) {
    //       console.error("freezeTokenPayment: Not enough SPL tokens to pay!");
    //       setDisableMint(true);
    //       return;
    //     }
    //   }
    // }

    //good to go! Allow them to mint
    setDisableMint(false);
  };

  // show and do nothing if no wallet is connected
  if (!wallet.connected) {
    return null;
  }

  // if it's the first time we are processing this function with a connected wallet we read the CM data and add Listeners
  if (candyMachine === undefined) {
    (async () => {
      // read candy machine data to get the candy guards address
      await checkEligibility();
      // Add listeners to refresh CM data to reevaluate if minting is allowed after the candy guard updates or startDate is reached
      // addListener();
    })();
  }

  const onClick = async () => {
    // Here the actual mint happens. Depending on the guards that you are using you have to run some pre validation beforehand
    // Read more: https://docs.metaplex.com/programs/candy-machine/minting#minting-with-pre-validation
    // const { nft } = await metaplex.candyMachines().mint({
    //   candyMachine,
    //   collectionUpdateAuthority: candyMachine.authorityAddress,
    // });

    console.log(candyMachine);

    const { nft } = await metaplex.candyMachines().mint({
      candyMachine,
      collectionUpdateAuthority: candyMachine.authorityAddress,
      group: "OGs",
    });

    setNft(nft);
  };

  return (
    <>
      {/*
      <div>
        <div>
          <div className={styles.container}>
            <h1 className={styles.title}>NFT Mint Address</h1>
            <div className={styles.nftForm}>
              <input
                type="text"
                value={nft ? nft.mint.address.toBase58() : ""}
                readOnly
              />
              <button onClick={onClick} disabled={disableMint}>
                mint NFT
              </button>
            </div>
          </div>
        </div>
      </div>
 */}

      <div className="bg-home">
        <div className=" m-auto container">
          <div className="flex justify-center items-center text-center md:h-screen">
            <div className="max-w-xl md:bg-[#E1F2DD] rounded-lg md:shadow-lg px-10 md:border md:border-black">
              <div className="relative mx-auto">
                <div className="absolute -top-[72px] left-[184px] h-32 w-32 rounded-full bg-black md:block hidden">
                  <Image src={logo} alt="logo" />
                </div>
              </div>
              {/* ---->>>> Haading  <<<<---- */}
              <h2 className="text-2xl text-center py-6 mt-10">
                The Guardians of the Forest
              </h2>

              <p>
                Launch Date : February 3<sup>rd</sup> , 2023 @ 4pm EST Animal:
                Wolf Class: Healer Quantity: 105 NFTs available Rarirty: 16th of
                52
              </p>

              <div className="flex justify-center">
                <div className="mt-2 rounded-md py-2 px-4 box-border border border-black font-medium">
                  <p>NFT price : 2 sol </p>
                </div>
              </div>

              <h2 className="mt-4 text-sm">Total NFTs : 10000</h2>

              <button
                className="rounded-md bg-black text-white py-3 px-14 box-border  mt-4"
                onClick={onClick}
                disabled={disableMint}
              >
                <h2>Mint</h2>
              </button>

              {/*
              {nft && (
                <div className={styles.nftPreview}>
                  <h1>{nft.name}</h1>
                  <img
                    src={nft?.json?.image || "/fallbackImage.jpg"}
                    alt="The downloaded illustration of the provided NFT address."
                  />
                </div>
              )}
			 */}

              {nft && (
                <p className="font-medium text-lg">
                  🎉 Congratulations! Mint Successful
                </p>
              )}

              <div className="my-4">
                <br />* After the mint, NFTs will be listed on Magic Eden
                between 48 to 72 hours. <br />* NFTs can be minted through the
                browser in the Phantom mobile Application, but minting through
                the Desktop browser extension is recommended. <br />* We and the
                Echo Forest Foundation thank you for your support.
                <br />
                <strong>*Phantom Wallet only</strong>
              </div>

              <div className="max-w-full mt-6 mb-6">
                <h2 className="mb-1">How to setup the Phantom Wallet</h2>
                <a
                  href="https://www.youtube.com/watch?v=BiZJDWgxIvs&feature=emb_title"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="font-medium text-blue-600 text-sm">
                    https://www.youtube.com/watch?v=BiZJDWgxIvs&feature=emb_title
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
