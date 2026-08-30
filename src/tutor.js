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
    const token = data.token;
    const boardUrl = `http://localhost:5001/boards/${encodeURIComponent(roomCode)}?token=${encodeURIComponent(token)}`;
    window.location.assign(boardUrl);
  } else if (response.status === 401) {
    const error = document.getElementById("form-error");
    error.textContent = "Incorrect password";
  } else {
    const error = document.getElementById("form-error");
    error.textContent = "Unknown error, please try again later";
  }
}

const form = document.getElementById("tutor-form");
form.addEventListener("submit", function (event) {
  event.preventDefault();
  requestRoom(form.tutorPassword.value);
});
