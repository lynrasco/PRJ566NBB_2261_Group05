import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export type AnalysisStep = 'scanning' | 'identifying' | 'searching' | 'comparing' | 'calculating';

interface AnalysisLoadingScreenProps {
  progress: number;
  currentStep?: AnalysisStep;
}

const steps: { id: AnalysisStep; label: string; order: number }[] = [
  { id: 'scanning', label: 'Scanning image', order: 1 },
  { id: 'identifying', label: 'Identifying item', order: 2 },
  { id: 'searching', label: 'Searching marketplaces', order: 3 },
  { id: 'comparing', label: 'Comparing 240+ listings', order: 4 },
  { id: 'calculating', label: 'Calculating fair price', order: 5 },
];

export default function AnalysisLoadingScreen({ progress, currentStep }: AnalysisLoadingScreenProps) {
  const getStepStatus = (stepId: AnalysisStep) => {
    if (!currentStep) return 'pending';
    const currentOrder = steps.find((s) => s.id === currentStep)?.order ?? 0;
    const stepOrder = steps.find((s) => s.id === stepId)?.order ?? 0;

    if (stepOrder < currentOrder) return 'completed';
    if (stepOrder === currentOrder) return 'current';
    return 'pending';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            <ActivityIndicator size="large" color="#024883" />
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        </View>

        {/* Analyzing Text */}
        <ThemedText style={styles.analyzeTitle}>Analyzing your item...</ThemedText>

        {/* Steps List */}
        <View style={styles.stepsList}>
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';

            return (
              <View key={step.id} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepIndicator,
                    isCompleted && styles.stepIndicatorCompleted,
                    isCurrent && styles.stepIndicatorCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : (
                    <Text style={styles.stepNumber}>{step.order}</Text>
                  )}
                </View>
                <ThemedText
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                >
                  {step.label}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001f3f',
  },
  content: {
    width: '100%',
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#4a9d6f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    position: 'absolute',
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  analyzeTitle: {
    marginBottom: 36,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  stepsList: {
    width: '100%',
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a4a5a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5a7a8a',
  },
  stepIndicatorCompleted: {
    backgroundColor: '#4a9d6f',
    borderColor: '#4a9d6f',
  },
  stepIndicatorCurrent: {
    backgroundColor: '#3a7d5f',
    borderColor: '#6abd8f',
  },
  checkmark: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
  stepNumber: {
    fontSize: 14,
    color: '#8abaaa',
    fontWeight: '600',
  },
  stepLabel: {
    flex: 1,
    fontSize: 14,
    color: '#8abaaa',
  },
  stepLabelCompleted: {
    color: '#4a9d6f',
  },
  stepLabelCurrent: {
    color: '#ffffff',
  },
});
