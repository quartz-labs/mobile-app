import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import type { ProviderCardHistory } from "@/types/interfaces/ProviderCardHistory.interface";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

interface TransactionCardProps {
    transaction: ProviderCardHistory;
    dateLabelled: boolean;
}

export default function TransactionCard({ transaction, dateLabelled }: TransactionCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const detailsRef = useRef<HTMLDivElement>(null);

    // Formatted date/time strings
    const timeObj = new Date(transaction.spend.authorizedAt);
    const formattedDate = timeObj.toLocaleDateString("en-IE", {
        month: "long",
        day: "numeric"
    });
    const formattedTime = timeObj.toLocaleTimeString("en-IE", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    const formattedDateTime = `${formattedDate}, ${formattedTime}`;


    const merchantImage = transaction.spend.enrichedMerchantIcon;
    const defaultMerchantIcon = "/dollar.svg";

    // Formatted date label
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let dateLabel = formattedDate;
    if (timeObj.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) dateLabel = "Today";
    else if (timeObj.setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0)) dateLabel = "Yesterday";


    //const inputTokenIcon = "/tokens/sol.jpg"; // TODO - Remove hardcoding

    // Handle opening and closing transaction details
    const PADDING_VERTICLE = 20;
    const PADDING_HORIZONTAL = 20;
    useEffect(() => {
        if (detailsRef.current) {
            if (isOpen) {
                detailsRef.current.style.maxHeight = `${detailsRef.current.scrollHeight + (PADDING_VERTICLE * 2)}px`;
                detailsRef.current.style.padding = `${PADDING_VERTICLE}px ${PADDING_HORIZONTAL}px`;
            } else {
                detailsRef.current.style.maxHeight = '0px';
                detailsRef.current.style.padding = `0px ${PADDING_HORIZONTAL}px`;
            }
        }
    }, [isOpen]);

    return (
        <View style={styles.transactionCardWrapper}>
            {dateLabelled && (
                <View style={styles.dateLabel}>
                    <Text style={styles.lightText}>{dateLabel}</Text>
                </View>
            )}
            
            <View style={[styles.transactionCard, styles.glass]}>
                <TouchableOpacity
                    onPress={() => setIsOpen(!isOpen)}
                    style={[
                        styles.cardBase,
                        styles.glass,
                        isOpen && styles.selected
                    ]}
                >
                    <View style={styles.currencies}>
                        <Image
                            source={merchantImage || defaultMerchantIcon}
                            style={styles.merchantIcon}
                            contentFit="contain"
                        />
                    </View>
                    
                    <View style={styles.basicInfo}>
                        <Text style={styles.lightText}>
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Text>
                        <Text style={styles.amount}>${transaction.spend.amount / 100}</Text>
                        <Text style={styles.time}>{formattedTime}</Text>
                    </View>
                </TouchableOpacity>

                    <View style={styles.detailRow}>
                        <Text style={styles.lightText}>Spent</Text>
                        <Text style={styles.detailText}>${transaction.spend.amount / 100}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.lightText}>At</Text>
                        <Text style={styles.detailText}>{transaction.spend.enrichedMerchantName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.lightText}>Created on</Text>
                        <Text style={styles.detailText}>{formattedDateTime}</Text>
                    </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  transactionCardWrapper: {
    marginVertical: 8,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  dateLabel: {
    marginBottom: 4,
  },
  transactionCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBase: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  currencies: {
    marginRight: 12,
  },
  merchantIcon: {
    height: 19,
    width: 19,
    borderRadius: 10,
  },
  basicInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lightText: {
    color: Colors.light.text,
    opacity: 0.7,
  },
  amount: {
    color: Colors.light.text,
    fontWeight: '600',
  },
  time: {
    color: Colors.light.text,
    fontSize: 12,
  },
  cardDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailText: {
    color: Colors.light.text,
  },
  open: {
    display: 'flex',
  }
});