import {
  shallowRef,
  defineAsyncComponent,
  triggerRef,
  onMounted,
  defineComponent,
  h,
  watch,
} from 'vue'
import {
  CreateConnectOptions,
  ConnectInstance,
  DefineReceiveOptions,
} from './types'
function createAsyncConnect<T extends string>(
  options: CreateConnectOptions<T>
) {
  const { components, maxCalls = 20, onImportError } = options

  const allConnects = shallowRef(<ConnectInstance[]>[])
  function asyncCall(name: T, triggerParam?: any, props?: Record<string, any>) {
    const _props = props || null

    const freeComponent = allConnects.value.find(
      (e: ConnectInstance) =>
        e.name === name && e.receiver && !e.receiver.flag.value
    )
    if (freeComponent) {
      if (_props) {
        freeComponent.option = _props
        triggerRef(allConnects)
      }
      doTrigger(freeComponent.receiver!.trigger, triggerParam)
      return
    }

    if (!(name in components)) {
      console.warn(`async call failed, have you signed up component "${name}"`)
      return
    }
    const asyncInstance = defineAsyncComponent({
      loader: components[name],
      onError(option: Error) {
        if (onImportError) {
          onImportError(option)
        } else {
          console.error(option)
        }
      },
    })
    const component: ConnectInstance = {
      name,
      params: triggerParam,
      receiver: null,
      option: _props,
      component: asyncInstance,
    }
    allConnects.value.push(component)
    triggerRef(allConnects)
  }

  function defineReceive(options: DefineReceiveOptions<T>) {
    const { name, flag, trigger } = options
    const targetIndex = allConnects.value.findIndex(
      (e: ConnectInstance) => e.name === name && e.receiver === null
    )
    const target = allConnects.value[targetIndex]
    target!.receiver = {
      flag,
      trigger,
    }
    onMounted(() => {
      try {
        doTrigger(trigger, target.params)
        target.params = null
      } catch (error) {
        allConnects.value.splice(targetIndex, 1)
        console.error(`fail to call trigger function: ${error}`)
      }
    })
  }

  const AsyncConnectRender = defineComponent({
    setup() {
      watch(
        () => {
          return allConnects.value.length
        },
        (cur, pre) => {
          console.log(cur)
          if (cur > maxCalls) {
            allConnects.value = allConnects.value.filter(
              (e) => !e.receiver || e.receiver.flag.value
            )
          }
        },
        {
          flush: 'post',
        }
      )
      return {
        allConnects,
      }
    },
    render() {
      return this.allConnects.map((comp) =>
        h(comp.component as any, comp.option)
      )
    },
  })

  const Connect = {
    call: asyncCall,
    receive: defineReceive,
  }
  return {
    connect: Connect,
    AsyncConnectRender,
  }
}
export default createAsyncConnect

function doTrigger(fn: Function, param: any) {
  // if param is array, destructuring it
  if (Array.isArray(param)) {
    fn(...param)
  } else {
    fn(param)
  }
}
