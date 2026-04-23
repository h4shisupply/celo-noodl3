export const LOCALE_COOKIE_NAME = "noodl3_locale";
export const locales = ["pt-BR", "en"] as const;
export const DEFAULT_LOCALE = "pt-BR";

export type Locale = (typeof locales)[number];

type StepCopy = {
  title: string;
  description: string;
};

type FaqCopy = {
  question: string;
  answer: string;
};

export type Dictionary = {
  languageName: string;
  brand: {
    name: string;
    shortDescription: string;
  };
  common: {
    storesLabel: string;
    rewardsLabel: string;
    verifierLabel: string;
    stampsLabel: string;
    currencyLabel: string;
    onchainVerified: string;
    miniPayNative: string;
    currentWallet: string;
    currentBalance: string;
    reward: string;
    rule: string;
    minimumEligible: string;
    transaction: string;
    status: string;
    manager: string;
    customer: string;
    customers: string;
    backupCode: string;
    searchPlaceholder: string;
    loadingBalance: string;
    disconnected: string;
    used: string;
    pending: string;
    authorized: string;
    unauthorized: string;
    contractMissing: string;
    activity: string;
    eligible: string;
  };
  nav: {
    howItWorks: string;
    stores: string;
    faq: string;
    app: string;
    rewards: string;
    accessRewards: string;
    openApp: string;
  };
  actions: {
    accessRewards: string;
    openApp: string;
    exploreStores: string;
    connectWallet: string;
    disconnectWallet: string;
    openScanner: string;
    closeScanner: string;
    payNow: string;
    payAndEarn: string;
    claimNow: string;
    consumeReward: string;
    copyLink: string;
    openVerifier: string;
    openExplorer: string;
    backToStore: string;
    backToRewards: string;
    backToVerifier: string;
    viewStore: string;
    openPurchaseFlow: string;
    checkClaim: string;
    readRewardQr: string;
    clearSelection: string;
    switchNetwork: string;
    refreshNetwork: string;
  };
  messages: {
    noWalletFound: string;
    couldNotConnectWallet: string;
    switchWalletRequired: string;
    miniPayWrongNetwork: string;
    couldNotSwitchNetwork: string;
    unsupportedNetwork: string;
    qrMismatch: string;
    invalidClaimId: string;
    claimNotFound: string;
    rewardNotFound: string;
    storeNotReady: string;
    purchaseFailed: string;
    claimFailed: string;
    consumeFailed: string;
    claimLookupFirst: string;
    claimCreatedMissing: string;
    allowanceCheck: string;
    approving: string;
    sendingPayment: string;
    claimWrongStore: string;
    claimWrongCustomer: string;
    claimAlreadyUsed: string;
    noManagedStores: string;
    wrongNetworkDescription: string;
    wrongNetworkMiniPayDescription: string;
    genericActionFailed: string;
    walletActionRejected: string;
    insufficientBalance: string;
    invalidProfileInput: string;
    notEnoughStamps: string;
    profileContractOutdated: string;
  };
  landing: {
    eyebrow: string;
    title: string;
    description: string;
    stats: string[];
    valueTitle: string;
    valueDescription: string;
    valuePoints: string[];
    howTitle: string;
    howDescription: string;
    steps: StepCopy[];
    storesTitle: string;
    storesDescription: string;
    trustTitle: string;
    trustDescription: string;
    trustBullets: string[];
    faqTitle: string;
    faqs: FaqCopy[];
    footerTitle: string;
    footerDescription: string;
  };
  dashboard: {
    eyebrow: string;
    title: string;
    description: string;
    rewardsCardTitle: string;
    rewardsConnected: string;
    rewardsDisconnected: string;
    quickActionsTitle: string;
    quickActionsDescription: string;
    scanTitle: string;
    scanDescription: string;
    storesTitle: string;
    storesDescription: string;
    walletCardTitle: string;
    walletMiniPayDescription: string;
    walletDisconnectedTitle: string;
    walletDisconnectedDescription: string;
  };
  rewards: {
    eyebrow: string;
    title: string;
    description: string;
    summaryTitle: string;
    summaryConnected: string;
    summaryDisconnected: string;
    readyToClaim: string;
    goToStore: string;
  };
  store: {
    eyebrow: string;
    qrEyebrow: string;
    titleSuffix: string;
    selectItemTitle: string;
    selectItemDescription: string;
    checkoutTitle: string;
    checkoutDescription: string;
    qrTitle: string;
    qrDescription: string;
    progressTitle: string;
    progressDescription: string;
    nextStepTitle: string;
    nextStepDescription: string;
    openedViaQr: string;
  };
  claim: {
    eyebrow: string;
    title: string;
    description: string;
    howToUseTitle: string;
    howToUseDescription: string;
    steps: string[];
  };
  verifier: {
    eyebrow: string;
    title: string;
    description: string;
    managedTitle: string;
    managedDescription: string;
    managedStoreLabel: string;
    activeStoreLabel: string;
    customersTitle: string;
    customersDescription: string;
    customerSearchPlaceholder: string;
    customersEmpty: string;
    selectedCustomerLabel: string;
    selectedCustomerHint: string;
    progressLabel: string;
    readyLabel: string;
    collectingLabel: string;
    genericTitle: string;
    genericDescription: string;
    scanTitle: string;
    scanDescription: string;
    manualTitle: string;
    manualDescription: string;
    manualPlaceholder: string;
    detailsTitle: string;
    detailsDescription: string;
    emptyState: string;
    connectStoreWallet: string;
  };
  success: {
    purchaseEyebrow: string;
    consumeEyebrow: string;
    purchaseTitle: string;
    consumeTitle: string;
    purchaseDescription: string;
    consumeDescription: string;
    purchaseDetail: string;
    consumeDetail: string;
    nextStepTitle: string;
    purchaseNextSteps: string[];
    consumeNextSteps: string[];
  };
  qrScanner: {
    unsupported: string;
    openCamera: string;
    ready: string;
    stopCamera: string;
    cameraActive: string;
    cameraOpenError: string;
    cameraPermissionDenied: string;
    cameraSecureContext: string;
    cameraNotFound: string;
    cameraBusy: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  "pt-BR": {
    languageName: "Português",
    brand: {
      name: "noodl3",
      shortDescription:
        "Pague com stablecoins no MiniPay, acompanhe Selos por loja e resgate com verificação no caixa."
    },
    common: {
      storesLabel: "Lojas",
      rewardsLabel: "Recompensas",
      verifierLabel: "Verificador",
      stampsLabel: "Selos",
      currencyLabel: "Stablecoins",
      onchainVerified: "Verificado onchain",
      miniPayNative: "Compatível com MiniPay",
      currentWallet: "Carteira atual",
      currentBalance: "Saldo atual",
      reward: "Recompensa",
      rule: "Regra",
      minimumEligible: "Pagamento mínimo elegível",
      transaction: "Transação",
      status: "Status",
      manager: "Responsável",
      customer: "Cliente",
      customers: "Clientes",
      backupCode: "Código de apoio",
      searchPlaceholder: "Buscar loja, bairro ou categoria",
      loadingBalance: "carregando...",
      disconnected: "desconectado",
      used: "utilizado",
      pending: "pendente",
      authorized: "autorizada",
      unauthorized: "sem autorização",
      contractMissing: "Contrato ainda não configurado nesta rede.",
      activity: "Atividade",
      eligible: "Elegível"
    },
    nav: {
      howItWorks: "Como funciona",
      stores: "Lojas",
      faq: "FAQ",
      app: "App",
      rewards: "Recompensas",
      accessRewards: "Acessar recompensas",
      openApp: "Abrir app"
    },
    actions: {
      accessRewards: "Acessar recompensas",
      openApp: "Abrir app",
      exploreStores: "Explorar lojas",
      connectWallet: "Conectar carteira",
      disconnectWallet: "Desconectar",
      openScanner: "Ler QR",
      closeScanner: "Fechar leitura",
      payNow: "Pagar",
      payAndEarn: "Pagar e ganhar Selos",
      claimNow: "Resgatar agora",
      consumeReward: "Confirmar resgate",
      copyLink: "Copiar link",
      openVerifier: "Abrir verificador",
      openExplorer: "Ver no explorer",
      backToStore: "Voltar para a loja",
      backToRewards: "Voltar para recompensas",
      backToVerifier: "Voltar para o verificador",
      viewStore: "Ver loja",
      openPurchaseFlow: "Abrir fluxo de pagamento",
      checkClaim: "Validar resgate",
      readRewardQr: "Ler QR da recompensa",
      clearSelection: "Limpar seleção",
      switchNetwork: "Trocar rede",
      refreshNetwork: "Já troquei"
    },
    messages: {
      noWalletFound: "Nenhuma carteira compatível foi encontrada.",
      couldNotConnectWallet: "Não foi possível conectar a carteira.",
      switchWalletRequired: "Mude para {{network}} para continuar.",
      miniPayWrongNetwork: "Abra o app em {{network}} dentro do MiniPay.",
      couldNotSwitchNetwork: "Não foi possível trocar de rede.",
      unsupportedNetwork: "Rede não suportada.",
      qrMismatch: "O QR lido não aponta para um pagamento válido do noodl3.",
      invalidClaimId: "Não foi possível identificar um resgate válido.",
      claimNotFound: "Resgate não encontrado.",
      rewardNotFound: "Recompensa não encontrada.",
      storeNotReady: "Esta loja ainda não foi configurada no contrato desta rede.",
      purchaseFailed: "Não foi possível concluir o pagamento.",
      claimFailed: "Não foi possível gerar o resgate.",
      consumeFailed: "Não foi possível confirmar o resgate.",
      claimLookupFirst: "Leia um QR ou informe um código antes de confirmar.",
      claimCreatedMissing: "O contrato confirmou a transação, mas o claimId não foi encontrado.",
      allowanceCheck: "Checando allowance do pagamento...",
      approving: "Aprovando o token para este pagamento...",
      sendingPayment: "Enviando pagamento e registrando Selos...",
      claimWrongStore: "Este resgate pertence a outra loja.",
      claimWrongCustomer: "Este resgate pertence a outro cliente.",
      claimAlreadyUsed: "Este resgate já foi utilizado.",
      noManagedStores: "Nenhuma loja vinculada a esta carteira foi encontrada.",
      wrongNetworkDescription:
        "Troque sua carteira para a rede correta antes de pagar, resgatar ou validar no noodl3.",
      wrongNetworkMiniPayDescription:
        "O MiniPay está na rede errada para este app. Abra as configurações do MiniPay, troque para a rede esperada e volte para continuar.",
      genericActionFailed: "Algo deu errado. Tente mais tarde.",
      walletActionRejected: "Você cancelou a ação na carteira.",
      insufficientBalance: "Saldo insuficiente para concluir este pagamento.",
      invalidProfileInput:
        "Use um nome válido e, se quiser, uma foto com link https://.",
      notEnoughStamps: "Você ainda não tem Selos suficientes para resgatar.",
      profileContractOutdated:
        "O contrato atual ainda não suporta perfis onchain. Faça deploy da versão mais recente e atualize o endereço no app."
    },
    landing: {
      eyebrow: "Fidelidade simples para consumo local",
      title: "Pague com stablecoins, acumule Selos e resgate com uma experiência limpa no caixa.",
      description:
        "noodl3 organiza descoberta, pagamento e recompensa no mesmo fluxo. O cliente encontra a loja, escolhe o item ou lê o QR do pedido, paga em MiniPay e acompanha o progresso por loja sem fricção.",
      stats: ["MiniPay + stablecoins", "Selos por loja", "Resgate com QR verificável"],
      valueTitle: "Desenhado para uso recorrente",
      valueDescription:
        "A jornada é curta, previsível e clara para cliente e caixa. Nada de token especulativo, nada de NFT para explicar.",
      valuePoints: [
        "USDT, USDC e cUSD com a mesma jornada de pagamento.",
        "Selos não transferíveis por loja.",
        "Resgates consumidos onchain no momento do uso."
      ],
      howTitle: "Como funciona",
      howDescription:
        "O produto foi pensado para compras repetidas em comida e bebida, com pouca fricção e validação confiável.",
      steps: [
        {
          title: "Pague",
          description:
            "Escolha a loja, selecione o item ou leia o QR do pedido e conclua o pagamento com a stablecoin que preferir."
        },
        {
          title: "Ganhe Selos",
          description:
            "Cada compra elegível soma Selos na loja correspondente e atualiza o progresso do cliente."
        },
        {
          title: "Resgate",
          description:
            "Ao atingir a regra da loja, o cliente gera o QR do resgate e o caixa consome o claim no checkout."
        }
      ],
      storesTitle: "Lojas ativas no app",
      storesDescription:
        "Cada loja define sua própria regra de Selos e recompensa, mantendo o fluxo igual para o usuário.",
      trustTitle: "Por que funciona melhor",
      trustDescription:
        "O produto mantém a operação simples para a loja e fácil de entender para quem compra.",
      trustBullets: [
        "Pagamento e fidelidade na mesma superfície.",
        "Verificação onchain do acúmulo, resgate e consumo.",
        "UX orientada a repetição, não a cadastro longo."
      ],
      faqTitle: "Perguntas rápidas",
      faqs: [
        {
          question: "Preciso escolher token?",
          answer: "Não. A experiência aceita as principais stablecoins do Celo sem mudar o fluxo."
        },
        {
          question: "Os Selos podem ser enviados para outra carteira?",
          answer: "Não. O saldo fica vinculado ao usuário e à loja onde a compra foi registrada."
        },
        {
          question: "Como o caixa valida a recompensa?",
          answer: "O cliente gera um QR com o claimId e o responsável da loja confirma o consumo no verificador."
        }
      ],
      footerTitle: "Entre direto no fluxo de recompensas",
      footerDescription:
        "Abra o app, conecte a carteira e acompanhe o progresso por loja em poucos toques."
    },
    dashboard: {
      eyebrow: "Área do cliente",
      title: "Suas lojas, seus Selos e seus próximos pagamentos.",
      description:
        "Use a carteira conectada para acompanhar recompensas, abrir um pagamento por QR e seguir comprando nas lojas parceiras.",
      rewardsCardTitle: "Resumo de recompensas",
      rewardsConnected: "Você tem {{claimable}} resgates prontos e {{stamps}} Selos distribuídos entre as lojas.",
      rewardsDisconnected:
        "Conecte a carteira para ver seu progresso e abrir seus resgates.",
      quickActionsTitle: "Encontre uma loja ou leia um pedido",
      quickActionsDescription:
        "Busque por nome, bairro ou categoria. Se o caixa já tiver um QR de cobrança, use a leitura para cair direto no checkout.",
      scanTitle: "Leitura de QR de pagamento",
      scanDescription:
        "Leia o QR da loja para abrir o item certo e continuar o pagamento no fluxo do app.",
      storesTitle: "Lojas disponíveis",
      storesDescription:
        "Todas usam a mesma experiência de pagamento, Selos e resgate.",
      walletCardTitle: "Carteira conectada",
      walletMiniPayDescription:
        "MiniPay oferece a jornada mais direta para pagar com stablecoins e manter a recompensa no mesmo contexto.",
      walletDisconnectedTitle: "Conecte para começar",
      walletDisconnectedDescription:
        "Sem a carteira conectada você ainda consegue explorar lojas, mas o saldo de Selos fica indisponível."
    },
    rewards: {
      eyebrow: "Carteira de resgates",
      title: "Tudo o que você já acumulou por loja.",
      description:
        "Veja o progresso de Selos, gere claims quando atingir a meta e leve o QR direto ao caixa.",
      summaryTitle: "Estado atual",
      summaryConnected: "Você tem {{claimable}} resgates prontos neste momento.",
      summaryDisconnected:
        "Conecte sua carteira para carregar os Selos de cada loja.",
      readyToClaim: "Pronto para resgatar",
      goToStore: "Abrir loja"
    },
    store: {
      eyebrow: "Pagamento e Selos",
      qrEyebrow: "Pagamento por QR",
      titleSuffix: "",
      selectItemTitle: "Escolha o item",
      selectItemDescription:
        "Selecione o pedido que deseja pagar. O progresso de Selos continua vinculado a esta loja.",
      checkoutTitle: "Resumo do checkout",
      checkoutDescription:
        "Revise o item, o valor e a regra de fidelidade antes de confirmar.",
      qrTitle: "QR do pedido",
      qrDescription:
        "Mostre este QR no balcão ou envie o link para abrir o mesmo fluxo em outro dispositivo.",
      progressTitle: "Seu progresso nesta loja",
      progressDescription:
        "Os Selos são acumulados por loja e queimados apenas quando o resgate é gerado.",
      nextStepTitle: "Próximo passo",
      nextStepDescription:
        "Quando atingir a meta, gere o QR do resgate na área de recompensas",
      openedViaQr: "Pedido aberto por QR"
    },
    claim: {
      eyebrow: "Resgate pronto",
      title: "Mostre este QR no caixa.",
      description:
        "O claim foi criado com sucesso. Agora basta apresentar o QR ou o código de apoio para validação.",
      howToUseTitle: "Como usar",
      howToUseDescription:
        "O caixa deve abrir o verificador com a carteira da loja e consumir este claim uma única vez.",
      steps: [
        "Apresente o QR ao responsável da loja.",
        "Se precisar, informe também o código de apoio.",
        "Depois da confirmação onchain, o resgate não poderá ser reutilizado."
      ]
    },
    verifier: {
      eyebrow: "Operação da loja",
      title: "Valide resgates com contexto da loja e do cliente.",
      description:
        "Se a carteira conectada gerencia uma loja, o verificador abre um painel com clientes e progresso. Caso contrário, funciona como uma validação manual de claim.",
      managedTitle: "Painel da loja",
      managedDescription:
        "Selecione a loja, procure o cliente e valide o QR do resgate quando ele estiver pronto.",
      managedStoreLabel: "Lojas gerenciadas",
      activeStoreLabel: "Loja ativa",
      customersTitle: "Clientes com Selos",
      customersDescription:
        "A lista vem do contrato e mostra o saldo atual de Selos por cliente nesta loja.",
      customerSearchPlaceholder: "Buscar por endereço do cliente",
      customersEmpty: "Nenhum cliente com histórico encontrado para esta loja.",
      selectedCustomerLabel: "Cliente selecionado",
      selectedCustomerHint:
        "Leia o QR deste cliente para validar um claim da mesma loja.",
      progressLabel: "Progresso",
      readyLabel: "Pronto para resgatar",
      collectingLabel: "Acumulando Selos",
      genericTitle: "Validação manual",
      genericDescription:
        "Use o QR ou o código do claim para verificar detalhes e confirmar o consumo com a carteira da loja.",
      scanTitle: "Leitura do QR de resgate",
      scanDescription:
        "Leia o QR gerado pelo cliente. O verificador checa loja, cliente e status antes da confirmação.",
      manualTitle: "Ou valide manualmente",
      manualDescription:
        "Cole um link, um código curto ou apenas o claimId para carregar o resgate.",
      manualPlaceholder: "Ex.: CHOI-0001 ou https://.../app?role=merchant&scanner=claim&claim=1",
      detailsTitle: "Detalhes do resgate",
      detailsDescription:
        "Confira recompensa, cliente e autorização da carteira atual antes de consumir.",
      emptyState: "Nenhum resgate carregado ainda.",
      connectStoreWallet: "Conectar carteira da loja"
    },
    success: {
      purchaseEyebrow: "Pagamento concluído",
      consumeEyebrow: "Resgate consumido",
      purchaseTitle: "Pagamento confirmado",
      consumeTitle: "Resgate confirmado",
      purchaseDescription:
        "A compra foi registrada e os Selos desta loja já foram atualizados.",
      consumeDescription:
        "O claim foi consumido onchain e não pode mais ser usado novamente.",
      purchaseDetail: "{{item}} registrado com fidelidade ativa.",
      consumeDetail: "Claim {{claimId}} validado no checkout.",
      nextStepTitle: "O que fazer agora",
      purchaseNextSteps: [
        "Abra a carteira de recompensas para acompanhar o avanço desta loja.",
        "Quando atingir a meta, gere o QR do resgate e apresente no caixa."
      ],
      consumeNextSteps: [
        "Volte para o verificador para ler outro QR ou validar manualmente.",
        "Use o explorer para conferir a confirmação da transação."
      ]
    },
    qrScanner: {
      unsupported: "A leitura por câmera não está disponível neste dispositivo.",
      openCamera: "Abrir câmera",
      ready: "Toque em Abrir câmera para permitir o acesso e começar a leitura.",
      stopCamera: "Parar leitura",
      cameraActive: "Câmera ativa",
      cameraOpenError: "Não foi possível abrir a câmera.",
      cameraPermissionDenied:
        "A câmera foi bloqueada. Toque em Abrir câmera ou revise a permissão do site no navegador.",
      cameraSecureContext:
        "A câmera só funciona em um contexto seguro. Use HTTPS ou localhost para testar.",
      cameraNotFound: "Nenhuma câmera foi encontrada neste dispositivo.",
      cameraBusy: "A câmera já está em uso por outro app ou aba."
    }
  },
  en: {
    languageName: "English",
    brand: {
      name: "noodl3",
      shortDescription:
        "Pay with stablecoins in MiniPay, track store-specific Stamps, and redeem with checkout verification."
    },
    common: {
      storesLabel: "Stores",
      rewardsLabel: "Rewards",
      verifierLabel: "Verifier",
      stampsLabel: "Stamps",
      currencyLabel: "Stablecoins",
      onchainVerified: "Onchain verified",
      miniPayNative: "MiniPay-ready",
      currentWallet: "Current wallet",
      currentBalance: "Current balance",
      reward: "Reward",
      rule: "Rule",
      minimumEligible: "Minimum eligible payment",
      transaction: "Transaction",
      status: "Status",
      manager: "Manager",
      customer: "Customer",
      customers: "Customers",
      backupCode: "Backup code",
      searchPlaceholder: "Search store, area, or category",
      loadingBalance: "loading...",
      disconnected: "disconnected",
      used: "used",
      pending: "pending",
      authorized: "authorized",
      unauthorized: "not authorized",
      contractMissing: "This network does not have a configured contract yet.",
      activity: "Activity",
      eligible: "Eligible"
    },
    nav: {
      howItWorks: "How it works",
      stores: "Stores",
      faq: "FAQ",
      app: "App",
      rewards: "Rewards",
      accessRewards: "Access rewards",
      openApp: "Open app"
    },
    actions: {
      accessRewards: "Access rewards",
      openApp: "Open app",
      exploreStores: "Explore stores",
      connectWallet: "Connect wallet",
      disconnectWallet: "Disconnect",
      openScanner: "Scan QR",
      closeScanner: "Close scanner",
      payNow: "Pay now",
      payAndEarn: "Pay and earn Stamps",
      claimNow: "Claim now",
      consumeReward: "Confirm reward",
      copyLink: "Copy link",
      openVerifier: "Open verifier",
      openExplorer: "Open explorer",
      backToStore: "Back to store",
      backToRewards: "Back to rewards",
      backToVerifier: "Back to verifier",
      viewStore: "View store",
      openPurchaseFlow: "Open payment flow",
      checkClaim: "Check claim",
      readRewardQr: "Read reward QR",
      clearSelection: "Clear selection",
      switchNetwork: "Switch network",
      refreshNetwork: "I switched already"
    },
    messages: {
      noWalletFound: "No compatible wallet was found.",
      couldNotConnectWallet: "Could not connect the wallet.",
      switchWalletRequired: "Switch to {{network}} to continue.",
      miniPayWrongNetwork: "Open the app in {{network}} inside MiniPay.",
      couldNotSwitchNetwork: "Could not switch the network.",
      unsupportedNetwork: "Unsupported network.",
      qrMismatch: "The scanned QR does not point to a valid noodl3 payment.",
      invalidClaimId: "Could not identify a valid claim.",
      claimNotFound: "Claim not found.",
      rewardNotFound: "Reward not found.",
      storeNotReady: "This store has not been configured on this network yet.",
      purchaseFailed: "Could not complete the payment.",
      claimFailed: "Could not create the claim.",
      consumeFailed: "Could not confirm the claim.",
      claimLookupFirst: "Scan a QR or enter a code before confirming.",
      claimCreatedMissing:
        "The transaction succeeded, but the emitted claimId could not be found.",
      allowanceCheck: "Checking payment allowance...",
      approving: "Approving the token for this payment...",
      sendingPayment: "Sending payment and recording Stamps...",
      claimWrongStore: "This claim belongs to a different store.",
      claimWrongCustomer: "This claim belongs to a different customer.",
      claimAlreadyUsed: "This claim has already been used.",
      noManagedStores: "No store managed by this wallet was found.",
      wrongNetworkDescription:
        "Switch your wallet to the required network before paying, claiming, or validating inside noodl3.",
      wrongNetworkMiniPayDescription:
        "MiniPay is on the wrong network for this app. Open MiniPay settings, switch to the expected network, and come back to continue.",
      genericActionFailed: "Something went wrong. Please try again later.",
      walletActionRejected: "You cancelled the wallet action.",
      insufficientBalance: "Insufficient balance to complete this payment.",
      invalidProfileInput:
        "Use a valid display name and, if you want, a photo with an https:// link.",
      notEnoughStamps: "You do not have enough Stamps to claim this reward yet.",
      profileContractOutdated:
        "The current contract does not support onchain profiles yet. Deploy the latest version and update the app contract address."
    },
    landing: {
      eyebrow: "Loyalty made for repeat local spend",
      title: "Pay with stablecoins, collect Stamps, and redeem with a clean checkout flow.",
      description:
        "noodl3 keeps discovery, payment, and rewards in the same experience. Users find a store, pick an item or scan a purchase QR, pay with MiniPay, and track store-specific progress without extra friction.",
      stats: ["MiniPay + stablecoins", "Store-based Stamps", "Verifier QR redemption"],
      valueTitle: "Built for repeat visits",
      valueDescription:
        "The journey stays short and predictable for both the customer and the cashier. No speculative token, no NFT explanation required.",
      valuePoints: [
        "USDT, USDC, and cUSD with the same checkout journey.",
        "Non-transferable store-specific Stamps.",
        "Claims consumed onchain at the moment of redemption."
      ],
      howTitle: "How it works",
      howDescription:
        "The product is designed for repeat food and drink purchases with very little friction and clear redemption rules.",
      steps: [
        {
          title: "Pay",
          description:
            "Choose the store, select the item or scan a purchase QR, and complete the payment with the stablecoin you prefer."
        },
        {
          title: "Collect Stamps",
          description:
            "Every eligible payment adds Stamps to that store and updates the user's progress."
        },
        {
          title: "Redeem",
          description:
            "Once the threshold is reached, the customer generates a claim QR and the cashier consumes it at checkout."
        }
      ],
      storesTitle: "Active stores in the app",
      storesDescription:
        "Each store sets its own Stamp rule and reward, while the customer flow stays familiar across the app.",
      trustTitle: "Why it works better",
      trustDescription:
        "The product keeps operations simple for the store and clear for the customer.",
      trustBullets: [
        "Payment and loyalty in the same surface.",
        "Onchain verification for accrual, claim, and consumption.",
        "UX designed for repeat use, not long onboarding."
      ],
      faqTitle: "Quick answers",
      faqs: [
        {
          question: "Do users need to pick a token?",
          answer: "No. The flow accepts the main Celo stablecoins without changing the UX."
        },
        {
          question: "Can Stamps be transferred to another wallet?",
          answer: "No. Progress stays attached to the user and the store where the purchase happened."
        },
        {
          question: "How does the cashier validate a reward?",
          answer: "The customer generates a QR with the claimId and the store manager consumes that claim in the verifier."
        }
      ],
      footerTitle: "Jump straight into the rewards flow",
      footerDescription:
        "Open the app, connect your wallet, and keep track of store progress in just a few taps."
    },
    dashboard: {
      eyebrow: "Customer view",
      title: "Your stores, your Stamps, and your next payments.",
      description:
        "Use the connected wallet to track rewards, open a payment by QR, and keep buying from participating stores.",
      rewardsCardTitle: "Rewards snapshot",
      rewardsConnected: "You have {{claimable}} rewards ready and {{stamps}} total Stamps across stores.",
      rewardsDisconnected:
        "Connect your wallet to view progress and unlock your rewards.",
      quickActionsTitle: "Find a store or scan a payment",
      quickActionsDescription:
        "Search by name, area, or category. If the cashier already has a purchase QR, scan it to jump straight into checkout.",
      scanTitle: "Payment QR scanner",
      scanDescription:
        "Scan the store QR to open the right item and continue through the same payment flow.",
      storesTitle: "Available stores",
      storesDescription:
        "Every store uses the same payment, Stamp, and redemption experience.",
      walletCardTitle: "Connected wallet",
      walletMiniPayDescription:
        "MiniPay is the fastest way to pay with stablecoins and keep rewards in the same context.",
      walletDisconnectedTitle: "Connect to start",
      walletDisconnectedDescription:
        "You can still explore stores, but reward balances stay unavailable until a wallet is connected."
    },
    rewards: {
      eyebrow: "Rewards wallet",
      title: "Everything you have already collected by store.",
      description:
        "Review Stamp progress, generate claims when thresholds are reached, and take the QR straight to the cashier.",
      summaryTitle: "Current status",
      summaryConnected: "You have {{claimable}} rewards ready right now.",
      summaryDisconnected:
        "Connect your wallet to load the Stamps from each store.",
      readyToClaim: "Ready to claim",
      goToStore: "Open store"
    },
    store: {
      eyebrow: "Payment and Stamps",
      qrEyebrow: "QR payment",
      titleSuffix: "",
      selectItemTitle: "Choose an item",
      selectItemDescription:
        "Select what you want to pay for. Stamp progress remains tied to this store.",
      checkoutTitle: "Checkout summary",
      checkoutDescription:
        "Review the item, the amount, and the loyalty rule before confirming.",
      qrTitle: "Purchase QR",
      qrDescription:
        "Show this QR at the counter or share the link to open the same payment flow elsewhere.",
      progressTitle: "Your progress at this store",
      progressDescription:
        "Stamps accumulate per store and are only burned when a claim is generated.",
      nextStepTitle: "Next step",
      nextStepDescription:
        "Once you reach the threshold, generate the reward QR from your rewards wallet",
      openedViaQr: "Opened from QR"
    },
    claim: {
      eyebrow: "Reward ready",
      title: "Show this QR at checkout.",
      description:
        "The claim was created successfully. Now present the QR or the backup code for validation.",
      howToUseTitle: "How to use it",
      howToUseDescription:
        "The store manager should open the verifier with the store wallet and consume this claim once.",
      steps: [
        "Show the QR to the cashier.",
        "If needed, also provide the backup code.",
        "Once confirmed onchain, the reward cannot be reused."
      ]
    },
    verifier: {
      eyebrow: "Store operations",
      title: "Validate reward claims with store and customer context.",
      description:
        "If the connected wallet manages a store, the verifier opens a customer dashboard. Otherwise it works as a manual claim checker.",
      managedTitle: "Store dashboard",
      managedDescription:
        "Select a store, find the customer, and validate the reward QR when they are ready to redeem.",
      managedStoreLabel: "Managed stores",
      activeStoreLabel: "Active store",
      customersTitle: "Customers with Stamps",
      customersDescription:
        "The list comes from the contract and shows current Stamp balances for this store.",
      customerSearchPlaceholder: "Search by customer address",
      customersEmpty: "No customer history found for this store yet.",
      selectedCustomerLabel: "Selected customer",
      selectedCustomerHint:
        "Scan this customer's reward QR to validate a claim for the same store.",
      progressLabel: "Progress",
      readyLabel: "Ready to claim",
      collectingLabel: "Collecting Stamps",
      genericTitle: "Manual validation",
      genericDescription:
        "Use a claim QR or a short code to load the reward and confirm consumption with the store wallet.",
      scanTitle: "Reward QR scanner",
      scanDescription:
        "Scan the QR generated by the customer. The verifier checks store, customer, and claim status before confirmation.",
      manualTitle: "Or validate manually",
      manualDescription:
        "Paste a link, a short code, or just the claimId to load a reward.",
      manualPlaceholder: "Ex.: CHOI-0001 or https://.../app?role=merchant&scanner=claim&claim=1",
      detailsTitle: "Reward details",
      detailsDescription:
        "Review the reward, the customer, and the current wallet authorization before consuming.",
      emptyState: "No reward loaded yet.",
      connectStoreWallet: "Connect store wallet"
    },
    success: {
      purchaseEyebrow: "Purchase completed",
      consumeEyebrow: "Reward consumed",
      purchaseTitle: "Payment confirmed",
      consumeTitle: "Reward confirmed",
      purchaseDescription:
        "The purchase was recorded and the store Stamp balance was updated.",
      consumeDescription:
        "The claim was consumed onchain and cannot be used again.",
      purchaseDetail: "{{item}} recorded with loyalty enabled.",
      consumeDetail: "Claim {{claimId}} confirmed at checkout.",
      nextStepTitle: "What to do next",
      purchaseNextSteps: [
        "Open Rewards to track progress for this store.",
        "When you reach the threshold, generate the claim QR and present it at checkout."
      ],
      consumeNextSteps: [
        "Return to the verifier to scan another QR or validate manually.",
        "Use the explorer to confirm the transaction if needed."
      ]
    },
    qrScanner: {
      unsupported: "Camera-based scanning is not available on this device.",
      openCamera: "Open camera",
      ready: "Tap Open camera to allow access and start scanning.",
      stopCamera: "Stop scanning",
      cameraActive: "Camera active",
      cameraOpenError: "Could not open the camera.",
      cameraPermissionDenied:
        "Camera access was blocked. Tap Open camera or review this site's permission in your browser.",
      cameraSecureContext:
        "Camera access only works in a secure context. Use HTTPS or localhost when testing.",
      cameraNotFound: "No camera was found on this device.",
      cameraBusy: "The camera is already in use by another app or tab."
    }
  }
};

type CookieSource = {
  get?: (name: string) => { value?: string } | string | undefined | null;
};

type HeaderSource = {
  get?: (name: string) => string | null | undefined;
};

export function normalizeLocale(value?: string | null): Locale {
  const candidate = value?.trim().toLowerCase();

  if (!candidate) {
    return DEFAULT_LOCALE;
  }

  if (candidate.startsWith("pt")) {
    return "pt-BR";
  }

  if (candidate.startsWith("en")) {
    return "en";
  }

  return DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function resolveLocaleFromRequest(
  cookieStore?: CookieSource | null,
  headerStore?: HeaderSource | null
): Locale {
  const rawCookie = cookieStore?.get?.(LOCALE_COOKIE_NAME);
  const cookieValue =
    typeof rawCookie === "string"
      ? rawCookie
      : typeof rawCookie === "object" && rawCookie !== null
        ? rawCookie.value
        : undefined;

  if (cookieValue) {
    return normalizeLocale(cookieValue);
  }

  const acceptLanguage = headerStore?.get?.("accept-language");
  if (acceptLanguage) {
    return normalizeLocale(acceptLanguage.split(",")[0]);
  }

  return DEFAULT_LOCALE;
}

export function getRuntimeLocale(): Locale {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]+)`)
    );
    if (match?.[1]) {
      return normalizeLocale(decodeURIComponent(match[1]));
    }
  }

  if (typeof navigator !== "undefined") {
    return normalizeLocale(navigator.language);
  }

  return DEFAULT_LOCALE;
}

export function getRuntimeDictionary(): Dictionary {
  return getDictionary(getRuntimeLocale());
}

export function interpolate(
  template: string,
  values: Record<string, string | number>
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template
  );
}
