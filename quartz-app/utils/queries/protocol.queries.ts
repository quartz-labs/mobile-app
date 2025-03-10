import { MarketIndex } from "@quartz-labs/sdk";
import { createQuery } from "./createQuery";
import { AccountStatus } from "@/types/enums/AccountStatus.enum";
import type { PublicKey } from "@solana/web3.js";
import { useStore } from "../store";
import config from "@/config/config";
import type { Rate } from "@/types/interfaces/Rate.interface";
import { DEFAULT_REFETCH_INTERVAL } from "@/config/constants";

export const useAccountStatusQuery = (address: PublicKey | null) => {
    const query = createQuery<AccountStatus>({
        queryKey: ["account-status", address?.toBase58() ?? ""],
        url: `${config.API_URL}/program/account-status`,
        params: address ? {
            wallet: address.toBase58()
        } : undefined,
        transformResponse: (data: any) => {
            if (typeof data.status !== 'string' || !Object.values(AccountStatus).includes(data.status as AccountStatus)) {
                throw new Error('Invalid account status received from API');
            }
            return data.status as unknown as AccountStatus;
        },
        errorMessage: "Could not fetch account status",
        enabled: address != null,
        staleTime: Infinity,
    });
    return query();
};

export const usePricesQuery = () => {
    const { setPrices } = useStore();

    const query = createQuery<Record<MarketIndex, number>>({
        queryKey: ["prices"],
        url: `${config.API_URL}/data/price`,
        refetchInterval: DEFAULT_REFETCH_INTERVAL,
        errorMessage: "Could not fetch prices",
        onSuccess: (data) => setPrices(data)
    })
    return query();
};

export const useRatesQuery = () => {
    const { setRates } = useStore();

    const query = createQuery<Record<MarketIndex, Rate>>({
        queryKey: ["rates"],
        url: `${config.API_URL}/user/rate`,
        params: { 
            marketIndices: MarketIndex.join(',') 
        },
        refetchInterval: DEFAULT_REFETCH_INTERVAL,
        errorMessage: "Could not fetch rates",
        onSuccess: (data) => setRates(data)
    })
    return query();
};

export const useBalancesQuery = (address: PublicKey | null) => {
    const { setBalances } = useStore();

    const query = createQuery<Record<MarketIndex, number>>({
        queryKey: ["user", "balances", address?.toBase58() ?? ""],
        url: `${config.API_URL}/user/balance`,
        params: address ? { 
            address: address.toBase58(),
            marketIndices: MarketIndex.join(',')
        } : undefined,
        errorMessage: "Could not fetch balances",
        refetchInterval: DEFAULT_REFETCH_INTERVAL,
        enabled: address != null,
        onSuccess: (data) => setBalances(data)
    });
    return query();
};

export const useWithdrawLimitsQuery = (address: PublicKey | null) => {
    const { setWithdrawLimits } = useStore();

    const query = createQuery<Record<MarketIndex, number>>({
        queryKey: ["user", "withdraw-limits", address?.toBase58() ?? ""],
        url: `${config.API_URL}/user/withdraw-limit`,
        params: address ? { 
            address: address.toBase58(),
            marketIndices: MarketIndex.join(',')
        } : undefined,
        errorMessage: "Could not fetch withdraw limits",
        refetchInterval: DEFAULT_REFETCH_INTERVAL,
        enabled: address != null,
        onSuccess: (data) => setWithdrawLimits(data)
    });
    return query();
};

export const useBorrowLimitsQuery = (address: PublicKey | null) => {
    const { setBorrowLimits } = useStore();

    const query = createQuery<Record<MarketIndex, number>>({
        queryKey: ["user", "borrow-limits", address?.toBase58() ?? ""],
        url: `${config.API_URL}/user/borrow-limit`,
        params: address ? { 
            address: address.toBase58(),
            marketIndices: MarketIndex.join(',')
        } : undefined,
        errorMessage: "Could not fetch borrow limits",
        refetchInterval: DEFAULT_REFETCH_INTERVAL,
        enabled: address != null,
        onSuccess: (data) => setBorrowLimits(data)
    });
    return query();
};
export const useDepositLimitsQuery = (address: PublicKey | null) => {
    const { setDepositLimits } = useStore();

    const query = createQuery<Record<MarketIndex, number>>({
        queryKey: ["user", "deposit-limits", address?.toBase58() ?? ""],
        url: "/api/deposit-limit",
        params: address ? { 
            address: address.toBase58()
        } : undefined,
        enabled: address != null,
        errorMessage: "Could not fetch deposit limits",
        onSuccess: (data) => setDepositLimits(data)
    });
    return query();
};

export const useSpendLimitQuery = (address: PublicKey | null) => {
    const { 
        setSpendLimitTransactionBaseUnits, 
        setSpendLimitTimeframeBaseUnits, 
        setSpendLimitTimeframeRemainingBaseUnits, 
        setSpendLimitTimeframeLength
    } = useStore();

    const query = createQuery<{
        spendLimitTransactionBaseUnits: number;
        spendLimitTimeframeBaseUnits: number;
        spendLimitTimeframeRemainingBaseUnits: number;
        timeframe: number;
    }>({
        queryKey: ["user", "spend-limits", address?.toBase58() ?? ""],
        url: "/api/get-spend-limits",
        params: address ? { 
            address: address.toBase58(),
        } : undefined,
        enabled: address != null,
        errorMessage: "Could not fetch spend limits",
        onSuccess: (data) => {
            setSpendLimitTransactionBaseUnits(data.spendLimitTransactionBaseUnits);
            setSpendLimitTimeframeBaseUnits(data.spendLimitTimeframeBaseUnits);
            setSpendLimitTimeframeRemainingBaseUnits(data.spendLimitTimeframeRemainingBaseUnits);
            setSpendLimitTimeframeLength(data.timeframe);
        }
    });

    return query();
};

export const useHealthQuery = (address: PublicKey | null) => {
    const { setHealth } = useStore();

    const query = createQuery<number>({
        queryKey: ["user", "health", address?.toBase58() ?? ""],
        url: `${config.API_URL}/user/health`,
        params: address ? { 
            address: address.toBase58()
        } : undefined,
        errorMessage: "Could not fetch health",
        refetchInterval: DEFAULT_REFETCH_INTERVAL,
        enabled: address != null,
        onSuccess: (data) => setHealth(data)
    });
    return query();
};