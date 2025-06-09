import { createRouter, createWebHistory } from '@ionic/vue-router';
import { getPlatforms } from '@ionic/vue';
import Main from '../views/Main.vue';


const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/LoadPage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/update',
    name: 'update',
    component: () => import('../views/Update.vue'),
  },
  {
    path: '/',
    component: Main,
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/Dashboard.vue'),
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('../views/Profile.vue'),
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('../views/Settings.vue'),
      },
      {
        path: '/faqs',
        name: 'faqs',
        component: () => import('../views/Faqs.vue'),
      },
      {
        path: '/report',
        name: 'report',
        component: () => import('../views/Report.vue'),
      },
    ],
  },


 

]


const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
 
  // if(from.name == 'login' && to.name == 'home'){
  //   next(false)
  // }
  // if(from.name == 'dashboard' && (to.name == 'login' || to.name == 'home')){
  //   next(false)
  // }
  next()
})




// if(getPlatforms().includes('android')){
//   document.addEventListener('backbutton', (event) => {
//     if (backPressCount === 0) {
//       router.push('/dashboard');
//       backPressCount++;
//       backPressTimer = setTimeout(() => {
//         backPressCount = 0; // Reset count after 2 seconds
//       }, 2000);
//     } else {
//       clearTimeout(backPressTimer);
//       navigator.app.exitApp();
//     }
//   }, false);
// }


export default router
