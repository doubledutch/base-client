export default function makeClient(DD) {
  const client = {
    currentEvent: DD.currentEvent,
    currentUser: DD.currentUser,
    primaryColor: DD.primaryColor,
    region: getRegion(DD.apiRootURL),
    setTitle: DD.setTitle,
    getToken() { return promisify(DD.requestAccessToken) }
  }

  return client
}

function promisify(fn, ...args) {
  return new Promise((resolve, reject) =>
    fn(...args, (err, val) => err ? reject(err) : resolve(val))
  )
}

function getRegion(apiRoot) {
  if (apiRoot.startsWith('https://api.doubledutch.me')) return 'us'
  if (apiRoot.startsWith('https://api.eu.doubledutch.me')) return 'eu'
  if (apiRoot.startsWith('https://soep.doubledutch.me')) return 'soep'
  if (apiRoot.startsWith('https://qa.api.doubledutch.me')) return 'qa'
}