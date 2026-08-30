async function checkCode(code) {
  const url = "http://localhost:8787/api/validate";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (response.status === 200) {
    const data = await response.json();
    const roomCode = data.code;
  } else {
    console.log("Wrong code, please try again");
  }
}
