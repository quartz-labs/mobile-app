import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useStore } from '@/utils/store';
import CopyText from './CopyText';

interface CardDetails {
    cvc: string | null;
    pan: string | null;
}

export default function Card({ cvc, pan }: CardDetails) {
    const { cardDetails, jwtToken } = useStore();

    if (!cardDetails || !jwtToken) {
        return (
            <View style={styles.card}>
                <Image
                    source={require("@/assets/images/visa.svg")}
                    style={styles.visaLogo}
                    contentFit="contain"
                />
                <View style={styles.detail}>
                    <Text style={styles.label}>Virtual Card</Text>
                    <Text style={styles.cardText}>•••• ••••</Text>
                </View>
            </View>
        );
    }

    if (!pan || !cvc) {
        return (
            <View style={styles.card}>
                <Image
                    source={require("@/assets/images/visa.svg")}
                    style={styles.visaLogo}
                    contentFit="contain"
                />
                <View style={styles.detail}>
                    <Text style={styles.label}>Virtual Card</Text>
                    <Text style={styles.cardText}>•••• {cardDetails.last4}</Text>
                </View>
            </View>
        );
    }

    const expiryYear = cardDetails.expirationYear.toString().slice(-2);
    const expiryMonth = cardDetails.expirationMonth.toString().padStart(2, '0');
    
    return (
        <View style={styles.card}>
            <Image
                source={require("@/assets/images/visa.svg")}
                style={styles.visaLogo}
                contentFit="contain"
            />
            <View style={styles.cardNumber}>
                <Text style={styles.label}>Card Number</Text>
                <CopyText text={pan} />
            </View>
            <View style={styles.cardDetails}>
                <View style={styles.detail}>
                    <Text style={styles.label}>Expiry</Text>
                    <CopyText text={`${expiryMonth}/${expiryYear}`} />
                </View>
                <View style={styles.detail}>
                    <Text style={styles.label}>CVC</Text>
                    <CopyText text={cvc} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: '#1E3A8A', // Dark blue background
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    visaLogo: {
        width: 77,
        height: 25,
        marginBottom: 20,
    },
    cardNumber: {
        marginVertical: 16,
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    detail: {
        marginVertical: 4,
    },
    label: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 4,
    },
    cardText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    }
});