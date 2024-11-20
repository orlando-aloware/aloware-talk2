// Event name constants
export const RTT_EVENT = 'rtt'
export const MOS_EVENT = 'mos'
export const JITTER_EVENT = 'jitter'
export const HIGH_PACKET_LOSS_EVENT = 'high-packet-loss'
export const HIGH_PACKETS_LOST_FRACTION_EVENT = 'high-packets-lost-fraction'
export const BYTES_RECEIVED_EVENT = 'bytesReceived'
export const BYTES_SENT_EVENT = 'bytesSent'

export const networkIssues = {
  [RTT_EVENT]: {
    description: 'Outbound high latency',
    trigger: 'Round Trip Time (RTT) > 400 ms for 3 out of last 5 samples',
    details: 'Round-trip-time (RTT) is the measure of latency in the network. Higher latency can result in perceptible delays in audio.',
    bucketing: [
      { min: 300, max: Infinity },
      { min: 200, max: 300 },
      { min: 150, max: 200 },
      { min: 0, max: 150 }
    ]
  },
  [MOS_EVENT]: {
    description: 'Outbound low MOS',
    trigger: 'Mean Opinion Score (MOS) < 3.5 for 3 out of last 5 samples',
    details: 'Mean Opinion Score (MOS) is a measure of the overall network conditions that affect call quality.',
    bucketing: [
      { min: 0, max: 2.4 },
      { min: 2.5, max: 2.9 },
      { min: 3.0, max: 3.4 },
      { min: 3.5, max: 5.0 }
    ]
  },
  [JITTER_EVENT]: {
    description: 'Inbound high jitter',
    trigger: 'Jitter > 30 ms for 3 out of last 5 samples',
    details: 'Jitter is the measure of variability at which packets arrive at the SDK sensors. High jitter can result in audio quality problems.',
    bucketing: [
      { min: 40, max: Infinity },
      { min: 36, max: 40 },
      { min: 30, max: 35 },
      { min: 0, max: 29 }
    ]
  },
  [HIGH_PACKET_LOSS_EVENT]: {
    description: 'Inbound packet loss',
    trigger: 'Packet loss > 1% in 3 out of last 5 samples',
    details: 'Packet loss is measured as the percentage of packets that were sent but not received at the SDK sensors. High packet loss can result in choppy audio or a dropped call.',
    bucketing: [
      { min: 3, max: Infinity },
      { min: 2, max: 3 },
      { min: 1, max: 2 },
      { min: 0, max: 1 }
    ]
  },
  [HIGH_PACKETS_LOST_FRACTION_EVENT]: {
    description: 'Inbound packet loss Fraction',
    trigger: 'Packet loss > 3% in 7 out of last 10 samples',
    details: 'A more severe event than merely high-packet-loss. Packet loss can result in choppy audio or a dropped call.',
    bucketing: [
      { min: 3, max: Infinity },
      { min: 2, max: 3 },
      { min: 1, max: 2 },
      { min: 0, max: 1 }
    ]
  },
  [BYTES_RECEIVED_EVENT]: {
    description: 'Low bytes received',
    trigger: 'Bytes received = 0 for three consecutive seconds',
    details: 'The SDK sensors detect no bytes being received at the SDK (JS SDK only).',
    bucketing: [{ min: 0, max: 0 }]
  },
  [BYTES_SENT_EVENT]: {
    description: 'Low bytes sent',
    trigger: 'Bytes sent = 0 for three consecutive seconds',
    details: 'The SDK sensors detect no bytes being sent from the SDK (JS SDK only).',
    bucketing: [{ min: 0, max: 0 }]
  }
}
