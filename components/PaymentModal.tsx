import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { X, Check, ChevronRight, Phone } from 'lucide-react-native';

type PaymentMethod = 'wave' | 'orange_money' | 'mtn_money';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  shopName: string;
  amount?: number;
  acceptsWave?: boolean;
  acceptsOrangeMoney?: boolean;
  acceptsMtnMoney?: boolean;
}

const PAYMENT_METHODS = [
  {
    id: 'wave' as PaymentMethod,
    name: 'Wave',
    color: Colors.payment.wave,
    emoji: '🌊',
    placeholder: '07 XX XX XX XX',
    acceptsKey: 'acceptsWave',
  },
  {
    id: 'orange_money' as PaymentMethod,
    name: 'Orange Money',
    color: Colors.payment.orangeMoney,
    emoji: '🟠',
    placeholder: '07 XX XX XX XX',
    acceptsKey: 'acceptsOrangeMoney',
  },
  {
    id: 'mtn_money' as PaymentMethod,
    name: 'MTN Money',
    color: Colors.payment.mtnMoney,
    emoji: '💛',
    placeholder: '05 XX XX XX XX',
    acceptsKey: 'acceptsMtnMoney',
  },
];

type Step = 'select' | 'enter' | 'confirm' | 'success';

export function PaymentModal({
  visible,
  onClose,
  shopName,
  amount,
  acceptsWave = true,
  acceptsOrangeMoney = true,
  acceptsMtnMoney = true,
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableMethods = PAYMENT_METHODS.filter((m) => {
    if (m.id === 'wave') return acceptsWave;
    if (m.id === 'orange_money') return acceptsOrangeMoney;
    if (m.id === 'mtn_money') return acceptsMtnMoney;
    return false;
  });

  const selectedMethodInfo = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

  const handleClose = () => {
    setStep('select');
    setSelectedMethod(null);
    setPhone('');
    setError('');
    onClose();
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('enter');
  };

  const handleConfirm = () => {
    if (!phone.replace(/\s/g, '').match(/^\d{10}$/)) {
      setError('Veuillez entrer un numéro valide (10 chiffres)');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handlePay = async () => {
    setLoading(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    setStep('success');
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {(['select', 'enter', 'confirm'] as Step[]).map((s, i) => (
        <React.Fragment key={s}>
          <View
            style={[
              styles.stepDot,
              (step === s ||
                (step === 'success' && true) ||
                ['select', 'enter', 'confirm'].indexOf(step) > i) &&
                styles.stepDotActive,
            ]}
          />
          {i < 2 && <View style={styles.stepLine} />}
        </React.Fragment>
      ))}
    </View>
  );

  const renderSelectStep = () => (
    <View>
      <Text style={styles.stepTitle}>Choisir un mode de paiement</Text>
      <Text style={styles.stepSubtitle}>Payer via mobile money</Text>
      {availableMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[styles.methodCard, { borderLeftColor: method.color }]}
          onPress={() => handleSelectMethod(method.id)}>
          <Text style={styles.methodEmoji}>{method.emoji}</Text>
          <Text style={[styles.methodName, { color: method.color }]}>{method.name}</Text>
          <ChevronRight size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEnterStep = () => (
    <View>
      <Text style={styles.stepTitle}>Entrer votre numéro</Text>
      <Text style={styles.stepSubtitle}>
        {selectedMethodInfo?.emoji} {selectedMethodInfo?.name}
      </Text>
      <View style={styles.inputContainer}>
        <Phone size={20} color={Colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(t) => {
            setPhone(t);
            setError('');
          }}
          placeholder={selectedMethodInfo?.placeholder}
          keyboardType="phone-pad"
          maxLength={14}
          placeholderTextColor={Colors.text.light}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {amount && (
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Montant</Text>
          <Text style={styles.amountValue}>{amount.toLocaleString('fr-CI')} FCFA</Text>
        </View>
      )}
      <TouchableOpacity style={styles.primaryButton} onPress={handleConfirm}>
        <Text style={styles.primaryButtonText}>Continuer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('select')}>
        <Text style={styles.secondaryButtonText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConfirmStep = () => (
    <View>
      <Text style={styles.stepTitle}>Confirmer le paiement</Text>
      <View style={styles.confirmCard}>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Boutique</Text>
          <Text style={styles.confirmValue}>{shopName}</Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Mode</Text>
          <Text style={[styles.confirmValue, { color: selectedMethodInfo?.color }]}>
            {selectedMethodInfo?.emoji} {selectedMethodInfo?.name}
          </Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Numéro</Text>
          <Text style={styles.confirmValue}>{phone}</Text>
        </View>
        {amount && (
          <View style={[styles.confirmRow, styles.confirmRowTotal]}>
            <Text style={styles.confirmLabelTotal}>Total</Text>
            <Text style={styles.confirmValueTotal}>{amount.toLocaleString('fr-CI')} FCFA</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handlePay}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Payer maintenant</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('enter')}>
        <Text style={styles.secondaryButtonText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Check size={48} color={Colors.white} />
      </View>
      <Text style={styles.successTitle}>Paiement initié !</Text>
      <Text style={styles.successSubtitle}>
        Vous allez recevoir une demande de confirmation sur votre téléphone via{' '}
        {selectedMethodInfo?.name}.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
        <Text style={styles.primaryButtonText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {step !== 'success' && (
            <View style={styles.sheetHeader}>
              {renderStepIndicator()}
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={22} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          )}

          {step === 'select' && renderSelectStep()}
          {step === 'enter' && renderEnterStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'success' && renderSuccessStep()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    ...Shadows.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border.light,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepLine: {
    width: 20,
    height: 2,
    backgroundColor: Colors.border.light,
    marginHorizontal: 4,
  },
  stepTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    gap: Spacing.md,
  },
  methodEmoji: {
    fontSize: 24,
  },
  methodName: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  inputIcon: {},
  input: {
    flex: 1,
    height: 52,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  amountLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  amountValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  confirmCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmRowTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  confirmLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  confirmValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  confirmLabelTotal: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  confirmValueTotal: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.text.secondary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  successSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
});
