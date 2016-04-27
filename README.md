# BeneAdd
An iOS phone app for helping researchers survey / monitor addicts


Configuration:
---
Inside of [controllers.js](https://github.com/nicksteffens/addiction-research/blob/master/www/js/controllers.js) there is a `config factory` with configuration data

Here Are options:
- geolocation
  * disable _for debugging polling_
  * timeout _polling timeout default is every 10 seconds, in milliseconds_
- api  _urls to database_
  * answers
  * login
  * questions
  * user
- notifications:
  * disable
  * every _how often they are schduled possible choices_
    * 'minute'
    * 'weekly'
    * 'monthly'


Current List of ToDo's:
---
- [ ] After create user page _nick_
  * Instructions to confirm via email
  * Login form
- [ ] User profile page _nick_
  * Height
  * Weight
  * Medical ID?
  * POST / PATCH this info _shakir_
- [ ] Survey Questions
  * GET questions
  * Questions Controller / Template
  * POST answers _shakir_
- [ ] Goals
  * Goal Creation Page
  * POST / GET _shakir_
- [ ] Activity Tracker
  * Heartrate Tracking - Research with apple watch?
  * GPS Tracking / Background tracking
  * POST _shakir_
- [ ] Notifications!!! _need help looking into_ _kevin?_


Notes with Muhammed
---
- No Facebook
- GPS must background tracking
- Text / Phone call is out
- Read through anonymous user identifier
- Survey Questions
  * Once a day / week? If possible daily?
  * Notification for every day
  * Checkout MyHeart Counts


Nick's Short listen
---
- [x] GPS
- [ ] Notifications on the daily to take survey
- [ ] Questions and how to get them... _sync with shakir_
  * In the mean time have it locally.
- [ ] Login should now use Healthkit functions for height and weight
