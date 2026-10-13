import Vue from 'vue';
import PortalVue from 'portal-vue';
import Vuelidate from 'vuelidate';
import Vuex from 'vuex';
import moment from 'moment';
import './style.css';
// The Prequalification demo session must patch the shared mock data before any screen reads it (data/session.js).
import '~/modules/prequal/data/session';
import '~/modules/prequal/data/templates'; // keeps the template names in step with the session's templates (2026-10-12)
import App from './App.vue';

Vue.config.productionTip = false;

// Same globals the library's install() / Storybook preview register (src/build.js, .storybook/preview.js).
Vue.use(PortalVue);
// InputV2, SelectV2 and FormV2 validate through Vuelidate (`this.$v`); the library installs it in build.js. F-036.
Vue.use(Vuelidate);
Vue.prototype.$moment = moment;

// The library's DatePicker (FormV2 `date` fields, Figma Input Field Type=Date) reads holidays and working days from a
// namespaced `DatePicker` Vuex module, which the host app provides. Without a store the calendar threw on open and
// rendered as a 2px box (F-065). Same mock as Storybook's preview.js: no holidays, Mon-Fri working days.
Vue.use(Vuex);
const store = new Vuex.Store({
  modules: {
    DatePicker: {
      namespaced: true,
      state: { holidays: [], workingDays: ['0', '1', '2', '3', '4'] },
      getters: {
        getHolidays: (state) => state.holidays,
        getWorkingDays: (state) => state.workingDays,
      },
    },
  },
});

// TopNavBar and ToolsItem use <Teleport>, which Vue 2.7 doesn't have and the library never registers.
// Render its children in place so the nav works without an unknown-element warning. See findings log F-016.
Vue.component('Teleport', {
  functional: true,
  render: (h, ctx) => ctx.children,
});

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app');
