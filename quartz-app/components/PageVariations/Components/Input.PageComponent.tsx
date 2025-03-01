import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import type { MarketIndex } from "@quartz-labs/sdk";
import TokenSelect from "./TokenSelect/TokenSelect";
import { formatTokenDisplay } from "@/utils/helpers";

interface InputSectionProps {
    label?: string;
    availableLabel?: string;
    borrowing: boolean;
    price?: number;
    rate?: number;
    available?: number;
    amountStr: string;
    setAmountStr: (amount: string) => void;
    setMaxAmount: () => void;
    setHalfAmount: () => void;
    marketIndex: MarketIndex;
    setMarketIndex: (marketIndex: MarketIndex) => void;
    selectableMarketIndices?: MarketIndex[];
}

export default function InputSection({
    label, 
    availableLabel,
    amountStr, 
    borrowing, 
    price,
    rate,
    available,
    setAmountStr,
    setMaxAmount, 
    setHalfAmount,
    marketIndex, 
    setMarketIndex,
    selectableMarketIndices
} : InputSectionProps ) {
    const CHARACTER_LIMIT = 20;
    const value = price ? price * Number(amountStr) : undefined;

    const handleTextChange = (text: string) => {
        // Filter out non-numeric and non-decimal characters, and prevent multiple decimals
        const filteredText = text
            .slice(0, CHARACTER_LIMIT)
            .replace(/[^0-9.]/g, '')
            .replace(/(\..*?)\..*/g, '$1');
        
        setAmountStr(filteredText);
    };

    return (
        <View style={styles.inputSection}>
            <Text style={styles.label}>{label ?? "Amount"}</Text>
            
            <View style={styles.inputFieldWrapper}>
                <TextInput
                    style={styles.inputField}
                    keyboardType="numeric"
                    placeholder="0.0"
                    value={amountStr}
                    onChangeText={handleTextChange}
                />

                <TokenSelect 
                    marketIndex={marketIndex} 
                    setMarketIndex={setMarketIndex} 
                    selectableMarketIndices={selectableMarketIndices}
                />
            </View>

            <View style={styles.infoWrapper}>
                <View style={styles.infoLeft}>
                    {value !== undefined && (
                        <Text style={styles.lightText}>
                            ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                            {rate !== undefined && (
                                <Text style={styles.tinyText}> ({(rate * 100).toFixed(2)}% {borrowing ? "APR" : "APY"})</Text>
                            )}
                        </Text>
                    )}

                    {available !== undefined && (
                        <Text style={styles.lightText}>
                            {availableLabel ?? "Available"}: {formatTokenDisplay(available)}
                        </Text>
                    )}
                </View>
            
                <View style={styles.amount}>
                    <TouchableOpacity 
                        style={styles.balanceButton} 
                        onPress={setHalfAmount}
                    >
                        <Text style={styles.buttonText}>Half</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.balanceButton} 
                        onPress={setMaxAmount}
                    >
                        <Text style={styles.buttonText}>Max</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    inputSection: {
        marginBottom: 20,
        width: '100%',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    inputFieldWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    inputField: {
        flex: 1,
        height: 50,
        paddingHorizontal: 12,
        fontSize: 18,
    },
    infoWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    infoLeft: {
        flex: 1,
    },
    lightText: {
        color: '#666',
        fontSize: 14,
        marginBottom: 4,
    },
    tinyText: {
        fontSize: 12,
        color: '#888',
    },
    amount: {
        flexDirection: 'row',
    },
    balanceButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginLeft: 8,
    },
    buttonText: {
        fontSize: 14,
        color: '#333',
    }
});