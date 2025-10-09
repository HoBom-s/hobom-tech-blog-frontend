import { Routes } from "@angular/router";
import { ROUTE_PATHS } from "./core/router/route-paths";

export const routes: Routes = [
  {
    path: ROUTE_PATHS.MAIN.HOME,
    pathMatch: "full",
    loadComponent: () =>
      import("./features/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: ROUTE_PATHS.ARTICLES.ROOT,
    pathMatch: "full",
    loadComponent: () =>
      import("./features/detail/article-detail.component").then(
        (m) => m.ArticleDetailComponent,
      ),
  },
  { path: "**", redirectTo: "" },
];
