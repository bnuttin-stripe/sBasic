// React
import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
// Hooks and contexts
import { usePayment } from '../contexts/PaymentContext';
// Data
import { api } from '../data/api';
// Components and pages
import Logger from '../components/Logger';
// Utils
import { colors } from '../utils/styles';

const WASH_TIERS = [
  {
    id: 'theworks',
    rank: 1,
    label: 'The Works',
    amount: 2200,
    color: '#F9A800',
    badge: 'BEST VALUE',
    features: ['Body Was with Ceramic','Tire Gloss','Red Hot Cleanser'],
    // features: ['Body Was with Ceramic','Tire Gloss','Red Hot Cleanser','Rainbow Coat','3-Step Wheel Cleaning','Tommy Guard','Underbody Flush'],
  },
  {
    id: 'ultimate',
    rank: 2,
    label: 'Ultimate',
    amount: 1800,
    color: '#F57C00',
    badge: null,
    features: ['Rainbow Coat','3-Step Wheel Cleaning'],
    // features: ['Rainbow Coat','3-Step Wheel Cleaning','Tommy Guard','Underbody Flush'],
  },
  {
    id: 'super',
    rank: 3,
    label: 'Super',
    amount: 1400,
    color: '#C62828',
    badge: null,
    features: ['Wheel Cleaning', 'Tommy Guard', 'Underbody Flush'],
  },
  {
    id: 'quality',
    rank: 4,
    label: 'Quality',
    amount: 1000,
    color: '#1565C0',
    badge: null,
    features: ['Exterior Wash'],
  },
];

export default function Payment(props) {
  const { pay } = usePayment();
  const [processingTierId, setProcessingTierId] = useState(null);

  const { Log } = Logger('Payment');

  const handleTierPress = async (tier) => {
    if (processingTierId || props.paymentStatus !== 'ready') return;
    setProcessingTierId(tier.id);
    const payload = {
      currency: 'usd',
      amount: tier.amount,
      captureMethod: 'automatic',
      paymentMethodTypes: ['card_present'],
      metadata: { tier: tier.id },
    };
    pay(payload, async (paymentIntent) => {
      Log('Payment done', paymentIntent);
      await api.sendPaymentResult(paymentIntent);
      setProcessingTierId(null);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Your Wash</Text>
      <View style={styles.tierStack}>
        {WASH_TIERS.map((tier) => {
          const isProcessing = processingTierId === tier.id;
          return (
            <Pressable
              key={tier.id}
              style={[styles.tierCard, { borderColor: isProcessing ? tier.color : '#e0e0e0' }]}
              onPress={() => handleTierPress(tier)}
              disabled={!!processingTierId}
            >
              {/* Left color bar with rank number */}
              <View style={[styles.rankBar, { backgroundColor: tier.color }]}>
                <Text style={styles.rankNumber}>#{tier.rank}</Text>
              </View>

              {/* Center: name + features */}
              <View style={styles.tierBody}>
                <View style={styles.tierNameRow}>
                  <Text style={[styles.tierLabel, { color: tier.color }]}>{tier.label}</Text>
                  {tier.badge && (
                    <View style={[styles.badge, { backgroundColor: tier.color }]}>
                      <Text style={styles.badgeText}>{tier.badge}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.featureList}>
                  {tier.features.map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <Text style={[styles.checkmark, { color: tier.color }]}>✓</Text>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Right: price / loading */}
              <View style={[styles.priceBlock, isProcessing && { backgroundColor: tier.color }]}>
                {isProcessing
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.tierPrice}>${(tier.amount / 100).toFixed(0)}</Text>
                }
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.slate,
    marginBottom: 14,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tierStack: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  tierCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  rankBar: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tierBody: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tierLabel: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  featureList: {
    flexDirection: 'column',
    gap: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkmark: {
    fontSize: 11,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 11,
    color: '#444',
    fontWeight: '500',
  },
  priceBlock: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  tierPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.slate,
  },
});
