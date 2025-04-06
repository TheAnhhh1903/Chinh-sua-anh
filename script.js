// Khai báo các biến
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let img = new Image();
let logo = new Image();

// Hàm tải ảnh
function loadImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Hàm tải logo
function loadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            logo.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Hàm vẽ lại ảnh với các hiệu ứng
img.onload = function () {
    drawImage();
};

logo.onload = function () {
    drawImage();
};

// Hàm vẽ lại ảnh
function drawImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa canvas trước khi vẽ

    // Áp dụng xoay ảnh
    const rotate = parseInt(document.getElementById("rotate").value);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotate * Math.PI / 180);
    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height); // Vẽ ảnh gốc
    ctx.restore();

    applyFilters(); // Áp dụng các bộ lọc ảnh

    if (logo.src) {
        const size = parseInt(document.getElementById("logo-size").value);
        const pos = document.getElementById("logo-position").value;
        let x = 0, y = 0;

        switch (pos) {
            case "topcenter": x = (canvas.width - size) / 2; y = 10; break;
            case "topright": x = canvas.width - size - 10; y = 10; break;
            case "middleleft": x = 10; y = (canvas.height - size) / 2; break;
            case "middlecenter": x = (canvas.width - size) / 2; y = (canvas.height - size) / 2; break;
            case "middleright": x = canvas.width - size - 10; y = (canvas.height - size) / 2; break;
            case "bottomleft": x = 10; y = canvas.height - size - 10; break;
            case "bottomcenter": x = (canvas.width - size) / 2; y = canvas.height - size - 10; break;
            case "bottomright": x = canvas.width - size - 10; y = canvas.height - size - 10; break;
            default: x = 10; y = 10;
        }

        ctx.drawImage(logo, x, y, size, size); // Vẽ logo lên ảnh
    }
}

// Hàm áp dụng các bộ lọc (brightness, contrast, v.v...)
function applyFilters() {
    const brightness = parseInt(document.getElementById("brightness").value);
    const contrast = parseInt(document.getElementById("contrast").value);
    const tint = parseInt(document.getElementById("tint").value);
    const temp = parseInt(document.getElementById("temp").value);
    const hue = parseInt(document.getElementById("hue").value);
    const saturation = parseInt(document.getElementById("saturation").value);

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Áp dụng độ sáng
        data[i] = clamp(data[i] + brightness, 0, 255);
        data[i + 1] = clamp(data[i + 1] + brightness, 0, 255);
        data[i + 2] = clamp(data[i + 2] + brightness, 0, 255);

        // Áp dụng độ tương phản
        data[i] = clamp((data[i] - 128) * (contrast / 100 + 1) + 128, 0, 255);
        data[i + 1] = clamp((data[i + 1] - 128) * (contrast / 100 + 1) + 128, 0, 255);
        data[i + 2] = clamp((data[i + 2] - 128) * (contrast / 100 + 1) + 128, 0, 255);

        // Áp dụng các bộ lọc khác (nếu có)
        data[i] = clamp(data[i] + temp, 0, 255);
        data[i + 1] = clamp(data[i + 1] + tint, 0, 255);

        // Áp dụng Hue và Saturation
        let hsv = rgbToHsv(data[i], data[i + 1], data[i + 2]);
        hsv[0] = (hsv[0] + hue / 180) % 1; // Điều chỉnh Hue
        if (hsv[0] < 0) hsv[0] += 1; // Đảm bảo Hue nằm trong khoảng từ 0 đến 1
        hsv[1] = clamp(hsv[1] + saturation / 100, 0, 1); // Điều chỉnh Saturation
        let rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]);
        data[i] = rgb[0];
        data[i + 1] = rgb[1];
        data[i + 2] = rgb[2];
    }

    ctx.putImageData(imageData, 0, 0); // Cập nhật lại canvas với dữ liệu đã thay đổi

    drawLogo(); // Vẽ lại logo (nếu có)
}

// Hàm vẽ logo
function drawLogo() {
    if (logo.src) {
        const size = parseInt(document.getElementById("logo-size").value);
        const pos = document.getElementById("logo-position").value;
        let x = 0, y = 0;

        switch (pos) {
            case "topcenter": x = (canvas.width - size) / 2; y = 10; break;
            case "topright": x = canvas.width - size - 10; y = 10; break;
            case "middleleft": x = 10; y = (canvas.height - size) / 2; break;
            case "middlecenter": x = (canvas.width - size) / 2; y = (canvas.height - size) / 2; break;
            case "middleright": x = canvas.width - size - 10; y = (canvas.height - size) / 2; break;
            case "bottomleft": x = 10; y = canvas.height - size - 10; break;
            case "bottomcenter": x = (canvas.width - size) / 2; y = canvas.height - size - 10; break;
            case "bottomright": x = canvas.width - size - 10; y = canvas.height - size - 10; break;
            default: x = 10; y = 10;
        }

        ctx.drawImage(logo, x, y, size, size); // Vẽ logo
    }
}

// Hàm giới hạn giá trị
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Hàm chuyển đổi RGB sang HSV
function rgbToHsv(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max == 0 ? 0 : d / max;
    if (max == min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, v];
}

// Hàm chuyển đổi HSV sang RGB
function hsvToRgb(h, s, v) {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Lắng nghe sự kiện thay đổi trên các thanh trượt và cập nhật ảnh
document.getElementById("brightness").addEventListener("input", drawImage);
document.getElementById("contrast").addEventListener("input", drawImage);
document.getElementById("temp").addEventListener("input", drawImage);
document.getElementById("tint").addEventListener("input", drawImage);
document.getElementById("rotate").addEventListener("input", drawImage);
document.getElementById("hue").addEventListener("input", drawImage);
document.getElementById("saturation").addEventListener("input", drawImage);

// Lắng nghe sự kiện thay đổi vị trí logo và vẽ lại logo ngay lập tức
document.getElementById("logo-position").addEventListener("change", drawImage);

// Nút tải ảnh về
document.getElementById("download-link").addEventListener("click", function (e) {
    e.preventDefault();
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Hàm reset các hiệu ứng
function resetAdjustments() {
    const sliders = document.querySelectorAll("input[type=range]");
    sliders.forEach(slider => {
        slider.value = slider.defaultValue;
    });
    if (img.src) drawImage();
}

// Hàm reset các hiệu ứng riêng biệt
function resetTemp() {
    document.getElementById("temp").value = 0;
    drawImage();
}

function resetTint() {
    document.getElementById("tint").value = 0;
    drawImage();
}

function resetBrightness() {
    document.getElementById("brightness").value = 0;
    drawImage();
}

function resetContrast() {
    document.getElementById("contrast").value = 0;
    drawImage();
}

function resetHue() {
    document.getElementById("hue").value = 0;
    drawImage();
}

function resetSaturation() {
    document.getElementById("saturation").value = 0;
    drawImage();
}

function resetRotate() {
    document.getElementById("rotate").value = 0;
    drawImage();
}