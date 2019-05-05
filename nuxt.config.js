import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin'
import pkg from './package'
const workbox = async () => {
    return await window.$workbox
};
export default {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
      }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: [
    '~/assets/style/app.styl',
    '~/assets/style/main.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/vuetify',
    '@/plugins/axios'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
      '@nuxtjs/pwa'
  ],

  /*
  ** Customize app manifest
  */
  manifest: {
      name: "YOM"
  },

  /*
  ** Workbox configuration
  */
  workbox: {
      swURL: 'custom-sw.js'
      // runtimeCaching:[
      //     {
      //         urlPattern: 'http://localhost:1337/projects',
      //         handler: 'networkOnly',
      //         method: 'POST',
      //         strategyOptions: {
      //             plugins:[{
      //                 fetchDidFail: async ({originalRequest, request, error, event}) => {
      //                     console.log(originalRequest)
      //                 }
      //             }]
      //         }
      //     }
      // ]
  },

  /*
  ** Build configuration
  */
  build: {
    transpile: ['vuetify/lib'],
    plugins: [new VuetifyLoaderPlugin()],
    loaders: {
      stylus: {
        import: ['~assets/style/variables.styl']
      }
    },
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
    }
  },
  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:1337'
  }

}
