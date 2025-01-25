<script>
  import { activeCell, nonMathCellChanged } from "./stores.ts";

  export let title = "Nova Planilha";

  let spellcheck = false;
</script>

<style>
  h1 {
    font-size: 2rem;
    padding-left: 7px; /*only used for printing, screen padding defined below */
  }

  @media screen {
    h1 {
      padding-left: 73px;
    }

    @media (max-width: 500px) {
      h1 {
        padding-left: 6px;
      }
    }
  }

  h1.document-title {
    font-size: 1.0rem;
    font-weight: 600;
    color: white;
    padding: 8px;
    margin-right: 6px;
    background: linear-gradient(45deg, #080808, transparent);
    border-radius: 36px;
  }

</style>

<h1
  class="document-title"
  on:focus={() => {$activeCell = -1; spellcheck = true}}
  on:blur={() => spellcheck = false}
  contenteditable="true"
  bind:textContent={title}
  on:input={() => $nonMathCellChanged=true}
  {spellcheck}
>
</h1>