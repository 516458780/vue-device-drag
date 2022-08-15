const setDataTip = `${new Date().getTime()}`

const draggingElClass = `device-dragging`
const disableTip = `disable_device_drag`

const stopDragStartPropagation = `stop_device_drag_start_propagation`
const stopDragEnterPropagation = `stop_device_drag_enter_propagation`
const stopDragOverPropagation = `stop_device_drag_over_propagation`
const stopDragLeavePropagation = `stop_device_drag_leave_propagation`
// const stopDragEndPropagation = `stop_device_drag_end_propagation`
const stopDropPropagation = `stop_device_drop_propagation`

// 开启了拖拽的元素所存储的数据
const dragData = {}

// 事件订阅列表
let dragStartListener = []
let dragEnterListener = []
let dragOverListener = []
let dragLeaveListener = []
let dragEndListener = []
let dropListener = []

// 检查鼠标所在元素触发的事件能否传递到目标元素上
const checkIsOver = (el, pointEl, stopTip) => {
  if (!el || !pointEl) {
    return
  }

  // 触发的元素不在当前元素的下级
  if (pointEl !== el && !el.contains(pointEl)) {
    return false
  }

  // 当前元素为事件触发元素
  if (pointEl === el) {
    return true
  }

  // 触发事件的元素停止了冒泡拖拽事件
  if (stopTip && Reflect.has(pointEl.attributes, stopTip)) {
    return false
  }

  const stopEls = el.querySelectorAll(`[${stopTip}]`)

  // 当前元素与触发事件的元素之间有停止冒泡拖拽事件的元素
  for (let n = 0, length = stopEls.length; n < length; n++) {
    const item = stopEls[n]
    if (el.contains(item) && item.contains(pointEl)) {
      return false
    }
  }

  return true
}

const isNoValue = (value) => {
  return [undefined, null, ''].includes(value)
}

const filteringListener = (listener) => {
  if (document?.body) {
    return listener.filter((item) => {
      return document.body.contains(item.el)
    })
  }
  return listener
}

const proxy = new Proxy(
    {
      eventName: null,
      clientX: null,
      clientY: null,
      pointEl: null,
      dragEl: null,
      data: null
    },
    {
      get(target, key) {
        return target[key]
      },
      set(target, key, value) {
        // 过滤掉已经不需要的监听
        dragStartListener = filteringListener(dragStartListener)
        dragEnterListener = filteringListener(dragEnterListener)
        dragOverListener = filteringListener(dragOverListener)
        dragLeaveListener = filteringListener(dragLeaveListener)
        dragEndListener = filteringListener(dragEndListener)
        dropListener = filteringListener(dropListener)

        if (['clientX', 'clientY'].includes(key)) {
          // 执行
          [dragOverListener].forEach((listener) => {
            listener.forEach((item) => {
              item.handler(target.pointEl)
            })
          })
        }

        if (key === 'pointEl') {
          const oldPointEl = target[key]

              // 执行
          ;[
            dragStartListener,
            dragEnterListener,
            dragLeaveListener,
            dragEndListener,
            dropListener
          ].forEach((listener) => {
            listener.forEach((item) => {
              item.handler(value, oldPointEl)
            })
          })
        }
        target[key] = value
        return true
      }
    }
)

const stateDataProxy = new Proxy(
    {
      isDragging: false
    },
    {
      set(target, propKey, value) {
        value = String(value)
        if (value.indexOf(setDataTip) !== 0) {
          return true
        }
        value = value.replace(setDataTip, '')

        if (['isDragging'].includes(propKey)) {
          if (!['true', 'false'].includes(value)) {
            return true
          }
          Reflect.set(target, propKey, JSON.parse(value))
        } else {
          Reflect.set(target, propKey, value)
        }

        return true
      }
    }
)

// 方法定义 lat,lng
const getDistance = (x1, y1, x2, y2) => {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

export default function(Vue) {
  Vue.prototype.$deviceDrag = Vue.observable(stateDataProxy)

  Vue.directive(`device-drag`, {
    bind(el, binding) {
      const eventName = isNoValue(binding.arg) ? null : binding.arg
      const dragStart = (event) => {
        const disable = el.getAttribute(disableTip) === 'true'
        if (disable) {
          return
        }

        if (!checkIsOver(el, event.target, stopDragStartPropagation)) {
          return
        }

        el.className = `${el.className} ${draggingElClass}`

        const isTouch = event.type.includes('touch')
        const moveEventType = isTouch ? 'touchmove' : 'mousemove'
        const upEventType = isTouch ? 'touchend' : 'mouseup'
        const startEvent = isTouch ? event.touches[0] : event
        const startX = startEvent.clientX
        const startY = startEvent.clientY

        const scale = 1.1
        const body = document.body
        const eleRect = el.getBoundingClientRect()
        const eleCopy = el.cloneNode(true)

        eleCopy.style.transition = 'none'
        eleCopy.style.position = 'fixed'
        eleCopy.style.top = `${eleRect.top}px`
        eleCopy.style.left = `${eleRect.left}px`
        eleCopy.style.width = `${eleRect.width}px`
        eleCopy.style.height = `${eleRect.height}px`
        eleCopy.style.opacity = `0.6`
        eleCopy.style.pointerEvents = `none`
        eleCopy.style.zIndex = '9999'
        eleCopy.style.transformorigin = 'center'

        let delayTime = 0
        if (isTouch) {
          // console.log('touch')
          delayTime = el.deviceDragTouchDelay || el.deviceDragDelay || 0
        } else {
          // console.log('mouse')
          delayTime = el.deviceDragMouseDelay || el.deviceDragDelay || 0
        }

        const startTime = new Date().getTime()
        const delayTimeout = setTimeout(() => {
          eleCopy.style.transform = `translate(0px, 0px) scale(${scale})`
          body.appendChild(eleCopy)

          proxy.eventName = eventName
          proxy.clientX = startX
          proxy.clientY = startY
          proxy.data = dragData[el.dragDataSymbol] || null

          proxy.dragEl = el
          // proxy.pointEl = document.elementFromPoint(startX, startY)
          proxy.target = el
          proxy.targetData = dragData[el.dragDataSymbol] || null

          Vue.prototype.$deviceDrag.isDragging = `${setDataTip}true`
        }, delayTime)
        let cancel = false
        const cancelDrag = () => {
          cancel = true
          clearTimeout(delayTimeout)
        }

        const dragMove = (e) => {
          if (cancel) {
            return
          }

          const moveEvent = isTouch ? e.touches[0] : e

          const pointEl = document.elementFromPoint(
              moveEvent.clientX,
              moveEvent.clientY
          )

          if (new Date().getTime() < startTime + delayTime) {
            // console.log('时间没到')

            const distance = getDistance(
                moveEvent.clientX,
                moveEvent.clientY,
                startX,
                startY
            )

            if (distance > 6) {
              // 移动距离过大
              // console.log('移动距离过大')
              cancelDrag()
              return
            }

            if (!el.contains(pointEl)) {
              // 移出了元素外面
              // console.log('移出了元素外面')
              cancelDrag()
              return
            }
            return
          }

          event.preventDefault()
          e.preventDefault()
          requestAnimationFrame(() => {
            proxy.clientX = moveEvent.clientX
            proxy.clientY = moveEvent.clientY

            const x = proxy.clientX - startX
            const y = proxy.clientY - startY

            eleCopy.style.transform = `translate(${x}px, ${y}px) scale(${scale})`

            if (pointEl !== proxy.pointEl) {
              proxy.pointEl = pointEl
            }
          })
        }

        const dragEnd = () => {
          cancelDrag()
          body.removeEventListener(moveEventType, dragMove)
          body.removeEventListener(upEventType, dragEnd)
          eleCopy.remove()
          Vue.prototype.$deviceDrag.isDragging = `${setDataTip}false`
          el.className = el.className.replace(draggingElClass, '')

          // proxy.eventName = null
          // proxy.target = null
          // proxy.clientX = null
          // proxy.clientY = null
          proxy.pointEl = null
        }

        body.addEventListener(moveEventType, dragMove, { passive: false })
        body.addEventListener(upEventType, dragEnd, { passive: false })
      }

      el.addEventListener('mousedown', dragStart, { passive: false })
      el.addEventListener('touchstart', dragStart, { passive: false })
    }
  })

  Vue.directive(`device-drag-disable`, {
    bind(el, binding) {
      const value = binding.value
      el.setAttribute(disableTip, value)
    },
    update(el, binding) {
      const value = binding.value
      el.setAttribute(disableTip, value)
    }
  })

  Vue.directive(`device-drag-delay`, {
    bind(el, binding) {
      el.deviceDragDelay = binding.value
    },
    update(el, binding) {
      el.deviceDragDelay = binding.value
    }
  })

  Vue.directive(`device-drag-mouse-delay`, {
    bind(el, binding) {
      el.deviceDragMouseDelay = binding.value
    },
    update(el, binding) {
      el.deviceDragMouseDelay = binding.value
    }
  })

  Vue.directive(`device-drag-touch-delay`, {
    bind(el, binding) {
      el.deviceDragTouchDelay = binding.value
    },
    update(el, binding) {
      el.deviceDragTouchDelay = binding.value
    }
  })

  Vue.directive(`device-drag-data`, {
    bind(el, binding) {
      el.dragDataSymbol = Symbol('')
      dragData[el.dragDataSymbol] = binding.value
    },
    update(el, binding) {
      dragData[el.dragDataSymbol] = binding.value
    },
    unbind(el) {
      delete dragData[el.dragDataSymbol]
    }
  })

  Vue.directive(`device-drag-start`, {
    bind(el, binding) {
      const value = binding.value
      const eventName = isNoValue(binding.arg) ? null : binding.arg
      const modifiers = binding.modifiers
      const stopTip = stopDragStartPropagation

      if (modifiers.stop) {
        el.setAttribute(stopTip, '')
      }

      const watch = (pointEl, oldPointEl) => {
        if (proxy.eventName !== eventName) {
          return
        }

        if (proxy.dragEl !== el) {
          return
        }

        if (!oldPointEl && el.contains(pointEl)) {
          const params = {
            ...proxy,
            target: el,
            targetData: dragData[el.dragDataSymbol] || null
          }
          // console.log('start', el)
          value(params)
        }
      }

      if (value && value instanceof Function) {
        dragStartListener.push({
          el,
          handler: watch
        })
      }
    }
  })

  Vue.directive(`device-drag-enter`, {
    bind(el, binding) {
      const value = binding.value
      const eventName = isNoValue(binding.arg) ? null : binding.arg
      const modifiers = binding.modifiers
      const stopTip = stopDragEnterPropagation

      if (modifiers.stop) {
        el.setAttribute(stopTip, '')
      }

      const watch = (pointEl, oldPointEl) => {
        if (proxy.eventName !== eventName) {
          return
        }

        if (!pointEl) {
          return
        }

        const oldIsOver = checkIsOver(el, oldPointEl, stopTip)
        const isOver = checkIsOver(el, pointEl, stopTip)

        if (!oldIsOver && isOver) {
          const params = {
            ...proxy,
            target: el,
            targetData: dragData[el.dragDataSymbol] || null
          }
          // console.log('enter', el)
          value(params)
        }
      }

      if (value && value instanceof Function) {
        dragEnterListener.push({
          el,
          handler: watch
        })
      }
    }
  })

  Vue.directive(`device-drag-over`, {
    bind(el, binding) {
      const value = binding.value
      const eventName = isNoValue(binding.arg) ? null : binding.arg
      const modifiers = binding.modifiers
      const stopTip = stopDragOverPropagation

      if (modifiers.stop) {
        el.setAttribute(stopDragOverPropagation, '')
      }

      const watch = (pointEl) => {
        if (proxy.eventName !== eventName) {
          return
        }
        if (checkIsOver(el, pointEl, stopTip)) {
          // console.log('触发dragover事件', el)
          const params = {
            ...proxy,
            target: el,
            targetData: dragData[el.dragDataSymbol] || null
          }
          value(params)
        }
      }

      if (value && value instanceof Function) {
        dragOverListener.push({
          el,
          handler: watch
        })
      }
    }
  })

  Vue.directive(`device-drag-leave`, {
    bind(el, binding) {
      const value = binding.value
      const eventName = isNoValue(binding.arg) ? null : binding.arg
      const modifiers = binding.modifiers
      const stopTip = stopDragLeavePropagation

      if (modifiers.stop) {
        el.setAttribute(stopTip, '')
      }

      const watch = (pointEl, oldPointEl) => {
        if (proxy.eventName !== eventName) {
          return
        }

        if (!pointEl) {
          return
        }

        const oldIsOver = checkIsOver(el, oldPointEl, stopTip)
        const isOver = checkIsOver(el, pointEl, stopTip)

        if (oldIsOver && !isOver) {
          const params = {
            ...proxy,
            target: el,
            targetData: dragData[el.dragDataSymbol] || null
          }
          // console.log('leave', el)
          value(params)
        }
      }

      if (value && value instanceof Function) {
        dragLeaveListener.push({
          el,
          handler: watch
        })
      }
    }
  })

  Vue.directive(`device-drag-end`, {
    bind(el, binding) {
      const value = binding.value
      const eventName = isNoValue(binding.arg) ? null : binding.arg
      // const modifiers = binding.modifiers
      // const stopTip = stopDragEndPropagation
      //
      // if (modifiers.stop) {
      //   el.setAttribute(stopTip, '')
      // }

      const watch = (pointEl) => {
        if (proxy.eventName !== eventName) {
          return
        }

        if (pointEl) {
          return
        }

        if (proxy.dragEl === el) {
          const params = {
            ...proxy,
            target: el,
            targetData: dragData[el.dragDataSymbol] || null
          }
          value(params)
        }
      }

      if (value && value instanceof Function) {
        dragEndListener.push({
          el,
          handler: watch
        })
      }
    }
  })

  Vue.directive(`device-drop`, {
    bind(el, binding) {
      const value = binding.value
      const eventName = isNoValue(binding.arg) ? null : binding.arg
      const modifiers = binding.modifiers
      const stopTip = stopDropPropagation

      if (modifiers.stop) {
        el.setAttribute(stopTip, '')
      }

      const watch = (pointEl, oldPointEl) => {
        if (proxy.eventName !== eventName) {
          return
        }

        if (pointEl) {
          return
        }

        const isOver = checkIsOver(el, pointEl, stopTip)
        const oldIsOver = checkIsOver(el, oldPointEl, stopTip)

        if (!isOver && oldIsOver) {
          // 在这里进行拖拽释放
          // console.log('在这里进行拖拽释放', el)
          const params = {
            ...proxy,
            target: el,
            targetData: dragData[el.dragDataSymbol] || null
          }
          value(params)
        }
      }

      if (value && value instanceof Function) {
        dropListener.push({
          el,
          handler: watch
        })
      }
    }
  })
}
