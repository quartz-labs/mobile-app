import { Button, Linking, Text, View } from "react-native";
import {
  useLoginWithOAuth,
  useLogin,
  usePrivy,
  getUserEmbeddedSolanaWallet,
  useEmbeddedSolanaWallet,
} from "@privy-io/expo";
import Constants from "expo-constants";
import { useState } from "react";
import * as Application from "expo-application";
import { useAppState } from "@/context/AppStateContext";
import React from "react";

export default function CreateQuartzAccount() {
  const [error, setError] = useState("");

  const { state, updateUserState, clearState } = useAppState();

  const { login } = useLogin();
  const oauth = useLoginWithOAuth({
    onError: (err) => {
      console.log(err);
      setError(JSON.stringify(err.message));
    },
  });

  const { logout, user } = usePrivy();

  const handleLogout = () => {
    clearState();
    logout();
  };

  const wallet = useEmbeddedSolanaWallet();

  const account = getUserEmbeddedSolanaWallet(user);

  const handleCreateQuartzAccount = () => {
    // TODO: Implement account creation logic

    //Update the state so that Quartz has a user id
    updateUserState({
      hasQuartzAccount: true
    });

    //TODO: Open the Tablayout

    console.log("Creating Quartz account for user:", user?.id);
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
            onPress={handleCreateQuartzAccount}
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
