<template>
	<div class="content">
		<div class="header">
			<button size="mini"  @click="handleToogleAudio" :type="autoplay?'primary':'default'">{{autoplay?'已开':'已关'}}音频</button>
			<button size="mini"  @click="handleToogleRandom" :type="isRandom?'primary':'default'">{{isRandom?'已开':'已关'}}随机</button>
		</div>
		<div class="text-area">
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
	</div>
</template>

<script>
	import dict from "../../static/js/data.js"
	const CURRENT_KEY = 'dict_current_key'
	var touchStartX = 0;//触摸时的原点  
	var touchStartY = 0;//触摸时的原点  
	var time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动  
	var interval = "";// 记录/清理时间记录  
	var touchMoveX = 0; // x轴方向移动的距离
	var touchMoveY = 0; // y轴方向移动的距离
	export default {
		data() {
			return {
				title: 'Hello',
				dict: Object.freeze(dict),
				currentIndex: 0,
				audioIndex: 0,
				autoplay: false,
				innerAudioContext: null,
				isRandom: false,		
			}
		},
		onLoad() {

		},
		created() {
			this.init()
		},
		computed: {
			currentItem () {
				return this.dict[this.currentIndex]
			},
		},
		methods: {
			init() {
				this.getCurrentKey() // 获取序列最新key
				this.initAudio() // 初始音频
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
				uni.setStorageSync(CURRENT_KEY,this.currentIndex)
			},
			getCurrentKey() {
				this.currentIndex = uni.getStorageSync(CURRENT_KEY) || 0 
			},
			handleToogleAudio() {
				this.autoplay = !this.autoplay
			},
			handleToogleRandom() {
				this.isRandom = !this.isRandom
				if(!this.isRandom) {
					this.getCurrentKey()
				}
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
					}
					// 向下滑动  
					if (touchMoveY - touchStartY >= 30 && time < 10) {
						this.playAudio()
					}
				}else {// 左右
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
		opacity: 0.1;
		>.text {
			margin-bottom: 15px;
			font-size: 20px;
			text-align: center;
		}
		.title {
			font-size: 36px;
			margin-bottom: 20px;
		}
		.trans {

		}
		.root {

		}
		.associate {

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
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
