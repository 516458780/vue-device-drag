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
