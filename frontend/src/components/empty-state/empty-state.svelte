<script lang="ts">
  import type { EmptyStateProps } from './empty-state.types';
  import CubeIcon from 'phosphor-svelte/lib/CubeIcon';
  import BellIcon from 'phosphor-svelte/lib/BellIcon';
  import ChatTextIcon from 'phosphor-svelte/lib/ChatTextIcon';
  import ChartBarIcon from 'phosphor-svelte/lib/ChartBarIcon';
  import FileTextIcon from 'phosphor-svelte/lib/FileTextIcon';
  import UserIcon from 'phosphor-svelte/lib/UserIcon';
  import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';

  let { icon: iconName = 'CubeIcon', title, description, actionLabel, actionHref }: EmptyStateProps = $props();

  const icons: Record<string, any> = {
    CubeIcon, BellIcon, ChatTextIcon, ChartBarIcon, FileTextIcon, UserIcon, MapPinIcon,
    // Alias Lucide-style names
    Cube: CubeIcon, Box: CubeIcon, Bell: BellIcon, MessageSquareText: ChatTextIcon,
    ChartBar: ChartBarIcon, FileText: FileTextIcon, User: UserIcon, MapPin: MapPinIcon,
    SearchX: FileTextIcon, TriangleAlert: BellIcon,
  };

  const IconComponent = icons[iconName] || CubeIcon;
</script>

<div class="flex flex-col items-center justify-center py-16 px-4 text-center">
  <div class="mb-6">
    <div class="w-24 h-24 rounded-full bg-gray-100 neo-border flex items-center justify-center mx-auto">
      <IconComponent size={48} weight="duotone" color="#2563EB" />
    </div>
  </div>
  <h3 class="text-xl font-bold mb-2">{title}</h3>
  {#if description}
    <p class="text-gray-500 mb-6 max-w-md">{description}</p>
  {/if}
  {#if actionLabel && actionHref}
    <a href={actionHref} class="neo-border neo-shadow bg-blue-600 text-white px-6 py-3 font-bold inline-block hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
      {actionLabel}
    </a>
  {/if}
</div>
