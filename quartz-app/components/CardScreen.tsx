import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import Card from "./Card/Card";
import { useStore } from "@/utils/store";
import { getCardDetailsFromInternalApi, signMessageWithPrivy } from "@/utils/helpers";
import { router } from "expo-router";
import { useLoginCardUser } from '@/utils/hooks';
import { getUserEmbeddedSolanaWallet, useEmbeddedSolanaWallet } from "@privy-io/expo";
import { usePrivy } from "@privy-io/expo";
import { PublicKey } from "@solana/web3.js";
import { TandCsNeeded } from "@/types/enums/QuartzCardAccountStatus.enum";
import { Colors } from "@/constants/Colors";


export default function CardDetails() {
    const {
        jwtToken,
        cardDetails,
        provider,
        setProvider
    } = useStore();

    const [loadingDetails, setLoadingDetails] = useState(false);
    const [cardPan, setCardPan] = useState<string | null>(null);
    const [cardCvc, setCardCvc] = useState<string | null>(null);
    const showDetails = (cardPan !== null && cardCvc !== null);

    const { user } = usePrivy();
    const account = getUserEmbeddedSolanaWallet(user);

    const loginCardUser = useLoginCardUser();
    const wallet = useEmbeddedSolanaWallet();

    const getCardDetails = async (cardId: string) => {
        setLoadingDetails(true);

        const walletAddress = account?.address ? new PublicKey(account.address) : null;

        console.log("walletAddress in getCardDetails", walletAddress);
        const message = [
            "Sign this message to authenticate ownership. This signature will not trigger any blockchain transaction or cost any gas fees.\n",
            `Wallet address: ${walletAddress}`,
            `Timestamp: ${Date.now()}`
        ].join("\n");
        console.log("message", message);

        try {
            const signedMessage = await signMessageWithPrivy(await provider!, message);

            console.log("signedMessage", signedMessage);
            console.log("jwtToken", jwtToken);
            //loginCardUser.mutate({ acceptTandcsParam: TandCsNeeded.ACCEPTED, signedMessage: signedMessage });
            console.log("jwtToken after mutation", jwtToken);
        } catch (error) {
            console.error("Error signing message:", error);
        }

        try {
            console.log("Card id:", cardId);

            if (!jwtToken || jwtToken === undefined) {
                console.error("No JWT token found");

                return
            }
            console.log("JWT token:", jwtToken);

            const cardDetails = await getCardDetailsFromInternalApi(cardId, jwtToken);
            console.log("cardDetails", cardDetails);

            const formattedPan = cardDetails.pan.match(/.{1,4}/g).join(' ');
            setCardPan(formattedPan.pan);
            setCardCvc(cardDetails.cvc);
        } catch (error) {
            console.error("Error fetching card details:", error);
        } finally {
            setLoadingDetails(false);
        }
    }

    const swapCardDetailsVisibility = () => {
        if (showDetails || cardDetails === undefined) {
            setCardPan(null);
            setCardCvc(null);
        } else {
            console.log("Getting card details")
            getCardDetails(cardDetails.id);
        }
    }

    return (
        <View style={styles.cardWrapper}>
            <View style={styles.cardContainer}>
                <Card
                    cvc={cardCvc}
                    pan={cardPan}
                />

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.mainButton}
                        //TODO: Add spend limit page
                        onPress={() => router.push('/spendLimit')}
                    >
                        <Text style={styles.buttonText}>Spend Limits</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.mainButton}
                        onPress={swapCardDetailsVisibility}
                        disabled={loadingDetails}
                    >
                        {loadingDetails ? (
                            <ActivityIndicator
                                color="#ffffff"
                                size="small"
                                testID="loader"
                            />
                        ) : (
                            <Text style={styles.buttonText}>
                                {showDetails ? "Hide Details" : "View Details"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContainer: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
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
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 30,
    }
});