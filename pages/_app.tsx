//swap added
import { NextUIProvider } from '@nextui-org/react';
import { createTheme } from "@nextui-org/react";
import Link from 'next/link';
import "../styles/global.css";
import { ethers } from "ethers";
import Head from "next/head";
import type { AppProps } from "next/app";
import React, { useState } from "react";
// import ContextApi from '../context/contextApi'
// import { StyledEngineProvider } from "@mui/material";
// import CssBaseline from '@mui/material/CssBaseline'
import { InjectedConnector } from "wagmi/connectors/injected";
import "@rainbow-me/rainbowkit/styles.css";

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const { chains, provider } = configureChains(
  [chain.mainnet],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
);
const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const darkThemes = createTheme({
  type: 'dark',
});

function MyApp({ Component, pageProps }: AppProps) {
  // const connectWallet = async () => {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   setProvider(provider)
  //   await provider.send("eth_requestAccounts", []);
  //   const signer = provider.getSigner();
  //   const network = await (await provider.getNetwork()).chainId;
  //   setNetwork(network);
  //   console.log(network);
  //   signer.getAddress().then((result) => {
  //     setAddress(result);
  //   });
  // };
  // const disconnectWallet = async () => {
  //   setAddress(null);
  //   setNetwork(null);
  // };
  return (
    <NextUIProvider theme={darkThemes}>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        showRecentTransactions={true}
        theme={{
          lightMode: lightTheme({
            accentColor: "#e38d83",
            overlayBlur: "large",
          }),
          darkMode: darkTheme({ accentColor: "#e38d83", overlayBlur: "large" }),
        }}
        coolMode
        modalSize="compact"
        chains={chains}
      >
        {/* <StyledEngineProvider injectFirst> */}
          {/* <CssBaseline /> */}
          <Head>
            <title>Sticky Gum</title>
            {/* <meta name="viewport" content="initial-scale" /> */}
            <link rel='manifest' href='/manifest.json' />
          </Head>
          <Component {...pageProps} />
        {/* </StyledEngineProvider> */}
      </RainbowKitProvider>
    </WagmiConfig>
    </NextUIProvider>

  );
}

export default MyApp;
