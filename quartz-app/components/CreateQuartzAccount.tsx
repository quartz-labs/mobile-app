import { Button, Text, View } from "react-native";
import {
  usePrivy,
  getUserEmbeddedSolanaWallet,
  useEmbeddedSolanaWallet,
} from "@privy-io/expo";
import { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import React from "react";
import { buildEndpointURL, deserializeTransaction, fetchAndParse, signAndSendTransaction } from "@/utils/helpers";
import { captureError } from "@/utils/errors";
import { TxStatus } from "@/context/tx-status-provider";
import { useTxStatus } from "@/context/tx-status-provider";
import { useRefetchAccountStatus } from "@/utils/hooks";
import { useError } from "@/context/error-provider";
import { PublicKey } from "@solana/web3.js";
import { useStore } from "@/utils/store";
import config from "@/config/config";

export default function CreateQuartzAccount() {
  const [error, setError] = useState("");

  const { state, updateUserState, clearState } = useAppState();

  const { 
    setIsInitialized,
  } = useStore();


  const { showTxStatus } = useTxStatus();
  const [attemptFailed, setAttemptFailed] = useState(false);
  const [awaitingSign, setAwaitingSign] = useState(false);
  const refetchAccountStatus = useRefetchAccountStatus();
  const { showError } = useError();

  const { logout, user } = usePrivy();

  const handleLogout = () => {
    clearState();
    logout();
  };

  const wallet = useEmbeddedSolanaWallet();
  const account = getUserEmbeddedSolanaWallet(user);

  const handleCreateAccount = async () => {
    if (!wallet || awaitingSign) return;

    setAttemptFailed(false);
    setAwaitingSign(true);
    refetchAccountStatus();
    try {
      const walletAddress = wallet?.wallets?.[0]?.address;
      console.log("walletAddress in create account", walletAddress);
      const endpoint = buildEndpointURL(`${config.API_URL}/program/build-tx/init-account`, {
        address: walletAddress
      });
      console.log("endpoint in create account", endpoint);
      const response = await fetchAndParse(endpoint);
      console.log("response in create account", response);
      const transaction = deserializeTransaction(response.transaction);
      console.log("transaction in create account", transaction);
      const signature = await signAndSendTransaction(transaction, wallet, showTxStatus);
      console.log("signature in create account", signature);

      setAwaitingSign(false);
      if (signature) {
        refetchAccountStatus(signature);
      }
    } catch (error) {
      //if (error instanceof WalletSignTransactionError) showTxStatus({ status: TxStatus.SIGN_REJECTED });
      //else {
        showTxStatus({ status: TxStatus.NONE });
        captureError(showError, "Failed to create account", "/Onboarding.tsx", error, wallet?.wallets?.[0]?.address ? new PublicKey(wallet?.wallets?.[0]?.address) : null);
      //}
      setAwaitingSign(false);
    }
  };

  //if continueLogin is true, then we should check if the user has a Quartz account
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        marginHorizontal: 10,
      }}
    >
      {user ? (
        <>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Your Wallet Address
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 20 }}>
            {account?.address || "No wallet address found"}
          </Text>

          <Button
            title="Create Quartz Account"
            onPress={handleCreateAccount}
          />
        </>
      ) : (
        <>
          <Text>Privy App ID:</Text>
          <Text> Privy solana wallet not found in create Quartz account component</Text>

        </>
      )}
      {error && <Text style={{ color: "red" }}>Error: {error}</Text>}
    </View>
  );
}
