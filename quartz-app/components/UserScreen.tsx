import React, { useState, useCallback } from "react";
import { Text, TextInput, View, Button, ScrollView } from "react-native";

import {
  usePrivy,
  getUserEmbeddedSolanaWallet,
  useEmbeddedSolanaWallet,
  PrivyEmbeddedSolanaWalletProvider,
} from "@privy-io/expo";
import { PrivyUser } from "@privy-io/public-api";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

const toMainIdentifier = (x: PrivyUser["linked_accounts"][number]) => {
  if (x.type === "phone") {
    return x.phoneNumber;
  }
  if (x.type === "email" || x.type === "wallet") {
    return x.address;
  }


  if (x.type === "custom_auth") {
    return x.custom_user_id;
  }

  return x.type;
};

export const UserScreen = () => {
  const [password, setPassword] = useState("");
  const [chainId, setChainId] = useState("1");
  const [signedMessages, setSignedMessages] = useState<string[]>([]);

  const { logout, user } = usePrivy();
  const wallet = useEmbeddedSolanaWallet();

  const account = getUserEmbeddedSolanaWallet(user);

  const [provider, setProvider] = useState<PrivyEmbeddedSolanaWalletProvider | null>(null);

  const [walletBalance, setWalletBalance] = useState<number>(0);

  const connection = new Connection('https://api.devnet.solana.com');

  const signMessage = useCallback(
    async () => {
      try {
        if (!wallet.getProvider) {
          console.error("Wallet provider is not available");
          return;
        }
        const provider = await wallet.getProvider();
        setProvider(provider);
        const message = await provider.request({
          method: 'signMessage',
          params: {
            message: `${Date.now()}`
          }
        });
        if (message) {
          setSignedMessages((prev) => prev.concat(message.signature));
        }
      } catch (e) {
        console.error(e);
      }
    },
    [account?.address]
  );

  const getBalance = useCallback(async () => {
    if (!provider) {
      if (!wallet.getProvider) {
        console.error("Wallet provider is not available");
        return;
      }
      const provider = await wallet.getProvider();
      setProvider(provider);
    }

    const balance = await connection.getBalance(new PublicKey(wallet.wallets![0].address));
    setWalletBalance(balance / LAMPORTS_PER_SOL);

  }, [provider]);


  const signAndSendTransaction = useCallback(async () => {
    if (!provider) {
      if (!wallet.getProvider) {
        console.error("Wallet provider is not available");
        return;
      }
      const provider = await wallet.getProvider();
      setProvider(provider);
    }

    console.log("provider", provider);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(wallet.wallets![0].address),
        toPubkey: new PublicKey("G4u3ZzEVP83AJsjc53Ya2VVcDNzvgUbmPpwXEMPPTetC"),
        lamports: LAMPORTS_PER_SOL * 0.001,
      })
    );
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(wallet.wallets![0].address);

    console.log("transaction", transaction);

    const signature = await provider!.request({
      method: 'signAndSendTransaction',
      params: {
        transaction,
        connection,
      }
    });
    console.log("signature", signature);
    setSignedMessages((prev) => prev.concat(signature.signature));
  }, [provider]);


  if (!user) {
    return null;
  }

  return (
    <View>
      {wallet.status === "needs-recovery" && (
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
        />
      )}

      <ScrollView style={{ borderColor: "rgba(0,0,0,0.1)", borderWidth: 1 }}>
        <View
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <View>
            <Text style={{ fontWeight: "bold" }}>User ID</Text>
            <Text>{user.id}</Text>
          </View>

          <View>
            <Text style={{ fontWeight: "bold" }}>Linked accounts</Text>
            {user?.linked_accounts.length ? (
              <View style={{ display: "flex", flexDirection: "column" }}>
                {user?.linked_accounts?.map((m, index) => (
                  <Text
                    key={`${m.type}-${toMainIdentifier(m)}-${index}`}
                    style={{
                      color: "rgba(0,0,0,0.5)",
                      fontSize: 12,
                      fontStyle: "italic",
                    }}
                  >
                    {m.type}: {toMainIdentifier(m)}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>

          <View>
            {account?.address && (
              <>
                <Text style={{ fontWeight: "bold" }}>Embedded Wallet</Text>
                <Text>{account?.address}</Text>
              </>
            )}

            <Text>Wallet Balance: {walletBalance} SOL</Text>

            {wallet.status === "connecting" && <Text>Loading wallet...</Text>}

            {wallet.status === "error" && <Text>{wallet.error}</Text>}

            {wallet.status === "not-created" && (
              <Button title="Create Wallet" onPress={() => wallet.create()} />
            )}

            {wallet.status === "connected" && (
              <Button
                title="Sign Message"
                onPress={() => signMessage()}
              />
            )}

            {wallet.status === "connected" && (
              <Button
                title="Get Balance"
                onPress={() => getBalance()}
              />
            )}

            {wallet.status === "connected" && (
              <Button
                title="Send Transaction"
                onPress={() => signAndSendTransaction()}
              />
            )}

            {wallet.status === "connected" && (
              <>
                <TextInput
                  value={chainId}
                  onChangeText={setChainId}
                  placeholder="Chain Id"
                />
              </>
            )}

            {wallet.status === "needs-recovery" && (
              <Button
                title="Recover Wallet"
                onPress={() => wallet.recover()}
              />
            )}
          </View>

          <View style={{ display: "flex", flexDirection: "column" }}>
            {signedMessages.map((m) => (
              <React.Fragment key={m}>
                <Text
                  style={{
                    color: "rgba(0,0,0,0.5)",
                    fontSize: 12,
                    fontStyle: "italic",
                  }}
                >
                  {m}
                </Text>
                <View
                  style={{
                    marginVertical: 5,
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(0,0,0,0.2)",
                  }}
                />
              </React.Fragment>
            ))}
          </View>
          <Button title="Logout" onPress={logout} />
        </View>
      </ScrollView>
    </View>
  );
};
