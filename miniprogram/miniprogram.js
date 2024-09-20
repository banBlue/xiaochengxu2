console.log('---------开始执行上传-----------')

let hasPrd = process.argv.some(item => item.includes('production'))

let hasPreview = process.argv.some(item => item.includes('preview'))

let config = { // 开发环境配置
  projectPath: './dist/dev/mp-weixin/',
  robot: 1 // 开发环境机器人
}

if(hasPrd) {
  config = {...config,...{
    projectPath: './dist/build/mp-weixin/',
    robot: 28 // 生产机器人
  }}
}

//  1.引入文件
const ci = require('miniprogram-ci')
const path = require('path')

const project = new ci.Project({
  appid: 'wx7c8a64031f9f85ca', //appaid
  type: 'miniProgram',
  projectPath: path.resolve(config.projectPath), // 项目路径
  privateKeyPath: path.resolve('./miniprogram/private.wx7c8a64031f9f85ca.key'), //小程序私钥key
  ignores: ['node_modules/**/*'],
  robot: config.robot
})

if(hasPreview) {
// 开发版上传-二维码
const previewResult = ci.preview({
  project,
  desc: '预览', // 此备注将显示在“小程序助手”开发版列表中
  setting: {
    es6: true,
  },
  qrcodeFormat: 'image',  // 二维码文件的格式"image" 或 "base64" "terminal"
  qrcodeOutputDest: path.resolve('./miniprogram/previewQrcode.jpg'), // 图片路径
  onProgressUpdate: (res,dd) => {
    if(res._status === 'doing') {
       console.log('---------上传中---------')
    }else if(res._status === 'done') {
      console.log('---------已生成二维码---------')
      process.exit()
    }
  },
})
  return
}

// 上传
const uploadResult = ci.upload({
  project,
  version: 'test',
  desc: '当前使用环境----',
  setting: {
    es6: true,
  },
  onProgressUpdate: (res,dd) => {
    if(res._status === 'doing') {
       console.log('---------上传中---------')
    }else if(res._status === 'done') {
      console.log('---------已完成上传---------')
      process.exit()
    }
  },
})

