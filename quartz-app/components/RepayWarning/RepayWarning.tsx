import { useStore } from "@/utils/store";
import type React from "react";
import { baseUnitToDecimal, MARKET_INDEX_USDC } from "@quartz-labs/sdk";
import { Image } from "expo-image";
import styles from "./RepayWarning.module.css";

export default function RepayWarning() {
    const { health, borrowLimits } = useStore();

    const usdcBorrowLimitBaseUnits = borrowLimits?.[MARKET_INDEX_USDC] ?? 0;
    const availableCredit = baseUnitToDecimal(usdcBorrowLimitBaseUnits, MARKET_INDEX_USDC);

    if (availableCredit >= 30 || (health ?? 0) >= 50) {
        return (<></>);
    }

    return (
        <div className={styles.repayWarning}>
            <Image
                source={require('@/assets/images/info.webp')}
                alt=""
                style={{ width: 24, height: 24 }}
            />
            <p>Collateral will be sold to repay loans if available credit reaches $0</p>
        </div>
    );
}