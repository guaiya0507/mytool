'use strict';

import { app, BrowserWindow, dialog, ipcMain, screen,Notification} from 'electron';
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const child = require('child_process');
const { createWorker } = require('tesseract.js');

const ffmpegPath = path.join(__dirname, './bin/ffmpeg.exe');
const ffprobePath = path.join(__dirname, './bin/ffprobe.exe'); // 替换为你的ffprobe实际路径
// 获取用户的文档文件夹路径
let documentsDirectory = app.getPath('documents');
console.log(process.cwd()); // 输出Electron应用程序的根目录

const FONT_FILE = 'C\\\\:/Windows/Fonts/simkai.ttf';
let id = 0;

// let filePath = path.join(__dirname, './1.mp4')
// let outPutPath = path.join(__dirname, './out.mp4')
// 提取mp3
// ffmpeg(filePath).setFfmpegPath(ffmpegPath).withVideoCodec('libx264').withAudioCodec('aac').on('end', () => { console.log('转换完成！') }).save(outPutPath)
// ffmpeg(filePath).setFfmpegPath(ffmpegPath).audioCodec('libmp3lame').on('end', () => { console.log('转换完成！') }).save(path.join(__dirname, './out.mp3'))

let mainWindow = null;
const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  const { width, height } = screen.getPrimaryDisplay().bounds;
  console.log(width, height);
  mainWindow = new BrowserWindow({
    height: height * 0.7,
    useContentSize: true,
    width: width * 0.7,
    icon: path.join(__dirname, './my.ico'),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      contextIsolation: false,
      webviewTag: true,
      spellcheck: false,
      disableHtmlFullscreenWindowResize: true,
    },
    autoHideMenuBar: true, // 自动隐藏菜单栏
  });

  mainWindow.loadURL(winURL);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
let filePath;
// 打开文件
ipcMain.on('open-file-dialog',async (event) => {
  id++;
  let result =await dialog.showOpenDialog({
    properties: ['openFile'],
  });
  console.log(2222, result);
  if (result) {
    filePath = result[0] || result.filePaths[0];
    getVideoInfo(filePath, (info) => {
      console.log('视频信息:', info);
    });
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error(err);
      } else {
        const fileSize = stats.size;
        const data = {
          id,
          size: (fileSize / 1024 / 1024).toFixed(2) + 'MB',
          path: filePath,
          name: path.basename(filePath),
        };
        console.log(event,data);
        event.sender.send('file-opened', data);
      }
    });
    // 发送文件路径到渲染进程
    // mainWindow.webContents.send('file-opened', filePath)
  }
});
// 打开目录
ipcMain.on('open-folder-dialog', (event) => {
  dialog
    .showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: documentsDirectory,
    })
    .then((result) => {
      if (!result.canceled) {
        console.log(result);
        documentsDirectory = result.filePaths[0];
        event.sender.send('changeDefaultDirectory', documentsDirectory);
      }
    })
    .catch((err) => {
      console.error(err);
    });
});
// 保存为MP3
ipcMain.on('save2Mp3', (event) => {
  let fileName =
    path.basename(filePath).split('.')[0] + `_${new Date().getTime()}.mp3`;
  ffmpeg(filePath)
    .audioCodec('libmp3lame')
    .on('end', () => {
      console.log('转换完成！');
      event.sender.send('file-saved');
    })
    .save(path.join(documentsDirectory, fileName));
});
// 压缩视频
ipcMain.on('compressVideo', (event) => {
  let fileName =
    path.basename(filePath).split('.')[0] +
    `_compressed_${new Date().getTime()}${path.extname(filePath)}`;
  let pathName = path.join(documentsDirectory, fileName);
  // ffmpeg(filePath)
  //   .setFfmpegPath(ffmpegPath)
  //   .videoBitrate('500k')
  //   .audioBitrate('128k') // 设置音频码率为128kbps
  //   .on('end', () => {
  //   })
  //   .save(path.join(documentsDirectory, fileName));
  child.exec(
    `ffmpeg -i ${filePath} -c:v libx264 -crf 50 ${pathName}`,
    function (err) {
      if (err) {
      } else {
        event.sender.send('file-compressed');
      }
    }
  );
});
// 添加水印
ipcMain.on('addWaterMarkToVideo', (event, msg) => {
  let info = {};
  let fileName =
    path.basename(filePath).split('.')[0] +
    `_watermark_${new Date().getTime()}${path.extname(filePath)}`;
  let pathName = path.join(documentsDirectory, fileName);
  console.log(FONT_FILE);
  child.exec(
    `ffmpeg -i ${filePath} -vf "drawtext=fontfile=${FONT_FILE}:fontsize=100:x=5:y=100:fontcolor=red:box=1:boxcolor=white@0.5:text='${msg}'" -codec:a copy ${pathName}`,
    function (err) {
      if (err) {
        console.log(err);
      } else {
        event.sender.send('has_Added_Watermark');
      }
    }
  );
});
let recordProcess;
// 录屏
ipcMain.on('recordScreen', (event) => {
  let info = {};
  let pathName = path.join(
    documentsDirectory,
    `screen_record_${new Date().getTime()}.mp4`
  );
  recordProcess = child.exec(
    `ffmpeg -f gdigrab -framerate 30 -offset_x 0 -offset_y 0 -video_size 1920x1080 -i desktop -c:v libx264 -preset ultrafast ${pathName}`,
    function (err) {
      if (err) {
      } else {
      }
    }
  );
});
// 停止录屏
ipcMain.on('stopRecord', (event) => {
  recordProcess.kill('SIGINT'); // 发送 SIGINT 信号停止录制
});
// 视频转图片
ipcMain.on('videoToImage', (event) => {
  child.exec(
    `ffmpeg -i ${filePath} -vf "fps=5" ${documentsDirectory}/image%04d.png`,
    function (err) {
      if (err) {
        console.log(err);
      } else {
        event.sender.send('has_turn_to_image');
      }
    }
  );
});
ipcMain.on('stopRecord', (event) => {
  recordProcess.kill('SIGINT'); // 发送 SIGINT 信号停止录制
});
// 获取视频信息
function getVideoInfo(filePath, callback) {
  const command = `ffprobe -i  ${filePath} -print_format json  -show_format -show_streams -v 0`;
  child.exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行出错: ${error}`);
      return;
    }
    if (stderr) {
      const info = JSON.parse(stderr);
      callback(info);
      console.error(`1111111${info}`);
      return;
    }
    try {
      const info = JSON.parse(stdout);
      callback(info);
    } catch (parseError) {
      console.error(`解析错误: ${parseError}`);
    }
  });
}
// 文件拖拽
const iconName = path.join(__dirname, 'iconForDragAndDrop.png')

ipcMain.on('beginOcr', async (event, filePath) => {
  console.log(1111,filePath)
  const worker = await createWorker('chi_sim');
  const { data: { text } } = await worker.recognize(filePath);
  console.log(text);
  event.sender.send('image_text',text);
  await worker.terminate();
})


// 创建弹框消息
const notice = (title, body)=> new Promise((ok,fail)=>{
  if(!Notification.isSupported()) fail("当前系统不支持通知")

  let ps = typeof(title) == 'object'? title : {title, body}
  let n = new Notification(ps)
  n.on('click', ok)
  n.show()
})
