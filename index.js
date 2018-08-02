/*
 * Copyright 2018 DoubleDutch, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import api, {emulatedApi} from './api'
import cmsApi, {emulatedCmsApi} from './cmsApi'
import { prettifyAttendee, prettifyEvent } from './transforms'

export default function makeClient(DD) {
  function getToken() {
    return promisify(DD.requestAccessToken)
  }
  function refreshToken() {
    return promisify(DD.refreshAccessToken || DD.requestAccessToken) // Refresh, or fall back to last token if unavailable.
  }

  // Use the native binding function, or fall back to the static object if the binding function isn't available.
  function getCurrentUser() {
    return promisify(DD.getCurrentUser || (cb => cb(null, DD.currentUser))).then(prettifyAttendee)
  }
  function getCurrentEvent() {
    return promisify(DD.getCurrentEvent || (cb => cb(null, DD.currentEvent))).then(prettifyEvent)
  }

  const region = getRegion(DD.apiRootURL)
  const ddapi = DD.isEmulated ? emulatedApi() : api(getToken, DD.apiRootURL, DD.currentEvent.EventId)
  const ddCmsApi = DD.isEmulated ? emulatedCmsApi() : cmsApi(getToken, region, DD.currentEvent.EventId)

  const client = {
    ...ddCmsApi,  // merge all the functions that expose the mobile and CMS APIs
    ...ddapi,     // to this `client` object.
    currentEvent: prettifyEvent(DD.currentEvent),
    currentUser: prettifyAttendee(DD.currentUser),
    primaryColor: DD.primaryColor,
    region,
    setTitle: DD.setTitle,
    getToken,
    refreshToken,
    openURL: DD.openURL,
    getCurrentUser,
    getCurrentEvent,
    logOut: DD.logOut,
    dismissLandingPage: DD.dismissLandingPage,
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
  if (apiRoot.startsWith('https://qa.api.doubledutch.me')) return 'qa'
  if (apiRoot.startsWith('https://purple.api.doubledutch.me')) return 'purple'
}
