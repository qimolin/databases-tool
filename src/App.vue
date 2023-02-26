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

const activeTab = ref(0);

const relationship = ref("R = (A, B, C, D, E, G)");
const fds = ref("F= {CD→G, G→AC, A→BD, E→BC}");
const submitted = ref(false);

const relationshipError = computed(() => {
  if (submitted.value && relationship.value === "")
    return "Relationship is required";
  const regex = /R\s*=\s*\((\s*\w+\s*,?\s*)+\)\s*/;
  if (submitted.value && !regex.test(relationship.value))
    return "Invalid relationship";
  return "";
});

const fdsError = computed(() => {
  if (submitted.value && fds.value === "") return "FDs is required";
  const regex = /F\s*=\s*{(\s*\w+\s*→\s*\w+\s*,?\s*)+}\s*/;
  if (submitted.value && !regex.test(fds.value)) return "Invalid FDs";
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

const decompositions: Ref<Array<string>> = ref([
  "R1 = (C, D, G)",
  "R2 = (A, C, G)",
  "R3 = (A, B, D)",
  "R4 = (B, C, E)",
  "R5 = (E, G)",
]);
const decompositionCount = ref(5);
const tempDecompCount = ref(1);
const decompositionChecked = ref(false);
const decomposition: Ref<Decomposition | undefined> = ref();
const isLossless = ref(false);
const isDependencyPreserving = ref(false);

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
  if (tempDecompCount.value < 1) tempDecompCount.value = 1;
  decompositionCount.value = tempDecompCount.value;
}

function checkDecomposition() {
  if (dependency.value) {
    decompositionChecked.value = true;
    const attributes = dependency.value.getAttributes();
    const parsedFds = dependency.value.getFD();
    decomposition.value = new Decomposition(
      attributes,
      parsedFds,
      decompositions.value
    );
    isLossless.value = decomposition.value.isLossless();
    isDependencyPreserving.value = decomposition.value.isDependencyPreserving();
  }
}

const isIn3NF = ref(false);
const isInBCNF = ref(false);

function parse() {
  submitted.value = true;
  if (relationshipError.value !== "" || fdsError.value !== "") return;
  dependency.value = new Dependency(relationship.value, fds.value);
  const attributes = dependency.value.getAttributes();
  const parsedFds = dependency.value.getFD();
  closure.value = new Closure(attributes, parsedFds);
  cover.value = new CanonicalCover(attributes, parsedFds);
  stringCover.value = cover.value.getReadableCover();
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
          :disabled="(submitted && relationshipError !== '') || fdsError !== ''"
          @click="parse"
        />
      </section>
      <section v-if="relationshipError !== ''" class="row">
        <span class="error">{{ relationshipError }}</span>
      </section>
      <section v-if="fdsError !== ''" class="row">
        <span class="error">{{ fdsError }}</span>
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
                type="text"
                :placeholder="`R${itemIndex + 1 + index * 3}`"
                v-model="decompositions[itemIndex + index * 3]"
              />
            </div>
          </div>
          <section class="row">
            <InputNumber v-model="tempDecompCount" :min="1" showButtons />
            <Button label="Confirm" @click="confirmCount" />
            <Button label="Check" @click="checkDecomposition" />
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
          </section>
        </TabPanel>
        <TabPanel header="Normal form">
          <section class="row">
            <Chip
              label="3NF"
              :style="{ color: 'white', background: isIn3NF ? 'green' : 'red' }"
              :class="{ neutral: !submitted }"
            />
            <Chip
              label="BCNF"
              :style="{
                color: 'white',
                background: isInBCNF ? 'green' : 'red',
              }"
              :class="{ neutral: !submitted }"
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
