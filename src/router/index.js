import {createRouter, createWebHistory} from "vue-router";
import {isUnauthorized} from "../net/index.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes : [
    {
      path: '/',
      name:'welcome',
      component: () => import('../views/welcome/Welcome.vue'),
      children: [
        {
          path: '',
          name: 'welcome-login',
          component: () => import('../views/welcome/Login.vue')
        },
        {
          path: 'register',
          name: 'welcome-register',
          component: () => import('../views/welcome/Register.vue')
        },
        {
          path: 'reset',
          name: 'welcome-reset',
          component: () => import('../views/welcome/Reset.vue')
        },
      ],
    },{
      path: '/index',
      name: 'index',
      component: () => import('../views/IndexView.vue'),
      children: [
        {
          path:'',
          name:'topics',
          component: () => import('../views/forum/Forum.vue'),
          children:[
            {
              path: '',
              name: 'topic-list',
              component: () => import('../views/forum/TopicList.vue')
            },
            {
              path: 'topic-detail/:tid',
              name: 'topic-detail',
              component: () => import('../views/forum/TopicDetail.vue')
            },
            {
              path: 'user-detail/:id',
              name: 'user-detail',
              component: () => import("../views/forum/UserDetail.vue")
            }
          ]
        },
        {
          path: 'market',
          name: 'market',
          component: () => import('../views/market/Market.vue'),
          children: [
            {
              path: '',
              name: 'ticket-list',
              component: () => import('../views/market/TicketList.vue')
            },
            {
              path: 'ticket-order/:tid',
              name: 'ticket-order',
              component: () => import('../views/market/TicketOrder.vue')
            },
            {
              path: 'ticket/orders',
              name: 'orders',
              component: () => import('../views/market/Orders.vue')
            }
          ]
        } ,
        {
          path: 'relax',
          name: 'relax',
          component: () => import('../views/relax/Relax.vue'),
        },
        {
          path: 'user-setting',
          name: 'user-setting',
          component: () => import('../views/settings/UserSetting.vue')
        },
        {
          path: 'privacy-setting',
          name: 'privacy-setting',
          component: () => import('../views/settings/PrivacySetting.vue')
        },
      ]
    },{
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      children:[

      ]
    },
  ]
})

router.beforeEach((to, from, next) => {
  const unauthorized = isUnauthorized()
  if(typeof to.name === 'string' && to.name.startsWith('welcome') && !unauthorized) {
    next('/index')
  } else if(to.fullPath.startsWith('/index') && unauthorized) {
    next('/')
  } else {
    next()
  }
})


export default router;