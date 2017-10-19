export function prettifyAttendee(user) {
  if (!user) return null
  return {
    id: user.UserId,
    identifier: user.UserIdentifierId,
    fisrtName: user.FirstName,
    lastName: user.LastName,
    title: user.Title,
    company: user.Company,
    email: user.EmailAddress,
    username: user.UserName,
    image: user.ImageUrl,
    twitter: user.TwitterUserName,
    linkedin: user.LinkedInId,
    facebook: user.FacebookUserId
  }
}

export function prettifyEvent(event) {
  if (!event) return null
  return {
    id: event.EventId,
    startDate: event.StartDate,
    endDate: event.EndDate,
    description: event.Description,
    appId: event.BundleId
  }
}
