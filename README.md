# ZumbiNerd

ZumbiNerd e um jogo de plataforma 2D feito com Phaser 3. Voce controla Alan, um zumbi programador preso no caos da NeoCorp, e precisa atravessar fases com esqueletos, espinhos, serras e referencias ao cemiterio de software da empresa.

## Jogue online

GitHub Pages do projeto:

[https://arcostasi.github.io/zumbinerd/](https://arcostasi.github.io/zumbinerd/)

Se o link ainda nao estiver no ar, basta publicar o repositorio e aguardar o primeiro deploy do GitHub Pages concluir.

## Destaques

- Phaser 3 com Arcade Physics
- 5 fases com progressao
- Dificuldades Facil, Normal e Hardcore
- Musica, efeitos sonoros e filtro CRT configuraveis
- Leaderboard local salvo no navegador com LocalStorage
- Interface retro com painel lateral, logs e menu tematico

## Controles

| Tecla | Acao |
| --- | --- |
| `A` / `D` ou `←` / `→` | Mover |
| `W` / `Espaco` / `↑` | Pular |
| `Shift` | Correr |
| `Enter` | Atacar |
| `Esc` / `P` | Pausar |

## Como rodar localmente

O projeto nao precisa de build, mas usa ES Modules. Rode com um servidor local simples:

```bash
python -m http.server 8080
```

ou

```bash
npx serve .
```

Depois abra `http://localhost:8080` no navegador.

## Publicacao no GitHub Pages

Este repositorio inclui o workflow `.github/workflows/deploy-pages.yml` para publicar o jogo automaticamente no GitHub Pages.

1. Envie o projeto para `https://github.com/arcostasi/zumbinerd`.
2. No GitHub, abra `Settings > Pages` e confirme `Source: GitHub Actions`.
3. Faça push na branch `main` ou `master`.
4. Aguarde o workflow `Deploy GitHub Pages` terminar.
5. Acesse `https://arcostasi.github.io/zumbinerd/`.

## Estrutura do projeto

- `index.html`: shell da pagina e integracao da interface
- `style.css`: visual retro e layout
- `src/main.js`: bootstrap do Phaser
- `src/scenes/`: menu, preload, gameplay, pausa e game over
- `src/config/`: configuracao do jogo e fases
- `assets/`: sprites, tiles e trilha sonora

## Tecnologias

- HTML5
- CSS3
- JavaScript ES Modules
- Phaser 3
- Web Audio API e HTML5 Audio

## Creditos

- Desenvolvimento: Arcostasi e Antigravity (Gemini 3.5 Flash)
- Engine: Phaser 3
- Musica: "Nowhere Left To Hide"
- Assets: Zombie Nerd Sprite by Graveyard Tileset