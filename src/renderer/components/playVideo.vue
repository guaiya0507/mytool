<template>
  <el-dialog title="播放视频" :visible.sync="dialogVisible" width="60%" :before-close="handleClose">
    <div class="video">
      <video  controls style="width: 100%; height: 100%; object-fit: contain">
        <source :src="videoSrc" type="video/mp4">
      </video>
    </div>
  </el-dialog>
</template>
<script>
export default {
  data () {
    return {
    };
  },
  props: {
    videoSrc: {
      type: String
    },
    dialogVisible: {
      type: Boolean
    }
  },
  methods: {
    handleClose (done) {
      this.$emit('update:dialogVisible', false)
    }
  }
};
</script>
<style lang="scss" scoped>
  .video{
    height: 400px;
  }
  /deep/ .el-dialog__header{
    background: white;
  }
</style>