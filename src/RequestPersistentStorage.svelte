<script lang="ts">
  import { onMount } from "svelte";

  import { Button } from "carbon-components-svelte";

  import Error from "carbon-icons-svelte/lib/Error.svelte";
  import Checkmark from "carbon-icons-svelte/lib/Checkmark.svelte";

  export let numCheckpoints: number = undefined;
  let persisted = false;
  let hostName: string;

  onMount(async () => {
    persisted = await navigator.storage.persisted();
    hostName = window.location.host;
  });

  async function requestPersistentStorage() {
    persisted = await navigator.storage.persist();
  }

</script>

<p>
  O Boscolab usa o armazenamento local do seu navegador para armazenar a configuração padrão da planilha, seus {numCheckpoints ?? ""} pontos de verificação de autosave mais recentes e sua lista de planilhas recentemente visitadas. Seu navegador da web não persiste automaticamente este armazenamento local e pode apagá-lo a qualquer momento. O Safari, em particular, é agressivo em liberar esse armazenamento e apagará automaticamente o armazenamento local de um site que não tenha sido visitado nos últimos sete dias.
</p>

<br>

<p>
  Clique no botão abaixo para solicitar que seu navegador habilite o armazenamento local persistente para o domínio {hostName}. Seu navegador pode exibir um diálogo pedindo que você aprove essa solicitação. O Chrome e o Edge podem exigir que você adicione {hostName} aos favoritos para habilitar o armazenamento persistente.
</p>

<br>

<p>
  {#if persisted}
    <Checkmark color="green"/> O armazenamento local persistente está atualmente habilitado.
  {:else}
    <Error color="red"/> O armazenamento local persistente está atualmente desabilitado.
  {/if}
</p>

<br>

<p>
  <Button
    kind="tertiary"
    disabled={persisted}
    on:click={requestPersistentStorage}
  >
    Solicitar Armazenamento Persistente
  </Button>
</p>
