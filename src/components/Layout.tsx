import toast, { Toaster } from "react-hot-toast";
import { Link } from "./Link";
import { Button } from "./Button";
import { CURRENT_ENVIRONMENT, NODE_URL } from "@/lib";
import { WalletDisplay } from "./WalletDisplay";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useFaucet } from "@/hooks/useFaucet";
import Head from "next/head";
import { ConnectButton } from "./ConnectButton";
import { useRouter } from "next/router";
import { NavMenu } from "./NavMenu";
import { NFTRoutes } from "@/routes";
import { ExternalFaucet } from "./ExternalFaucet";
import { useBreakpoints } from "@/hooks/useBreakpoints";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { faucetWallet } = useFaucet();
  const { wallet, network, walletBalance, refetchBalance } = useActiveWallet();
  const router = useRouter();
  const { isTablet, isMobile } = useBreakpoints();

  const TOP_UP_AMOUNT = 100_000_000;

  const topUpWallet = async () => {
    if (!wallet) {
      return console.error("Unable to topup wallet because wallet is not set.");
    }

    if (CURRENT_ENVIRONMENT === "local") {
      if (!faucetWallet) {
        return toast.error("Faucet wallet not found.");
      }

      const tx = await faucetWallet?.transfer(wallet.address, TOP_UP_AMOUNT);
      await tx?.waitForResult();

      toast.success("Wallet topped up!");
    }

    if (CURRENT_ENVIRONMENT === "testnet" && !isTablet) {
      router.push(NFTRoutes.faucet);
    }
    await refetchBalance();
  };

  const showTopUpButton = walletBalance?.lt(TOP_UP_AMOUNT);
  const showAddNetworkButton = wallet && network && network?.url !== NODE_URL;

  console.log(network?.url);
  const tryToAddNetwork = () => {
    toast(
      `Please add the network ${NODE_URL} to your Fuel wallet, or swtich to it if you have it already, and refresh the page.`
    );
  };

  return (
    <>
      <Head>
        <title>Fuel App</title>
        <link rel="icon" href="/fuel.ico" />
      </Head>
      <Toaster />
      <div className="flex flex-col">
        <nav
          className="flex justify-between items-center p-4 bg-black text-white gap-2 lg:gap-6 gradient-border
            bg-gradient-to-b
            from-zinc-900
            to-zinc-950/80"
        >
          {!isMobile && (
            <>
             

              <Link href={NFTRoutes.create}>Mint</Link>

              <Link href={NFTRoutes.collection}>Manage Tokens</Link>
            </>
          )}

          {showAddNetworkButton && (
            <Button onClick={tryToAddNetwork} className="bg-red-500 text-white">
              Wrong Network
            </Button>
          )}

          <div className="ml-auto">
            <WalletDisplay />
          </div>

          {!isMobile ? (
            <>
              {showTopUpButton && (
                <ExternalFaucet address={wallet?.address.toString()}>
                  <Button onClick={() => topUpWallet()}>Faucet</Button>
                </ExternalFaucet>
              )}

              <ConnectButton />
            </>
          ) : (
            <NavMenu address={wallet?.address.toString()} />
          )}
        </nav>

        <div className="min-h-screen items-center p-8 lg:p-24 flex flex-col gap-6">
          {children}
        </div>
      </div>
    </>
  );
};
