<template>
	<div class="content">
		<div class="header">
			<template v-if="noSilent">
				{{ currentIndex }} -{{ dict.length - 1 }}
				<button size="mini"  @click="handleToogleAudio" :type="autoplay?'primary':'default'">{{autoplay?'已开':'已关'}}音频</button>
				<button size="mini"  @click="handleToogleRandom" :type="isRandom?'primary':'default'">{{isRandom?'已开':'已关'}}随机</button>
				<button size="mini"  @click="handleLight" :type="light?'primary':'default'">{{light?'开了灯':'关了灯'}}</button>
				<button size="mini" @click="showDrawer">抽屉</button>
        <button size="mini" @click="handleBath">洗澡</button>
				<input type="text" @blur="handleChapte" :placeholder="`${isChapte?'已开':'已关'}节`">
				<input type="text"  v-model="ms" placeholder="定时器时间">
        <input type="number"  v-model="gameNumber" placeholder="游戏个数">
			</template>
			<button size="mini"  @click="handleAuto" :type="timeID?'primary':'default'">{{timeID?'自动':'手动'}}</button>
			<button size="mini"  @click="handleErrorWord" :type="caleIndex?'primary':'default'">{{caleIndex?`错${dict.length}`:'all'}}</button>
			<button size="mini"  @click="handleGame" >游戏模式</button>
			<div class="root-data" :class="light?'open':''">
				<span v-for="(item,index) in getRootdata" :key="index">({{ item.r + '-' +item.desc}}) </span>
			</div>			
		</div>
		
		<div class="text-area" :class="light?'open':''">
			<p class="title text" @click="handleClip(currentItem.name)">{{currentItem.name}}</p>
			<p class="trans text">{{ currentItem.trans }}</p>
			<p class="root text" >{{currentItem.root}}</p>
			<p class="associate text" >{{ currentItem.associate }}</p>
		</div>
		<div class="duration-touch-view" 
			@touchstart="touchStart" 
			@touchmove="touchMove" 
			@touchend="touchEnd" >
		</div>

		<!-- 抽屉 -->
		<uni-drawer  ref="showRight" mode="right" :mask-click="true" width="300" @change="handledRawerChange">
			<uni-indexed-list v-if="showDialogDrawer" :options="indexedList" @click="bindClick"></uni-indexed-list>
		</uni-drawer>
		
		<red :dataRoot="dataRoot" :ms="ms" @gameEnd="gameEnd" v-if="showRed"></red>
	</div>
</template>

<script>
  import red from "../home/components/red.vue"
	import dict from "../../static/js/data.js"
	import rootdata from "../../static/js/rootdata.js"
	const CURRENT_KEY = 'dict_current_key'
	var touchStartX = 0;//触摸时的原点  
	var touchStartY = 0;//触摸时的原点  
	var time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动  
	var interval = "";// 记录/清理时间记录  
	var touchMoveX = 0; // x轴方向移动的距离
	var touchMoveY = 0; // y轴方向移动的距离
	export default {
		components: {
			red
		},
		data() {
			return {
				title: 'Hello',
				allDict: [],
				dict: [],				
				currentIndex: 0,
				audioIndex: 0,
				autoplay: false,
				innerAudioContext: null,
				isRandom: false,
				isChapte:false,
				light:false,
				indexedList: [],
				showDialogDrawer: false,
				concatSign: `          `,
				timeID:null,
				ms:3,
				noSilent:true,
				autoRecorderList:[],				
				dataRoot: [],
				showRed:false,
        gameNumber:38,
			}
		},
		onLoad() {

		},
		async created() {
      if(uni.getDeviceInfo().deviceBrand.toUpperCase() === 'XIAOMI') {
        this.light = true
      }
      uni.showLoading({
        title: '加载中'
      });
      const data = await this._getAllEnglish()
      uni.hideLoading()
      this.allDict = data
      this.dict = data
			this.init()
		},
		computed: {
			currentItem () {
				return this.dict[this.currentIndex] || {}
			},
			getRootdata () {
				const data = rootdata[`${this.currentItem.chapte}`]	|| []
				return data			 
			},
			caleIndex() {
				return this.allDict.length !== this.dict.length
			}
		},
		methods: {
      handleBath() {
        this.ms = 5
        this.handleToogleAudio()
        this.handleToogleRandom()
        this.handleAuto()
      },
      async _getAllEnglish() {
        return new Promise(res => {
          uni.request({          
            url:'https://banblue.github.io/data.js',
            timeout:30000,
            complete({data}) {
              Array.isArray(data) ? res(data): res(dict)
            }
          })
        })
        
      },
			handleGame() {
        this.autoplay = false
        this.handleErrorWord()
				this.dataRoot = []
				for (var i = 0; i < this.gameNumber; i++) {
          const _index =Math.floor(Math.random()*this.allDict.length)
					this.dataRoot.push({_index,...this.allDict[_index]})
				}
				this.showRed = true
			},
			gameEnd(arr) {
				this.autoRecorderList = arr.map(item => this.allDict[item._index])
				this.showRed = false
				this.handleErrorWord()
			},
			init() {
				this.getCurrentKey() // 获取序列最新key
				this.initAudio() // 初始音频
				this.handleindexedList()
			},
			handleErrorWord() {
				if(this.allDict.length === this.dict.length) {
					if(this.autoRecorderList.length) {
						this.currentIndex = 0
						this.dict = this.autoRecorderList
					}
				}else {
					this.autoRecorderList = []
					this.dict = this.allDict
				}
			},
			handleAuto() {
				if(this.timeID) {
					clearInterval(this.timeID)
					this.timeID = null
				}else {
					this.timeID = setInterval(() => {
						this.handleNext('next')
					},Number(this.ms * 1000))
				}
			},			
			handleindexedList() {
				let letter
				let arr = []
				this.dict.forEach((item,index) => {
					if(letter && letter === item.chapte) {
						arr[arr.length-1].data.push(`${item.name}${this.concatSign}${item.trans}`)
					}else {
						letter = item.chapte
						arr.push({
							"letter": item.chapte,
							"recordIndex": index,
							"data": [
								`${item.name}${this.concatSign}${item.trans}`
							]
						})
					}
				})
				this.indexedList = arr
			},
			handledRawerChange(data) {
					this.showDialogDrawer = data								
			},
			bindClick(e) {
				let {key,name} = e.item
				this.handleChapte({detail:{value:key,_name:name.split(this.concatSign)[0]}})
			},
			showDrawer() {
				console.log('this.$refs.showRight',this.$refs.showRight)
				this.$refs.showRight.open();
			},
			closeDrawer() {
				this.$refs.showRight.close();
			},
			initAudio() {
				this.innerAudioContext = uni.createInnerAudioContext();
			},
			playAudio() {
				if(this.currentIndex === this.audioIndex && this.innerAudioContext.src) {					
					this.innerAudioContext.play()
					return
				}

				this.audioIndex = this.currentIndex

				this.innerAudioContext.src = `http://dict.youdao.com/dictvoice?audio=${this.currentItem.name}`;
				
				this.innerAudioContext.onCanplay(() => {
					console.log(`--DEBUG--加载完毕`,)
					this.innerAudioContext.play()
				})

				this.innerAudioContext.onPlay(() => {
					console.log('开始播放');
				});
				this.innerAudioContext.onError((res) => {
					console.log(res.errMsg);
					console.log(res.errCode);
				});
			},
			handleNext(type) {								

				if(this.isRandom) { // 随机模式
					this.currentIndex = Math.floor(Math.random()*this.dict.length)
					this.autoplay && this.playAudio()
					return
				}

				if(type === 'next') {
					this.currentIndex = this.currentIndex + 1 >= this.dict.length ? 0 : ++this.currentIndex
				} else {
					this.currentIndex =  this.currentIndex - 1 < 0? this.dict.length - 1 : --this.currentIndex
				}		
						
				this.autoplay && this.playAudio()
				!this.showDialogDrawer && !this.isChapte && uni.setStorageSync(CURRENT_KEY,this.currentIndex)
			},
			getCurrentKey() {
				this.currentIndex = uni.getStorageSync(CURRENT_KEY) || 0 
			},
			handleToogleAudio() {
				this.autoplay = !this.autoplay
			},
			handleLight() {
				this.light = !this.light
			},
			handleToogleRandom() {
				this.isRandom = !this.isRandom
				if(!this.isRandom) {
					this.isChapte = false
					this.getCurrentKey()
				}
			},
			handleChapte(event) {
				this.isChapte = true
				for (let index = 0; index < this.dict.length; index++) {
					const item = this.dict[index]
					if(+item.chapte === +event.detail.value) {
						if(event.detail._name) {
							if(event.detail._name === item.name) {
								this.currentIndex = index
								break
							}
						}else {
							this.currentIndex = index
							break
						}
					}					
				}
				event.detail.value = ''
			},
			handleClip(data) {				
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

			// 触摸开始事件  
			touchStart: function (e) {
				touchStartX = e.touches[0].pageX; // 获取触摸时的原点  
				touchStartY = e.touches[0].pageY; // 获取触摸时的原点  
				// 使用js计时器记录时间    
				interval = setInterval(function () {
					time++;
				}, 20);
			},
			// 触摸移动事件  
			touchMove: function (e) {
				touchMoveX = e.touches[0].pageX;
				touchMoveY = e.touches[0].pageY;
			},
			// 触摸结束事件  
			touchEnd: function (e) {
				var moveX = touchMoveX - touchStartX
				var moveY = touchMoveY - touchStartY
				if (Math.sign(moveX) == -1) {
					moveX = moveX * -1
				}
				if (Math.sign(moveY) == -1) {
					moveY = moveY * -1
				}
				if (moveX <= moveY) {// 上下
					// 向上滑动
					if (touchMoveY - touchStartY <= -30 && time < 10) {
						console.log("向上滑动")
						this.noSilent = !this.noSilent
					}
					// 向下滑动  
					if (touchMoveY - touchStartY >= 30 && time < 10) {		
						if(this.allDict.length === this.dict.length) {
							this.autoRecorderList.push(this.currentItem)
						}
						this.playAudio()
					}
				}else {// 左右
					if(this.timeID) {
						this.handleAuto()
						return
					}
					// 向左滑动
					if (touchMoveX - touchStartX <= -30 && time < 10) {
						console.log("左滑页面")						
						this.handleNext('next')
					}
					// 向右滑动  
					if (touchMoveX - touchStartX >= 30 && time < 10) {
						this.handleNext('prev')
						console.log('向右滑动');
					}
				}
				clearInterval(interval); // 清除setInterval  
				time = 0;
			}, 
		}
	}
</script>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.root-data {
		opacity: 0;
		&.open {
			opacity: 1;
		}
	}

	.duration-touch-view {
		position: fixed;
		left: 0;
		right: 0;
		top: 160px;
		bottom: 20px;
		z-index: -1;
	}

	.header {
		margin-bottom: 160px;
	} 

	.text-area {
		opacity: 0;
		&.open {
			opacity: 1;
		}
		>.text {
			margin-bottom: 40px;
			font-size: 20px;
			text-align: center;
		}
		.title {
			font-size: 46px;
			margin-bottom: 20px;
		}
		.trans {

		}
		.root {

		}
		.associate {
      margin-bottom: 0px;
		}
	}

	.bottom {
		position:fixed;
		bottom: 0px;
		width: 100%;
		background: pink;
		display: flex;
		.prev,.next,.audio {
			width: 100px;
			height: 100px;
			background: yellowgreen;
		}
	}

	.title {
		font-size: 46px;
		// color: #8f8f94;
		color:black;
	}
</style>
