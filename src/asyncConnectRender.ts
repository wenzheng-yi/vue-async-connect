
import { defineComponent, h } from 'vue'
import { calledComponents } from './asyncCall'

const AsyncConnectRender = defineComponent({
  setup() {
    return {
      calledComponents
    }
  },
  render() {
    return [...this.calledComponents.map(e => h(e))]
  }
})

export { AsyncConnectRender, calledComponents }
