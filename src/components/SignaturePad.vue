<template>
  <div ref="container" class="sig-container">
    <canvas ref="canvas" class="sig-canvas" />
  </div>
</template>

<script>
import SignaturePad from 'signature_pad';

export default {
  name: 'SignaturePad',
  mounted() {
    this._pad = new SignaturePad(this.$refs.canvas, { backgroundColor: 'rgb(255,255,255)' });
    this._resizeCanvas();
    this._ro = new ResizeObserver(() => this._resizeCanvas());
    this._ro.observe(this.$refs.container);
  },
  beforeUnmount() {
    this._ro?.disconnect();
    this._pad?.off();
  },
  methods: {
    _resizeCanvas() {
      const canvas = this.$refs.canvas;
      if (!canvas || canvas.offsetWidth <= 0 || canvas.offsetHeight <= 0) return;
      const data = this._pad?.toData();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d').scale(ratio, ratio);
      this._pad?.clear();
      if (data?.length) this._pad?.fromData(data);
    },
    isEmpty() {
      return !this._pad || this._pad.isEmpty();
    },
    undo() {
      this._pad?.undo();
    },
    clear() {
      this._pad?.clear();
    },
    toDataURL(type = 'image/png') {
      const url = this._pad?.toDataURL(type) ?? null;
      // Guard against a zero-dimension canvas returning "data:," which breaks docx
      if (!url || url === 'data:,') return null;
      return url;
    },
  },
};
</script>

<style scoped>
.sig-container {
  border: 1px solid #bbb;
  border-radius: 4px;
  width: 100%;
  height: 200px;
  background: white;
  touch-action: none;
}
.sig-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  display: block;
}
</style>
