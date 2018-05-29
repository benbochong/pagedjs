const { toMatchImageSnapshot } = require('jest-image-snapshot');
const path = require('path');
const gs = require('ghostscript4js')
const fs = require('fs');
const rimraf = require('rimraf');
const { DEBUG } = require('./constants');

function toMatchPDFSnapshot(received, page=1) {
	let pdfImage;
	let dirname = path.dirname(this.testPath);
	let uuid = UUID();
	let pdfPath = path.join(dirname, `./${uuid}.pdf`);
	let imagePath = path.join(dirname, `./${uuid}-${page}.png`);

	fs.writeFileSync(pdfPath, received);

	try {
		// create image
		gs.executeSync(`-dBATCH -dNOPAUSE -dFirstPage=${page} -dLastPage=${page} -sDEVICE=pngalpha -o ${imagePath} -sDEVICE=pngalpha -r144 ${pdfPath}`)
		// load image
		pdfImage = fs.readFileSync(imagePath);
		// remove output
		if (!DEBUG) {
			rimraf.sync(imagePath);
			rimraf.sync(pdfPath);
		}
	} catch (err) {
		throw err
	}

	return toMatchImageSnapshot.apply(this, [pdfImage])
}

export function UUID() {
	var d = new Date().getTime();
	if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
			d += performance.now(); //use high-precision timer if available
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

module.exports = toMatchPDFSnapshot;