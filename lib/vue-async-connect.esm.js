import { shallowRef, defineComponent, watch, h, triggerRef, defineAsyncComponent, onMounted } from 'vue';

function createAsyncConnect(options) {
    const { components, maxCalls = 20, onImportError } = options;
    const allConnects = shallowRef([]);
    function asyncCall(name, triggerParam, props) {
        const _props = props || null;
        const freeComponent = allConnects.value.find((e) => e.name === name && e.receiver && !e.receiver.flag.value);
        if (freeComponent) {
            if (_props) {
                freeComponent.option = _props;
                triggerRef(allConnects);
            }
            doTrigger(freeComponent.receiver.trigger, triggerParam);
            return;
        }
        if (!(name in components)) {
            console.warn(`async call failed, have you signed up component "${name}"`);
            return;
        }
        const asyncInstance = defineAsyncComponent({
            loader: components[name],
            onError(option) {
                if (onImportError) {
                    onImportError(option);
                }
                else {
                    console.error(option);
                }
            },
        });
        const component = {
            name,
            params: triggerParam,
            receiver: null,
            option: _props,
            component: asyncInstance,
        };
        allConnects.value.push(component);
        triggerRef(allConnects);
    }
    function defineReceive(options) {
        const { name, flag, trigger } = options;
        const targetIndex = allConnects.value.findIndex((e) => e.name === name && e.receiver === null);
        const target = allConnects.value[targetIndex];
        target.receiver = {
            flag,
            trigger,
        };
        onMounted(() => {
            try {
                doTrigger(trigger, target.params);
                target.params = null;
            }
            catch (error) {
                allConnects.value.splice(targetIndex, 1);
                console.error(`fail to call trigger function: ${error}`);
            }
        });
    }
    const AsyncConnectRender = defineComponent({
        setup() {
            watch(() => {
                return allConnects.value.length;
            }, (cur, pre) => {
                if (cur > maxCalls) {
                    allConnects.value = allConnects.value.filter((e) => !e.receiver || e.receiver.flag.value);
                }
            }, {
                flush: 'post',
            });
            return {
                allConnects,
            };
        },
        render() {
            return this.allConnects.map((comp) => h(comp.component, comp.option));
        },
    });
    const Connect = {
        call: asyncCall,
        receive: defineReceive,
    };
    return {
        connect: Connect,
        AsyncConnectRender,
    };
}
function doTrigger(fn, param) {
    // if param is array, destructuring it
    if (Array.isArray(param)) {
        fn(...param);
    }
    else {
        fn(param);
    }
}

function useBatchDefine(importObj) {
    let result = {};
    for (let key in importObj) {
        let name = key.split('/').slice(-2).join('/');
        name = name.replace(/\.[^.]*$/, '');
        result[name] = importObj[key];
    }
    return result;
}

export { createAsyncConnect, useBatchDefine };
