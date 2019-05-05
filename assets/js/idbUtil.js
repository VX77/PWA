import {openDB} from "idb";

const DB_NAME_TYPE = "types-db";
const DB_NAME_CATCONFIG = "configcats-db";
const DB_NAME_PROJ = "projects-db";

const STORE_NAME_TYPE = "types";
const STORE_NAME_CATCONFIG = "configcats";
const STORE_NAME_PROJ = "projects";

async function createIndexedDB(dbName, storeName, version=1, ...indexs) {
    if (!('indexedDB' in window)) {
        return null;
    }
    return await openDB(dbName, version, {
        upgrade(db) {

            console.log(`version=${version}`);

            console.log(`storeName=${storeName}`);

            if (!db.objectStoreNames.contains(storeName)) {

                const store = db.createObjectStore(storeName, {
                    keyPath: 'id',
                    autoIncrement: true

                });

                if (storeName == 'projects') {
                    console.log('create a index');
                    store.createIndex('createdAtIndex', 'created_at', {unique: false});
                    store.createIndex('projNameIndex', 'projName', {unique: false});
                }
            }


        }
    });
}

async function saveDataLocally(db, storeName, datas) {
    if (!('indexedDB' in window)) {return null;}
    // console.log(db);
    const tx = db.transaction(storeName, 'readwrite');
    tx.store.clear();
    for (let data of datas) {
        // console.log(data);
        tx.store.add(data);
    }
    await tx.done;
}

async function addDataLocally(db, storeName, data) {
    if (!('indexedDB' in window)) {return null;}
    // console.log(db);
    const tx = db.transaction(storeName, 'readwrite');
    let dataKey = null;
    tx.store.add(data).then(res=>{
        dataKey = res;
    });
    await tx.done;
    return dataKey;
}

function fetchApi(url , method, data, markId = '') {
    console.log('markId', markId);
    const headers = new Headers(
        {'Content-Type': 'application/json', 'X-Mark-Id': markId}
    );
    const body = JSON.stringify(data);
    return fetch(url, {
        method: method,
        headers: headers,
        body: body
    });
}

async function getLocalData(db, storeName) {
    return await db.getAll(storeName);
}

async function updateProj(db, id, proj){
    const tx = db.transaction('projects','readwrite');
    const store= tx.store;
    let cursor = await store.openCursor();
    console.log('id',typeof id);
    while(cursor){
        console.log('key',typeof cursor.key);
        console.log(cursor.key === parseInt(id));
        if (cursor.key === parseInt(id)){
            // cursor.value = proj;
            Object.assign(proj, {
                id: parseInt(id),
                created_at: cursor.value.created_at
            });
            console.log(proj);
            const request = cursor.update(proj);
            request.onsuccess = function() {
                console.log(`update success`);
            };
            break;
        }
        cursor = await cursor.continue();
    }
    await tx.done;

}

async function getProjsByDate(db){
    return await db.getAllFromIndex('projects', 'createdAtIndex');
}

async function searchProjs(db, query){
    let datas = await getProjsByDate(db);
    datas.reverse();
    console.log(query.projName);
    let projs = [];
    if (query.projName) {
        projs = datas.filter(data=> (data.projName.indexOf(query.projName)!==-1));
    }else{
        projs = datas;
    }
    return projs.filter(data => (validateTime(data.created_at, query.startTime, query.endTime)));
}

function validateTime(time, startTime, endTime){
    console.log(time.split('T')[0]);
    console.log(startTime);
    if (new Date(time.split('T')[0]) >= new Date(startTime) &&
        new Date(time.split('T')[0]) <= new Date(endTime)) {
        return true;
    }else{
        return false;
    }
}
/* Storage functions */

function getLastUpdated() {
    return localStorage.getItem('lastUpdated');
}

function setLastUpdated(date) {
    localStorage.setItem('lastUpdated', date);
}

export {
    createIndexedDB,
    saveDataLocally,
    getLocalData,
    getProjsByDate,
    searchProjs,
    setLastUpdated,
    getLastUpdated,
    addDataLocally,
    fetchApi,
    updateProj,
    DB_NAME_TYPE,
    DB_NAME_CATCONFIG,
    DB_NAME_PROJ,
    STORE_NAME_TYPE,
    STORE_NAME_CATCONFIG,
    STORE_NAME_PROJ
}