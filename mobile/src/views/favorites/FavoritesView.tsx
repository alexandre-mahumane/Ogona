import { Screen, Text } from '@/components/ui';

export function FavoritesView() {
  return (
    <Screen contentClassName="justify-center gap-3 px-6">
      <Text variant="label-s" className="uppercase tracking-widest text-brand">
        Favoritos
      </Text>
      <Text variant="h3">Os teus sítios</Text>
      <Text variant="p-m">
        Guarda propriedades para voltar mais tarde. Ligação à API a seguir.
      </Text>
    </Screen>
  );
}
