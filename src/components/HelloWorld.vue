<template>
  <div>
      <p>{{text}}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const text = ref<string>('')
const arr = ref({
  name: "Lee",
  age: 33
})

onMounted(() => {
  const { name, age } = arr.value;
  const target = { a: 1, b: 2 };
  const source = { b: 4, c: 5 };

  const returnedTarget = Object.assign(target, source);
  console.log(returnedTarget);
  setTimeout(() => {
    text.value = "LeeSeungHyun 짱"
    console.log(name);
    console.log(age);
  }, 2000)
})

</script>

<style>
p {
  font-size: 40px;
  color: white;
}
</style>