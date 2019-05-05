importScripts('https://cdn.jsdelivr.net/npm/workbox-cdn@4.1.1/workbox/workbox-sw.js')

// --------------------------------------------------
// Configure
// --------------------------------------------------

// Set workbox config
workbox.setConfig({
    "debug": false
})

// Start controlling any existing clients as soon as it activates
workbox.core.clientsClaim()

// Skip over the SW waiting lifecycle stage
// workbox.core.skipWaiting()

workbox.precaching.cleanupOutdatedCaches()

// --------------------------------------------------
// Precaches
// --------------------------------------------------
workbox.precaching.precacheAndRoute([]);
// Precache assets

// --------------------------------------------------
// Runtime Caching
// --------------------------------------------------


// background sync

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);

    self.addEventListener('install', function (e) {
        console.log('Service Worker 状态： install');
    });

    self.addEventListener('activate', function (e) {
        console.log('Service Worker 状态： activate');
    });

    const bgSyncPluginForCreate = new workbox.backgroundSync.Plugin('projects-create-queue', {
        onSync: async ({queue}) => {
            let savedProjId = [];
            let entry;
            while (entry = await queue.shiftRequest()) {
                const markId = entry.request.headers.get('X-Mark-Id');
                try {
                    if (savedProjId.indexOf(markId) ===-1){
                        console.log('fetch the first time');
                        savedProjId.push(markId);
                        await fetch(entry.request);
                    }
                } catch (error) {
                    console.error('Replay failed for request', entry.request, error);
                    await this.unshiftRequest(entry);
                    return;
                }
            }
        }
    });

    const bgSyncPluginForUpdate = new workbox.backgroundSync.Plugin('projects-update-queue');

    const networkWithBackgroundSyncForCreate = new workbox.strategies.NetworkOnly({
        plugins: [bgSyncPluginForCreate],
    });

    const networkWithBackgroundSyncForUpdate = new workbox.strategies.NetworkOnly({
        plugins: [bgSyncPluginForUpdate],
    });

    workbox.routing.registerRoute(
        /http:\/\/localhost:1337\/projects/,
        networkWithBackgroundSyncForCreate,
        'POST'
    );

    workbox.routing.registerRoute(
        /http:\/\/localhost:1337\/projects\/*/,
        networkWithBackgroundSyncForUpdate,
        'PUT'
    );

    workbox.routing.registerRoute(
        /http:\/\/localhost:1337\/projhistorycats/,
        networkWithBackgroundSyncForUpdate,
        'PUT'
    );

    workbox.routing.registerRoute(new RegExp('/_nuxt/(?!.*(__webpack_hmr|hot-update))'), new workbox.strategies.CacheFirst ({}), 'GET')
    workbox.routing.registerRoute(new RegExp('/(?!.*(__webpack_hmr|hot-update))'), new workbox.strategies.NetworkFirst ({}), 'GET')

} else {
    console.log(`Boo! Workbox didn't load 😬`);
}

