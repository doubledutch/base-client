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

import { prettifyAttendee, prettifyCustomItem, prettifyExhibitor, prettifySession, prettifySpeaker } from './transforms'

export default function api(getToken, rootUrl, eventId) {
  if (!rootUrl.endsWith('/')) rootUrl = rootUrl + '/'

  function mobileApi(method, url, body) {
    url = `${rootUrl}${url}${url.indexOf('?') < 0 ? '?' : '&'}isbundlecredentials=true&applicationid=${eventId}`
    return getToken()
    .then(token => fetch(url, {
      method,
      body,
      headers: {
        authorization: `Bearer ${token}`,
        'X-DDAPI-Version':'7.0.0.0'
      }
    }))
    .then(res => res.json())
    .then(envelope => {
      if (envelope.IsSuccess) {
        return envelope.Value
      } else {
        throw new Error(envelope.Message)
      }
    })
  }

  const get = url => mobileApi('GET', url)

  return {
    getAttendee(id) {
      return get(`users/${id}`).then(val => val[0]).then(prettifyAttendee)
    },
    getAttendees() {
      return get('users/').then(val => val.map(prettifyAttendee))
    },
    getLeaderboardAttendees(count) {
      count = +count || 20
      return get(`users/?count=${count}&so=Score&sd=Descending`).then(val => val.map(prettifyAttendee))
    },

    // Deprecated aliases for getAttendee(s)
    getUser(userId) {
      return get(`users/${userId}`).then(val => val[0]).then(prettifyAttendee)
    },
    getUsers() {
      return get('users/').then(val => val.map(prettifyAttendee))
    },
    async getCustomItems() {
      return (await getItemsOfType('Regular')).map(prettifyCustomItem)
    },
    async getCustomItem(id) {
      return prettifyCustomItem(await getItem(id))
    },
    async getExhibitors() {
      return (await getItemsOfType('Exhibitor')).map(prettifyExhibitor)
    },
    async getExhibitor(id) {
      return prettifyExhibitor(await getItem(id))
    },
    async getSessions() {
      return (await getItemsOfType('Agenda')).map(prettifySession)
    },
    async getSession(id) {
      return prettifySession(await getItem(id))
    },
    async getSpeakers() {
      return (await getItemsOfType('Speakers')).map(prettifySpeaker)
    },
    async getSpeaker(id) {
      return prettifySpeaker(await getItem(id))
    },
    getSignedToken() {
      return get('users/me/token')
    }
  }
}

async function getItemsOfType(type) {
  const lists = await get('lists/')
  const itemArrays = await Promise.all(lists.filter(x => x.Type === type).map(list => get(`lists/${lists.Id}/items`)))
  return Array.concat.apply(null, itemArrays)
}

function getItem(id) {
  return get(`items/${id}`).then(items => items[0])
}

const withoutLinks = exh => ({...exh, Links: undefined})
export function emulatedApi() {
  return {
    getAttendee(userId) {
      userId = userId == null ? null : userId.toString()
      if (emulatedUsers[userId]) return Promise.resolve(emulatedUsers[userId]).then(prettifyAttendee)
      return Promise.reject(objectNotFound)
    },
    getAttendees() {
      return Promise.resolve(Object.keys(emulatedUsers).map(id => prettifyAttendee(emulatedUsers[id])))
    },
    getUser() { throw new Error('getUser is deprecated. Please call getAttendee') },
    getUsers() { throw new Error('getUsers is deprecated. Please call getAttendees') },
    getLeaderboardAttendees(count) {
      count = +count || 20
      const attendees = Object.keys(emulatedUsers).map(id => prettifyAttendee(emulatedUsers[id]))
      return Promise.resolve(attendees.slice(0,count).map((a,i) => ({...a, score: 50 - 7*i})))
    },
    getCustomItems() {
      return Promise.resolve(Object.keys(emulatedCustomItems).map(id => prettifyCustomItem(emulatedCustomItems[id])))
    },
    getCustomItem(id) {
      return Promise.resolve(prettifyCustomItem(emulatedCustomItems[id]))
    },
    getExhibitors() {
      return Promise.resolve(Object.keys(emulatedExhibitors).map(id => prettifyExhibitor(withoutLinks(emulatedExhibitors[id]))))
    },
    getExhibitor(id) {
      return Promise.resolve(prettifyExhibitor(withoutLinks(emulatedExhibitors[id])))
    },
    getSessions() {
      return Promise.resolve(Object.keys(emulatedSessions).map(id => prettifySession(emulatedSessions[id])))
    },
    getSessions(id) {
      return Promise.resolve(prettifySession(emulatedSessions[id]))
    },
    getSpeakers() {
      return Promise.resolve(Object.keys(emulatedSpeakers).map(id => prettifySpeaker(emulatedSpeakers[id])))
    },
    getSpeaker(id) {
      return Promise.resolve(prettifySpeaker(emulatedSpeakers[id]))
    },
    getSignedToken() {
      return Promise.resolve('')
    }
  }
}

export const emulatedUsers = {
  '24601': {
    Id: '24601',
    ImageUrl: 'https://images.amcnetworks.com/bbcamerica.com/wp-content/blogs.dir/55/files/2012/12/Hugh-Jackman-Les-Miserables.jpg',
    UserName: 'jean@valjean.com',
    EmailAddress: 'jean@valjean.com',
    UserIdentifierId: 'jvj24601',
    FirstName: 'Jean',
    LastName: 'Valjean',
    Title: 'Character',
    Company: 'Les Misérables',
    TierId: 123,
    TwitterUserName: 'lesmisofficial',
    ExhibitorAdminId: 'EXH1'
  },
  '1234': {
    Id: '1234',
    ImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Ebcosette.jpg',
    UserName: 'cosette@thenardier.hotel',
    EmailAddress: 'cosette@thenardier.hotel',
    UniqueIdentifier: 'cosette1862',
    FirstName: 'Cosette',
    LastName: 'Pontmercy',
    Title: 'Character',
    Company: 'Les Misérables',
    ExhibitorStaffId: 'EXH1'
  },
  '5678': {
    Id: '5678',
    ImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Marius_sees_Cosette.jpg',
    UserName: 'marius@revolution.fr',
    EmailAddress: 'marius@revolution.fr',
    UniqueIdentifier: 'marius1862',
    FirstName: 'Marius',
    LastName: 'Pontmercy',
    Title: 'Character',
    Company: 'Les Misérables'
  }
}

const emulatedCustomItems = {
  'CUS1': {
    Id: 'CUS1',
    ImageUrl: 'http://www.lesmis.com/wp-content/themes/lesmis-landing/images/logos/ft-logo.png',
    Name: 'Les Misérables',
    Description: 'Seen by over 20 million people'
  }
}

export const emulatedExhibitors = {
  'EXH1': {
    Id: 'EXH1',
    ImageUrl: 'http://g-ec2.images-amazon.com/images/G/01/social/api-share/amazon_logo_500500.png',
    Name: 'Amazon',
    Description: 'Books and More',
    Website: 'https://www.amazon.com/Miserables-Hugh-Jackman/dp/B00BI5IXL4',
    FacebookUrl: 'https://www.facebook.com/Amazon/',
    LinkedInUrl: 'https://www.linkedin.com/company/1586/',
    Twitter: 'amazon',
    EmailAddress: 'support@amazon.com',
    PhoneNumber: '555-5555',
    Links: [{Name: 'White paper', Id: 4, Url: 'https://www.amazon.com/white-paper/s?k=white+paper'}]
  }
}

const emulatedSpeakers = {
  'SPK1': {
    Id: 'SPK1',
    FirstName: 'Victor',
    LastName: 'Hugo',
    ImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Victor_Hugo_by_%C3%89tienne_Carjat_1876_-_full.jpg/220px-Victor_Hugo_by_%C3%89tienne_Carjat_1876_-_full.jpg',
    Website: 'https://en.wikipedia.org/wiki/Victor_Hugo',
    Description: 'French poet, novelist, and dramatist of the Romantic movement'
  }
}

const emulatedSessions = {
  'SES1': {
    Id: 'SES1',
    Name: 'Dinner',
    Location: "Thenardier's hotel",
    StartDate: '2018-01-01T18:00:00Z',
    EndDate: '2018-01-01T20:00:00Z',
  }
}

const objectNotFound = {
  message: 'Object Not Found'
}
