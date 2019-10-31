//                                         Main
var video = document.getElementById("videoElement");
var s = new String();
var pixels;

function start() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
                video: true
            })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err0r) {
                console.log("Something went wrong!");
            });
    }
}

function stop() {
    var stream = video.srcObject;
    var tracks = stream.getTracks();

    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
    }

    video.srcObject = null;
}

function takeSnapshot(number) {

    if (number === 1) {
        var hidden_canvas = document.querySelector('canvas');
        takeSnapshot(4);
        takeSnapshot(5);
    } else if (number === 2) {
        var hidden_canvas = document.getElementById('canvas2');
    } else if (number === 3) {
        var hidden_canvas = document.getElementById('canvas3');
    } else if (number === 4) {
        var hidden_canvas = document.getElementById('img');
    } else if (number === 5) {
        var hidden_canvas = document.getElementById('canvasContrast');
    }

    var width = video.videoWidth,
        height = video.videoHeight,
        context = hidden_canvas.getContext('2d');

    hidden_canvas.width = width;
    hidden_canvas.height = height;

    context.drawImage(video, 0, 0, width, height);
}

function convertPhoto() {
    var hidden_canvas = document.querySelector('canvas')
    width = video.videoWidth,
        height = video.videoHeight,
        context = hidden_canvas.getContext('2d');

    hidden_canvas.width = width;
    hidden_canvas.height = height;

    context.drawImage(video, 0, 0, width, height);

    var img = context.getImageData(0, 0, width, height);
    pixels = new Uint32Array(img.data.buffer);

    for (var y = 0; y < hidden_canvas.height; y++) {
        for (var x = 0; x < hidden_canvas.width; x++) {
            var cont = PixRGB(y * width + x)
            s = s + cont;
        }
    }
    document.getElementById("inv").style.display = 'block';
    //download(s, 'myfilename.rtf', 'text/plain');
}

function PixRGB(a) {
    let r = pixels[0] & 0xFF;
    let g = (pixels[0] >> 8) & 0xFF;
    let b = (pixels[0] >> 16) & 0xFF;
    var str = new String(r.toString(2) + '\n' + g.toString(2) + '\n' + b.toString(2) + '\n');
    return str;
}

function download(data, filename, type) {
    var file = new Blob([data], {
        type: type
    });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

//                                             Contrast
//________________________________________________________________________________________________________________________________
//________________________________________________________________________________________________________________________________

//changing contrast of the photo
function processImage(inImg) {
    const width = inImg.width;
    const height = inImg.height;
    const src = new Uint32Array(inImg.data.buffer);

    // Contrast
    processCanvas('canvasContrast', width, height, function (dst) {
        let delta = parseInt($("#rangeContrast").val()) / 255;

        let avgGray = 0;
        for (let i = 0; i < dst.length; i++) {
            let r = src[i] & 0xFF;
            let g = (src[i] >> 8) & 0xFF;
            let b = (src[i] >> 16) & 0xFF;
            avgGray += (r * 0.2126 + g * 0.7152 + b * 0.0722);
        }
        avgGray /= dst.length;

        for (let i = 0; i < dst.length; i++) {
            let r = src[i] & 0xFF;
            let g = (src[i] >> 8) & 0xFF;
            let b = (src[i] >> 16) & 0xFF;

            // let gray = (r * 0.2126 + g * 0.7152 + b * 0.0722);
            let gray = avgGray;

            r += (r - gray) * delta;
            g += (g - gray) * delta;
            b += (b - gray) * delta;

            if (r > 255) r = 255;
            else if (r < 0) r = 0;
            if (g > 255) g = 255;
            else if (g < 0) g = 0;
            if (b > 255) b = 255;
            else if (b < 0) b = 0;

            dst[i] = (src[i] & 0xFF000000) | (b << 16) | (g << 8) | r;
        }

    });
}

//getting an bytes array of the photo
function getImageData(el) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = document.getElementById(el);
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    return context.getImageData(0, 0, img.width, img.height);
}

function processCanvas(canvasId, width, height, func) {
    const canvas = document.getElementById(canvasId);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const outImg = ctx.createImageData(width, height);
    const dst = new Uint32Array(outImg.data.buffer);
    func(dst);
    //write new array in the canvas
    ctx.putImageData(outImg, 0, 0);
}

//JQuery makes the photo under the label contrast to update, if you change contrast value
$("#rangeContrast").on('input change', update);

function update(e) {
    //JQuery makes the number under the label contrast to update, if you change contrast value
    $('#valueContrast').text($("#rangeContrast").val());
    //call function, which changes photo's contrast
    processImage(getImageData('img'));
}

update();

//                                                           Filter
/*------------------------------------------------------------------------------------------------------------------------------*/
function filter() {

    var hidden_canvas = document.getElementById('canvasFilter')
    width = imgf.width,
        height = imgf.height,
        context = hidden_canvas.getContext('2d');

    hidden_canvas.width = width;
    hidden_canvas.height = height;

    context.drawImage(imgf, 0, 0, width, height);

    var img = context.getImageData(0, 0, width, height);
    pixels = new Uint32Array(img.data.buffer);

    for (var y = 0; y < hidden_canvas.height; y++) {
        if (y != 0 && y != (hidden_canvas.height - 1)) {
            for (var x = 0; x < hidden_canvas.width; x++) {
                if (x != 0 && x != (hidden_canvas.width - 1)) {
                    let r = pixels[y * width + x] & 0xFF;
                    let r1 = pixels[(y - 1) * width + (x - 1)] & 0xFF;
                    let r2 = pixels[(y - 1) * width + x] & 0xFF;
                    let r3 = pixels[(y - 1) * width + (x + 1)] & 0xFF;
                    let r4 = pixels[y * width + (x - 1)] & 0xFF;
                    let r5 = pixels[y * width + (x + 1)] & 0xFF;
                    let r6 = pixels[(y + 1) * width + (x - 1)] & 0xFF;
                    let r7 = pixels[(y + 1) * width + x] & 0xFF;
                    let r8 = pixels[(y + 1) * width + (x + 1)] & 0xFF;
                    r = (r1 + r2 + r3 + r4 + r5 + r6 + r7 + r8) / 8;

                    let g = (pixels[y * width + x] >> 8) & 0xFF;
                    let g1 = (pixels[(y - 1) * width + (x - 1)] >> 8) & 0xFF;
                    let g2 = (pixels[(y - 1) * width + x] >> 8) & 0xFF;
                    let g3 = (pixels[(y - 1) * width + (x + 1)] >> 8) & 0xFF;
                    let g4 = (pixels[y * width + (x - 1)] >> 8) & 0xFF;
                    let g5 = (pixels[y * width + (x + 1)] >> 8) & 0xFF;
                    let g6 = (pixels[(y + 1) * width + (x - 1)] >> 8) & 0xFF;
                    let g7 = (pixels[(y + 1) * width + x] >> 8) & 0xFF;
                    let g8 = (pixels[(y + 1) * width + (x + 1)] >> 8) & 0xFF;
                    g = (g1 + g2 + g3 + g4 + g5 + g6 + g7 + g8) / 8;

                    let b = (pixels[y * width + x] >> 16) & 0xFF;
                    let b1 = (pixels[(y - 1) * width + (x - 1)] >> 16) & 0xFF;
                    let b2 = (pixels[(y - 1) * width + x] >> 16) & 0xFF;
                    let b3 = (pixels[(y - 1) * width + (x + 1)] >> 16) & 0xFF;
                    let b4 = (pixels[y * width + (x - 1)] >> 16) & 0xFF;
                    let b5 = (pixels[y * width + (x + 1)] >> 16) & 0xFF;
                    let b6 = (pixels[(y + 1) * width + (x - 1)] >> 16) & 0xFF;
                    let b7 = (pixels[(y + 1) * width + x] >> 16) & 0xFF;
                    let b8 = (pixels[(y + 1) * width + (x + 1)] >> 16) & 0xFF;
                    b = (b1 + b2 + b3 + b4 + b5 + b6 + b7 + b8) / 8;
                    
                    let gr = (pixels[y * width + x] >> 24) & 0xFF;
                    let gr1 = (pixels[(y - 1) * width + (x - 1)] >> 24) & 0xFF;
                    let gr2 = (pixels[(y - 1) * width + x] >> 24) & 0xFF;
                    let gr3 = (pixels[(y - 1) * width + (x + 1)] >> 24) & 0xFF;
                    let gr4 = (pixels[y * width + (x - 1)] >> 24) & 0xFF;
                    let gr5 = (pixels[y * width + (x + 1)] >> 24) & 0xFF;
                    let gr6 = (pixels[(y + 1) * width + (x - 1)] >> 24) & 0xFF;
                    let gr7 = (pixels[(y + 1) * width + x] >> 24) & 0xFF;
                    let gr8 = (pixels[(y + 1) * width + (x + 1)] >> 24) & 0xFF;
                    gr = (gr1 + gr2 + gr3 + gr4 + gr5 + gr6 + gr7 + gr8) / 8;

                    console.log(pixels[y * width + x]);
                    console.log(pixels[y * width + x] & 0xFF);
                    pixels[y * width + x] = (gr << 24) | (b << 16) | (g << 8) | r;
                    console.log(pixels[y * width + x]);
                    console.log(pixels[y * width + x] & 0xFF);
                }
            }
        }
    }
    context.putImageData(img, 0, 0);
}

document.getElementById('input').addEventListener('change', function () {
    if (this.files && this.files[0]) {
        var img = document.getElementById('imgf');
        img.src = URL.createObjectURL(this.files[0]);
        img.onload = update;
        document.getElementById('sel_image').innerHTML = "Change image";
    }
});
                                                   //1photo from 3
/*------------------------------------------------------------------------------------------------------------------*/
function photoFrom3() {
    var height = 480;
    var width = 640;
//_____________________________________________________canvas1_________________________________________
    var canvas1 = document.getElementById('canvas')
        context1 = canvas1.getContext('2d');

    var img1 = context1.getImageData(0, 0, width, height);
    pixels1 = new Uint32Array(img1.data.buffer);
//_____________________________________________________canvas2_____________________________________________    
    var canvas2 = document.getElementById('canvas2')
        context2 = canvas2.getContext('2d');

    var img2 = context2.getImageData(0, 0, width, height);
    pixels2 = new Uint32Array(img2.data.buffer);
//____________________________________________________canvas3_________________________________________________    
    var canvas3 = document.getElementById('canvas3')
        context3 = canvas3.getContext('2d');

    var img3 = context3.getImageData(0, 0, width, height);
    pixels3 = new Uint32Array(img3.data.buffer);
//__________________________________________________result_canvas_______________________________________________    
    var canvas4 = document.getElementById('canvas4')
        context4 = canvas4.getContext('2d');

    canvas4.width = width;
    canvas4.height = height;

    var img4 = context4.getImageData(0, 0, width, height);
    pixels4 = new Uint32Array(img4.data.buffer);
    
    
    for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {            
                    
                    let r1 = pixels1[y * width + x] & 0xFF;
                    let r2 = pixels2[y * width + x] & 0xFF;
                    let r3 = pixels3[y * width + x] & 0xFF;
                    let r4 = (r1 + r2 + r3) / 3;

                    let g1 = (pixels1[y * width + x] >> 8) & 0xFF;
                    let g2 = (pixels2[y * width + x] >> 8) & 0xFF;
                    let g3 = (pixels3[y * width + x] >> 8) & 0xFF;
                    let g4 = (g1 + g2 + g3) / 3;

                    let b1 = (pixels1[y * width + x] >> 16) & 0xFF;
                    let b2 = (pixels2[y * width + x] >> 16) & 0xFF;
                    let b3 = (pixels3[y * width + x] >> 16) & 0xFF;
                    let b4 = (b1 + b2 + b3) / 3;
                    
                    let gr1 = (pixels1[y * width + x] >> 24) & 0xFF;
                    let gr2 = (pixels2[y * width + x] >> 24) & 0xFF;
                    let gr3 = (pixels3[y * width + x] >> 24) & 0xFF;
                    let gr4 = (gr1 + gr2 + gr3) / 3;

                    pixels4[y * width + x] = (gr4 << 24) | (b4 << 16) | (g4 << 8) | r4;
                }
    }
    context4.putImageData(img4, 0, 0);
    context4.drawImage(canvas4, 0, 0);
    
}