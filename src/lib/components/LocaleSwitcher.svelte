<script>
  import { locale, locales } from 'svelte-i18n';
  const available = ['en', 'si'];
  $: current = $locale;
  function change(e) {
    locale.set(e.target.value);
  }
</script>

<select bind:value={current} on:change={change} class="border rounded p-1 text-sm">
  {#each available as code}
    <option value={code}>{code.toUpperCase()}</option>
  {/each}
</select>
