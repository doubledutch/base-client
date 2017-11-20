import api, { emulatedApi } from './api'
import { prettifyAttendee, prettifyEvent } from './transforms'

export default function makeClient(DD) {
  function getToken() {
    return promisify(DD.requestAccessToken)
  }

  const ddapi = DD.isEmulated ? emulatedApi() : api(getToken, DD.apiRootURL, DD.currentEvent.EventId)

  const client = {
    ...ddapi, // merge all the functions that expose the DD API to this `client` object.
    currentEvent: prettifyEvent(DD.currentEvent),
    currentUser: prettifyAttendee(DD.currentUser),
    primaryColor: DD.primaryColor,
    region: getRegion(DD.apiRootURL),
    setTitle: DD.setTitle,
    getToken,
    openURL: DD.openURL,
    _b: DD
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
