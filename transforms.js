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

export function prettifyAttendee(user) {
  if (!user) return null
  const id = user.UserId || user.Id
  const attendee = deleteUndefinedKeys({
    id: id && `${id}`,
    identifier: user.UserIdentifierId,
    firstName: user.FirstName,
    lastName: user.LastName,
    title: user.Title,
    company: user.Company,
    email: user.EmailAddress,
    image: user.ImageUrl,
    score: user.Score,
    userGroupIds: (typeof user.UserGroups === 'string')
      ? user.UserGroups.split(',').map(g => +g) 
      : (user.UserGroups || []),
    tierId: user.TierId || 'default',
    twitter: user.TwitterUserName,
    linkedin: user.LinkedInId,
    facebook: user.FacebookUserId,
    exhibitorAdminId: user.ExhibitorAdminId,
    exhibitorStaffId: user.ExhibitorStaffId,
  })

  if (user.ExhibitorAdminId) attendee.exhibitorAdminId = `${user.ExhibitorAdminId}`
  if (user.ExhibitorStaffId) attendee.exhibitorStaffId = `${user.ExhibitorStaffId}`

  return attendee
}

export function prettifyEvent(event) {
  if (!event) return null
  return deleteUndefinedKeys({
    id: event.EventId,
    name: event.Name,
    startDate: event.StartDate,
    endDate: event.EndDate,
    description: event.Description,
    appId: event.BundleId
  })
}

export function prettifyCustomItem(item) {
  if (!item) return null
  return deleteUndefinedKeys({
    id: `${item.Id}`,
    name: item.Name,
    image: item.ImageUrl,
    description: item.Description
  })
}

export function prettifyExhibitor(item) {
  if (!item) return null
  return deleteUndefinedKeys({
    id: `${item.Id}`,
    name: item.Name,
    image: item.ImageUrl,
    description: item.Description,
    website: item.Website,
    facebook: item.FacebookUrl,
    linkedin: item.LinkedInUrl,
    twitter: item.Twitter,
    email: item.EmailAddress || item.Email,
    phone: item.PhoneNumber || item.Phone,
    files: item.Links ? item.Links.map(x => ({name: x.Name, id: x.Id, url: x.Url})) : undefined
  })
}

export function prettifySpeaker(item) {
  if (!item) return null
  return deleteUndefinedKeys({
    id: `${item.Id}`,
    firstName: item.FirstName,
    lastName: item.LastName,
    image: item.ImageUrl,
    description: item.Description,
    website: item.Website,
    facebook: item.FacebookUrl,
    linkedin: item.LinkedInUrl,
    twitter: item.Twitter,
    email: item.EmailAddress,
    phone: item.PhoneNumber
  })
}

export function prettifySession(item) {
  if (!item) return null
  return deleteUndefinedKeys({
    id: `${item.Id}`,
    name: item.Name,
    image: item.ImageUrl,
    description: item.Description,
    location: item.Location,
    start: item.StartDate,
    end: item.EndDate
  })
}

function deleteUndefinedKeys(obj) {
  Object.keys(obj).forEach(key => typeof obj[key] === 'undefined' && delete obj[key])
  return obj
}
