
type ImportObj = Record<string, () => Promise<{
  [key: string]: any;
}>>
function useBatchDefine(importObj: ImportObj) {
  let result = {} as ImportObj
  for (let key in importObj) {
    let name = key.split('/').slice(-2).join('/')
    name = name.replace(/\.[^.]*$/, '')
    result[name] = importObj[key]
  }
  return result
}
export default useBatchDefine
