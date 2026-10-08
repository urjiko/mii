export const LOCATIONS = [
  { id: 'plaza', name: 'Plaza', shortName: 'Plaza' },
  { id: 'emlak-bankasi', name: 'Emlak Bankası', shortName: 'Anaokulu' },
  { id: 'atakent', name: 'Atakent', shortName: 'İlkokul' },
  { id: 'cakabey', name: 'Çakabey', shortName: 'Ortaokul' },
  { id: 'itk', name: 'İTK', shortName: 'Lise' },
  { id: 'istanbul', name: 'İstanbul', shortName: 'İstanbul' },
  { id: 'is', name: 'İş', shortName: 'İş' },
  { id: 'yurtdisi', name: 'Yurtdışı', shortName: 'Yurtdışı' },
] as const;

export function getLocationName(id: string): string {
  return LOCATIONS.find((location) => location.id === id)?.name ?? 'Plaza';
}
