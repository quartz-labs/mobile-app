import type { QuartzCardUser } from "@/types/interfaces/QuartzCardUser.interface";
import type { PublicKey } from "@solana/web3.js";
import { useStore } from "../store";
import { createQuery } from "./createQuery";
import config from "@/config/config";
import type { CardsForUserResponse } from "@/types/interfaces/CardsForUserResponse.interface";
import type { ProviderCardUser } from "@/types/interfaces/ProviderCardUser.interface";
import type { ProviderCardHistory } from "@/types/interfaces/ProviderCardHistory.interface";

export const useQuartzCardUserQuery = (publicKey: PublicKey | null) => {
    const { setQuartzCardUser } = useStore();

    const query = createQuery<QuartzCardUser>({
        queryKey: ["card-user", "quartz-card-user"],
        url: `${config.INTERNAL_API_URL}/auth/user-info`,
        params: publicKey ? {
            publicKey: publicKey.toBase58()
        } : undefined,
        errorMessage: "Could not fetch Quartz Card User",
        enabled: publicKey != null,
        staleTime: Infinity,
        accept404: true,
        onSuccess: (data) => setQuartzCardUser(data)
    });
    return query();
};

export const useProviderCardUserQuery = (cardUserId: string | null, refetch: boolean) => {
    const { setProviderCardUser } = useStore();

    const query = createQuery<ProviderCardUser>({
        queryKey: ["card-user", "provider-card-user", "user"],
        url: `${config.INTERNAL_API_URL}/card/user`,
        params: cardUserId ? {
            id: cardUserId
        } : undefined,
        errorMessage: "Could not fetch Provider Card User",
        enabled: cardUserId != null,
        staleTime: refetch ? 5_000 : Infinity,
        refetchInterval: refetch ? 5_000 : undefined,
        onSuccess: (data) => setProviderCardUser(data)
    });
    return query();
};

export const useApplicationStatusQuery = (cardUserId: string | null, refetch: boolean) => {
    const query = createQuery<any>({
        queryKey: ["card-user", "provider-card-user", "user"],
        url: `${config.INTERNAL_API_URL}/application/status`,
        params: cardUserId ? {
            id: cardUserId
        } : undefined,
        errorMessage: "Could not fetch Provider Card User",
        enabled: cardUserId != null,
        staleTime: refetch ? 3_000 : Infinity,
        refetchInterval: refetch ? 3_000 : undefined,
    });
    return query();
};

export const useCardDetailsQuery = (cardUserId: string | null, enabled: boolean) => {
    const { setCardDetails } = useStore();

    const query = createQuery<CardsForUserResponse>({
        queryKey: ["card-user", "provider-card-user", "card"],
        url: `${config.INTERNAL_API_URL}/card/issuing/user`,
        params: cardUserId ? {
            id: cardUserId
        } : undefined,
        errorMessage: "Could not fetch card details",
        enabled: cardUserId != null && enabled,
        staleTime: Infinity,
        onSuccess: (data) => setCardDetails(data)
    });
    return query();
};

export const useTxHistoryQuery = (cardUserId: string | null, enabled: boolean) => {
    const { setTxHistory } = useStore();

    const query = createQuery<ProviderCardHistory[]>({
        queryKey: ["user", "txHistory"],
        url: `${config.INTERNAL_API_URL}/card/transaction/user`,
        params: cardUserId ? { 
            userId: cardUserId,
        } : undefined,
        errorMessage: "Could not fetch tx history",
        refetchInterval: 180_000,
        enabled: cardUserId != null && enabled,
        onSuccess: (data) => setTxHistory(data)
    });
    return query();
};