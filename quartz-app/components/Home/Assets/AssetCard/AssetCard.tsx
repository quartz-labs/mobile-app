import { Image } from 'expo-image';
import type { AssetInfo } from "@/types/interfaces/AssetInfo.interface";
import { formatDollarValue, formatTokenDisplay, getTokenIcon } from "@/utils/helpers";
import { TOKENS } from "@quartz-labs/sdk";
import { View, Text, StyleSheet } from 'react-native';

export interface AssetCardProps {
    assetInfo: AssetInfo;
}

export default function AssetCard({ assetInfo }: AssetCardProps) {
    const value = Math.abs(assetInfo.balance * assetInfo.price);
    const valueDisplay = (value < 0.01)
        ? ["0", "01"]
        : formatDollarValue(value, 2);
    const balance = Math.abs(assetInfo.balance);
    const rateDisplay = (assetInfo.rate * 100).toFixed(2);

    // const [ windowWidth, setWindowWidth ] = useState(window.innerWidth);
    // useEffect(() => {
    //     const handleResize = () => setWindowWidth(window.innerWidth);
    //     window.addEventListener('resize', handleResize);

    //     return () => window.removeEventListener('resize', handleResize);
    // }, []);

    // if (windowWidth < 1024 && windowWidth > 800) {
    //     return (
    //         <li className={`${styles.assetCard} glass`}>
    //             <Image 
    //                     src={getTokenIcon(assetInfo.marketIndex)} 
    //                     alt={TOKENS[assetInfo.marketIndex].name} 
    //                     width={36} 
    //                     height={36} 
    //             />

    //             <div className={styles.mobileContent}>
    //                 <div className={styles.tokenInfo}>

    //                     <p>{formatTokenDisplay(balance)}</p>
    //                     <p className={"light-text"}>{TOKENS[assetInfo.marketIndex].name}</p>
    //                 </div>

    //                 <div className={styles.details}>
    //                     <p className={styles.value}>
    //                         {value < 0.01 && "<"}
    //                         ${valueDisplay[0]}<span className={styles.valueDecimal}>.{valueDisplay[1]}</span>
    //                     </p>
    //                     <p className={styles.valueDecimal}>({rateDisplay}% {assetInfo.balance > 0 ? "APY" : "APR"})</p>
    //                 </div>
    //             </div>
    //         </li>
    //     );
    // }

    return (
        <View style={styles.assetCard}>
            <View style={styles.tokenInfo}>
                <Image
                    source={getTokenIcon(assetInfo.marketIndex)}
                    style={styles.tokenIcon}
                    contentFit="contain"
                />
                <Text style={styles.balanceText}>{formatTokenDisplay(balance)}</Text>
                <Text style={styles.tokenName}>{TOKENS[assetInfo.marketIndex].name}</Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.value}>
                    {value < 0.01 && "<"}
                    ${valueDisplay[0]}
                    <Text style={styles.valueDecimal}>.{valueDisplay[1]}</Text>
                </Text>
                <Text style={styles.rateText}>
                    ({rateDisplay}% {assetInfo.balance > 0 ? "APY" : "APR"})
                </Text>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    assetCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tokenInfo: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    tokenIcon: {
        width: 36,
        height: 36,
        marginBottom: 8,
    },
    balanceText: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    tokenName: {
        fontSize: 14,
        color: '#666',
    },
    details: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    valueDecimal: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    rateText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    }
});