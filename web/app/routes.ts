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
  ]),
  route("/:username/note/:id", "pages/note.tsx"),
] satisfies RouteConfig;
