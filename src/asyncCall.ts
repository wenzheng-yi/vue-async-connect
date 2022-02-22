import { ComponentPublicInstance, defineAsyncComponent, shallowRef, triggerRef } from "vue"
import { asyncComponents } from './defineAsyncComponents'


const allConnects: Record<string, any> = {}
const calledComponents = shallowRef(<ComponentPublicInstance[]>[])
function asyncCall(name: string, options?: any) {
  if (allConnects[name]) {
    const emptyIndex = allConnects[name].receiver.findIndex((e: any) => !e.tag.value)
    if (emptyIndex > -1) {
      allConnects[name].receiver[emptyIndex].start(options)
      return
    }
  } else {
    allConnects[name] = {
      params: [],
      receiver: [],
      positions: []
    }
  }
  const target = allConnects[name]
  target.params.push(options)
  target.positions.push(calledComponents.value.length)
  calledComponents.value.push(defineAsyncComponent(asyncComponents.get(name)))
  triggerRef(calledComponents)
}
export { asyncCall, calledComponents, allConnects }
