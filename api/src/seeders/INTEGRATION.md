# Kristijan demo seed

Call `seedKristijan(orm.em.fork())` from `AppModule.onModuleInit` (after schema update) or `node dist/seeders/run.js`.

Canonical numbers live in `kristijan-demo.ts`. Neighbor modules should import that object instead of seeding a second Kristijan. Journal rows are titles + ciphertext/IV placeholders only.
