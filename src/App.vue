<template>
  <n-config-provider :theme-overrides="configs.theme === 'dark' ? darkThemeOverrides : lightThemeOverrides"
    :theme="configs.theme === 'dark' ? darkTheme : lightTheme" :hljs="hljs">
    <n-dialog-provider>
      <div data-tauri-drag-region class="titlebar">
          <template v-if="configs.platform !== 'macos'">
            <div class="titlebar-button" id="titlebar-minimize">
            <svg v-if="configs.theme==='dark'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M19 13H5v-2h14z"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#000" d="M19 13H5v-2h14z"/></svg>
          </div>
          <div class="titlebar-button" id="titlebar-maximize" >
            <svg v-if="configs.theme==='dark'" style="width: 16px;height: 16px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M19 3H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 2v14H5V5z"/></svg>
            <svg v-else style="width: 16px;height: 16px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#000" d="M19 3H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 2v14H5V5z"/></svg>
          </div>
          <div class="titlebar-button" id="titlebar-close">
            <svg v-if="configs.theme==='dark'" style="width: 22px;height: 22px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
            <svg v-else style="width: 22px;height: 22px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#000" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
          </div>
          </template>
      </div>
      <n-tabs type="segment" v-model="configs.tabActive">
        <n-tab-pane name="chap1" tab="串口" display-directive="show">
          <HelloWorld />
        </n-tab-pane>
        <n-tab-pane name="chap2" tab="示波器" display-directive="show:lazy">
          <OtherAbility />
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
                        @change="themeChange(configs.themeMode)" v-show="configs.themeMode !== 'system'">
                        <n-space>
                          <n-radio value="light">浅色</n-radio>
                          <n-radio value="dark">深色</n-radio>
                        </n-space>
                      </n-radio-group>
                    </n-space>
                    <n-space>
                      <div>跟随系统</div>
                      <n-switch v-model="configs.themeMode" :value="configs.themeMode" checked-value="system"
                        unchecked-value="custom" @update:value="themeChange"></n-switch>
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
import { computed, reactive,onMounted } from 'vue';
// import {ipcRenderer} from 'electron';
import { getCurrentWindow } from "@tauri-apps/api/window";
import { platform } from '@tauri-apps/plugin-os'
import hljs from 'highlight.js/lib/core'
import cpp from 'highlight.js/lib/languages/cpp'


hljs.registerLanguage('cpp', cpp)


const lightThemeOverrides = {
  common: {
    placeholderColor: '#000',
    color: 'rgba(0,0,0,0.1)',
    colorDisabled: '#000000',
  },
  Upload: {
    draggerColor: 'rgba(0,0,0,0.1)',
  },
  List: {
    color: '#00000000'
  },
  Button: {
    border: '1px solid #999',
  },
  Input: {
    color: 'rgba(0,0,0,0.1)',
    textColor: 'rgba(0,0,0,1)',
    colorFocus: 'rgba(0,0,0,0.2)',
    border: '#aaa',
    colorDisabled: '#000000',
  },
  Checkbox: {
    color: 'rgba(0,0,0,0.1)',
    colorFocus: 'rgba(0,0,0,0.2)',
    border: '#aaa'
  },
  Radio: {
    buttonColorActive: 'rgba(0,0,0,0.0)',
    buttonColor: 'rgba(0,0,0,0.1)',
    buttonBorderColor: 'rgba(0,0,0,0.2)',
  },
  Select: {
    border: '#aaa',
    color: 'rgba(0,0,0,0.1)',
    colorDisabled: '#000000',
    peers: {
      InternalSelection: {
        color: 'rgba(0,0,0,0.1)',
        colorActive: 'rgba(0,0,0,0.0)',
        border: '#aaa',
        colorDisabled: 'rgba(255,255,255,0.5)',
      },
      InternalSelectMenu: {
        optionFontSize: '14px',
        optionTextColor: '#333',
        optionColorPending: '#f0f0f0',
        optionColorActive: '#e6f7ff',
        optionTextColorActive: '#096dd9',
        optionColorHover: '#f5f5f5',
        padding: '8px 0',
        borderRadius: '6px'
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
  platform: platform(),
  theme: '', // 'light' | 'dark'
  themeMode: 'system',
  tabActive: 'chap1',
});

let { message } = createDiscreteApi(['message'], {
  configProviderProps: computed(() => ({ theme: configs.theme === 'dark' ? darkTheme : lightTheme })),
});
window.$message = message;

const appWindow = getCurrentWindow();

appWindow.onThemeChanged(({ payload: theme }) => {
  if (configs.themeMode === 'system') {
    configs.theme = theme;
  }
});

onMounted(()=>{
  document
  .getElementById('titlebar-minimize')
  ?.addEventListener('click', () => appWindow.minimize());
document
  .getElementById('titlebar-maximize')
  ?.addEventListener('click', () => appWindow.toggleMaximize());
document
  .getElementById('titlebar-close')
  ?.addEventListener('click', () => appWindow.close());
})





// ipcRenderer.on('dark-mode:updated', (event, isDark) => {
//   if (configs.themeMode === 'system') {
//     configs.theme = isDark ? 'dark' : 'light';
//   }
// });

const themeChange = async (e) => {
  switch (e) {
    case 'system':
      await getCurrentWindow().setTheme(null); //跟随系统
      configs.theme = await getCurrentWindow().theme() || 'light';
      configs.themeMode = 'system';
      break;
    case 'custom':
      configs.theme = configs.themeMode = await getCurrentWindow().theme() || 'light';
      break;
    default:
      configs.theme = configs.themeMode = e;
      console.log(e);

      await getCurrentWindow().setTheme(e);
      break;
  }
  localStorage.setItem('themeMode', e);
  applyThemeVariables(configs.theme);

}
themeChange(localStorage.getItem('themeMode') || 'system')


const applyThemeVariables = (theme) => {
  const bodyBackgroundColors = {
    light: 'rgba(255, 255, 255, 0.6)',
    dark: 'rgba(0, 0, 0, 0)',
  };
  if (configs.platform !== 'macos') {
    bodyBackgroundColors.light = '#ffffff';
    bodyBackgroundColors.dark = '#000000';
  }
  const root = document.documentElement;
  if (theme === 'dark') {
    // Dark mode variables
    root.style.setProperty('--vt-c-bg', 'var(--vt-c-black)');
    root.style.setProperty('--vt-c-bg-soft', 'var(--vt-c-black-soft)');
    root.style.setProperty('--vt-c-bg-mute', 'var(--vt-c-black-mute)');
    root.style.setProperty('--vt-c-divider', 'var(--vt-c-divider-dark-1)');
    root.style.setProperty('--vt-c-divider-light', 'var(--vt-c-divider-dark-2)');
    root.style.setProperty('--vt-c-divider-inverse', 'var(--vt-c-divider-light-1)');
    root.style.setProperty('--vt-c-divider-inverse-light', 'var(--vt-c-divider-light-2)');

    root.style.setProperty('--vt-c-text-1', 'var(--vt-c-text-dark-1)');
    root.style.setProperty('--vt-c-text-2', 'var(--vt-c-text-dark-2)');
    root.style.setProperty('--vt-c-text-3', 'var(--vt-c-text-dark-3)');
    root.style.setProperty('--vt-c-text-4', 'var(--vt-c-text-dark-4)');
    root.style.setProperty('--vt-c-text-code', 'var(--vt-c-text-dark-code)');
    root.style.setProperty('--vt-c-text-inverse-1', 'var(--vt-c-text-light-1)');
    root.style.setProperty('--vt-c-text-inverse-2', 'var(--vt-c-text-light-2)');
    root.style.setProperty('--vt-c-text-inverse-3', 'var(--vt-c-text-light-3)');
    root.style.setProperty('--vt-c-text-inverse-4', 'var(--vt-c-text-light-4)');

    // root.style.setProperty('--vt-c-bg-card', 'var(--vt-c-card-dark)');

    root.style.setProperty('--n-text-form-color', 'var(--n-text-form-color-dark)');
    root.style.setProperty('--n-text-form-color-disabled', 'var(--n-text-form-color-disabled-dark)');

    document.body.style.backgroundColor = bodyBackgroundColors.dark;
  } else {
    // Light mode variables
    root.style.setProperty('--vt-c-bg', 'var(--vt-c-white)');
    root.style.setProperty('--vt-c-bg-soft', 'var(--vt-c-white-soft)');
    root.style.setProperty('--vt-c-bg-mute', 'var(--vt-c-white-mute)');
    root.style.setProperty('--vt-c-divider', 'var(--vt-c-divider-light-1)');
    root.style.setProperty('--vt-c-divider-light', 'var(--vt-c-divider-light-2)');
    root.style.setProperty('--vt-c-divider-inverse', 'var(--vt-c-divider-dark-1)');
    root.style.setProperty('--vt-c-divider-inverse-light', 'var(--vt-c-divider-dark-2)');

    root.style.setProperty('--vt-c-text-1', 'var(--vt-c-text-light-1)');
    root.style.setProperty('--vt-c-text-2', 'var(--vt-c-text-light-2)');
    root.style.setProperty('--vt-c-text-3', 'var(--vt-c-text-light-3)');
    root.style.setProperty('--vt-c-text-4', 'var(--vt-c-text-light-4)');
    root.style.setProperty('--vt-c-text-code', 'var(--vt-c-text-light-code)');
    root.style.setProperty('--vt-c-text-inverse-1', 'var(--vt-c-text-dark-1)');
    root.style.setProperty('--vt-c-text-inverse-2', 'var(--vt-c-text-dark-2)');
    root.style.setProperty('--vt-c-text-inverse-3', 'var(--vt-c-text-dark-3)');
    root.style.setProperty('--vt-c-text-inverse-4', 'var(--vt-c-text-dark-4)');

    root.style.setProperty('--vt-c-bg-card', 'rgba(0, 0, 0, 0)');

    root.style.setProperty('--n-text-form-color', 'var(--n-text-form-color-light)');
    root.style.setProperty('--n-text-form-color-disabled', 'var(--n-text-form-color-disabled-light)');

    document.body.style.backgroundColor = bodyBackgroundColors.light;
  }
}

</script>

<style>
.titlebar {
  height: 36px;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 999;
  display: flex;
  justify-content: flex-end;
  align-items: center ;
}

.titlebar-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 100%;
  user-select: none;
  -webkit-user-select: none;
}
.titlebar-button:hover {
  background: var(--vt-c-card-light);
}

#titlebar-close:hover {
  background: #ed3c50;
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



html,
body,
#app,
.n-config-provider,
.n-tabs {
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

* {
  user-select: none;
  /* 标准属性 */
  -webkit-user-select: none;
  /* Webkit (Chrome, Safari) */
  -ms-user-select: none;
  /* IE/Edge */
}
</style>