import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: '/BotequimNaMao_with_Bootstrap/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                cardapio: resolve(__dirname, 'cardapio.html'),
                sobre: resolve(__dirname, 'sobre.html'),
                produto: resolve(__dirname, 'produto.html'),
                carrinho: resolve(__dirname, 'carrinho.html'),
                login: resolve(__dirname, 'login.html'),
                gestao: resolve(__dirname, 'gestao.html')
            }
        }
    }
});