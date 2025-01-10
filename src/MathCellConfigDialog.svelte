<script lang="ts">
  import { Checkbox, NumberInput, Button, 
           RadioButtonGroup, RadioButton } from "carbon-components-svelte";  
  import { defaultConfig, copyMathConfig, isDefaultMathConfig, 
           type MathCellConfig, getSafeMathConfig, mathConfigLimits } from "./sheet/Sheet";
  import { unsavedChange, autosaveNeeded, mathCellChanged } from "./stores";
  import type MathCellElement from "./MathCell.svelte";

  export let mathCellConfig: MathCellConfig | null;
  export let cellLevelConfig = false;
  export let mathCellElement: MathCellElement | null = null;

  let defaultMathConfig = defaultConfig.mathCellConfig;
  let currentMathCellConfig = copyMathConfig(mathCellConfig) ?? copyMathConfig(defaultMathConfig);

  export function resetDefaults() {
    currentMathCellConfig = copyMathConfig(defaultMathConfig);
    update();
  }

  function update(event: Event | null = null, resolve:boolean  = false) {
    if (resolve) {
      $mathCellChanged = true;
    } else {
      $unsavedChange = true;
      $autosaveNeeded = true;
    }

    let newConfig: MathCellConfig | null = getSafeMathConfig(currentMathCellConfig);

    if (cellLevelConfig && isDefaultMathConfig(newConfig)) {
      newConfig = null;
    }

    mathCellConfig = newConfig;

    if (cellLevelConfig && mathCellElement) {
      mathCellElement.setNumberConfig(mathCellConfig);
    }
  }

</script>

<style>
  div.container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  div.number-input {
    max-width: 250px;
  }
</style>

<Checkbox
  bind:checked={currentMathCellConfig.symbolicOutput}
  labelText="Exibir Resultados Simbólicos"
  on:change={update}
/>

<div class="container">
  <Checkbox
    bind:checked={currentMathCellConfig.showIntermediateResults}
    labelText="Exibir Resultados Intermediários"
    on:change={() => update(null, true)}
  />

  <RadioButtonGroup
    disabled={currentMathCellConfig.symbolicOutput}
    legendText="Notação"
    bind:selected={currentMathCellConfig.formatOptions.notation}
    on:change={update}
  >
    <RadioButton labelText="Automática" value="auto" />
    <RadioButton labelText="Fixa" value="fixed" />
    <RadioButton labelText="Científica" value="exponential" />
    <RadioButton labelText="Engenharia" value="engineering" />
  </RadioButtonGroup>

  <div class="number-input">
    <NumberInput
      disabled={currentMathCellConfig.symbolicOutput}
      bind:value={currentMathCellConfig.formatOptions.precision}
      label={currentMathCellConfig.formatOptions.notation === "fixed" ? "Casas Decimais Significativas" : "Casas Significativas"}
      size="sm"
      min={currentMathCellConfig.formatOptions.notation === "fixed" ? 0 : 1}
      max={mathConfigLimits.precisionUpper}
      invalidText={`O valor deve estar entre ${currentMathCellConfig.formatOptions.notation === "fixed" ? 0 : 1} e ${mathConfigLimits.precisionUpper}`}
      on:input={update}
    />
  </div>

  <div class="number-input">
    <NumberInput
      disabled={currentMathCellConfig.symbolicOutput || !(currentMathCellConfig.formatOptions.notation === "auto")}
      bind:value={currentMathCellConfig.formatOptions.lowerExp}
      label="Limite de Expoente Negativo"
      size="sm"
      min={mathConfigLimits.lowerExpLower}
      max={mathConfigLimits.lowerExpUpper}
      invalidText={`O valor deve estar entre ${mathConfigLimits.lowerExpLower} e ${mathConfigLimits.lowerExpUpper}`}
      on:input={update}
    />
  </div>

  <div class="number-input">
    <NumberInput
      disabled={currentMathCellConfig.symbolicOutput || !(currentMathCellConfig.formatOptions.notation === "auto")}
      bind:value={currentMathCellConfig.formatOptions.upperExp}
      label="Limite de Expoente Positivo"
      size="sm"
      min={mathConfigLimits.upperExpLower}
      max={mathConfigLimits.upperExpUpper}
      invalidText={`O valor deve estar entre ${mathConfigLimits.upperExpLower} e ${mathConfigLimits.upperExpUpper}`}
      on:input={update}
    />
  </div>

</div>