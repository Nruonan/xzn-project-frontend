<template>
  <div slot="register">
  <img class="register-qr" :src="loginQR" />
  <div class="register-title">账号注册</div>
  <el-form ref="formRef" class="register-form" :model="form" :rules="rules">
    <el-form-item prop="username">
      <el-input type="text" maxlength="10" style="height: 42px" v-model="form.username" placeholder="请输入用户名">
        <template #prefix>
          <UserOutlined />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input minlength="6" maxlength="15"
          style="height: 42px"
          v-model="form.password"
          autocomplete="on"
          type="password"
          placeholder="请输入密码：最小 6 位"
      >
        <template #prefix>
          <LockOutlined />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="password_repeat">
      <el-input
          style="height: 42px"
          v-model="form.password_repeat"
          autocomplete="on"
          type="password"
          placeholder="请再次输入密码">
        <template #prefix>
          <LockOutlined />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="email">
      <el-input style="text-align: left; height: 42px; width: 400px ;" type="text"  v-model="form.email" placeholder="请输入邮箱地址">
        <template #prefix>
          <MailOutlined />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="code" >
      <el-col :span="12">
        <el-input style="height: 42px;margin-right: 80px;width: 220px" maxlength="6" v-model="form.code" placeholder="请输入验证码">
          <template #prefix>
            <SafetyCertificateOutlined />
          </template>
        </el-input>
      </el-col>
      <el-col :span="12" style="text-align: right ;transform:translateY(4%);" >
        <el-button @click=askCode() style="width: 60%;height: 35px" color="#1cc2af"  plain
                   :disabled="!isEmailValid ||coldTime">{{coldTime > 0 ? '请稍后 '+coldTime+'秒' : '获取验证码'}}</el-button>
      </el-col>
    </el-form-item>
    <el-form-item>
      <el-button  @click="register" style = "height:40px;width: 350px" color="#1e1efa"  plain>注册</el-button>
    </el-form-item>
    <el-divider>
      <span style="font-size: 13px; color: grey">已有账号</span>
    </el-divider>
    <el-form-item>
      <el-button @click="router.push({name:'welcome-login'})" style = "height:40px;width: 350px" color="#a7a7f1"  plain>立即登录</el-button>
    </el-form-item>
  </el-form>
  </div>
</template>

<script setup>
import {computed,ref, reactive} from "vue";
import loginQR from "../../assets/images/login-qr.png";
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons-vue";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {apiAuthAskCode, apiAuthRegister} from "@/net/api/user.js";
const router = useRouter()
const coldTime = ref(0)
const form = reactive({
  username:'',
  password:'',
  password_repeat:'',
  email:'',
  code:''
})
const formRef = ref()
const validateUsername = (rule,value, callback) => {
  if(value === ''){
    callback(new Error('请输入用户名'))
  }else if(!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)){
    callback(new Error('用户名不能包括特殊字符,只能是中英文'))
  }else{
    callback()
  }
}
const validatePassword = (rule, value, callback) =>{
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}
const rules = {
  username: [
        {validator:validateUsername, trigger:['blur','change']},
        { min : 2, max : 10, message: '用户名的长度必须在2-10个字符之间', trigger:['blur','change']},
    ],

  password: [
  { required: true, message: '请输入密码', trigger: 'blur' },
  { min: 6, max: 16, message: '密码的长度必须在6-16个字符之间', trigger: ['blur', 'change'] }
],
  password_repeat: [
    { validator: validatePassword, trigger: ['blur', 'change'] },
  ],
  email: [
    { required: true, message: '请输入邮件地址', trigger: 'blur' },
    {type: 'email', message: '请输入合法的电子邮件地址', trigger: ['blur', 'change']}
  ],
  code: [
    { required: true, message: '请输入获取的验证码', trigger: 'blur' },
  ]
};
function  askCode(){
  if(isEmailValid){
    apiAuthAskCode(form.email,coldTime)
  }else{
    ElMessage.warning('请输入正确的电子邮件！')
    coldTime.value = 0
  }
}
const isEmailValid = computed(() =>/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email) )

function register() {
  formRef.value.validate((valid) =>{
    if(valid){
      apiAuthRegister({
        username: form.username,
        password: form.password,
        email: form.email,
        code: form.code
      })
    }else{
      ElMessage.warning('请完整填写注册内容')
    }
  })
}
</script>

<style scoped>
@import 'register.less';
</style>