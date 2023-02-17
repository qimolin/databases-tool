<script setup lang="ts">
import { computed, ref, type Ref } from "vue";

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
import { CanonicalCover } from "./classes/CanonicalCover";

const activeTab = ref(0);

const relationship = ref("");
const fds = ref("");
const submitted = ref(false);

const relationshipError = computed(() => {
  if (submitted.value && relationship.value === "")
    return "Relationship is required";
  const regex = /R=\s*\s*\((\s*\w+\s*,?\s*)+\)\s*/;
  if (submitted.value && !regex.test(relationship.value))
    return "Invalid relationship";
  return "";
});

const fdsError = computed(() => {
  if (submitted.value && fds.value === "") return "FDs is required";
  const regex = /F\s*=\s*\{(\s*\w+\s*→\s*\w+\s*,?\s*)+}/;
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

const isIn3NF = ref(false);
const isInBCNF = ref(false);

function parse() {
  submitted.value = true;
  if (relationshipError.value !== "" || fdsError.value !== "") return;
  dependency.value = new Dependency(relationship.value, fds.value);
  closure.value = new Closure(
    dependency.value.getAttributes(),
    dependency.value.getFD()
  );
  cover.value = new CanonicalCover(
    dependency.value.getAttributes(),
    dependency.value.getFD()
  );
  stringCover.value = cover.value.getReadableCover();
}
</script>

<template>
  <main class="main">
    <div class="container">
      <h1>Databases tool</h1>
      <section class="section">
        <span class="p-float-label">
          <InputText
            style="width: 20rem"
            id="relationship"
            type="text"
            placeholder="R=(A,B,C)"
            v-model="relationship"
          />
          <label for="relationship">Relationship</label>
        </span>
        <span class="p-float-label">
          <InputText
            style="width: 20rem"
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
      <section v-if="relationshipError !== ''" class="section">
        <span class="error">{{ relationshipError }}</span>
      </section>
      <section v-if="fdsError !== ''" class="section">
        <span class="error">{{ fdsError }}</span>
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
          <section class="section">
            <InputText
              style="width: 80rem"
              type="text"
              placeholder="Cover"
              :disabled="true"
              v-model="stringCover"
            />
          </section>
        </TabPanel>
        <TabPanel header="Decompose"></TabPanel>
        <TabPanel header="Normal form">
          <section class="section">
            <Chip
              label="3NF"
              :style="{ color: 'white', background: isIn3NF ? 'green' : 'red' }"
              :class="{ neutral: !dependency }"
            />
            <Chip
              label="BCNF"
              :style="{
                color: 'white',
                background: isInBCNF ? 'green' : 'red',
              }"
              :class="{ neutral: !dependency }"
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
.section {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
.error {
  color: red;
}
.accordion {
  margin-top: 1rem;
}
</style>
