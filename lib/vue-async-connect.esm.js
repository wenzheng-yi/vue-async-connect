import { shallowRef, defineAsyncComponent, triggerRef, defineComponent, h, toRef, onMounted } from 'vue';

const asyncComponents = new Map();
function batchDefine(importObj) {
    for (let key in importObj) {
        let name = key.split('/').slice(-2).join('/');
        name = name.replace(/\.[^.]*$/, '');
        asyncComponents.set(name, importObj[key]);
    }
}

const allConnects = {};
const calledComponents = shallowRef([]);
function asyncCall(name, options) {
    if (allConnects[name]) {
        const emptyIndex = allConnects[name].receiver.findIndex((e) => !e.tag.value);
        if (emptyIndex > -1) {
            allConnects[name].receiver[emptyIndex].start(options);
            return;
        }
    }
    else {
        allConnects[name] = {
            params: [],
            receiver: [],
            positions: []
        };
    }
    const target = allConnects[name];
    target.params.push(options);
    target.positions.push(calledComponents.value.length);
    calledComponents.value.push(defineAsyncComponent(asyncComponents.get(name)));
    triggerRef(calledComponents);
}

const AsyncConnectRender = defineComponent({
    setup() {
        return {
            calledComponents
        };
    },
    render() {
        return [...this.calledComponents.map(e => h(e))];
    }
});

function defineReceive({ port, tag, start }) {
    if (Array.isArray(tag)) {
        tag = toRef(tag[0], tag[1]);
    }
    allConnects[port].receiver.push({
        tag,
        start
    });
    onMounted(() => {
        start(allConnects[port].params.shift());
    });
}

export { asyncCall, asyncComponents, batchDefine, AsyncConnectRender as default, defineReceive };
