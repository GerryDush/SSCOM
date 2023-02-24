<template>
  <n-config-provider :theme-overrides="configs.theme==='dark'?darkThemeOverrides:lightThemeOverrides"
                     :theme="configs.theme==='dark'?darkTheme:lightTheme" :hljs="hljs">
    <div class="drag-app"></div>
    <n-dialog-provider>
      <n-tabs type="segment" v-model="configs.tabActive">
        <n-tab-pane name="chap1" tab="串口" display-directive="show">
          <HelloWorld/>
        </n-tab-pane>
        <n-tab-pane name="chap2" tab="示波器" display-directive="show:lazy">
          <OtherAbility></OtherAbility>
        </n-tab-pane>
        <n-tab-pane name="chap3" tab="设置" display-directive="show:lazy">
          <n-list>
            <n-list-item>
              <n-thing title="外观" description="浅色模式/深色模式/跟随系统"></n-thing>
              <template #suffix>
                <div style="width: 300px;display: flex;justify-content: flex-end">
                  <n-space>
                    <n-space>
                      <n-radio-group v-model:value="configs.themeMode" name="theme"
                                     @change="themeChange(configs.themeMode)" v-show="configs.themeMode!=='system'">
                        <n-space>
                          <n-radio value="light">浅色</n-radio>
                          <n-radio value="dark">深色</n-radio>
                        </n-space>
                      </n-radio-group>
                    </n-space>
                    <n-space>
                      <div>跟随系统</div>
                      <n-switch v-model="configs.themeMode" :value="configs.themeMode" checked-value="system"
                                unchecked-value="custom"
                                @update:value="themeChange"></n-switch>
                    </n-space>
                  </n-space>
                </div>
              </template>
            </n-list-item>
            <n-list-item>
              <n-thing title="其它" description="敬请期待"></n-thing>
              <template #suffix>None</template>
            </n-list-item>
          </n-list>
        </n-tab-pane>
      </n-tabs>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup>
import {
  darkTheme,
  lightTheme,
  NConfigProvider,
  NList,
  NListItem,
  NRadio,
  NRadioGroup,
  NSpace,
  NSwitch,
  NTabPane,
  NTabs,
  NThing,
  createDiscreteApi,
  NDialogProvider
} from 'naive-ui'
import HelloWorld from './components/HelloWorld.vue'
import OtherAbility from './components/OtherAbility.vue'
import {computed, reactive} from 'vue';
import {ipcRenderer} from 'electron';
import hljs from 'highlight.js/lib/core'
import c from 'highlight.js/lib/languages/c'

hljs.registerLanguage('c', c)


const lightThemeOverrides = {
  common: {
    placeholderColor: '#EEE',
    buttonBorderColor: 'red'
  },
  List: {
    color: '#00000000'
  },
  Input: {
    color: 'rgba(0,0,0,0.1)',
    colorFocus: 'rgba(0,0,0,0.2)',
    border: '#aaa'
  },
  Checkbox: {
    color: 'rgba(0,0,0,0.1)',
    colorFocus: 'rgba(0,0,0,0.2)',
    border: '#aaa'
  },
  Radio: {
    buttonColorActive: 'rgba(0,0,0,0.0)',
    buttonBorderColor: '#aaa'
  },
  Select: {
    border: '#aaa',
    peers: {
      InternalSelection: {
        color: 'rgba(0,0,0,0.1)',
        colorActive: 'rgba(0,0,0,0.2)',
        border: '#aaa'
      }
    }
  },
  Tabs: {
    colorSegment: 'rgba(0,0,0,0.08)',
    tabColorSegment: 'rgba(255,255,255,0.6)',
  }
}

const darkThemeOverrides = {
  List: {
    color: '#00000000'
  },
  Input: {
    color: 'rgba(255,255,255,0.1)'
  }
}

const configs = reactive({
  theme: '', // 'light' | 'dark'
  themeMode: 'system',
  tabActive: 'chap1',
});

let {message} = createDiscreteApi(['message'], {
  configProviderProps: computed(() => ({theme: configs.theme === 'dark' ? darkTheme : lightTheme})),
});
window.$message = message;

const getCurrentTheme = async () => {
  return await ipcRenderer.invoke('dark-mode:get') ? 'dark' : 'light';
}

ipcRenderer.on('dark-mode:updated', (event, isDark) => {
  if (configs.themeMode === 'system') {
    configs.theme = isDark ? 'dark' : 'light';
  }
});

const themeChange = async (e) => {
  switch (e) {
    case 'system':
      configs.theme = await getCurrentTheme();
      await ipcRenderer.invoke('dark-mode:set', e);
      configs.themeMode = 'system';
      break;
    case 'custom':
      configs.theme = configs.themeMode = await getCurrentTheme();
      break;
    default:
      configs.theme = configs.themeMode = e;
      await ipcRenderer.invoke('dark-mode:set', e);
      break;
  }
  localStorage.setItem('themeMode', e);
}
themeChange(localStorage.getItem('themeMode') || 'system')


</script>

<style>
.drag-app {
  height: 36px;
  -webkit-app-region: drag;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
}

:root {
  --vt-c-white: #ffffff;
  --vt-c-white-soft: #f9f9f9;
  --vt-c-white-mute: #f1f1f1;
  --vt-c-black: #1a1a1a;
  --vt-c-black-pure: #000000;
  --vt-c-black-soft: #242424;
  --vt-c-black-mute: #2f2f2f;
  --vt-c-indigo: #213547;
  --vt-c-indigo-soft: #476582;
  --vt-c-indigo-light: #aac8e4;
  --vt-c-gray: #8e8e8e;
  --vt-c-gray-light-1: #aeaeae;
  --vt-c-gray-light-2: #c7c7c7;
  --vt-c-gray-light-3: #d1d1d1;
  --vt-c-gray-light-4: #e5e5e5;
  --vt-c-gray-light-5: #f2f2f2;
  --vt-c-gray-dark-1: #636363;
  --vt-c-gray-dark-2: #484848;
  --vt-c-gray-dark-3: #3a3a3a;
  --vt-c-gray-dark-4: #282828;
  --vt-c-gray-dark-5: #202020;
  --vt-c-divider-light-1: rgba(60, 60, 60, .29);
  --vt-c-divider-light-2: rgba(60, 60, 60, .12);
  --vt-c-divider-dark-1: rgba(84, 84, 84, .65);
  --vt-c-divider-dark-2: rgba(84, 84, 84, .48);
  --vt-c-text-light-1: var(--vt-c-indigo);
  --vt-c-text-light-2: rgba(60, 60, 60, .7);
  --vt-c-text-light-3: rgba(60, 60, 60, .33);
  --vt-c-text-light-4: rgba(60, 60, 60, .18);
  --vt-c-text-light-code: var(--vt-c-indigo-soft);
  --vt-c-text-dark-1: rgba(255, 255, 255, .87);
  --vt-c-text-dark-2: rgba(235, 235, 235, .6);
  --vt-c-text-dark-3: rgba(235, 235, 235, .38);
  --vt-c-text-dark-4: rgba(235, 235, 235, .18);
  --vt-c-text-dark-code: var(--vt-c-indigo-light);
  --vt-c-green: #42b883;
  --vt-c-green-light: #42d392;
  --vt-c-green-lighter: #35eb9a;
  --vt-c-green-dark: #33a06f;
  --vt-c-green-darker: #155f3e;
  --vt-c-blue: #3b8eed;
  --vt-c-blue-light: #549ced;
  --vt-c-blue-lighter: #50a2ff;
  --vt-c-blue-dark: #3468a3;
  --vt-c-blue-darker: #255489;
  --vt-c-yellow: #ffc517;
  --vt-c-yellow-light: #ffe417;
  --vt-c-yellow-lighter: #ffff17;
  --vt-c-yellow-dark: #e0ad15;
  --vt-c-yellow-darker: #bc9112;
  --vt-c-red: #ed3c50;
  --vt-c-red-light: #f43771;
  --vt-c-red-lighter: #fd1d7c;
  --vt-c-red-dark: #cd2d3f;
  --vt-c-red-darker: #ab2131;
  --vt-c-purple: #de41e0;
  --vt-c-purple-light: #e936eb;
  --vt-c-purple-lighter: #f616f8;
  --vt-c-purple-dark: #823c83;
  --vt-c-purple-darker: #602960;

  --vt-c-card-dark: rgba(0, 0, 0, 0.2);
  --vt-c-card-light: rgba(100, 100, 100, 0.2);

  --n-text-form-color-dark: rgba(255, 255, 255, 0.82);
  --n-text-form-color-disabled-dark: rgba(255, 255, 255, 0.38);
  --n-text-form-color-light: rgb(51, 54, 57);
  --n-text-form-color-disabled-light: rgba(194, 194, 194, 1);
}


:root {
  --vt-c-bg: var(--vt-c-white);
  --vt-c-bg-soft: var(--vt-c-white-soft);
  --vt-c-bg-mute: var(--vt-c-white-mute);
  --vt-c-divider: var(--vt-c-divider-light-1);
  --vt-c-divider-light: var(--vt-c-divider-light-2);
  --vt-c-divider-inverse: var(--vt-c-divider-dark-1);
  --vt-c-divider-inverse-light: var(--vt-c-divider-dark-2);
  --vt-c-text-1: var(--vt-c-text-light-1);
  --vt-c-text-2: var(--vt-c-text-light-2);
  --vt-c-text-3: var(--vt-c-text-light-3);
  --vt-c-text-4: var(--vt-c-text-light-4);
  --vt-c-text-code: var(--vt-c-text-light-code);
  --vt-c-text-inverse-1: var(--vt-c-text-dark-1);
  --vt-c-text-inverse-2: var(--vt-c-text-dark-2);
  --vt-c-text-inverse-3: var(--vt-c-text-dark-3);
  --vt-c-text-inverse-4: var(--vt-c-text-dark-4);

  --vt-c-bg-card: var(--vt-c-card-light);

  --n-text-form-color: var(--n-text-form-color-light);
  --n-text-form-color-disabled: var(--n-text-form-color-disabled-light);
}

body {
  background-color: rgba(255, 255, 255, 0.2);
}

@media (prefers-color-scheme: dark) {
  :root {
    --vt-c-bg: var(--vt-c-black);
    --vt-c-bg-soft: var(--vt-c-black-soft);
    --vt-c-bg-mute: var(--vt-c-black-mute);
    --vt-c-divider: var(--vt-c-divider-dark-1);
    --vt-c-divider-light: var(--vt-c-divider-dark-2);
    --vt-c-divider-inverse: var(--vt-c-divider-light-1);
    --vt-c-divider-inverse-light: var(--vt-c-divider-light-2);
    --vt-c-text-1: var(--vt-c-text-dark-1);
    --vt-c-text-2: var(--vt-c-text-dark-2);
    --vt-c-text-3: var(--vt-c-text-dark-3);
    --vt-c-text-4: var(--vt-c-text-dark-4);
    --vt-c-text-code: var(--vt-c-text-dark-code);
    --vt-c-text-inverse-1: var(--vt-c-text-light-1);
    --vt-c-text-inverse-2: var(--vt-c-text-light-2);
    --vt-c-text-inverse-3: var(--vt-c-text-light-3);
    --vt-c-text-inverse-4: var(--vt-c-text-light-4);

    --vt-c-bg-card: var(--vt-c-card-dark);

    --n-text-form-color: var(--n-text-form-color-dark);
    --n-text-form-color-disabled: var(--n-text-form-color-disabled-dark);
  }

  body {
    background-color: rgba(0, 0, 0, 0);
  }
}

html, body, #app, .n-config-provider, .n-tabs {
  height: 100%;
  box-sizing: border-box;
}

.n-tabs {
  height: 100%;
  box-sizing: border-box;
}

.n-tab-pane {
  height: calc(100% - 39px);
  box-sizing: border-box;
}

#app {
  box-sizing: border-box;
  padding: 36px 20px 20px;
}

.container {
  height: 100%;
}
</style>
