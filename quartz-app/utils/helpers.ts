import config from "@/config/config";
import { TxStatus, TxStatusProps } from "@/context/tx-status-provider";
import { AssetInfo } from "@/types/interfaces/AssetInfo.interface";
import { Rate } from "@/types/interfaces/Rate.interface";
import { EmbeddedSolanaWalletState } from "@privy-io/expo";
import { baseUnitToDecimal, MarketIndex, retryWithBackoff, TOKENS } from "@quartz-labs/sdk";
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

export function calculateBalanceDollarValues(prices: Record<MarketIndex, number>, balances: Record<MarketIndex, number>) {
    return MarketIndex.reduce((acc, marketIndex) => {
        const price = prices[marketIndex];
        const balance = baseUnitToDecimal(balances[marketIndex], marketIndex);
        acc[marketIndex] = price * balance;
        return acc;
    }, {} as Record<MarketIndex, number>);
}

export function calculateBalances(values: Record<MarketIndex, number>): {
    collateralBalance: number;
    loanBalance: number;
    netBalance: number;
} {
    let collateralBalance = 0;
    let loanBalance = 0;

    for (const marketIndex of MarketIndex) {
        const value = values[marketIndex];
        if (value > 0) collateralBalance += value;
        if (value < 0) loanBalance += Math.abs(value);
    }

    return {
        collateralBalance: truncToDecimalPlaces(collateralBalance, 2),
        loanBalance: truncToDecimalPlaces(loanBalance, 2),
        netBalance: truncToDecimalPlaces(collateralBalance - loanBalance, 2)
    }
}

export function truncToDecimalPlaces(value: number, decimalPlaces: number): number {
    return Math.trunc(value * 10 ** decimalPlaces) / 10 ** decimalPlaces;
}

export function plusOrMinus(value: number, currency?: string): string {
    return value >= 0 ? `+${currency ?? ""}${value}` : `-${currency ?? ""}${Math.abs(value)}`;
}


export function calculateRateChanges(values: Record<MarketIndex, number>, rates: Record<MarketIndex, Rate>): {
    collateralRate: number;
    loanRate: number;
    netRate: number;
} {
    let collateralRate = 0;
    let loanRate = 0;

    for (const marketIndex of MarketIndex) {
        const value = values[marketIndex];
        const rate = rates[marketIndex];

        if (value > 0) collateralRate += (value * rate.depositRate) / 365;
        if (value < 0) loanRate += (Math.abs(value * rate.borrowRate)) / 365;
    }

    return {
        collateralRate: truncToDecimalPlaces(collateralRate, 4),
        loanRate: truncToDecimalPlaces(loanRate, 4),
        netRate: truncToDecimalPlaces(collateralRate - loanRate, 4)
    }
}

export function formatDollarValue(num: number, decimalPlaces: number = 1): [string, string] {
    const integerPart = Math.trunc(num).toLocaleString("en-US");

    let decimalPart = num.toString().split(".")[1] ?? "0".repeat(decimalPlaces);
    if (decimalPart.length < decimalPlaces) {
        decimalPart = decimalPart.padEnd(decimalPlaces, "0");
    } else {
        decimalPart = decimalPart.slice(0, decimalPlaces);
    }

    return [integerPart, decimalPart];
}

export function generateAssetInfos(prices: Record<MarketIndex, number>, balances: Record<MarketIndex, number>, rates: Record<MarketIndex, Rate>) {
    const suppliedAssets: AssetInfo[] = [];
    const borrowedAssets: AssetInfo[] = [];
    
    for (const marketIndex of MarketIndex) {
        const balance = baseUnitToDecimal(balances[marketIndex], marketIndex);
        const price = prices[marketIndex];
        const rate = rates[marketIndex];

        if (balance > 0) suppliedAssets.push({ marketIndex, balance, price, rate: rate.depositRate });
        else if (balance < 0) borrowedAssets.push({ marketIndex, balance, price, rate: rate.borrowRate });
    }

    suppliedAssets.sort((a, b) => (Math.abs(b.balance * b.price) - Math.abs(a.balance * a.price)));
    borrowedAssets.sort((a, b) => (Math.abs(b.balance * b.price) - Math.abs(a.balance * a.price)));

    return { suppliedAssets, borrowedAssets };
}

export function formatTokenDisplay(balance: number, marketIndex?: MarketIndex): string {
    if (marketIndex === undefined) {
        const truncedValue = balance < 999 
            ? truncToDecimalPlaces(balance, 5) 
            : balance < 99999
                ? truncToDecimalPlaces(balance, 2)
                : truncToDecimalPlaces(balance, 0);
        if (truncedValue === 0) return formatPreciseDecimal(balance);
        return formatPreciseDecimal(truncedValue);
    }

    const magnitude = Math.floor(Math.log10(Math.abs(balance))) + 1;
    
    let precision = TOKENS[marketIndex].decimalPrecision.toNumber();
    if (magnitude >= 3) {
        precision = Math.max(0, precision - (magnitude - 2));
    }

    const truncedValue = truncToDecimalPlaces(balance, precision);
    return formatPreciseDecimal(truncedValue);
}

export const formatPreciseDecimal = (num: number) => {
    const str = num.toString();
    if (str.includes('e')) { // Convert scientific notation to fixed notation
        const e = parseInt(str.split('e')[1] || "0");
        if (e < 0) {
            return num.toFixed(-e).replace(/\.?0+$/, '');
        }
    }
    return str;
}

export function getTokenIcon(marketIndex: MarketIndex) {
    return `@/assets/tokens/${TOKENS[marketIndex].name.toLowerCase()}.webp`;
}

// export const getCardDetailsFromInternalApi = async (
//     id: string,
//     jwtToken: string
// ) => {
//     const sessionId = await generateSessionId(config.CARD_PEM!);

//     const options = {
//         method: 'POST',
//         headers: {
//             "Content-Type": "application/json",
//             accept: 'application/json',
//             "Authorization": `Bearer ${jwtToken}`
//         },
//         body: JSON.stringify({ sessionId: sessionId.sessionId })
//     };
//     const response = await fetchAndParse(`${config.INTERNAL_API_URL}card/issuing/secrets?id=${id}`, options);
//     const decryptedPan = (await decryptSecret(response.encryptedPan.data, response.encryptedPan.iv, sessionId.secretKey))
//         .replace(/[^\d]/g, '').slice(0, 16);

//     const decryptedCvc = (await decryptSecret(response.encryptedCvc.data, response.encryptedCvc.iv, sessionId.secretKey))
//         .replace(/[^\d]/g, '').slice(0, 3);

//     return {
//         pan: decryptedPan,
//         cvc: decryptedCvc,
//     }
// }

// export async function generateSessionId(pem: string) {
//     if (!pem) throw new Error("pem is required");

//     const secretKey = crypto.randomUUID().replace(/-/g, "");
//     const secretKeyBase64 = Buffer.from(secretKey, "hex").toString("base64");
//     const secretKeyBase64Buffer = Buffer.from(secretKeyBase64, "utf-8");
//     const secretKeyBase64BufferEncrypted = crypto.publicEncrypt(
//         {
//             key: pem,
//             padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//         },
//         secretKeyBase64Buffer,
//     );

//     return {
//         secretKey,
//         sessionId: secretKeyBase64BufferEncrypted.toString("base64"),
//     };
// }

// export async function decryptSecret(base64Secret: string, base64Iv: string, secretKey: string) {
//     if (!base64Secret) throw new Error("base64Secret is required");
//     if (!base64Iv) throw new Error("base64Iv is required");
//     if (!secretKey || !/^[0-9A-Fa-f]+$/.test(secretKey)) {
//         throw new Error("secretKey must be a hex string");
//     }

//     const secret = Buffer.from(base64Secret, "base64");
//     const iv = Buffer.from(base64Iv, "base64");
//     const secretKeyBuffer = Buffer.from(secretKey, "hex");


//     const cryptoKey = crypto.createDecipheriv("aes-128-gcm", secretKeyBuffer, iv);
//     cryptoKey.setAutoPadding(false);

//     const decrypted = cryptoKey.update(secret);

//     return decrypted.toString("utf-8");
// }