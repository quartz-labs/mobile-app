import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyAssetCardProps {
    category: string;
}

const EmptyAssetCard: React.FC<EmptyAssetCardProps> = ({ category }) => {
    return (
        <View style={styles.assetCard}>
            <Text style={styles.emptyCardText}>No {category} assets</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    assetCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    emptyCardText: {
        textAlign: 'center' as const,
        color: '#888',
        fontSize: 16,
    }
});

export default EmptyAssetCard;