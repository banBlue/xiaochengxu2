<template>
  <div class='password'>
    <div class="vaild-key">
      <!-- 抽屉 -->
      <uni-data-select
        v-model="dataSelect"
        :localdata="range"
        @change="handleChange"
      ></uni-data-select>
      寒战特别行动
      <input class="uni-input" password type="text" placeholder="key" placeholder-style="color:#F76260" v-model="rsaKey" />
      <input class="uni-input" password type="text" placeholder="key" placeholder-style="color:#F76260" v-model="rsaKey2" />
      <input class="uni-input" password type="text" placeholder="key" placeholder-style="color:#F76260" v-model="rsaKey3" />
      <button @click="handleVaildKey">校验</button>
    </div>
    <div v-if="currentData._dd">
      <p>{{currentData._dd}}</p>
      <button @click="handleCopy(currentData._dd)">复制</button>
      <p>{{currentData._io}}</p>
      <button @click="handleCopy(currentData._io)">复制</button>
    </div>
    <div class="line"></div>
    <div>
      <input class="uni-input danger" type="text" placeholder="info" placeholder-style="color:#F76260" v-model="descInfo" />
      <button @click="getRsaCode">危险小红帽</button>
    </div>

  </div>
</template>

<script>
import WxmpRsa from 'wxmp-rsa'
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
        MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgGCahGTe00NKjJ0/Fs7kJFmEkx1x
        1fSDf8rL3uJfC1FV558BvPuArSgAs0+V6F98lQT5rTVLnrLW29eVfDXG8XUcHduP
        4BEHLLqIKVPS9iPG35xqWEb9Jts7+4gsyQ64VGP9QTmVUGrQgJ5dspY3BieW+scS
        ha+luFTg99ZsO3UjAgMBAAE=
        -----END PUBLIC KEY-----`
export default {
  components: {

  },
  data () {
    return {
      rsaKey: '',
      rsaKey2: '',
      rsaKey3: '',
      dataSelect: 0,
      range: [
      ],
      currentData: {

      },
      showDialogDrawer: false,
      descInfo: ''
    }
  },
  created() {
    
  },
  methods: {
    handleCopy(data) {
      uni.setClipboardData({
        data: data, //要被复制的内容
        success: () => { //复制成功的回调函数	
          uni.showToast({
            icon:"success",
            title: '复制成功',
            duration: 1000
          });				
        }
      });
    },
    _getApi() {
      uni.request({          
        url:'https://banblue.github.io/mm.js',
        timeout:30000,
        complete:({data})=> {
          this.range = data.map((item,index) => {
            if(index === 0 && !this.getRsaDeCode(this.rsaKey,this.rsaKey2,item.name)) {
              console.log(`--DEBUG--1111`,)
              uni.exitMiniProgram()
            }
            return {
              value:index,
              text: this.getRsaDeCode(this.rsaKey,this.rsaKey2,this.rsaKey3,item.name),
              _dd:this.getRsaDeCode(this.rsaKey,this.rsaKey2,this.rsaKey3,item.dd),
              _io:this.getRsaDeCode(this.rsaKey,this.rsaKey2,this.rsaKey3,item.io),
            }
          });
        }
      })
    },
    getRsaDeCode(key,key2,key3,str) {
      //解密
      const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
        MIICWgIBAAKBgGCahGTe00NKjJ0/Fs7kJFmEkx1x1fSDf8rL3uJfC1FV558BvPuA
        rSgAs0+V6F98lQT5rTVLnrLW29eVfDXG8XUcHduP4BEHLLqIKVPS9iPG35xqWEb9
        Jts7+4gsyQ64VGP9QTmVUGrQgJ5dspY3BieW+scSha+luFTg99ZsO3UjAgMBAAEC
        gYBGqX/iUONzu1ozw2wpldPI7yK1TQlVu8KEUrAMIb2jlxS/yIO17B+8vRZsRpkd
        D4Hpi8BY1aGV63gPr7aVl5oSRuN${key}ax19yoq9eZwiI7ygskq7gj0F9zirdP/8YuQ
        ZDrtf5xC50j7gHsOAADAUgvMaiatgfRLvqBK7IPB4G99wQJBAMB0pQYaVSB8utuZ
        dAgEIe02/69veDa36w9waa4OSJssMwz1fgq9eR7waMnsB7pjK83oo2vLByNf6FAr
        V6JWW/ECQQCAf/TF5ZBOM6qzL+Wxl7rxrkOCgapyTw3Z57LWoeZApCDydxprE/L/
        3pczowKh9BwgStf6EeBiaR67l38pVAZTAkB/fUXMcyktKjNGQbNBlCs9Tw+1kawa
        418NjTQUn1WtpWv0C7QBPV69B${key2}EmhzMdeGQt6l6QLZr0p68bNnSqk6hAkBYX6fn
        skncfowXUAmYadGYBVFIoASpONU916uXESFZs4c1OdRhcAbfEibKzIEzAL+XNeHz
        iffXtpP8T+SUd8UhAkBnvg32MlcCyaXIRsxkELxTO8u0G1EFVi6ZE${key3}Qiu+P7whH5A
        lPbeXaI1YvR93UXxzrdNByxwTuPMgwg2Q2eE7P2c
        -----END RSA PRIVATE KEY-----`
      const rsa = new WxmpRsa()
      rsa.setPrivateKey(PRIVATE_KEY);
      const data = rsa.decryptLong(str)
      return data
    },
    getRsaCode() {
      const rsa = new WxmpRsa()
      rsa.setPublicKey(PUBLIC_KEY);
      const data = rsa.encryptLong(this.descInfo)
      console.log(`--DEBUG--data`,data)
      this.handleCopy(data)
      return data
    },
    handleVaildKey() {
      this._getApi()
    },
    handleChange(e) {
      this.currentData = this.range[e]
    },
  }
}
</script>

<style lang="scss" scoped>
.password{
  .vaild-key {
    .weui-input {
      border: 1px;
    }
  }
  .line {
    height: 99px;
  }
  .danger {
    color:azure;
  }
}
</style>