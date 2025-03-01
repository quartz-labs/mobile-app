import { useStore } from '@/utils/store';
import { router } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';


const ButtonRow = () => {
    const { balances } = useStore();
    const hasLoan = balances ? Object.values(balances).some(balance => balance < 0) : false;

    return (
        <View style={styles.buttonRow}>
            <TouchableOpacity
                style={[styles.glassButton, styles.mainButton]}
                //I want to open this component: AddFundsPage quartz-app/components/PageVariations/AddFunds.tsx
                onPress={() => router.push('/addFunds')}
            >
                <Text style={styles.buttonText}>Add Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.glassButton, styles.mainButton]}
                //TODO: Open the Withdraw page
                onPress={() => router.push('/withdraw')}
            >
                <Text style={styles.buttonText}>Withdraw</Text>
            </TouchableOpacity>

            {/* Commented out button
      <TouchableOpacity
        style={[styles.glassButton, styles.mainButton]}
        onPress={() => setModalVariation(PageVariation.BORROW)}
      >
        <Text style={styles.buttonText}>Borrow</Text>
      </TouchableOpacity>
      */}

            {hasLoan && (
                <TouchableOpacity
                    style={[styles.glassButton, styles.ghostButton, styles.mainButton]}
                    //TODO: Open the Repay Loan page
                    onPress={() => router.push('/repayLoan')}
                >
                    <Text style={styles.buttonText}>Repay Loan</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginVertical: 16,
    },
    glassButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginHorizontal: 4,
        marginVertical: 8,
    },
    ghostButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    mainButton: {
        minWidth: 120,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    }
});

export default ButtonRow;