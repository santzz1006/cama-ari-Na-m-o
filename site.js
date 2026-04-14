/**
 * ============================================================================
 * CAMAÇARI DIGITAL - SCRIPT PRINCIPAL (app.js)
 * Relacionado ao Sprint de 10 Dias - Equipes G1, G2, G3
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ==========================================================================
       1. DADOS MOCKADOS (Fase 2 - Dias 3 e 4)
       Simulando o retorno da API/Firestore antes da integração real
       ========================================================================== */
    
    const mockObras = [
        { id: 1, titulo: "Drenagem Bacia do Rio Camaçari", bairro: "centro", status: "em_andamento", secretaria: "SEINFRA", lat: -12.6975, lng: -38.3241, valor: "R$ 4.900.000" },
        { id: 2, titulo: "Revitalização Praça da Simpatia", bairro: "gleba-a", status: "concluida", secretaria: "SEDUR", lat: -12.7021, lng: -38.3190, valor: "R$ 850.000" },
        { id: 3, titulo: "Pavimentação Av. Radial A", bairro: "centro", status: "em_andamento", secretaria: "SEINFRA", lat: -12.6950, lng: -38.3280, valor: "R$ 1.200.000" },
        { id: 4, titulo: "Posto de Arrecadação Digital", bairro: "phoc", status: "paralisada", secretaria: "SEFAZ", lat: -12.7100, lng: -38.3300, valor: "R$ 320.000" }
    ];

    /* Paleta de cores das secretarias baseada no Guia Visual G1 */
    const coresSecretarias = {
        'SEINFRA': '#D97706', // Âmbar
        'SEDUR': '#0E7490',   // Teal
        'SEFAZ': '#1D4ED8'    // Azul
    };

    /* ==========================================================================
       2. MÓDULO DE MAPA (Leaflet.js - Dia 2 e 8)
       ========================================================================== */
    let mapa;
    let marcadoresLayer = L.layerGroup();

    function inicializarMapa() {
        const mapaContainer = document.getElementById('mapa-container');
        if (!mapaContainer) return;

        // Centralizado em Camaçari/BA
        mapa = L.map('mapa-container').setView([-12.6975, -38.3241], 13);

        // Camada visual do mapa (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap | Camaçari Digital Piloto'
        }).addTo(mapa);

        marcadoresLayer.addTo(mapa);
        renderizarMarcadores(mockObras);
    }

    function renderizarMarcadores(obras) {
        marcadoresLayer.clearLayers();

        obras.forEach(obra => {
            const cor = coresSecretarias[obra.secretaria] || '#1A7A4A';
            
            // Ícone customizado usando SVG para melhor acessibilidade e performance
            const iconeCustomizado = L.divIcon({
                className: 'custom-pin',
                html: `<div style="background-color: ${cor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const popupContent = `
                <div style="font-family: 'Inter', sans-serif;">
                    <strong style="color: ${cor}; display: block; margin-bottom: 4px;">${obra.secretaria}</strong>
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">${obra.titulo}</h4>
                    <p style="margin: 0; font-size: 12px; color: #4B5563;">Status: <b>${obra.status.replace('_', ' ').toUpperCase()}</b></p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: bold;">Investimento: ${obra.valor}</p>
                </div>
            `;

            L.marker([obra.lat, obra.lng], { icon: iconeCustomizado })
                .bindPopup(popupContent)
                .addTo(marcadoresLayer);
        });
    }

    // Filtros do Mapa
    document.getElementById('filtro-bairro')?.addEventListener('change', aplicarFiltrosMapa);
    document.getElementById('filtro-status')?.addEventListener('change', aplicarFiltrosMapa);

    function aplicarFiltrosMapa() {
        const bairro = document.getElementById('filtro-bairro').value;
        const status = document.getElementById('filtro-status').value;

        const obrasFiltradas = mockObras.filter(obra => {
            const matchBairro = bairro === 'todos' || obra.bairro === bairro;
            const matchStatus = status === 'todos' || obra.status === status;
            return matchBairro && matchStatus;
        });

        renderizarMarcadores(obrasFiltradas);
    }

    /* ==========================================================================
       3. MÓDULO DE TRANSPARÊNCIA (Chart.js - Dia 5)
       ========================================================================== */
    function inicializarGraficos() {
        const ctxOrcamento = document.getElementById('chart-orcamento');
        const ctxExecucao = document.getElementById('chart-execucao');

        if (ctxOrcamento) {
            new Chart(ctxOrcamento, {
                type: 'doughnut',
                data: {
                    labels: ['SEINFRA (Infraestrutura)', 'SEDUR (Urbano)', 'SEFAZ (Fazenda)', 'Outros'],
                    datasets: [{
                        data: [45, 25, 15, 15],
                        backgroundColor: ['#D97706', '#0E7490', '#1D4ED8', '#1A7A4A'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        if (ctxExecucao) {
            new Chart(ctxExecucao, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [{
                        label: 'Executado (Milhões R$)',
                        data: [1.2, 1.9, 1.5, 2.1, 3.0, 2.8],
                        backgroundColor: '#1A7A4A',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    }

    /* ==========================================================================
       4. MÓDULO DE VOTAÇÃO E INTERAÇÃO (Dia 6)
       ========================================================================== */
    function configurarVotacao() {
        const botoesVoto = document.querySelectorAll('.btn-vote');
        
        botoesVoto.forEach(botao => {
            botao.addEventListener('click', function() {
                const idProposta = this.getAttribute('data-id');
                const card = this.closest('.proposal-card');
                const contadorSpan = card.querySelector('.votos-count strong');
                
                // Simula verificação de autenticação (simplificado)
                if (this.classList.contains('voted')) {
                    alert('Você já votou nesta proposta! Acompanhe o resultado no dia 30.');
                    return;
                }

                // Efeito visual de confirmação (Heurística de Nielsen)
                let votosAtuais = parseInt(contadorSpan.innerText.replace('.', ''));
                votosAtuais += 1;
                contadorSpan.innerText = votosAtuais.toLocaleString('pt-BR');
                
                this.innerHTML = '✅ Voto Registrado';
                this.classList.remove('btn-primary', 'btn-outline');
                this.style.backgroundColor = '#10B981'; // Verde sucesso
                this.style.color = '#fff';
                this.classList.add('voted');
            });
        });
    }

    /* ==========================================================================
       5. MÓDULO DE ACESSIBILIDADE E UI (WCAG 2.1 AA)
       ========================================================================== */
    function configurarAcessibilidade() {
        const btnMais = document.getElementById('btn-a-plus');
        const btnMenos = document.getElementById('btn-a-minus');
        const btnContraste = document.getElementById('btn-contrast');
        const rootHtml = document.documentElement;
        
        let fontScale = 100;

        btnMais?.addEventListener('click', () => {
            if(fontScale < 130) {
                fontScale += 10;
                rootHtml.style.fontSize = `${fontScale}%`;
            }
        });

        btnMenos?.addEventListener('click', () => {
            if(fontScale > 90) {
                fontScale -= 10;
                rootHtml.style.fontSize = `${fontScale}%`;
            }
        });

        btnContraste?.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast-mode');
        });
    }

    /* ==========================================================================
       6. MÓDULO DE AUTENTICAÇÃO (Modais)
       ========================================================================== */
    function configurarModais() {
        const modalLogin = document.getElementById('modal-login');
        const btnLogin = document.getElementById('btnLogin');
        const closeBtn = document.querySelector('.close-modal');
        const formLogin = document.getElementById('login-form');

        // Abrir Modal
        btnLogin?.addEventListener('click', () => {
            modalLogin.classList.add('active');
            modalLogin.setAttribute('aria-hidden', 'false');
            document.getElementById('cpf').focus(); // Foco acessível
        });

        // Fechar Modal
        const fecharModal = () => {
            modalLogin.classList.remove('active');
            modalLogin.setAttribute('aria-hidden', 'true');
        };

        closeBtn?.addEventListener('click', fecharModal);
        
        // Fechar ao clicar fora do modal
        modalLogin?.addEventListener('click', (e) => {
            if (e.target === modalLogin) fecharModal();
        });

        // Simulação de Submissão de Login
        formLogin?.addEventListener('submit', (e) => {
            e.preventDefault();
            const cpf = document.getElementById('cpf').value;
            // Mock de sucesso
            btnLogin.innerText = `Olá, Cidadão`;
            btnLogin.classList.add('btn-outline');
            fecharModal();
            alert(`Autenticado com sucesso! Seu CPF ${cpf.substring(0,3)}... está validado.`);
        });
    }

    /* ==========================================================================
       7. INICIALIZAÇÃO GERAL
       ========================================================================== */
    function init() {
        inicializarMapa();
        inicializarGraficos();
        configurarVotacao();
        configurarAcessibilidade();
        configurarModais();

        // Evita recarregamento na pesquisa de satisfação
        document.getElementById('form-satisfacao')?.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Obrigado! Sua avaliação ajuda a melhorar Camaçari.');
            e.target.reset();
        });
    }

    // Chama a função principal
    init();

});