这是一个基于vue3的异步组件通信工具。通过它，你可以对Modal、Drawer类组件赋予强大的javascript渲染能力。

### 功能特点
1. 无需重复的import、挂载，通过定义好的字符串名称即可调用任意组件
2. 定义的组件都是懒加载的
3. 支持向组件内方法传参
4. 支持props传参，同样也支持事件绑定
5. 可设置最大调用数量，超过该值会对闲置组件进行清理


### 怎么使用？

##### 下载

```javascript
npm install vue-async-connect
yarn add vue-async-connect
```

##### 创建一个异步通信

```javascript
//  @/plugin/asyncConnect
import { createAsyncConnect } from 'vue-async-connect'

const { connect, AsyncConnectRender } = createAsyncConnect({
    components: {
        yourName: () => import(/**your component path**/)
    }
})
export { connect, AsyncConnectRender }
```

##### 将渲染器挂载到根目录

```vue
<template>
    <App />
    <AsyncConnectRender />
</template>
```

##### 在组件内部定义异步接收

```vue
<template>
  <n-drawer v-model:show="isShow" :width="400">
    <n-drawer-content
      title="title"
      closable
    >
        this is your async component
    </n-drawer-content>
  </n-drawer>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { connect } from '@/plugin/asyncConnect'
    
const isShow = ref(false)
function open() {
  isShow.value = true
}
connect.receive({
  name: 'yourName',
  flag: isShow,
  trigger: open
})
</script>
```

##### 在任意地方调用

```javascript
import { connect } from '@/plugin/asyncConnect'

connect.call('yourName')
```



### 进阶技巧

#### 组件传参技巧

`connect.call` 有2个可选参数，`triggerParam`、`props`，即`connect.call(componentName, [triggerParam, props])`

##### 1、triggerParam

它会在异步加载成功后传递给组件内的`trigger`方法，如果需要传递多参数，可以包裹一层数组。比如：

```javascript
// 异步请求组件
connect.call('yourName', '能打开吗')

// 异步接收组件
connect.receive({
  ...,
  trigger: open
})
function open(param){
    console.log(param) // '能打开吗' 
}
```

```javascript
// 异步请求组件
connect.call([1, 2, 3, 4])

// 异步接收组件
connect.receive({
  ...,
  trigger: open
})
function open(a, b, c, d){
    console.log(a, b, c, d) // 1, 2, 3, 4  
}
```

##### 2、props

异步组件渲染时使用了vue3的h函数，`props`参数会原封不动地作为组件`props`传递过去，所以，我们可以在这里绑定事件监听。比如：

```javascript
// 异步请求组件
connect.call('yourName', null, {
    onChange(param) {
        console.log(param) // '回去吧'
    }
})

// 异步接收组件内
<script setup>
	const emit = defineEmit(['change'])
    emit('change', '回去吧')
</script>
```

#### 创建异步通信

`createAsyncConnect`有2个可选参数`maxCalls`和`onImportError`。

##### 1、maxCalls

最大呼叫数，默认为20。当异步请求的组件数量多于`maxCalls`时，工具内部会把`flag`为`false`的组件清理掉。

##### 2、onImportError

该方法会在异步请求组件时返回import错误。如果项目打包后同一个文件的名称改变了，那么在部署后，原先的用户会请求不到那个组件，从而产生报错。（希望这个api可以对你有所帮助）

#### 批量注册异步组件

工具提供了一个根据文件路径进行批量定义的方法`useBatchDefine`，它会取文件路径的最后2位作为`key`值。

```javascript
// 以Vite为例，假设存在一个文件 @/asyncModules/public/imgPicker.vue
import { useBatchDefine } from 'vue-async-connect'
const asyncComponents = useBatchDefine(import.meta.glob('../asyncModules/**/*.vue'))

/*  等同于
const asyncComponents = {
  'public/imgPicker': () => import('@/asyncModules/public/imgPicker.vue')
}
*/
```

