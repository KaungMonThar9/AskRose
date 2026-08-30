async function requestRoom(password) {
  const url = "http://localhost:8787/api/rooms";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (response.status === 201) {
    const data = await response.json();
    const roomCode = data.code;
  } else if (response.status === 401) {
    console.log("incorrect password");
  } else {
    console.log("Unknown error, please try again later");
  }
}
