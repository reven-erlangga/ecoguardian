<script lang="ts">
  import { onDestroy } from 'svelte';
  import Button from '@components/atoms/button/Button.svelte';
  import XIcon from 'phosphor-svelte/lib/XIcon';
  import type { AlertProps } from './alert.types';
  import { alertVariants, alertTitleClass, alertDescClass, alertProgressBar } from './alert.component';

  let {
    variant = 'default',
    title = '',
    description = '',
    icon,
    duration = 0,
    onDismiss,
    class: className = '',
  }: AlertProps = $props();

  let progress = $state(100);
  let timer: ReturnType<typeof setInterval> | undefined;
  const cx = $derived(alertVariants({ variant }) + ' ' + className);

  function dismiss() {
    onDismiss?.();
  }

  $effect(() => {
    if (duration <= 0) return;
    progress = 100;
    const step = 100;
    timer = setInterval(() => {
      progress = Math.max(0, progress - (step / duration) * 100);
      if (progress <= 0) { clearInterval(timer); dismiss(); }
    }, step);
    return () => clearInterval(timer);
  });

  onDestroy(() => clearInterval(timer));
</script>

<div role="alert" class={cx} data-slot="alert">
  {#if icon}
    {@render icon()}
  {/if}

  {#if title}
    <p class={alertTitleClass} data-slot="alert-title">{title}</p>
  {/if}

  {#if description}
    <div class={alertDescClass} data-slot="alert-description"><p>{description}</p></div>
  {/if}

  <Button size="sm" variant="noShadow" onclick={dismiss} class="absolute top-3 right-3 h-6 bg-secondary-background text-foreground border-border">
    <XIcon size={14} />
  </Button>

  {#if duration > 0}
    <div class={alertProgressBar} style="width: {progress}%"></div>
  {/if}
</div>
