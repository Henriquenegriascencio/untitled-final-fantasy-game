# Regras do Projeto (Project Instructions)

1. **Evite acentos (No accented characters)**:
   - Nao utilize acentuacao (á, é, í, ó, ú, â, ê, ô, ã, õ, ç, etc.) nos textos, interfaces, botoes, dialogos e descricoes do jogo.
   - Motivo: A fonte personalizada de Final Fantasy VI utilizada no projeto suporta apenas o alfabeto ASCII / ingles basico. Letras com acentos quebram ou nao renderizam corretamente na fonte pixelada.

2. **Nao modifique ou apague arquivos enviados pelo usuario (Preserve user uploads)**:
   - Nunca modifique, sobrescreva ou delete arquivos de upload enviados pelo usuario (por exemplo: efeitos sonoros, musicas, imagens ou recursos na pasta public ou audio).
   - Sempre utilize e preserve os arquivos originais fornecidos pelo usuario.

3. **Evite caracteres especiais colchetes, porcentagem, parenteses e aspas (No `[`, `]`, `%`, `(`, `)` or `"` in UI texts)**:
   - Nao utilize `[`, `]`, `%`, `(`, `)` e aspas `"` nas interfaces, botoes, dialogos, logs, status e textos visiveis do jogo.
   - Substituicoes recomendadas:
     - Em vez de `[TAB]` ou `[ESC]`, use `TECLA TAB` ou `ESC` ou `TAB`.
     - Em vez de `(1/3)` ou `(CHEFE)`, use `- 1 de 3` ou `- CHEFE`.
     - Em vez de `35%`, use `35 por cento` ou apenas `35 de dano`.
     - Em vez de `(X, Y)`, use `X: ... Y: ...`.
     - Em vez de aspas em dialogos `"Texto"`, use `Texto` direto ou `* Texto *`.