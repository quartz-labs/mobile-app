//add a page that opens the AddFundsPage component

import { View } from "react-native";
import SpendLimitsPage from "@/components/PageVariations/SpendLimit";
export default function SpendLimitPageWrapper() {
    return <View>
        <SpendLimitsPage />
    </View>;
}