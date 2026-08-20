import { cssInterop } from 'nativewind';
import { type ReactNode } from 'react';
import { Platform, ScrollView, type ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

cssInterop(KeyboardAwareScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

type Props = ScrollViewProps & {
  children: ReactNode;
  extraHeight?: number;
};

export function KeyboardScrollView({
  children,
  extraHeight = 88,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  ...props
}: Props) {
  if (Platform.OS === 'web') {
    return (
      <ScrollView
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      extraHeight={extraHeight}
      extraScrollHeight={32}
      keyboardOpeningTime={0}
      enableAutomaticScroll
      enableResetScrollToCoords={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...props}
      style={[{ flex: 1 }, props.style]}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
