import Vue from 'vue';
import App from './App.vue';

const target = { a: 7, b: 8 };
const source = { b: 9, c: 10 };
const b = new Map();

const returnedTarget = Object.assign(target, source);
console.log(returnedTarget);

new Vue({
    render: h => h(App),
}).$mount('#tencent_chatting');