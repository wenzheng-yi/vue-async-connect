import { Ref, Component } from "vue"
export interface CreateConnectOptions<T extends string | number | symbol> {
  components: Record<T, () => Promise<any>>
  maxCalls?: number
  onImportError?: (ev: Error) => void
}
export interface ConnectInstance {
  name: string
  params: any
  option: Record<string, any> | null
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
