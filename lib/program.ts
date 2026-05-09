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
  appTitle: "Stamp cards that travel with the wallet",
  appDescription:
    "Create a playful Web3 pass, stamp real visits with QR codes, and validate rewards without paper cards or checkout clutter.",
  createProgram: "Create card",
  scanQr: "Scan QR",
  invalidProgramQr: "This is not a noodl3 stamp-card QR.",
  myCards: "Cards I collect",
  myPrograms: "Cards I run",
  rewardClaims: "Reward tickets",
  emptyCards: "Scan a shop QR and your first stamp card will land here.",
  emptyPrograms: "Cards you create for a shop or community will appear here.",
  emptyClaims: "Finished cards turn into reward tickets you can show at the counter.",
  manage: "Manage",
  openCard: "Open card",
  collectVisit: "Add visit stamp",
  requestStamp: "Stamp this visit",
  requestSent: "Visit stamped.",
  dynamicCollected: "Live QR stamp collected.",
  claimReward: "Create reward ticket",
  rewardClaimed: "Reward ticket created.",
  createTitle: "Create a stamp card",
  createDescription: "Pick the shop look, reward, and how many visits fill the card.",
  programName: "Program name",
  programNamePlaceholder: "Coffee Club",
  iconUrl: "Icon URL",
  iconUrlHelp: "Use a public HTTPS image URL. Square logos work best.",
  rewardDescription: "Reward",
  rewardPlaceholder: "Free espresso after the 10th visit",
  visitsRequired: "Visits required",
  active: "Active",
  activeHelp: "Customers can collect stamps and claim rewards while this is on.",
  staticStampEnabled: "Daily QR stamps",
  staticStampHelp: "Let each wallet collect from the printed QR once every 20 hours.",
  saveProgram: "Save card",
  programCreated: "Stamp card created.",
  fixedQr: "Printed visit QR",
  dynamicQr: "Live visit QR",
  generateDynamicQr: "Generate live QR",
  dynamicQrReady: "Live QR ready for the next customer.",
  nextStaticStamp: "Next printed-QR stamp",
  customers: "Customers",
  settings: "Settings",
  issueManual: "Give manual stamp",
  consume: "Use reward",
  customerWallet: "Customer wallet",
  updateProgram: "Update card",
  settingsSaved: "Card settings saved.",
  manualIssued: "Manual stamp issued.",
  rewardConsumed: "Reward used.",
  noContract: "Set the Noodl3 contract address before using the app.",
  connectFirst: "Connect your wallet to continue.",
  notFound: "Program not found.",
  inactive: "Inactive",
  stamps: "stamps",
  visits: "visits",
  ready: "Ready",
  collecting: "Collecting",
  staticQrHelp: "Print this QR for the counter. Each wallet can collect once every 20 hours.",
  dynamicQrHelp: "Use this for owner-led live check-ins. It expires in five minutes and works once.",
  claimTitle: "Reward ticket",
  claimDescription: "Show this QR to the program owner so they can mark the reward as used.",
  validateClaim: "Use ticket",
  claimConsumed: "Ticket used.",
  usedClaim: "This reward ticket has already been used.",
  ownerOnly: "Only the program owner can manage this program.",
  invalidIconUrl: "Use a public HTTPS icon URL.",
  invalidProgramConfig: "Use a name up to 60 characters, an HTTPS icon URL, a reward up to 120 characters, and 1-100 visits.",
  previewCard: "Preview card",
  previewProgramName: "Your shop name",
  previewReward: "Your reward promise appears here.",
  loadingProgram: "Getting the latest card details from the contract.",
  loadingClaim: "Checking this reward ticket on-chain.",
  qrCopy: "Copy link",
  qrCopied: "Link copied.",
  qrShare: "Share",
  qrDownload: "Download QR",
  qrPrint: "Print sheet",
  qrOpen: "Open",
  qrShareUnavailable: "Sharing is not available in this browser. Copy the link instead.",
  printedSheetTitle: "Counter stamp sheet",
  printedSheetDescription: "Put this by the register so customers can scan and stamp their visit.",
  staticQrRule: "One stamp per wallet every 20 hours.",
  liveQrExpiresIn: "Expires in",
  liveQrExpired: "Live QR expired",
  regenerateDynamicQr: "Regenerate live QR",
  dynamicQrInactive: "Turn the card active before generating a live QR.",
  dynamicQrOneUse: "This QR expires in five minutes and works for one customer.",
  invalidVisitQr: "This live QR is missing required visit data. Ask the owner to generate a fresh QR.",
  dynamicExpiredHelp: "This live QR has expired. Ask the owner for a new one.",
  staticDisabledHelp: "Printed QR stamps are currently disabled for this card.",
  backupCode: "Backup code",
  ticketReady: "Ready to validate",
  ticketUsed: "Already used",
  ownerValidationHint: "Connect the program owner wallet to use this ticket.",
  rewardTicketSheet: "Reward ticket"
};

const ptProgramCopy = {
  appTitle: "Cartões de selos que viajam com a carteira",
  appDescription:
    "Crie um passe Web3 divertido, carimbe visitas reais com QR codes e valide recompensas sem cartão de papel nem checkout confuso.",
  createProgram: "Criar cartão",
  scanQr: "Ler QR",
  invalidProgramQr: "Este não é um QR de cartão de selos do noodl3.",
  myCards: "Cartões que coleciono",
  myPrograms: "Cartões que administro",
  rewardClaims: "Tickets de recompensa",
  emptyCards: "Leia o QR de uma loja e seu primeiro cartão de selos aparece aqui.",
  emptyPrograms: "Cartões que você cria para uma loja ou comunidade aparecem aqui.",
  emptyClaims: "Cartões completos viram tickets de recompensa para mostrar no balcão.",
  manage: "Gerenciar",
  openCard: "Abrir cartão",
  collectVisit: "Adicionar selo",
  requestStamp: "Carimbar visita",
  requestSent: "Visita carimbada.",
  dynamicCollected: "Selo do QR ao vivo coletado.",
  claimReward: "Criar ticket",
  rewardClaimed: "Ticket de recompensa criado.",
  createTitle: "Criar cartão de selos",
  createDescription: "Escolha a cara da loja, a recompensa e quantas visitas completam o cartão.",
  programName: "Nome do programa",
  programNamePlaceholder: "Clube do Café",
  iconUrl: "URL do ícone",
  iconUrlHelp: "Use uma URL HTTPS pública. Logos quadrados funcionam melhor.",
  rewardDescription: "Recompensa",
  rewardPlaceholder: "Espresso grátis na 10ª visita",
  visitsRequired: "Visitas necessárias",
  active: "Ativo",
  activeHelp: "Clientes podem coletar selos e pedir recompensas enquanto estiver ligado.",
  staticStampEnabled: "Selos diários por QR",
  staticStampHelp: "Permite que cada carteira carimbe pelo QR impresso uma vez a cada 20 horas.",
  saveProgram: "Salvar cartão",
  programCreated: "Cartão de selos criado.",
  fixedQr: "QR impresso de visita",
  dynamicQr: "QR ao vivo de visita",
  generateDynamicQr: "Gerar QR ao vivo",
  dynamicQrReady: "QR ao vivo pronto para o próximo cliente.",
  nextStaticStamp: "Próximo selo pelo QR impresso",
  customers: "Clientes",
  settings: "Configurações",
  issueManual: "Dar selo manual",
  consume: "Usar recompensa",
  customerWallet: "Carteira do cliente",
  updateProgram: "Atualizar cartão",
  settingsSaved: "Configurações do cartão salvas.",
  manualIssued: "Selo manual emitido.",
  rewardConsumed: "Recompensa usada.",
  noContract: "Configure o endereço do contrato Noodl3 antes de usar o app.",
  connectFirst: "Conecte sua carteira para continuar.",
  notFound: "Programa não encontrado.",
  inactive: "Inativo",
  stamps: "selos",
  visits: "visitas",
  ready: "Pronto",
  collecting: "Coletando",
  staticQrHelp: "Imprima este QR para o balcão. Cada carteira coleta uma vez a cada 20 horas.",
  dynamicQrHelp: "Use em check-ins ao vivo com o dono. Expira em cinco minutos e funciona uma vez.",
  claimTitle: "Ticket de recompensa",
  claimDescription: "Mostre este QR para o dono do programa marcar a recompensa como usada.",
  validateClaim: "Usar ticket",
  claimConsumed: "Ticket usado.",
  usedClaim: "Este ticket de recompensa já foi usado.",
  ownerOnly: "Só o dono do programa pode gerenciar este programa.",
  invalidIconUrl: "Use uma URL HTTPS pública para o ícone.",
  invalidProgramConfig: "Use um nome com até 60 caracteres, uma URL HTTPS de ícone, uma recompensa com até 120 caracteres e 1-100 visitas.",
  previewCard: "Prévia do cartão",
  previewProgramName: "Nome da sua loja",
  previewReward: "A promessa da recompensa aparece aqui.",
  loadingProgram: "Buscando os detalhes mais recentes do cartão no contrato.",
  loadingClaim: "Conferindo este ticket de recompensa on-chain.",
  qrCopy: "Copiar link",
  qrCopied: "Link copiado.",
  qrShare: "Compartilhar",
  qrDownload: "Baixar QR",
  qrPrint: "Imprimir folha",
  qrOpen: "Abrir",
  qrShareUnavailable: "Compartilhamento indisponível neste navegador. Copie o link.",
  printedSheetTitle: "Folha de balcão",
  printedSheetDescription: "Deixe no caixa para clientes lerem e carimbarem a visita.",
  staticQrRule: "Um selo por carteira a cada 20 horas.",
  liveQrExpiresIn: "Expira em",
  liveQrExpired: "QR ao vivo expirou",
  regenerateDynamicQr: "Gerar novo QR ao vivo",
  dynamicQrInactive: "Ative o cartão antes de gerar um QR ao vivo.",
  dynamicQrOneUse: "Este QR expira em cinco minutos e funciona para um cliente.",
  invalidVisitQr: "Este QR ao vivo está sem dados obrigatórios da visita. Peça ao dono para gerar um novo QR.",
  dynamicExpiredHelp: "Este QR ao vivo expirou. Peça um novo QR ao dono.",
  staticDisabledHelp: "Selos pelo QR impresso estão desativados neste cartão.",
  backupCode: "Código de apoio",
  ticketReady: "Pronto para validar",
  ticketUsed: "Já usado",
  ownerValidationHint: "Conecte a carteira dona do programa para usar este ticket.",
  rewardTicketSheet: "Ticket de recompensa"
};
