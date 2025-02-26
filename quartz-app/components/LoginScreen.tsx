import { Button, Linking, Text, View } from "react-native";
import {
  useLogin,
} from "@privy-io/expo";
import Constants from "expo-constants";
import { useState } from "react";
import * as Application from "expo-application";
import { useAppState } from "@/context/AppStateContext";

export default function LoginScreen() {
  const [error, setError] = useState("");

  const { updateUserState } = useAppState();

  const { login } = useLogin();

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
      <Text>Privy App ID:</Text>
      <Text style={{ fontSize: 10 }}>
        {Constants.expoConfig?.extra?.privyAppId}
      </Text>
      <Text>Privy Client ID:</Text>
      <Text style={{ fontSize: 10 }}>
        {Constants.expoConfig?.extra?.privyClientId}
      </Text>
      <Text>
        Navigate to your{" "}
        <Text
          onPress={() =>
            Linking.openURL(
              `https://dashboard.privy.io/apps/${Constants.expoConfig?.extra?.privyAppId}/settings?setting=clients`
            )
          }
        >
          dashboard
        </Text>{" "}
        and ensure the following Expo Application ID is listed as an `Allowed
        app identifier`:
      </Text>
      <Text style={{ fontSize: 10 }}>{Application.applicationId}</Text>
      <Text>
        Navigate to your{" "}
        <Text
          onPress={() =>
            Linking.openURL(
              `https://dashboard.privy.io/apps/${Constants.expoConfig?.extra?.privyAppId}/settings?setting=clients`
            )
          }
        >
          dashboard
        </Text>{" "}
        and ensure the following value is listed as an `Allowed app URL scheme`:
      </Text>
      <Text style={{ fontSize: 10 }}>
        {Application.applicationId === "host.exp.Exponent"
          ? "exp"
          : Constants.expoConfig?.scheme}
      </Text>

      <Button
        title="Login with Privy UIs"
        onPress={() => {
          login({ loginMethods: ["email"] })
            .then((session) => {
              //TODO: Open the Continue Login screen  (checks if the user already has a Quartz account)
              //set the user state to logged in
              updateUserState({
                isLoggedIn: true,
                userId: session.user.id,
                hasQuartzAccount: false,
              });

              console.log("User logged in", session.user);
            })
            .catch((err) => {
              setError(JSON.stringify(err.error) as string);
            });
        }}
      />
      {error && <Text style={{ color: "red" }}>Error: {error}</Text>}
    </View>
  );
}
