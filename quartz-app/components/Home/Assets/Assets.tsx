import { useStore } from "@/utils/store";
import AssetCard from "./AssetCard/AssetCard";
import EmptyAssetCard from "./AssetCard/EmptyAssetCard";
import { useEffect, useState } from "react";
import { AssetInfo } from "@/types/interfaces/AssetInfo.interface";
import { calculateBalanceDollarValues, calculateBalances, formatDollarValue, generateAssetInfos } from "@/utils/helpers";
import { FlatList, View, Text, StyleSheet } from "react-native";

export default function Assets({ isLoading }: { isLoading: boolean }) {
    const { prices, balances, rates, isInitialized } = useStore();

    const [suppliedAssets, setSuppliedAssets] = useState<AssetInfo[]>([]);
    const [borrowedAssets, setBorrowedAssets] = useState<AssetInfo[]>([]);
    const [suppliedValue, setSuppliedValue] = useState<string>("0.00");
    const [borrowedValue, setBorrowedValue] = useState<string>("0.00");

    useEffect(() => {
        if (!prices || !balances || !rates || !isInitialized || isLoading) {
            setSuppliedAssets([]);
            setBorrowedAssets([]);
            return;
        };
        
        const assetInfos = generateAssetInfos(prices, balances, rates);
        setSuppliedAssets(assetInfos.suppliedAssets);
        setBorrowedAssets(assetInfos.borrowedAssets);

        const balanceValues = calculateBalanceDollarValues(prices, balances);
        const { collateralBalance, loanBalance } = calculateBalances(balanceValues);
        setSuppliedValue(
            formatDollarValue(collateralBalance, 2).join(".")
        );
        setBorrowedValue(
            formatDollarValue(loanBalance, 2).join(".")
        );
    }, [prices, balances, rates, isInitialized, isLoading]);

    return (
        <View style={styles.assetsWrapper}>
          <Text style={styles.title}>Assets</Text>
    
          <View style={styles.assetsGrid}>
            <View style={styles.listWrapper}>
              <Text style={styles.subtitle}>
                Supplied{isInitialized ? `: $${suppliedValue}` : ""}
              </Text>
              
              {suppliedAssets.length > 0 ? (
                <FlatList
                  data={suppliedAssets}
                  keyExtractor={(item) => item.marketIndex.toString()}
                  renderItem={({ item }) => <AssetCard assetInfo={item} />}
                  style={styles.assetList}
                />
              ) : (
                <EmptyAssetCard category="supplied" />
              )}
            </View>
            
            <View style={styles.listWrapper}>
              <Text style={styles.subtitle}>
                Borrowed{isInitialized ? `: $${borrowedValue}` : ""}
              </Text>
              
              {borrowedAssets.length > 0 ? (
                <FlatList
                  data={borrowedAssets}
                  keyExtractor={(item) => item.marketIndex.toString()}
                  renderItem={({ item }) => <AssetCard assetInfo={item} />}
                  style={styles.assetList}
                />
              ) : (
                <EmptyAssetCard category="borrowed" />
              )}
            </View>
          </View>
        </View>
      );
}

const styles = StyleSheet.create({
    assetsWrapper: {
      padding: 16,
      backgroundColor: '#ffffff', 
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      marginVertical: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      marginBottom: 8,
    },
    assetsGrid: {
      flexDirection: 'column' as const,
    },
    listWrapper: {
      marginBottom: 16,
    },
    assetList: {
      width: '100%' as const,
    }
});