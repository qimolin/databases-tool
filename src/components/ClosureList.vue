<template>
  <div>
    <ul class="list">
      <li v-for="(item, index) in closure" :key="index">
        <span>{{ item }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  closure: string[];
}>();
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  justify-content: center;
  border: 1.5px solid #bbbbbb;
  border-radius: 10px;
  margin: 5px;
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
}
</style>
