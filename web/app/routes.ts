import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("pages/index.tsx"),
  layout("layout/dashboard.tsx", [
    route(":username/notes", "pages/notes.tsx"),
    route(":username/photos", "pages/photos.tsx"),
    route(":username/finance", "pages/finance.tsx"),
    route(":username/profile", "pages/profile.tsx"),
  ]),
  route("/:username/note/:id", "pages/note.tsx"),
  route("/:username/photo/:name", "pages/photo.tsx"),
] satisfies RouteConfig;
