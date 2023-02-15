<script setup lang="ts">
import { computed, ref } from "vue";

import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Chip from "primevue/chip";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";

import { Dependency } from "@/classes/Dependency";
import { Closure } from "@/classes/Closure";
import ClosureList from "@/components/ClosureList.vue";

const activeTab = ref(0);
const relString = ref("");
const fds = ref("");

const attribute = ref("");
const attributeClosure = ref();

const isIn3NF = ref(false);
const isInBCNF = ref(false);
const parsed = ref(false);

const dependency = ref();
const closure = ref();

function parse() {
  dependency.value = new Dependency(
    "R = (A, B, C, D, E, G)",
    "F= {CD→G, G→AC, A→BD, E→BC}"
  );
  closure.value = new Closure(
    dependency.value.getAttributes(),
    dependency.value.getFD()
  );
  parsed.value = true;
}

function checkAttributeClosure() {
  if (parsed.value) {
    attributeClosure.value = closure.value.getReadableClosure(attribute.value);
  }
}

const filteredClosure = computed(() => {
  if (closure.value) {
    const readableClosure = closure.value.getFullReadableClosure();
    return readableClosure;
  } else return [];
});
</script>

<template>
  <main class="main">
    <div class="container">
      <h1>Normalization tool</h1>
      <section class="section">
        <span class="p-float-label">
          <InputText
            id="relationship"
            type="text"
            placeholder="R={A,B,C}"
            v-model="relString"
          />
          <label for="relationship">Relationship</label>
        </span>
        <span class="p-float-label">
          <InputText
            id="fds"
            type="text"
            placeholder="F={A->B,B->C}"
            v-model="fds"
          />
          <label for="fds">FDs</label>
        </span>
        <Button type="button" label="Parse" @click="parse" />
      </section>
      <TabView ref="activeTab">
        <TabPanel header="Closure">
          <section class="section">
            <span class="p-float-label">
              <InputText
                id="attribute"
                type="text"
                placeholder="AB"
                v-model="attribute"
                :disabled="!parsed"
                v-tooltip.top="{
                  value: !parsed ? 'Parse a FD first' : 'Input attribute',
                }"
              />
              <label for="relationship">Attribute</label>
            </span>
            <Button
              type="button"
              label="Check attribute closure"
              @click="checkAttributeClosure"
              :disabled="!parsed"
            />
            <span>{{ attributeClosure }}</span>
          </section>
          <Accordion class="accordion">
            <AccordionTab header="Closure">
              <ClosureList :closure="filteredClosure" />
            </AccordionTab>
          </Accordion>
        </TabPanel>
        <TabPanel header="Check normal form">
          <section class="section">
            <Chip
              label="3NF"
              :style="{ color: 'white', background: isIn3NF ? 'green' : 'red' }"
              :class="{ neutral: !parsed }"
            />
            <Chip
              label="BCNF"
              :style="{
                color: 'white',
                background: isInBCNF ? 'green' : 'red',
              }"
              :class="{ neutral: !parsed }"
            />
          </section>
        </TabPanel>
        <TabPanel header="Decompose"> </TabPanel>
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
.section {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
.accordion {
  margin-top: 1rem;
}
</style>
