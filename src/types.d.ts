import { Ref, Component,RawProps } from "vue"
export interface CreateConnectOptions<T> {
  components: Record<T, () => Promise<any>>
  maxCalls?: number
}
export interface ConnectInstance {
  name: string
  params: any
  option: RawProps
  receiver: {
    flag: Ref<boolean>
    trigger: Function
  } | null
  component: Component
}
export type ComponentInstance = Pick<ConnectInstance, 'option' | 'component'>
export interface DefineReceiveOptions<T> {
  name: T
  flag: Ref<boolean>
  trigger: Function
}
