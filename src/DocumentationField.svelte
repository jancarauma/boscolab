<script lang="ts">
  import 'katex/dist/katex.min.css';  
  import katex from 'katex';  
  import Quill from 'quill';  
  import { onMount, createEventDispatcher } from "svelte";
  import { modifierKey } from "./stores";

  export let hideToolbar = true;
  export let quill;

  export function setContents(newContents) {
    quill.setContents(newContents);
  }

  let editorDiv;

  const dispatch = createEventDispatcher<{
    update: { json: any };
    shiftEnter: null;
    modifierEnter: null;
  }>();

  onMount(() => {
    // Registra o módulo de fórmula manualmente
    // Quill.register('formats/formula', Quill.import('formats/formula'));

    const bindings = {
      tab: {
        key: 9, // desabilitar a tecla Tab para que ela seja usada para foco
        handler: function () {
          return true;
        },
      },
      custom1: {
        key: 13, // para shift-enter, não faz nada e reenvia o evento
        shiftKey: true,
        handler: function () {
          dispatch('shiftEnter');
          return false;
        },
      },
      custom2: {
        key: 13, // para meta-enter, não faz nada e reenvia o evento
        [$modifierKey]: true,
        handler: function () {
          dispatch('modifierEnter');
          return false;
        },
      },
    };

    // Configuração do Quill com o módulo de fórmula
    quill = new Quill(editorDiv, {
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, false] }],          // Cabeçalhos ou parágrafo
          [{ font: [] }],                                // Fontes
          [{ size: ['small', false, 'large', 'huge'] }], // Tamanho

          ['bold', 'italic', 'underline', 'strike'],     // Estilos
          [{ 'color': [] }, { 'background': [] }],       // Cores

          [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }], // Listas          
          [{ align: [] }],                               // Alinhar
          [{ 'indent': '-1'}, { 'indent': '+1' }],       // Indentações


          ['blockquote', 'code-block'],                  // Anotação
          ['link', 'image', 'video'],                    // Inserir URL, imagem ou vídeo
          ['code-block'],                                // Inserir código          

          ['formula'],                                   // Inserir fórmula
          [{ 'script': 'sub'}, { 'script': 'super' }],   // Inserir sub-escrito ou sobre-escrito          
          
          ['clean'],                                     // Limpar formatação
        ],
        keyboard: {
          bindings: bindings,
        },
      },
      theme: 'snow', // ou 'bubble'
    });

    // Usando KaTeX para renderizar fórmulas
    const Formula = Quill.import('formats/formula');
    Formula.sanitize = (value) => {
      try {
        return katex.renderToString(value, { throwOnError: false });
      } catch (e) {
        console.error('Erro ao renderizar fórmula KaTeX:', e);
        return '';
      }
    };

    quill.on('text-change', (delta, oldDelta, source) => {
      dispatch('update', {
        json: quill.getContents(),
      });
    });
  });
</script>

<style>
  /* Estilos personalizados para o editor Quill */
  div.wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  div.editor {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    height: fit-content;
  }

  @media print {
    div.editor {
      display: block;
    }

    div.wrap {
      display: block;
      height: fit-content;
    }
  }

  :global(div.wrap div.ql-toolbar) {
    transition: 0.3s;
    transition-delay: .1s;
    overflow: visible;
    opacity: 1;
  }

  div.hideToolbar :global(.ql-toolbar) {
    max-height: 0px;
    padding-top: 0px;
    padding-bottom: 0px;
    overflow: clip;
    opacity: 0;
  }

  @media screen {
    .hideToolbar :global(.ql-toolbar.ql-snow + .ql-container) {
      border-top-width: 1px;
      border-top-style: dashed;
      border-top-color: gray;
      border-radius: 2px;
    }
  }

  :global(.ql-toolbar.ql-snow + .ql-container) {
    border: 1px dashed gray;
    border-radius: 0px 0px 2px 2px;
  }

  :global(.ql-toolbar.ql-snow) {
    border: 1px dashed gray !important;
    border-radius: 2px 2px 0px 0px;
  }

  :global(div.wrap .ql-container:focus-within) {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }

  :global(div.wrap .ql-snow .ql-tooltip) {
    /* Garantir que o tooltip do URL esteja acima de outros elementos */
    z-index: 100;
  }

  :global(div.wrap .ql-snow .ql-editor) {
    padding: 2px;
    font-size: 16px;
    overflow-y: visible;
    height: fit-content;
  }

  :global(div.wrap .ql-snow .ql-editor h1) {
    font-size: 1.625em;
  }

  :global(div.wrap .ql-snow .ql-editor h2) {
    font-size: 1.4375em;
  }

  :global(div.wrap .ql-snow .ql-editor h3) {
    font-size: 1.25em;
  }

  :global(div.wrap .ql-snow .ql-editor p) {
    font-size: 1em;
  }

  @media print {
    :global(div.wrap .ql-toolbar) {
      display: none;
    }

    :global(div.wrap .ql-container.ql-snow) {
      border: none;
    }
  }

</style>

<div class="wrap" class:hideToolbar>
  <div class="editor" bind:this={editorDiv} />
</div>
