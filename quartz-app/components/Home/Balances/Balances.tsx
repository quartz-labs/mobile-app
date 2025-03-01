import { useEffect } from "react";
import { useState } from "react";
import { baseUnitToDecimal, MARKET_INDEX_USDC } from "@quartz-labs/sdk";
import { useStore } from "@/utils/store";
import { calculateBalanceDollarValues, calculateRateChanges, formatDollarValue, plusOrMinus } from "@/utils/helpers";
import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function Balances() {
    const { isInitialized, prices, balances, rates, borrowLimits } = useStore();

    const [netRate, setNetRate] = useState<number>(0);

    const displayBalances = isInitialized && prices !== undefined && balances !== undefined;

    useEffect(() => {
        if (!balances || !prices) return;
        const balanceValues = calculateBalanceDollarValues(prices, balances);

        if (!rates) return;
        const { netRate } = calculateRateChanges(balanceValues, rates);
        setNetRate(netRate);
    }, [prices, balances, rates]);

    const usdcBorrowLimitBaseUnits = borrowLimits?.[MARKET_INDEX_USDC] ?? 0;
    const availableCredit = formatDollarValue(
        baseUnitToDecimal(usdcBorrowLimitBaseUnits, MARKET_INDEX_USDC),
        2
    );

    const netRateClass = netRate > 0
        ? styles.positive
        : netRate < 0
            ? styles.negative
            : "";

    return (
        <View style={styles.balanceOverview}>
            <View style={styles.netBalanceWrapper}>
                {displayBalances ? (
                    <>
                        <Text style={styles.netBalance}>
                            ${availableCredit[0]}
                            <Text style={styles.netBalanceDecimal}>.{availableCredit[1]}</Text>
                        </Text>
                        {rates !== undefined && (
                            <Text style={[styles.rateHeight]}>
                                {plusOrMinus(netRate, "$")} /day
                            </Text>
                        )}
                    </>
                ) : (
                    <Text style={[styles.netBalance, styles.notInitialized]}>
                        $--<Text style={styles.netBalanceDecimal}>.--</Text>
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    balanceOverview: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginVertical: 8,
    },
    netBalanceWrapper: {
        alignItems: 'center' as const,
    },
    netBalance: {
        fontSize: 36,
        fontWeight: 'bold' as const,
        color: '#000000',
    },
    netBalanceDecimal: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        color: '#000000',
    },
    notInitialized: {
        color: '#888888',
    },
    rateHeight: {
        marginTop: 4,
        fontSize: 16,
    },
    positive: {
        color: '#4CAF50', // Green color for positive rates
    },
    negative: {
        color: '#F44336', // Red color for negative rates
    },
    neutral: {
        color: '#757575', // Gray color for neutral/undefined rates
    }
});