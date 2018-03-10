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
  if (apiRoot.startsWith('https://purple.api.doubledutch.me')) return 'purple'
}
