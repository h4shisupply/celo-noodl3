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
  appTitle: "Wallet stamp cards for real visits",
  appDescription:
    "Create a cheerful wallet stamp card, stamp real visits with QR codes, and validate reward tickets without paper cards or counter confusion.",
  createProgram: "Create stamp card",
  scanQr: "Scan visit QR",
  invalidProgramQr: "This is not a noodl3 visit QR.",
  myCards: "Cards I'm filling",
  myPrograms: "Cards I run",
  rewardClaims: "Reward tickets",
  emptyCards: "Scan a shop QR and your first stamp card will show up here.",
  emptyPrograms: "Create a stamp card for a shop or community and it will live here.",
  emptyClaims: "Full cards become reward tickets to show at the counter.",
  manage: "Manage card",
  openCard: "Open card",
  collectVisit: "Collect stamp",
  requestStamp: "Stamp this visit",
  requestSent: "Stamp added.",
  dynamicCollected: "Live QR stamp added.",
  claimReward: "Make reward ticket",
  rewardClaimed: "Reward ticket made.",
  createTitle: "Create a stamp card",
  createDescription: "Choose the shop look, the promised treat, and how many visits fill the card.",
  programName: "Shop or card name",
  programNamePlaceholder: "Coffee Club",
  iconUrl: "Logo URL",
  iconUrlHelp: "Use a public HTTPS image URL. Square logos look best.",
  rewardDescription: "Reward promise",
  rewardPlaceholder: "Free espresso on visit 10",
  visitsRequired: "Visits to fill card",
  active: "Active",
  activeHelp: "Customers can collect stamps and make reward tickets while this is on.",
  staticStampEnabled: "Counter QR stamps",
  staticStampHelp: "Let each wallet stamp from the printed QR once every 20 hours.",
  saveProgram: "Save stamp card",
  programCreated: "Stamp card created.",
  fixedQr: "Counter visit QR",
  dynamicQr: "Live check-in QR",
  generateDynamicQr: "Generate live QR",
  dynamicQrReady: "Live QR is ready for the next customer.",
  nextStaticStamp: "Next counter-QR stamp",
  customers: "Stamp collectors",
  settings: "Settings",
  issueManual: "Add manual stamp",
  consume: "Validate ticket",
  customerWallet: "Customer wallet",
  updateProgram: "Update card",
  settingsSaved: "Card settings saved.",
  manualIssued: "Manual stamp added.",
  rewardConsumed: "Reward ticket validated.",
  noContract: "Set the noodl3 contract address before using the app.",
  connectFirst: "Connect your wallet to see your cards.",
  notFound: "Stamp card not found.",
  inactive: "Inactive",
  stamps: "stamps",
  visits: "visits",
  ready: "Ready for reward",
  collecting: "Collecting stamps",
  staticQrHelp: "Print this QR for the counter. Each wallet can collect one stamp every 20 hours.",
  dynamicQrHelp: "Use this for owner-led check-ins. It expires in five minutes and works once.",
  claimTitle: "Reward ticket",
  claimDescription: "Show this QR to the card owner so they can validate the reward once.",
  validateClaim: "Validate ticket",
  claimConsumed: "Ticket validated.",
  usedClaim: "This reward ticket is already used.",
  ownerOnly: "Only the card owner can manage this stamp card.",
  invalidIconUrl: "Use a public HTTPS icon URL.",
  invalidProgramConfig: "Use a name up to 60 characters, a public HTTPS logo URL, a reward up to 120 characters, and 1-100 visits.",
  previewCard: "Preview card",
  previewProgramName: "Your shop name",
  previewReward: "Your treat promise appears here.",
  loadingProgram: "Fetching the latest stamp-card details from the contract.",
  loadingClaim: "Checking this reward ticket onchain.",
  qrCopy: "Copy link",
  qrCopied: "Link copied.",
  qrShare: "Share",
  qrDownload: "Download QR",
  qrPrint: "Print QR sheet",
  qrOpen: "Open",
  qrShareUnavailable: "Sharing is not available in this browser. Copy the link instead.",
  printedSheetTitle: "Counter QR sheet",
  printedSheetDescription: "Place this by the register so customers can scan and stamp a visit.",
  staticQrRule: "One stamp per wallet every 20 hours.",
  liveQrExpiresIn: "Expires in",
  liveQrExpired: "Live QR expired",
  regenerateDynamicQr: "Regenerate live QR",
  dynamicQrInactive: "Turn the card on before generating a live QR.",
  dynamicQrOneUse: "This QR expires in five minutes and works for one customer.",
  invalidVisitQr: "This live QR is missing visit data. Ask the owner to make a fresh QR.",
  dynamicExpiredHelp: "This live QR expired. Ask the owner for a new one.",
  staticDisabledHelp: "Counter QR stamps are off for this card.",
  backupCode: "Backup code",
  ticketReady: "Ready to validate",
  ticketUsed: "Already used",
  ownerValidationHint: "Connect the card owner wallet to validate this ticket.",
  rewardTicketSheet: "Reward ticket"
};

const ptProgramCopy = {
  appTitle: "Cartões de selos para visitas reais",
  appDescription:
    "Crie um cartão de selos leve na carteira, carimbe visitas reais com QR codes e valide tickets sem papel nem confusão no caixa.",
  createProgram: "Criar cartão de selos",
  scanQr: "Ler QR de visita",
  invalidProgramQr: "Este não é um QR de visita do noodl3.",
  myCards: "Cartões que estou preenchendo",
  myPrograms: "Cartões que administro",
  rewardClaims: "Tickets de recompensa",
  emptyCards: "Leia o QR de uma loja e seu primeiro cartão aparece aqui.",
  emptyPrograms: "Crie um cartão para uma loja ou comunidade e ele aparece aqui.",
  emptyClaims: "Cartões cheios viram tickets para mostrar no balcão.",
  manage: "Gerenciar cartão",
  openCard: "Abrir cartão",
  collectVisit: "Coletar selo",
  requestStamp: "Carimbar esta visita",
  requestSent: "Selo adicionado.",
  dynamicCollected: "Selo do QR ao vivo adicionado.",
  claimReward: "Gerar ticket",
  rewardClaimed: "Ticket de recompensa gerado.",
  createTitle: "Criar cartão de selos",
  createDescription: "Escolha a cara da loja, o mimo prometido e quantas visitas completam o cartão.",
  programName: "Nome da loja ou do cartão",
  programNamePlaceholder: "Clube do Café",
  iconUrl: "URL do logo",
  iconUrlHelp: "Use uma URL HTTPS pública. Logos quadrados ficam melhores.",
  rewardDescription: "Promessa da recompensa",
  rewardPlaceholder: "Espresso grátis na visita 10",
  visitsRequired: "Visitas para completar",
  active: "Ativo",
  activeHelp: "Clientes podem coletar selos e gerar tickets enquanto estiver ligado.",
  staticStampEnabled: "Selos pelo QR de balcão",
  staticStampHelp: "Permite que cada carteira carimbe pelo QR impresso uma vez a cada 20 horas.",
  saveProgram: "Salvar cartão de selos",
  programCreated: "Cartão de selos criado.",
  fixedQr: "QR de visita no balcão",
  dynamicQr: "QR ao vivo de check-in",
  generateDynamicQr: "Gerar QR ao vivo",
  dynamicQrReady: "QR ao vivo pronto para o próximo cliente.",
  nextStaticStamp: "Próximo selo pelo QR de balcão",
  customers: "Colecionadores",
  settings: "Configurações",
  issueManual: "Adicionar selo manual",
  consume: "Validar ticket",
  customerWallet: "Carteira do cliente",
  updateProgram: "Atualizar cartão",
  settingsSaved: "Configurações do cartão salvas.",
  manualIssued: "Selo manual adicionado.",
  rewardConsumed: "Ticket de recompensa validado.",
  noContract: "Configure o endereço do contrato noodl3 antes de usar o app.",
  connectFirst: "Conecte sua carteira para ver seus cartões.",
  notFound: "Cartão de selos não encontrado.",
  inactive: "Inativo",
  stamps: "selos",
  visits: "visitas",
  ready: "Recompensa pronta",
  collecting: "Colecionando selos",
  staticQrHelp: "Imprima este QR para o balcão. Cada carteira coleta um selo a cada 20 horas.",
  dynamicQrHelp: "Use para check-ins guiados pelo lojista. Expira em cinco minutos e funciona uma vez.",
  claimTitle: "Ticket de recompensa",
  claimDescription: "Mostre este QR para o dono do cartão validar a recompensa uma vez.",
  validateClaim: "Validar ticket",
  claimConsumed: "Ticket validado.",
  usedClaim: "Este ticket de recompensa já foi usado.",
  ownerOnly: "Só o dono do cartão pode gerenciar este cartão de selos.",
  invalidIconUrl: "Use uma URL HTTPS pública para o logo.",
  invalidProgramConfig: "Use um nome com até 60 caracteres, uma URL HTTPS pública de logo, uma recompensa com até 120 caracteres e 1-100 visitas.",
  previewCard: "Prévia do cartão",
  previewProgramName: "Nome da sua loja",
  previewReward: "A promessa do mimo aparece aqui.",
  loadingProgram: "Buscando os detalhes mais recentes do cartão de selos no contrato.",
  loadingClaim: "Conferindo este ticket de recompensa onchain.",
  qrCopy: "Copiar link",
  qrCopied: "Link copiado.",
  qrShare: "Compartilhar",
  qrDownload: "Baixar QR",
  qrPrint: "Imprimir folha QR",
  qrOpen: "Abrir",
  qrShareUnavailable: "Compartilhamento indisponível neste navegador. Copie o link.",
  printedSheetTitle: "Folha QR de balcão",
  printedSheetDescription: "Deixe no caixa para clientes lerem e carimbarem uma visita.",
  staticQrRule: "Um selo por carteira a cada 20 horas.",
  liveQrExpiresIn: "Expira em",
  liveQrExpired: "QR ao vivo expirou",
  regenerateDynamicQr: "Gerar novo QR ao vivo",
  dynamicQrInactive: "Ative o cartão antes de gerar um QR ao vivo.",
  dynamicQrOneUse: "Este QR expira em cinco minutos e funciona para um cliente.",
  invalidVisitQr: "Este QR ao vivo está sem dados da visita. Peça ao dono para gerar um QR novo.",
  dynamicExpiredHelp: "Este QR ao vivo expirou. Peça um novo QR ao dono.",
  staticDisabledHelp: "Selos pelo QR de balcão estão desligados neste cartão.",
  backupCode: "Código de apoio",
  ticketReady: "Pronto para validar",
  ticketUsed: "Já usado",
  ownerValidationHint: "Conecte a carteira dona do cartão para validar este ticket.",
  rewardTicketSheet: "Ticket de recompensa"
};
