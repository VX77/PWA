
<template>
  <div id="main">
    <v-layout column justify-space-between id="container">
      <v-layout mt-5></v-layout>
      <div align="center">
        <v-flex xs12>  <v-img src="/login/logo.png" width="50%" ></v-img></v-flex>
      </div>
      <v-flex xs12>
        <v-layout column
                  align-center
                  justify-center
                  mt-5
        >
          <v-flex xs12>
            <v-form>
              <span v-if="loading== false" style="color:red">{{ message }}</span>

              <v-text-field class="mx-auto white--text"
                            background-color="rgba(255,250,250,0.5)"
                            label="USERNAME/EMAIL"
                            solo
                            v-model="email"
                            required
              ></v-text-field>
              <v-text-field
                v-model="password"
                background-color="rgba(255,250,250,0.5)"
                label="PASSWORD"
                required
                solo
                :append-icon="show1 ? 'visibility' : 'visibility_off'"
                :type="show1 ? 'text' : 'password'"
                @click:append="show1 = !show1"
              ></v-text-field>

              <v-layout column
                        align-center
                        justify-center
              >
                <v-btn  color="#3d4047" class="white--text btn-width" @click="loginClick">login</v-btn>
              </v-layout>
            </v-form>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </div>

</template>

<script>
  const Cookie = process.client ? require('js-cookie') : undefined
  import Strapi from 'strapi-sdk-javascript/build/main'
  const apiUrl = process.env.API_URL || 'http://localhost:1337'
  const strapi = new Strapi(apiUrl)


  export default {
    middleware: 'notAuthenticated',
    data() {
      return {
        show1: false,
        show2: true,
        email:'',
        password: '',
        loading: true,
        message:''
      }
    },
    methods:{
      async loginClick(){
        try {
          console.log("login Click")
          this.loading = true

          const response = await strapi.login(this.email, this.password);
          const auth = {
            accessToken: 'response.jwt'
          };
          const id = response.user.id;
          this.$store.commit('auth/setAuth', auth);// mutating to store for client rendering
          this.$store.commit('auth/setId', id);// mutating to store for client rendering
          Cookie.set('auth', auth); // saving token in cookie for server rendering

          console.log(this.$store.state.auth.id);
          console.log(id),
          this.$router.push(`/userStart`)
        } catch (err) {
          this.loading = false;
          this.message = err.message;
/*
          alert(err.message || 'An error occurred.')
*/
        }
      }
    }
  }
</script>
<style>
  #main{
    width: 100%;
    height: 100%;
    background-image: url("/login/login.jpg");
    background-size: cover;
    flex-direction:column;
    justify-content: space-between;
  }
  #container{
    width: 100%;
    height: 100%;
  }
  .flex-width{
    width: 60%;
  }
  .btn-width{
    width: 100%;
  }
</style>
