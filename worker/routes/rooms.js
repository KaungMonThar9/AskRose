export async function createRoom(request, env) {
	const { password } = await request.json();
	if (password !== env.TUTOR_PASSWORD) {
		return new Response('INCORRECT PASSWORD', { status: 401 });
	}

	const createdAt = Math.floor(Date.now() / 1000); //converts milli to seconds
	const expiresAt = createdAt + 6 * 60 * 60; //6 hour timestamp

	for (let attempts = 0; attempts < 50; attempts++) {
		const roomCode = generateRoomCode();
		const attemptInsert = `INSERT OR IGNORE INTO rooms (room_code, created_at, expires_at) VALUES (?, ?, ?)`;
		const result = await env.askrose_db.prepare(attemptInsert).bind(roomCode, createdAt, expiresAt).run();

		if (result.meta.changes === 1) {
			return Response.json(
				{
					code: roomCode,
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

function generateRoomCode() {
	const values = new Uint32Array(1);
	crypto.getRandomValues(values);

	return String(values[0] % 100000).padStart(5, '0');
}

export async function validateCode(request, env) {
	const { code } = await request.json();

	if (typeof code !== 'string' || !/^\d{5}$/.test(code)) {
		return Response.json({ valid: false }, { status: 400 });
	}

	const currentTime = Math.floor(Date.now() / 1000);
	const checkCode = `SELECT EXISTS (SELECT 1 FROM rooms WHERE room_code = ? AND expires_at > ?) AS room_exists`;
	const res = await env.askrose_db.prepare(checkCode).bind(code, currentTime).first();

	if (res.room_exists === 1) {
		return Response.json({ code: code }, { status: 200 });
	} else {
		return Response.json({ status: 404 });
	}
}
