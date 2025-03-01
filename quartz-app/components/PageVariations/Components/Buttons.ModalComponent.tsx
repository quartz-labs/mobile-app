import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface ButtonsProps {
    label: string;
    awaitingSign: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    disabled?: boolean;
}

const Buttons: React.FC<ButtonsProps> = ({ 
    label, 
    awaitingSign, 
    onConfirm, 
    onCancel, 
    disabled = false 
}) => {
    return (
        <View style={styles.buttons}>
            <TouchableOpacity 
                style={[styles.ghostButton, styles.mainButton]}
                onPress={onCancel}
            >
                <Text style={styles.ghostButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[
                    styles.mainButton, 
                    styles.confirmButton,
                    disabled && styles.disabledButton
                ]}
                onPress={() => {
                    if (!disabled) onConfirm();
                }}
                disabled={disabled}
            >
                {awaitingSign ? (
                    <ActivityIndicator 
                        color="#ffffff" 
                        size="small"
                        testID="loader"
                    />
                ) : (
                    <Text style={styles.confirmButtonText}>{label}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
    },
    mainButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    ghostButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    confirmButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    disabledButton: {
        opacity: 0.5,
    },
    ghostButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default Buttons;