
const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

const nameInput = document.getElementById("nameInput");
const photoInput = document.getElementById("photoInput");

const zoom = document.getElementById("zoom");
const photoVertical = document.getElementById("photoVertical");
const photoHorizontal = document.getElementById("photoHorizontal");
const nameSize = document.getElementById("nameSize");

const statusEl = document.getElementById("status");

const template = new Image();
template.src = "template.jpg";

// ছবির অবস্থান ও আকার
let photo = null;
let photoScale = 1;

let photoOffsetX = 0;
let photoOffsetY = 0;

let nameX = 1145;
let nameY = 1550;

let dragging = null;
let start = null;

// হলুদ ফ্রেমের অবস্থান ও মাপ
const photoBox = {
  x: 906,
  y: 1023,
  w: 462,
  h: 462
};

// ছবির আসল সাইজ নির্ধারণ
function getPhotoSize() {
  const base = Math.max(
    photoBox.w / photo.width,
    photoBox.h / photo.height
  );

  return {
    width: photo.width * base * photoScale,
    height: photo.height * base * photoScale
  };
}

// ছবির অবস্থান নিয়ন্ত্রণ
function updatePhotoPosition() {

  if (!photo) return;

  const size = getPhotoSize();

  const centerX = photoBox.x + photoBox.w / 2;
  const centerY = photoBox.y + photoBox.h / 2;

  // ফ্রেমের বাইরে ফাঁকা জায়গা যেন না দেখা যায়
  const minX = photoBox.x + photoBox.w - size.width / 2;
  const maxX = photoBox.x + size.width / 2;

  const minY = photoBox.y + photoBox.h - size.height / 2;
  const maxY = photoBox.y + size.height / 2;

  const actualX = Math.max(
    minX,
    Math.min(maxX, centerX + photoOffsetX)
  );

  const actualY = Math.max(
    minY,
    Math.min(maxY, centerY + photoOffsetY)
  );

  photoOffsetX = actualX - centerX;
  photoOffsetY = actualY - centerY;

  // স্লাইডারের মান আপডেট
  photoHorizontal.value = Math.round(photoOffsetX);
  photoVertical.value = Math.round(photoOffsetY);

  document.getElementById("horizontalValue").textContent =
    Math.round(photoOffsetX);

  document.getElementById("verticalValue").textContent =
    Math.round(photoOffsetY);
}

// সম্পূর্ণ ফটোকার্ড আঁকা
function draw() {

  if (!template.complete || !template.naturalWidth) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // মূল ফটোকার্ড
  ctx.drawImage(template, 0, 0, 1568, 1656);

  // ব্যবহারকারীর ছবি
  if (photo) {

    updatePhotoPosition();

    const size = getPhotoSize();

    const centerX =
      photoBox.x + photoBox.w / 2 + photoOffsetX;

    const centerY =
      photoBox.y + photoBox.h / 2 + photoOffsetY;

    ctx.save();

    // হলুদ ফ্রেমের বাইরে ছবি যাবে না
    ctx.beginPath();

    ctx.rect(
      photoBox.x,
      photoBox.y,
      photoBox.w,
      photoBox.h
    );

    ctx.clip();

    ctx.drawImage(
      photo,
      centerX - size.width / 2,
      centerY - size.height / 2,
      size.width,
      size.height
    );

    ctx.restore();
  }

  // ব্যবহারকারীর নাম
  const name = nameInput.value.trim();

  if (name) {

    ctx.save();

    // নামের পেছনের জায়গা
    ctx.fillStyle = "#80520a";

    ctx.beginPath();

    ctx.roundRect(
      780,
      1515,
      730,
      65,
      10
    );

    ctx.fill();

    let size = Number(nameSize.value);

    ctx.font = `bold ${size}px sans-serif`;

    // নাম বড় হলে নিজে থেকেই ছোট হবে
    while (
      ctx.measureText(name).width > 680 &&
      size > 14
    ) {
      size--;
      ctx.font = `bold ${size}px sans-serif`;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";

    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 3;

    ctx.fillText(name, nameX, nameY, 680);

    ctx.restore();
  }
}

// মূল ডিজাইন লোড
template.onload = function() {
  draw();
};

template.onerror = function() {
  statusEl.textContent =
    "template.jpg ফাইলটি পাওয়া যায়নি। ফাইলের নাম পরীক্ষা করুন।";
};

// ছবি আপলোড
photoInput.addEventListener("change", function(e) {

  const file = e.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("সঠিক ছবি নির্বাচন করুন।");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {

    const img = new Image();

    img.onload = function() {

      photo = img;

      photoScale = 1;
      photoOffsetX = 0;
      photoOffsetY = 0;

      zoom.value = 100;

      document.getElementById("zoomValue").textContent = "100%";

      updatePhotoPosition();
      draw();

      statusEl.textContent =
        "আপনার ছবি সফলভাবে যুক্ত হয়েছে।";
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

// ছবির আকার ছোট-বড়
zoom.addEventListener("input", function() {

  photoScale = Number(zoom.value) / 100;

  document.getElementById("zoomValue").textContent =
    zoom.value + "%";

  draw();
});

// ছবি ওপর-নিচ
photoVertical.addEventListener("input", function() {

  photoOffsetY = Number(photoVertical.value);

  draw();
});

// ছবি ডানে-বামে
photoHorizontal.addEventListener("input", function() {

  photoOffsetX = Number(photoHorizontal.value);

  draw();
});

// নামের আকার
nameSize.addEventListener("input", function() {

  document.getElementById("nameSizeValue").textContent =
    nameSize.value;

  draw();
});

// নাম পরিবর্তন
nameInput.addEventListener("input", draw);

// ক্যানভাসের অবস্থান নির্ধারণ
function getPoint(e) {

  const rect = canvas.getBoundingClientRect();

  return {
    x: (e.clientX - rect.left) *
       canvas.width / rect.width,

    y: (e.clientY - rect.top) *
       canvas.height / rect.height
  };
}

// ছবি ও নাম ধরে সরানো
canvas.addEventListener("pointerdown", function(e) {

  const p = getPoint(e);

  if (
    p.y >= 1490 &&
    p.y <= 1600 &&
    p.x >= 760 &&
    p.x <= 1520 &&
    nameInput.value.trim()
  ) {

    dragging = "name";

    start = {
      x: p.x,
      y: p.y,
      bx: nameX,
      by: nameY
    };

  } else if (
    photo &&
    p.x >= photoBox.x &&
    p.x <= photoBox.x + photoBox.w &&
    p.y >= photoBox.y &&
    p.y <= photoBox.y + photoBox.h
  ) {

    dragging = "photo";

    start = {
      x: p.x,
      y: p.y,
      bx: photoOffsetX,
      by: photoOffsetY
    };
  }

  if (dragging) {
    canvas.setPointerCapture(e.pointerId);
  }
});

canvas.addEventListener("pointermove", function(e) {

  if (!dragging || !start) return;

  const p = getPoint(e);

  const dx = p.x - start.x;
  const dy = p.y - start.y;

  if (dragging === "photo") {

    photoOffsetX = start.bx + dx;
    photoOffsetY = start.by + dy;

    updatePhotoPosition();

  } else {

    nameX = start.bx + dx;
    nameY = start.by + dy;
  }

  draw();
});

function stopDragging() {
  dragging = null;
  start = null;
}

canvas.addEventListener("pointerup", stopDragging);
canvas.addEventListener("pointercancel", stopDragging);

// সবকিছু রিসেট
document.getElementById("resetBtn").addEventListener("click", function() {

  photoScale = 1;

  photoOffsetX = 0;
  photoOffsetY = 0;

  nameX = 1145;
  nameY = 1550;

  zoom.value = 100;
  photoVertical.value = 0;
  photoHorizontal.value = 0;
  nameSize.value = 34;

  document.getElementById("zoomValue").textContent = "100%";
  document.getElementById("verticalValue").textContent = "0";
  document.getElementById("horizontalValue").textContent = "0";
  document.getElementById("nameSizeValue").textContent = "34";

  draw();
});

// PNG ডাউনলোড
document.getElementById("downloadBtn").addEventListener("click", function() {

  if (!photo) {
    alert("প্রথমে নিজের ছবি আপলোড করুন!");
    return;
  }

  draw();

  canvas.toBlob(function(blob) {

    if (!blob) {
      alert("ডাউনলোড তৈরি করা যায়নি।");
      return;
    }

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "My-Photo-Card.png";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(function() {
      URL.revokeObjectURL(url);
    }, 1000);

    statusEl.textContent =
      "আপনার ফটোকার্ড ডাউনলোড হয়েছে।";

  }, "image/png");
});
