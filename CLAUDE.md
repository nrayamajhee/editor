When asked about creating storybook:
- Always create a single Story first.
- Create react router createRotueStub for any component that uses react router specific code

When asked about creating a component;
- Ask if children prop is needed.
- Be minimalist. Only create fields that are absolutely necessary to achieve described behavior
- Always favor non optional types for component props
- Always add a storybook after creating the component

In both scenarios run npm run format and npm run lint:fix. Try to fix the lints. Then run npm run
typecheck and make sure your code builds
