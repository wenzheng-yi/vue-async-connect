import pkg from "./package.json";
import typescript from '@rollup/plugin-typescript';

export default {
    input: './index.ts',
    output: [
        {
            format: 'cjs',
            file: pkg.main,
        },
        {
            format: 'es',
            file: pkg.module
        }
    ],
    plugins: [
        typescript({
            tsconfig: './tsconfig.json'
        })
    ],
    external: ['vue']
};
