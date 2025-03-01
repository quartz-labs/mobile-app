import config from "@/config/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useStore } from "./store";
import { useEmbeddedSolanaWallet, PrivyEmbeddedSolanaWalletProvider, PrivyEmbeddedWalletErrorCode, EmbeddedProviderError } from "@privy-io/expo";
import { TandCsNeeded } from "@/types/enums/AuthLevel.enum";
import { fetchAndParse } from "./helpers";
export function useRefetchAccountStatus() {
    const queryClient = useQueryClient();

    return useCallback(async (signature?: string) => {
        if (signature) {
            try { 
                await fetch(`${config.API_URL}/program/tx/confirm?signature=${signature}`); 
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch { }
        }

        queryClient.invalidateQueries({ queryKey: ["account-status"], refetchType: "all" });
    }, [queryClient]);
}

export async function useLoginCardUser() {
    const { setJwtToken, setIsSigningLoginMessage, quartzCardUser } = useStore();
    const wallet = useEmbeddedSolanaWallet();

    if (!wallet.getProvider) {
        throw new Error("Privy wallet provider is not available");
    }
    const provider = await wallet.getProvider();

    const walletAddress = wallet?.wallets?.[0]?.publicKey;

    const signMessage = async (provider: PrivyEmbeddedSolanaWalletProvider, message: string) => {
        if (!provider) throw new Error("No provider found");

        const signatureBytes = await provider.request({
            method: "signMessage",
            params: {
                message: message
            }
        });
        return signatureBytes.signature;
    }
  
    return useMutation({
      mutationKey: ['login-card-user', walletAddress],
      mutationFn: async (acceptTandcsParam?: TandCsNeeded) => {
        if (!wallet) throw new Error("Wallet not found");

        const message = [
            "Sign this message to authenticate ownership. This signature will not trigger any blockchain transaction or cost any gas fees.\n",
            `Wallet address: ${walletAddress}`,
            `Timestamp: ${Date.now()}`
        ].join("\n");

        let signature: string;
        setIsSigningLoginMessage(true);
        try {
            signature = await signMessage(provider, message);
        } catch (error) {
            setIsSigningLoginMessage(false);
            if (error instanceof EmbeddedProviderError) {
                setJwtToken(false);
                return;
            } else {
                throw error;
            }
        }
        const acceptTandcs = acceptTandcsParam === TandCsNeeded.ACCEPTED;

        const cardToken = await fetchAndParse(`${config.INTERNAL_API_URL}/auth/user`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              accept: 'application/json'
            },
            body: JSON.stringify({
              publicKey: walletAddress,
              signature,
              message,
              id: quartzCardUser?.id,
              //change tbis so that 
              ...(acceptTandcsParam && { acceptQuartzCardTerms: acceptTandcs }),
            })
        });
        
        setJwtToken(cardToken);
        setIsSigningLoginMessage(false);
      },
      onError: (error) => {
        console.error("Failed to log in: ", error);
      },
      // TODO: Add pending state
    })
}

export function useRefetchAccountData() {
    const queryClient = useQueryClient();

    return useCallback(async (signature?: string) => {
        if (signature) {
            try { 
                await fetch(`/api/confirm-tx?signature=${signature}`); 
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch { }
        }
        
        queryClient.invalidateQueries({ queryKey: ["user"], refetchType: "all" });
    }, [queryClient]);
}

export function useRefetchDepositLimits() {
    const queryClient = useQueryClient();

    return useCallback(async (signature?: string) => {
        if (signature) {
            try { 
                await fetch(`/api/confirm-tx?signature=${signature}`); 
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch { }
        }

        queryClient.invalidateQueries({ queryKey: ["user", "deposit-limits"], refetchType: "all" });
    }, [queryClient]);
}

export function useRefetchWithdrawLimits() {
    const queryClient = useQueryClient();

    return useCallback(async (signature?: string) => {
        if (signature) {
            try { 
                await fetch(`/api/confirm-tx?signature=${signature}`); 
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch { }
        }

        queryClient.invalidateQueries({ queryKey: ["user", "withdraw-limits"], refetchType: "all" });
    }, [queryClient]);
}