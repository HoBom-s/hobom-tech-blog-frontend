import { RenderMode, ServerRoute } from "@angular/ssr";

export const serverRoutes: ServerRoute[] = [
  {
    // Notion 기반 동적 콘텐츠라 빌드타임 prerender 대신 요청 시 SSR
    path: "**",
    renderMode: RenderMode.Server,
  },
];
