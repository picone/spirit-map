<template>
  <el-container>
    <el-header>
      <el-page-header @back="goHome" content="设置">
      </el-page-header>
    </el-header>
    <el-main>
      <el-card shadow="hover">
        <div slot="header" class="clearfix">
          <span>爬取账号设置</span>
        </div>
        <el-form v-model="auth" ref="auth">
          <el-col :span="12">
            <el-form-item label="openid" prop="openid">
              <el-input v-model="auth.openid" placeholder="openid"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="gwgo_token" prop="gwgoToken">
              <el-input v-model="auth.gwgoToken" placeholder="gwgo_token"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>
              <el-button
                  :disabled="this.$store.state.Spirit.openid === this.auth.openid && this.$store.state.Spirit.gwgoToken === this.auth.gwgoToken"
                  type="primary"
                  @click="saveAuth">
                保存
              </el-button>
            </el-form-item>
          </el-col>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      auth: {
        openid: '',
        gwgoToken: ''
      }
    }
  },
  created () {
    this.auth.openid = this.$store.state.Spirit.openid
    this.auth.gwgoToken = this.$store.state.Spirit.gwgoToken
  },
  methods: {
    saveAuth () {
      this.$store.dispatch('Spirit/setAuth', {
        openid: this.auth.openid,
        gwgoToken: this.auth.gwgoToken
      })
    },
    goHome () {
      this.$router.go(-1)
    }
  }
}
</script>
