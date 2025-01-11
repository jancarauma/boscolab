<script>
   import { SettingsAdjust, Download, RowCollapse } from "carbon-icons-svelte";
   import { modifierKey } from "./stores";
 
   const modifier = $modifierKey === "ctrlKey" ? "Ctrl" : "Cmd";
</script>
 
<style>
   img {
     display: block;
   }
 
   ul {
      list-style: initial;
      margin-left: 20px;
   }
</style>
 
<em>Janeiro 11, 2025</em>
<h4>Nova Função de Configurações Padrão Personalizadas</h4>
<p>
   Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vehicula magna id 
   arcu sollicitudin, vel feugiat risus fermentum. Aenean eget quam ut ligula cursus 
   scelerisque. Suspendisse potenti. Vestibulum ante ipsum primis in faucibus orci luctus 
   et ultrices posuere cubilia curae; Sed vitae nisl in lectus pellentesque pretium. 
   Vivamus faucibus facilisis velit, a tincidunt elit malesuada quis.
</p>
<p>
   Integer nec justo vel lorem pellentesque tincidunt. Fusce at sapien eu nisl aliquam 
   pellentesque vel in augue. Nam vestibulum augue nec mi blandit, at aliquet sapien 
   placerat. Curabitur lacinia ante ac erat volutpat, a ullamcorper elit bibendum. 
   Proin nec nulla purus. Vivamus accumsan metus quis malesuada scelerisque. Accesse 
   a funcionalidade via "Set User Default" na aba de configurações <SettingsAdjust size={16}/> 
   disponível na barra superior.
</p>
