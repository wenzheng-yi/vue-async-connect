import { isRef, onMounted, toRef } from "vue";
import { allConnects } from "./asyncCall"
function defineReceive({ port, tag, start }: { port: string, tag: any, start: any }) {
  if (Array.isArray(tag)) {
    tag = toRef(tag[0], tag[1])
  }
  allConnects[port].receiver.push({
    tag,
    start
  })
  onMounted(() => {
    start(allConnects[port].params.shift())
  })
}
export default defineReceive
