import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { ArrowLeft } from "lucide-react-native";

import theme from "@/lib/theme";
import Step1 from "@/components/create/steps/Step1";
import Step2 from "@/components/create/steps/Step2";
import Step3 from "@/components/create/steps/Step3";
import Step4 from "@/components/create/steps/Step4";
import Step5 from "@/components/create/steps/Step5";
import type { WizardStepProps } from "@/components/create/steps/types";

const steps = [
  { key: "step-1", title: "Detalles", component: Step1 },
  { key: "step-2", title: "Ubicación", component: Step2 },
  { key: "step-3", title: "Información", component: Step3 },
  { key: "step-4", title: "Multimedia", component: Step4 },
  { key: "step-5", title: "Resumen", component: Step5 },
] as const;

export default function CreateWizardScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const progress = useSharedValue((currentStep + 1) / steps.length);
  const fade = useSharedValue(1);
  const translate = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming((currentStep + 1) / steps.length, { duration: 220 });
    fade.value = 0;
    translate.value = 20;
    fade.value = withTiming(1, { duration: 220 });
    translate.value = withTiming(0, { duration: 220 });
  }, [currentStep, fade, translate, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const stepAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [
      {
        translateX: translate.value,
      },
    ],
  }));

  const StepComponent = useMemo(() => steps[currentStep].component, [currentStep]);

  const goNext = () => {
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goBack = () => {
    if (currentStep === 0) {
      router.back();
      return;
    }
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const stepProps: WizardStepProps = {
    onNext: goNext,
    onBack: goBack,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Crear Parche</Text>
          <Text style={styles.headerSubtitle}>
            Paso {currentStep + 1} de {steps.length} · {steps[currentStep].title}
          </Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Animated.View style={[styles.stepContainer, stepAnimatedStyle]}>
          <StepComponent {...stepProps} />
        </Animated.View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.horizontal,
    paddingTop: theme.spacing.section,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    ...theme.typography.h1,
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: theme.spacing.horizontal,
    marginTop: theme.spacing.md,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  stepContainer: {
    flex: 1,
    marginTop: theme.spacing.section,
  },
});
