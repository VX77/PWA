<!--suppress ALL -->
<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-container>
        <v-layout column>
            <v-flex xs12
                    mt-4>
                <v-card color="white">
                    <v-card-title class="title themeColor--text font-weight-bold">
                        Createtime
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-layout row>
                            <v-flex xs6>
                                <v-dialog
                                        ref="dialog"
                                        v-model="modal"
                                        full-width
                                        width="290px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field
                                                v-model="startTime"
                                                label="Start Time"
                                                prepend-icon="event"
                                                readonly
                                                v-on="on"
                                                color="themeColor"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="startTime"
                                                   scrollable
                                                   color="themeColor"
                                                   :max="date">
                                        <v-spacer></v-spacer>
                                        <v-btn flat color="themeColor white--text" @click="modal = false">Cancel</v-btn>
                                        <v-btn flat color="themeColor white--text" @click="$refs.dialog.save(startTime)">OK</v-btn>
                                    </v-date-picker>
                                </v-dialog>
                            </v-flex>
                            <v-flex xs6>
                                <v-dialog
                                        ref="dialog"
                                        v-model="modal"
                                        full-width
                                        width="290px"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field
                                                v-model="endTime"
                                                label="End Time"
                                                prepend-icon="event"
                                                color="themeColor"
                                                readonly
                                                v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker v-model="endTime"
                                                   scrollable
                                                   color="themeColor"
                                                   :min="startTime"
                                                   :max="date">
                                        <v-spacer></v-spacer>
                                        <v-btn flat class="themeColor white--text"  @click="modal = false">Cancel</v-btn>
                                        <v-btn flat class="themeColor white--text" @click="$refs.dialog.save(endTime)">OK</v-btn>
                                    </v-date-picker>
                                </v-dialog>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-flex>

            <v-flex xs12
                    mt-3>
                <v-card color="white">
                    <v-card-title class="title themeColor--text font-weight-bold">
                        Project
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-text-field
                                label="Project Name"
                                single-line
                                color="themeColor"
                                v-model="projName"
                        ></v-text-field>
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs12
                    mt-4
                    align-self-center
                    class="flex-width">
                <v-btn class="white--text themeColor btn" @click="goToSearch">Search</v-btn>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import axios from '~/plugins/axios'

    export default {
        name: "search",
        middleware: 'authenticated',
        layout: "common",
        data: ()=>{
            return {
                projName: '',
                date: new Date().toISOString().substr(0, 10),
                modal: false,
                startTime: new Date().toISOString().substr(0, 10),
                endTime: new Date().toISOString().substr(0, 10)
            }
        },
        methods: {
            goToSearch() {
                this.$router.push({
                     path: '/project',
                     query: {
                         startTime: this.startTime,
                         endTime: this.endTime,
                         projName: this.projName
                     }
                });
            }
        }
    }
</script>

<style scoped>
    .flex-width{
        width: 60%;
    }
    .btn{
        width: 100%;
    }
</style>
