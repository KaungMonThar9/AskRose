/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { createRoom, validateCode } from '../routes/rooms.js';

const corsHeaders = {
	'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
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
