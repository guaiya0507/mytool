<template>
  <div class="container">
    <div class="operate">
      <el-input style="width: 50%;" @keydown.native="inputChange" v-model="word"></el-input>
      <el-button type="primary" @click="storeWord">记录单词</el-button>
      <el-button type="primary" @click="exportToExcel">导出</el-button>
      <div class="wordlist">
        <el-tag class="word" type='success' v-for="word, index in wordlist" @close="closeWord(index)" closable>
          {{ word }}
        </el-tag>
      </div>
      <el-carousel class="carousel" :interval="4000" type="card" height="200px">
        <el-carousel-item v-for="item in wordlist" :key="item">
          <h3 class="medium">{{ item }}</h3>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>
<script>
const XLSX = require('xlsx')

export default {
  data () {
    return {
      word: '',
      wordlist: []
    }
  },
  async mounted () {
    this.wordlist = JSON.parse(localStorage.getItem('myword'))
  },
  methods: {
    exportToExcel (data) {
      const sheetName = 'Sheet1'
      const workbook = XLSX.utils.book_new()
      let text = this.wordlist.map((item,index) => {
        return {'序号':index+1,'单词':item}
      })
      console.log(text);
      const worksheet = XLSX.utils.json_to_sheet(text)
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      this.saveAsExcelFile(excelBuffer, new Date().getTime())
    },
    saveAsExcelFile (buffer, fileName) {
      const data = new Blob([buffer], { type: 'application/octet-stream' })
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE10+
        window.navigator.msSaveBlob(data, fileName + '.xlsx')
      } else {
        // Others
        const url = window.URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName + '.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    inputChange (event) {
      const keyCode = event.keyCode || event.which;
      if (keyCode == 13) {
        this.storeWord()
      }
    },
    storeWord () {
      if (!this.word) {
        this.$message({
          message: `请输入单词`,
          type: 'error'
        })
        return
      }
      this.wordlist.push(this.word)
      localStorage.setItem('myword', JSON.stringify(this.wordlist))
      this.word = ''
    },
    closeWord (index) {
      this.wordlist.splice(index, 1)
      localStorage.setItem('myword', JSON.stringify(this.wordlist))
    }
  },

}
</script>
<style scoped lang="scss">
.wordlist {
  .word {
    margin: 16px;
  }
}

.carousel {
  position: absolute;
  bottom: 0;
  right: 0;
  left: 20%;
}

.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}
</style>
