#!/usr/bin/env nu

cargo test export_bindings
rm -r ../web-next/schema
mv bindings ../web-next/schema
cd ../web-next/schema
touch index.ts
ls | get name | each { |file|
  let mod = $file | split words | get 0
  $"export * from \"./($mod)\";\n" | save --append index.ts
}
cat index.ts

