<script>
  import { modifierKey } from "./stores";

  const modifier = $modifierKey === "ctrlKey" ? "Ctrl" : "Cmd"
</script>

<style>
  table {
    border-collapse: collapse;
    margin: 1rem 0;
  }
  table,
  th,
  td {
    border: 1px solid darkgray;
  }

  td.first-column {
    white-space: nowrap;
  }

  th,
  td {
    padding: 5px;
    text-align: left;
    vertical-align: middle;
  }
  th {
    font-weight: bold;
  }

  span.key {
    padding: 1px 6px;
    background-color: #b3b3b3;
    color: white;
    border-radius: 2px;
  }

</style>

<table>
  <tbody>
    <tr>
      <th class="first-column">Combinação de Teclas</th>
      <th>Ação</th>
    </tr>
    <tr>
      <td class="first-column"><span class="key">*</span></td>
      <td>Multiplicar</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">/</span></td>
      <td>Dividir</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">E</span></td>
      <td>Inserir *10^ para notação científica</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">&lt;</span> + <span class="key">=</span></td>
      <td>Inserir símbolo menor ou igual a (&le;)</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">&gt;</span> + <span class="key">=</span></td>
      <td>Inserir símbolo maior ou igual a (&ge;)</td>
    </tr>
    <tr>
      <td class="first-column"><span>Digite sqrt</span></td>
      <td>Inserir raiz quadrada</td>
    </tr>
    <tr>
      <td class="first-column"><span>Digite pi, e ou i</span></td>
      <td>Inserir as variáveis reservadas <em>π</em>, número de Euler <em>e</em> ou unidade imaginária <em>i</em></td>
    </tr>
    <tr>
      <td><span>Digite o nome de uma letra grega minúscula</span></td>
      <td>Insere um caractere grego minúsculo (atualiza após sair do campo matemático atual), reconhece alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota, kappa, lambda, mu, nu, xi, rho, sigma, tau, phi, chi, psi e omega</td>
    </tr>
    <tr>
      <td><span>Digite o nome de um caractere grego maiúsculo</span></td>
      <td>Insere um caractere grego maiúsculo (atualiza após sair do campo matemático atual), reconhece Gamma, Delta, Theta, Lambda, Xi, Pi, Sigma, Upsilon, Phi, Psi e Omega</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">Tab</span></td>
      <td>Navegar para o próximo local na equação, se disponível, caso contrário, navegar para o próximo elemento focável na página</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">^</span></td>
      <td>Adicionar expoente</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">_</span></td>
      <td>Adicionar subscrito</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">@</span> ou <span class="key">{modifier}</span> + <span class="key">*</span></td>
      <td>Multiplicação de matriz ou produto vetorial no caso especial em que ambas as matrizes são 3x1 ou 1x3</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">'</span></td>
      <td>Transposta de matriz</td>
    </tr>
    <tr>
      <td class="first-column">
        <span class="key">&larr;</span><span>, </span>
        <span class="key">&rarr;</span><span>, </span>
        <span class="key">&darr;</span><span> ou </span>
        <span class="key">&uarr;</span>
      </td>
      <td>Navegar dentro do campo matemático</td>
    </tr>
    <tr>
      <td class="first-column">
        <span class="key">"</span>
      </td>
      <td>Alternar o modo de comentário em um campo matemático</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">S</span></td>
      <td>Salvar a planilha atual em um arquivo local</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Shift</span> + <span class="key">S</span></td>
      <td>Salvar a planilha atual em um arquivo local com um novo nome de arquivo em vez de substituir o arquivo existente</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">L</span></td>
      <td>Salvar a planilha atual no banco de dados para obter um link compartilhável</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">O</span></td>
      <td>Abrir uma planilha a partir de um arquivo local (substitui a planilha atualmente carregada)</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Shift</span> + <span class="key">N</span></td>
      <td>Carregar uma planilha em branco (substitui a planilha atualmente carregada)</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Z</span></td>
      <td>Desfazer a edição no campo de texto ou matemática atual</td>
    </tr>
    <tr>
      {#if modifier === "Ctrl"}
        <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Y</span></td>
      {:else}
        <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Shift</span> + <span class="key">Z</span></td>
      {/if}
      <td>Refazer edição no campo de texto ou matemática atual</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">&uarr;</span></td>
      <td>Selecionar célula acima da célula atual</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">&darr;</span></td>
      <td>Selecionar célula abaixo da célula atual</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">D</span></td>
      <td>Excluir célula atual</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">Enter</span></td>
      <td>Inserir célula matemática quando em uma célula matemática, ou adicionar linha quando em uma célula de gráfico, tabela, expressão em partes ou resolução de sistema</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">Shift</span> + <span class="key">Enter</span></td>
      <td>Inserir célula matemática</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Enter</span> + <span class="key">1</span></td>
      <td>Inserir célula matemática</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Enter</span> + <span class="key">2</span></td>
      <td>Inserir célula de documentação</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Enter</span> + <span class="key">3</span></td>
      <td>Inserir célula de gráfico</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Enter</span> + <span class="key">4</span></td>
      <td>Inserir célula de tabela de seleção</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Enter</span> + <span class="key">5</span></td>
      <td>Inserir célula de tabela de dados</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Enter</span> + <span class="key">6</span></td>
      <td>Inserir célula de expressão por partes</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Enter</span> + <span class="key">7</span></td>
      <td>Inserir célula de resolução de sistema</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Enter</span> + <span class="key">8</span></td>
      <td>Inserir célula de propriedades de fluido</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">{modifier}</span> + <span class="key">Enter</span> + <span class="key">9</span></td>
      <td>Inserir planilha</td>
    </tr>
    <tr>
      <td class="first-column"><span class="key">Esc</span></td>
      <td>Desmarcar todas as células</td>
    </tr>
  </tbody>
</table>


