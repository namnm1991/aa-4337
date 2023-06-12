import React from "react";
import {
  WagmiConfig,
  configureChains,
  createClient,
} from "wagmi";
import { publicProvider } from 'wagmi/providers/public';
import { polygonMumbai } from 'wagmi/chains'
import { connectorsForWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { 
  googleWallet,
  facebookWallet,
  githubWallet,
  enhanceWalletWithAAConnector,
} from '@zerodevapp/wagmi/rainbowkit'

// default project id 'b5486fa4-e3d9-450b-8428-646e757c10f6' 
const defaultProjectId = process.env.REACT_APP_ZERODEV_PROJECT_ID || '71b65692-6875-46a8-a2f7-bb4024f64755'

const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai],
  [publicProvider()],
)

const connectors = connectorsForWallets([
  {
    groupName: 'Smart Wallet Account',
      wallets: [
        enhanceWalletWithAAConnector(
          injectedWallet({ chains }),
          { projectId: defaultProjectId }
        ),
        googleWallet({options: { projectId: defaultProjectId}}),
        facebookWallet({options: { projectId: defaultProjectId}}),
        githubWallet({options: { projectId: defaultProjectId }}),
    ],    
  },
  {
    groupName: 'EoA (Externally Owned Account)',
      wallets: [
        injectedWallet({ chains }),
    ],    
  },
]);

const client = createClient({
  autoConnect: false,
  connectors,
  provider,
  webSocketProvider,
})

function ZeroDevWrapper({children}: {children: React.ReactNode}) {
  return (
    <WagmiConfig client={client}>
      <RainbowKitProvider theme={darkTheme()} chains={chains} modalSize="compact">
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default ZeroDevWrapper