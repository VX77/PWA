<template>
    <v-container grid-list-lg>
        <v-layout row wrap>
            <v-flex xs12
                    v-for="(type,index) in typeList"
                    :key="index">
                <v-card v-bind:class="[bgColor[index%bgColor.length],'darken-2']" class="white--text">
                    <v-card-title primary-title>
                        <div>
                            <div class="headline">{{type.typeName}}</div>
                            <!--<span>Listen to your favorite artists and albums whenever and wherever, online and offline.</span>-->
                        </div>
                    </v-card-title>
                    <v-card-actions>
                        <v-btn @click="goToDetail(type.id)" flat dark>Choose now</v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import axios from '~/plugins/axios'
    import { createIndexedDB, saveDataLocally, getLocalData, DB_NAME_TYPE, STORE_NAME_TYPE} from 'assets/js/idbUtil'
    import { createNamespacedHelpers } from 'vuex'
    const {  mapMutations } = createNamespacedHelpers('newProj')

    export default {
        name: "chooseType",
        layout: 'common',
        middleware: 'authenticated',
        data () {
            return {
                bgColor: [
                    'lime',
                    'blue-grey',
                    'teal',
                    'light-green'
                ],
                typeList: []
            }
        },
        async created(){

            const vm = this;
            const dbPromise = await createIndexedDB(DB_NAME_TYPE, STORE_NAME_TYPE);

            vm.typeList = await getLocalData(dbPromise, STORE_NAME_TYPE);

            console.log('typeList', vm.typeList);

            await vm.getProjTypes().then(async (data) => {
                if (JSON.stringify(vm.typeList) !== JSON.stringify(data)) {
                    console.log('data changed');
                    vm.typeList = data;
                    await saveDataLocally(dbPromise, 'types', vm.typeList);
                }
            }).catch(async err => {
                console.log('Network requests have failed, this is expected if offline');
            });

        },
        methods: {
            ...mapMutations ([
                'initData'
            ]),
            goToDetail (id) {
                this.initData();
                this.$router.push(`/detail?type=${id}`);
            },
            async getProjTypes () {
                return await axios.get('/projtypes', {
                    params: {
                        isActive: 1
                    }
                }).then((res) => {
                    return res.data;
                })
            }
        }
    }
</script>

<style scoped>
</style>
