<template>
    <v-container color="grey lighten-5">

        <v-layout color="white"
                  column
                  wrap
                  >
            <v-flex class="font-weight-medium"
                    align-self-center
                    mb-3>
                <h1>{{projNameShare || 'No project name'}}</h1>
            </v-flex>
            <v-flex>
                <div>
                    <p class="subheading"><strong>Description:</strong>{{descriptionShare || 'No description'}}</p>
                </div>
            </v-flex>
            <v-flex mb-3
                    v-for="(cat, index) in checkedCatsTree"
                    :key="index">
                <h2>{{index+1}}.{{cat.category ? cat.category.catName : cat.catName}}</h2>
                <ul>
                    <li v-for="(child,index) in cat.childNodes"
                        :key="index">
                        <h3 class="subheading"><strong>{{child.category ? child.category.catName : child.catName}}</strong></h3>
                        <h4 class="body-2">Time Cost: {{child.category ? child.category.timeCost : child.timeCost}} h</h4>
                        <h4 class="body-2" v-if="child.category && child.category.comment">Note:</h4>
                        <h4 class="body-2" v-if="child.comment">Note:</h4>
                        <p v-if="child.category && child.category.comment" class="content ">{{child.category.comment}}</p>
                        <p v-if="child.comment" class="content ">{{child.comment}}</p>
                        <h4 class="body-2">Description:</h4>
                        <p class="content">{{child.category ? child.category.description : child.description}}</p>
                    </li>
                </ul>
            </v-flex>
            <v-flex>
                <v-divider color="black"></v-divider>
            </v-flex>
            <v-flex align-self-end
                    py-2
                    mb-3>
                <div>
                    <span>Total Time: </span>
                    <span>{{timeTotal || '0'}} h</span>
                </div>
            </v-flex>
            <v-flex align-self-center
                    class="flex-width">
                <v-btn class="themeColor btn white--text mx-auto"
                       v-if="id"
                       :to="`/detail?id=${id}`">Edit</v-btn>
                <v-btn class="themeColor btn white--text mx-auto"
                       @click="validateProjName">Save</v-btn>
            </v-flex>
        </v-layout>

        <v-dialog
                v-model="tipDialog"
                max-width="290"
        >
            <v-card>
                <v-card-title class="headline">Tip</v-card-title>

                <v-card-text>
                    Do you want to save the project?
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                            color="green darken-1"
                            flat="flat"
                            @click="tipDialog = false"
                    >
                        Cancel
                    </v-btn>

                    <v-btn
                            color="green darken-1"
                            flat="flat"
                            @click="saveOrUpdate"
                    >
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog
                v-model="savingDialog"
                hide-overlay
                persistent
                width="300"
        >
            <v-card
                    color="lime darken-4"
                    dark
            >
                <v-card-text>
                    Saving...
                    <v-progress-linear
                            indeterminate
                            color="lime lighten-5"
                            class="mb-0"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="fillDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Add Your Project Name</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12>
                                <v-text-field color="green darken-1"
                                              label="Project Name"
                                              v-model="projName"></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat @click="fillDialog = false">Close</v-btn>
                    <v-btn color="green darken-1" flat @click="saveProjName">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog
                v-model="isOffline"
                max-width="290"
        >
            <v-card>
                <v-card-title class="headline">Tip</v-card-title>

                <v-card-text>
                    Sorry, please check your network.
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                            color="green darken-1"
                            flat="flat"
                            @click="isOffline=true">
                        OK
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>
    import { createNamespacedHelpers } from 'vuex'
    import { createIndexedDB, addDataLocally, fetchApi, updateProj, DB_NAME_PROJ, STORE_NAME_PROJ } from 'assets/js/idbUtil'
    import { getNowFormatDate } from 'assets/js/util'
    import axios from '~/plugins/axios'
    const { mapGetters, mapMutations } = createNamespacedHelpers('newProj')

    export default {
        name: "preview",
        layout: 'common',
        middleware: 'authenticated',
        data(){
            return {
                tipDialog: false,
                savingDialog: false,
                fillDialog: false,
                isSave: true,
                isOffline: false,
                projName: ''
            }
        },
        computed: {
            id: function() {
                return this.$route.query.id || 0;
            },
            ...mapGetters([
                'projNameShare',
                'descriptionShare',
                'selectedCatsShare',
                'catTree',
                'catList',
                'timeTotal',
                'checkedCatsTree',
                'projtype'
            ])
        },
        created (){
            console.log(this.$route);
            if(this.id){
                this.isSave = false;
                console.log(this.$route.query.id);
            }
        },
        methods:{
            ...mapMutations ([
                'setProjNameShare',
                'initData',
                'updateCatList'
            ]),
            edit(){
                this.isSave = true;
            },
            validateProjName(){
                const vm =this;
                if (vm.projNameShare) {vm.tipDialog = true;}
                else {vm.fillDialog = true;}
            },
            saveProjName(){
                this.setProjNameShare(this);
                this.fillDialog = false;
            },
            createProjHistoryCats() {
                const vm = this;
                let projhistorycats = [];
                for (let cat of vm.catList) {
                    let { catName, parentId, timeCost, comment, description } = cat.category;
                    let obj = { catName, parentId, timeCost, comment, description };
                    Object.assign(obj, {
                        isChecked: vm.selectedCatsShare.find(selectedCat => selectedCat === cat.category.id) ? 1 : 0
                    })
                    obj.catId = cat.category.id;
                    projhistorycats.push(obj);
                }
                return projhistorycats;
            },
            async saveOrUpdate(){
                if (this.id){
                    await this.updateProject();
                } else {
                    await this.saveProject();
                }
            },
            async saveProject() {
                const { projNameShare, descriptionShare, timeTotal, projtype } = this;
                const vm = this;
                const newProj = {
                    projName: projNameShare,
                    description: descriptionShare,
                    timeTotal: timeTotal,
                    projtype: projtype,
                    projhistorycats: vm.createProjHistoryCats(),
                    created_at: getNowFormatDate(),
                    user: vm.$store.state.auth.id
                }

                vm.tipDialog = false;
                vm.savingDialog = true;

                const dbPromise = await createIndexedDB(DB_NAME_PROJ, STORE_NAME_PROJ);
                const projId = await addDataLocally(dbPromise, STORE_NAME_PROJ, newProj);
                dbPromise.close();

                await fetchApi('http://localhost:1337/projects', 'POST', newProj, projId).then(res => {
                    console.log(res);
                    if (res.ok) {
                        setTimeout(() => {
                            vm.savingDialog = false;
                            vm.initData();
                            vm.$router.replace('/project');
                        }, 1000);
                    }
                }).catch(async err => {

                    console.log(`Save a project failed:${err}`);

                    setTimeout(() => {
                        vm.savingDialog = false;
                        vm.isOffline = true;
                        vm.initData();
                        vm.$router.replace('/project');
                    }, 1000);
                });
            },
            async updateProject () {

                this.updateCatList();

                const vm = this;
                const { projNameShare, descriptionShare, timeTotal, catList, id, projtype } = this;
                const editProj = {
                    projName: projNameShare,
                    description: descriptionShare,
                    timeTotal: timeTotal,
                    projtype: projtype,
                    projhistorycats: catList,
                    user: this.$store.state.auth.id
                };
                const dbPromise = await createIndexedDB(DB_NAME_PROJ, STORE_NAME_PROJ, 1);
                await updateProj(dbPromise, id, editProj);
                dbPromise.close();

                this.tipDialog = false;
                this.savingDialog = true;

                // The project not be saved in database due to offline
                if (!catList[0].id){
                    await fetchApi('http://localhost:1337/projects', 'POST', editProj, id).catch(async err => {

                        console.log(`Update a project failed:${err}`);

                        setTimeout(() => {
                            vm.savingDialog = false;
                            vm.isOffline = true;
                            vm.initData();
                            vm.$router.replace('/project');
                        }, 1000);
                    });

                    return;
                }

                await axios.put('/projects/'+ id, {
                    projName: projNameShare,
                    description: descriptionShare,
                    timeTotal: timeTotal,
                    user: this.$store.state.auth.id
                }).then((res) => {
                    console.log(res);
                    vm.updateProjHistoryCats();
                }).catch(async err=>{
                    console.log(`update a project failed:${err}`);

                    setTimeout(() => {
                        vm.savingDialog = false;
                        vm.isOffline = true;
                        vm.initData();
                        vm.$router.replace('/project');
                    }, 1000);
                });
            },
            async updateProjHistoryCats() {
                const vm = this;

                this.tipDialog = false;

                console.log(this.selectedCatsShare);

                vm.updateCatList();

                console.log(this.catList);

                await axios.put('/projhistorycats', this.catList)
                .then((res) => {
                    setTimeout(() => {
                        vm.savingDialog = false;
                        vm.initData();
                        vm.$router.replace('/project');
                    }, 1000);
                });
            },
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
    .content{
        padding: 3px;
        border: 1px dashed rgba(30, 33, 37, 0.37);
        border-radius: 3px;
    }
</style>
