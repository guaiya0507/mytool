<template>
  <div>
    <div class="flex">
      <div id="dropzone" @dragover="$event.preventDefault()" @drop="drop($event)" draggable="true">
        <span v-if="!imgUrl"> Drag files here</span>
        <img v-else :src="imgUrl" alt="">
      </div>
      <div class="text">{{ image_text }}</div>
    </div>
    <div class="operate">
      <el-button type="primary" @click="beginOcr">图片识别</el-button>
    </div>
  </div>
</template>
<script>
// 1.引入tesseract.js
const { ipcRenderer, app } = require('electron')
export default {
  data () {
    return {
      imgUrl: '',
      image_text: ''
    }
  },
  mounted () {
    ipcRenderer.on('image_text', (event, message) => {
      this.image_text = message
      // 处理消息
    })
  },
  methods: {
    drop (ev) {
      ev.preventDefault()
      this.imgUrl = ev.dataTransfer.files[0].path; // FileList object.
    },
    beginOcr () {
      ipcRenderer.send('beginOcr', this.imgUrl);
    }
  },

}
</script>
<style scoped lang="scss">
#dropzone {
  width: 50%;
  height: 70vh;
  border: 2px dashed #000;
  margin: 20px;
  text-align: center;
  line-height: 70vh;
  position: relative;

  img {
    position: absolute;
    top: 0;
    bottom: 0;
    object-fit: contain;
    width: 100%;
    height: 70vh;
    left: 0;
  }
}
.flex{
  display: flex;
}
.text{
  width: 50%;
  margin: 20px;
  border: 2px solid #000;
  padding: 12px;
}
.operate{
  text-align: center;
}
</style>
