import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

import { SafeAreaView } from '@/components/ui/SafeAreaView';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
  keyboard?: boolean;
};

export function Screen({
  children,
  scroll = false,
  className = '',
  contentClassName = '',
  keyboard = true,
}: Props) {
  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerClassName={`flex-grow ${contentClassName}`}
      className="flex-1"
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${contentClassName}`}>{children}</View>
  );

  return (
    <SafeAreaView className={`flex-1 bg-surface ${className}`}>
      {keyboard ? (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}
