// Reown AppKit provides the wallet picker, QR sign-in for mobile wallets and network switching.
// Plum keeps its own sign-in: AppKit only hands over a connected account, and the SIWE challenge
// and verification stay on the launch API. The project id is a public identifier, not a secret.
import { createAppKit } from '@reown/appkit/react'
import { robinhood, robinhoodTestnet } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined
if (!projectId) throw new Error('VITE_REOWN_PROJECT_ID is not set. Create a project at dashboard.reown.com and add its id to the repository-root .env.')

export const networks = [robinhood, robinhoodTestnet] as const
export type ChainId = (typeof networks)[number]['id']

const wagmiAdapter = new WagmiAdapter({ projectId, networks: [...networks] })
export const wagmiConfig = wagmiAdapter.wagmiConfig

createAppKit({
  adapters: [wagmiAdapter],
  networks: [robinhood, robinhoodTestnet],
  defaultNetwork: robinhood,
  projectId,
  metadata: { name: 'Plum', description: 'An independent companion to the Pons launchpad.', url: window.location.origin, icons: [] },
  themeMode: 'light',
  // Stock AppKit look, the same one pons ships, with Plum's ink as the accent. The paper serif and
  // square corners read as cheap inside this modal, so they stay on the page and out of it.
  themeVariables: { '--apkt-font-family': "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif", '--apkt-accent': '#303b31' },
  features: { analytics: false, email: false, socials: false, swaps: false, onramp: false, history: false, send: false },
  enableWalletGuide: false,
})
