import { SafeAreaView, Text, View } from "react-native";
import Constants from "expo-constants";
import { UserScreen } from "@/components/UserScreen";
import { useAppState } from "@/context/AppStateContext";
import LoginScreen from "@/components/LoginScreen";
import CreateQuartzAccount from "@/components/CreateQuartzAccount";

export default function Index() {
  const { state } = useAppState();

  if ((Constants.expoConfig?.extra?.privyAppId as string).length !== 25) {
    return (
      <SafeAreaView>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>You have not set a valid `privyAppId` in app.json</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (
    !(Constants.expoConfig?.extra?.privyClientId as string).startsWith(
      "client-"
    )
  ) {
    return (
      <SafeAreaView>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>You have not set a valid `privyClientId` in app.json</Text>
        </View>
      </SafeAreaView>
    );
  }

  // if (!state.user.isLoggedIn) {
  //   console.log("User is not logged in in index");
  //   //return <UserScreen />;
  //   return <LoginScreen />;
  // }
  
  // if (!state.user.hasQuartzAccount) {
  //   console.log("User has no Quartz account");
  //   return <CreateQuartzAccount />;
  // }

  return <UserScreen />;
}
