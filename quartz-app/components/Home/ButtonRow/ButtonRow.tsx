import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ButtonRowProps {
  primaryLabel?: string;
  secondaryLabel?: string;
  isLoading?: boolean;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
}

const ButtonRow: React.FC<ButtonRowProps> = ({
  primaryLabel = "Add Funds",
  secondaryLabel = "Withdraw",
  isLoading = false,
  onPrimaryPress,
  onSecondaryPress
}) => {
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={[styles.glassButton, styles.mainButton]}
        onPress={onPrimaryPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.light.text} />
        ) : (
          <Text style={styles.buttonText}>{primaryLabel}</Text>
        )}
      </TouchableOpacity>

      {secondaryLabel && onSecondaryPress && (
        <TouchableOpacity
          style={[styles.glassButton, styles.ghostButton, styles.mainButton]}
          onPress={onSecondaryPress}
        >
          <Text style={styles.buttonText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ButtonRow;

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  glassButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  mainButton: {
    backgroundColor: Colors.dark.tint,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.tint,
  },
  buttonText: {
    color: Colors.light.text,
    fontWeight: 'bold',
  },
});