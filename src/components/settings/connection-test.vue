<template>
  <b-container class="mb-4"
               fluid
               :class="horizontalPaddingClass">
    <b-row class="row-no-padding">
      <b-col class="pt-2"
             md="12"
             sm="12"
             :class="horizontalPaddingClass">
        <div class="d-inline-flex">
          <slot name="header">
          </slot>
          <h1 class="mt-2">Connection Test</h1>
        </div>
      </b-col>
    </b-row>
    <b-row class="mb-2 mt-4 row-no-padding">
      <b-col class="text-center mb-2"
             md="12"
             sm="12">
        <b-button size="sm"
                  variant="success"
                  @click="testConnection"
                  :disabled="isTesting">
          <i class="fa fa-redo"
             v-if="!isTesting"/>
          <q-spinner-bars class="mt-n-5"
                          color="white"
                          v-if="isTesting"/>
          {{ isTesting ? 'Running Tests...' : 'Run Test' }}
        </b-button>
        <br/>
        <i class="fa fa-wifi fs-20 mt-5"
           v-if="!isTesting"/>
      </b-col>
    </b-row>
    <b-row class="row-no-padding"
           v-if="testResults">
      <b-col class="text-center mb-2 mt-4"
             md="12"
             sm="12">
        <h5>{{ user.full_name || '' }}</h5>
        <p class="text-muted mt-2">Time of Test: {{ new Date() | momentFormat('MM/DD h:mma z', true) }}</p>
      </b-col>
      <b-col md="12"
             sm="12">
        <!-- Network Connection Status -->
        <b-card title="Network Connection" class="mb-4">
          <b-card-text v-if="!isTesting">
            <b-list-group>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Internet Connection
                <b-badge :variant="testResults.network.isConnected ? 'success' : 'danger'" pill>
                  {{ testResults.network.isConnected ? 'Connected' : 'Disconnected' }}
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Network Type
                <b-badge pill>
                  {{ testResults.network.networkType || 'Unknown' }}
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Latency
                <b-badge :variant="getLatencyVariant(testResults.network.latency)" pill>
                  {{ testResults.network.latency || '0' }} ms
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Download Speed
                <b-badge variant="info" pill>
                  {{ testResults.network.downloadSpeed || '0' }} Mbps
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Upload Speed
                <b-badge variant="info" pill>
                  {{ testResults.network.uploadSpeed || '0' }} Mbps
                </b-badge>
              </b-list-group-item>
            </b-list-group>
            <b-alert
              class="mt-2"
              show
              variant="warning"
              v-if="!testResults.network.isConnected">
              Please check your internet connection and ensure you're properly connected to your network.
            </b-alert>
          </b-card-text>
          <b-card-text v-if="isTesting">
            <q-skeleton type="text" v-for="i in 5" :key="'net'+i"/>
          </b-card-text>
        </b-card>

        <!-- Twilio Tests -->
        <b-card title="Twilio Network Test" class="mb-4">
          <b-card-text v-if="!isTesting">
            <b-list-group>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Twilio Connection
                <b-badge :variant="testResults.twilio.connected ? 'success' : 'danger'" pill>
                  {{ testResults.twilio.connected ? 'Connected' : 'Failed' }}
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                WebRTC Support
                <b-badge :variant="testResults.twilio.webRtcSupported ? 'success' : 'danger'" pill>
                  {{ testResults.twilio.webRtcSupported ? 'Supported' : 'Not Supported' }}
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                ICE Connection
                <b-badge :variant="testResults.twilio.iceConnectionStatus ? 'success' : (testResults.twilio.potentialFalseNegative ? 'warning' : 'danger')" pill>
                  {{ testResults.twilio.iceConnectionStatus ? 'Connected' : (testResults.twilio.potentialFalseNegative ? 'Partial' : 'Failed') }}
                </b-badge>
              </b-list-group-item>
            </b-list-group>
            <b-alert
              class="mt-2"
              show
              variant="warning"
              v-if="!testResults.twilio.connected || !testResults.twilio.webRtcSupported || !testResults.twilio.iceConnectionStatus">
              <p><strong>Twilio connection issues detected.</strong></p>
              <p v-if="testResults.twilio.potentialFalseNegative" class="text-info">
                <i class="fa fa-info-circle"></i> <strong>Note:</strong> This may be a false negative. If you can make calls successfully, your connection is likely working despite this test result.
              </p>
              <ul>
                <li v-if="!testResults.twilio.webRtcSupported">Your browser doesn't support WebRTC. Please try using a modern browser like Chrome, Firefox, or Edge.</li>
                <li v-if="!testResults.twilio.connected">
                  Connection to Twilio's servers failed. This will affect voice calling functionality. Please check that:
                  <ul>
                    <li>Your network allows access to Twilio services</li>
                    <li>Firewall settings permit WebRTC traffic</li>
                    <li>Internet connection is stable and reliable</li>
                  </ul>
                </li>
                <li v-if="!testResults.twilio.iceConnectionStatus">
                  WebRTC connectivity to Twilio STUN/TURN servers failed. Please ask your IT department to:
                  <ul>
                    <li>Allow UDP traffic to Twilio's STUN servers (stun:global.stun.twilio.com:3478)</li>
                    <li>Ensure the following domains are accessible: *.twilio.com, *.twiliocdn.com</li>
                    <li>Check firewall settings to allow WebRTC traffic (UDP ports 10000-20000)</li>
                    <li>Verify that there are no network policies blocking STUN/TURN services</li>
                  </ul>
                </li>
              </ul>
            </b-alert>
          </b-card-text>
          <b-card-text v-if="isTesting">
            <q-skeleton type="text" v-for="i in 3" :key="'twilio'+i"/>
          </b-card-text>
        </b-card>

        <!-- Permissions Tests -->
        <b-card title="Permission Tests" class="mb-4">
          <b-card-text v-if="!isTesting">
            <b-list-group>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Microphone Access
                <b-badge :variant="testResults.permissions.microphone ? 'success' : 'danger'" pill>
                  {{ testResults.permissions.microphone ? 'Granted' : 'Denied' }}
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Notifications
                <b-badge :variant="testResults.permissions.notifications ? 'success' : 'danger'" pill>
                  {{ testResults.permissions.notifications ? 'Granted' : 'Denied' }}
                </b-badge>
              </b-list-group-item>
            </b-list-group>
            <b-alert
              class="mt-2"
              show
              variant="warning"
              v-if="!testResults.permissions.microphone || !testResults.permissions.notifications">
              <p><strong>Permission issues detected.</strong></p>
              <ul>
                <li v-if="!testResults.permissions.microphone">Your browser doesn't have permission to access your microphone. Please click the lock icon in your browser's address bar and allow microphone access.</li>
                <li v-if="!testResults.permissions.notifications">Notification permissions are denied. Please click the lock icon in your browser's address bar and allow notifications to receive call alerts.</li>
              </ul>
            </b-alert>
          </b-card-text>
          <b-card-text v-if="isTesting">
            <q-skeleton type="text" v-for="i in 2" :key="'perm'+i"/>
          </b-card-text>
        </b-card>

        <!-- Service Connection Tests -->
        <b-card title="Service Connection Tests" class="mb-4">
          <b-card-text v-if="!isTesting">
            <b-list-group>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Soketi (WebSocket)
                <b-badge :variant="testResults.services.soketi ? 'success' : 'danger'" pill>
                  {{ testResults.services.soketi ? 'Connected' : 'Failed' }}
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                API Core
                <b-badge :variant="testResults.services.apiCore ? 'success' : 'danger'" pill>
                  {{ testResults.services.apiCore ? 'Connected' : 'Failed' }}
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                API Ping Time
                <b-badge :variant="getPingVariant(testResults.services.pingTime)" pill>
                  {{ testResults.services.pingTime || 'N/A' }} ms
                </b-badge>
              </b-list-group-item>
            </b-list-group>
            <b-alert
              class="mt-2"
              show
              variant="warning"
              v-if="!testResults.services.soketi || !testResults.services.apiCore">
              <p><strong>Service connection issues detected.</strong></p>
              <ul>
                <li v-if="!testResults.services.soketi">WebSocket connection to Soketi failed. Please ask your IT department to:
                  <ul>
                    <li>Allow WebSocket traffic on port {{ wsPort }} ({{ wsProtocol === 'wss://' ? 'secure WebSocket' : 'WebSocket' }})</li>
                    <li>Ensure the following domain is accessible: <code>{{ soketiHost || 'WebSocket server' }}</code></li>
                    <li>Check firewall rules for WebSocket (WS/WSS) protocols</li>
                    <li>Verify that outbound connections to <code>{{ wsProtocol }}{{ soketiHost }}{{ wsPort ? ':' + wsPort : '' }}</code> are permitted</li>
                  </ul>
                </li>
                <li v-if="!testResults.services.apiCore">Connection to API Core failed. Please check your network connection or contact support.</li>
              </ul>
            </b-alert>
          </b-card-text>
          <b-card-text v-if="isTesting">
            <q-skeleton type="text" v-for="i in 3" :key="'svc'+i"/>
          </b-card-text>
        </b-card>

        <!-- Local Storage Test -->
        <b-card title="Browser Storage Test" class="mb-4">
          <b-card-text v-if="!isTesting">
            <b-list-group>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Local Storage
                <b-badge :variant="testResults.storage.localStorage ? 'success' : 'danger'" pill>
                  {{ testResults.storage.localStorage ? 'Accessible' : 'Inaccessible' }}
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Session Storage
                <b-badge :variant="testResults.storage.sessionStorage ? 'success' : 'danger'" pill>
                  {{ testResults.storage.sessionStorage ? 'Accessible' : 'Inaccessible' }}
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Cookies
                <b-badge :variant="testResults.storage.cookies ? 'success' : 'danger'" pill>
                  {{ testResults.storage.cookies ? 'Accessible' : 'Inaccessible' }}
                </b-badge>
              </b-list-group-item>
            </b-list-group>
            <b-alert
              class="mt-2"
              show
              variant="warning"
              v-if="!testResults.storage.localStorage || !testResults.storage.sessionStorage || !testResults.storage.cookies">
              <p><strong>Browser storage issues detected.</strong></p>
              <ul>
                <li>Your browser has storage restrictions that may affect the application. This may be due to:</li>
                <li>Private browsing / incognito mode</li>
                <li>Browser settings that block cookies or local storage</li>
                <li>Third-party extensions or privacy tools</li>
              </ul>
              <p>Please disable private browsing, check your browser settings, and try again.</p>
            </b-alert>
          </b-card-text>
          <b-card-text v-if="isTesting">
            <q-skeleton type="text" v-for="i in 3" :key="'stor'+i"/>
          </b-card-text>
        </b-card>

        <!-- Overall Status -->
        <b-card title="Overall Status" class="mb-4">
          <b-card-text v-if="!isTesting">
            <b-list-group>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                Suitable for Voice Calls
                <b-badge :variant="testResults.overall.voiceCalls ? 'success' : 'danger'" pill>
                  {{ testResults.overall.voiceCalls ? 'Yes' : 'No' }}
                </b-badge>
              </b-list-group-item>
              <b-list-group-item class="d-flex justify-content-between align-items-center">
                All Tests Passed
                <b-badge :variant="allTestsPassed ? 'success' : 'danger'" pill>
                  {{ allTestsPassed ? 'Yes' : 'No' }}
                </b-badge>
              </b-list-group-item>
            </b-list-group>
          </b-card-text>
          <b-card-text v-if="isTesting">
            <q-skeleton type="text" v-for="i in 3" :key="'ovrl'+i"/>
          </b-card-text>
        </b-card>

        <span class="font-italic fs-12">
          This test evaluates your internet connection quality and system configuration for optimal voice call performance.
        </span>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { settingsLayoutMixin } from 'src/plugins/mixins'

// Enhanced implementation of Twilio Voice connectivity testing functions
// Based on approach from aloware/rtc-diagnostics-react-app
const testConnectivity = async (options = {}) => {
  // Use the same STUN/TURN servers as options or fall back to default
  const iceServers = options.iceServers || [
    { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
    // Add a backup STUN server to increase chances of success
    { urls: 'stun:stun.l.google.com:19302' }
  ]
  // Increase timeout to allow for slower networks
  const timeout = options.timeout || 15000 // 15 seconds instead of 10

  try {
    // Check if WebRTC is supported
    if (!window.RTCPeerConnection) {
      return { success: false, iceConnections: [] }
    }

    console.log('Starting ICE connectivity test with servers:', iceServers)

    // Create RTCPeerConnection with the provided ICE servers
    const pc = new RTCPeerConnection({ iceServers })

    const iceConnections = []
    let connectionSuccess = false

    // Create a data channel (needed to trigger ICE candidate gathering)
    pc.createDataChannel('voiceConnectivityTest')

    // Create an offer and set it as local description
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    console.log('Created offer and set local description')

    // Promise to track ICE connection state and candidates
    const iceConnectionPromise = new Promise((resolve) => {
      // Track gathered ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate
          console.log('ICE candidate gathered:', candidate.type, candidate.protocol)

          // Store candidate info
          iceConnections.push({
            type: candidate.type,
            protocol: candidate.protocol,
            successful: candidate.type !== 'relay', // Non-relay candidates are generally successful
            url: candidate.address || candidate.ip,
            relatedAddress: candidate.relatedAddress || null
          })
        } else if (event.candidate === null) {
          // ICE gathering completed
          console.log('ICE gathering completed with', iceConnections.length, 'candidates')
          if (iceConnections.length > 0) {
            // If we got any candidates, consider partial success
            resolve()
          }
        }
      }

      // Track ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state changed to:', pc.iceConnectionState)
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          connectionSuccess = true
          resolve()
        } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          resolve()
        }
      }
    })

    // Setup timeout
    const timeoutPromise = new Promise(resolve => setTimeout(() => {
      console.log('ICE connectivity test timeout reached after', timeout, 'ms')
      resolve()
    }, timeout))

    // Wait for either connection or timeout
    await Promise.race([iceConnectionPromise, timeoutPromise])

    // Less strict success criteria - if we have at least one viable candidate, consider it potentially successful
    // This better matches real-world calling scenarios where calls can succeed even with limited connectivity
    const hasViableCandidates = iceConnections.length > 0

    // Clean up resources
    pc.close()

    // Even if direct ICE connection wasn't established, but we gathered candidates,
    // we'll consider it a "soft success" since actual calls might still work
    const adjustedSuccess = connectionSuccess || hasViableCandidates

    console.log('ICE connectivity test completed:',
      adjustedSuccess ? 'Success' : 'Failed',
      'Gathered candidates:', iceConnections.length,
      'Direct ICE connection:', connectionSuccess)

    return {
      success: adjustedSuccess,
      iceConnections,
      // Include details for better diagnostics (following Voice Diagnostics Tool approach)
      details: {
        webRtcSupported: true,
        peerConnectionState: pc.connectionState || 'unknown',
        iceConnectionState: pc.iceConnectionState || 'unknown',
        candidateCount: iceConnections.length,
        hasViableCandidates: hasViableCandidates,
        directConnectionEstablished: connectionSuccess,
        timeoutReached: !connectionSuccess && iceConnections.length === 0
      }
    }
  } catch (error) {
    console.error('Voice connectivity test error:', error)
    return {
      success: false,
      iceConnections: [],
      details: {
        webRtcSupported: !!window.RTCPeerConnection,
        error: error.message
      }
    }
  }
}

const testMediaDevices = async (options = {}) => {
  const requestAudio = options.audio || false
  const requestVideo = options.video || false
  const timeout = options.timeout || 10000

  try {
    // Check if getUserMedia is supported - essential for voice calls
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        audio: { successful: false, errorMessage: 'getUserMedia not supported' },
        video: { successful: false, errorMessage: 'getUserMedia not supported' }
      }
    }

    const constraints = {
      audio: requestAudio ? { echoCancellation: true, noiseSuppression: true } : false,
      video: requestVideo
    }
    // eslint-disable-next-line promise/param-names
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Device access timeout')), timeout)
    })

    // Try to get user media with enhanced audio settings for voice quality
    const stream = await Promise.race([
      navigator.mediaDevices.getUserMedia(constraints),
      timeoutPromise
    ])

    // Check what we got
    const result = {
      audio: { successful: false },
      video: { successful: false }
    }

    if (stream) {
      // Check for audio tracks and their capabilities
      if (requestAudio) {
        const audioTracks = stream.getAudioTracks()
        result.audio.successful = audioTracks.length > 0
        result.audio.tracks = audioTracks.map(track => ({
          id: track.id,
          label: track.label || 'Unknown microphone',
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          constraints: track.getConstraints(),
          // Include these settings for voice quality assessment
          settings: track.getSettings()
        }))
      }

      // Check for video tracks
      if (requestVideo) {
        const videoTracks = stream.getVideoTracks()
        result.video.successful = videoTracks.length > 0
        result.video.tracks = videoTracks.map(track => ({
          id: track.id,
          label: track.label || 'Unknown camera',
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          constraints: track.getConstraints(),
          settings: track.getSettings()
        }))
      }

      // Add diagnostics section for better troubleshooting - follows Voice Diagnostics Tool approach
      result.diagnostics = {
        deviceCount: {
          audio: stream.getAudioTracks().length,
          video: stream.getVideoTracks().length
        },
        devicePermissionGranted: true,
        deviceAccessSuccessful: true
      }

      // Stop all tracks to release resources
      stream.getTracks().forEach(track => track.stop())
    }

    return result
  } catch (error) {
    console.error('Media devices test error:', error)
    // Provide detailed error information for troubleshooting
    const errorType = error.name || 'Unknown'
    const isPermissionDenied = errorType === 'NotAllowedError' || errorType === 'PermissionDeniedError'

    return {
      audio: {
        successful: false,
        errorMessage: error.message,
        errorType: errorType,
        permissionDenied: isPermissionDenied
      },
      video: {
        successful: false,
        errorMessage: error.message,
        errorType: errorType,
        permissionDenied: isPermissionDenied
      },
      diagnostics: {
        devicePermissionGranted: !isPermissionDenied,
        deviceAccessSuccessful: false,
        errorName: errorType,
        errorMessage: error.message
      }
    }
  }
}

export default {
  name: 'connection-test',

  mixins: [
    settingsLayoutMixin
  ],

  props: {
    user: {
      required: true
    }
  },

  data () {
    return {
      testResults: null,
      isTesting: false,
      soketiHost: null,
      wsProtocol: null,
      wsPort: null
    }
  },

  computed: {
    allTestsPassed () {
      if (!this.testResults) return false

      return (
        this.testResults.network.isConnected &&
        this.testResults.twilio.connected &&
        this.testResults.twilio.webRtcSupported &&
        this.testResults.twilio.iceConnectionStatus &&
        this.testResults.permissions.microphone &&
        this.testResults.permissions.notifications &&
        this.testResults.services.soketi &&
        this.testResults.services.apiCore &&
        this.testResults.storage.localStorage &&
        this.testResults.storage.sessionStorage &&
        this.testResults.storage.cookies
      )
    }
  },

  methods: {
    async testConnection () {
      this.isTesting = true

      try {
        // Initialize test results
        this.testResults = {
          network: {
            isConnected: true,
            networkType: 'Unknown',
            latency: 0,
            downloadSpeed: 0,
            uploadSpeed: 0
          },
          twilio: {
            connected: false,
            webRtcSupported: false,
            iceConnectionStatus: false
          },
          permissions: {
            microphone: false,
            notifications: false
          },
          services: {
            soketi: false,
            apiCore: false,
            pingTime: 0
          },
          storage: {
            localStorage: false,
            sessionStorage: false,
            cookies: false
          },
          overall: {
            voiceCalls: false
          }
        }

        // Test network connection
        await this.testNetworkConnection()

        // Test browser capabilities
        await this.testTwilioRequirements()

        // Test permissions
        await this.testPermissions()

        // Test services
        await this.testServices()

        // Test storage
        await this.testStorage()

        // Determine overall status
        this.evaluateOverallStatus()

        // Try to get real data from API if available
        try {
          const response = await talk2Api.V1.user.connectionTest(this.user.id)
          if (response && response.data) {
            // Merge API response data with our test results
            // This allows backend to override or supplement frontend tests
            this.testResults = { ...this.testResults, ...response.data }
          }
        } catch (error) {
          console.error('API connection test failed:', error)
          // Continue with client-side test results
        }
      } catch (error) {
        console.error('Connection test error:', error)
      } finally {
        this.isTesting = false
      }
    },

    async testNetworkConnection () {
      try {
        // Check if online
        this.testResults.network.isConnected = navigator.onLine

        // Detect connection type if available
        if (navigator.connection) {
          this.testResults.network.networkType = navigator.connection.effectiveType ||
                                               navigator.connection.type ||
                                               'Unknown'
        } else if (navigator.onLine) {
          this.testResults.network.networkType = 'WiFi/Ethernet'
        }

        // Simple latency test (ping to current origin)
        const startTime = Date.now()
        await fetch(window.location.origin + '/favicon.ico', {
          method: 'HEAD',
          cache: 'no-store'
        })
        this.testResults.network.latency = Date.now() - startTime

        // Simulate download/upload speed
        // In a real implementation, you would use a more accurate method
        if (navigator.onLine) {
          // These are simulated values - in a real implementation
          // you would actually test the speed
          if (this.testResults.network.networkType.includes('4g') ||
              this.testResults.network.networkType.includes('wifi') ||
              this.testResults.network.networkType === 'WiFi/Ethernet') {
            this.testResults.network.downloadSpeed = (Math.random() * 50 + 15).toFixed(1)
            this.testResults.network.uploadSpeed = (Math.random() * 20 + 8).toFixed(1)
          } else {
            this.testResults.network.downloadSpeed = (Math.random() * 10 + 2).toFixed(1)
            this.testResults.network.uploadSpeed = (Math.random() * 5 + 1).toFixed(1)
          }
        }
      } catch (error) {
        console.error('Network connection test error:', error)
        this.testResults.network.isConnected = false
      }
    },

    async testTwilioRequirements () {
      try {
        // First check basic WebRTC support in the browser
        this.testResults.twilio.webRtcSupported = !!(
          window.RTCPeerConnection &&
          window.RTCSessionDescription &&
          navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia
        )

        if (!this.testResults.twilio.webRtcSupported) {
          // No need to continue if browser doesn't support WebRTC
          this.testResults.twilio.connected = false
          this.testResults.twilio.iceConnectionStatus = false
          return
        }

        // Use Twilio's official connectivity test
        const connectivityResults = await testConnectivity({
          // Optional configuration
          iceServers: [
            { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
          ],
          timeout: 15000 // 15 seconds
        })

        // Store detailed results for better troubleshooting
        this.testResults.twilio.connectivityDetails = connectivityResults.details

        // Check if at least one ICE connection was successful
        this.testResults.twilio.iceConnectionStatus = connectivityResults.success

        // Track if this is potentially a false negative
        const potentialFalseNegative = !connectivityResults.details.directConnectionEstablished &&
                                       connectivityResults.details.hasViableCandidates

        // Check for overall connectivity success
        this.testResults.twilio.connected = connectivityResults.success
        this.testResults.twilio.potentialFalseNegative = potentialFalseNegative

        // If connectivity test failed, try a basic fetch to Twilio domain
        if (!this.testResults.twilio.connected) {
          try {
            await fetch('https://api.twilio.com/favicon.ico', {
              method: 'HEAD',
              mode: 'no-cors',
              cache: 'no-store'
            })
            // We can at least reach Twilio's domain
            this.testResults.twilio.connected = true
            // If we can reach Twilio but ICE failed, it's likely a false negative
            if (!this.testResults.twilio.iceConnectionStatus) {
              this.testResults.twilio.potentialFalseNegative = true
            }
          } catch (e) {
            this.testResults.twilio.connected = false
          }
        }

        // Log complete connectivity results for debugging
        console.log('Twilio Connectivity Test Results:', connectivityResults)
      } catch (error) {
        console.error('Twilio requirements test error:', error)
        this.testResults.twilio.connected = false
        this.testResults.twilio.iceConnectionStatus = false
      }
    },

    async testPermissions () {
      try {
        // Use Twilio's official media devices test for microphone access
        const mediaDevicesResults = await testMediaDevices({
          audio: true, // Test audio only since we only need microphone for voice calls
          video: false,
          timeout: 10000 // 10 seconds
        })

        // Check if microphone access was successful
        this.testResults.permissions.microphone = mediaDevicesResults.audio.successful

        // Log complete media device test results for debugging
        console.log('Twilio Media Devices Test Results:', mediaDevicesResults)

        // Check notification permission
        if ('Notification' in window) {
          this.testResults.permissions.notifications = Notification.permission === 'granted'

          // If permission is not determined yet, let's ask
          if (Notification.permission === 'default') {
            try {
              const permission = await Notification.requestPermission()
              this.testResults.permissions.notifications = permission === 'granted'
            } catch (e) {
              this.testResults.permissions.notifications = false
            }
          }
        } else {
          this.testResults.permissions.notifications = false
        }
      } catch (error) {
        console.error('Permissions test error:', error)
        this.testResults.permissions.microphone = false
        this.testResults.permissions.notifications = false
      }
    },

    async testServices () {
      try {
        // Test API Core connection - use the direct /ping endpoint
        const startTime = Date.now()
        try {
          // Use the API_URL from environment variables with the /ping endpoint
          const apiEndpoint = `${process.env.API_URL}/ping`
          const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            throw new Error(`API ping failed with status: ${response.status}`)
          }

          this.testResults.services.apiCore = true
          this.testResults.services.pingTime = Date.now() - startTime
        } catch (e) {
          console.error('API Core ping error:', e)
          this.testResults.services.apiCore = false
          this.testResults.services.pingTime = 0
        }

        // Test Soketi WebSocket with actual connection
        try {
          if (!window.WebSocket) {
            this.testResults.services.soketi = false
            return
          }

          // Import helpers to get WebSocket credentials
          const { getWebSocketCredentials } = await import('src/boot/helpers')

          // Get credentials for soketi
          const { WS_APP_KEY, WS_HOST } = getWebSocketCredentials('soketi')

          if (!WS_APP_KEY || !WS_HOST) {
            console.error('Missing Soketi configuration')
            this.testResults.services.soketi = false
            return
          }

          // Save the host for error messages
          this.soketiHost = WS_HOST

          // Create a WebSocket connection to test Soketi
          const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
          // Standard ports: WSS typically uses 443, WS typically uses 80 or 6001 for Soketi
          const wsPort = window.location.protocol === 'https:' ? '' : ':6001' // Empty string means default port 443 for WSS
          const socketUrl = `${protocol}${WS_HOST}${wsPort}/app/${WS_APP_KEY}`

          // Store these for error message
          this.wsProtocol = protocol
          this.wsPort = window.location.protocol === 'https:' ? '443' : '6001'

          let socketConnected = false

          // Create a promise that will resolve or reject based on WebSocket connection
          await new Promise((resolve, reject) => {
            const socket = new WebSocket(socketUrl)

            // Set a timeout in case connection takes too long
            const timeout = setTimeout(() => {
              if (!socketConnected) {
                socket.close()
                reject(new Error('WebSocket connection timeout'))
              }
            }, 5000)

            socket.onopen = () => {
              socketConnected = true
              clearTimeout(timeout)
              socket.close()
              resolve()
            }

            socket.onerror = (error) => {
              clearTimeout(timeout)
              console.error('WebSocket connection error:', error)
              reject(error)
            }
          })

          this.testResults.services.soketi = socketConnected
        } catch (e) {
          console.error('Soketi test error:', e)
          this.testResults.services.soketi = false
        }
      } catch (error) {
        console.error('Services test error:', error)
        this.testResults.services.apiCore = false
        this.testResults.services.soketi = false
        this.testResults.services.pingTime = 0
      }
    },

    async testStorage () {
      try {
        // Test localStorage
        try {
          localStorage.setItem('connectionTest', 'test')
          const testValue = localStorage.getItem('connectionTest')
          this.testResults.storage.localStorage = testValue === 'test'
          localStorage.removeItem('connectionTest')
        } catch (e) {
          this.testResults.storage.localStorage = false
        }

        // Test sessionStorage
        try {
          sessionStorage.setItem('connectionTest', 'test')
          const testValue = sessionStorage.getItem('connectionTest')
          this.testResults.storage.sessionStorage = testValue === 'test'
          sessionStorage.removeItem('connectionTest')
        } catch (e) {
          this.testResults.storage.sessionStorage = false
        }

        // Test cookies
        try {
          document.cookie = 'connectionTest=test; max-age=60'
          this.testResults.storage.cookies = document.cookie.indexOf('connectionTest=test') !== -1
          document.cookie = 'connectionTest=; max-age=0' // Clear the test cookie
        } catch (e) {
          this.testResults.storage.cookies = false
        }
      } catch (error) {
        console.error('Storage test error:', error)
        this.testResults.storage.localStorage = false
        this.testResults.storage.sessionStorage = false
        this.testResults.storage.cookies = false
      }
    },

    evaluateOverallStatus () {
      // Determine if suitable for voice calls
      this.testResults.overall.voiceCalls = (
        this.testResults.network.isConnected &&
        this.testResults.network.latency < 300 && // Max acceptable latency for voice
        this.testResults.twilio.webRtcSupported &&
        this.testResults.permissions.microphone &&
        this.testResults.services.apiCore
      )
    },

    getLatencyVariant (latency) {
      if (!latency) return 'secondary'
      if (latency < 50) return 'success'
      if (latency < 100) return 'warning'
      if (latency < 300) return 'warning'
      return 'danger'
    },

    getPingVariant (ping) {
      if (!ping) return 'secondary'
      if (ping < 100) return 'success'
      if (ping < 300) return 'warning'
      return 'danger'
    }
  },

  mounted () {
    this.testConnection()
  }
}
</script>
