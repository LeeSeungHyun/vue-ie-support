<template>
  <div id="app">
      <HelloWorld msg="Welcome to Yout Vue.js App" /> // HelloWorld 컴포넌트에 msg props로 넘겨준 모습으로 예측된다.
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'; // 다른 컴포넌트를 임포트한다.

export default { // 반드시 객체를 export 해줘야 한다.
  name: 'app',
  components: {
      HelloWorld, // HelloWorld 컴포넌트를 <HelloWorld>로 사용하겠다고 정의, "HelloWorld": HelloWorld와 같음
  }
}
</script>

<style>
#app {
  background-color: teal;
}
</style>