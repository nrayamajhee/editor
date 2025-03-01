#!/usr/bin/env nu

cargo test export_bindings
rm -r ../web/app/schema
mv bindings ../web/app/schema
cd ../web/app/schema
touch index.ts
ls | get name | each { |file|
  let mod = $file | split words | get 0
  if mod != "index" {
    $"export * from \"./($mod)\";\n" | save --append index.ts
  }
}
cat index.ts
npm run format
npm run lint:fix

