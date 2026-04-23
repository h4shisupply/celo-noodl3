import "server-only";

import { serverEnv } from "./server-env";

const VERCEL_API_BASE_URL = "https://api.vercel.com";
const CATALOG_ENV_TARGETS = ["production", "preview", "development"] as const;

type VercelDeployment = {
  uid?: string;
  id?: string;
  url?: string;
};

type VercelProject = {
  id: string;
  name: string;
};

function appendScopeQuery(params: URLSearchParams) {
  if (serverEnv.vercelTeamId) {
    params.set("teamId", serverEnv.vercelTeamId);
  }
}

function buildTeamQuery() {
  const params = new URLSearchParams();
  appendScopeQuery(params);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function assertVercelEnvConfigured() {
  if (!serverEnv.vercelAccessToken || !serverEnv.vercelProjectId) {
    throw new Error(
      "Missing Vercel admin env vars. Set VERCEL_ACCESS_TOKEN and VERCEL_PROJECT_ID."
    );
  }
}

async function vercelFetch(path: string, init?: RequestInit) {
  assertVercelEnvConfigured();

  const response = await fetch(`${VERCEL_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${serverEnv.vercelAccessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Vercel API request failed (${response.status}): ${responseText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function getProject() {
  return (await vercelFetch(
    `/v9/projects/${encodeURIComponent(serverEnv.vercelProjectId)}${buildTeamQuery()}`
  )) as VercelProject;
}

async function findLatestDeployment(target?: "production" | "preview") {
  const params = new URLSearchParams({
    projectId: serverEnv.vercelProjectId,
    limit: "1"
  });

  if (target) {
    params.set("target", target);
  }

  if (serverEnv.vercelTeamId) {
    params.set("teamId", serverEnv.vercelTeamId);
  }

  const response = (await vercelFetch(`/v6/deployments?${params.toString()}`)) as {
    deployments?: VercelDeployment[];
  };

  return response.deployments?.[0] || null;
}

async function triggerRedeployFromLatest() {
  const latestDeployment =
    (await findLatestDeployment("production")) || (await findLatestDeployment());
  const deploymentId = latestDeployment?.uid || latestDeployment?.id;

  if (!deploymentId) {
    throw new Error("Could not find an existing Vercel deployment to redeploy.");
  }

  const project = await getProject();

  return (await vercelFetch(`/v13/deployments${buildTeamQuery()}`, {
    method: "POST",
    body: JSON.stringify({
      deploymentId,
      name: project.name,
      project: project.name,
      target: "production"
    })
  })) as {
    id?: string;
    url?: string;
  };
}

export async function syncCatalogEnvAndRedeploy(rawCatalogJson: string) {
  await vercelFetch(
    `/v10/projects/${encodeURIComponent(serverEnv.vercelProjectId)}/env${buildTeamQuery()}${
      buildTeamQuery() ? "&" : "?"
    }upsert=true`,
    {
      method: "POST",
      body: JSON.stringify({
        key: "NOODL3_STORE_CATALOG_JSON",
        value: rawCatalogJson,
        type: "plain",
        target: [...CATALOG_ENV_TARGETS]
      })
    }
  );

  return triggerRedeployFromLatest();
}
