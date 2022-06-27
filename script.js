let nome;
let tipoMensagem = "message";
let nomeSelecionado = "Todos";

function start() {
    nome = document.querySelector(".input-nome").value;

    const promise = axios.post(
        "https://mock-api.driven.com.br/api/v6/uol/participants",
        {name: nome}
    );
    promise.then(nomeValido);
    promise.catch(nomeInvalido);
}

function nomeValido() {
    telaCarregamento();
    carregarMensagem();
    carregarParticipantes();
    setInterval(aindaAtivo, 5000);
    setInterval(carregarMensagem, 3000);
    setInterval(carregarParticipantes, 10000);
}

function nomeInvalido(sinal) {
    let status = (sinal.response.status);
    if (status === 400) {
        alert (`Este nome já está sendo usado! Tente outro.`);
    } else {
        alert (`Erro ${status} encontrado!!!`);
    }
}

function aindaAtivo(){
    const promise = axios.post(
        'https://mock-api.driven.com.br/api/v6/uol/status',
        {name: nome}
    );
}

function carregarMensagem() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(printPosts);
}

function printPosts (array){
    let NumMensagens = array.data.length;
    let chat = document.querySelector(".chat")
    chat.innerHTML = "";

    for (let i = 0; i < NumMensagens; i++){
        let post = array.data[i];
        let divMensagem;

        if (post.type === "status") {
            divMensagem =
            `<div class="${post.type}">
                <p><em>(${post.time})</em> <b>${post.from}</b> ${post.text}</p>
            </div>`

        } else if (post.type === "message") {
            divMensagem =
            `<div class="${post.type}">
                <p><em>(${post.time})</em> <b>${post.from}</b> para <b>${post.to}</b>: ${post.text}</p>
            </div>`
        } else if (post.type === "private_message" && (post.to === nome || post.from === nome)) {
            divMensagem =
            `<div class="${post.type}">
                <p><em>(${post.time})</em> <b>${post.from}</b> reservadamente para <b>${post.to}</b>: ${post.text}</p>
            </div>`
        } else {
            divMensagem = '<div class="hidden"></div>'
        }
        chat.innerHTML += divMensagem;
    }
    let feed = document.querySelectorAll (".chat div");
    let ultimoPost = feed[feed.length-1];

    ultimoPost.scrollIntoView();
}

function postar() {
    let mensagem = document.querySelector(".input-mensagem");
    if (mensagem !== ""){
        let post = {
            from: nome,
            to: nomeSelecionado,
            text: mensagem.value,
            type: tipoMensagem
        }

        let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', post);
        promise.then(carregarMensagem);
        promise.catch(window.location.reload);

        mensagem.value = "";
    }
}

function telaCarregamento() {
    document.querySelector(".input-nome").classList.add("hidden");
    document.querySelector(".tela-inicial button").classList.add("hidden");
    document.querySelector(".carregando").classList.remove("hidden");

    setTimeout(liberarEntrada,1500);
}

function liberarEntrada() {
    document.querySelector(".tela-inicial").classList.add("hidden");
}

document.querySelector(".input-nome").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {  
        start();
    }
  });

document.querySelector(".input-mensagem").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {  
        postar();
    }
  });

function ativarTelaParticipantes() {
    document.querySelector(".tela-participantes").classList.toggle('hidden')
}

function carregarParticipantes() {
    let promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(printParticipantes);
}

function printParticipantes(array) {
    let primeiroItem = [{name: "Todos"}];
    let listaParticipantes = primeiroItem.concat(array.data);
    let NumParticipantes = listaParticipantes.length;
    let lista = document.querySelector(".contatos");

    lista.innerHTML = "";

    for (let i = 0; i < NumParticipantes; i++){
        let participante = listaParticipantes[i];
        let divContato;
        if (participante.name !== nomeSelecionado){
            divContato = `
            <div class="contato" onclick="selecionarNome(this)">
                <ion-icon name="person-circle"></ion-icon>
                <h2>${participante.name}</h2>
                <ion-icon name="checkmark-outline"></ion-icon>
            </div>
            `;
        } else {
            divContato = `
            <div class="contato selecionado" onclick="selecionarNome(this)">
                <ion-icon name="person-circle"></ion-icon>
                <h2>${participante.name}</h2>
                <ion-icon name="checkmark-outline"></ion-icon>
            </div>
            `;
        }
        lista.innerHTML += divContato;
    }

    let divNome = document.querySelector(".contatos .selecionado");
    if (divNome === null){
        document.querySelector(".contatos :nth-child(1)").classList.add("selecionado");
        nomeSelecionado = "Todos";
        document.querySelector(".base h2").innerHTML = `Enviando para ${nomeSelecionado}`
    }

}

function selecionarNome(div) {
    let divNome = document.querySelector(".contatos .selecionado");
    if (divNome !== null){
        divNome.classList.remove("selecionado");
    }
    div.classList.toggle('selecionado');

    nomeSelecionado = div.querySelector("h2").innerHTML;
    document.querySelector(".base h2").innerHTML = `Enviando para ${nomeSelecionado}`

}

function selecionarVisibilidade(div) {

    document.querySelector(".publico").classList.remove('selecionado');
    document.querySelector(".reservadamente").classList.remove('selecionado');
    
    div.classList.add('selecionado');

    let visibilidade = div.querySelector("h2").innerHTML;

    if (visibilidade === "Reservadamente"){
        tipoMensagem = "private_message";
        document.querySelector(".base h2").innerHTML = `Enviando para ${nomeSelecionado} (reservadamente)`
    } else {
        tipoMensagem = "message";
        document.querySelector(".base h2").innerHTML = `Enviando para ${nomeSelecionado}`
    }
}