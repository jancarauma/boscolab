<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { TreeView } from "carbon-components-svelte";
  import { FileUploaderDropContainer } from "carbon-components-svelte";
  import { Tabs, Tab, TabContent } from "carbon-components-svelte";

  export let url = "";
  export let recentSheets = new Map();
  export let prebuiltTables = [];

  let selectedTab = 0;
  let formUrl = "";

  let treeElements = [];
  let urlMap = new Map();

  const dispatch = createEventDispatcher<{fileSelected: {file: File}}>();

  function handleFileChange(e: CustomEvent<File[]>) {
    dispatch("fileSelected", { file: e.detail[0] });
  }

  function updateTree() {
    let currentIndex = 0;
    treeElements = [];
    urlMap = new Map();

    if (prebuiltTables.length > 0) {
      const children = [];

      for (const item of prebuiltTables) {
        children.push({
          id: currentIndex,
          text: item.title
        });
        urlMap.set(currentIndex++, item.url);
      }

      treeElements.push({
        id: currentIndex++,
        text: "Tabelas Diversas",
        children: children
      });
    }

    if (recentSheets.size > 0) {
      const children = [];

      for (const [key, value] of recentSheets) {
        children.push({
          id: currentIndex,
          text: value.title
        });
        urlMap.set(currentIndex++, value.url);
      }

      treeElements.push({
        id: currentIndex++,
        text: "Arquivos Recentes",
        children: children
      });
    }
  }


  function handleSelect(e) {
    if (urlMap.has(e.detail.id)) {
      formUrl = urlMap.get(e.detail.id);
    }
  }

  $: if (recentSheets.size > 0 || prebuiltTables.length > 0) {
    updateTree();
  }

  $: url = selectedTab === 0 ? formUrl : "";
</script>

<style>
  input {
    width: 40em;
  }
</style>

<Tabs bind:selected={selectedTab}>
  <Tab label="A partir da URL" />
  <Tab label="A partir de um arquivo" />
  <svelte:fragment slot="content">
    <TabContent>
      <div>
        <label for="url">Endereço URL da Planilha:</label>
        <input bind:value={formUrl} type="url" name="url">
      </div>

      <div>
        <TreeView
          labelText="Links Úteis"
          children={treeElements}
          on:select={handleSelect}
        />
      </div>
    </TabContent>
    <TabContent>
      <FileUploaderDropContainer
        labelText="Arraste e solte arquivos .blab aqui ou clique para selecionar"
        accept={[".blab"]}
        on:change={handleFileChange}
      />
    </TabContent>
  </svelte:fragment>
</Tabs>






