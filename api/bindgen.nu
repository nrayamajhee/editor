#!/usr/bin/env nu

cargo test export_bindings
rm -r ../web/schema
mv bindings ../web/schema
cd ../web/schema
touch index.ts
ls | get name | each { |file|
  let mod = $file | split words | get 0
  if mod != "index" {
    $"export * from \"./($mod)\";\n" | save --append index.ts
  }
}
cat index.ts

