import React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { CardTransactionStatus } from '@/types/interfaces/ProviderCardHistory.interface';

interface TransactionStatusProps {
  status: CardTransactionStatus;
}

export default function TransactionStatus({ status }: TransactionStatusProps) {
  const completed = 'Completed';
  const pending = 'Pending';
  const declined = 'Declined';
  const reversed = 'Reversed';

  switch (status) {
    case 'completed':
      return <Text style={[styles.status, styles.success]}>{completed}</Text>;
    case 'pending':
      return <Text style={[styles.status, styles.processing]}>{pending}</Text>;
    case 'declined':
      return <Text style={[styles.status, styles.fail]}>{declined}</Text>;
    case 'reversed':
      return <Text style={[styles.status, styles.loading]}>{reversed}</Text>;
    default:
      throw new TypeError('Invalid status');
  }
}

const styles = StyleSheet.create({
  status: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  success: {
    color: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  processing: {
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  fail: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  loading: {
    color: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
});