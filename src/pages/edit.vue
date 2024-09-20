<template>
  <div class='edit'>
    <input :focus="focus" id="input-name" class="uni-input" ref="refName" placeholder="name" v-model="name" confirm-type="search" @confirm="add"/>
    <input  class="uni-input" placeholder="trans" v-model="trans" confirm-type="search" @confirm="add"/>
    <input class="uni-input" placeholder="associate" v-model="associate" confirm-type="search" @confirm="add"/> 
    <!-- <input class="uni-input" placeholder="root" v-model="root" confirm-type="search" @confirm="add"/>     
    <button @click="add">d</button> -->

    <input class="uni-input" placeholder="chapte" v-model="chapte" confirm-type="search"/>  

  </div>
</template>

<script>
const CURRENT_KEY = 'edit'
export default {
  components: {

  },
  data () {
    return {
      name: '',
      trans: '',
      root: '',
      associate: '',
      chapte: '',
      focus:false
    }
  },
  created() {
   if(uni.getDeviceInfo().deviceBrand.toUpperCase() === 'XIAOMI') {
    uni.redirectTo({
      url: '/pages/home/index'
    })
   }
  },
  methods: {
    clear() {
      this.name = this.trans = this.root = this.associate = ''
    },
    add () {
//       // arr = []
//       JSON.stringify(arr.map(item => {
// 	return {
// 	 "chapte":"3",
// 	 ...item
// 	 }
// })
// )
      if(this.name && this.trans)  {
        this.focus =false
        const obj = {
          name: this.name,
          trans: this.trans,
          root: this.root,
          associate: this.associate,
          chapte: this.chapte || ''
        }
        const data = JSON.parse(uni.getStorageSync(CURRENT_KEY) || '[]')
        data.push(obj)
        uni.setStorageSync(CURRENT_KEY,JSON.stringify(data))
        this.clear()
        setTimeout(() => {
          this.focus = true
        }, 40)
        
      }else {
        uni.showToast({
          title: '少啦',
          duration: 1000
        });
      }
    },
  }
}
</script>

<style scoped>
.uni-input {
  opacity: 0.2;
  margin-bottom: 20px;
}
#input-name {
  opacity: 0.3;
}
</style>