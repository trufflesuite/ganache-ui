import ua from 'universal-analytics'
import * as pkg from '../../package.json'

const ganacheAnalyticsId = 'UA-83874933-5'
const ganacheUrl = 'http://truffleframework.com/ganache'
const ganacheName = 'Ganache'
const appVersion = pkg.version

class GoogleAnalyticsService {
  constructor() {
    this.init()
  }

  init() {
    this.uuid = ""
    this.isEnabled = false
    this.isSetup = false
    this.user = null
  }

  canSend() {
    return this.isEnabled && this.isSetup
  }

  setup(enabled, uuid) {
    if (this.uuid === "" && uuid) {
      // this allows us to initialize the uuid at setup, but call the setup
      // function later if the analytics become enabled (which should restart the app)
      // meh. it's safe :)
      this.uuid = uuid
    }

    if (typeof enabled !== "undefined") {
      this.isEnabled = enabled
    }

    if (this.isEnabled && this.uuid) {
      this.user = ua(ganacheAnalyticsId, this.uuid)
      this.user.set('location', ganacheUrl)
      this.user.set('checkProtocolTask', null)
      this.user.set('an', ganacheName)
      this.user.set('av', appVersion)

      this.isSetup = true
    }
  }

  reportRendererSettings(navigator, screen, window) {
    this.user.set('ua', navigator.userAgent)
    this.user.set('sr', screen.width + 'x' + screen.height)
    this.user.set(
      'vp',
      window.screen.availWidth + 'x' + window.screen.availHeight
    )
  }

  reportPageview(page) {
    if (this.isEnabled) {
      if (!this.isSetup || this.user === null) {
        this.setup()
      }

      if (this.canSend()) {
        this.user.pageview(page).send()
      }
    }
  }

  reportScreenview(screen) {
    if (this.isEnabled) {
      if (!this.isSetup || this.user === null) {
        this.setup()
      }

      if (this.canSend()) {
        this.user.screenview(screen, ganacheName, appVersion).send()
      }
    }
  }

  // this function picks some useful settings we like to track
  reportSettings(settings) {
    if (this.isEnabled) {
      if (!this.isSetup || this.user === null) {
        this.setup()
      }

      if (this.canSend()) {
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

        this.user.set('cd1', config.hostname)
        this.user.set('cd2', config.port)
        this.user.set('cd3', config.networkId)
        this.user.set('cd4', config.blockTime)
        this.user.set('cd5', config.defaultBalance)
        this.user.set('cd6', config.totalAccounts)
        this.user.set('cd7', config.autoMnemonic)
        this.user.set('cd8', config.locked)
        this.user.set('cd9', config.gasLimit)
        this.user.set('cd10', config.gasPrice)
      }
    }
  }

  /*  event => {
   *    category, // required, string
   *    action, // required, string
   *    label, // optional, string
   *    value // optional, integer
   *  }
   */
  reportEvent(event) {
    if (this.isEnabled) {
      if (!this.isSetup || this.user === null) {
        this.setup()
      }

      if (this.canSend()) {
        if (event.category && event.action) {
          this.user.event({
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

export default GoogleAnalyticsService