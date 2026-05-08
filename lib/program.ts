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

export function buildQrImageUrl(value: string, size = 320) {
  const url = new URL("https://api.qrserver.com/v1/create-qr-code/");
  url.searchParams.set("size", `${size}x${size}`);
  url.searchParams.set("data", value);
  url.searchParams.set("margin", "0");
  return url.toString();
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
  appTitle: "Loyalty stamp cards",
  appDescription:
    "Create a Web3 stamp card, let customers collect one stamp per visit, and validate rewards from the same wallet flow.",
  createProgram: "Create program",
  scanQr: "Scan QR",
  myCards: "My cards",
  myPrograms: "My programs",
  rewardClaims: "Reward claims",
  emptyCards: "Stamp cards appear here after your first visit.",
  emptyPrograms: "Programs you own appear here.",
  emptyClaims: "Reward claims appear here after you redeem a full card.",
  manage: "Manage",
  openCard: "Open card",
  collectVisit: "Collect visit stamp",
  requestStamp: "Collect static stamp",
  requestSent: "Static visit stamp collected.",
  dynamicCollected: "Dynamic QR stamp collected.",
  claimReward: "Claim reward",
  rewardClaimed: "Reward claim created.",
  createTitle: "Create loyalty program",
  createDescription: "Set the icon, card name, reward, and number of visits needed.",
  programName: "Program name",
  iconUrl: "Icon URL",
  iconUrlHelp: "Use a public HTTPS image URL for the program icon.",
  rewardDescription: "Reward",
  visitsRequired: "Visits required",
  active: "Active",
  staticStampEnabled: "Enable daily static QR stamps",
  saveProgram: "Save program",
  programCreated: "Program created.",
  fixedQr: "Fixed visit QR",
  dynamicQr: "Dynamic visit QR",
  generateDynamicQr: "Generate dynamic QR",
  dynamicQrReady: "Dynamic QR ready for the next customer.",
  nextStaticStamp: "Next static stamp",
  customers: "Customers",
  settings: "Settings",
  issueManual: "Issue manual stamp",
  consume: "Consume reward",
  customerWallet: "Customer wallet",
  updateProgram: "Update program",
  settingsSaved: "Program settings saved.",
  manualIssued: "Manual stamp issued.",
  rewardConsumed: "Reward consumed.",
  noContract: "Set the Noodl3 contract address before using the app.",
  connectFirst: "Connect your wallet to continue.",
  notFound: "Program not found.",
  inactive: "Inactive",
  stamps: "stamps",
  visits: "visits",
  ready: "Ready",
  collecting: "Collecting",
  staticQrHelp: "Print this QR. Customers scan it and collect one stamp per wallet every 20 hours.",
  dynamicQrHelp: "Use this for owner-led live check-ins. It expires in five minutes and can be used once.",
  claimTitle: "Reward claim",
  claimDescription: "Show this QR to the program owner so they can consume the reward once.",
  validateClaim: "Validate claim",
  claimConsumed: "Claim consumed.",
  usedClaim: "This claim has already been consumed.",
  ownerOnly: "Only the program owner can manage this program.",
  invalidIconUrl: "Use a public HTTPS icon URL.",
  invalidProgramConfig: "Use a name up to 60 characters, an HTTPS icon URL, a reward up to 120 characters, and 1-100 visits."
};

const ptProgramCopy = {
  appTitle: "Cartões de fidelidade",
  appDescription:
    "Crie um cartão Web3, deixe clientes colecionarem um selo por visita e valide recompensas no mesmo fluxo de carteira.",
  createProgram: "Criar programa",
  scanQr: "Ler QR",
  myCards: "Meus cartões",
  myPrograms: "Meus programas",
  rewardClaims: "Recompensas",
  emptyCards: "Seus cartões aparecem aqui depois da primeira visita.",
  emptyPrograms: "Programas que você criou aparecem aqui.",
  emptyClaims: "Recompensas aparecem aqui depois que você resgata um cartão cheio.",
  manage: "Gerenciar",
  openCard: "Abrir cartão",
  collectVisit: "Coletar selo",
  requestStamp: "Coletar selo do QR fixo",
  requestSent: "Selo de visita coletado.",
  dynamicCollected: "Selo do QR dinâmico coletado.",
  claimReward: "Resgatar recompensa",
  rewardClaimed: "Recompensa criada.",
  createTitle: "Criar programa de fidelidade",
  createDescription: "Defina ícone, nome, recompensa e quantas visitas completam o cartão.",
  programName: "Nome do programa",
  iconUrl: "URL do ícone",
  iconUrlHelp: "Use uma URL HTTPS pública para o ícone do programa.",
  rewardDescription: "Recompensa",
  visitsRequired: "Visitas necessárias",
  active: "Ativo",
  staticStampEnabled: "Ativar selos diários pelo QR fixo",
  saveProgram: "Salvar programa",
  programCreated: "Programa criado.",
  fixedQr: "QR fixo de visita",
  dynamicQr: "QR dinâmico de visita",
  generateDynamicQr: "Gerar QR dinâmico",
  dynamicQrReady: "QR dinâmico pronto para o próximo cliente.",
  nextStaticStamp: "Próximo selo do QR fixo",
  customers: "Clientes",
  settings: "Configurações",
  issueManual: "Dar selo manual",
  consume: "Consumir recompensa",
  customerWallet: "Carteira do cliente",
  updateProgram: "Atualizar programa",
  settingsSaved: "Configurações salvas.",
  manualIssued: "Selo manual emitido.",
  rewardConsumed: "Recompensa consumida.",
  noContract: "Configure o endereço do contrato Noodl3 antes de usar o app.",
  connectFirst: "Conecte sua carteira para continuar.",
  notFound: "Programa não encontrado.",
  inactive: "Inativo",
  stamps: "selos",
  visits: "visitas",
  ready: "Pronto",
  collecting: "Coletando",
  staticQrHelp: "Imprima este QR. Clientes leem e coletam um selo por carteira a cada 20 horas.",
  dynamicQrHelp: "Use em check-ins ao vivo com o dono. Expira em cinco minutos e só pode ser usado uma vez.",
  claimTitle: "Recompensa",
  claimDescription: "Mostre este QR para o dono do programa consumir a recompensa uma única vez.",
  validateClaim: "Validar recompensa",
  claimConsumed: "Recompensa consumida.",
  usedClaim: "Esta recompensa já foi consumida.",
  ownerOnly: "Só o dono do programa pode gerenciar este programa.",
  invalidIconUrl: "Use uma URL HTTPS pública para o ícone.",
  invalidProgramConfig: "Use um nome com até 60 caracteres, uma URL HTTPS de ícone, uma recompensa com até 120 caracteres e 1-100 visitas."
};
