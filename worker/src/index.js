/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { createRoom, validateCode, closeRoom } from '../routes/rooms.js';
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const clientIp = request.headers.get('CF-Connecting-IP') || 'local-dev';
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
		}
		const { success } = await env.ASKROSE_RATE_LIMITER.limit({ key: `${url.pathname}:${clientIp}` });
		if (!success) {
			return new Response('Too many requests', { status: 429 });
		}

		const match = url.pathname.match(/^\/api\/rooms\/(\d{5})\/close$/);

		if (request.method === 'POST' && match) {
			return addCorsHeaders(await closeRoom(request, env));
		}

		if (request.method === 'POST' && url.pathname === '/api/rooms') {
			return addCorsHeaders(await createRoom(request, env));
		}

		if (request.method === 'POST' && url.pathname === '/api/validate') {
			return addCorsHeaders(await validateCode(request, env));
		}

		return addCorsHeaders(new Response('NOT FOUND', { status: 404 }));
	},
};

function addCorsHeaders(response) {
	const headers = new Headers(response.headers);

	for (const [key, value] of Object.entries(corsHeaders)) {
		headers.set(key, value);
	}

	return new Response(response.body, {
		status: response.status,
		headers,
	});
}
