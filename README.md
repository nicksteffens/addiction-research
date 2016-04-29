# BeneAdd
An iOS phone app for helping researchers survey / monitor addicts

Installing
---
1. Open the [project file](/platforms/ios/addiction-research.xcodeproj) in `Xcode`
2. Once `xcode` is open connect you're device through `USB`
3. Select your device on the top left.
4. Hit the play button


Configuration:
---
Inside of [controllers.js](/www/js/controllers.js) there is a `config factory` with configuration data

Options:
- geolocation
  * disable: `boolean` _for debugging polling_
  * timeout: `int` _polling timeout default is every 10 seconds, in milliseconds_
- api  _urls to database_
  * answers
  * login
  * questions
  * user
  * geolocation
- notifications:
  * disable: `boolean`
  * every: `string` _how often they are schduled possible choices_
    - 'minute'
    - 'weekly'
    - 'monthly'
- healthkit
  * query_length: `string`
    - default: `month`
    - `year`
    - `month`
    - `week`
    - `daily`
  * permissions _uses native healthkit values_
    - read: `array`
    - write: `array`
  * height
    - HK_type: `string` _native healthkit value_
    - unit: `string` _native healthkit values_
  * weight*
    - HK_type: `string` _native healthkit value_
    - unit: `string` _native healthkit values_
  * heart_rate* *
    - HK_type: `string` _native healthkit value_
    - unit: `string` _native healthkit values_
  * bac* * *
    - HK_type: `string` _native healthkit value_
    - unit: `string` _native healthkit values_
  * steps* * * *
    - HK_type: `string` _native healthkit value_
    - unit: `string` _native healthkit values_
