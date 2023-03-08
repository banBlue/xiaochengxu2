<template>
  <div class="content">
    <button size="mini" class="btn"  @click="removeDom('over')" >{{'终止'}}</button>
    <div class="tips" @click="updateIndex" v-if="tipsIndex >=0 ">{{liParams[tipsIndex].trans || ''}}</div>
		<div class="class" v-for="(item, index) in liParams" :key="index">
      <div class="package" :class="{'good':item.status === 'good'}" :style="{ left: item.left, animationDuration: item.durTime,animationDuration: item.durTime,}" @animationend="removeDom(index)" @click="handleClick(item,index)" >
        {{item.text}}
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props:{
      dataRoot: {
        type: Array
      },
      ms:[Number,String],
    },
    data() {
      return {
        baseTime:0,
        liParams: [],
        tipsIndex: undefined
      }
    },
    mounted() {
      let win = 0
      // 获取屏幕宽度
      uni.getSystemInfo({
        success: function(res) {
          win = res.windowWidth
        }
      });
      let w = (Math.random() * 90) + 120
      this.dataRoot.forEach((item) => {
        this.baseTime = this.baseTime + Number(this.ms)
        let durTime =  this.baseTime + 's' // 时间
        let left = parseInt(Math.random() * win)
        if (left < 0) {
          left = 0
        } else if (left > (win - w)) {
          left = (win + 65)
        }
        console.log(durTime)
        this.liParams.push({
          left: left + 'rpx',
          durTime: durTime,
          text:item.name,
          _index:item._index,
          trans:item.trans,
          status: '', //未被点击  点击了:good
        })
      })
      console.log('this.liParams',this.liParams)        
    },
    methods: {
      removeDom(index) {
        if(index === 'over' || this.liParams.length - 1 === index) {
          uni.showToast({
            icon:"success",
            title: `结束了- 对了${this.liParams.reduce((all,current) => {
              if(current.status === 'good') return ++all
              return all
            },0)}`,
            duration: 3000
          });
          console.log('结束了')
          this.$emit("gameEnd",this.liParams.filter(item => item.status !== 'good'))
        }
      },
      handleClick(item,index) {
        item.status = 'good'
        this.tipsIndex = index
      },
      updateIndex() {
        this.liParams[this.tipsIndex].status = ''
      },
    }
  }
</script>

<style scoped lang="scss">
@keyframes aim_move {
    0% {
      transform: translateY(0);
    }

    100% {
      transform: translateY(117vh);
    }
  }
  .tips {
    position: fixed;
    top: 15rpx;
    left: 50%;
    transform: translateX(-50%);
    padding: 10rpx;
    background: #8cffd8;
    z-index: 4;
  }
	.content{
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background: #fee0b8;
    z-index: 9980;
    .btn {
      position:absolute;
      left: 0;
      top: 0;
      z-index:2;
    }
    .package {
      position: absolute;
      animation: all 0s linear;
      top: -200rpx;
      z-index: 3;
      animation: aim_move 0s linear 1 forwards;
      background:#fffaf1;
      font-size: 36rpx;
      padding: 13rpx;
      line-height: 1.5;
      &.good {
        visibility: hidden;
      }
    }
	}
</style>