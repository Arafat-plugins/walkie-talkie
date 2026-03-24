export type DashboardNavItem = {
  id: string;
  label: string;
  route: string;
};

export type DashboardStatusCard = {
  id: string;
  title: string;
  value: string;
  tone: "neutral" | "success" | "warning";
};

export type DashboardShellModel = {
  appName: string;
  title: string;
  subtitle: string;
  navItems: DashboardNavItem[];
  statusCards: DashboardStatusCard[];
};

const DEFAULT_NAV_ITEMS: DashboardNavItem[] = [
  { id: "overview", label: "Overview", route: "/" },
  { id: "agents", label: "Agents", route: "/agents" },
  { id: "skills", label: "Skills", route: "/skills" },
  { id: "mcp", label: "MCP", route: "/mcp" },
  { id: "pipelines", label: "Pipelines", route: "/pipelines" },
  { id: "logs", label: "Logs", route: "/logs" },
  { id: "config", label: "Config", route: "/config" }
];

const DEFAULT_STATUS_CARDS: DashboardStatusCard[] = [
  { id: "readiness", title: "Runtime Readiness", value: "Foundations Ready", tone: "success" },
  { id: "integrations", title: "Connected Integrations", value: "Telegram + AI Skeleton", tone: "neutral" },
  { id: "risk", title: "Attention Needed", value: "Live transports pending", tone: "warning" }
];

export function createDashboardShellModel(input?: {
  appName?: string;
  title?: string;
  subtitle?: string;
}): DashboardShellModel {
  return {
    appName: input?.appName ?? "Walkie-Talkie",
    title: input?.title ?? "Control Plane",
    subtitle:
      input?.subtitle ??
      "Observe agents, integrations, pipelines, and runtime health from one place.",
    navItems: DEFAULT_NAV_ITEMS.map((item) => ({ ...item })),
    statusCards: DEFAULT_STATUS_CARDS.map((card) => ({ ...card }))
  };
}

export function buildDashboardShellSummary(model: DashboardShellModel): string[] {
  return [
    `${model.appName}: ${model.title}`,
    model.subtitle,
    `Nav: ${model.navItems.map((item) => item.label).join(", ")}`,
    `Cards: ${model.statusCards.map((card) => `${card.title}=${card.value}`).join(" | ")}`
  ];
}

export function buildDashboardShellMarkup(
  model: DashboardShellModel,
  input?: {
    bodyMarkup?: string;
  }
): string {
  return `
    <section class="wt-overview">
      <div class="wt-overview__backdrop"></div>
      <div class="wt-overview__chrome">
        <aside class="wt-sidebar">
          <p class="wt-sidebar__eyebrow">${model.appName}</p>
          <h1 class="wt-sidebar__title">${model.title}</h1>
          <p class="wt-sidebar__subtitle">${model.subtitle}</p>
          <nav class="wt-sidebar__nav" aria-label="Dashboard">
            ${model.navItems
              .map(
                (item) => `
                  <a class="wt-nav__item" href="${item.route}" data-nav-id="${item.id}">
                    <span class="wt-nav__dot"></span>
                    <span>${item.label}</span>
                  </a>
                `
              )
              .join("")}
          </nav>
        </aside>
        <main class="wt-main">
          <section class="wt-hero">
            <p class="wt-hero__eyebrow">Overview</p>
            <h2 class="wt-hero__title">Operators stay close to every moving part.</h2>
            <p class="wt-hero__body">
              Runtime health, integrations, and orchestration surfaces are now entering the rendered dashboard phase.
            </p>
          </section>
          <section class="wt-cards" aria-label="Status Cards">
            ${model.statusCards
              .map(
                (card) => `
                  <article class="wt-card wt-card--${card.tone}" data-card-id="${card.id}">
                    <p class="wt-card__label">${card.title}</p>
                    <h3 class="wt-card__value">${card.value}</h3>
                  </article>
                `
              )
              .join("")}
          </section>
          ${input?.bodyMarkup ?? ""}
        </main>
      </div>
    </section>
  `.trim();
}
