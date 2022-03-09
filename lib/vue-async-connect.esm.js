import { shallowRef, defineComponent, watch, triggerRef, h, defineAsyncComponent, onMounted } from 'vue';

function createAsyncConnect(options) {
    const { components, maxCalls = 20 } = options;
    const allConnects = ([]);
    const calledComponents = shallowRef([]);
    function asyncCall(name, ...options) {
        const calledIndex = allConnects.findIndex((e) => e.name === name);
        if (calledIndex > -1) {
            const freeComponent = allConnects[calledIndex].receivers.find((e) => !e.flag.value);
            if (freeComponent) {
                freeComponent.trigger(...options);
            }
            else {
                allConnects[calledIndex].params.push(options);
                calledComponents.value[calledIndex].push(defineAsyncComponent(components[name]));
                triggerRef(calledComponents);
            }
            return;
        }
        const newConnect = {
            name,
            params: [options],
            receivers: []
        };
        allConnects.push(newConnect);
        calledComponents.value.push([defineAsyncComponent(components[name])]);
        triggerRef(calledComponents);
    }
    function defineReceive(options) {
        const { name, flag, trigger } = options;
        const connect = allConnects.find(e => e.name === name);
        connect.receivers.push({
            flag,
            trigger
        });
        onMounted(() => {
            trigger(...connect.params.shift());
        });
    }
    const AsyncConnectRender = defineComponent({
        setup() {
            watch(() => {
                return calledComponents.value.flat().length;
            }, (cur, pre) => {
                if (cur > maxCalls) {
                    let freeConnectIndex = allConnects.findIndex((connect) => {
                        return connect.receivers.every((comp) => !comp.flag.value);
                    });
                    if (freeConnectIndex > -1) {
                        allConnects.splice(freeConnectIndex, 1);
                        calledComponents.value.splice(freeConnectIndex, 1);
                        triggerRef(calledComponents);
                    }
                }
            }, {
                flush: 'post'
            });
            return {
                calledComponents
            };
        },
        render() {
            return this.calledComponents.flat().map(comp => h(comp));
        }
    });
    const Connect = {
        call: asyncCall,
        receive: defineReceive
    };
    return {
        connect: Connect,
        AsyncConnectRender
    };
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
