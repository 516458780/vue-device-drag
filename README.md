# vue-device-drag

## 简介
```
基于Vue2、3，整合了mouse、touch而成的拖拽指令，便于一套代码同时应用于pc端和设备端
```

## 使用方法
```
npm install vue-device-drag
```
vue2：
```
import DeviceDrag from "vue-device-drag";

Vue.use(DeviceDrag)
```


vue3：
```
import { createApp } from 'vue'
import App from './App.vue'
import { vue3 as DeviceDrag } from "vue-device-drag";

createApp(App).use(DeviceDrag).mount("#app");
```

### 作用于拖拽元素的指令
|           指令名           |                        说明                        |           指令的绑定值类型           |
|:-----------------------:|:------------------------------------------------:|:----------------------------:|
|       device-drag       |                启用拖拽功能，需要拖拽的元素必须有                 |              ×               |
|    device-drag-delay    | 延迟拖拽的时间（ms），注意：mouse-delay、touch-delay指令优先级大于该指令 |              Number               |
| device-drag-mouse-delay |             当拖拽的为鼠标事件的时候，延迟拖拽的时间（ms）             |              Number               |
| device-drag-touch-delay |             当拖拽的为触摸事件的时候，延迟拖拽的时间（ms）             |              Number               |
|   device-drag-disable   |                    动态控制是否允许拖动                    |           Boolean            |
|    device-drag-data     |               指定该元素触发拖拽相关指令时，绑定的数据               | String / Number / Boolean / Object |
|    device-drag-start    |               指定元素触发拖拽开始指令时，调用的方法                |           Function           |
|     device-drag-end     |               指定元素触发拖拽结束指令时，调用的方法                |                Function              |

### 作用于目标元素的指令
|         指令名         |           说明            |  指令的绑定值类型   |
|:-------------------:|:-----------------------:|:---:|
|     device-drag     |    启用拖拽功能，需要拖拽的元素必须有    |   ×  |
| device-drag-disable |       动态控制是否允许拖动        |  Boolean   |
|  device-drag-data   |  指定该元素触发拖拽相关指令时，绑定的数据   |  String / Number / Boolean / Object   |
|  device-drag-enter  |   指定拖拽元素进入目标元素时，调用的方法   |  Function   |
|  device-drag-over   |  指定拖拽元素在目标元素上移动时，调用的方法  | Function    |
|  device-drag-leave  |   指定拖拽元素离开目标元素时，调用的方法   |  Function   |
|     device-drop     | 指定拖拽元素在目标元素上结束拖拽时，调用的方法 |  Function   |

### 事件类指令调用绑定的方法时，传入的参数中带有以下参数
|         参数名         |              说明              |  数据类型  |
|:-------------------:|:----------------------------:|:------:|
|      eventName      | 若使用指令时，有传入指令参数，则值为指令参数，否则为空  | String |
|      clientX      |         事件触发时，鼠标的位置          | Number |
|      clientY      |         事件触发时，鼠标的位置          | Number |
|      pointEl      | 事件触发时，鼠标所在的元素（不代表一定是事件触发的元素） | Element |
|      dragEl      |             拖拽元素             | Element |
|      data      | 拖拽元素使用device-drag-data绑定的数据  | String / Number / Boolean / Object |
|      target      |             目标元素             | Element |
|      targetData      |             目标元素使用device-drag-data绑定的数据             | String / Number / Boolean / Object |


## 指令参数
当指令device-drag使用时带有参数，如：
```
v-device-drag:test
```

则只有带有相同参数test的事件指令才会被触发，如：
```
v-device-drag-start:test="doSomething"

v-device-drag-end:test="doSomething"

v-device-drag-enter:test="doSomething"

v-device-drag-over:test="doSomething"

v-device-drag-leave:test="doSomething"

v-device-drop:test="doSomething"
```

事件指令可通过增加修饰符stop来阻止事件的冒泡传递，如：
```
v-device-drag-over:test.stop="doSomething"
```

### 判断是否正在拖拽过程中
```
if (this.$deviceDrag) {
    // 拖拽过程中
}
```


## 使用示例
```
<template>
  <div id="app">
    <div
        v-device-drag-data="{ groupId: 1 }"
        v-device-drag-enter="dragOver"
        v-device-drag-over="dragOver"
        v-device-drag-leave="dragEnd"
        v-device-drop="drop"
        :class="['group', 'group1', { 'is-over': overGroupId === 1 }]">
      <img
          v-device-drag
          v-device-drag-end="dragEnd"
          alt="Vue logo"
          src="./assets/logo.png">
    </div>
    <div
        v-device-drag-data="{ groupId: 2 }"
        v-device-drag-enter="dragOver"
        v-device-drag-over="dragOver"
        v-device-drag-leave="dragEnd"
        v-device-drop="drop"
        :class="['group', 'group2', { 'is-over': overGroupId === 2 }]"
    ></div>
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      overGroupId: null,
      group1: [],
      group2: []
    }
  },
  methods: {
    dragOver(event) {
      this.overGroupId = event.targetData.groupId
    },
    dragEnd() {
      this.overGroupId = null
    },
    drop(event) {
      event.target.append(event.dragEl)
    }
  }
}
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.group {
  width: 300px;
  height: 300px;
  border: 1px solid #cccccc;
  margin: 10px auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  transition: background-color 0.2s linear;
}

.group.is-over {
  background-color: aliceblue;
}
</style>

```