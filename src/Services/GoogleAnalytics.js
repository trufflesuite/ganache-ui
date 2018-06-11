
import ua from 'universal-analytics'

const { app } = require('electron').remote

const ganacheAnalyticsId = 'UA-120580191-1'
const ganacheUrl = 'http://truffleframework.com/ganache'
const ganacheName = 'Ganache'
const appVersion = app.getVersion()

export let GoogleAnalytics = {
  uuid: "",
  isEnabled: false,
  isSetup: false,
  user: null,

  canSend: () => {
    return GoogleAnalytics.isEnabled && GoogleAnalytics.isSetup
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

      GoogleAnalytics.isSetup = true

      GoogleAnalytics.reportPageview('/')
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
  },

  // this function picks some useful settings we like to track
  reportSettings: (settings) => {
    if (GoogleAnalytics.isEnabled) {
      if (!GoogleAnalytics.isSetup || GoogleAnalytics.user === null) {
        GoogleAnalytics.setup()
      }

      if (GoogleAnalytics.canSend()) {
        let hostname = settings.server.hostname
        if (hostname !== "127.0.0.1" && hostname !== "0.0.0.0") {
          const localIp = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/
          if (localIp.exec(hostname)) {
            hostname = 'private'
          }
          else {
            hostname = 'public'
          }
        }

        const config = {
          hostname,
          port: settings.server.port,
          networkId: settings.server.network_id,
          blockTime: typeof settings.server.blocktime == "undefined" ? 'automine' : settings.server.blockTime,
          defaultBalance: settings.server.default_balance_ether,
          totalAccounts: settings.server.total_accounts,
          autoMnemonic: settings.randomizeMnemonicOnStart,
          locked: settings.server.locked,
          gasLimit: settings.server.gasLimit,
          gasPrice: settings.server.gasPrice
        }

        GoogleAnalytics.user.set('dimension1', config.hostname)
        GoogleAnalytics.user.set('dimension2', config.port)
        GoogleAnalytics.user.set('dimension3', config.networkId)
        GoogleAnalytics.user.set('dimension4', config.blockTime)
        GoogleAnalytics.user.set('dimension5', config.defaultBalance)
        GoogleAnalytics.user.set('dimension6', config.totalAccounts)
        GoogleAnalytics.user.set('dimension7', config.autoMnemonic)
        GoogleAnalytics.user.set('dimension8', config.locked)
        GoogleAnalytics.user.set('dimension9', config.gasLimit)
        GoogleAnalytics.user.set('dimension10', config.gasPrice)
      }
    }
  },

  /*  event => {
   *    category, // required, string
   *    action, // required, string
   *    label, // optional, string
   *    value // optional, integer
   *  }
   */
  reportEvent: (event) => {
    if (GoogleAnalytics.isEnabled) {
      if (!GoogleAnalytics.isSetup || GoogleAnalytics.user === null) {
        GoogleAnalytics.setup()
      }

      if (GoogleAnalytics.canSend()) {
        if (event.category && event.action) {
          GoogleAnalytics.user.event({
            eventCategory: event.category,
            eventAction: event.action,
            eventLabel: event.label,
            eventValue: event.value
          }).send()
        }
      }
    }
  }
}