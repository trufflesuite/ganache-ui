
import ua from 'universal-analytics'

const { app } = require('electron').remote

const ganacheAnalyticsId = 'UA-83874933-5'
const ganacheUrl = 'http://truffleframework.com/ganache'
const ganacheName = 'Ganache'
const appVersion = app.getVersion()

export let GoogleAnalytics = {
  uuid: "",
  isEnabled: false,
  isSetup: false,
  user: null,

  canSend: () => {
    return GoogleAnalytics.isEnabled && GoogleAnalytics.setup
  },

  setup: (enabled, uuid) => {
    if (GoogleAnalytics.uuid === "" && uuid) {
      // this allows us to initialize the uuid at setup, but call the setup
      // function later if the analytics become enabled (which should restart the app)
      // meh. it's safe :)
      GoogleAnalytics.uuid = uuid
    }

    if (typeof enabled !== "undefined") {
      GoogleAnalytics.isEnabled = enabled
    }

    if (GoogleAnalytics.isEnabled && GoogleAnalytics.uuid) {
      GoogleAnalytics.user = ua(ganacheAnalyticsId, GoogleAnalytics.uuid)
      GoogleAnalytics.user.set('location', ganacheUrl)
      GoogleAnalytics.user.set('checkProtocolTask', null)
      GoogleAnalytics.user.set('an', ganacheName)
      GoogleAnalytics.user.set('av', appVersion)
      GoogleAnalytics.user.set('ua', navigator.userAgent)
      GoogleAnalytics.user.set('sr', screen.width + 'x' + screen.height)
      GoogleAnalytics.user.set(
        'vp',
        window.screen.availWidth + 'x' + window.screen.availHeight
      )

      window.onerror = (msg, url, lineNo, columnNo, error) => {
        var message = [
          'Message: ' + msg,
          'Line: ' + lineNo,
          'Column: ' + columnNo,
          'Error object: ' + JSON.stringify(error)
        ].join(' - ')
    
        // setTimeout(() => {
        //   this.user.exception(message.toString())
        // }, 0)
    
        return false
      }

      GoogleAnalytics.reportPageview('/')

      this.isSetup = true
    }
  },

  reportPageview: (page) => {
    if (GoogleAnalytics.isEnabled) {
      if (!GoogleAnalytics.isSetup || GoogleAnalytics.user === null) {
        GoogleAnalytics.setup()
      }

      if (GoogleAnalytics.canSend()) {
        GoogleAnalytics.user.pageview(page).send()
      }
    }
  },

  reportScreenview: (screen) => {
    if (GoogleAnalytics.isEnabled) {
      if (!GoogleAnalytics.isSetup || GoogleAnalytics.user === null) {
        GoogleAnalytics.setup()
      }

      if (GoogleAnalytics.canSend()) {
        GoogleAnalytics.user.screenview(screen, ganacheName, appVersion).send()
      }
    }
  }
}