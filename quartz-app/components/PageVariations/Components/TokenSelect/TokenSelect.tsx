import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { type MarketIndex, TOKENS, type Token } from '@quartz-labs/sdk';
import { getTokenIcon } from '@/utils/helpers';
import { Image } from 'expo-image';

export interface TokenSelectProps {
    marketIndex: MarketIndex;
    setMarketIndex: (marketIndex: MarketIndex) => void;
    selectableMarketIndices?: MarketIndex[];
}

export default function TokenSelect({
    marketIndex,
    setMarketIndex,
    selectableMarketIndices
}: TokenSelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const filteredTokens: Record<MarketIndex, Token> = selectableMarketIndices
        ? Object.fromEntries(
            selectableMarketIndices.map(index => [index, TOKENS[index]])
        ) as Record<MarketIndex, Token>
        : TOKENS;

    const renderTokenItem = ({ item }: { item: [string, Token] }) => {
        const [index, token] = item;
        const tokenMarketIndex = Number(index) as MarketIndex;
        
        return (
            <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                    setMarketIndex(tokenMarketIndex);
                    setIsOpen(false);
                }}
            >
                <Image
                    source={getTokenIcon(tokenMarketIndex)}
                    style={styles.dropdownItemIcon}
                    contentFit="contain"
                />
                <Text style={styles.dropdownItemText}>{token.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.tokenSelectWrapper}>
            <TouchableOpacity
                style={styles.tokenSelect}
                onPress={() => setIsOpen(true)}
            >
                <Image
                    source={getTokenIcon(marketIndex)}
                    style={styles.tokenIcon}
                    contentFit="contain"
                />
                <Text style={styles.tokenName}>{TOKENS[marketIndex].name}</Text>
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={styles.dropdownMenu}>
                        <FlatList
                            data={Object.entries(filteredTokens)}
                            renderItem={renderTokenItem}
                            keyExtractor={(item) => item[0]}
                            style={styles.tokenList}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    tokenSelectWrapper: {
        position: 'relative',
        zIndex: 1,
    },
    tokenSelect: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    tokenIcon: {
        width: 26,
        height: 26,
        marginRight: 8,
    },
    tokenName: {
        fontSize: 16,
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownMenu: {
        width: '80%',
        maxHeight: 300,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tokenList: {
        width: '100%',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    dropdownItemIcon: {
        width: 22,
        height: 22,
        marginRight: 12,
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    }
});