<template>
  <el-container style="position: absolute; width: 100%; height: 100%">
    <el-aside width="340px" height="100%">
      <el-card class="box-card" shadow="hover">
        <div slot="header" class="clearfix">
          <span>地图坐标</span>
        </div>
        <el-form :inline="true">
          <el-form-item label="经度">
            <el-input v-model="position.lng" placeholder="116.405419" clearable></el-input>
          </el-form-item>
          <el-form-item label="维度">
            <el-input v-model="position.lat" placeholder="39.913828" clearable></el-input>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="box-card" shadow="hover">
        <div slot="header" class="clearfix">
          <span>搜索区域</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="setting">设置</el-button>
        </div>
        <el-row>
          <el-col :span="8">
            <el-button :disabled="!(this.$store.state.Spirit.scanPath.length === 0 && !this.$store.state.Spirit.isSearching)" @click="newPolyline">
              {{ this.spirit.isEditing ? '停止框选': '开始框选' }}
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button :disabled="this.$store.state.Spirit.scanPath.length === 0 && !this.$store.state.Spirit.isSearching" @click="clearPolyline">清空区域</el-button>
          </el-col>
          <el-col :span="8">
            <el-button :disabled="this.spirit.isEditing || this.spirit.path.length < 3" @click="spiritSearch">
              {{ this.$store.state.Spirit.isSearching ? '暂停搜索': '开始搜索' }}
            </el-button>
          </el-col>
        </el-row>
        <el-progress
            style="padding: 10px 0"
            :text-inside="true"
            :stroke-width="24"
            :percentage="$store.getters['Spirit/curPercent']"
            status="success">
        </el-progress>
      </el-card>
      <el-card class="box-card" shadow="hover">
        <div slot="header" class="clearfix">
          <span>查找人</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="searchUser">搜索</el-button>
        </div>
        <el-input v-model="search.username" placeholder="名字" clearable></el-input>
        <el-table
            :data="this.$store.getters['Searcher/resultTable']"
            size="mini"
            @row-click="tableRowClick"
            stripe>
          <el-table-column prop="name" label="名字"></el-table-column>
          <el-table-column
              prop="point"
              label="坐标"
              :formatter="tablePointFormatter">
          </el-table-column>
          <el-table-column prop="update_time" label="时间"></el-table-column>
        </el-table>
      </el-card>
    </el-aside>
    <el-container>
      <baidu-map
          :zoom="position.zoom"
          :center="{lng: position.lng, lat: position.lat}"
          @mousemove="syncPolyline"
          @click="paintPolyline"
          @rightclick="newPolyline"
          @zoomend="onMapZoom"
          style="width: 100%; height: 100%">
        <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>
        <bm-city-list anchor="BMAP_ANCHOR_TOP_LEFT"></bm-city-list>
        <bm-polyline :path="spirit.path"></bm-polyline>
        <bm-point-collection
            color="red"
            :size="spirit.pointSize"
            :points="this.$store.state.Searcher.resultList"
            shape="BMAP_POINT_SHAPE_STAR"
            @click="onPointClick">
        </bm-point-collection>
      </baidu-map>
    </el-container>
    <el-dialog
        title="提示"
        :visible.sync="dialog.visible"
        center>
      <el-table
          :data="dialog.data">
        <el-table-column prop="key"></el-table-column>
        <el-table-column prop="value"></el-table-column>
      </el-table>
    </el-dialog>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      dialog: {
        visible: false,
        data: []
      },
      position: {
        lng: 116.405419,
        lat: 39.913828,
        zoom: 10
      },
      search: {
        username: ''
      },
      spirit: {
        isEditing: false,
        path: [],
        pointSize: 'BMAP_POINT_SIZE_NORMAL'
      }
    }
  },
  methods: {
    /**
     * 鼠标点击绘制区域
     * @param e
     */
    paintPolyline (e) {
      if (!this.spirit.isEditing) {
        return
      }
      const {path} = this.spirit
      path.push(e.point)
    },
    /**
     * 鼠标移动连接区域
     * @param e
     */
    syncPolyline (e) {
      if (!this.spirit.isEditing) {
        return
      }
      const {path} = this.spirit
      if (!path.length) {
        return
      }
      if (path.length === 1) {
        path.push(e.point)
      }
      this.$set(path, path.length - 1, e.point)
    },
    /**
     * 开始/结束绘制区域
     * @param e
     */
    newPolyline (e) {
      if (!this.spirit.isEditing && e.type === 'onrightclick') {
        return
      }
      if (this.spirit.isEditing) {
        this.spirit.path.pop()
      }
      this.spirit.isEditing = !this.spirit.isEditing
    },
    /**
     * 清空搜索区域按钮点击，并停止搜索
     */
    clearPolyline () {
      this.$store.dispatch('Spirit/stopScan')
      this.spirit.path = []
      this.spirit.isEditing = false
    },
    /**
     * 搜索区域按钮点击
     */
    spiritSearch () {
      if (this.$store.state.Spirit.scanPath.length === 0) {
        this.spirit.path.push(this.spirit.path[0])
        this.$store.dispatch('Spirit/startScan', {path: this.spirit.path})
      } else {
        this.$store.dispatch('Spirit/toggleScan')
      }
    },
    /**
     * 搜索用户按钮点击
     */
    searchUser () {
      this.$store.dispatch('Searcher/search', {username: this.search.username})
    },
    onPointClick (e) {
      this.dialog.data = [
        {
          'key': '经度',
          'value': e.point.lng
        },
        {
          'key': '维度',
          'value': e.point.lat
        },
        {
          'key': '名字',
          'value': e.point.name
        },
        {
          'key': '更新时间',
          'value': new Date(e.point.update_time * 1000).toLocaleString()
        }
      ]
      this.dialog.visible = true
    },
    setting () {
      this.$router.push('/setting')
    },
    onMapZoom (e) {
      if (e.target.getZoom() <= 10) {
        this.spirit.pointSize = 'BMAP_POINT_SIZE_TINY'
      } else if (e.target.getZoom() <= 11) {
        this.spirit.pointSize = 'BMAP_POINT_SIZE_SMALLER'
      } else if (e.target.getZoom() <= 12) {
        this.spirit.pointSize = 'BMAP_POINT_SIZE_SMALL'
      } else if (e.target.getZoom() <= 13) {
        this.spirit.pointSize = 'BMAP_POINT_SIZE_NORMAL'
      } else if (e.target.getZoom() <= 15) {
        this.spirit.pointSize = 'BMAP_POINT_SIZE_BIG'
      } else if (e.target.getZoom() <= 17) {
        this.spirit.pointSize = 'BMAP_POINT_SIZE_BIGGER'
      } else {
        this.spirit.pointSize = 'BMAP_POINT_SIZE_HUGE'
      }
    },
    tableRowClick (e) {
      this.position.lng = e.lng
      this.position.lat = e.lat
      this.position.zoom = 14
    },
    tablePointFormatter (row) {
      return `${row.lng.toFixed(6)},${row.lat.toFixed(6)}`
    }
  }
}
</script>