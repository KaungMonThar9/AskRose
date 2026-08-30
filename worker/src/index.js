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

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (request.method === 'POST' && url.pathname === '/api/rooms') {
			return createRoom(request, env);
		}

		if (request.method === 'POST' && url.pathname === '/api/validate') {
			return validateCode(request, env);
		}

		return new Response('NOT FOUND', { status: 404 });
	},
};
