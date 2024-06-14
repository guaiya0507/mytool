<template>
  <div v-loading="loading" class="container">
    <el-row>
      <el-col :span="4" class="left">{{ activeMenu }}
        <el-menu v-model="activeMenu" :default-active="activeMenu" class="el-menu-vertical-demo" @select="selectMenu"
          @open="handleOpen" @close="handleClose">
          <el-menu-item index="1">
            <i class="el-icon-menu"></i>
            <span slot="title">视频转MP3</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="el-icon-scissors"></i>
            <span slot="title">视频压缩</span>
          </el-menu-item>
          <el-menu-item index="3">
            <i class="el-icon-document"></i>
            <span slot="title">添加水印</span>
          </el-menu-item>
          <el-menu-item index="4">
            <i class="el-icon-setting"></i>
            <span slot="title">录屏</span>
          </el-menu-item>
          <el-menu-item index="5">
            <i class="el-icon-setting"></i>
            <span slot="title">提取图片</span>
          </el-menu-item>
          <el-menu-item index="6">
            <i class="el-icon-setting"></i>
            <span slot="title">视频转GIF</span>
          </el-menu-item>
          <el-menu-item index="7">
            <i class="el-icon-setting"></i>
            <span slot="title">OCR文字识别</span>
          </el-menu-item>
          <el-menu-item index="8">
            <i class="el-icon-setting"></i>
            <span slot="title">机器学习</span>
          </el-menu-item>
          <el-menu-item index="9">
            <i class="el-icon-setting"></i>
            <span slot="title">英语学习</span>
          </el-menu-item>
          <el-menu-item index="10">
            <i class="el-icon-setting"></i>
            <span slot="title">3D</span>
          </el-menu-item>
        </el-menu>

      </el-col>
      <!-- 录屏 -->
      <el-col :span="20" style="padding:0 24px" v-if="activeMenu == 4">
        <el-button type="primary" @click="startRecord" style="margin-left: 24px;">开始录制</el-button>
        <el-button class="submit" type="success" @click="endRecord" icon="el-icon-video-play">结束录制</el-button>
      </el-col>
      <!-- ocr -->
      <el-col :span="20" style="padding:0 24px" v-else-if="activeMenu == 7">
        <OCR></OCR>
      </el-col>
      <el-col :span="20" style="padding:0 24px" v-else-if="activeMenu == 8">
        <MachineLearning></MachineLearning>
      </el-col>
      <el-col :span="20" style="padding:0 24px" v-else-if="activeMenu == 9">
        <english-learn></english-learn>
      </el-col>
      <el-col :span="20" style="padding:0 24px" v-else-if="activeMenu == 10">
        <Room3D></Room3D>
      </el-col>
      <el-col :span="20" class="right" v-else="activeMenu != 4 && activeMenu != 7">
        <div class="operate">
          <div class="leftOperate">
            <el-button type="success" @click="openFile" icon="el-icon-plus">添加文件</el-button>
            <el-button type="primary" icon="el-icon-folder-add">添加文件夹</el-button>
            <el-button type="danger" @click="clearAll" icon="el-icon-delete">清空列表</el-button>
          </div>
          <div class="rightOperate">
            <span v-if="activeMenu == 3">
              <el-input placeholder="请填写水印内容" v-model="waterMarkContent" class="input"></el-input>
            </span>
            <span v-if="activeMenu == 2">
                <span class="demonstration">压缩比率</span>
                <el-slider v-model="compressedRate"></el-slider>
            </span>
          </div>
        </div>

        <el-table class="table" :data="fileList" border style="height:70%"
          :header-cell-style="{ background: '#eef1f6', color: '#515a6e' }">
          <el-table-column fixed prop="name" label="文件名">
          </el-table-column>
          <el-table-column prop="size" label="大小"> </el-table-column>
          <el-table-column prop="path" label="文件路径"> </el-table-column>
          <el-table-column fixed="right" label="操作">
            <template slot-scope="scope">
              <el-button @click="playVideo(scope.row)" type="text" size="small">播放</el-button>
              <el-button type="text" size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- <div class="foot">
          <span>输出文件名称</span>
          <el-input v-model="outputName" class="input"></el-input>
        </div> -->
        <div class="foot">
          <span style="padding-right: 24px;">导出目录</span>
          <el-input disabled v-model="outputPath" class="input">
          </el-input>
          <el-button type="primary" @click="openFolder" style="margin-left: 24px;">打开目录</el-button>
        </div>
        <el-button class="submit" type="success" @click="operateVideo" icon="el-icon-video-play">开始转换</el-button>
      </el-col>
    </el-row>
    <VideoDialog :videoSrc="videoSrc" :dialogVisible.sync="dialogVisible"></VideoDialog>
  </div>
</template>
<script>
const { ipcRenderer, app } = require('electron')
import VideoDialog from './playVideo.vue'
import OCR from './OCR.vue'
import MachineLearning from './MachineLearning.vue'
import EnglishLearn from './EnglishLearn.vue'
import Room3D from './THREE/Scenery.vue'

export default {
  name: 'cluster',
  components: {
    VideoDialog,
    OCR,
    MachineLearning,
    EnglishLearn,
    Room3D
  },
  mounted () {
    // 监听来自主进程的消息
    ipcRenderer.on('file-opened', (event, message) => {
      console.log('Received message:', message)
      this.fileList.push(message)
      // 处理消息
    })
    // 监听来自主进程的消息
    ipcRenderer.on('file-saved', (event, message) => {
      console.log('Received message:', message)
      this.loading = false
      this.$message({
        message: `已保存至${this.outputPath}`,
        type: 'success'
      });
    })
    ipcRenderer.on('file-compressed', (event, message) => {
      this.loading = false
      console.log('Received message:', message)
      this.$message({
        message: `压缩文件已保存至${this.outputPath}`,
        type: 'success'
      });
    })
    ipcRenderer.on('has_Added_Watermark', (event, message) => {
      this.loading = false
      this.$message({
        message: `添加水印文件已保存至${this.outputPath}`,
        type: 'success'
      });
    })
    // 监听来自主进程的消息,更改保存目录
    ipcRenderer.on('changeDefaultDirectory', (event, message) => {
      console.log('Received message:', message)
      this.outputPath = message
    })
    ipcRenderer.on('has_turn_to_image', (event, message) => {
      this.loading = false
      this.$message({
        message: `视频截图已保存至${this.outputPath}`,
        type: 'success'
      });
    })
  },
  data () {
    return {
      compressedRate: 0,
      fileList: [],
      outputName: '',
      outputPath: 'C:\\Users\\admin\\Documents',
      activeMenu: "1",
      loading: false,
      videoSrc: '',
      dialogVisible: false,
      waterMarkContent: ''
    }
  },
  methods: {
    playVideo (item) {
      this.videoSrc = item.path
      this.dialogVisible = true
    },
    handleOpen () {

    },
    selectMenu (index, indexPath) {
      if (index == this.activeMenu) return
      this.fileList = []
      this.activeMenu = index
    },
    handleClose () {

    },
    handleDelete (val) {
      console.log(val);
      this.fileList = this.fileList.filter(item => {
        return item.id != val.id
      })
    },
    openFile () {
      ipcRenderer.send('open-file-dialog')
    },
    openFolder () {
      ipcRenderer.send('open-folder-dialog')
    },
    clearAll () {
      this.fileList = []
    },
    // 录制屏幕
    startRecord () {
      ipcRenderer.send('recordScreen')
    },
    endRecord () {
      ipcRenderer.send('stopRecord')
    },
    operateVideo () {
      this.loading = true
      if (this.activeMenu == 1) {
        ipcRenderer.send('save2Mp3')
      }
      if (this.activeMenu == 2) {
        ipcRenderer.send('compressVideo')
      }
      // 添加水印
      if (this.activeMenu == 3) {
        ipcRenderer.send('addWaterMarkToVideo', this.waterMarkContent)
      }
      if (this.activeMenu == 5) {
        ipcRenderer.send('videoToImage')
      }
    }
  }
}
</script>
<style>
html {
  overflow: hidden;
}
</style>
<style lang="scss" scoped>
.container {
  height: 100%;
  overflow: hidden;
}

.left {
  height: 100vh;
  border-right: solid 1px #e6e6e6;
}

.table {
  margin-top: 24px;
}

.foot {
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 24px;
  left: 24px;
}

.submit {
  position: absolute;
  bottom: 24px;
  right: 24px;
}

.input {
  width: 50vw !important;
}

.el-dialog__title {
  /*弹框颜色 && 背景色*/
  color: #fff;
}

/deep/ .el-menu {
  border: 0;
}

.right {
  padding: 24px;
  position: relative;
  height: 100vh;

  .operate {
    display: flex;
    justify-content: space-between;

    .leftOperate {
      width: 60%;
    }

    .rightOperate {
      width: 40%;
    }
  }
}
</style>