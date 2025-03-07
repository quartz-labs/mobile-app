import { validateAmount, fetchAndParse, deserializeTransaction, signAndSendTransaction, buildEndpointURL, formatPreciseDecimal } from "@/utils/helpers";
import { useRefetchAccountData, useRefetchWithdrawLimits } from "@/utils/hooks";
import { useStore } from "@/utils/store";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import InputSection from "./Components/Input.PageComponent";
import Buttons from "./Components/Buttons.PageComponent";
import { useError } from "@/context/error-provider";
import { captureError } from "@/utils/errors";
import { TxStatus, useTxStatus } from "@/context/tx-status-provider";
import { MarketIndex, baseUnitToDecimal, decimalToBaseUnit } from "@quartz-labs/sdk";
import { router } from "expo-router";
import { EmbeddedProviderError, usePrivy } from "@privy-io/expo";
import { getUserEmbeddedSolanaWallet } from "@privy-io/expo";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { PublicKey } from "@solana/web3.js";
import config from "@/config/config";

export default function WithdrawModal() {
    //TOOD: Import the wallet from privy
    const { user } = usePrivy();
    const wallet = useEmbeddedSolanaWallet();
    const account = getUserEmbeddedSolanaWallet(user);
    const walletAddress = wallet?.wallets?.[0]?.address ? new PublicKey(wallet.wallets[0].address) : null;

    const { prices, rates, balances, withdrawLimits } = useStore();
    const { showError } = useError();
    const { showTxStatus } = useTxStatus();
    const refetchAccountData = useRefetchAccountData();
    const refetchWithdrawLimits = useRefetchWithdrawLimits();

    const [awaitingSign, setAwaitingSign] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [amountStr, setAmountStr] = useState("");
    const amountDecimals = Number(amountStr);

    const collateralMarketIndices = balances
        ? Object.entries(balances)
            .filter(([, balance]) => balance > 0)
            .map(([marketIndex]) => Number(marketIndex) as MarketIndex)
        : [];

    const [marketIndex, setMarketIndex] = useState<MarketIndex>(collateralMarketIndices[0] ?? MarketIndex[0]);

    useEffect(() => {
        refetchAccountData();
        refetchWithdrawLimits();

        const interval = setInterval(refetchWithdrawLimits, 3_000);
        return () => clearInterval(interval);
    }, [refetchAccountData, refetchWithdrawLimits]);

    const collateralBalance = balances?.[marketIndex] ?? 0;
    const maxWithdrawBaseUnits = collateralBalance > 0
        ? Math.min(collateralBalance, withdrawLimits?.[marketIndex] ?? 0)
        : 0;

    const [useMaxAmount, setUseMaxAmount] = useState(false);
    useEffect(() => {
        if (useMaxAmount) {
            setAmountStr(
                maxWithdrawBaseUnits ? formatPreciseDecimal(baseUnitToDecimal(maxWithdrawBaseUnits, marketIndex)) : "0"
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useMaxAmount, maxWithdrawBaseUnits]);

    const handleConfirm = async () => {
        if (!walletAddress) return setErrorText("Wallet not connected");

        const errorText = validateAmount(marketIndex, amountDecimals, maxWithdrawBaseUnits);
        setErrorText(errorText);
        //if (errorText) return;

        setAwaitingSign(true);
        try {
            const endpoint = buildEndpointURL(`${config.API_URL}/program/build-tx/withdraw`, {
                address: walletAddress.toBase58(),
                allowLoan: false,
                amountBaseUnits: decimalToBaseUnit(amountDecimals, marketIndex),
                marketIndex,
                useMaxAmount,
            });
            const response = await fetchAndParse(endpoint, undefined, 3);
            const transaction = deserializeTransaction(response.transaction);
            const signature = await signAndSendTransaction(transaction, wallet, showTxStatus);
            setAwaitingSign(false);
            if (signature) router.push('/');
        } catch (error) {
            if (error instanceof EmbeddedProviderError) showTxStatus({ status: TxStatus.SIGN_REJECTED });
            else {
                showTxStatus({ status: TxStatus.NONE });
                captureError(showError, "Failed to withdraw", "/WithdrawModal.tsx", error, walletAddress);
            }
        } finally {
            setAwaitingSign(false);
        }
    }

    return (
        <View style={styles.contentWrapper}>
            <Text style={styles.heading}>Withdraw Funds</Text>

            <InputSection
                borrowing={true}
                price={prices?.[marketIndex]}
                rate={rates?.[marketIndex]?.borrowRate}
                available={baseUnitToDecimal(maxWithdrawBaseUnits, marketIndex)}
                amountStr={amountStr}
                setAmountStr={(value: string) => {
                    setUseMaxAmount(false);
                    setAmountStr(value);
                }}
                setMaxAmount={() => setUseMaxAmount(true)}
                setHalfAmount={() => setAmountStr(
                    maxWithdrawBaseUnits ? formatPreciseDecimal(baseUnitToDecimal(Math.trunc(maxWithdrawBaseUnits / 2), marketIndex)) : "0"
                )}
                marketIndex={marketIndex}
                setMarketIndex={setMarketIndex}
                selectableMarketIndices={collateralMarketIndices}
            />

            {errorText && (
                <View style={styles.messageTextWrapper}>
                    <Text style={styles.errorText}>{errorText}</Text>
                </View>
            )}

            <Buttons
                label="Withdraw"
                awaitingSign={awaitingSign}
                onConfirm={handleConfirm}
                onCancel={() => router.push('/')}
            />
        </View>
    )
}


const styles = StyleSheet.create({
    contentWrapper: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        width: '100%',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    messageTextWrapper: {
        marginVertical: 10,
        padding: 10,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    }
});