# vue-device-drag

## 简介
```
基于Vue2，整合了mouse、touch而成的拖拽指令，便于一套代码同时应用于pc端和设备端
```

### 开启拖拽
```
v-device-drag
```

### 作用于拖拽元素的指令
|         指令名         |         说明         |
|:-------------------:|:--------------------:|
|     device-drag     |  启用拖拽功能，需要拖拽的元素必须有   |
| device-drag-disable |      动态控制是否允许拖动      |
|  device-drag-data   | 指定该元素触发拖拽相关指令时，绑定的数据 |
|  device-drag-start  | 指定元素触发拖拽开始指令时，调用的方法  |
|   device-drag-end   | 指定元素触发拖拽结束指令时，调用的方法  |

### 作用于目标元素的指令
|         指令名         |           说明            |
|:---------------------:|:-----------------------:|
|     device-drag     |    启用拖拽功能，需要拖拽的元素必须有    |
| device-drag-disable |       动态控制是否允许拖动        |
| device-drag-data |  指定该元素触发拖拽相关指令时，绑定的数据   |
| device-drag-enter |   指定拖拽元素进入目标元素时，调用的方法   |
| device-drag-over |  指定拖拽元素在目标元素上移动时，调用的方法  |
| device-drag-leave |   指定拖拽元素离开目标元素时，调用的方法   |
| device-drag-drop | 指定拖拽元素在目标元素上结束拖拽时，调用的方法 |