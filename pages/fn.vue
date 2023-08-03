<template>
  <div class='fn'>
    <ul class="wrap">
      <li class="box" v-for="item in fnList" :key="item.text" @click="goPage(item)">{{ item.text }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  components: {

  },
  data () {
    return {
      fnList: [
        {text:'花园',path:'/pages/other/password'},
      ]
    }
  },
  created() {
    if(this.fnList.length) {
      this.goPage(this.fnList[0])
    }
  },
  methods: {
    goPage(item) {
      uni.redirectTo({
        url: item.path
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.fn{
  .wrap {
    .box {
      line-height: 50px;
      height: 50px;
    }
  }
  
}
</style>