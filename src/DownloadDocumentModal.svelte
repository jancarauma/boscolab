<script lang="ts">
  import { Modal, RadioButtonGroup, RadioButton, Checkbox } from "carbon-components-svelte";
  import { createEventDispatcher } from "svelte";

  export let open = true;

  const dispatch = createEventDispatcher<{
    downloadDocument: {docType: "docx" | "pdf" | "md" | "tex", getShareableLink: boolean};
    downloadSheet: {saveAs: boolean};
  }>();

  let docType: "blab" | "docx" | "pdf" | "md" | "tex" = "blab";
  let getShareableLink = false;
  let saveAs = false;

  async function handleSave() {
    open = false;
    if (docType === "blab") {
      dispatch("downloadSheet", {saveAs: saveAs});
    } else {
      dispatch("downloadDocument", {docType: docType, getShareableLink: getShareableLink});
    }
  }
</script>

<style>
  div.container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

</style>

<Modal
  passiveModal={false}
  bind:open
  modalHeading="Salvar Arquivo"
  primaryButtonText="Salvar"
  secondaryButtonText="Cancelar"
  on:click:button--secondary={() => (open = false)}
  on:open
  on:close
  on:submit={handleSave}
  hasScrollingContent={false}
  preventCloseOnClickOutside={false}
>
  <div class="container">
    <RadioButtonGroup
      orientation="vertical"
      legendText="Formato do documento"
      name="document-type"
      required={true}
      bind:selected={docType}
    >
      <RadioButton labelText="Arquivo de Planilha Nativa do Boscolab (.blab)" value="blab" />
      <RadioButton labelText="Arquivo Markdown" value="md" />
      <RadioButton labelText="Arquivo Microsoft Word (Em Breve)" value="docx" />
      <RadioButton labelText="Arquivo PDF (Em Breve)" value="pdf" />
      <RadioButton labelText="Arquivo LaTeX (Em Breve)" value="tex" />    
    </RadioButtonGroup>
    {#if window.showSaveFilePicker}
      <div>
        <div class="bx--label">Save As</div>
        <Checkbox 
          labelText="Solicitação para alterar o nome do arquivo"
          bind:checked={saveAs}
          disabled={docType !== "blab"}
        />
      </div>
    {/if}
    <div>
      <div class="bx--label">Link Compartilhável</div>
      <Checkbox 
        labelText="Criar um link compartilhável e adicioná-lo ao documento gerado (aplica-se apenas aos arquivos md, docx, pdf e tex; qualquer pessoa com este link privado poderá visualizar sua planilha original)"
        bind:checked={getShareableLink}
        disabled={docType === "blab"}
      />
    </div>
  </div>
</Modal>