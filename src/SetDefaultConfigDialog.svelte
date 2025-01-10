<script lang="ts">
  import { onMount } from "svelte";
  import { del, get, set } from 'idb-keyval';
  import { Button } from "carbon-components-svelte";
  import Checkmark from "carbon-icons-svelte/lib/Checkmark.svelte";
  import Information from "carbon-icons-svelte/lib/Information.svelte";
  import { type Config, configsEqual, getDefaultConfig, normalizeConfig, isDefaultConfig } from "./sheet/Sheet";
  import { config } from "./stores";

  import RequestPersistentStorage from "./RequestPersistentStorage.svelte";

  let userDefaultConfig: Config = getDefaultConfig();

  onMount(async () => {
    try {
      userDefaultConfig = normalizeConfig(await get('defaultConfig'));
    } catch(e) {
      console.warn('Error attempting to load user default config');
      userDefaultConfig = getDefaultConfig();
    }
  });

  async function setDefaultConfig() {
    if (currentConfigIsDefaultConfig) {
      try {
        await del('defaultConfig')
      } catch(e) {
        console.warn('Error attempting to delete user config');
      }
      userDefaultConfig = getDefaultConfig();

      return;
    }
    
    let saveError = false;
    try {
      await set('defaultConfig', $config);
    } catch (e) {
      console.warn('Error attempting to save user default config');
      saveError = true;
    }

    if (saveError) {
      userDefaultConfig = getDefaultConfig();
    } else {
      userDefaultConfig = JSON.parse(JSON.stringify($config));
    }
  }

  function useDefaultConfig() {
    $config = JSON.parse(JSON.stringify(userDefaultConfig));
  }

  $: configsMatch = configsEqual($config, userDefaultConfig);
  $: currentConfigIsDefaultConfig = isDefaultConfig($config);

</script>

<style>
  div.container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
</style>


<div class="container">
<p>
  {#if configsMatch}
    <Checkmark color="green"/> A configuração atual da planilha corresponde à configuração padrão do usuário.
  {:else if !currentConfigIsDefaultConfig}
    <Information color="blue"/> A configuração atual da planilha difere da configuração padrão do usuário, os botões abaixo podem ser usados para salvar a configuração desta planilha como a configuração padrão do usuário ou aplicar a configuração padrão do usuário a esta planilha.
  {:else}
    <Information color="blue"/> A planilha atual está usando a configuração padrão do Boscolab, que é diferente da configuração padrão do usuário. A configuração padrão do usuário pode ser aplicada a esta planilha usando o segundo botão abaixo.
  {/if}
</p>  

<div class="button-container">
  <Button 
    kind="tertiary"
    on:click={setDefaultConfig}
    disabled={configsMatch}
  >
    Usar a Configuração Desta Planilha como Configuração Padrão do Usuário
  </Button>

  <Button
    kind="tertiary"
    on:click={useDefaultConfig}
    disabled={configsMatch}
  >
    Aplicar a Configuração Padrão do Usuário a Esta Planilha
  </Button>
</div>

<div>
  <RequestPersistentStorage />
</div>

</div>
