
ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile']
  }).then(result => {
    console.log(2222)
    if (!result.canceled) {
      const filePath = result.filePaths[0]
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(err)
          event.reply('selected-file-size', 'Error retrieving file size')
        } else {
          const fileSize = stats.size
          const data = {
            size: (fileSize / 1024 / 1024).toFixed(2) + 'MB',
            path: filePath,
            name: path.basename(filePath)
          }
          event.reply('file-opened', data)
        }
      })
      ffmpeg(filePath).setFfmpegPath(ffmpegPath).audioCodec('libmp3lame').on('end', () => { console.log('转换完成！') }).save(path.join(__dirname, './out.mp3'))
      // 发送文件路径到渲染进程
      // mainWindow.webContents.send('file-opened', filePath)
    }
  }).catch(err => {
    console.error(err)
  })
})