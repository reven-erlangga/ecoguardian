<script lang="ts">
  import type { EmptyStateProps } from './empty-state.types';
  import { useEmptyState } from './empty-state.components';
  import CubeIcon from 'phosphor-svelte/lib/CubeIcon';
  import BellIcon from 'phosphor-svelte/lib/BellIcon';
  import ChatTextIcon from 'phosphor-svelte/lib/ChatTextIcon';
  import ChartBarIcon from 'phosphor-svelte/lib/ChartBarIcon';
  import FileTextIcon from 'phosphor-svelte/lib/FileTextIcon';
  import UserIcon from 'phosphor-svelte/lib/UserIcon';
  import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
  import type { Component } from 'svelte';

  let { icon: iconName = 'cube', title, description, actionLabel, actionHref }: EmptyStateProps = $props();

  const icons: Record<string, Component<any>> = {
    cube: CubeIcon, bell: BellIcon, chat: ChatTextIcon,
    chart: ChartBarIcon, file: FileTextIcon, user: UserIcon, 'map-pin': MapPinIcon,
  };

  const IconComponent = $derived(icons[iconName] || CubeIcon);
  const { rootClass, iconWrapClass, titleClass, descClass, actionClass } = useEmptyState(null!);
</script>

<div class={rootClass}>
  <div class={iconWrapClass}>
    <IconComponent size={32} weight="duotone" color="#2563EB" />
  </div>
  <h3 class={titleClass}>{title}</h3>
  {#if description}
    <p class={descClass}>{description}</p>
  {/if}
  {#if actionLabel && actionHref}
    <a href={actionHref} class={actionClass}>{actionLabel}</a>
  {/if}
</div>