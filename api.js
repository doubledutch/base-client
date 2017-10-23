import { prettifyAttendee } from './transforms'

export default function api(getToken, rootUrl, eventId) {
  if (!rootUrl.endsWith('/')) rootUrl = rootUrl + '/'
  function get(url) {
    url = `${rootUrl}${url}${url.indexOf('?') < 0 ? '?' : '&'}isbundlecredentials=true&applicationid=${eventId}`
    return getToken()
    .then(token => fetch({
      url,
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

  return {
    getUser(userId) {
      return get(`users/${userId}`).then(val => val[0]).then(prettifyAttendee)
    }
  }
}

export function emulatedApi() {
  return {
    getUser(userId) {
      userId = userId == null ? null : userId.toString()
      if (emulatedUsers[userId]) return Promise.resolve(emulatedUsers[userId]).then(prettifyAttendee)
      return Promise.reject(objectNotFound)
    }
  }
}

const emulatedUsers = {
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
    TwitterUserName: 'lesmisofficial'
  }
}

const objectNotFound = {
  message: 'Object Not Found'
}
