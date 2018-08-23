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

import { prettifyAttendee, prettifyExhibitor } from './transforms'
import {emulatedExhibitors, emulatedUsers} from './api'

export default function api(getToken, region, eventId, postBase64File) {
  const rootUrl = getRootUrl(region)

  function cmsApi(method, url, body) {
    url = `${rootUrl}${url}${url.indexOf('?') < 0 ? '?' : '&'}currentApplicationId=${eventId}`
    return getToken()
    .then(token => {
      const fetchConfig = {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
      if (body) fetchConfig.body = JSON.stringify(body)
      return fetch(url, fetchConfig)
    })
    .then(res => {
      if (!res.ok) throw new Error(res.status)
      return res.json()
    })
  }

  const get = url => cmsApi('GET', url)
  const post = (url, body) => cmsApi('POST', url, body)
  const put = (url, body) => cmsApi('PUT', url, body)
  const del = (url, body) => cmsApi('DELETE', url, body)

  const postBase64TempFile = (url, headers, base64File) => postBase64File(url, headers, base64File)
    .then(res => res.json())
    .then(json => json.Path)

  return {
    getExhibitorStaff(exhibitorId) {
      return get(`exhibitors/${exhibitorId}/staff`).then(attendees => attendees.map(prettifyAttendee))
    },
    createExhibitorStaff(exhibitorId, attendeeId) {
      return post(`exhibitors/${exhibitorId}/staff`, attendeeId)
    },
    deleteExhibitorStaff(exhibitorId, attendeeId) {
      return del(`exhibitors/${exhibitorId}/staff`, attendeeId)
    },
    getAttendeeForExhibitor(exhibitorId, attendeeId) {
      return get(`users/${attendeeId}/forexhibitor/${exhibitorId}`).then(prettifyAttendee)
    },
    updateExhibitorImage(exhibitorId, base64File) {
      // Upload file, GET exhibitor, point to temp URL of uploaded image, PUT exhibitor.
      return getToken()
      .then(token => postBase64TempFile(`${rootUrl}items/${exhibitorId}/uploadimage?currentApplicationId=${eventId}`, {authorization: `Bearer ${token}`}, base64File))
      .then(path => {
        return get(`items/${exhibitorId}`)
        .then(exhib => {
          exhib.ImageUrl = path
          return put(`items/${exhibitorId}`, exhib).then(prettifyExhibitor)
        })
      })
    },
    getFullExhibitor(exhibitorId) {
      return get(`items/${exhibitorId}`).then(prettifyExhibitor)
    },
    updateExhibitor(exhibitorId, updates) {
      get(`items/${exhibitorId}`)
      .then(exhib => {
        updateExhibitorFields(exhib, updates)
        return put(`items/${exhibitorId}`, exhib).then(prettifyExhibitor)
      })
    },
    addExhibitorFile(exhibitorId, base64File) {
      return getToken()
      .then(token => postBase64TempFile(`${rootUrl}items/${exhibitorId}/uploadfile?currentApplicationId=${eventId}`, {authorization: `Bearer ${token}`}, base64File))
      .then(path => {
        get(`items/${exhibitorId}`)
        .then(exhib => {
          exhib.Links.push({Name: getUniqueFileName(), Url: path})
          return put(`items/${exhibitorId}`, exhib).then(prettifyExhibitor)
        })
      })
    },
    addExhibitorFileFromLink(exhibitorId, url, name) {
      return get(`items/${exhibitorId}`)
      .then(exhib => {
        exhib.Links.push({Name: name || getUniqueFileName(), Url: url})
        return put(`items/${exhibitorId}`, exhib).then(prettifyExhibitor)
      })
    },
    renameExhibitorFile(exhibitorId, fileId, name) {
      if (!fileId) return Promise.reject(new Error('file ID not specified'))
      get(`items/${exhibitorId}`)
      .then(exhib => {
        const link = exhib.Links.filter(x => x.Id == fileId)
        if (link) {
          link.Name = name
          return put(`items/${exhibitorId}`, exhib).then(prettifyExhibitor)
        }
        return Promise.reject(new Error('exhibitor link not found'))
      })
    },
    removeExhibitorFile(exhibitorId, fileId) {
      if (!fileId) return Promise.reject(new Error('file ID not specified'))
      get(`items/${exhibitorId}`)
      .then(exhib => {
        exhib.Links = exhib.Links.filter(x => x.Id != fileId)
        return put(`items/${exhibitorId}`, exhib).then(prettifyExhibitor)
      })
    }
  }
}

let uniqueFileNameIndex = 0
function getUniqueFileName () {
  return `File ${++uniqueFileNameIndex}`
}

export function emulatedCmsApi() {
  return {
    getExhibitorStaff(exhibitorId) {
      return Promise.resolve([])
    },
    createExhibitorStaff(exhibitorId, userId) {
      return Promise.resolve()
    },
    deleteExhibitorStaff(exhibitorId, userId) {
      return Promise.resolve()
    },
    getAttendeeForExhibitor(exhibitorId, attendeeId) {
      return Promise.resolve(prettifyAttendee(emulatedUsers[attendeeId]))
    },
    updateExhibitorImage(exhibitorId, base64File) {
      return Promise.resolve(prettifyExhibitor(emulatedExhibitors[exhibitorId]))
    },
    getFullExhibitor(exhibitorId) {
      return Promise.resolve(prettifyExhibitor(emulatedExhibitors[exhibitorId]))
    },
    updateExhibitor(exhibitorId, updates) {
      const exhib = emulatedExhibitors[exhibitorId]
      updateExhibitorFields(exhib, updates)
      return Promise.resolve(prettifyExhibitor(exhib))
    },
    addExhibitorFile(exhibitorId, base64File) {
      return Promise.resolve(prettifyExhibitor(emulatedExhibitors[exhibitorId]))
    },
    addExhibitorFileFromLink(exhibitorId, url, name) {
      return Promise.resolve(prettifyExhibitor(emulatedExhibitors[exhibitorId]))
    },
    renameExhibitorFile(exhibitorId, fileId, name) {
      return Promise.resolve(prettifyExhibitor(emulatedExhibitors[exhibitorId]))
    },
    removeExhibitorFile(exhibitorId, fileId) {
      return Promise.resolve(prettifyExhibitor(emulatedExhibitors[exhibitorId]))
    }
  }
}

function updateExhibitorFields(exhib, {description, website, email, phone, facebook, linkedin, twitter}) {
  if (description) exhib.Description = description
  if (website) exhib.Website = website
  if (facebook) exhib.FacebookUrl = facebook
  if (linkedin) exhib.LinkedInUrl = linkedin
  if (twitter) exhib.Twitter = twitter
  if (email) exhib.Email = email
  if (phone) exhib.Phone = phone
}

function getRootUrl(region) {
  switch (region) {
    case 'us': return 'https://cms.doubledutch.me/api/'
    case 'eu': return 'https://cms.eu.doubledutch.me/api/'
    case 'qa': return 'https://qa.cms.doubledutch.me/api/'  
    case 'purple': return 'https://purple.cms.doubledutch.me/api/'
  }
}
