
<template>
    <v-container
            fluid
            grid-list-lg
    >

        <v-layout row wrap>
            <v-flex xs12>
                <v-card color="white">
                    <v-card-text>
                        <v-text-field class="mx-auto"
                                      color="themeColor"
                                      label="Project name"
                                      v-model="projName"
                        ></v-text-field>
                        <v-text-field
                                color="themeColor"
                                label="Some more info you want tell us"
                                append-icon="edit"
                                v-model="description"
                        ></v-text-field>
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs12>
                <v-card color="white" >
                    <v-card-text v-for="(cat,index) in catTree"
                                 :key="index">
                        <v-layout column>
                            <v-flex xs12>
                                <h2 class="themeColor--text">{{index+1}}.{{cat.category ? cat.category.catName : cat.catName}}</h2>
                            </v-flex>
                            <v-flex xs12
                                    v-for="(child,j) in cat.childNodes"
                                    :key="j">
                                <v-layout row>
                                    <v-flex xs10 class="checkboxMargin">
                                        <v-checkbox v-model="selectedCats"
                                                    :label="`${child.category ? child.category.catName : child.catName}`"
                                                    :value="child.category ? child.category.id : (child.id?child.id:child.catId)"
                                                    hide-details
                                                    class="checkboxHeight"></v-checkbox>
                                    </v-flex>
                                    <v-flex xs2>
                                        <div class="timeCost"
                                             @click="changeTimeCost(child,index,j)">
                                            {{child.category ? child.category.timeCost : child.timeCost}}h
                                        </div>
                                    </v-flex>
                                </v-layout>

                            </v-flex>
                        </v-layout>

                    </v-card-text>
                    <v-layout ma-0
                              column
                              px-1>
                        <v-flex xs12>
                            <v-divider></v-divider>
                        </v-flex>
                        <v-flex xs12
                                align-self-end>
                            <div>
                                <span class="grey--text text--darken-1">Total Time: </span>
                                <span class="grey--text text--darken-1">{{timeTotal || '0'}} h</span>
                            </div>
                        </v-flex>
                    </v-layout>
                    <v-layout column
                              align-center
                              justify-center
                              pb-2>
                        <v-btn class="themeColor btn white--text mx-auto" @click="preview">Preview</v-btn>
                    </v-layout>
                </v-card>
            </v-flex>
        </v-layout>

        <v-dialog v-model="timeCostDialog"
                  persistent
                  max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Change Time Cost</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12>
                                <v-subheader class="pl-0">Time Cost Value</v-subheader>
                                <v-slider
                                        v-model="slider"
                                        :thumb-size="24"
                                        thumb-label="always"
                                        thumb-color="green darken-1"
                                ></v-slider>
                            </v-flex>
                            <v-flex xs12>
                                <v-textarea
                                        v-model="comment"
                                        outline
                                        label="Comment"
                                        value=""
                                        color="green darken-1"
                                ></v-textarea>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat @click="timeCostDialog = false">Close</v-btn>
                    <v-btn color="green darken-1" flat @click="saveTimeCost">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>
    import axios from '~/plugins/axios'
    import { createIndexedDB, saveDataLocally, getLocalData, DB_NAME_CATCONFIG, STORE_NAME_CATCONFIG } from 'assets/js/idbUtil'
    import { createNamespacedHelpers } from 'vuex'
    import { copyList } from 'assets/js/util'
    const { mapMutations, mapGetters } = createNamespacedHelpers('newProj')


    export default {
        layout: 'common',
        // middleware: 'authenticated',
        data () {
            return {
                projName: "",
                description: "",
                selectedCats:[],
                warning: false,
                timeCostDialog: false,
                slider: 10,
                comment: '',
                parentIndex: -1,
                childIndex: -1,
                changedCatId: -1
            }
        },
        computed:{
            type: function() {
                return this.$route.query.type || '';
            },
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
        async created () {

            console.log('it is detail page');

            const vm = this;

            if (!vm.type && !vm.id) {
                vm.$router.replace({path:'/chooseType'});
            }

            this.setProjtype(vm);

            if (vm.projNameShare) {
                vm.projName = vm.projNameShare;
            }

            if (vm.descriptionShare) {
                vm.description = vm.descriptionShare;
            }

            if (vm.selectedCatsShare.length){
                console.log('selectedCatsShare',vm.selectedCatsShare);
                vm.selectedCats = vm.selectedCatsShare;
            }

            if (!vm.catList.length && vm.type) {

                let CURRENT_VERSION = await vm.getDbVersion() || 1;

                let dbPromise = await createIndexedDB(DB_NAME_CATCONFIG, `${DB_NAME_CATCONFIG}-${vm.type}`, CURRENT_VERSION);

                if(!dbPromise.objectStoreNames.contains(`${DB_NAME_CATCONFIG}-${vm.type}`)){
                    dbPromise.close();
                    dbPromise = await createIndexedDB(DB_NAME_CATCONFIG, `${DB_NAME_CATCONFIG}-${vm.type}`, CURRENT_VERSION + 1);
                }

                const configcats = await getLocalData(dbPromise, `${DB_NAME_CATCONFIG}-${vm.type}`);
                vm.setCatList(configcats);
                vm.convertToCatTree(vm.catList);

                await vm.getCatConfigs().then(async (data) => {
                    if (JSON.stringify(configcats) !== JSON.stringify(data)) {
                        console.log('data changed');
                        vm.setCatList(data);
                        vm.convertToCatTree(vm.catList);
                        await saveDataLocally(dbPromise, `${DB_NAME_CATCONFIG}-${vm.type}`, data);
                    }
                }).catch(async err => {
                    console.log('Network requests have failed, this is expected if offline');
                });
            }

        },
        watch: {
            selectedCats () {
                this.setSelectedCatsShare(this.selectedCats);
                this.sumTotatTime();
            }
        },
        methods: {
            ...mapMutations ([
                'setProjNameShare',
                'setDescriptionShare',
                'setSelectedCatsShare',
                'setCatTree',
                'setCatTreeNode',
                'setCatList',
                'setCatListNode',
                'setTimeTotal',
                'calculateTimeTotal',
                'setCheckedCatsTree',
                'convertToCatTree',
                'convertCheckedCatTree',
                'initData',
                'setProjtype'
            ]),
            convertCheckedCatsToTree () {
                const vm = this;
                let copyCatTree = copyList(vm.catTree);
                for (let copyCat of copyCatTree){
                    copyCat.childNodes = copyList(copyCat.childNodes);
                }
                for (let i=0; i < copyCatTree.length;) {
                    for (let j=0; j< copyCatTree[i].childNodes.length; ) {
                        if (!vm.selectedCats.find(selectedCat => {
                            if (copyCatTree[i].childNodes[j].category) {
                                return selectedCat === copyCatTree[i].childNodes[j].category.id
                            } else {
                                return selectedCat === copyCatTree[i].childNodes[j].id
                            }
                        })) {
                            copyCatTree[i].childNodes.splice(j,1);
                            j=0;
                        }else{
                            j++;
                        }
                    }
                    if (copyCatTree[i].childNodes.length === 0) {
                        copyCatTree.splice(i,1);
                        i=0;
                    }else{
                        i++;
                    }
                }
                vm.setCheckedCatsTree(copyCatTree);
            },
            changeTimeCost (cat, parentIndex, childIndex) {
                this.parentIndex = parentIndex;
                this.childIndex = childIndex;
                this.timeCostDialog = true;
                this.slider = cat.category ? cat.category.timeCost : cat.timeCost;
                this.changedCatId = cat.id;
            },
            saveTimeCost () {
                let copyCatTree = copyList(this.catTree);
                const info = {
                    'id': this.changedCatId,
                    'parentIndex': this.parentIndex,
                    'childIndex': this.childIndex,
                    'objs': {
                        'timeCost': this.slider,
                        'comment': this.comment
                    }
                }
                if (this.parentIndex!=-1 && this.childIndex != -1) {
                    this.setCatTreeNode(info);
                    this.setCatListNode(info);
                    this.sumTotatTime();
                }
                this.comment='';
                this.timeCostDialog = false;
                this.parentIndex = -1;
                this.childIndex = -1;
            },
            sumTotatTime () {
                const vm = this;
                vm.setTimeTotal(0);
                for (let i = 0; i < vm.selectedCats.length; i++) {
                    for (let cat of vm.catList) {
                        if (cat.category) {
                            if (cat.category.id === vm.selectedCats[i]) {
                                vm.calculateTimeTotal(cat.category.timeCost);
                                break;
                            }
                        } else {
                            if (cat.id === vm.selectedCats[i]) {
                                vm.calculateTimeTotal(cat.timeCost);
                                break;
                            }
                        }
                    }
                }
            },
            preview () {
                this.setProjNameShare(this);
                this.setDescriptionShare(this);
                this.setSelectedCatsShare(this.selectedCats);
                this.convertCheckedCatTree();
                const url = this.id ? `/preview?id=${this.id}` : '/preview';
                this.$router.push(url);
            },
            async getCatConfigs () {
                return await axios.get('/catconfigs', {
                    params: {
                        projtype: this.type,
                        isActive: 1
                    }
                }).then((res) => {
                    return res.data;
                })
            },
            async getDbVersion(){
                const databases = await window.indexedDB.databases();
                for (let db of databases) {
                    if (db.name === DB_NAME_CATCONFIG) {
                        return db.version;
                    }
                } 
            }
        }
    }
</script>

<style>
    .checkboxMargin *{
        margin-bottom: 0 !important;
        margin-top: 0 !important;
    }
    .checkboxHeight{
        /*height: 20px;*/
        padding: 0 !important;
    }
    .btn{
        width: 50%;
    }
    .timeCost{
        width: 40px;
        line-height: 22px;
        color: #6e7da2;
        border: 1.3px solid #6e7da2;
        border-radius: 22px;
        text-align: center;
        background-color: #fcf8f3;
    }
</style>
