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

import { prettifyAttendee } from './transforms'

export default function api(getToken, region, eventId) {
  const rootUrl = getRootUrl(region)

  function cmsApi(method, url, body) {
    url = `${rootUrl}${url}${url.indexOf('?') < 0 ? '?' : '&'}currentapplicationid=${eventId}`
    return getToken()
    .then(token => fetch({
      url,
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {authorization: `Bearer ${token}`}
    }))
    .then(res => {
      if (!res.ok) throw new Error(res.status)
      return res.json()
    })
  }

  const get = url => cmsApi('GET', url)
  const post = (url, body) => cmsApi('POST', url, body)
  const put = (url, body) => cmsApi('PUT', url, body)
  const del = (url, body) => cmsApi('DELETE', url, body)

  return {
    getExhibitorStaff(exhibitorId) {
      return get(`exhibitors/${exhibitorId}/staff`).then(attendees => attendees.map(prettifyAttendee))
    },
    createExhibitorStaff(exhibitorId, userId) {
      return post(`exhibitors/${exhibitorId}/staff`, userId)
    },
    deleteExhibitorStaff(exhibitorId, userId) {
      return del(`exhibitors/${exhibitorId}/staff`, userId)
    },
  }
}

export function emulatedCmsApi() {
  return {
    getExhibitorStaff() {
      return Promise.resolve([])
    },
    createExhibitorStaff(exhibitorId, userId) {
      return Promise.resolve()
    },
    deleteExhibitorStaff(exhibitorId, userId) {
      return Promise.resolve()
    },
  }
}

function getRootUrl(region) {
  switch (region) {
    case 'us': return 'https://cms.doubledutch.me/api/'
    case 'eu': return 'https://cms.eu.doubledutch.me/api/'
    case 'qa': return 'https://qa.cms.doubledutch.me/api/'  
    case 'purple': return 'https://purple.cms.doubledutch.me/api/'
  }
}
