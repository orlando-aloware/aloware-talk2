export const networkIssues = {
  rtt: {
    description: 'Outbound high latency',
    trigger: 'Round Trip Time (RTT) > 400 ms for 3 out of last 5 samples',
    details: 'Round-trip-time (RTT) is the measure of latency in the network. Higher latency can result in perceptible delays in audio.',
    bucketing: [
      {
        min: 300,
        max: Infinity
      }, {
        min: 200,
        max: 300
      }, {
        min: 150,
        max: 200
      }, {
        min: 0,
        max: 150
      }
    ]
  },
  mos: {
    description: 'Outbound low MOS',
    trigger: 'Mean Opinion Score (MOS) < 3.5 for 3 out of last 5 samples',
    details: 'Mean Opinion Score (MOS) is a measure of the overall network conditions that affect call quality.',
    bucketing: [
      {
        min: 0,
        max: 2.4
      }, {
        min: 2.5,
        max: 2.9
      }, {
        min: 3.0,
        max: 3.4
      }, {
        min: 3.5,
        max: 5.0
      }
    ]
  },
  jitter: {
    description: 'Inbound high jitter',
    trigger: 'Jitter > 30 ms for 3 out of last 5 samples',
    details: 'Jitter is the measure of variability at which packets arrive at the SDK sensors. High jitter can result in audio quality problems.',
    bucketing: [
      {
        min: 40,
        max: Infinity
      }, {
        min: 36,
        max: 40
      }, {
        min: 30,
        max: 35
      }, {
        min: 0,
        max: 29
      }
    ]
  },
  packetsLostFraction: {
    description: 'Inbound packet loss',
    trigger: 'Packet loss > 3% in 7 out of last 10 samples',
    details: 'A more severe event than merely high-packet-loss. Packet loss can result in choppy audio or a dropped call.',
    bucketing: [
      {
        min: 3,
        max: Infinity
      }, {
        min: 2,
        max: 3
      }, {
        min: 1,
        max: 2
      }, {
        min: 0,
        max: 1
      }
    ]
  },
  bytesReceived: {
    description: 'Low bytes received',
    trigger: 'Bytes received = 0 for three consecutive seconds',
    details: 'The SDK sensors detect no bytes being received at the SDK (JS SDK only).',
    bucketing: [
      {
        min: 0,
        max: 0
      }
    ]
  },
  bytesSent: {
    description: 'Low bytes sent',
    trigger: 'Bytes sent = 0 for three consecutive seconds',
    details: 'The SDK sensors detect no bytes being sent from the SDK (JS SDK only).',
    bucketing: [
      {
        min: 0,
        max: 0
      }
    ]
  }
}
