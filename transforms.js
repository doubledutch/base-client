export function prettifyAttendee(user) {
  if (!user) return null
  return deleteUndefinedKeys({
    id: user.UserId || user.Id,
    identifier: user.UserIdentifierId,
    firstName: user.FirstName,
    lastName: user.LastName,
    title: user.Title,
    company: user.Company,
    email: user.EmailAddress,
    username: user.UserName,
    image: user.ImageUrl,
    twitter: user.TwitterUserName,
    linkedin: user.LinkedInId,
    facebook: user.FacebookUserId
  })
}

export function prettifyEvent(event) {
  if (!event) return null
  return deleteUndefinedKeys({
    id: event.EventId,
    startDate: event.StartDate,
    endDate: event.EndDate,
    description: event.Description,
    appId: event.BundleId
  })
}

function deleteUndefinedKeys(obj) {
  Object.keys(obj).forEach(key => typeof obj[key] === 'undefined' && delete obj[key])
  return obj
}
