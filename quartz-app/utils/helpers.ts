import config from "@/config/config";
import { TxStatus, TxStatusProps } from "@/context/tx-status-provider";
import { AssetInfo } from "@/types/interfaces/AssetInfo.interface";
import { QuartzCardUser } from "@/types/interfaces/QuartzCardUser.interface";
import { Rate } from "@/types/interfaces/Rate.interface";
import { EmbeddedProviderError, EmbeddedSolanaWalletState, PrivyEmbeddedSolanaWalletProvider, useEmbeddedSolanaWallet } from "@privy-io/expo";
import { baseUnitToDecimal, MarketIndex, retryWithBackoff, TOKENS } from "@quartz-labs/sdk";
import { VersionedTransaction } from "@solana/web3.js";
import { randomUUID } from 'expo-crypto';
import CryptoES from 'crypto-es';
import { TandCsNeeded } from "@/types/enums/QuartzCardAccountStatus.enum";


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
    const url = `${config.API_URL}/program/tx/send`;
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


export function validateAmount(marketIndex: MarketIndex, amountDecimal: number, maxAmountBaseUnits: number, minAmountBaseUnits: number = 1) {
    const minAmountDecimal = baseUnitToDecimal(minAmountBaseUnits, marketIndex);
    const maxAmountDecimal = baseUnitToDecimal(maxAmountBaseUnits, marketIndex);

    if (isNaN(amountDecimal)) return "Invalid input";
    if (amountDecimal > maxAmountDecimal) return `Maximum amount: ${maxAmountDecimal}`;
    if (amountDecimal < minAmountDecimal) return `Minimum amount: ${minAmountDecimal}`;
    return "";
}

export const getCardDetailsFromInternalApi = async (
    id: string,
    jwtToken: string
) => {
    const sessionId = await generateSessionId(config.CARD_PEM!);

    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            accept: 'application/json',
            "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ sessionId: sessionId.sessionId })
    };
    const response = await fetchAndParse(`${config.INTERNAL_API_URL}/card/issuing/secrets?id=${id}`, options);

    const decryptedPan = (await decryptSecret(response.encryptedPan.data, response.encryptedPan.iv, sessionId.secretKey))
        .replace(/[^\d]/g, '').slice(0, 16);

    const decryptedCvc = (await decryptSecret(response.encryptedCvc.data, response.encryptedCvc.iv, sessionId.secretKey))
        .replace(/[^\d]/g, '').slice(0, 3);

    return {
        pan: decryptedPan,
        cvc: decryptedCvc,
    }
    return {
        pan: response.encryptedPan.data,
        cvc: response.encryptedCvc.data,
    };
}

export async function generateSessionId(key: string) {
    if (!key) throw new Error("key is required");

    console.log("key", key);
    // Generate a random UUID and remove hyphens
    const secretKey = randomUUID().replace(/-/g, "");

    console.log("secretKey", secretKey);

    // Convert to base64 for encryption
    const secretKeyBase64 = Buffer.from(secretKey, "hex").toString("base64");

    console.log("secretKeyBase64", secretKeyBase64);

    // Generate a random IV
    const iv = CryptoES.lib.WordArray.random(16);

    // Encrypt the secret key using AES
    const encrypted = CryptoES.AES.encrypt(
        secretKeyBase64,
        key, // The encryption key
        {
            iv: iv,
            mode: CryptoES.mode.CBC, // Use CBC mode as GCM is not directly available
            padding: CryptoES.pad.Pkcs7
        }
    );

    const ciphertext = encrypted.toString();
    const ivString = iv.toString(CryptoES.enc.Hex);
    const tag = encrypted.salt ? encrypted.salt.toString(CryptoES.enc.Hex) : "";

    console.log("encrypted data", {
        content: ciphertext,
        iv: ivString,
        tag: tag
    });

    return {
        secretKey,
        sessionId: ciphertext,
        iv: ivString,
        tag: tag
    };
}

export function decryptSecret(base64Secret: string, base64Iv: string, secretKey: string) {
    if (!base64Secret) throw new Error("base64Secret is required");
    if (!base64Iv) throw new Error("base64Iv is required");
    if (!secretKey || !/^[0-9A-Fa-f]+$/.test(secretKey)) {
        throw new Error("secretKey must be a hex string");
    }

    // Convert inputs to formats needed by CryptoES
    const secret = CryptoES.enc.Base64.parse(base64Secret);
    const iv = CryptoES.enc.Base64.parse(base64Iv);
    const key = CryptoES.enc.Hex.parse(secretKey);

    console.log("secret", secret);
    console.log("iv", iv);
    console.log("key", key);
    // Create cipher params
    const cipherParams = CryptoES.lib.CipherParams.create({
        ciphertext: secret
    });

    console.log("cipherParams", cipherParams);
    // Decrypt
    const decrypted = CryptoES.AES.decrypt(
        cipherParams,
        key,
        {
            iv: iv,
            mode: CryptoES.mode.CBC,
            padding: CryptoES.pad.NoPadding
        }
    );
    console.log("decrypted", decrypted);
    return decrypted.toString(CryptoES.enc.Utf8);
}

export const getJwtTokenFromInternalApi = async (
    quartzCardUser: QuartzCardUser,
    walletAddress: string,
    provider: PrivyEmbeddedSolanaWalletProvider,
) => {

    console.log("walletAddress", walletAddress);
    const message = [
        "Sign this message to authenticate ownership. This signature will not trigger any blockchain transaction or cost any gas fees.\n",
        `Wallet address: ${walletAddress}`,
        `Timestamp: ${Date.now()}`
    ].join("\n");

    let signature: string;
    try {
        signature = await signMessageWithPrivy(provider, message);
        console.log("signature here, find out the format it is", signature);
        return signature;
    } catch (error) {
        if (error instanceof EmbeddedProviderError) {
            return;
        } else {
            throw error;
        }
    }

    console.log("signature", signature);

    const acceptTandcs = TandCsNeeded.ACCEPTED;

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
            acceptQuartzCardTerms: acceptTandcs
        })
    });

    return cardToken as string;
}

export const signMessageWithPrivy = async (provider: PrivyEmbeddedSolanaWalletProvider, message: string) => {
    if (!provider) throw new Error("No provider found");

    console.log("message in signMessageWithPrivy", message);
    const signatureBytes = await provider.request({
        method: "signMessage",
        params: {
            message: message
        }
    });
    console.log("signatureBytes in signMessageWithPrivy", signatureBytes);
    return signatureBytes.signature;
}