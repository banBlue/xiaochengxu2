//  1.引入文件
const ci = require('miniprogram-ci')
const path = require('path')

const project = new ci.Project({
  appid: 'wx7c8a64031f9f85ca', //appaid
  type: 'miniProgram',
  projectPath: path.resolve('./unpackage/dist/dev/mp-weixin/'), // 项目路径
  privateKeyPath: path.resolve('./miniprogram/private.wx7c8a64031f9f85ca.key'), //小程序私钥key
  ignores: ['node_modules/**/*'],
})

// 上传
const uploadResult = ci.upload({
  project,
  version: 'test',
  desc: '当前使用环境----',
  setting: {
    es6: true,
  },
  onProgressUpdate: console.log,
})

// 开发版上传-二维码
// const previewResult = ci.preview({
//   project,
//   desc: 'miniProgram', // 此备注将显示在“小程序助手”开发版列表中
//   setting: {
//     es6: true,
//   },
//   qrcodeFormat: 'image',  // 二维码文件的格式"image" 或 "base64" "terminal"
//   qrcodeOutputDest: path.resolve('./miniprogram/destination.jpg'), // 图片路径
//   onProgressUpdate: console.log,
// })
// console.log(previewResult)