import {
  bootstrapDashboardApp,
  createDashboardAppBootstrap,
  type DashboardDomDocument
} from "./app/bootstrap.ts";

const dashboardDocument = (globalThis as { document?: DashboardDomDocument }).document;

if (dashboardDocument) {
  bootstrapDashboardApp(dashboardDocument, createDashboardAppBootstrap());
}
