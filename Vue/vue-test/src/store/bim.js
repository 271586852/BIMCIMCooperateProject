import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export const useBimStore = defineStore('bim', () => {
  // state
  const isBim = ref(false);
  const clientId = ref('');
  const clientSecret = ref('');
  const GlBimUrl = ref('');
  const BeareraccessToken = ref('');
  const GouLidbid = ref('');
  const NotGLmeta = ref('');
  const refreshCount = ref(-1);  // 刷新次数计数器
  const accesstoken = ref('');

  // 定时器ID
  let intervalId = null;

  // 获取BeareraccessToken的函数
  const GetToken = async () => {
    const Gettokenurl = 'https://api.cloud.pkpm.cn/bimserver/auth/oauth/token';

    const GettokenBody = {
      grant_type: 'client_credentials',
      client_id: clientId.value,
      client_secret: clientSecret.value,
    };

    try {
      const GettokenResponse = await axios.post(Gettokenurl, GettokenBody, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      //刷新更新次数
      refreshCount.value += 1;
      
      if(refreshCount.value === 0){
      ElMessage.success('BeareraccessToken获取成功');

      }
      else if(refreshCount.value > 0){
      ElMessage.info(`第 ${refreshCount.value} 次更新BeareraccessToken`);
      console.log('这是第', refreshCount.value, '次更新BeareraccessToken');
      }
      accesstoken.value = GettokenResponse.data.access_token;
      BeareraccessToken.value = 'Bearer ' + accesstoken.value;
      localStorage.setItem('BeareraccessToken', BeareraccessToken.value);

      console.log('BeareraccessToken:', BeareraccessToken.value);

      

      // 如果是首次获取非空值，启动定时器
      if (!intervalId) {
        startTokenRefreshInterval();
      }
    } catch (error) {
      ElMessage.error('BeareraccessToken获取失败');
      console.error('BeareraccessToken获取失败：', error);
    }
  };

  // 启动定时器的函数
  const startTokenRefreshInterval = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(GetToken, 6 * 60 * 60 * 1000); // 每6小时获取一次 token
  };

   const changeisBim = () => {
        isBim.value = !isBim.value
    }

  return {
    isBim,
    clientId,
    clientSecret,
    GlBimUrl,
    BeareraccessToken,
    GouLidbid,
    NotGLmeta,  
    refreshCount,
    accesstoken,
    changeisBim,
    GetToken,
    startTokenRefreshInterval,
  };
});
