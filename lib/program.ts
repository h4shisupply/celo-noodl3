import type { Hex } from "viem";
import type { Locale } from "./i18n";

export function parseProgramId(value: string | number | bigint | null | undefined) {
  if (value === null || value === undefined || value === "") return null;

  try {
    const programId = BigInt(value);
    return programId > 0n ? programId : null;
  } catch {
    return null;
  }
}

export function formatProgramCode(programId: bigint | number) {
  return `P-${programId.toString().padStart(4, "0")}`;
}

export function formatClaimCode(claimId: bigint | number) {
  return `R-${claimId.toString().padStart(4, "0")}`;
}

export function buildProgramUrl(appUrl: string, programId: bigint | number) {
  return new URL(`/app/program/${programId.toString()}`, appUrl).toString();
}

export function buildStaticVisitUrl(appUrl: string, programId: bigint | number) {
  const url = new URL(`/app/program/${programId.toString()}`, appUrl);
  url.searchParams.set("visit", "static");
  return url.toString();
}

export function buildDynamicVisitUrl(params: {
  appUrl: string;
  programId: bigint | number;
  nonce: Hex;
  expiresAt: bigint;
  signature: Hex;
}) {
  const url = new URL(`/app/program/${params.programId.toString()}`, params.appUrl);
  url.searchParams.set("visit", "dynamic");
  url.searchParams.set("nonce", params.nonce);
  url.searchParams.set("expires", params.expiresAt.toString());
  url.searchParams.set("sig", params.signature);
  return url.toString();
}

export function buildClaimUrl(appUrl: string, claimId: bigint | number) {
  return new URL(`/app/claim/${claimId.toString()}`, appUrl).toString();
}

export function formatQrLinkLabel(value: string) {
  try {
    const url = new URL(value);
    return `${url.host}${url.pathname}${url.search}`;
  } catch {
    return value;
  }
}

export function parseDynamicVisitExpiresAt(value: string | null | undefined) {
  const parsed = parseProgramId(value);
  return parsed ? Number(parsed) : null;
}

export function parseProgramUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/app\/program\/(\d+)$/);
    return match ? BigInt(match[1]) : null;
  } catch {
    const match = trimmed.match(/program\/(\d+)/);
    return match ? BigInt(match[1]) : null;
  }
}

export function formatDateTime(timestamp: number, locale: Locale) {
  if (!timestamp) return "-";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(timestamp * 1000));
}

export function programCopy(locale: Locale) {
  return locale === "en" ? enProgramCopy : ptProgramCopy;
}

const enProgramCopy = {
  appTitle: "Merchant QR stamp cards for real-world visits",
  appDescription:
    "Create a merchant QR stamp card, collect visit stamps with QR codes, and validate reward tickets without paper cards or counter confusion.",
  createProgram: "Create QR stamp card",
  scanQr: "Scan visit QR",
  invalidProgramQr: "This is not a noodl3 visit QR.",
  myCards: "My QR stamp cards",
  myPrograms: "QR stamp cards I manage",
  rewardClaims: "Reward tickets",
  refreshDashboard: "Refresh dashboard",
  refreshingDashboard: "Refreshing dashboard...",
  emptyCards: "Scan a visit QR and your first QR stamp card will appear here.",
  emptyPrograms: "Create a merchant QR stamp card for a shop or community and it will appear here.",
  emptyClaims: "Completed QR stamp cards become reward tickets for the shop owner to validate.",
  manage: "Manage QR stamp card",
  openCard: "Open QR stamp card",
  openTicket: "Open ticket",
  collectVisit: "Collect visit stamp",
  collectingVisit: "Collecting visit stamp...",
  requestStamp: "Stamp this visit",
  requestingStamp: "Stamping this visit...",
  requestSent: "Visit stamp added.",
  dynamicCollected: "Live QR visit stamp added.",
  claimReward: "Create reward ticket",
  creatingRewardTicket: "Creating reward ticket...",
  rewardClaimed: "Reward ticket created.",
  createTitle: "Create merchant QR stamp card",
  createDescription: "Set the shop look, reward promise, and visit goal.",
  programName: "Shop or card name",
  programNamePlaceholder: "Coffee Club",
  iconUrl: "Logo URL",
  iconUrlPlaceholder: "https://example.com/logo.png",
  iconUrlHelp: "Use a public HTTPS image URL. Square logos look best.",
  rewardDescription: "Reward promise",
  rewardPlaceholder: "Free espresso on visit 10",
  visitsRequired: "Visit goal",
  active: "Active",
  activeHelp: "Customers can collect visit stamps and create reward tickets while this is on.",
  staticStampEnabled: "Counter QR visit stamps",
  staticStampHelp: "Let each wallet collect one visit stamp from the printed QR every 20 hours.",
  saveProgram: "Save QR stamp card",
  savingProgram: "Saving QR stamp card...",
  programCreated: "QR stamp card created.",
  fixedQr: "Counter visit QR",
  dynamicQr: "Live check-in QR",
  generateDynamicQr: "Generate live QR",
  generatingDynamicQr: "Generating live QR...",
  dynamicQrReady: "Live QR is ready for the next customer.",
  nextStaticStamp: "Next counter-QR stamp",
  customers: "Visit stamp collectors",
  settings: "Settings",
  issueManual: "Add manual visit stamp",
  issuingManualStamp: "Adding manual visit stamp...",
  consume: "Validate ticket",
  consumingRewardTicket: "Validating ticket...",
  customerWallet: "Customer wallet",
  updateProgram: "Update QR stamp card",
  updatingProgram: "Updating QR stamp card...",
  settingsSaved: "QR stamp card settings saved.",
  manualIssued: "Manual visit stamp added to the customer wallet.",
  rewardConsumed: "Reward ticket validated.",
  noContract: "Set the noodl3 contract address before using the app.",
  connectFirst: "Connect your wallet to load your QR stamp cards.",
  notFound: "QR stamp card not found.",
  inactive: "Inactive",
  stamps: "visit stamps",
  visits: "visits",
  ready: "Ready for reward",
  collecting: "Collecting visit stamps",
  staticQrHelp: "Print this visit QR for the counter. Each wallet can collect one visit stamp every 20 hours.",
  dynamicQrHelp: "Use this live QR for check-ins guided by the shop owner. It expires in five minutes and works once.",
  claimTitle: "Reward ticket",
  claimDescription: "Show this QR to the shop owner so they can validate the reward once.",
  validateClaim: "Validate ticket",
  claimConsumed: "Ticket validated.",
  usedClaim: "This reward ticket is already used.",
  ownerOnly: "Only the shop owner wallet can manage this QR stamp card.",
  invalidIconUrl: "Use a square public HTTPS logo image URL.",
  invalidProgramConfig: "Use a name up to 60 characters, a square public HTTPS logo image URL, a reward up to 120 characters, and 1-100 visits.",
  previewCard: "Preview QR card",
  previewProgramName: "Your shop or card name",
  previewReward: "Your reward promise appears here.",
  loadingProgram: "Loading this QR stamp card from the contract.",
  loadingClaim: "Checking this reward ticket onchain.",
  qrCopy: "Copy link",
  qrCopied: "Link copied.",
  qrShare: "Share",
  qrDownload: "Download QR",
  qrPrint: "Print QR sheet",
  qrOpen: "Open",
  qrShareUnavailable: "Sharing is not available in this browser. Copy the link instead.",
  printedSheetTitle: "Counter QR sheet",
  printedSheetDescription: "Place this at the counter so customers can scan and collect a visit stamp.",
  staticQrRule: "One visit stamp per wallet every 20 hours.",
  liveQrExpiresIn: "Expires in",
  liveQrExpired: "Live QR expired",
  regenerateDynamicQr: "Regenerate live QR",
  dynamicQrInactive: "Turn the card on before generating a live QR.",
  dynamicQrOneUse: "This QR expires in five minutes and works for one customer.",
  invalidVisitQr: "This live QR is missing visit data. Ask the shop owner for a fresh QR.",
  dynamicExpiredHelp: "This live QR expired. Ask the shop owner for a new one.",
  staticDisabledHelp: "Counter QR visit stamps are off for this card.",
  backupCode: "Backup code",
  ticketReady: "Ready to validate",
  ticketUsed: "Already used",
  ownerValidationHint: "Connect the shop owner wallet to validate this ticket.",
  validatingClaim: "Validating ticket...",
  rewardTicketSheet: "Reward ticket"
};

const ptProgramCopy = {
  appTitle: "Cartões de selos para visitas reais",
  appDescription:
    "Crie um cartão de selos na carteira, carimbe visitas reais com QR codes e valide tickets sem papel nem confusão no balcão.",
  createProgram: "Criar cartão de selos",
  scanQr: "Ler QR de visita",
  invalidProgramQr: "Este não é um QR de visita do noodl3.",
  myCards: "Meus cartões de selos",
  myPrograms: "Cartões que gerencio",
  rewardClaims: "Tickets de recompensa",
  refreshDashboard: "Atualizar dashboard",
  refreshingDashboard: "Atualizando dashboard...",
  emptyCards: "Leia um QR de visita e seu primeiro cartão de selos aparece aqui.",
  emptyPrograms: "Crie um cartão de selos para uma loja ou comunidade e ele aparece aqui.",
  emptyClaims: "Cartões de selos completos viram tickets para o lojista validar.",
  manage: "Gerenciar cartão de selos",
  openCard: "Abrir cartão de selos",
  openTicket: "Abrir ticket",
  collectVisit: "Coletar selo de visita",
  collectingVisit: "Coletando selo de visita...",
  requestStamp: "Carimbar esta visita",
  requestingStamp: "Carimbando esta visita...",
  requestSent: "Selo de visita adicionado.",
  dynamicCollected: "Selo de visita do QR ao vivo adicionado.",
  claimReward: "Criar ticket de recompensa",
  creatingRewardTicket: "Criando ticket de recompensa...",
  rewardClaimed: "Ticket de recompensa gerado.",
  createTitle: "Criar cartão de selos",
  createDescription: "Defina a cara da loja, a recompensa prometida e quantas visitas completam o cartão.",
  programName: "Nome da loja ou do cartão",
  programNamePlaceholder: "Clube do Café",
  iconUrl: "URL do logo",
  iconUrlPlaceholder: "https://example.com/logo.png",
  iconUrlHelp: "Use uma URL HTTPS pública. Logos quadrados ficam melhores.",
  rewardDescription: "Promessa da recompensa",
  rewardPlaceholder: "Espresso grátis na visita 10",
  visitsRequired: "Visitas para completar",
  active: "Ativo",
  activeHelp: "Clientes podem coletar selos de visita e criar tickets de recompensa enquanto estiver ligado.",
  staticStampEnabled: "Selos de visita pelo QR de balcão",
  staticStampHelp: "Permite que cada carteira colete um selo de visita pelo QR impresso a cada 20 horas.",
  saveProgram: "Salvar cartão de selos",
  savingProgram: "Salvando cartão de selos...",
  programCreated: "Cartão de selos criado.",
  fixedQr: "QR de visita no balcão",
  dynamicQr: "QR ao vivo de check-in",
  generateDynamicQr: "Gerar QR ao vivo",
  generatingDynamicQr: "Gerando QR ao vivo...",
  dynamicQrReady: "QR ao vivo pronto para o próximo cliente.",
  nextStaticStamp: "Próximo selo pelo QR de balcão",
  customers: "Colecionadores de selos de visita",
  settings: "Configurações",
  issueManual: "Adicionar selo de visita manual",
  issuingManualStamp: "Adicionando selo de visita manual...",
  consume: "Validar ticket",
  consumingRewardTicket: "Validando ticket...",
  customerWallet: "Carteira do cliente",
  updateProgram: "Atualizar cartão de selos",
  updatingProgram: "Atualizando cartão de selos...",
  settingsSaved: "Configurações do cartão de selos salvas.",
  manualIssued: "Selo de visita manual adicionado à carteira do cliente.",
  rewardConsumed: "Ticket de recompensa validado.",
  noContract: "Configure o endereço do contrato noodl3 antes de usar o app.",
  connectFirst: "Conecte sua carteira para carregar seus cartões de selos.",
  notFound: "Cartão de selos não encontrado.",
  inactive: "Inativo",
  stamps: "selos de visita",
  visits: "visitas",
  ready: "Recompensa pronta",
  collecting: "Colecionando selos de visita",
  staticQrHelp: "Imprima este QR de visita para o balcão. Cada carteira coleta um selo de visita a cada 20 horas.",
  dynamicQrHelp: "Use este QR ao vivo para check-ins guiados pelo lojista. Expira em cinco minutos e funciona uma vez.",
  claimTitle: "Ticket de recompensa",
  claimDescription: "Mostre este QR para o lojista validar a recompensa uma vez.",
  validateClaim: "Validar ticket",
  claimConsumed: "Ticket validado.",
  usedClaim: "Este ticket de recompensa já foi usado.",
  ownerOnly: "Só a carteira do lojista pode gerenciar este cartão de selos.",
  invalidIconUrl: "Use uma URL HTTPS pública de imagem para um logo quadrado.",
  invalidProgramConfig: "Use um nome com até 60 caracteres, uma URL HTTPS pública de imagem para um logo quadrado, uma recompensa com até 120 caracteres e 1-100 visitas.",
  previewCard: "Prévia do cartão de selos",
  previewProgramName: "Nome da loja ou do cartão",
  previewReward: "A promessa da recompensa aparece aqui.",
  loadingProgram: "Carregando este cartão de selos no contrato.",
  loadingClaim: "Conferindo este ticket de recompensa onchain.",
  qrCopy: "Copiar link",
  qrCopied: "Link copiado.",
  qrShare: "Compartilhar",
  qrDownload: "Baixar QR",
  qrPrint: "Imprimir folha QR",
  qrOpen: "Abrir",
  qrShareUnavailable: "Compartilhamento indisponível neste navegador. Copie o link.",
  printedSheetTitle: "Folha QR de balcão",
  printedSheetDescription: "Deixe no balcão para clientes lerem e coletarem um selo de visita.",
  staticQrRule: "Um selo de visita por carteira a cada 20 horas.",
  liveQrExpiresIn: "Expira em",
  liveQrExpired: "QR ao vivo expirou",
  regenerateDynamicQr: "Gerar novo QR ao vivo",
  dynamicQrInactive: "Ative o cartão antes de gerar um QR ao vivo.",
  dynamicQrOneUse: "Este QR expira em cinco minutos e funciona para um cliente.",
  invalidVisitQr: "Este QR ao vivo está sem dados da visita. Peça um QR novo ao lojista.",
  dynamicExpiredHelp: "Este QR ao vivo expirou. Peça um novo QR ao lojista.",
  staticDisabledHelp: "Selos pelo QR de balcão estão desligados neste cartão.",
  backupCode: "Código de apoio",
  ticketReady: "Pronto para validar",
  ticketUsed: "Já usado",
  ownerValidationHint: "Conecte a carteira do lojista para validar este ticket.",
  validatingClaim: "Validando ticket...",
  rewardTicketSheet: "Ticket de recompensa"
};
