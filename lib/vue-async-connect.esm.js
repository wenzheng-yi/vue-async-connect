import { shallowRef, defineComponent, watch, h, triggerRef, defineAsyncComponent, onMounted } from 'vue';

function createAsyncConnect(options) {
    const { components, maxCalls = 20 } = options;
    const allConnects = shallowRef([]);
    function asyncCall(name, triggerParam, option) {
        const _option = option || null;
        const freeComponent = allConnects.value.find((e) => e.name === name && e.receiver && !e.receiver.flag.value);
        if (freeComponent) {
            if (_option) {
                freeComponent.option = _option;
                triggerRef(allConnects);
            }
            if (Array.isArray(triggerParam)) {
                freeComponent.receiver.trigger(...triggerParam);
            }
            else {
                freeComponent.receiver.trigger(triggerParam);
            }
            return;
        }
        const component = {
            name,
            params: triggerParam,
            receiver: null,
            option: _option,
            component: defineAsyncComponent(components[name])
        };
        allConnects.value.push(component);
        triggerRef(allConnects);
    }
    function defineReceive(options) {
        const { name, flag, trigger } = options;
        const target = allConnects.value.find((e) => e.name === name && e.receiver === null);
        target.receiver = {
            flag,
            trigger
        };
        onMounted(() => {
            trigger(target.params);
            target.params = null;
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
                flush: 'post'
            });
            return {
                allConnects
            };
        },
        render() {
            return this.allConnects.map((comp) => h(comp.component, comp.option));
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
