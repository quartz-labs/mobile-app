import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import InputSection from "./Components/Input.PageComponent";
import Buttons from "./Components/Buttons.PageComponent";
import { useStore } from "@/utils/store";
import { useError } from "@/context/error-provider";
import { MarketIndex, baseUnitToDecimal, decimalToBaseUnit } from "@quartz-labs/sdk";
import { useRefetchAccountData, useRefetchDepositLimits } from "@/utils/hooks";
import { TxStatus, useTxStatus } from "@/context/tx-status-provider";
import { buildEndpointURL, deserializeTransaction, fetchAndParse, formatPreciseDecimal, signAndSendTransaction, validateAmount } from "@/utils/helpers";
import { captureError } from "@/utils/errors";
import { EmbeddedProviderError, getUserEmbeddedSolanaWallet, useEmbeddedSolanaWallet, usePrivy } from "@privy-io/expo";
import { PublicKey } from "@solana/web3.js";
import config from "@/config/config";
import { router } from "expo-router";

export default function AddFundsPage() {
    //TODO Import wallet from privy
    const { user } = usePrivy();
    const wallet = useEmbeddedSolanaWallet();
    const account = getUserEmbeddedSolanaWallet(user);
    const walletAddress = wallet?.wallets?.[0]?.address ? new PublicKey(wallet.wallets[0].address) : null;


    const { prices, rates, depositLimits } = useStore();
    const { showError } = useError();
    const { showTxStatus } = useTxStatus();
    const refetchAccountData = useRefetchAccountData();
    const refetchDepositLimits = useRefetchDepositLimits();

    const [awaitingSign, setAwaitingSign] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [amountStr, setAmountStr] = useState("");
    const amountDecimals = Number(amountStr);

    const [marketIndex, setMarketIndex] = useState<MarketIndex>(MarketIndex[0]);
    const depositLimitDecimal = depositLimits ? baseUnitToDecimal(depositLimits[marketIndex as keyof typeof depositLimits], marketIndex) : undefined;

    useEffect(() => {
        refetchAccountData();
        refetchDepositLimits();
    }, [refetchAccountData, refetchDepositLimits]);

    const handleConfirm = async () => {
        if (!walletAddress) return setErrorText("Wallet not connected");

        if (depositLimitDecimal !== undefined) {
            const errorText = validateAmount(marketIndex, amountDecimals, depositLimits?.[marketIndex as keyof typeof depositLimits] ?? 0);
            setErrorText(errorText);
            if (errorText) return;
        }

        setAwaitingSign(true);
        try {
            const endpoint = buildEndpointURL(`${config.API_URL}/program/build-tx/deposit`, {
                address: walletAddress.toBase58(),
                amountBaseUnits: decimalToBaseUnit(amountDecimals, marketIndex),
                repayingLoan: true,
                marketIndex,
                useMaxAmount: true
            });
            const response = await fetchAndParse(endpoint, undefined, 3);
            const transaction = deserializeTransaction(response.transaction);
            const signature = await signAndSendTransaction(transaction, wallet, showTxStatus);

            setAwaitingSign(false);
            // TODO: Redirect to home page
            if (signature) router.push('/');;
        } catch (error) {
            if (error instanceof EmbeddedProviderError) showTxStatus({ status: TxStatus.SIGN_REJECTED });
            else {
                showTxStatus({ status: TxStatus.NONE });
                captureError(showError, "Failed to add funds", "/AddFundsPage.tsx", error, walletAddress);
            }
        } finally {
            setAwaitingSign(false);
        }
    }

    return (
        <View style={styles.contentWrapper}>
            <Text style={styles.heading}>Add Funds</Text>

            <InputSection
                borrowing={false}
                price={prices?.[marketIndex as keyof typeof prices]}
                rate={rates?.[marketIndex as keyof typeof rates]?.depositRate}
                available={depositLimitDecimal}
                amountStr={amountStr}
                setAmountStr={setAmountStr}
                setMaxAmount={() => setAmountStr(
                    depositLimitDecimal ? formatPreciseDecimal(depositLimitDecimal) : "0"
                )}
                setHalfAmount={() => setAmountStr(
                    depositLimitDecimal ? formatPreciseDecimal(depositLimitDecimal / 2) : "0"
                )}
                marketIndex={marketIndex}
                setMarketIndex={setMarketIndex}
            />

            {errorText &&
                <View style={styles.messageTextWrapper}>
                    <Text style={styles.errorText}>{errorText}</Text>
                </View>
            }

            <Buttons
                label="Add"
                awaitingSign={awaitingSign}
                onConfirm={handleConfirm}
                onCancel={() => {
                    router.push('/');
                }}
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