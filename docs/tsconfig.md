```json
{
  "compilerOptions": {
    // * “rootDir” define de onde vêm seus arquivos fonte TS/JS
    // ! Tudo que estiver fora dessa pasta geralmente será ignorado pelo compilador como fonte
    "rootDir": "src",

    // * “outDir” é onde o TS vai colocar os arquivos compilados (JS, mapas, defs, etc)
    // ! Isso evita misturar código fonte com código compilado
    "outDir": "dist",

    // * “module” define o sistema de módulos que o JS resultante vai usar
    // ! “nodenext” é uma opção para interoperar com modules ES em Node.js (versões mais modernas)
    "module": "nodenext",

    // * “target” determina a versão do JavaScript para a qual seu TS será transpilado
    // ! “esnext” significa “as funcionalidades mais novas que seu ambiente suporta”
    "target": "esnext",

    // * “types” especifica módulos cujos tipos devem ser incluídos globalmente
    // ! Por exemplo para reconhecer tipos de “node”, “jest”, etc.
    "types": ["node"],

    // * “lib” diz ao compilador quais bibliotecas (APIs de runtime) você assume que existem
    // ! Mesmo se você transpilar para um JS antigo, isso permite usar tipos de métodos modernos (com polyfills se necessário)
    "lib": ["esnext"],

    // * “esModuleInterop” ativa um modo de compatibilidade entre importações ES e CommonJS
    // ! Isso ajuda a escrever `import x from 'mod'` mesmo que “mod” use `module.exports = …`
    "esModuleInterop": true,

    // * “sourceMap” gera arquivos `.map` para debugar melhor
    // ! Permite que você veja no devtools o código TS original enquanto roda o JS compilado
    "sourceMap": true,

    // * “declaration” gera arquivos de declaração `.d.ts` para seus módulos
    // ! Importante se você vai publicar uma biblioteca ou quer que consumidores TS entendam seus tipos
    "declaration": true,

    // * “declarationMap” gera também mapas para as declarações (`.d.ts.map`)
    // ! Permite que IDEs mapeiem declarações de volta ao código TS original
    "declarationMap": true,

    // * “noUncheckedIndexedAccess” é um modo estrito de índice
    // ! Ao acessar algo por `arr[i]`, o TS vai tratar como possivelmente `undefined` ou erro, tornando seu código mais seguro
    "noUncheckedIndexedAccess": true,

    // * “exactOptionalPropertyTypes” muda o comportamento padrão de propriedades opcionais
    // ! Com isso, `prop?: T` é tratado como `prop: T | undefined`, e o TS não assume menos do que isso
    "exactOptionalPropertyTypes": true,

    // * “strict” é um atalho que ativa várias verificações estritas de tipo
    // ! Quando `strict: true`, opções como `strictNullChecks`, `noImplicitAny`, etc. são implicadas
    "strict": true,

    // * “jsx” configura o modo JSX (relevante se você usar React ou similar)
    // ! “react-jsx” indica que o TS gera o código JSX usando o novo transform do React (React 17+)
    "jsx": "react-jsx",

    // * “verbatimModuleSyntax” força que TS não reescreva importações/escrituras de módulos
    // ! Útil para manter o formato dos módulos conforme você escreveu, sem “ajustes automáticos”
    "verbatimModuleSyntax": true,

    // * “isolatedModules” força que cada arquivo seja “compilável isoladamente”
    // ! Importante se você usar ferramentas como Babel ou transpilações rápidas que compilam arquivo a arquivo
    "isolatedModules": true,

    // * “noUncheckedSideEffectImports” bloqueia importações que têm efeitos colaterais desconhecidos
    // ! Isso ajuda a detectar se você está importando algo só por efeito colateral (ex: importa um arquivo que roda lógica na importação)
    "noUncheckedSideEffectImports": true,

    // * “moduleDetection” decide como o TS descobre se um arquivo é módulo ou script
    // ! “force” força que TS trate tudo como módulo (import/export) em vez de scripts globais
    "moduleDetection": "force",

    // * “skipLibCheck” pula verificação de tipos dentro de arquivos de declaração de bibliotecas
    // ! Isso acelera a compilação porque não faz checagem profunda nos `.d.ts` de dependências
    "skipLibCheck": true,

    // * “forceConsistentCasingInFileNames” exige consistência de maiúsculas/minúsculas em nomes de arquivos importados
    // ! Evita problemas em sistemas de arquivos case-insensitive vs case-sensitive
    "forceConsistentCasingInFileNames": true
  }
}
```
