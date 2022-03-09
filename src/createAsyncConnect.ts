import { ComponentPublicInstance, shallowRef, defineAsyncComponent, triggerRef, onMounted, defineComponent, h, watch, ref, Ref, effect, nextTick } from 'vue'
import { CreateConnectOptions, ConnectInstance, DefineReceiveOptions } from './types'
function createAsyncConnect<T>(options: CreateConnectOptions<T>)  {
  const { components, maxCalls = 20 } = options

  const allConnects: Array<ConnectInstance<T>> = ([])
  const calledComponents = shallowRef(<ComponentPublicInstance[][]>[])

  function asyncCall(name: T, ...options: any) {
    const calledIndex = allConnects.findIndex((e) => e.name === name)
    if (calledIndex > -1) {
      const freeComponent = allConnects[calledIndex].receivers.find((e) => !e.flag.value)
      if (freeComponent) {
        freeComponent.trigger(...options)
      } else {
        allConnects[calledIndex].params.push(options)
        calledComponents.value[calledIndex].push(defineAsyncComponent(components[name]))
        triggerRef(calledComponents)
      }
      return
    }

    const newConnect: ConnectInstance<T> = {
      name,
      params: [options],
      receivers: []
    }
    allConnects.push(newConnect)
    calledComponents.value.push([defineAsyncComponent(components[name])])
    triggerRef(calledComponents)

  }

  function defineReceive(options: DefineReceiveOptions<T>) {
    const { name, flag, trigger } = options
    const connect = allConnects.find(e => e.name === name)
    connect!.receivers.push({
      flag,
      trigger
    })
    onMounted(() => {
      trigger(...connect!.params.shift())
    })
  }

  const AsyncConnectRender = defineComponent({
    setup() {
      watch(() => {
        return calledComponents.value.flat().length
      }, (cur, pre) => {
        if(cur > maxCalls) {
          let freeConnectIndex = allConnects.findIndex((connect) => {
            return connect.receivers.every((comp) => !comp.flag.value)
          })
          if(freeConnectIndex > -1) {
            allConnects.splice(freeConnectIndex, 1)
            calledComponents.value.splice(freeConnectIndex, 1)
            triggerRef(calledComponents)
          }
        }
      }, {
        flush: 'post'
      })
      return {
        calledComponents
      }
    },
    render() {
      return this.calledComponents.flat().map(comp => h(comp))
    }
  })

  const Connect = {
    call: asyncCall,
    receive: defineReceive
  }
  return {
    connect: Connect,
    AsyncConnectRender
  }
}
export default createAsyncConnect
