import TransactionHistory from "@/components/Transaction/TransactionHistory";
import { useStore } from "@/utils/store";

export default function TxHistoryPage() {

  const { txHistory } = useStore();

  return (
      <TransactionHistory transactions={txHistory ?? []}/>
  );
}
