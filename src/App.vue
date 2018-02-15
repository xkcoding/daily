<template>
  <div id="app">
    <div class="daily">
      <div class="daily-menu">
        <div class="daily-menu-item"
             :class="{on:type === 'recommend'}"
             @click="handleToRecommend">每日推荐
        </div>
        <div class="daily-menu-item" :class="{on:type === 'daily'}" @click="handleToDaily">主题日报</div>
        <ul v-show="showThemes">
          <li v-for="item in themes" :key="item.id">
            <a :class="{on:item.id === themeId && type === 'daily'}" @click="handleToTheme(item.id)">{{item.name}}</a>
          </li>
        </ul>
      </div>
      <div class="daily-list" ref="list" @scroll="handleScroll">
        <template v-if="type === 'recommend'">
          <div v-for="list in recommendList" :key="list.date">
            <div class="daily-date">{{formatDay(list.date)}}</div>
            <Item v-for="item in list.stories" :data="item" :key="item.id" @click.native="handleClick(item.id)"></Item>
          </div>
        </template>
        <template v-if="type === 'daily'">
          <Item v-for="item in list" :data="item" :key="item.id" @click.native="handleClick(item.id)"></Item>
        </template>
      </div>
      <daily-article :id="articleId"></daily-article>
    </div>
  </div>
</template>

<script>
import $ from '../libs/util'
import Item from 'components/item'
import dailyArticle from 'components/daily-article'

const DayUnit = 24 * 60 * 60 * 1000
export default {
  name: 'App',
  components: {
    Item, dailyArticle
  },
  data: function () {
    return {
      themes: [],
      showThemes: false,
      type: 'recommend',
      themeId: 0,
      list: [],
      recommendList: [],
      dailyTime: $.getTodayTime(),
      isLoading: false,
      articleId: 0
    }
  },
  methods: {
    handleScroll () {
      const $list = this.$refs.list
      // 在“主题日报”或正在加载推荐列表时停止操作
      if (this.type === 'daily' || this.isLoading) {
        return
      }
      // 已经滚动的距离加上页面的高度等于整个内容区域的高度时，视为接触底部
      if ($list.scrollTop + document.body.clientHeight >= $list.scrollHeight) {
        // 时间相对减少一天
        this.dailyTime -= DayUnit
        this.getRecommendList()
      }
    },
    // 转化为带汉字的年月日
    formatDay (date) {
      let year = date.substr(0, 4)
      let month = date.substr(4, 2)
      let day = date.substr(6, 2)
      if (month.substr(0, 1) === '0') {
        month = month.substr(1, 1)
      }
      if (day.substr(0, 1) === '0') {
        day = day.substr(1, 1)
      }
      return `${year} 年 ${month} 月 ${day} 日`
    },
    getThemes () {
      $.ajax.get('themes').then(res => {
        this.themes = res.others
      })
    },
    handleToDaily () {
      this.type = 'daily'
      this.showThemes = !this.showThemes
    },
    handleToRecommend () {
      this.type = 'recommend'
      this.recommendList = []
      this.dailyTime = $.getTodayTime()
      this.getRecommendList()
    },
    getRecommendList () {
      this.isLoading = true
      const prevDay = $.prevDay(this.dailyTime + DayUnit)
      $.ajax.get('news/before/' + prevDay).then(res => {
        this.recommendList.push(res)
        this.isLoading = false
      })
    },
    handleToTheme (id) {
      // 设置菜单分类
      this.type = 'daily'
      // 设置当前点击子类的主题日报 id
      this.themeId = id
      // 清空中间栏的数据
      this.list = []

      $.ajax.get('theme/' + id).then(res => {
        this.list = res.stories.filter(item => item.type !== 1)
      })
    },
    handleClick (id) {
      this.articleId = id
    }
  },
  mounted () {
    this.getThemes()
    this.getRecommendList()
    // // 获取到 DOM
    // const $list = this.$refs.list
    // $list.addEventListener('scroll', () => {
    //   // 在“主题日报”或正在加载推荐列表时停止操作
    //   if (this.type === 'daily' || this.isLoading) {
    //     return
    //   }
    //   // 已经滚动的距离加上页面的高度等于整个内容区域的高度时，视为接触底部
    //   if ($list.scrollTop + document.body.clientHeight >= $list.scrollHeight) {
    //     // 时间相对减少一天
    //     this.dailyTime -= DayUnit
    //     this.getRecommendList()
    //   }
    // })
  }
}
</script>

<style>
</style>
