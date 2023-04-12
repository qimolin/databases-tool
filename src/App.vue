<script setup lang="ts">
import { computed, ref, watch, type Ref } from "vue";

import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import Chip from "primevue/chip";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";

import { Dependency } from "@/classes/Dependency";
import { Closure } from "@/classes/Closure";
import ClosureList from "@/components/ClosureList.vue";
import { CanonicalCover } from "./classes/CanonicalCover";
import { Decomposition } from "./classes/Decomposition";
import { Normalization } from "./classes/Normalization";

const activeTab = ref(0);

const relationship = ref("");
const fds = ref("");
const parsed = ref(false);
const parsedFds: Ref<Map<string, Set<string>> | null> = ref(null);
const parsedAttributes: Ref<Set<string> | null> = ref(null);

const relationshipError = computed(() => {
  if (relationship.value === "") return "Relationship is required";
  const regex = /R\s*=\s*\((\s*\w+\s*,?\s*)+\)\s*/;
  if (!regex.test(relationship.value)) return "Invalid relationship";
  return "";
});

const fdsError = computed(() => {
  if (fds.value === "") return "FDs is required";
  const regex = /F\s*=\s*{(\s*\w+\s*→\s*\w+\s*,?\s*)+}\s*/;
  if (!regex.test(fds.value)) return "Invalid FDs";
  return "";
});

const attribute = ref("");
const attributeClosure = ref();

const dependency: Ref<Dependency | undefined> = ref();
const closure: Ref<Closure | undefined> = ref();

function checkAttributeClosure() {
  if (closure.value) {
    attributeClosure.value = closure.value.getReadableClosure(attribute.value);
  }
}

const filteredClosure = computed(() => {
  if (closure.value) {
    const readableClosure = closure.value.getFullReadableClosure();
    return readableClosure;
  } else return [];
});

const cover: Ref<CanonicalCover | undefined> = ref();
const stringCover = ref("");

const decompositions: Ref<Array<string>> = ref([""]);
const decompositionCount = ref(1);
const tempDecompositionCount = ref(1);
const decompositionChecked = ref(false);
const decomposition: Ref<Decomposition | undefined> = ref();
const isLossless = ref(false);
const isDependencyPreserving = ref(false);
const decompositionIsIn3NF = ref(false);
const decompositionIsInBCNF = ref(false);

watch(
  () => decompositionCount.value,
  (newValue, oldValue) => {
    if (oldValue < newValue) {
      for (let i = oldValue; i < newValue; i++) {
        decompositions.value.push("");
      }
    } else {
      decompositions.value = decompositions.value.slice(0, newValue);
    }
  }
);

const rows = computed(() => {
  let result = [];
  let temp = [];

  for (let i = 0; i < decompositions.value.length; i++) {
    if (i > 0 && i % 3 === 0) {
      result.push(temp);
      temp = [];
    }
    temp.push(decompositions.value[i]);
  }

  if (temp.length > 0) {
    result.push(temp);
  }
  return result;
});

function confirmCount() {
  if (tempDecompositionCount.value < 1) tempDecompositionCount.value = 1;
  decompositionCount.value = tempDecompositionCount.value;
}

function checkDecomposition() {
  if (dependency.value) {
    decompositionChecked.value = true;
    decomposition.value = new Decomposition(
      parsedAttributes.value!,
      parsedFds.value!,
      decompositions.value
    );
    isLossless.value = decomposition.value.isLossless();
    isDependencyPreserving.value = decomposition.value.isDependencyPreserving();
    decompositionIsInBCNF.value = decomposition.value.isInBCNF();
    decompositionIsIn3NF.value = decomposition.value.isIn3NF();
  }
}

const isIn3NF = ref(false);
const isInBCNF = ref(false);

function parse() {
  parsed.value = true;
  if (relationshipError.value !== "" || fdsError.value !== "") return;
  dependency.value = new Dependency(relationship.value, fds.value);
  parsedAttributes.value = dependency.value.getAttributes();
  parsedFds.value = dependency.value.getFD();
  closure.value = new Closure(parsedAttributes.value, parsedFds.value);
  cover.value = new CanonicalCover(parsedAttributes.value, parsedFds.value);
  stringCover.value = cover.value.getReadableCover();
  isInBCNF.value = Normalization.checkBCNF(
    parsedAttributes.value,
    parsedFds.value
  );
  isIn3NF.value = Normalization.check3NF(
    parsedAttributes.value,
    parsedFds.value
  );
}
</script>

<template>
  <main class="main">
    <div class="container">
      <h1>Databases tool</h1>
      <section class="row">
        <span class="p-float-label">
          <InputText
            style="width: 18rem"
            id="relationship"
            type="text"
            placeholder="R=(A,B,C)"
            v-model="relationship"
          />
          <label for="relationship">Relationship</label>
        </span>
        <span class="p-float-label">
          <InputText
            style="width: 18rem"
            id="fds"
            type="text"
            placeholder="F={A→B,B→C}"
            v-model="fds"
          />
          <label for="fds">FDs</label>
        </span>
        <Button
          type="button"
          label="Parse"
          :disabled="relationshipError !== '' || fdsError !== ''"
          @click="parse"
        />
      </section>
      <section v-if="relationshipError !== ''" class="row">
        <span class="error">{{ relationshipError }}</span>
      </section>
      <section v-if="fdsError !== ''" class="row">
        <span class="error">{{ fdsError }}</span>
      </section>
      <section class="row">
        <Chip
          label="3NF"
          :style="{ color: 'white', background: isIn3NF ? 'green' : 'red' }"
          :class="{
            neutral: !parsed,
          }"
        />
        <Chip
          label="BCNF"
          :style="{
            color: 'white',
            background: isInBCNF ? 'green' : 'red',
          }"
          :class="{
            neutral: !parsed,
          }"
        />
      </section>
      <TabView ref="activeTab">
        <TabPanel header="Closure">
          <section class="row">
            <span class="p-float-label">
              <InputText
                id="attribute"
                type="text"
                placeholder="AB"
                v-model="attribute"
                :disabled="!dependency"
                v-tooltip.top="{
                  value: !dependency ? 'Parse a FD first' : 'Input attribute',
                }"
              />
              <label for="relationship">Attribute</label>
            </span>
            <Button
              type="button"
              label="Check attribute closure"
              @click="checkAttributeClosure"
              :disabled="!dependency"
            />
            <span>{{ attributeClosure }}</span>
          </section>
          <Accordion class="accordion">
            <AccordionTab header="Closure">
              <ClosureList :closure="filteredClosure" />
            </AccordionTab>
          </Accordion>
        </TabPanel>
        <TabPanel header="Cover">
          <section class="row">
            <InputText
              style="width: 80rem"
              type="text"
              placeholder="Cover"
              :disabled="true"
              v-model="stringCover"
            />
          </section>
        </TabPanel>
        <TabPanel header="Decompose">
          <div v-for="(row, index) in rows" :key="index" class="row">
            <div v-for="(_item, itemIndex) in row" :key="itemIndex">
              <InputText
                :disabled="!parsed"
                type="text"
                :placeholder="`R${itemIndex + 1 + index * 3}`"
                v-model="decompositions[itemIndex + index * 3]"
              />
            </div>
          </div>
          <section class="row">
            <InputNumber
              :disabled="!parsed"
              v-model="tempDecompositionCount"
              :min="1"
              showButtons
            />
            <Button :disabled="!parsed" label="Confirm" @click="confirmCount" />
            <Button
              :disabled="!parsed"
              label="Check"
              @click="checkDecomposition"
            />
          </section>
          <section class="row">
            <Chip
              label="Lossless join"
              :style="{
                color: 'white',
                background: isLossless ? 'green' : 'red',
              }"
              :class="{ neutral: !decompositionChecked }"
            />
            <Chip
              label="Dependency preserving"
              :style="{
                color: 'white',
                background: isDependencyPreserving ? 'green' : 'red',
              }"
              :class="{ neutral: !decompositionChecked }"
            />
            <Chip
              label="3NF"
              :style="{
                color: 'white',
                background: decompositionIsIn3NF ? 'green' : 'red',
              }"
              :class="{ neutral: !decompositionChecked }"
            />
            <Chip
              label="BCNF"
              :style="{
                color: 'white',
                background: decompositionIsInBCNF ? 'green' : 'red',
              }"
              :class="{ neutral: !decompositionChecked }"
            />
          </section>
        </TabPanel>
      </TabView>
    </div>
  </main>
</template>

<style>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.container {
  text-align: center;
  width: 100%;
  max-width: 800px;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 1rem;
}
.p-tabview-nav {
  justify-content: center;
}
.p-accordion-header-action {
  justify-content: center;
}
.neutral {
  background: #dee2e6 !important;
  color: #495057 !important;
}
.row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem;
}
.row {
  display: flex;
  justify-content: center;
  align-items: center;
}
.error {
  color: red;
}
.accordion {
  margin-top: 1rem;
}
.p-inputnumber-input {
  width: 3rem;
}
</style>
