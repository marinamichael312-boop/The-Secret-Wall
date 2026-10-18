THE SECRET WALL - deployment package

1. Deploy worker.js + wrangler.toml to Cloudflare Workers using Wrangler.
2. Set secret ADMIN_PIN (use a strong random PIN) using: npx wrangler secret put ADMIN_PIN
3. Deploy: npx wrangler deploy
4. In index.html replace REPLACE_WITH_WORKER_URL with the resulting https://...workers.dev URL.
5. Upload index.html to the root of the existing GitHub Pages repository.
6. Test Team A on mobile data, Team B on Wi-Fi, projector on laptop; verify live points and admin reveal.

IMPORTANT: No user login is required, but the admin PIN is needed to authorize admin changes.
Team actions are public to anyone who knows the room and team URL; for a church game use an unguessable room name and don't share links publicly. This is a lightweight event app, not high-security authentication.
This package is not yet deployed; it requires Cloudflare account authorization. Cloudflare Worker uses periodic polling (1 second) for synchronization, not WebSockets.
