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
  emptyPrograms: "Programs you own or staff appear here.",
  emptyClaims: "Reward claims appear here after you redeem a full card.",
  manage: "Manage",
  openCard: "Open card",
  collectVisit: "Collect visit stamp",
  requestStamp: "Request staff approval",
  requestSent: "Visit request sent. Staff can approve it from the manager view.",
  dynamicCollected: "Dynamic QR stamp collected.",
  claimReward: "Claim reward",
  rewardClaimed: "Reward claim created.",
  createTitle: "Create loyalty program",
  createDescription: "Set the card name, reward, and number of visits needed.",
  programName: "Program name",
  rewardDescription: "Reward",
  visitsRequired: "Visits required",
  active: "Active",
  saveProgram: "Save program",
  programCreated: "Program created.",
  fixedQr: "Fixed visit QR",
  dynamicQr: "Dynamic visit QR",
  generateDynamicQr: "Generate dynamic QR",
  dynamicQrReady: "Dynamic QR ready for the next customer.",
  pendingRequests: "Pending requests",
  customers: "Customers",
  staff: "Staff",
  settings: "Settings",
  approve: "Approve",
  reject: "Reject",
  issueManual: "Issue manual stamp",
  consume: "Consume reward",
  addStaff: "Add staff",
  removeStaff: "Remove staff",
  customerWallet: "Customer wallet",
  staffWallet: "Staff wallet",
  updateProgram: "Update program",
  settingsSaved: "Program settings saved.",
  staffUpdated: "Staff updated.",
  manualIssued: "Manual stamp issued.",
  requestApproved: "Request approved.",
  requestRejected: "Request rejected.",
  rewardConsumed: "Reward consumed.",
  noContract: "Set the Noodl3 contract address before using the app.",
  connectFirst: "Connect your wallet to continue.",
  notFound: "Program not found.",
  inactive: "Inactive",
  stamps: "stamps",
  visits: "visits",
  ready: "Ready",
  collecting: "Collecting",
  staticQrHelp: "Print this QR. Customers scan it and request a stamp; staff approves once they visit.",
  dynamicQrHelp: "Use this for live check-ins. It expires in five minutes and can be used once.",
  claimTitle: "Reward claim",
  claimDescription: "Show this QR to owner or staff so they can consume the reward once.",
  validateClaim: "Validate claim",
  claimConsumed: "Claim consumed.",
  usedClaim: "This claim has already been consumed."
};

const ptProgramCopy = {
  appTitle: "Cartoes de fidelidade",
  appDescription:
    "Crie um cartao Web3, deixe clientes colecionarem um selo por visita e valide recompensas no mesmo fluxo de carteira.",
  createProgram: "Criar programa",
  scanQr: "Ler QR",
  myCards: "Meus cartoes",
  myPrograms: "Meus programas",
  rewardClaims: "Recompensas",
  emptyCards: "Seus cartoes aparecem aqui depois da primeira visita.",
  emptyPrograms: "Programas que voce criou ou opera aparecem aqui.",
  emptyClaims: "Recompensas aparecem aqui depois que voce resgata um cartao cheio.",
  manage: "Gerenciar",
  openCard: "Abrir cartao",
  collectVisit: "Coletar selo",
  requestStamp: "Pedir aprovacao",
  requestSent: "Pedido enviado. A equipe aprova no painel do programa.",
  dynamicCollected: "Selo do QR dinamico coletado.",
  claimReward: "Resgatar recompensa",
  rewardClaimed: "Recompensa criada.",
  createTitle: "Criar programa de fidelidade",
  createDescription: "Defina nome, recompensa e quantas visitas completam o cartao.",
  programName: "Nome do programa",
  rewardDescription: "Recompensa",
  visitsRequired: "Visitas necessarias",
  active: "Ativo",
  saveProgram: "Salvar programa",
  programCreated: "Programa criado.",
  fixedQr: "QR fixo de visita",
  dynamicQr: "QR dinamico de visita",
  generateDynamicQr: "Gerar QR dinamico",
  dynamicQrReady: "QR dinamico pronto para o proximo cliente.",
  pendingRequests: "Pedidos pendentes",
  customers: "Clientes",
  staff: "Equipe",
  settings: "Configuracoes",
  approve: "Aprovar",
  reject: "Recusar",
  issueManual: "Dar selo manual",
  consume: "Consumir recompensa",
  addStaff: "Adicionar equipe",
  removeStaff: "Remover equipe",
  customerWallet: "Carteira do cliente",
  staffWallet: "Carteira da equipe",
  updateProgram: "Atualizar programa",
  settingsSaved: "Configuracoes salvas.",
  staffUpdated: "Equipe atualizada.",
  manualIssued: "Selo manual emitido.",
  requestApproved: "Pedido aprovado.",
  requestRejected: "Pedido recusado.",
  rewardConsumed: "Recompensa consumida.",
  noContract: "Configure o endereco do contrato Noodl3 antes de usar o app.",
  connectFirst: "Conecte sua carteira para continuar.",
  notFound: "Programa nao encontrado.",
  inactive: "Inativo",
  stamps: "selos",
  visits: "visitas",
  ready: "Pronto",
  collecting: "Coletando",
  staticQrHelp: "Imprima este QR. Clientes leem e pedem um selo; a equipe aprova na visita.",
  dynamicQrHelp: "Use em check-ins ao vivo. Expira em cinco minutos e so pode ser usado uma vez.",
  claimTitle: "Recompensa",
  claimDescription: "Mostre este QR para dono ou equipe consumir a recompensa uma unica vez.",
  validateClaim: "Validar recompensa",
  claimConsumed: "Recompensa consumida.",
  usedClaim: "Esta recompensa ja foi consumida."
};
