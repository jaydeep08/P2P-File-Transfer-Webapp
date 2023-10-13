const socket = io();

// Generating Room Id
const generatedRoomId = `Session-${Math.random().toString(36).substring(2, 8)}`;
document.getElementById("roomId").textContent = generatedRoomId;
socket.emit("joinRoom", generatedRoomId);

const joinRoomButton = document.getElementById("joinRoom");
joinRoomButton.addEventListener("click", () => {
  const roomId = document.getElementById("roomIdInput").value;
  if (roomId.trim() === "") {
    alert("Please enter a room ID.");
  } else {
    // Emit the 'joinRoom' event with the entered room ID
    socket.emit("joinRoom", roomId);
    document.getElementById("roomId").textContent = roomId;
  }
});

// Drag-and-Drop Area
const dropArea = document.getElementById("dropArea");
const browseFileButton = document.getElementById("browseFile");
const fileInfo = document.getElementById("fileInfo");
const selectedFileName = document.getElementById("selectedFileName");

socket.on("fileList", (files) => {
  // Update the file list with the files in the room
  fileList.innerHTML = "";
  files.forEach((filename) => {
    const listItem = document.createElement("li");
    const fileLink = document.createElement("a");
    fileLink.href = `/download/${filename}`;
    fileLink.download = filename;
    fileLink.textContent = filename;
    listItem.appendChild(fileLink);
    fileList.appendChild(listItem);
  });
});

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("drag-over");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("drag-over");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  handleFileSelection(file);
});

browseFileButton.addEventListener("click", () => {
  fileInput.click();
});

const fileInput = document.getElementById("fileInput");
const submitFileButton = document.getElementById("submitFile");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  handleFileSelection(file);
});

submitFileButton.addEventListener("click", () => {
  if (!fileInput.files.length) {
    alert("Please select a file to upload.");
  } else {
    const file = fileInput.files[0];
    handleFileUpload(file);
  }
});

function handleFileSelection(file) {
  if (file) {
    selectedFileName.textContent = `Selected File: ${file.name}`;
    fileInfo.style.display = "block";
  }
}

function handleFileUpload(file) {
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    let roomId = document.getElementById("roomIdInput").value;
    if (roomId.trim() === "") {
      const roomIdSpan = document.getElementById("roomId");
      roomId = roomIdSpan.textContent;
    }
    // Emit the 'joinRoom' event with the entered room ID
    fetch(`/upload/${roomId}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((message) => {
        console.log(message);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    fileInfo.style.display = "none"; // Hide the file info section
    selectedFileName.textContent = ""; // Clear the selected file name
    fileInput.value = ""; // Clear the file input
  }
}

socket.on("fileUploaded", (data) => {
  const fileList = document.getElementById("fileList");
  const listItem = document.createElement("li");
  const fileLink = document.createElement("a"); // Create a download link

  // Set the download link's attributes
  fileLink.href = `/download/${data.filename}`;
  fileLink.download = data.filename; // Set the filename for download
  fileLink.textContent = data.filename;

  // Append the download link to the list item
  listItem.appendChild(fileLink);

  // Append the list item to the file list
  fileList.appendChild(listItem);
});

const messages = document.getElementById("messages");

// Define a variable to store the latest message
let latestMessage = null;

socket.on("message", (message) => {
  // Create a new message element for the latest message
  const messageElement = document.createElement("div");
  messageElement.textContent = message;

  // Replace the previous latest message with the new one
  if (latestMessage) {
    messages.removeChild(latestMessage);
  }

  // Append the new latest message to the message container
  messages.appendChild(messageElement);

  // Update the latestMessage variable to the new message element
  latestMessage = messageElement;
});

socket.on("latestConnection", (connectionInfo) => {
  latestConnectionInfo.textContent = connectionInfo;
});

socket.on("userList", (users) => {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  users.forEach((user) => {
    const userElement = document.createElement("li");
    userElement.textContent = user;
    userList.appendChild(userElement);
  });
});

socket.on("socketId", (socketId) => {
  // 'socketId' is the socket ID received from the server
  const socketIdSpan = document.getElementById("socketId");

  // Update the content of the span element with the socket ID
  socketIdSpan.textContent = socketId;
});
