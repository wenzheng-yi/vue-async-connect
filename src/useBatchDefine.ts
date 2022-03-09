
type ImportObj = Record<string | number | symbol, () => Promise<{
  [key: string]: any;
}>>
function useBatchDefine<T extends string | number | symbol>(importObj: ImportObj) {
  let result = {} as ImportObj
  for (let key in importObj) {
    let name = key.split('/').slice(-2).join('/')
    name = name.replace(/\.[^.]*$/, '')
    result[name] = importObj[key]
  }
  return result as Record<T, () => Promise<{
    [key: string]: any;
  }>>
}
export default useBatchDefine
