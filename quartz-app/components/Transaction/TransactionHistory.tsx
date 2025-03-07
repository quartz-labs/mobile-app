import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import TransactionCard from './TransactionCard';
import { Colors } from '@/constants/Colors';
import type { ProviderCardHistory } from '@/types/interfaces/ProviderCardHistory.interface';

interface TransactionsProps {
    transactions: ProviderCardHistory[]
}

export default function TransactionHistory({transactions} : TransactionsProps) {
    let lastDate: Date | null = null;

    const renderTransaction = ({ item, index }: { item: ProviderCardHistory; index: number }) => {
        const isFirstOfDay = !lastDate || lastDate.setHours(0,0,0,0) !== new Date(item.spend.authorizedAt).setHours(0,0,0,0);
        lastDate = new Date(item.spend.authorizedAt);

        return (
            <TransactionCard
                key={index}
                transaction={item}
                dateLabelled={isFirstOfDay}
            />
        );
    };

    return (
        <View style={styles.transactions}>
            <Text style={styles.title}>Card Transactions</Text>
            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.transactionsContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    transactions: {
        flex: 1,
        width: '100%',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 16,
    },
    transactionsContent: {
        paddingBottom: 16,
    },
});