// DADOS DO PRODUTO (iPhone 12)
const productData = {
    colors: {
        white: { 
            name: 'Branco (Fotos Reais do Aparelho)', 
            files: [
                'foto/5024064164191734816.jpg',
                'foto/5024064164191734818 (2).jpg',
                'foto/5024064164191734817 (1).jpg'
            ], 
            stock: 1,
            condition: 'Usado',
            salesText: '1 vendido',
            descAdd: 'Aparelho em excelente estado de conservação, com marcas mínimas de uso nas laterais. Tela impecável, sem riscos. Saúde da bateria em 93% (bateria original de fábrica, excelente autonomia).'
        }
    },
    storages: {
        '128 GB': { price: 1600, original: 1000, discount: '40% OFF' }
    }
};

// ESTADO DA APLICAÇÃO
let currentState = {
    color: 'white',
    storage: '128 GB',
    quantity: 1,
    cartCount: 0
};

// Flag para bloquear navegação/aberturas externas enquanto checkout estiver aberto
window.checkoutOpen = false;

// URL de checkout externo (configurada por solicitação do usuário)
// Abre na mesma aba por padrão; avise se preferir abrir em nova aba.
const externalCheckoutUrl = 'https://checkout.poseidonpay.site/checkout/cmqntacb80akv01q1tn2omepy?offer=KNUJNIT';

// Elemento bloqueador de interação (criado quando necessário)
function createInteractionBlocker() {
    if (document.getElementById('interaction-blocker')) return;
    const blocker = document.createElement('div');
    blocker.id = 'interaction-blocker';
    blocker.style.position = 'fixed';
    blocker.style.top = '0';
    blocker.style.left = '0';
    blocker.style.width = '100%';
    blocker.style.height = '100%';
    blocker.style.zIndex = '9998'; // deve ficar abaixo do modal (modal tem z-index via CSS)
    blocker.style.background = 'transparent';
    blocker.style.cursor = 'not-allowed';
    // impedir seleção e interações por padrão
    blocker.style.pointerEvents = 'auto';
    document.body.appendChild(blocker);
    console.info('Interaction blocker ativado: checkout bloqueando navegação.');
}

function removeInteractionBlocker() {
    const el = document.getElementById('interaction-blocker');
    if (el) el.remove();
    console.info('Interaction blocker removido: checkout finalizado.');
}

// SELETORES DOM
const dom = {
    // Imagens
    mainImg: document.getElementById('main-product-img'),
    mainImgViewport: document.getElementById('main-image-viewport'),
    thumbnails: document.getElementById('product-thumbnails'),
    
    // Especificações
    specModel: document.getElementById('spec-model-name'),
    specStorage: document.getElementById('spec-storage-val'),
    specColor: document.getElementById('spec-color-val'),
    
    // Buy Box Detalhes
    productTitle: document.getElementById('buy-box-product-title'),
    originalPrice: document.getElementById('original-price-val'),
    priceInteger: document.getElementById('price-integer-val'),
    priceCents: document.getElementById('price-cents-val'),
    discountPct: document.getElementById('discount-pct-val'),
    instValue: document.getElementById('inst-value-val'),
    qtySelect: document.getElementById('qty-select'),
    stockCountLabel: document.getElementById('stock-count-label'),
    
    // Seletores de Atributos
    colorContainer: document.getElementById('color-options-container'),
    colorNameLabel: document.getElementById('selected-color-name-label'),
    storageContainer: document.getElementById('storage-options-container'),
    storageLabel: document.getElementById('selected-storage-label'),
    
    // Ações de Compra
    btnBuyNow: document.getElementById('buy-now-btn'),
    btnAddToCart: document.getElementById('add-to-cart-btn'),
    cartCounter: document.getElementById('cart-counter'),
    
    // Toast Notificação
    toastCart: document.getElementById('toast-cart'),
    toastProductName: document.getElementById('toast-product-name'),
    closeToastBtn: document.getElementById('close-toast'),
    
    // Modal Checkout
    checkoutModal: document.getElementById('checkout-modal'),
    closeCheckoutBtn: document.getElementById('close-checkout-modal'),
    modalProductTitle: document.getElementById('modal-product-title'),
    modalProductQty: document.getElementById('modal-product-qty'),
    modalProductPrice: document.getElementById('modal-product-price'),
    modalProductImg: document.getElementById('modal-summary-img'),
    confirmPaymentBtn: document.getElementById('confirm-payment-btn'),
    paymentOptionItems: document.querySelectorAll('.payment-option-item'),
    
    // Modal Sucesso
    successModal: document.getElementById('success-modal'),
    closeSuccessBtn: document.getElementById('close-success-modal'),
    successProductTitle: document.getElementById('success-product-title'),
    successOrderId: document.getElementById('success-order-id'),
    successDeliveryDay: document.getElementById('success-delivery-day'),
    
    // Perguntas
    questionInput: document.getElementById('user-question-input'),
    submitQuestionBtn: document.getElementById('submit-question-btn'),
    qnaList: document.getElementById('qna-list-container'),
    
    // Opiniões
    reviewsList: document.getElementById('reviews-list'),
    reviewFilterTags: document.querySelectorAll('.filter-tag'),
    btnHelpfulList: document.querySelectorAll('.btn-helpful'),
    
    // Barra de Busca
    searchInput: document.getElementById('search-input-field'),
    searchSuggestions: document.getElementById('search-suggestions-dropdown'),
    searchForm: document.getElementById('main-search-form'),
    
    // Localização
    deliveryAddressTrigger: document.getElementById('delivery-address-trigger')
};

// RESPOSTAS SIMULADAS DO VENDEDOR (Q&A)
const mockSellerAnswers = [
    "Olá! Sim, temos estoque disponível a pronta entrega na cor selecionada. Comprando agora o envio é feito de forma imediata pelo Full do Mercado Livre. Aguardamos sua compra!",
    "Oi! O iPhone é homologado pela Anatel, possui nota fiscal eletrônica e garantia oficial Apple de 12 meses em todo o Brasil. Qualquer outra dúvida, conte com a gente!",
    "Olá! Sim, produto 100% original, novo e lacrado na caixa. Se você fizer o pedido agora, a entrega é prevista para amanhã para sua região. Aproveite!",
    "Olá, tudo bem? Sim, aceitamos pagamento em até 10x sem juros no cartão de crédito, ou PIX com aprovação imediata. Se precisar de algo mais, estamos à disposição."
];

// INICIALIZADOR
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    updateUI();
    setupEventListeners();
    setupZoomEffect();
    calculateDeliveryDate();
});

// CALCULAR DATA DE ENTREGA REALISTA
function calculateDeliveryDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const deliveryDayName = daysOfWeek[tomorrow.getDay()];
    const deliveryDateString = tomorrow.getDate() + ' de ' + months[tomorrow.getMonth()];
    
    const deliveryCalculated = `Chegará grátis <strong>${deliveryDayName === 'Domingo' ? 'neste domingo' : 'amanhã'}</strong>, ${deliveryDateString}`;
    document.getElementById('delivery-date-calc').innerHTML = deliveryCalculated;
}

// INICIALIZAR E ATUALIZAR GALERIA DE FOTOS
function initGallery() {
    const colorInfo = productData.colors[currentState.color];
    const galleryFiles = colorInfo.files;
    
    // Limpar e re-gerar miniaturas
    dom.thumbnails.innerHTML = '';
    
    galleryFiles.forEach((file, index) => {
        const thumb = document.createElement('div');
        thumb.className = `thumb-item ${index === 0 ? 'active-thumb' : ''}`;
        thumb.setAttribute('data-index', index);
        thumb.innerHTML = `<img src="${file}" alt="Miniatura ${index + 1}">`;
        
        // Ajusta rotação especial na miniatura do lockscreen se necessário
        const thumbImg = thumb.querySelector('img');
        if (file.includes('5024064164191734818')) {
            thumbImg.style.transform = 'rotate(90deg)';
        }
        
        // Clique na miniatura atualiza a principal
        thumb.addEventListener('mouseenter', () => {
            document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active-thumb'));
            thumb.classList.add('active-thumb');
            dom.mainImg.src = file;
            
            // Ajusta rotação especial na principal
            if (file.includes('5024064164191734818')) {
                dom.mainImg.classList.add('rotated-landscape');
            } else {
                dom.mainImg.classList.remove('rotated-landscape');
            }
        });
        
        dom.thumbnails.appendChild(thumb);
    });
    
    // Resetar imagem principal para a primeira da galeria
    dom.mainImg.src = galleryFiles[0];
    dom.mainImg.classList.remove('rotated-landscape');
}

// ATUALIZAR INTERFACE COM O ESTADO ATUAL
function updateUI() {
    const colorInfo = productData.colors[currentState.color];
    const storageInfo = productData.storages[currentState.storage];
    
    // 1. Atualizar Título do Produto
    const fullTitle = `Apple iPhone 12 (${currentState.storage}) - ${colorInfo.name}`;
    dom.productTitle.textContent = fullTitle;
    
    // Atualizar condição (Novo/Usado) e quantidade vendida
    const conditionElement = document.querySelector('.prod-cond');
    const salesElement = document.querySelector('.prod-sales-count');
    if (conditionElement && salesElement) {
        conditionElement.textContent = colorInfo.condition;
        salesElement.textContent = colorInfo.salesText;
    }
    
    // Preço final e preço original (riscado)
    const isUsed = colorInfo.condition === 'Usado';
    let currentPriceVal = storageInfo.price - 1000;   // preço com desconto (ex: 1600 - 1000 = 600)
    let originalPriceVal = storageInfo.price;         // preço "antes" riscado (ex: 1600)
    let discountPctVal = `${Math.round(((originalPriceVal - currentPriceVal) / originalPriceVal) * 100)}% OFF`;
    
    // 2. Atualizar Preços
    dom.originalPrice.textContent = `R$ ${originalPriceVal.toLocaleString('pt-BR')}`;
    // Ocultar o preço original riscado (por solicitação do usuário)
    dom.originalPrice.style.display = 'none';
    dom.priceInteger.textContent = Math.floor(currentPriceVal).toLocaleString('pt-BR');
    dom.priceCents.textContent = '00';
    dom.discountPct.textContent = discountPctVal;
    
    // Parcelamento (10x sem juros)
    const installmentVal = (currentPriceVal / 10).toFixed(2);
    dom.instValue.textContent = parseFloat(installmentVal).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    // 3. Atualizar Ficha Técnica e Características
    dom.specModel.textContent = `iPhone 12 ${currentState.storage}`;
    dom.specStorage.textContent = currentState.storage;
    dom.specColor.textContent = colorInfo.name;
    
    // Detalhar a saúde da bateria nas especificações se for usado
    const batterySpec = document.querySelector('.specs-table tr:nth-child(10) .spec-detail');
    if (batterySpec) {
        batterySpec.innerHTML = isUsed ? "Íons de lítio (Saúde em 93% - Original)" : "Íons de lítio (Carregamento sem fio MagSafe e Qi)";
    }
    
    // Atualizar nota de produto usado na descrição
    const descContent = document.querySelector('.description-content');
    if (descContent) {
        const existingNote = document.getElementById('used-product-note');
        if (existingNote) existingNote.remove();
        
        if (isUsed) {
            const note = document.createElement('div');
            note.id = 'used-product-note';
            note.style.backgroundColor = '#fcf3e8';
            note.style.borderLeft = '4px solid #f7941d';
            note.style.padding = '14px 18px';
            note.style.marginBottom = '20px';
            note.style.borderRadius = '4px';
            note.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            note.innerHTML = `
                <h4 style="color: #d37100; margin-bottom: 6px; font-weight: 600; display: flex; align-items: center; gap: 8px; font-size: 14px;">
                    <i class="fa-solid fa-circle-info" style="font-size: 16px;"></i> Detalhes do Aparelho Usado
                </h4>
                <p style="font-size: 13.5px; color: #555; margin: 0; line-height: 1.45;">${colorInfo.descAdd}</p>
            `;
            descContent.prepend(note);
        }
    }
    
    // 4. Atualizar Seletores Labels
    dom.colorNameLabel.textContent = colorInfo.name;
    dom.storageLabel.textContent = currentState.storage;
    
    // 5. Atualizar Informações de Estoque e Seleção de Quantidade
    dom.stockCountLabel.textContent = `(${colorInfo.stock} disponível${colorInfo.stock > 1 ? 's' : ''})`;
    
    // Atualizar dropdown de quantidade baseado no estoque
    const oldQtyValue = dom.qtySelect.value;
    dom.qtySelect.innerHTML = '';
    for (let i = 1; i <= colorInfo.stock; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} unidade${i > 1 ? 's' : ''}`;
        dom.qtySelect.appendChild(option);
    }
    
    // Tenta re-selecionar a quantidade anterior se for menor que o estoque
    if (parseInt(oldQtyValue) <= colorInfo.stock) {
        dom.qtySelect.value = oldQtyValue;
        currentState.quantity = parseInt(oldQtyValue);
    } else {
        dom.qtySelect.value = 1;
        currentState.quantity = 1;
    }
}

// SETUP DO EFEITO DE ZOOM
function setupZoomEffect() {
    dom.mainImgViewport.addEventListener('mouseenter', () => {
        const isRotated = dom.mainImg.classList.contains('rotated-landscape');
        dom.mainImg.style.transform = isRotated ? 'rotate(90deg) scale(1.8)' : 'scale(1.8)';
        dom.mainImg.style.cursor = 'zoom-in';
    });
    
    dom.mainImgViewport.addEventListener('mousemove', (e) => {
        const rect = dom.mainImgViewport.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        dom.mainImg.style.transformOrigin = `${x}% ${y}%`;
    });
    
    dom.mainImgViewport.addEventListener('mouseleave', () => {
        const isRotated = dom.mainImg.classList.contains('rotated-landscape');
        dom.mainImg.style.transform = isRotated ? 'rotate(90deg)' : 'scale(1)';
        dom.mainImg.style.transformOrigin = 'center center';
    });
}

// SEGUIDORES DE EVENTOS
function setupEventListeners() {
    
    // 1. Cliques de Seleção de Cor
    document.querySelectorAll('.color-btn-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn-item').forEach(b => b.classList.remove('active-attr'));
            btn.classList.add('active-attr');
            currentState.color = btn.getAttribute('data-color');
            initGallery();
            updateUI();
        });
    });
    
    // 2. Cliques de Seleção de Armazenamento
    document.querySelectorAll('.storage-btn-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.storage-btn-item').forEach(b => b.classList.remove('active-attr'));
            btn.classList.add('active-attr');
            currentState.storage = btn.getAttribute('data-storage');
            updateUI();
        });
    });
    
    // 3. Mudança de Quantidade
    dom.qtySelect.addEventListener('change', (e) => {
        currentState.quantity = parseInt(e.target.value);
    });
    
    // 4. Adicionar ao Carrinho
    dom.btnAddToCart.addEventListener('click', () => {
        currentState.cartCount += currentState.quantity;
        dom.cartCounter.textContent = currentState.cartCount;
        dom.cartCounter.style.display = 'flex';
        
        // Exibir Notificação Toast
        const colorName = productData.colors[currentState.color].name;
        dom.toastProductName.textContent = `iPhone 12 ${currentState.storage} ${colorName} (${currentState.quantity} un.)`;
        dom.toastCart.classList.add('show');
        
        // Auto esconder após 4 segundos
        setTimeout(() => {
            dom.toastCart.classList.remove('show');
        }, 4000);
    });
    
    // Fechar Toast
    dom.closeToastBtn.addEventListener('click', () => {
        dom.toastCart.classList.remove('show');
    });
    
    // 5. Botão Comprar Agora (Abrir modal de Checkout)
    dom.btnBuyNow.addEventListener('click', () => {
        // Se houver um checkout externo configurado, redireciona para ele imediatamente
        if (typeof externalCheckoutUrl === 'string' && externalCheckoutUrl) {
            // Navega na mesma aba — substitua por window.open(...) se preferir nova aba
            window.location.href = externalCheckoutUrl;
            return;
        }
        const colorInfo = productData.colors[currentState.color];
        const storageInfo = productData.storages[currentState.storage];
        
        const isUsed = colorInfo.condition === 'Usado';
        const currentPriceVal = isUsed ? (storageInfo.price - 1000) : storageInfo.price;
        const totalPrice = currentPriceVal * currentState.quantity;
        
        // Preencher dados do modal
        dom.modalProductTitle.textContent = `Apple iPhone 12 (${currentState.storage}) - ${colorInfo.name}`;
        dom.modalProductQty.textContent = `Quantidade: ${currentState.quantity} unidade${currentState.quantity > 1 ? 's' : ''}`;
        dom.modalProductPrice.textContent = `Total: R$ ${totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        dom.modalProductImg.src = colorInfo.files[0];
        
        // Ajusta rotação na miniatura do modal se necessário
        if (colorInfo.files[0].includes('5024064164191734818')) {
            dom.modalProductImg.style.transform = 'rotate(90deg)';
        } else {
            dom.modalProductImg.style.transform = 'none';
        }
        
        dom.checkoutModal.classList.add('show');
            // Bloquear navegação externa enquanto o modal de checkout estiver aberto
            window.checkoutOpen = true;
            createInteractionBlocker();
    });
    
    // Fechar Modal de Checkout
    dom.closeCheckoutBtn.addEventListener('click', () => {
        dom.checkoutModal.classList.remove('show');
        window.checkoutOpen = false;
        removeInteractionBlocker();
    });
    
    // Seleção de forma de pagamento no modal
    dom.paymentOptionItems.forEach(item => {
        item.addEventListener('click', () => {
            dom.paymentOptionItems.forEach(i => i.classList.remove('selected-payment'));
            item.classList.add('selected-payment');
            item.querySelector('input[type="radio"]').checked = true;
        });
    });
    
    // Confirmar pagamento (Passa para modal de sucesso)
    dom.confirmPaymentBtn.addEventListener('click', () => {
        dom.checkoutModal.classList.remove('show');
        window.checkoutOpen = false;
        removeInteractionBlocker();
        
        // Gerar número de pedido aleatório
        const randomOrder = 'ML-' + Math.floor(100000000 + Math.random() * 900000000);
        dom.successOrderId.textContent = randomOrder;
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dom.successDeliveryDay.textContent = tomorrow.toLocaleDateString('pt-BR');
        
        const colorName = productData.colors[currentState.color].name;
        dom.successProductTitle.textContent = `iPhone 12 ${currentState.storage} ${colorName}`;
        
        dom.successModal.classList.add('show');
    });
    
    // Fechar Modal de Sucesso
    dom.closeSuccessBtn.addEventListener('click', () => {
        dom.successModal.classList.remove('show');
        
        // Opcional: zerar carrinho ou simular entrega
        currentState.cartCount = 0;
        dom.cartCounter.textContent = '0';
        dom.cartCounter.style.display = 'none';
    });
    
    // 6. Enviar Pergunta (Q&A Dinâmico)
    dom.submitQuestionBtn.addEventListener('click', postQuestion);
    dom.questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            postQuestion();
        }
    });
    
    // 7. Filtros de Opiniões
    dom.reviewFilterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            dom.reviewFilterTags.forEach(t => t.classList.remove('active-tag'));
            tag.classList.add('active-tag');
            
            const filterValue = tag.getAttribute('data-filter');
            const reviewCards = dom.reviewsList.querySelectorAll('.review-card');
            
            reviewCards.forEach(card => {
                const cardRating = parseInt(card.getAttribute('data-rating'));
                
                if (filterValue === 'all') {
                    card.style.display = 'block';
                } else if (filterValue === '5' && cardRating === 5) {
                    card.style.display = 'block';
                } else if (filterValue === '4' && cardRating === 4) {
                    card.style.display = 'block';
                } else if (filterValue === '3' && cardRating <= 3) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // 8. Botão "Útil" das avaliações
    dom.reviewsList.addEventListener('click', (e) => {
        const helpfulBtn = e.target.closest('.btn-helpful');
        if (helpfulBtn) {
            if (!helpfulBtn.classList.contains('clicked-helpful')) {
                helpfulBtn.classList.add('clicked-helpful');
                helpfulBtn.style.color = '#00a650';
                const countSpan = helpfulBtn.querySelector('.helpful-count');
                let count = parseInt(countSpan.textContent);
                countSpan.textContent = count + 1;
            }
        }
    });

    // 9. Barra de Busca - Efeito Sugestões
    dom.searchInput.addEventListener('focus', () => {
        dom.searchSuggestions.style.display = 'block';
    });

    // Atraso curto no blur para permitir cliques nas sugestões
    dom.searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            dom.searchSuggestions.style.display = 'none';
        }, 200);
    });

    // Preencher campo ao clicar na sugestão
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const text = item.textContent.trim();
            dom.searchInput.value = text;
            dom.searchSuggestions.style.display = 'none';
        });
    });

    dom.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = dom.searchInput.value.trim();
        if (query) {
            alert(`Você buscou por: "${query}". Esta é uma página demonstrativa clone do Mercado Livre.`);
        }
    });

    // 10. Localização dinâmica (CEP simulado)
    dom.deliveryAddressTrigger.addEventListener('click', () => {
        const novoCEP = prompt("Digite seu CEP para simular o frete (ex: 01001-000):", "01001-000");
        if (novoCEP) {
            const cleanCEP = novoCEP.replace(/\D/g, "");
            if (cleanCEP.length === 8) {
                const formattedCEP = cleanCEP.substring(0, 5) + "-" + cleanCEP.substring(5);
                document.querySelector('.address-city').textContent = `São Paulo ${formattedCEP}`;
                alert(`CEP alterado para ${formattedCEP}. Frete FULL grátis mantido!`);
            } else {
                alert("CEP inválido! Digite 8 números.");
            }
        }
    });
}

// LOGICA DE POSTAR PERGUNTA (SIMULAÇÃO)
function postQuestion() {
    const text = dom.questionInput.value.trim();
    if (!text) return;
    
    // 1. Criar bloco de pergunta do usuário
    const qnaItem = document.createElement('div');
    qnaItem.className = 'qna-item';
    qnaItem.style.animation = 'fadeIn 0.4s ease-out';
    
    const userQ = document.createElement('div');
    userQ.className = 'user-question';
    userQ.innerHTML = `
        <span class="q-text">${escapeHTML(text)}</span>
        <a href="#" class="q-report">Denunciar</a>
    `;
    
    // 2. Criar bloco de resposta do vendedor (começa com loading)
    const sellerA = document.createElement('div');
    sellerA.className = 'seller-answer';
    sellerA.innerHTML = `
        <span class="a-decorator"></span>
        <span class="a-text text-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Vendedor está digitando uma resposta...</span>
    `;
    
    qnaItem.appendChild(userQ);
    qnaItem.appendChild(sellerA);
    
    // Inserir no topo das perguntas
    const titleHeader = dom.qnaList.querySelector('h3');
    titleHeader.insertAdjacentElement('afterend', qnaItem);
    
    // Limpar campo de texto
    dom.questionInput.value = '';
    
    // Rolar para a pergunta criada
    qnaItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // 3. Simular resposta inteligente após 2 segundos
    setTimeout(() => {
        const loadingText = sellerA.querySelector('.text-loading');
        if (loadingText) {
            loadingText.remove();
            
            // Escolher uma resposta inteligente baseada em palavras-chave ou pegar uma genérica
            let answerText = "";
            const lowerText = text.toLowerCase();
            
            if (lowerText.includes("original") || lowerText.includes("falso") || lowerText.includes("réplica")) {
                answerText = "Olá! O aparelho é 100% original Apple, novo e selado de fábrica. Enviamos com Nota Fiscal e tem garantia de 1 ano com a própria Apple. Aproveite!";
            } else if (lowerText.includes("brinde") || lowerText.includes("carregador") || lowerText.includes("fone")) {
                answerText = "Olá! A caixa acompanha o iPhone 12 e o cabo USB-C para Lightning original. A tomada e o fone não estão inclusos conforme novo padrão Apple. Temos a tomada homologada Anatel na nossa loja se quiser adicionar ao carrinho!";
            } else if (lowerText.includes("bateria") || lowerText.includes("saúde")) {
                answerText = "Olá! Como o aparelho é novo e lacrado na caixa, a saúde da bateria está em 100%. Aguardamos sua compra!";
            } else if (lowerText.includes("enviar") || lowerText.includes("correio") || lowerText.includes("frete") || lowerText.includes("chegar")) {
                answerText = "Olá! Este produto está no depósito do Mercado Livre FULL. Isso significa que ele já está embalado e será despachado via transportadora própria deles, garantindo a entrega mais rápida do Brasil (geralmente chega no dia seguinte).";
            } else {
                // Selecionar aleatoriamente
                answerText = mockSellerAnswers[Math.floor(Math.random() * mockSellerAnswers.length)];
            }
            
            const dateStr = new Date().toLocaleDateString('pt-BR');
            const spanText = document.createElement('span');
            spanText.className = 'a-text';
            spanText.innerHTML = `${answerText} <span class="a-date">${dateStr}</span>`;
            
            sellerA.appendChild(spanText);
        }
    }, 2500);
}

// ESCAPAR HTML PARA SEGURANÇA
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Intercepta cliques em links externos e bloqueia window.open durante o checkout
(function() {
    // Bloqueia cliques em <a> externos enquanto o modal de checkout estiver aberto
    document.addEventListener('click', (e) => {
        try {
            const link = e.target.closest && e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href) return;

            // Se o checkout estiver aberto e for um link absoluto externo, bloqueia
            if (window.checkoutOpen && /^https?:\/\//i.test(href)) {
                e.preventDefault();
                e.stopPropagation();
                alert('Por favor finalize o checkout antes de sair da página.');
            }
        } catch (err) {
            // silencioso
        }
    }, true);

    // Override de window.open para bloquear aberturas externas durante checkout
    const _open = window.open;
    window.open = function(url, name, specs) {
        try {
            if (window.checkoutOpen && typeof url === 'string' && /^https?:\/\//i.test(url)) {
                console.warn('Bloqueado window.open durante checkout:', url);
                return null;
            }
        } catch (err) {
            // ignorar
        }
        return _open.apply(this, arguments);
    };
})();
