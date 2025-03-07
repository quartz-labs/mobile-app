import { baseUnitToDecimal, decimalToBaseUnit } from "@quartz-labs/sdk";
import { useError } from "@/context/error-provider";
import { TxStatus, useTxStatus } from "@/context/tx-status-provider";
import { useStore } from "@/utils/store";
import { MARKET_INDEX_USDC } from "@quartz-labs/sdk";
import React, { useEffect, useState } from "react";
import { displayToTimeframe, SpendLimitTimeframe, SpendLimitTimeframeDisplay, timeframeToDisplay } from "@/types/enums/SpendLimitTimeframe.enum";
import { buildEndpointURL, deserializeTransaction, fetchAndParse, signAndSendTransaction } from "@/utils/helpers";
import config from "@/config/config";
import { captureError } from "@/utils/errors";
import { EmbeddedProviderError, getUserEmbeddedSolanaWallet, useEmbeddedSolanaWallet, usePrivy } from "@privy-io/expo";
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import ButtonRow from "../Home/ButtonRow/ButtonRow";
import { Colors } from "@/constants/Colors";
import { useRefetchSpendLimits } from "@/utils/hooks";
import { DEFAULT_CARD_TRANSACTION_LIMIT } from "@/config/constants";
import { router } from "expo-router";
import { PublicKey } from "@solana/web3.js";
import { Picker } from '@react-native-picker/picker';

export default function SpendLimitsPage() {

    const { user } = usePrivy();
    const account = getUserEmbeddedSolanaWallet(user);
    const walletAddress = account?.address ? new PublicKey(account.address) : null;

  const wallet = useEmbeddedSolanaWallet();
  const { showError } = useError();
  const { showTxStatus } = useTxStatus();

    const { 
        spendLimitTimeframeBaseUnits,
        spendLimitTimeframeLength,
        spendLimitRefreshing,
        spendLimitTimeframeRemainingBaseUnits
    } = useStore();
    const refetchSpendLimits = useRefetchSpendLimits();

    const [awaitingSign, setAwaitingSign] = useState(false);
    const [errorText, setErrorText] = useState("");

    
    let existingSpendLimitDollars = spendLimitTimeframeBaseUnits 
        ? baseUnitToDecimal(spendLimitTimeframeBaseUnits, MARKET_INDEX_USDC) 
        : 0;
    if (spendLimitTimeframeLength === 0) existingSpendLimitDollars = 0; // If timeframe is 0, limit is 0

  const [newLimitTimeframeDollarsStr, setNewLimitTimeframeDollarsStr] = useState<string>(
    existingSpendLimitDollars.toFixed(2)
  );

  let existingSpendLimitTimeframe = spendLimitTimeframeLength;
  const isValidSpendLimitTimeframe = (existingSpendLimitTimeframe === undefined)
    ? false
    : Object.values(SpendLimitTimeframe).filter(v => typeof v === 'number').includes(existingSpendLimitTimeframe);

  if (
    !isValidSpendLimitTimeframe 
    || existingSpendLimitTimeframe === undefined 
    || existingSpendLimitTimeframe === SpendLimitTimeframe.UNKNOWN
  ) {
    existingSpendLimitTimeframe = SpendLimitTimeframe.DAY;
  }
  const [newLimitTimeframeLength, setNewLimitTimeframeLength] = useState<SpendLimitTimeframe>(existingSpendLimitTimeframe);

  let remainingSpendLimitDollars = baseUnitToDecimal(spendLimitTimeframeRemainingBaseUnits ?? 0, MARKET_INDEX_USDC);
  if (spendLimitTimeframeLength === 0) remainingSpendLimitDollars = 0;

  useEffect(() => {
    refetchSpendLimits();
  }, [refetchSpendLimits]);

  const handleConfirm = async () => {
    if (!wallet?.wallets?.[0]?.address) return setErrorText("Wallet not connected");

        // TODO: Set error text if invalid
        const limitTimeframeDollarsNum = Number(newLimitTimeframeDollarsStr);
        if (Number.isNaN(limitTimeframeDollarsNum)) return setErrorText("Invalid spend limit");
        if (limitTimeframeDollarsNum < 0) return setErrorText("Spend limit cannot be negative");

        const limitTimeframeBaseUnits = decimalToBaseUnit(limitTimeframeDollarsNum, MARKET_INDEX_USDC);

        setAwaitingSign(true);
        try {
            const endpoint = buildEndpointURL(`${config.API_URL}/program/build-tx/spend-limit`, {
                address: walletAddress!.toBase58(),
                spendLimitTransactionBaseUnits: DEFAULT_CARD_TRANSACTION_LIMIT.toNumber(),
                spendLimitTimeframeBaseUnits: limitTimeframeBaseUnits,
                spendLimitTimeframe: newLimitTimeframeLength
            });
            const response = await fetchAndParse(endpoint, undefined, 3);
            const transaction = deserializeTransaction(response.transaction);
            const signature = await signAndSendTransaction(transaction, wallet, showTxStatus);
            
            setAwaitingSign(false);
            if (signature) {
                refetchSpendLimits();
                //TODO: go home
                router.push("/");
            }
        } catch (error) {
            if (error instanceof EmbeddedProviderError) showTxStatus({ status: TxStatus.SIGN_REJECTED });
            else {
                showTxStatus({ status: TxStatus.NONE });
                captureError(showError, "Failed to adjust spend limit", "/AddFundsModal.tsx", error, walletAddress);
            }
        } finally {
            setAwaitingSign(false);
        }
    }

  const showLoading = (spendLimitTimeframeBaseUnits === undefined) || spendLimitRefreshing;

  return (
    <View style={styles.contentWrapper}>
      <Text style={styles.heading}>Card Spend Limits</Text>
      
      <Text style={styles.description}>
        Set the maximum limit the Quartz card can debit from your account.
      </Text>

      <Text style={styles.remainingLimit}>
        Remaining spend limit: ${remainingSpendLimitDollars}
      </Text>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Spend Limit:</Text>

        <View style={styles.inputFieldWrapper}>
          {!showLoading ? (
            <TextInput 
              style={styles.inputField}
              keyboardType="numeric"
              placeholder="0.0" 
              value={
                newLimitTimeframeDollarsStr.startsWith("$")
                ? newLimitTimeframeDollarsStr
                : `$${newLimitTimeframeDollarsStr}`
              } 
              onChangeText={(text) => 
                setNewLimitTimeframeDollarsStr(
                  text.replace("$", "").replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
                )
              }
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.light.tint} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Each:</Text>

        <View style={styles.pickerWrapper}>
          <Picker
            style={styles.picker}
            selectedValue={timeframeToDisplay(newLimitTimeframeLength)}
            onValueChange={(itemValue) => 
              setNewLimitTimeframeLength(displayToTimeframe(itemValue as SpendLimitTimeframeDisplay))
            }
          >
            {Object.values(SpendLimitTimeframeDisplay)
              .filter(display => display !== SpendLimitTimeframeDisplay.UNKNOWN)
              .map((display) => (
                <Picker.Item key={display} label={display} value={display} />
              ))}
          </Picker>
        </View>
      </View>
      
      {errorText ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      ) : null}

      <ButtonRow 
        primaryLabel="Confirm" 
        secondaryLabel="Cancel"
        isLoading={awaitingSign} 
        onPrimaryPress={handleConfirm} 
        onSecondaryPress={() => router.push("/")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    padding: 20,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    width: "100%",
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.light.text,
  },
  description: {
    marginBottom: 40,
    color: Colors.light.text,
    fontSize: 16,
  },
  remainingLimit: {
    marginBottom: 10,
    color: Colors.light.text,
    fontSize: 16,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputLabel: {
    color: Colors.light.text,
    fontSize: 16,
  },
  inputFieldWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  inputField: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    color: Colors.light.text,
    fontSize: 16,
  },
  loadingContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  pickerWrapper: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: Colors.light.text,
    backgroundColor: 'transparent',
  },
  errorContainer: {
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
});