/**
 * WebRTC video calls with signaling
 */

class VideoCall { constructor(signalingServerUrl = 'ws://localhost:3000') { this.signalingServerUrl = signalingServerUrl;
    this.peerConnection = null;
    this.localStream = null;
    this.ws = null;
    this.targetPeer = null; }

  async start(localVideo, remoteVideo, targetPeer = null) { this.localVideo = localVideo;
    this.remoteVideo = remoteVideo;
    this.targetPeer = targetPeer;

    try { this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localVideo.srcObject = this.localStream;

      this.peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

      this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));

      this.peerConnection.ontrack = event => { if (!this.remoteVideo.srcObject) { this.remoteVideo.srcObject = event.streams[0]; } };

      this.ws = new WebSocket(this.signalingServerUrl);
      this.ws.onopen = () =>       this.ws.onmessage = this.handleSignalingMessage.bind(this);
      this.ws.onerror = error => console.error('WebSocket error:', error);
      this.ws.onclose = () =>
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.sendSignalingMessage({ type: 'offer', sdp: this.peerConnection.localDescription });

      this.peerConnection.onicecandidate = event => { if (event.candidate) { this.sendSignalingMessage({ type: 'candidate', candidate: event.candidate }); } }; } ' }

  async handleSignalingMessage(message) { const msg = JSON.parse(message.data);
    if (msg.target && msg.target !== 'myPeerId') return;

    try { switch (msg.type) { case 'offer':
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.sendSignalingMessage({ type: 'answer', sdp: this.peerConnection.localDescription });
          break;
        case 'answer':
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          break;
        case 'candidate':
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
          break;
        default:
          console.warn('Unknown signaling message type: ', msg.type); }' }  }

  sendSignalingMessage(msg) { if (this.targetPeer) msg.target = this.targetPeer;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) { this.ws.send(JSON.stringify(msg));' } else { console.error('WebSocket not open'); } }

  stop() { if (this.localStream) this.localStream.getTracks().forEach(track => track.stop());
    if (this.peerConnection) this.peerConnection.close();
    if (this.ws) this.ws.close(); } }

if (typeof module !== 'undefined' && module.exports) { module.exports = VideoCall; }
