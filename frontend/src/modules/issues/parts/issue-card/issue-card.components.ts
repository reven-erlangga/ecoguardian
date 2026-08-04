import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
import HammerIcon from 'phosphor-svelte/lib/HammerIcon';

export const typeIcons: Record<string, any> = {
  deforestation: LeafIcon,
  waste_management: TrashIcon,
  illegal_mining: HammerIcon,
};

export const typeLabels: Record<string, string> = {
  deforestation: 'Deforestasi',
  water_pollution: 'Pencemaran Air',
  air_pollution: 'Pencemaran Udara',
  illegal_mining: 'Tambang Ilegal',
  wildlife_trafficking: 'Perdagangan Satwa',
  coral_bleaching: 'Pemutihan Karang',
  coastal_erosion: 'Erosi Pesisir',
  waste_management: 'Pengelolaan Sampah',
};

export const labelBadgeColor = (label: string): string => {
  const colors: Record<string, string> = {
    deforestation: 'bg-green-200',
    water_pollution: 'bg-blue-200',
    air_pollution: 'bg-purple-200',
    illegal_mining: 'bg-red-200',
    wildlife_trafficking: 'bg-amber-200',
    coral_bleaching: 'bg-cyan-200',
    coastal_erosion: 'bg-amber-200',
    waste_management: 'bg-indigo-200',
  };
  return colors[label] || 'bg-gray-200';
};
