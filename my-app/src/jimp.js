import Jimp from 'jimp';
// const { convolution, colorDiff } = require('jimp');
var diff = require('color-diff');

Jimp.prototype.uncappedConvolution = function (kernel, edgeHandling, cb) {
    if (typeof edgeHandling === 'function' && typeof cb === 'undefined') {
        cb = edgeHandling;
        edgeHandling = null;
    }

    if (!edgeHandling) {
        edgeHandling = this.constructor.EDGE_EXTEND;
    }

    const newData = Buffer.from(this.bitmap.data);
    const newnewData = [];
    const kRows = kernel.length;
    const kCols = kernel[0].length;
    const rowEnd = Math.floor(kRows / 2);
    const colEnd = Math.floor(kCols / 2);
    const rowIni = -rowEnd;
    const colIni = -colEnd;

    let weight;
    let rSum;
    let gSum;
    let bSum;
    let ri;
    let gi;
    let bi;
    let xi;
    let yi;
    let idxi;

    let maxValue = Number.MIN_VALUE;
    let minValue = Number.MAX_VALUE;

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (
        x,
        y,
        idx
    ) {
        bSum = 0;
        gSum = 0;
        rSum = 0;

        for (let row = rowIni; row <= rowEnd; row++) {
            for (let col = colIni; col <= colEnd; col++) {
                xi = x + col;
                yi = y + row;
                weight = kernel[row + rowEnd][col + colEnd];
                idxi = this.getPixelIndex(xi, yi, edgeHandling);

                if (idxi === -1) {
                    bi = 0;
                    gi = 0;
                    ri = 0;
                } else {
                    ri = this.bitmap.data[idxi + 0];
                    gi = this.bitmap.data[idxi + 1];
                    bi = this.bitmap.data[idxi + 2];
                }

                rSum += weight * ri;
                gSum += weight * gi;
                bSum += weight * bi;
            }
        }

        maxValue = Math.max(rSum, gSum, bSum, maxValue);
        minValue = Math.min(rSum, gSum, bSum, minValue);

        newnewData[idx] = rSum;
        newnewData[idx + 1] = gSum;
        newnewData[idx + 2] = bSum;
        newnewData[idx + 3] = 'alpha';

        newData[idx + 0] = rSum;
        newData[idx + 1] = gSum;
        newData[idx + 2] = bSum;
    });

    function normalize(currentValue) {
        return (currentValue - minValue) / (maxValue - minValue) * 255
    }

    // normalize values
    for (let i = 0; i < newnewData.length; i++) {
        if (newnewData[i] === undefined || newnewData[i] === 'alpha') {
            continue;
        }
        let normalizedValue = normalize(newnewData[i]);
        newData[i] = normalizedValue;
    }

    // finding average
    let sum = 0;
    let count = 0;
    for (let i = 0; i < newnewData.length; i++) {
        if (newnewData[i] === undefined || newnewData[i] === 'alpha') {
            continue;
        }
        sum = sum + newData[i];
        count++;
    }

    let backgroundColor = sum / count;

    //remove alpha
    for (let i = 0; i < newnewData.length; i++) {
        if (newnewData[i] === undefined) {
            continue;
        }
        if (newnewData[i] === 'alpha') {
            const finalColor = newData[i - 1];
            const topColor = finalColor > backgroundColor ? 255 : 0;
            const alpha = (finalColor - backgroundColor) / (topColor - backgroundColor) * 200;
            newData[i - 1] = topColor;
            newData[i - 2] = topColor;
            newData[i - 3] = topColor;
            newData[i] = alpha;
        }
    }

    this.bitmap.data = newData;
    return this;
}

export async function process(image, options = {}) {
    const colorMap = {};
    const { palette, pixelate, emboss } = options;
    return await Jimp.read(await image)
        .then(async image => {
            // pixelate
            image.pixelate(pixelate);
            // // emboss
            if (emboss) {
                image.greyscale();
                // image.contrast(1);

                // construct this matrix via direction
                image.uncappedConvolution([
                    [-1, 0, 0, 0, 0],
                    [0, -1, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0],
                    [0, 0, 0, 0, 1]]);
            }

            if (palette?.length) {
                image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
                    const thisColor = {
                        R: image.bitmap.data[idx + 0],
                        G: image.bitmap.data[idx + 1],
                        B: image.bitmap.data[idx + 2]
                    };
                    const thisColorKey = `${thisColor.R}${thisColor.G}${thisColor.B}`;
                    if (!colorMap[thisColorKey]) {
                        const replaceColor = diff.closest(thisColor, palette);
                        image.bitmap.data[idx + 0] = replaceColor.R;
                        image.bitmap.data[idx + 1] = replaceColor.G;
                        image.bitmap.data[idx + 2] = replaceColor.B;
                        colorMap[thisColorKey] = replaceColor;
                    } else {
                        const replaceColor = colorMap[thisColorKey];
                        image.bitmap.data[idx + 0] = replaceColor.R;
                        image.bitmap.data[idx + 1] = replaceColor.G;
                        image.bitmap.data[idx + 2] = replaceColor.B;
                    }
                });
            }
            return await image.getBase64Async(Jimp.MIME_PNG);
        });

};



