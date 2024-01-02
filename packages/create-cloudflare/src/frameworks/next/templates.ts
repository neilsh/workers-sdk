const bindings = `
	// https://developers.cloudflare.com/workers/configuration/bindings/
	// In Next.js bindings to KV, R2, Durable Objects, Queues, D1 and more
	// are exposed via process.env, as shown below:
	//
	// const myKv = process.env['MY_KV_NAMESPACE'];
	// await myKv.put('foo', 'bar');
	// const valueFromKv = await myKv.get('foo');
	//
	// Each binding must be configured in your project's next.config.js file:
	// https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
`;

export const apiPagesDirHelloTs = `
// Next.js Edge API Routes: https://nextjs.org/docs/pages/building-your-application/routing/api-routes#edge-api-routes

import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
${bindings}

  return new Response(JSON.stringify({ name: 'John Doe' }))
}
`;

export const apiPagesDirHelloJs = `
// Next.js Edge API Routes: https://nextjs.org/docs/pages/building-your-application/routing/api-routes#edge-api-routes

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
${bindings}

  return new Response(JSON.stringify({ name: 'John Doe' }))
}
`;

export const apiAppDirHelloTs = `
// Next.js Edge API Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/router-handlers#edge-and-nodejs-runtimes

import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
${bindings}


  return new Response(JSON.stringify({ name: 'John Doe' }))
}
`;

export const apiAppDirHelloJs = `
// Next.js Edge API Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/router-handlers#edge-and-nodejs-runtimes

export const runtime = 'edge'

export async function GET(request) {
${bindings}

  return new Response(JSON.stringify({ name: 'John Doe' }))
}
`;

export const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig

// https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
// This code ensures that bindings to resources like
// KV, R2, Durable Objects, Queues, D1 are available in
// local development when running the next dev command, which
// runs a Node.js based local development server.
if (process.env.NODE_ENV === 'development') {
    import('@cloudflare/next-on-pages/__experimental__next-dev').then(({ setupDevBindings }) => {

				// https://developers.cloudflare.com/workers/configuration/bindings/
				// Each binding you want to expose via process.env must be configured via setupDevBindings()
        setupDevBindings({
            kvNamespaces: ['MY_KV_NAMESPACE'],
        });
    });
}
`;
