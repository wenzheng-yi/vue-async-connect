
const asyncComponents = new Map()
type ImportObj = Record<string, () => Promise<{
  [key: string]: any;
}>>
function batchDefine(importObj: ImportObj) {
  for (let key in importObj) {
    let name = key.split('/').slice(-2).join('/')
    name = name.replace(/\.[^.]*$/, '')
    asyncComponents.set(name, importObj[key])
  }
}
export {
  asyncComponents,
  batchDefine
}
