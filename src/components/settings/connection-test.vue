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

    <!-- Test Control Panel -->
    <b-row class="mb-4 mt-4">
      <b-col md="6" lg="4">
        <b-card class="test-control-panel h-100">
          <div class="text-center">
            <div class="connection-test-image mb-4">
              <i class="fa fa-signal fa-4x" style="color: #6c757d;"></i>
            </div>
            <div class="mb-3">
              <h5>Connection Test</h5>
              <p class="small text-muted">Tests your network connectivity with our servers</p>
            </div>
            <b-button size="md"
                      variant="primary"
                      class="px-4 py-2"
                      @click="testConnection"
                      :disabled="isTesting">
              <i class="fa fa-redo mr-2"
                 v-if="!isTesting"/>
              <q-spinner-bars class="mt-n-5"
                              color="white"
                              v-if="isTesting"/>
              {{ isTesting ? 'Running Tests...' : 'Start Test' }}
            </b-button>
            <div v-if="testCount > 0" class="text-muted mt-3 small">
              <i class="fa fa-history mr-1"></i> Tests run in this session: {{ testCount }}
              <div v-if="lastTestTime">Last test: {{ lastTestTime | momentFormat('MM/DD/YYYY h:mma z', true) }}</div>
            </div>
          </div>
        </b-card>
      </b-col>

      <!-- Quick Stats Panel -->
      <b-col md="6" lg="8" v-if="testResults && !isTesting">
        <b-card class="quick-stats-panel h-100">
          <div class="d-flex flex-column flex-md-row justify-content-around align-items-center h-100">
            <!-- Network Status -->
            <div class="text-center mb-4 mb-md-0 d-flex flex-column justify-content-center">
              <div class="network-icon">
                <i class="fa fa-desktop"></i>
              </div>
              <div class="text-muted">Network Status</div>
              <h5 class="mt-2">{{ testResults.services.apiCore ? 'Connected' : 'Disconnected' }}</h5>
            </div>

            <!-- Twilio Connection Gauge -->
            <div class="text-center d-flex flex-column justify-content-center">
              <div class="gauge" :class="getTwilioQualityClass()">
                <div class="gauge-value">{{ getTwilioQualityValue() }}</div>
                <div class="gauge-label">{{ getTwilioQualityLabel() }}</div>
              </div>
              <div class="text-muted">Twilio Connection</div>
              <h5 class="mt-2" :class="getTwilioQualityTextClass()">
                {{ getTwilioQualityText() }}
              </h5>
            </div>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <!-- Test Results Panel -->
    <div v-if="testResults && !isTesting">
      <b-row>
        <b-col md="6" class="mb-4">
          <b-card title="Twilio Voice Test" class="h-100">
            <div class="twilio-stats">
              <div class="d-flex justify-content-between py-2 border-bottom">
                <strong>WebRTC Support</strong>
                <b-badge :variant="testResults.twilio.webRtcSupported ? 'success' : 'danger'" pill>
                  {{ testResults.twilio.webRtcSupported ? 'Supported' : 'Not Supported' }}
                </b-badge>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom">
                <strong>Twilio Connection</strong>
                <b-badge :variant="testResults.twilio.connected ? 'success' : 'danger'" pill>
                  {{ testResults.twilio.connected ? 'Connected' : 'Failed' }}
                </b-badge>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom">
                <strong>ICE Connection</strong>
                <b-badge :variant="testResults.twilio.iceConnectionStatus ? 'success' : 'danger'" pill>
                  {{ testResults.twilio.iceConnectionStatus ? 'Connected' : 'Failed' }}
                </b-badge>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom" v-if="testResults.twilio.iceStats">
                <strong>TURN Required</strong>
                <b-badge :variant="testResults.twilio.iceStats.isTurnRequired ? 'warning' : 'success'" pill>
                  {{ testResults.twilio.iceStats.isTurnRequired ? 'Yes' : 'No' }}
                </b-badge>
              </div>
              <div class="d-flex justify-content-between py-2" v-if="testResults.twilio.networkTiming && testResults.twilio.networkTiming.signaling">
                <strong>Signaling Time</strong>
                <span class="text-nowrap">{{ testResults.twilio.networkTiming.signaling.duration || '0' }} ms</span>
              </div>
            </div>

            <div class="mt-3" v-if="!testResults.twilio.connected || !testResults.twilio.webRtcSupported || !testResults.twilio.iceConnectionStatus">
              <b-alert show variant="warning">
                <p><strong>Twilio connection issues detected.</strong></p>
                <p v-if="!testResults.twilio.webRtcSupported">Your browser doesn't support WebRTC. Please try using a modern browser.</p>
                <p v-if="!testResults.twilio.connected || !testResults.twilio.iceConnectionStatus">
                  Please check your network settings to ensure Twilio services are accessible.
                </p>
              </b-alert>
            </div>
          </b-card>
        </b-col>

        <b-col md="6" class="mb-4">
          <b-card title="Backend Connection" class="h-100">
            <div class="service-stats">
              <div class="d-flex justify-content-between py-2 border-bottom">
                <strong>Backend API</strong>
                <b-badge :variant="testResults.services.apiCore ? 'success' : 'danger'" pill>
                  {{ testResults.services.apiCore ? 'Connected' : 'Failed' }}
                </b-badge>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom">
                <strong>API Response Time</strong>
                <span class="text-nowrap">{{ testResults.services.pingTime || '0' }} ms</span>
              </div>
              <div class="d-flex justify-content-between py-2">
                <strong>Live Updates (WebSocket)</strong>
                <b-badge :variant="testResults.services.soketi ? 'success' : 'danger'" pill>
                  {{ testResults.services.soketi ? 'Connected' : 'Failed' }}
                </b-badge>
              </div>
            </div>

            <div class="mt-3" v-if="!testResults.services.soketi || !testResults.services.apiCore">
              <b-alert show variant="warning">
                <p><strong>Service connection issues detected.</strong></p>
                <div v-if="!testResults.services.apiCore">
                  <p>API Core connection failed. Please check your network connection.</p>
                </div>
                <div v-if="!testResults.services.soketi">
                  <p>WebSocket connection to {{ soketiHost }} failed. Please ask your IT department to:</p>
                  <ul>
                    <li>Allow WebSocket ({{ wsProtocol }}) traffic on port {{ wsPort }}</li>
                    <li>Ensure there are no firewall rules blocking WebSocket connections</li>
                    <li>Check if any proxy server is properly configured for WebSocket traffic</li>
                  </ul>
                </div>
              </b-alert>
            </div>
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col md="6" class="mb-4">
          <b-card title="Device Permissions" class="h-100 device-permissions-card">
            <div class="results-list pl-0">
              <ul class="fa-ul device-permissions-list">
                <li v-if="testResults.overall.voiceCalls">
                  <span class="fa-li"><i class="fa fa-check-circle text-success"></i></span>
                  <span class="permission-text">Voice calls should work properly on this connection</span>
                </li>
                <li v-else>
                  <span class="fa-li"><i class="fa fa-times-circle text-danger"></i></span>
                  <span class="permission-text">Voice calls may experience issues on this connection</span>
                </li>

                <li v-if="testResults.permissions.microphone">
                  <span class="fa-li"><i class="fa fa-check-circle text-success"></i></span>
                  <span class="permission-text">Microphone permissions are granted</span>
                </li>
                <li v-else>
                  <span class="fa-li"><i class="fa fa-times-circle text-danger"></i></span>
                  <span class="permission-text">Microphone permissions are denied</span>
                </li>

                <li v-if="testResults.permissions.notifications">
                  <span class="fa-li"><i class="fa fa-check-circle text-success"></i></span>
                  <span class="permission-text">Notification permissions are granted</span>
                </li>
                <li v-else>
                  <span class="fa-li"><i class="fa fa-times-circle text-danger"></i></span>
                  <span class="permission-text">Notification permissions are denied</span>
                </li>

                <template>
                  <li v-if="testResults.storage.localStorage && testResults.storage.cookies">
                    <span class="fa-li"><i class="fa fa-check-circle text-success"></i></span>
                    <span class="permission-text">Browser storage is working properly</span>
                  </li>
                  <li v-else>
                    <span class="fa-li"><i class="fa fa-times-circle text-danger"></i></span>
                    <span class="permission-text">Browser storage has issues</span>
                  </li>
                </template>
              </ul>
            </div>
          </b-card>
        </b-col>

        <b-col md="6" class="mb-4">
          <b-card title="Twilio Connection Quality">
            <b-alert show :variant="getConnectionQualityAlertVariant()" class="mb-0">
              <h5 class="mb-0">{{ getTwilioQualityMessage() }}</h5>
            </b-alert>

            <!-- Show detailed Twilio report button when available -->
            <div v-if="preflightReport" class="mt-3 text-center">
              <b-button size="sm" variant="outline-secondary" v-b-toggle.twilio-report-collapse @click="detailedReportCollapsed = !detailedReportCollapsed">
                {{ detailedReportCollapsed ? 'Show Detailed Report' : 'Hide Detailed Report' }}
              </b-button>
              <b-collapse id="twilio-report-collapse" class="mt-2">
                <b-card>
                  <div class="twilio-report">
                    <!-- Overall Quality Section -->
                    <div class="mb-4">
                      <h5>Call Quality Score</h5>
                      <div class="d-flex flex-wrap align-items-center">
                        <div class="quality-indicator mr-3 mb-2"
                             :class="getQualityClass(preflightReport.callQuality)">
                          {{ preflightReport.callQuality || 'N/A' }}
                        </div>
                        <div class="text-left">
                          <div>MOS Score: <strong>{{ preflightReport.stats?.mos?.average?.toFixed(2) || 'N/A' }}</strong> / 5.0</div>
                          <div>Packet Loss: <strong>{{ preflightReport.totals?.packetsLostFraction || 0 }}%</strong></div>
                        </div>
                      </div>
                    </div>

                    <!-- Network Metrics Section -->
                    <div class="row mb-4">
                      <div class="col-md-4 col-sm-12 mb-3">
                        <div class="metric-card">
                          <h6>Round Trip Time</h6>
                          <div class="metric-value text-nowrap">{{ preflightReport.stats?.rtt?.average?.toFixed(0) || 'N/A' }} ms</div>
                          <div class="metric-range d-flex flex-column">
                            <small class="text-nowrap">Min: {{ preflightReport.stats?.rtt?.min || 'N/A' }} ms</small>
                            <small class="text-nowrap">Max: {{ preflightReport.stats?.rtt?.max || 'N/A' }} ms</small>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4 col-sm-12 mb-3">
                        <div class="metric-card">
                          <h6>Jitter</h6>
                          <div class="metric-value text-nowrap">{{ preflightReport.stats?.jitter?.average?.toFixed(1) || 'N/A' }} ms</div>
                          <div class="metric-range d-flex flex-column">
                            <small class="text-nowrap">Min: {{ preflightReport.stats?.jitter?.min || 'N/A' }} ms</small>
                            <small class="text-nowrap">Max: {{ preflightReport.stats?.jitter?.max || 'N/A' }} ms</small>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4 col-sm-12 mb-3">
                        <div class="metric-card">
                          <h6>Selected Edge</h6>
                          <div class="metric-value" :title="preflightReport.selectedEdge || 'N/A'" style="font-size: 0.9rem; white-space: normal; line-height: 1.3;">
                            <template v-if="preflightReport.selectedEdge && Array.isArray(preflightReport.selectedEdge)">
                              <div v-for="(edge, index) in preflightReport.selectedEdge" :key="index" class="mb-1">{{ edge }}</div>
                            </template>
                            <template v-else>
                              {{ preflightReport.selectedEdge || 'N/A' }}
                            </template>
                          </div>
                          <div class="metric-detail">
                            <small>Actual: <span class="text-nowrap">{{ preflightReport.edge || 'N/A' }}</span></small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Connection Details -->
                    <div class="mb-4">
                      <h5>Connection Details</h5>
                      <div class="row connection-details-container">
                        <div class="col-md-6 col-sm-12 mb-3">
                          <div class="connection-details">
                            <div class="text-nowrap"><strong>TURN Required:</strong> {{ preflightReport.isTurnRequired ? 'Yes' : 'No' }}</div>
                            <div class="text-nowrap"><strong>Codec Used:</strong> {{ preflightReport.samples?.[0]?.codecName || 'N/A' }}</div>
                            <div class="text-nowrap"><strong>Test Duration:</strong> {{ (preflightReport.testTiming?.duration / 1000).toFixed(1) || 'N/A' }} seconds</div>
                          </div>
                        </div>
                        <div class="col-md-6 col-sm-12 mb-3">
                          <div class="connection-details">
                            <div class="text-nowrap"><strong>Data Sent:</strong> {{ formatBytes(preflightReport.totals?.bytesSent) }}</div>
                            <div class="text-nowrap"><strong>Data Received:</strong> {{ formatBytes(preflightReport.totals?.bytesReceived) }}</div>
                            <div class="text-nowrap"><strong>Packets Exchanged:</strong> {{ (preflightReport.totals?.packetsSent || 0) + (preflightReport.totals?.packetsReceived || 0) }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Timing Information -->
                    <div class="mb-4">
                      <h5>Connection Timing</h5>
                      <div class="timing-bars">
                        <div v-if="preflightReport.networkTiming">
                          <div class="timing-row">
                            <div class="timing-bar-label">Signaling:</div>
                            <div class="timing-bar-container">
                              <div class="timing-bar bg-info text-nowrap"
                                   :style="{width: getTimingBarWidth(preflightReport.networkTiming.signaling.duration) + '%', minWidth: '60px'}"
                                   :title="preflightReport.networkTiming.signaling.duration + 'ms'">
                                {{ preflightReport.networkTiming.signaling.duration }}ms
                              </div>
                            </div>
                          </div>

                          <div class="timing-row">
                            <div class="timing-bar-label">ICE Setup:</div>
                            <div class="timing-bar-container">
                              <div class="timing-bar bg-success text-nowrap"
                                   :style="{width: getTimingBarWidth(preflightReport.networkTiming.ice.duration) + '%', minWidth: '60px'}"
                                   :title="preflightReport.networkTiming.ice.duration + 'ms'">
                                {{ preflightReport.networkTiming.ice.duration }}ms
                              </div>
                            </div>
                          </div>

                          <div class="timing-row">
                            <div class="timing-bar-label">DTLS Handshake:</div>
                            <div class="timing-bar-container">
                              <div class="timing-bar bg-warning text-nowrap"
                                   :style="{width: getTimingBarWidth(preflightReport.networkTiming.dtls.duration) + '%', minWidth: '60px'}"
                                   :title="preflightReport.networkTiming.dtls.duration + 'ms'">
                                {{ preflightReport.networkTiming.dtls.duration }}ms
                              </div>
                            </div>
                          </div>

                          <div class="timing-row">
                            <div class="timing-bar-label">Total Connection:</div>
                            <div class="timing-bar-container">
                              <div class="timing-bar bg-primary text-nowrap"
                                   :style="{width: getTimingBarWidth(preflightReport.networkTiming.peerConnection.duration) + '%', minWidth: '60px'}"
                                   :title="preflightReport.networkTiming.peerConnection.duration + 'ms'">
                                {{ preflightReport.networkTiming.peerConnection.duration }}ms
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Selected Path -->
                    <div class="mb-2">
                      <h5>Selected Connection Path</h5>
                      <div class="connection-path">
                        <div class="row">
                          <div class="col-sm-5 col-12 text-center text-sm-right mb-2">
                            <div class="endpoint local">
                              <div class="network-type mb-1">{{ preflightReport.selectedIceCandidatePairStats?.localCandidate?.networkType || 'unknown' }}</div>
                              <div class="address text-truncate" :title="preflightReport.selectedIceCandidatePairStats?.localCandidate?.ip + ':' + preflightReport.selectedIceCandidatePairStats?.localCandidate?.port">
                                {{ preflightReport.selectedIceCandidatePairStats?.localCandidate?.ip }}:{{ preflightReport.selectedIceCandidatePairStats?.localCandidate?.port }}
                              </div>
                              <div class="candidate-type badge badge-info mt-1">{{ preflightReport.selectedIceCandidatePairStats?.localCandidate?.candidateType || 'unknown' }}</div>
                            </div>
                          </div>
                          <div class="col-sm-2 col-12 text-center mb-2">
                            <div class="connection-arrow">
                              <i class="fa fa-exchange-alt"></i>
                              <div class="protocol text-uppercase">{{ preflightReport.selectedIceCandidatePairStats?.localCandidate?.protocol || 'unknown' }}</div>
                            </div>
                          </div>
                          <div class="col-sm-5 col-12 text-center text-sm-left">
                            <div class="endpoint remote">
                              <div class="server-type mb-1">Twilio Edge Server</div>
                              <div class="address text-truncate" :title="preflightReport.selectedIceCandidatePairStats?.remoteCandidate?.ip + ':' + preflightReport.selectedIceCandidatePairStats?.remoteCandidate?.port">
                                {{ preflightReport.selectedIceCandidatePairStats?.remoteCandidate?.ip }}:{{ preflightReport.selectedIceCandidatePairStats?.remoteCandidate?.port }}
                              </div>
                              <div class="candidate-type badge badge-info mt-1">{{ preflightReport.selectedIceCandidatePairStats?.remoteCandidate?.candidateType || 'unknown' }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Toggle button for raw JSON data -->
                    <div class="mt-4 text-center">
                      <b-button size="sm" variant="outline-secondary" v-b-toggle.raw-json-collapse @click="rawJsonCollapsed = !rawJsonCollapsed">
                        {{ rawJsonCollapsed ? 'Show Raw JSON Data' : 'Hide Raw JSON Data' }}
                      </b-button>
                      <b-collapse id="raw-json-collapse" class="mt-2">
                        <pre class="text-left" style="max-height: 300px; overflow-y: auto; font-size: 12px;">{{ JSON.stringify(preflightReport, null, 2) }}</pre>
                      </b-collapse>
                    </div>
                  </div>
                </b-card>
              </b-collapse>
            </div>
          </b-card>
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>

<script>
import { Device } from '@twilio/voice-sdk'
import talk2Api from 'src/plugins/api/api'
import { settingsLayoutMixin } from 'src/plugins/mixins'

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
      wsPort: null,
      preflightTest: null,
      preflightReport: null,
      testCount: 0,
      lastTestTime: null,
      detailedReportCollapsed: true,
      rawJsonCollapsed: true
    }
  },

  methods: {
    async testConnection () {
      this.isTesting = true
      this.testCount++
      this.lastTestTime = new Date()

      // Reset collapse states when starting a new test
      this.detailedReportCollapsed = true
      this.rawJsonCollapsed = true

      try {
        // Initialize test results
        this.testResults = {
          network: {
            networkType: 'Unknown',
            jitter: 0
          },
          twilio: {
            connected: false,
            webRtcSupported: false,
            iceConnectionStatus: false,
            networkTiming: null,
            iceStats: null
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
            cookies: false
          },
          overall: {
            voiceCalls: false
          }
        }

        // Test Twilio Voice connectivity using the official PreflightTest API
        await this.testTwilioRequirements()

        // Test permissions
        await this.testPermissions()

        // Test services
        await this.testServices()

        // Test storage
        await this.testStorage()

        // Determine overall status
        this.evaluateOverallStatus()

        // Save test results to localStorage
        try {
          localStorage.setItem('connectionTestResults', JSON.stringify({
            timestamp: this.lastTestTime,
            results: this.testResults,
            preflightReport: this.preflightReport,
            testCount: this.testCount
          }))
        } catch (error) {
          console.error('Error saving test results:', error)
        }
      } catch (error) {
        console.error('Connection test error:', error)
      } finally {
        this.isTesting = false
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

        // Get access token for PreflightTest
        let token
        try {
          const tokenResponse = await this.getTwilioAccessToken()

          // Extract the token - the dialer endpoint returns the token directly,
          // while the Talk2 API returns it in a data.token property
          token = tokenResponse
          if (typeof tokenResponse === 'object' && tokenResponse !== null) {
            // If it's from the dialer endpoint, it may be the token itself
            token = tokenResponse.token || tokenResponse
          }
        } catch (error) {
          console.error('Could not get valid Twilio token:', error)
          this.testResults.twilio.connected = false
          this.testResults.twilio.iceConnectionStatus = false
          this.testResults.twilio.error = {
            code: 'token_error',
            message: 'Failed to get a valid Twilio token'
          }

          // Try basic connectivity test to Twilio domain
          await this.fallbackTwilioConnectivityTest()
          return
        }

        // Create and run the preflight test
        console.log('Starting Twilio PreflightTest')
        this.preflightTest = Device.runPreflight(token, {
          codecPreferences: ['opus', 'pcmu'],
          edge: ['umatilla', 'ashburn', 'roaming'],
          fakeMicInput: true, // Don't require a real microphone for the test
          signalingTimeoutMs: 10000
        })

        // Promise to wait for the test to complete
        await new Promise((resolve, reject) => {
          // Set a timeout just in case
          const timeout = setTimeout(() => {
            if (this.preflightTest) {
              this.preflightTest.stop()
            }
            reject(new Error('PreflightTest timeout'))
          }, 15000) // 15 second max test time

          // Listen for connection event
          this.preflightTest.on('connected', () => {
            console.log('PreflightTest connected to Twilio')
            this.testResults.twilio.connected = true
          })

          // Listen for test completion
          this.preflightTest.on('completed', (report) => {
            console.log('PreflightTest completed successfully', report)
            clearTimeout(timeout)

            // Store the report for debugging
            this.preflightReport = report

            // Update test results with details from the report
            this.testResults.twilio.connected = true
            this.testResults.twilio.iceConnectionStatus = true
            this.testResults.twilio.networkTiming = report.networkTiming
            this.testResults.twilio.iceStats = {
              candidates: report.iceCandidateStats,
              selectedPair: report.selectedIceCandidatePairStats,
              isTurnRequired: report.isTurnRequired || false
            }

            resolve()
          })

          // Listen for test failure
          this.preflightTest.on('failed', (error) => {
            console.error('PreflightTest failed', error)
            clearTimeout(timeout)

            // Mark as connected to Twilio, but ICE connectivity failed
            // This allows the test to continue and doesn't mark everything as failed
            // when the token is invalid but basic connectivity exists
            this.testResults.twilio.connected = true
            this.testResults.twilio.iceConnectionStatus = false
            this.testResults.twilio.error = {
              code: error.code,
              message: error.message
            }

            // Store the error for debugging
            this.preflightReport = { error }

            // If connection to Twilio failed, try a basic fetch to Twilio domain
            this.fallbackTwilioConnectivityTest()
              .then(resolve)
              .catch(resolve) // Resolve anyway to continue with other tests
          })
        })
      } catch (error) {
        console.error('Twilio requirements test error:', error)
        this.testResults.twilio.connected = false
        this.testResults.twilio.iceConnectionStatus = false

        // Try fallback test
        await this.fallbackTwilioConnectivityTest()
      }
    },

    async fallbackTwilioConnectivityTest () {
      try {
        await fetch('https://api.twilio.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store'
        })
        // We can at least reach Twilio's domain
        this.testResults.twilio.connected = true
        console.log('Fallback Twilio connectivity test: Success')
      } catch (e) {
        this.testResults.twilio.connected = false
        console.log('Fallback Twilio connectivity test: Failed')
      }
    },

    async getTwilioAccessToken () {
      try {
        // First try to use the same endpoint that dialer component uses
        console.log('Trying to get Twilio token from dialer endpoint')

        try {
          const response = await this.$axios.post('/api/v1/dialer/new-mobile-token', { reset: false })
          if (response && response.data) {
            console.log('Successfully retrieved token from dialer endpoint')
            return response.data
          }
        } catch (dialerError) {
          console.warn('Failed to get token from dialer endpoint:', dialerError)
          // Continue to try fallback methods
        }

        // Next, try the Talk2 API if available
        if (talk2Api.V1 && talk2Api.V1.twilio && talk2Api.V1.twilio.token) {
          console.log('Trying to get Twilio token from Talk2 API')
          const response = await talk2Api.V1.twilio.token()
          if (response && response.data && response.data.token) {
            console.log('Successfully retrieved token from Talk2 API')
            return response.data.token
          }
        }

        // If we got here, no token was available
        console.error('Failed to get a valid Twilio token from any source')
        throw new Error('No valid Twilio token available')
      } catch (error) {
        console.error('Failed to get Twilio token:', error)
        throw error // Let the caller handle the error
      }
    },

    async testPermissions () {
      try {
        // Test microphone access
        let micAccessGranted = false
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          micAccessGranted = true

          // Release the stream when done
          stream.getTracks().forEach(track => track.stop())
        } catch (error) {
          console.error('Microphone access error:', error)
          micAccessGranted = false
        }

        this.testResults.permissions.microphone = micAccessGranted

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

          // Determine if we're in a desktop app (Electron)
          const isDesktopApp = window.process && window.process.versions && window.process.versions.electron

          // For desktop apps, always use secure WebSockets
          // For web browsers, determine based on current protocol
          this.wsProtocol = isDesktopApp ? 'wss://' : (window.location.protocol === 'https:' ? 'wss://' : 'ws://')
          this.wsPort = isDesktopApp ? '443' : (window.location.protocol === 'https:' ? '443' : '6001')

          // Use Echo to test the connection instead of raw WebSocket
          // This will work better in a desktop environment
          if (window.Echo && window.Echo.connector && window.Echo.connector.pusher && window.Echo.connector.pusher.connection) {
            // If Echo is already initialized and connected, use it to check
            this.testResults.services.soketi = window.Echo.connector.pusher.connection.state === 'connected'
          } else {
            // If window.Echo doesn't exist or is not properly initialized, check if we can create a temporary Echo
            const { default: Echo } = await import('laravel-echo')
            const { local } = await import('src/plugins/helpers/storage')

            // Create a temporary Echo instance specifically for testing
            const testEcho = new Echo({
              broadcaster: 'pusher',
              key: WS_APP_KEY,
              wsHost: WS_HOST,
              wssHost: WS_HOST,
              encrypted: true,
              forceTLS: true,
              auth: {
                headers: {
                  Authorization: `Bearer ${local.getItem('api_token')}`,
                  driver: 'soketi'
                }
              },
              enabledTransports: ['ws', 'wss'],
              disableStats: true
            })

            let socketConnected = false

            // Test the connection with a promise
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                if (!socketConnected) {
                  testEcho.disconnect()
                  reject(new Error('WebSocket connection timeout'))
                }
              }, 5000)

              testEcho.connector.pusher.connection.bind('connected', () => {
                socketConnected = true
                clearTimeout(timeout)
                testEcho.disconnect()
                resolve()
              })

              testEcho.connector.pusher.connection.bind('error', (error) => {
                clearTimeout(timeout)
                console.error('Echo connection error:', error)
                testEcho.disconnect()
                reject(error)
              })
            })

            this.testResults.services.soketi = socketConnected
          }
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
        // Determine if we're in a desktop app (Electron)
        const isDesktopApp = window.process && window.process.versions && window.process.versions.electron

        // In desktop environments, access to storage should be OK
        // but the standard test might fail due to different storage implementation
        if (isDesktopApp) {
          try {
            // Test using the local storage helper directly when available
            const { local } = await import('src/plugins/helpers/storage')

            // Try to set and get a test value
            local.setItem('connectionTest', 'test')
            const testValue = local.getItem('connectionTest')
            this.testResults.storage.localStorage = testValue === 'test'
            local.removeItem('connectionTest')

            // In desktop apps, cookies are less relevant, so consider them working
            // Most Electron apps use localStorage or IndexedDB instead
            this.testResults.storage.cookies = true
          } catch (e) {
            console.error('Desktop storage test error:', e)
            this.testResults.storage.localStorage = false
            this.testResults.storage.cookies = false
          }
        } else {
          // Regular browser tests
          // Test localStorage
          try {
            localStorage.setItem('connectionTest', 'test')
            const testValue = localStorage.getItem('connectionTest')
            this.testResults.storage.localStorage = testValue === 'test'
            localStorage.removeItem('connectionTest')
          } catch (e) {
            this.testResults.storage.localStorage = false
          }

          // Test cookies
          try {
            document.cookie = 'connectionTest=test; max-age=60'
            this.testResults.storage.cookies = document.cookie.indexOf('connectionTest=test') !== -1
            document.cookie = 'connectionTest=; max-age=0' // Clear the test cookie
          } catch (e) {
            this.testResults.storage.cookies = false
          }
        }
      } catch (error) {
        console.error('Storage test error:', error)
        this.testResults.storage.localStorage = false
        this.testResults.storage.cookies = false
      }
    },

    evaluateOverallStatus () {
      // Determine if suitable for voice calls
      this.testResults.overall.voiceCalls = (
        this.testResults.twilio.webRtcSupported &&
        this.testResults.permissions.microphone &&
        this.testResults.services.apiCore &&
        this.testResults.twilio.connected
      )
    },

    getQualityClass (quality) {
      if (!quality) return 'secondary'
      switch (quality) {
        case 'excellent': return 'success'
        case 'good': return 'info'
        case 'fair': return 'warning'
        case 'poor': return 'danger'
        default: return 'secondary'
      }
    },

    getTimingBarWidth (duration) {
      if (!duration) return 0
      const maxDuration = 3000 // Assuming most connections take less than 3 seconds
      return Math.min((duration / maxDuration) * 100, 100) // Cap at 100%
    },

    formatBytes (bytes) {
      if (bytes === 0 || !bytes) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    getConnectionQualityAlertVariant () {
      if (!this.testResults) return 'secondary'
      if (!this.testResults.twilio.connected) return 'danger'
      if (!this.testResults.twilio.iceConnectionStatus) return 'warning'

      // Use MOS score for alert coloring when available
      if (this.preflightReport && this.preflightReport.stats && this.preflightReport.stats.mos && this.preflightReport.stats.mos.average) {
        const mosScore = this.preflightReport.stats.mos.average
        if (mosScore > 4.0) return 'success'
        if (mosScore > 3.5) return 'info'
        if (mosScore > 3.0) return 'warning'
        return 'danger'
      }

      // Fallback to moderate quality when MOS not available
      return 'info'
    },

    getTwilioQualityClass () {
      if (!this.testResults) return 'gauge-danger'
      if (!this.testResults.twilio.connected) return 'gauge-danger'
      if (!this.testResults.twilio.iceConnectionStatus) return 'gauge-warning'

      // Use MOS score for gauge coloring when available
      if (this.preflightReport && this.preflightReport.stats && this.preflightReport.stats.mos && this.preflightReport.stats.mos.average) {
        const mosScore = this.preflightReport.stats.mos.average
        if (mosScore > 4.0) return 'gauge-success'
        if (mosScore > 3.5) return 'gauge-info'
        if (mosScore > 3.0) return 'gauge-warning'
        return 'gauge-danger'
      }

      // Fallback to moderate quality if MOS not available
      return 'gauge-info'
    },

    getTwilioQualityValue () {
      if (!this.testResults) return 'X'
      if (!this.testResults.twilio.connected) return 'X'
      if (!this.testResults.twilio.iceConnectionStatus) return '!'

      if (this.preflightReport && this.preflightReport.stats && this.preflightReport.stats.mos && this.preflightReport.stats.mos.average) {
        return this.preflightReport.stats.mos.average.toFixed(1)
      }

      return 'OK'
    },

    getTwilioQualityLabel () {
      if (this.preflightReport && this.preflightReport.stats && this.preflightReport.stats.mos && this.preflightReport.stats.mos.average) {
        return 'MOS'
      }

      return ''
    },

    getTwilioQualityText () {
      if (!this.testResults) return 'Unknown'
      if (!this.testResults.twilio.connected) return 'Failed'
      if (!this.testResults.twilio.iceConnectionStatus) return 'Limited'

      // Use MOS score for quality rating when available
      if (this.preflightReport && this.preflightReport.stats && this.preflightReport.stats.mos && this.preflightReport.stats.mos.average) {
        const mosScore = this.preflightReport.stats.mos.average
        if (mosScore > 4.0) return 'Excellent'
        if (mosScore > 3.5) return 'Good'
        if (mosScore > 3.0) return 'Fair'
        return 'Poor'
      }

      // Fallback to moderate quality if MOS not available
      return 'Good'
    },

    getTwilioQualityTextClass () {
      if (!this.testResults) return 'text-secondary'
      if (!this.testResults.twilio.connected) return 'text-danger'
      if (!this.testResults.twilio.iceConnectionStatus) return 'text-warning'

      // Use MOS score for color coding when available
      if (this.preflightReport && this.preflightReport.stats && this.preflightReport.stats.mos && this.preflightReport.stats.mos.average) {
        const mosScore = this.preflightReport.stats.mos.average
        if (mosScore > 4.0) return 'text-success'
        if (mosScore > 3.5) return 'text-info'
        if (mosScore > 3.0) return 'text-warning'
        return 'text-danger'
      }

      // Fallback to moderate quality if MOS not available
      return 'text-info'
    },

    getTwilioQualityMessage () {
      if (!this.testResults) return 'Connection test not run'

      if (!this.testResults.twilio.connected) {
        return 'Could not establish connection to Twilio servers'
      }

      if (!this.testResults.twilio.iceConnectionStatus) {
        return 'Connected to Twilio, but WebRTC connection failed'
      }

      // Use MOS score for quality assessment when available
      if (this.preflightReport && this.preflightReport.stats && this.preflightReport.stats.mos && this.preflightReport.stats.mos.average) {
        const mosScore = this.preflightReport.stats.mos.average
        if (mosScore > 4.0) {
          return 'Excellent connection quality for voice calls'
        } else if (mosScore > 3.5) {
          return 'Good connection quality for voice calls'
        } else if (mosScore > 3.0) {
          return 'Fair connection quality for voice calls'
        } else {
          return 'Poor connection quality, Voice calls may experience issues'
        }
      }

      // Fallback to moderate quality if MOS not available
      return 'Good connection quality for voice calls'
    }
  },
  mounted () {
    // Check if we have recent test results saved in localStorage
    try {
      const savedTestData = localStorage.getItem('connectionTestResults')
      if (savedTestData) {
        const parsedData = JSON.parse(savedTestData)

        // Only use saved data if it's less than 12 hours old
        const savedTime = new Date(parsedData.timestamp)
        const twelveHoursAgo = new Date(Date.now() - (12 * 60 * 60 * 1000))

        if (savedTime > twelveHoursAgo) {
          console.log('Using saved test results from:', savedTime)
          this.testResults = parsedData.results
          this.preflightReport = parsedData.preflightReport
          this.lastTestTime = savedTime
          this.testCount = parsedData.testCount || 1
          return // Don't run new test if we have recent results
        }
      }
    } catch (error) {
      console.error('Error loading saved test results:', error)
    }

    // Run new test if no recent results exist
    this.testConnection()
  },

  beforeDestroy () {
    // Clean up resources if test is still running
    if (this.preflightTest) {
      this.preflightTest.stop()
      this.preflightTest = null
    }
  }
}
</script>

<style>
.quality-indicator {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-transform: capitalize;
  display: inline-block;
  min-width: 120px;
  text-align: center;
}

.quality-indicator.success {
  background-color: #28a745;
  color: white;
}

.quality-indicator.info {
  background-color: #17a2b8;
  color: white;
}

.quality-indicator.warning {
  background-color: #ffc107;
  color: black;
}

.quality-indicator.danger {
  background-color: #dc3545;
  color: white;
}

.metric-card {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 0.8rem;
  margin-bottom: 1rem;
  text-align: center;
  height: 100%;
}

.metric-value {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0.5rem 0;
  word-break: normal;
  white-space: nowrap;
}

.metric-range, .metric-detail {
  font-size: 0.75rem;
  line-height: 1.2;
}

.connection-details {
  margin: 0;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0.3rem;
  height: 100%;
  font-size: 0.9rem;
}

.timing-bars {
  position: relative;
}

.timing-row {
  margin-bottom: 1.7rem;
  display: flex;
  width: 100%;
  position: relative;
}

.timing-bar-label {
  font-weight: bold;
  margin-bottom: 0;
  text-align: right;
  padding-right: 15px;
  font-size: 0.9rem;
  width: 150px;
  min-width: 150px;
  max-width: 150px;
  flex: 0 0 150px;
}

.timing-bar-container {
  height: 24px;
  background-color: #f1f1f1;
  border-radius: 4px;
  overflow: hidden;
  flex-grow: 1;
  position: relative;
}

.timing-bar {
  height: 100%;
  line-height: 24px;
  color: white;
  text-align: center;
  padding: 0 8px;
  border-radius: 4px;
  min-width: 60px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7);
}

.connection-path {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.endpoint {
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  word-break: break-word;
}

.endpoint .address {
  font-family: monospace;
  font-weight: bold;
  word-break: break-all;
  font-size: 0.85rem;
}

.network-type, .server-type {
  font-size: 0.85rem;
}

.protocol {
  font-weight: bold;
  color: #6c757d;
  font-size: 0.8rem;
}

.connection-arrow {
  margin-top: 1.5rem;
}

.connection-arrow i {
  font-size: 1.5rem;
}

/* New styles for the redesigned UI */
.test-control-panel {
  min-height: 280px;
}

.connection-test-image {
  opacity: 0.8;
}

.quick-stats-panel {
  min-height: 280px;
}

.gauge {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  border: 6px solid;
}

.gauge-success {
  border-color: #28a745;
}

.gauge-info {
  border-color: #17a2b8;
}

.gauge-warning {
  border-color: #ffc107;
}

.gauge-danger {
  border-color: #dc3545;
}

.gauge-unknown {
  border-color: #6c757d;
}

.gauge-value {
  font-size: 1.8rem;
  font-weight: bold;
  line-height: 1;
}

.gauge-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.network-icon {
  width: 80px;
  height: 80px;
  background-color: #f8f9fa;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  font-size: 2rem;
  color: #6c757d;
}

.results-list ul {
  padding-left: 1.5rem;
}

.results-list li {
  margin-bottom: 0.8rem;
}

.border-bottom {
  border-bottom: 1px solid #eee;
}

@media (max-width: 767.98px) {
  .quality-indicator {
    font-size: 1.2rem;
    padding: 0.4rem 0.8rem;
    min-width: 100px;
  }

  .metric-value {
    font-size: 1.1rem;
  }

  .metric-range, .metric-detail {
    font-size: 0.7rem;
  }

  .connection-path {
    padding: 0.5rem;
  }

  .endpoint {
    max-width: 100%;
  }

  .endpoint .address, .network-type, .server-type, .protocol {
    font-size: 0.75rem;
  }

  .connection-details {
    font-size: 0.8rem;
  }

  .metric-card {
    padding: 0.5rem;
  }

  .timing-bar-label {
    width: 120px;
    min-width: 120px;
    max-width: 120px;
    flex: 0 0 120px;
    font-size: 0.8rem;
  }
}

@media (max-width: 359px) {
  .metric-card {
    min-width: 90px;
  }

  .metric-value {
    font-size: 1rem;
  }
}

/* Additional CSS for small screens to improve display of stats */
.twilio-stats span, .service-stats span {
  line-height: inherit;
  white-space: nowrap;
}

@media (max-width: 359px) {
  .results-list li {
    white-space: normal;
  }

  .d-flex.justify-content-between {
    flex-wrap: wrap;
  }

  .d-flex.justify-content-between > strong {
    margin-right: 0.5rem;
  }
}

/* Additional CSS for medium-small screens to fix the layout between mobile and desktop */
@media (min-width: 768px) and (max-width: 991.98px) {
  .metric-card {
    display: flex;
    flex-direction: row;
    text-align: left;
    align-items: center;
    padding: 0.6rem;
  }

  .metric-card h6 {
    margin-bottom: 0;
    margin-right: 1rem;
    min-width: 85px;
  }

  .metric-value {
    margin: 0;
    font-size: 1.1rem;
    margin-right: 0.5rem;
  }

  .metric-range, .metric-detail {
    text-align: right;
    margin-left: auto;
    font-size: 0.7rem;
  }

  .endpoint {
    display: flex;
    flex-direction: column;
  }

  .connection-path .row {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .connection-arrow {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .connection-arrow i {
    margin-right: 0.5rem;
  }

  .protocol {
    margin: 0;
  }

  /* Adjust spacing in connection details */
  .connection-details {
    display: flex;
    flex-direction: column;
  }

  .timing-bar-container {
    height: 20px;
  }

  .timing-bar {
    line-height: 20px;
    font-size: 0.8rem;
  }
}

/* Specific fixes for the connection path display */
@media (max-width: 991.98px) {
  .endpoint .address {
    max-width: 140px;
    margin: 0 auto;
  }

  .network-type, .server-type {
    max-width: 140px;
    margin: 0 auto;
  }

  .candidate-type {
    margin: 0 auto;
    margin-top: 0.25rem;
  }
}

/* Additional CSS for the timing bars */
.timing-row {
  margin-bottom: 1.7rem;
  align-items: center;
}

/* Make the h5 headings in the detailed report look like proper headers */
.twilio-report h5 {
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
  border-bottom: 2px solid #dee2e6;
  text-transform: uppercase;
  font-size: 0.95rem;
  color: #495057;
  letter-spacing: 0.5px;
}

@media (min-width: 768px) and (max-width: 991.98px) {
  .timing-bar-label {
    min-width: 105px;
    font-size: 0.8rem;
  }

  .connection-details-container {
    margin: 0 -0.5rem;
  }

  .connection-details {
    margin: 0 0.5rem;
  }
}

/* Device Permissions List Styling */
.device-permissions-card .card-body {
  padding-left: 1.25rem;
}

.device-permissions-list {
  padding-left: 1.5rem !important;
  margin-left: 0;
  text-align: left;
}

.device-permissions-list .fa-li {
  position: absolute;
  width: 1.5rem;
  text-align: center;
}

.device-permissions-list li {
  position: relative;
  padding-left: 0;
  margin-bottom: 1rem;
  list-style-type: none;
}

.permission-text {
  display: inline-block;
  padding-left: 0;
}
</style>
