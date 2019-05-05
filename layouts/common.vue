<template>
    <v-app>
        <v-layout row
                  align-center
                  font-weight-medium
                  class="themeColor">
            <v-flex xs2>
                <v-btn icon @click="goBack">
                    <v-icon color="#ffffff">keyboard_backspace</v-icon>
                </v-btn>
            </v-flex>
            <v-flex xs8
                    text-xs-center
                    title
                    class="white--text">
                {{title}}
            </v-flex>
            <v-flex xs2>

            </v-flex>
        </v-layout>
        <Nuxt/>
    </v-app>
</template>

<script>
    export default {
        name: "common",
        data() {
            return {
                titleMap: new Map([
                        ["chooseType", "Choose Type"],
                        ["detail", "Detail"],
                        ["preview", "Preview"],
                        ["project", "My Project"],
                        ["search", "Search"]
                    ]
                )
            }
        },
        computed:{
            title: function () {
                return this.titleMap.get(this.$route.name);
            }
        },
        methods: {
            goBack(){
                this.$router.go(-1);
            }
        }
    }
</script>

<style scoped>

</style>