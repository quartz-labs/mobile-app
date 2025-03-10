import type { Rate } from "@/types/interfaces/Rate.interface";
import { create } from "zustand";
import type { MarketIndex } from "@quartz-labs/sdk";
import type { CardsForUserResponse } from "@/types/interfaces/CardsForUserResponse.interface";
import type { ProviderCardUser } from "@/types/interfaces/ProviderCardUser.interface";
import type { QuartzCardUser } from "@/types/interfaces/QuartzCardUser.interface";
import type { JwtToken } from "@/types/JwtToken.type";
import type { ProviderCardHistory } from "@/types/interfaces/ProviderCardHistory.interface";

type State = {
  isInitialized: boolean;
  prices?: Record<MarketIndex, number>;
  rates?: Record<MarketIndex, Rate>;
  balances?: Record<MarketIndex, number>;
  withdrawLimits?: Record<MarketIndex, number>;
  borrowLimits?: Record<MarketIndex, number>;
  health?: number;
  depositLimits?: Record<MarketIndex, number>;
  jwtToken?: JwtToken;
  isSigningLoginMessage: boolean;
  kycLink?: string;
  quartzCardUser?: QuartzCardUser;
  providerCardUser?: ProviderCardUser;
  cardDetails?: CardsForUserResponse;
  spendLimitTransactionBaseUnits?: number;
  spendLimitTimeframeBaseUnits?: number;
  spendLimitTimeframeRemainingBaseUnits?: number;
  spendLimitTimeframeLength?: number;
  spendLimitRefreshing?: boolean;
  txHistory?: ProviderCardHistory[];
  doneLoading?: boolean;
};

type Action = {
  setIsInitialized: (isInitialized: boolean) => void;
  setPrices: (prices?: Record<MarketIndex, number>) => void;
  setRates: (rates?: Record<MarketIndex, Rate>) => void;
  setBalances: (balances?: Record<MarketIndex, number>) => void;
  setWithdrawLimits: (withdrawLimits?: Record<MarketIndex, number>) => void;
  setBorrowLimits: (borrowLimits?: Record<MarketIndex, number>) => void;
  setHealth: (health?: number) => void;
  setDepositLimits: (depositLimits?: Record<MarketIndex, number>) => void;
  setJwtToken: (jwtToken?: JwtToken) => void;
  setIsSigningLoginMessage: (isSigningLoginMessage: boolean) => void;
  setKycLink: (kycLink?: string) => void;
  setQuartzCardUser: (quartzCardUser?: QuartzCardUser) => void;
  setProviderCardUser: (providerCardUser?: ProviderCardUser) => void;
  setCardDetails: (cardDetails?: CardsForUserResponse) => void;
  setSpendLimitTransactionBaseUnits: (spendLimitTransaction?: number) => void;
  setSpendLimitTimeframeBaseUnits: (spendLimitTimeframe?: number) => void;
  setSpendLimitTimeframeRemainingBaseUnits: (spendLimitTimeframeRemaining?: number) => void;
  setSpendLimitTimeframeLength: (timeframe?: number) => void;
  setSpendLimitRefreshing: (refreshing?: boolean) => void;
  setTxHistory: (txHistory?: ProviderCardHistory[]) => void;
  setDoneLoading: (doneLoading?: boolean) => void;
}

export const useStore = create<State & Action>((set) => ({
  isInitialized: false,
  prices: undefined,
  rates: undefined,
  balances: undefined,
  withdrawLimits: undefined,
  borrowLimits: undefined,
  health: undefined,
  depositLimits: undefined,
  jwtToken: undefined,
  isSigningLoginMessage: false,
  kycLink: undefined,
  quartzCardUser: undefined,
  providerCardUser: undefined,
  cardDetails: undefined,
  spendLimitTransactionBaseUnits: undefined,
  spendLimitTimeframeBaseUnits: undefined,
  spendLimitTimeframeRemainingBaseUnits: undefined,
  spendLimitTimeframeLength: undefined,
  spendLimitRefreshing: false,
  txHistory: undefined,
  doneLoading: undefined,

  setIsInitialized: (isInitialized: boolean) => set({ isInitialized }),
  setPrices: (prices?: Record<MarketIndex, number>) => set({ prices }),
  setRates: (rates?: Record<MarketIndex, Rate>) => set({ rates }),
  setBalances: (balances?: Record<MarketIndex, number>) => set({ balances }),
  setWithdrawLimits: (withdrawLimits?: Record<MarketIndex, number>) => set({ withdrawLimits }),
  setBorrowLimits: (borrowLimits?: Record<MarketIndex, number>) => set({ borrowLimits }),
  setHealth: (health?: number) => set({ health }),
  setDepositLimits: (depositLimits?: Record<MarketIndex, number>) => set({ depositLimits }),
  setJwtToken: (jwtToken?: JwtToken) => set({ jwtToken }),
  setIsSigningLoginMessage: (isSigningLoginMessage: boolean) => set({ isSigningLoginMessage }),
  setKycLink: (kycLink?: string) => set({ kycLink }),
  setQuartzCardUser: (quartzCardUser?: QuartzCardUser) => set({ quartzCardUser }),
  setProviderCardUser: (providerCardUser?: ProviderCardUser) => set({ providerCardUser }),
  setCardDetails: (cardDetails?: CardsForUserResponse) => set({ cardDetails }),
  setSpendLimitTransactionBaseUnits: (spendLimitTransaction?: number) => set({ spendLimitTransactionBaseUnits: spendLimitTransaction }),
  setSpendLimitTimeframeBaseUnits: (spendLimitTimeframe?: number) => set({ spendLimitTimeframeBaseUnits: spendLimitTimeframe }),
  setSpendLimitTimeframeRemainingBaseUnits: (spendLimitTimeframeRemaining?: number) => set({ spendLimitTimeframeRemainingBaseUnits: spendLimitTimeframeRemaining }),
  setSpendLimitTimeframeLength: (timeframe?: number) => set({ spendLimitTimeframeLength: timeframe }),
  setSpendLimitRefreshing: (refreshing?: boolean) => set({ spendLimitRefreshing: refreshing }),
  setTxHistory: (txHistory?: ProviderCardHistory[]) => set({ txHistory }),
  setDoneLoading: (doneLoading?: boolean) => set({ doneLoading }),
}));
