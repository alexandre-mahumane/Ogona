import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

import {
  SafeAreaView,
  type SafeAreaEdge,
} from '@/components/ui/SafeAreaView';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
  keyboard?: boolean;
  edges?: SafeAreaEdge[];
};

export function Screen({
  children,
  scroll = false,
  className = '',
  contentClassName = '',
  keyboard = true,
  edges,
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
    <SafeAreaView className={`flex-1 bg-surface ${className}`} edges={edges}>
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
