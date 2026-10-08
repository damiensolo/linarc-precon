import Vue from 'vue';
import PortalVue from 'portal-vue';
import moment from 'moment';
import './style.css';
import App from './App.vue';

Vue.config.productionTip = false;

// Same globals the library's install() / Storybook preview register (src/build.js, .storybook/preview.js).
Vue.use(PortalVue);
Vue.prototype.$moment = moment;

// TopNavBar and ToolsItem use <Teleport>, which Vue 2.7 doesn't have and the library never registers.
// Render its children in place so the nav works without an unknown-element warning. See findings log F-016.
Vue.component('Teleport', {
  functional: true,
  render: (h, ctx) => ctx.children,
});

new Vue({
  render: (h) => h(App),
}).$mount('#app');
