import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import Svg, { Circle } from 'react-native-svg';

interface CopyTextProps {
    text: string;
}

export default function CopyText({ text }: CopyTextProps) {
    const [isCopied, setIsCopied] = useState(false);

    const copy = async () => {
        setIsCopied(true);
                
        // Copy to clipboard
        await Clipboard.setStringAsync(text.replace(/\s/g, ''));
        
        // Reset copied state after delay
        setTimeout(() => {
            setIsCopied(false);
        }, 650);
    };

    return (
        <TouchableOpacity
            style={styles.copyText}
            onPress={copy}
            activeOpacity={0.7}
        >
            <Text style={styles.text}>{text}</Text>

            <View style={styles.copyIconWrapper}>
                {isCopied ? (
                    <View style={styles.burstContainer}>
                            <Svg width="16" height="16" viewBox="0 0 16 16">
                                <Circle
                                    cx="8"
                                    cy="8"
                                    r="4"
                                    fill="none"
                                    stroke="#FFFFFF"
                                    strokeWidth="0.75"
                                />
                            </Svg>
                        <Image
                            source={require("@/assets/images/copy_bg.svg")}
                            style={styles.copyIcon}
                            contentFit="contain"
                        />
                    </View>
                ) : (
                    <Image
                        source={require("@/assets/images/copy_bg.svg")}
                        style={styles.copyIcon}
                        contentFit="contain"
                    />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    copyText: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    text: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    copyIconWrapper: {
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    burstContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    copyIcon: {
        width: 16,
        height: 16,
    }
});