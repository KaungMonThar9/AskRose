import { jwtVerify, SignJWT } from 'jose';

export async function createRoom(request, env) {
	const authHeader = request.headers.get('Authorization');
	if (authHeader) {
		const isModerator = await verifyModeratorToken(request, env);

		if (!isModerator) {
			return Response.json({ error: 'Invalid tutor token' }, { status: 401 });
		}
	} else {
		const { password } = await request.json();
		if (password !== env.TUTOR_PASSWORD) {
			return new Response('INCORRECT PASSWORD', { status: 401 });
		}
	}

	const createdAt = Math.floor(Date.now() / 1000); //converts milli to seconds
	const expiresAt = createdAt + 6 * 60 * 60; //6 hour timestamp

	for (let attempts = 0; attempts < 50; attempts++) {
		const roomCode = generateRoomCode();
		const attemptInsert = `INSERT OR IGNORE INTO rooms (room_code, created_at, expires_at) VALUES (?, ?, ?)`;
		const result = await env.askrose_db.prepare(attemptInsert).bind(roomCode, createdAt, expiresAt).run();

		if (result.meta.changes === 1) {
			const token = await createBoardToken(env, roomCode, 'moderator', expiresAt);
			return Response.json(
				{
					code: roomCode,
					token,
				},
				{ status: 201 },
			);
		} else {
			continue;
		}
	}

	return Response.json(
		{
			success: false,
		},
		{ status: 500 },
	);
}

export async function validateCode(request, env) {
	const { code } = await request.json();

	if (typeof code !== 'string' || !/^\d{5}$/.test(code)) {
		return Response.json({ valid: false }, { status: 400 });
	}

	const currentTime = Math.floor(Date.now() / 1000);
	const checkCode = `SELECT expires_at FROM rooms WHERE room_code = ? AND expires_at > ?`;
	const room = await env.askrose_db.prepare(checkCode).bind(code, currentTime).first();

	if (room) {
		const token = await createBoardToken(env, String(code), 'editor', room.expires_at);
		return Response.json({ token }, { status: 200 });
	} else {
		return Response.json({ valid: false }, { status: 404 });
	}
}

async function verifyModeratorToken(request, env) {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader?.startsWith('Bearer ')) {
		return false;
	}

	const token = authHeader.slice('Bearer '.length);
	const secret = new TextEncoder().encode(env.AUTH_SECRET_KEY);

	try {
		const { payload } = await jwtVerify(token, secret, {
			algorithms: ['HS256'],
		});

		const role = payload.roles?.[0];

		return role?.startsWith('moderator:') === true;
	} catch {
		return false;
	}
}

function generateRoomCode() {
	const values = new Uint32Array(1);
	crypto.getRandomValues(values);

	return String(values[0] % 100000).padStart(5, '0');
}

async function createBoardToken(env, roomCode, role, expiresAt) {
	const secret = new TextEncoder().encode(env.AUTH_SECRET_KEY);
	const now = Math.floor(Date.now() / 1000);

	return new SignJWT({ roles: [`${role}:${roomCode}`] }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(expiresAt).sign(secret);
}
