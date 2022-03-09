import { Ref } from "vue"
export interface CreateConnectOptions<T> {
  components: Record<T, () => Promise<any>>
  maxCalls?: number
}
export interface ConnectInstance<T> {
  name: T
  params: any[]
  receivers: Array<{
    flag: Ref<boolean>
    trigger: Function
  }>
}
export interface DefineReceiveOptions<T> {
  name: T
  flag: Ref<boolean>
  trigger: Function
}
