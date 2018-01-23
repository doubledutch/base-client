import { prettifyAttendee, prettifyCustomItem, prettifyExhibitor, prettifySession, prettifySpeaker } from './transforms'

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
    },
    getUsers() {
      return get('users/').then(val => val.map(prettifyAttendee))
    },
    async getCustomItems() {
      return (await getItemsOfType('Regular')).map(prettifyCustomItem)
    },
    async getExhibitors() {
      return (await getItemsOfType('Exhibitor')).map(prettifyExhibitor)
    },
    async getSessions() {
      return (await getItemsOfType('Agenda')).map(prettifySession)
    },
    async getSpeakers() {
      return (await getItemsOfType('Speakers')).map(prettifySpeaker)
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

export function emulatedApi() {
  return {
    getUser(userId) {
      userId = userId == null ? null : userId.toString()
      if (emulatedUsers[userId]) return Promise.resolve(emulatedUsers[userId]).then(prettifyAttendee)
      return Promise.reject(objectNotFound)
    },
    getUsers() {
      return Promise.resolve(Object.keys(emulatedUsers).map(id => prettifyAttendee(emulatedUsers[id])))
    },
    getCustomItems() {
      return Promise.resolve(Object.keys(emulatedCustomItems).map(id => prettifyCustomItem(emulatedCustomItems[id])))
    },
    getExhibitors() {
      return Promise.resolve(Object.keys(emulatedExhibitors).map(id => prettifyExhibitor(emulatedExhibitors[id])))
    },
    getSessions() {
      return Promise.resolve(Object.keys(emulatedSessions).map(id => prettifySession(emulatedSessions[id])))
    },
    getSpeakers() {
      return Promise.resolve(Object.keys(emulatedSpeakers).map(id => prettifySpeaker(emulatedSpeakers[id])))
    },
    getSignedToken() {
      return Promise.resolve('')
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
    Company: 'Les Misérables'
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

const emulatedExhibitors = {
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
    PhoneNumber: '555-5555'
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
