<template>
  <div>
    <div class="flex">
      <div id="dropzone" @dragover="$event.preventDefault()" @drop="drop($event)" draggable="true">
        <span v-if="!imgUrl"> Drag files here</span>
        <img v-else :src="imgUrl" id="img">
      </div>
      <div class="text">
        <div v-for="item in prediction">识别为：{{ item.className }}
          <div>可能性：{{ (item.probability * 100).toFixed(2) + '%' }}</div>
        </div>
      </div>
    </div>
    <div class="operate">
      <el-button type="primary" @click="beginClassify">图片识别</el-button>
    </div>
  </div>
</template>
<script>
// 1.引入tesseract.js
import * as tf from '@tensorflow/tfjs';
const { ipcRenderer, app } = require('electron')
const mobilenet = require('@tensorflow-models/mobilenet');

export default {
  data () {
    return {
      imgUrl: '',
      image_text: '',
      prediction: ''
    }
  },
  async mounted () {
    const model = await mobilenet.load();
  },
  methods: {
    async beginClassify () {
      const img = document.getElementById('img');

      // Load the model.
      const model = await mobilenet.load();

      // Classify the image.
      const predictions = await model.classify(img);

      console.log('Predictions: ', predictions);
      this.prediction = predictions
    },
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

.flex {
  display: flex;
}

.text {
  margin: 20px;
  padding: 12px;
}

.operate {
  text-align: center;
}
</style>
