const produtos = [
    {
        id: 1,
        nome: "iPhone 16 Pro Max",
        categoria: "smartphones",
        preco: 5759.90,
        precoOriginal: 8999.99,
        desconto: 11,
        imagem: "https://www.notebookcheck.info/fileadmin/Notebooks/News/_nc4/rohan-4Ti0LfaqQZY-unsplash.jpg",
        descricao: "Smartphone Apple com câmera avançada"
    },
    {
        id: 2,
        nome: "MacBook Air M3",
        categoria: "laptops",
        preco: 10499.90,
        precoOriginal: 10999.90,
        desconto: 18,
        imagem: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        descricao: "Notebook Apple ultrafino e potente"
    },
    {
        id: 3,
        nome: "AirPods Pro",
        categoria: "headphones",
        preco: 1099.90,
        precoOriginal: 2299,
        desconto: 17,
        imagem: "https://preview.redd.it/should-i-buy-airpods-pro-2-v0-vzrxrswuf4se1.jpg?width=640&crop=smart&auto=webp&s=6385cd1c678e5f3d76bb07a2e9af4f1130fd05d7",
        descricao: "Fones sem fio com cancelamento de ruído"
    },
    {
        id: 4,
        nome: "Samsung Galaxy S24",
        categoria: "smartphones",
        preco: 4699.90,
        precoOriginal: 6299,
        desconto: 13,
        imagem: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
        descricao: "Smartphone Samsung com tela AMOLED"
    },
    {
        id: 5,
        nome: "Apple Watch Series 9",
        categoria: "smartwatch",
        preco: 2389.90,
        precoOriginal: 3799.90,
        desconto: 13,
        imagem: "https://noticias.r7.com/resizer/H7AZPL7xNg12h8QLzb2tSc49Wvw=/arc-photo-newr7/arc2-prod/public/RRB4RLTJMRNHTLBNBSJVXNMGBY.jpg",
        descricao: "Relógio inteligente com monitoramento"
    },
    {
        id: 6,
        nome: "Teclado Mecânico",
        categoria: "accessories",
        preco: 599.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://pcdiga-prod.eu.saleor.cloud/media/thumbnails/products/p052625_1_862513ae_thumbnail_1024.jpg",
        descricao: "Teclado mecânico RGB para gamers"
    },
    {
        id: 7,
        nome: "Sony WH-1000XM5",
        categoria: "headphones",
        preco: 2199.90,
        precoOriginal: 2999,
        desconto: 17,
        imagem: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
        descricao: "Fone com cancelamento de ruído"
    },
    {
        id: 8,
        nome: "Dell XPS 13",
        categoria: "laptops",
        preco: 7999.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400",
        descricao: "Notebook Windows premium"
    },
    {
        id: 9,
        nome: "iPad Pro",
        categoria: "tablets",
        preco: 4499.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://www.techenet.com/wp-content/uploads/2021/06/iPadPro2021-2.jpg",
        descricao: "Toque, desenhe e digite como mágica em um único aparelho."
    },
     {
        id: 10,
        nome: "Magic Keyboard para iPad Pro de 13 polegadas",
        categoria: "tablets",
        preco: 949.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://m.media-amazon.com/images/S/aplus-media-library-service-media/f26a8683-305d-4b62-89dd-b597d84f521f.__CR0,0,800,600_PT0_SX600_V1___.jpg",
        descricao: "Magic Keyboard para iPad Pro de 13 polegadas (M4)"
    },
    {
        id: 11,
        nome: "Mouse Sem Fio Gamer",
        categoria: "accessories",
        preco: 319.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://techminuto.com.br/wp-content/uploads/2022/01/Melhores-Mouses-da-Razer.jpg",
        descricao: "Mouse Gamer Razer Mamba Chroma, 7 Botões, 16000DPI"
    },
    {
        id: 12,
        nome: "MacBook Air M4",
        categoria: "laptops",
        preco: 15919.90,
        precoOriginal: null,
        desconto: null,
        imagem: "https://webp.br.cdn.pxr.nl/news/2025/03/05/8499ab2fed92cf05e00302aa39450fb7bfee733e.jpg?width=1200",
        descricao: "Superleve e com pouco mais de 1 cm de espessura, o MacBook Air se encaixa facilmente na correria da sua rotina",


    },

];
let textoPesquisa = ""
let categoriaAtual = "all"


let containerProdutos = document.querySelector(".products-container")
let input = document.querySelector(".search-input")
let botoesMenu = document.querySelectorAll(".category-btn")
// selectorAll chama todos os botôes em vez de 1 

// function formatarPreco(preco) {
     // console.log(preco);
   // return ` ${preco.toFixed(2).replace('.', ',')}`;
// }


// ================== INTEGRAÇÃO COM O CARRINHO ==================
function integrarCarrinho() {
    // Seleciona todos os cards de produtos renderizados
    document.querySelectorAll(".products-card").forEach(card => {
        const btn = card.querySelector(".products-button");
        btn.addEventListener("click", () => {
            const productId = parseInt(card.dataset.id);
            const produto = produtos.find(p => p.id === productId);
            if (produto) addToCart({
                id: produto.id,
                name: produto.nome,
                price: produto.preco
            });
        });
    });
}

// ================== FORMATAR PREÇO ==================
function formatarPreco(preco) {
    return preco.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ================== MOSTRAR PRODUTOS ==================
function mostrarProduto() {
    let htmlProdutos = "";

    let produtosFiltrados = produtos.filter(prd => {
        let passouCategoria = (categoriaAtual === "all" || prd.categoria === categoriaAtual);
        let passouPesquisa = prd.nome.toLowerCase().includes(textoPesquisa.toLowerCase());
        return passouCategoria && passouPesquisa;
    });

    produtosFiltrados.forEach(prd => {
        htmlProdutos += `
            <div class="products-card" data-id="${prd.id}">
                <img class="products-img" src="${prd.imagem}" alt="${prd.nome}">
                <div class="products-info">
                    <h3 class="products-name">${prd.nome}</h3>
                    <p class="products-description">${prd.descricao}</p>
                    <p class="products-price">${formatarPreco(prd.preco)}</p>
                    <button class="products-button">Compre Agora!</button>
                </div>
            </div>
        `;
    });

    containerProdutos.innerHTML = htmlProdutos;

    // Integrar carrinho aos produtos renderizados
    integrarCarrinho();
}

// ================== PESQUISA ==================
function pesquisar() {
    textoPesquisa = input.value;
    mostrarProduto();
}

// ================== TROCAR CATEGORIA ==================
function trocarCategoria(categoria) {
    categoriaAtual = categoria;
    botoesMenu.forEach(botaoMenu => {
        botaoMenu.classList.remove('active');
        if (botaoMenu.getAttribute("data-category") === categoria) {
            botaoMenu.classList.add("active");
        }
    });
    mostrarProduto();
}

// ================== EVENTOS DOM ==================
window.addEventListener('DOMContentLoaded', function () {
    mostrarProduto(); // Mostrar produtos inicialmente

    input.addEventListener('input', pesquisar);

    botoesMenu.forEach(botaoMenu => {
        botaoMenu.addEventListener('click', () => {
            let categoria = botaoMenu.getAttribute("data-category");
            trocarCategoria(categoria);
        });
    });
});
