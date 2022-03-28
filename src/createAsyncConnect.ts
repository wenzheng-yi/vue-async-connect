import { shallowRef, defineAsyncComponent, triggerRef, onMounted, defineComponent, h, watch } from 'vue'
import { CreateConnectOptions, ConnectInstance, DefineReceiveOptions } from './types'
function createAsyncConnect<T extends string>(options: CreateConnectOptions<T>) {
  const { components, maxCalls = 20 } = options

  const allConnects = shallowRef(<ConnectInstance[]>[])
  function asyncCall(name: T, triggerParam?: any, option?: Record<string, any>) {
    const _option = option || null

    const freeComponent = allConnects.value.find(
      (e: ConnectInstance) => e.name === name && e.receiver && !e.receiver.flag.value
    )
    if (freeComponent) {
      if (_option) {
        freeComponent.option = _option
        triggerRef(allConnects)
      }
      if (Array.isArray(triggerParam)) {
        freeComponent.receiver!.trigger(...triggerParam)
      } else {
        freeComponent.receiver!.trigger(triggerParam)
      }
      return
    }

    const component:ConnectInstance = {
      name,
      params: triggerParam,
      receiver: null,
      option: _option,
      component: defineAsyncComponent(components[name])
    }
    allConnects.value.push(component)
    triggerRef(allConnects)
  }

  function defineReceive(options: DefineReceiveOptions<T>) {
    const { name, flag, trigger } = options
    const target = allConnects.value.find(
      (e: ConnectInstance) => e.name === name && e.receiver === null
    ) as ConnectInstance
    target!.receiver = {
      flag,
      trigger
    }
    onMounted(() => {
      trigger(target.params)
      target.params = null
    })
  }

  const AsyncConnectRender = defineComponent({
    setup() {
      watch(() => {
        return allConnects.value.length
      }, (cur, pre) => {
        if (cur > maxCalls) {
          allConnects.value = allConnects.value.filter(
            (e) => !e.receiver || e.receiver.flag.value
          )
        }
      }, {
        flush: 'post'
      })
      return {
        allConnects
      }
    },
    render() {
      return this.allConnects.map((comp) => h(comp.component as any, comp.option, () => {}))
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
