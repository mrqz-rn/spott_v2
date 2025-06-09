import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { IonicVue } from '@ionic/vue';
import MyFormData from './library/formdata';
import MyApi from './library/myapi';
import MyStorage from './library/storage';
import MyFunctions from './library/functions';
import { registerPlugin } from '@capacitor/core';

// Register the plugin
const DatetimeSetting = registerPlugin('DatetimeSetting', {
  web: () => import('./web').then(m => new m.DatetimeSettingWeb()),
});

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Theme variables */
import './theme/variables.css';
import './assets/main.css';

const app = createApp(App);
app.use(router)
app.use(IonicVue)
app.use(MyFormData)
app.mixin(MyFunctions)
app.use(MyStorage)
// app.use(store)
app.use(MyApi);
app.mount('#app');



// const app = createApp(App)
//   .use(IonicVue)
//   .use(router);

// router.isReady().then(() => {
//   app.mount('#app');
// });
































/* Core CSS required for Ionic components to work properly */
// import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
// import '@ionic/vue/css/normalize.css';
// import '@ionic/vue/css/structure.css';
// import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
// import '@ionic/vue/css/padding.css';
// import '@ionic/vue/css/float-elements.css';
// import '@ionic/vue/css/text-alignment.css';
// import '@ionic/vue/css/text-transformation.css';
// import '@ionic/vue/css/flex-utils.css';
// import '@ionic/vue/css/display.css';


/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
// import '@ionic/vue/css/palettes/dark.system.css';



