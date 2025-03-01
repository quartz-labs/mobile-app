import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useStore } from "@/utils/store";
import { baseUnitToDecimal, MARKET_INDEX_USDC } from "@quartz-labs/sdk";
import { Image } from "expo-image";

export default function RepayWarning() {
    const { health, borrowLimits } = useStore();

    const usdcBorrowLimitBaseUnits = borrowLimits?.[MARKET_INDEX_USDC] ?? 0;
    const availableCredit = baseUnitToDecimal(usdcBorrowLimitBaseUnits, MARKET_INDEX_USDC);

    if (availableCredit >= 30 || (health ?? 0) >= 50) {
        return null;
    }

    return (
        <View style={styles.repayWarning}>
            <Image
                source={require('@/assets/images/info.webp')}
                style={styles.icon}
                contentFit="contain"
            />
            <Text style={styles.warningText}>
                Collateral will be sold to repay loans if available credit reaches $0
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    repayWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 204, 0, 0.2)',
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    }
});