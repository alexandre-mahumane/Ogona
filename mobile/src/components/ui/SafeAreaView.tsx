import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left';

export type AppSafeAreaViewProps = ViewProps & {
  edges?: SafeAreaEdge[];
  children?: ReactNode;
  className?: string;
};

const DEFAULT_EDGES: SafeAreaEdge[] = ['top', 'bottom', 'left', 'right'];

export function SafeAreaView({
  style,
  edges = DEFAULT_EDGES,
  className,
  ...props
}: AppSafeAreaViewProps) {
  const insets = useSafeAreaInsets();
  const edgeArray = Array.isArray(edges) ? edges : DEFAULT_EDGES;

  return (
    <View
      className={className}
      style={[
        {
          paddingTop: edgeArray.includes('top') ? insets.top : 0,
          paddingBottom: edgeArray.includes('bottom') ? insets.bottom : 0,
          paddingLeft: edgeArray.includes('left') ? insets.left : 0,
          paddingRight: edgeArray.includes('right') ? insets.right : 0,
        },
        style,
      ]}
      {...props}
    />
  );
}
