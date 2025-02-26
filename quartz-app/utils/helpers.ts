import config from "@/config/config";
import { TxStatus, TxStatusProps } from "@/context/tx-status-provider";
import { EmbeddedSolanaWalletState } from "@privy-io/expo";
import { retryWithBackoff } from "@quartz-labs/sdk";
import { VersionedTransaction } from "@solana/web3.js";

export function buildEndpointURL(baseEndpoint: string, params?: Record<string, any>) {
    if (!params) return baseEndpoint;

    const stringParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
        stringParams[key] = String(value);
    }
    const searchParams = new URLSearchParams(stringParams);
    return `${baseEndpoint}${params ? `?${searchParams.toString()}` : ''}`;
}

export async function fetchAndParse(url: string, req?: RequestInit | undefined, retries: number = 0): Promise<any> {
    const response = await retryWithBackoff(
        async () => fetch(url, req),
        retries
    );
    
    if (!response.ok) {
        let body;
        try {
            body = await response.json();
        } catch {
            body = null;
        }
        const error = {
            status: response.status,
            body
        }
        throw new Error(JSON.stringify(error) ?? `Could not fetch ${url}`);
    }

    try {
        const body = await response.json();
        return body;
    } catch {
        return response;
    }
}

export function deserializeTransaction(serializedTx: string): VersionedTransaction {
    const buffer = Buffer.from(serializedTx, "base64");
    return VersionedTransaction.deserialize(buffer);
}

export async function signAndSendTransaction(
    transaction: VersionedTransaction, 
    wallet: EmbeddedSolanaWalletState, 
    showTxStatus: (props: TxStatusProps) => void,
    skipPreflight: boolean = false,
    skipTxProcessing: boolean = false
): Promise<string> {
    showTxStatus({ status: TxStatus.SIGNING });

    if (!wallet.getProvider) {
        throw new Error("Privy wallet provider is not available");
    }
    const provider = await wallet.getProvider();

    const txResponse = await provider.request({
      method: 'signTransaction',
      params: {
        transaction: transaction
      }
    });

    const serializedTransaction = Buffer.from(txResponse.signedTransaction.serialize()).toString("base64");
    
    console.log("serializedTransaction in signAndSendTransaction", serializedTransaction);
    const url = `${config.API_URL}/program/send-tx`;
    console.log("url in signAndSendTransaction", url);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            transaction: serializedTransaction,
            skipPreflight: skipPreflight
        }),
    });
    const body = await response.json();

    if (!response.ok) {
        if (body.error.includes("Blockhash not found")) {
            showTxStatus({ status: TxStatus.BLOCKHASH_EXPIRED });
            return "";
        } else {
            throw new Error(JSON.stringify(body.error) ?? `Could not fetch ${url}`); 
        }
    }

    if (!skipTxProcessing) {
        showTxStatus({ 
            signature: body.signature,
            status: TxStatus.SENT 
        });
    }
    return body.signature;
}