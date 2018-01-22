export function prettifyAttendee(user) {
  if (!user) return null
  const id = user.UserId || user.Id
  return deleteUndefinedKeys({
    id: id && `${id}`,
    identifier: user.UserIdentifierId,
    firstName: user.FirstName,
    lastName: user.LastName,
    title: user.Title,
    company: user.Company,
    email: user.EmailAddress,
    username: user.UserName,
    image: user.ImageUrl,
    userGroupIds: user.UserGroups || [],
    twitter: user.TwitterUserName,
    linkedin: user.LinkedInId,
    facebook: user.FacebookUserId
  })
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
    id: item.Id,
    name: item.Name,
    image: item.ImageUrl,
    description: item.Description
  })
}

export function prettifyExhibitor(item) {
  if (!item) return null
  return deleteUndefinedKeys({
    id: item.Id,
    name: item.Name,
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

export function prettifySpeaker(item) {
  if (!item) return null
  return deleteUndefinedKeys({
    id: item.Id,
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
    id: item.Id,
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
