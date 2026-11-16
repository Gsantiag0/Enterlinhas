/* =========================================
   ENTRELINHAS — JAVASCRIPo
   ========================================= */

document.documentElement.classList.add("js");

const reduzirMovimento = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const aleatorio = (min, max) => min + Math.random() * (max - min);


// MENU MOBILE

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#menu");

function fecharMenu() {
  if (!menu || !menuToggle) return;

  menu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  menuToggle.textContent = "☰";
}

if (menuToggle && menu) {

  menuToggle.addEventListener("click", () => {
    const estaAberto = menu.classList.toggle("is-open");

    menuToggle.setAttribute("aria-expanded", String(estaAberto));
    menuToggle.setAttribute(
      "aria-label",
      estaAberto ? "Fechar menu" : "Abrir menu"
    );
    menuToggle.textContent = estaAberto ? "✕" : "☰";
  });

  // Fecha o menu quando um link é clicado
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", fecharMenu);
  });

  // Fecha com a tecla Esc
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") fecharMenu();
  });

}


// LINK ATIVO NO MENU (de acordo com a seção visível)

const linksMenu = document.querySelectorAll(".menu a");
const secoes = ["inicio", "sobre"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

if ("IntersectionObserver" in window && secoes.length) {

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;

        linksMenu.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entrada.target.id}`
          );
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  secoes.forEach((secao) => observador.observe(secao));

}


// APARECER AO ROLAR

const itensReveal = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

  const revelador = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;

        entrada.target.classList.add("is-visible");
        obs.unobserve(entrada.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
  );

  itensReveal.forEach((item) => revelador.observe(item));

} else {

  itensReveal.forEach((item) => item.classList.add("is-visible"));

}


// "SOBRE" CENTRALIZADO ENTRE OS DOIS PAPÉIS RASGADOS
// Ao clicar em Sobre, o texto fica no meio da tela, com o papel rasgado
// de cima e o de baixo aparecendo nas bordas.

const secaoSobre = document.querySelector("#sobre");
const papelTopo = document.querySelector(".t-papel");
const papelBase = document.querySelector(".dedication-borda");

function posicaoSobre() {
  if (!secaoSobre) return null;

  const rolagem = window.scrollY;

  // limite de cima: borda inferior visível do papel rasgado
  let topo = secaoSobre.getBoundingClientRect().top + rolagem;
  if (papelTopo) {
    const r = papelTopo.getBoundingClientRect();
    topo = r.top + rolagem + r.height * 0.72;
  }

  // limite de baixo: borda superior visível do papel da dedicatória
  let base = secaoSobre.getBoundingClientRect().bottom + rolagem;
  if (papelBase) {
    const r = papelBase.getBoundingClientRect();
    base = r.top + rolagem + r.height * 0.35;
  }

  // Telas baixas: a área entre os papéis não cabe inteira,
  // então mostramos o início dela (com o papel de cima visível)
  if (base - topo > window.innerHeight * 0.92) {
    return Math.max(0, topo - 60);
  }

  const meio = (topo + base) / 2;
  const alvo = meio - window.innerHeight / 2;

  return Math.max(0, alvo);
}

function irParaSobre(suave = true) {
  const alvo = posicaoSobre();
  if (alvo === null) return;

  window.scrollTo({
    top: alvo,
    behavior: suave && !reduzirMovimento ? "smooth" : "auto"
  });
}

document
  .querySelectorAll('a[href="#sobre"]')
  .forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      irParaSobre(true);
      history.replaceState(null, "", "#sobre");
    });
  });

// Se a página for aberta já com #sobre no endereço
window.addEventListener("load", () => {
  if (location.hash === "#sobre") irParaSobre(false);
});


// MENU FIXO + PAPÉIS COM LEVE MOVIMENTO AO ROLAR

const topbar = document.querySelector(".topbar");
let rolando = false;

function atualizarRolagem() {
  rolando = false;

  if (topbar) {
    topbar.classList.toggle("scrolled", window.scrollY > 60);
  }

  if (reduzirMovimento) return;

  const altura = window.innerHeight;

  // o papel rasgado desliza devagar de um lado para o outro
  if (papelTopo) {
    const r = papelTopo.getBoundingClientRect();
    const t = Math.max(-1, Math.min(1, (r.top + r.height / 2 - altura / 2) / altura));
    papelTopo.style.setProperty("--tx", `${(t * 3).toFixed(2)}vw`);
  }

  if (papelBase) {
    const r = papelBase.getBoundingClientRect();
    const t = Math.max(-1, Math.min(1, (r.top - altura / 2) / altura));
    papelBase.style.setProperty("--tx", `${(t * -1.2).toFixed(2)}vw`);
  }
}

window.addEventListener(
  "scroll",
  () => {
    if (rolando) return;
    rolando = true;
    requestAnimationFrame(atualizarRolagem);
  },
  { passive: true }
);

atualizarRolagem();


// PÉTALAS CAINDO (PÁGINA INICIAL) E NOTAS MUSICAIS (SOBRE)

const caixaPetalas = document.querySelector(".petalas");
const caixaNotas = document.querySelector(".notas");

if (!reduzirMovimento) {

  const pequena = window.matchMedia("(max-width: 650px)").matches;

  if (caixaPetalas) {
    const total = pequena ? 9 : 16;

    for (let i = 0; i < total; i++) {
      const petala = document.createElement("span");
      petala.className = "petala" + (Math.random() < 0.3 ? " clara" : "");

      petala.style.left = `${aleatorio(0, 100)}%`;
      petala.style.setProperty("--s", `${aleatorio(11, 22).toFixed(0)}px`);
      petala.style.setProperty("--t", `${aleatorio(16, 28).toFixed(1)}s`);
      petala.style.setProperty("--d", `-${aleatorio(0, 26).toFixed(1)}s`);
      petala.style.setProperty("--dx", `${aleatorio(30, 90).toFixed(0)}px`);
      petala.style.setProperty("--o", aleatorio(0.4, 0.75).toFixed(2));

      caixaPetalas.appendChild(petala);
    }
  }

  if (caixaNotas) {
    const simbolos = ["♪", "♫", "♩", "♬"];
    const total = pequena ? 5 : 9;

    for (let i = 0; i < total; i++) {
      const nota = document.createElement("span");
      nota.className = "nota";
      nota.textContent = simbolos[i % simbolos.length];

      // as notas ficam nas laterais, longe do texto
      nota.style.left = `${i % 2 === 0 ? aleatorio(2, 24) : aleatorio(76, 96)}%`;
      nota.style.setProperty("--s", `${aleatorio(22, 50).toFixed(0)}px`);
      nota.style.setProperty("--t", `${aleatorio(20, 34).toFixed(1)}s`);
      nota.style.setProperty("--d", `-${aleatorio(0, 30).toFixed(1)}s`);
      nota.style.setProperty("--dx", `${aleatorio(25, 80).toFixed(0)}px`);

      caixaNotas.appendChild(nota);
    }
  }

}


// MOVIMENTO DA FLOR E LUZ ACOMPANHANDO O MOUSE (computador)

const hero = document.querySelector(".hero");
const flor = document.querySelector(".hero-flower");
const luz = document.querySelector(".luz");
const temMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (hero && temMouse && !reduzirMovimento) {

  hero.addEventListener("mousemove", (event) => {
    const r = hero.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width;
    const y = (event.clientY - r.top) / r.height;

    if (flor) {
      flor.style.setProperty("--px", `${((x - 0.5) * -26).toFixed(1)}px`);
      flor.style.setProperty("--py", `${((y - 0.5) * -16).toFixed(1)}px`);
    }

    if (luz) {
      luz.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      luz.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    }
  });

  hero.addEventListener("mouseleave", () => {
    if (flor) {
      flor.style.setProperty("--px", "0px");
      flor.style.setProperty("--py", "0px");
    }
  });

}


// ONDA NOS BOTÕES AO CLICAR

document.querySelectorAll(".cta").forEach((botao) => {

  botao.addEventListener("pointerdown", (event) => {
    if (reduzirMovimento) return;

    const r = botao.getBoundingClientRect();
    const onda = document.createElement("span");

    onda.className = "onda";
    onda.style.left = `${event.clientX - r.left}px`;
    onda.style.top = `${event.clientY - r.top}px`;

    botao.appendChild(onda);
    onda.addEventListener("animationend", () => onda.remove());
  });

});


// PÉTALAS QUE SAEM AO ENVIAR A DEDICATÓRIA

function explosaoDePetalas(x, y) {
  if (reduzirMovimento || !("animate" in Element.prototype)) return;

  for (let i = 0; i < 18; i++) {
    const petala = document.createElement("span");
    petala.className = "petala-voo" + (Math.random() < 0.3 ? " clara" : "");
    petala.style.setProperty("--s", `${aleatorio(10, 20).toFixed(0)}px`);
    petala.style.left = `${x}px`;
    petala.style.top = `${y}px`;

    document.body.appendChild(petala);

    const angulo = aleatorio(-Math.PI * 0.95, -Math.PI * 0.05);
    const forca = aleatorio(90, 260);
    const dx = Math.cos(angulo) * forca;
    const dy = Math.sin(angulo) * forca;

    const animacao = petala.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy}px) rotate(${aleatorio(90, 240)}deg)`,
          opacity: 1,
          offset: 0.45
        },
        {
          transform: `translate(${dx * 1.25}px, ${dy + aleatorio(220, 380)}px) rotate(${aleatorio(300, 540)}deg)`,
          opacity: 0
        }
      ],
      {
        duration: aleatorio(1400, 2200),
        easing: "cubic-bezier(0.2, 0.6, 0.4, 1)"
      }
    );

    animacao.onfinish = () => petala.remove();
  }
}


// =========================================
// GALERIA — 20 CITAÇÕES CURTAS + 10 FRASES AUTORAIS
// As frases de músicas são trechos reais (até 10 palavras por faixa).
// Uso pessoal/local. Reavaliar direitos antes de publicar na internet.
// Edite a lista abaixo para trocar ou adicionar frases.
// =========================================

const colecaoVersos = [
  { texto: "Eu protegi o teu nome por amor", musica: "Codinome Beija-Flor", artista: "Cazuza" },
  { texto: "Um beijo molhado de luz", musica: "Chuva de Prata", artista: "Gal Costa" },
  { texto: "O vento faz eu lembrar você", musica: "A Lua e Eu", artista: "Cassiano" },
  { texto: "Você deságua em mim, e eu, oceano", musica: "Oceano", artista: "Djavan" },
  { texto: "Sabe que eu te encontrei", musica: "Último Romance", artista: "Los Hermanos" },
  { texto: "Ainda bem que agora encontrei você", musica: "Ainda Bem", artista: "Marisa Monte" },
  { texto: "Eu quero você como eu quero", musica: "Como Eu Quero", artista: "Kid Abelha" },
  { texto: "Fazer sinais de fogo pra você me ver", musica: "Sinais de Fogo", artista: "Preta Gil" },
  { texto: "O amor da gente é como um grão", musica: "Drão", artista: "Gilberto Gil" },
  { texto: "Pode me abraçar sem medo", musica: "Final Feliz", artista: "Jorge Vercillo" },
  { texto: "E o que eu sinto não mudará", musica: "Boa Sorte / Good Luck", artista: "Vanessa da Mata" },
  { texto: "Vamos viver tudo que há pra viver", musica: "Tempos Modernos", artista: "Lulu Santos" },
  { texto: "Só pra deitar e rolar com você", musica: "Mania de Você", artista: "Rita Lee" },
  { texto: "O meu melhor amigo é o meu amor", musica: "Velha Infância", artista: "Tribalistas" },
  { texto: "E o meu lugar é esse, ao lado seu", musica: "Dois Rios", artista: "Skank" },
  { texto: "Qualquer dia, amigo, eu volto a te encontrar", musica: "Canção da América", artista: "Milton Nascimento" },
  { texto: "Você me vira a cabeça, me tira do sério", musica: "Você Me Vira a Cabeça", artista: "Alcione" },
  { texto: "Onda do mar do amor que bateu em mim", musica: "Você É Linda", artista: "Caetano Veloso" },
  { texto: "Eu quero partilhar a vida boa com você", musica: "Partilhar", artista: "Rubel" },
  { texto: "Eu não vou mais me fechar pra sempre", musica: "Recomeçar", artista: "Tim Bernardes" },

  { texto: "há pessoas que chegam e fazem a vida mudar de tom.", autoral: true },
  { texto: "te encontrar foi como reconhecer uma canção antiga.", autoral: true },
  { texto: "nem toda saudade pede distância; algumas pedem abraço.", autoral: true },
  { texto: "o amor também acontece nos domingos sem pressa.", autoral: true },
  { texto: "tem lembrança que a gente escuta de olhos fechados.", autoral: true },
  { texto: "em algum lugar da memória, ainda estamos dançando.", autoral: true },
  { texto: "você chegou como quem acende a luz de uma casa.", autoral: true },
  { texto: "alguns encontros ficam, mesmo quando a música termina.", autoral: true },
  { texto: "meu coração aprendeu teu nome antes de entender o amor.", autoral: true },
  { texto: "há histórias que merecem tocar mais uma vez.", autoral: true }
];

const versoBotao = document.querySelector("#outro-verso");
const versoFigura = document.querySelector("#versos-figura");
const versoTexto = document.querySelector("#versos-frase");
const versoCredito = document.querySelector("#versos-credito");
const versoParticulas = document.querySelector(".versos-fagulhas");

// Baralhamento de Fisher-Yates: sorteia todos sem repetir antes de reiniciar.
let indicesRestantes = [];
let ultimoIndice = -1;
let emTransicao = false;

function criarNovaRodada() {
  indicesRestantes = Array.from({ length: colecaoVersos.length }, (_, i) => i);
  for (let i = indicesRestantes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indicesRestantes[i], indicesRestantes[j]] = [indicesRestantes[j], indicesRestantes[i]];
  }
  // Impede repetir na passagem entre rodadas.
  if (indicesRestantes.length > 1 && indicesRestantes[indicesRestantes.length - 1] === ultimoIndice) {
    [indicesRestantes[0], indicesRestantes[indicesRestantes.length - 1]] =
      [indicesRestantes[indicesRestantes.length - 1], indicesRestantes[0]];
  }
}

function sortearVerso() {
  if (!indicesRestantes.length) criarNovaRodada();
  const proximo = indicesRestantes.pop();
  ultimoIndice = proximo;
  return colecaoVersos[proximo];
}

function desenharVerso(item) {
  versoTexto.textContent = item.texto;
  versoCredito.textContent = item.autoral
    ? "entrelinhas. ♡"
    : `${item.musica} — ${item.artista}`;
}

function soltarFagulhas() {
  if (!versoParticulas || reduzirMovimento) return;
  const pequeno = window.matchMedia("(max-width: 650px)").matches;
  for (let i = 0; i < (pequeno ? 9 : 15); i++) {
    const p = document.createElement("span");
    p.className = "versos-fagulha";
    p.style.left = `${aleatorio(20, 80).toFixed(1)}%`;
    p.style.top = `${aleatorio(43, 66).toFixed(1)}%`;
    p.style.setProperty("--s", `${aleatorio(3, 8).toFixed(0)}px`);
    p.style.setProperty("--dx", `${aleatorio(-140, 140).toFixed(0)}px`);
    p.style.setProperty("--dy", `${aleatorio(-130, 30).toFixed(0)}px`);
    p.style.setProperty("--t", `${aleatorio(.9, 1.6).toFixed(2)}s`);
    versoParticulas.appendChild(p);
    p.addEventListener("animationend", () => p.remove(), { once: true });
  }
}

function proximoVerso() {
  if (!versoFigura || emTransicao) return;
  emTransicao = true;
  versoBotao.disabled = true;
  const item = sortearVerso();
  if (reduzirMovimento) {
    desenharVerso(item);
    emTransicao = false;
    versoBotao.disabled = false;
    return;
  }
  versoFigura.classList.remove("verso-entrando");
  versoFigura.classList.add("verso-saindo");
  soltarFagulhas();
  // Não depende de rede, áudio, fontes ou bibliotecas externas.
  window.setTimeout(() => {
    desenharVerso(item);
    versoFigura.classList.remove("verso-saindo");
    void versoFigura.offsetWidth;
    versoFigura.classList.add("verso-entrando");
    window.setTimeout(() => {
      versoFigura.classList.remove("verso-entrando");
      emTransicao = false;
      versoBotao.disabled = false;
    }, 780);
  }, 330);
}

if (versoBotao && versoFigura && versoTexto && versoCredito) {
  // A frase inicial também faz parte da rodada, para não reaparecer cedo.
  const fraseInicial = colecaoVersos.findIndex((e) => e.autoral && e.texto === versoTexto.textContent.trim());
  ultimoIndice = fraseInicial;
  criarNovaRodada();
  indicesRestantes = indicesRestantes.filter((idx) => idx !== fraseInicial);
  versoBotao.addEventListener("click", proximoVerso);
}
