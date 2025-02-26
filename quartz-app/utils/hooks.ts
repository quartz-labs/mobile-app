import config from "@/config/config";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useRefetchAccountStatus() {
    const queryClient = useQueryClient();

    return useCallback(async (signature?: string) => {
        if (signature) {
            try { 
                await fetch(`${config.API_URL}/program/confirm-tx?signature=${signature}`); 
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch { }
        }

        queryClient.invalidateQueries({ queryKey: ["account-status"], refetchType: "all" });
    }, [queryClient]);
}