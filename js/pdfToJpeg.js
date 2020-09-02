// converting numbers to three digits
function threeDigits(execution, i) {
    if (execution) {
        if (i == 0) {
            return '000';
        }
        else if (i < 10) {
            return '00' + i;
        }
        else if (i < 100) {
            return '0' + i;
        }
        else {
            return i;
        }
    }
    else if (value === false) {
        return i;
    }
}

let fileArea = document.getElementById('drag-drop-area');
let fileInput = document.getElementById('file-input');
const executeButton = document.getElementById('execute');
let droppedFiles = [];  // Variable to store image file
let convertedFiles = [];

// File input
fileArea.addEventListener('dragover', function (evt) {
    evt.preventDefault();
    fileArea.classList.add('dragover');
    fileArea.classList.add('active');
});

fileArea.addEventListener('dragleave', function (evt) {
    evt.preventDefault();
    fileArea.classList.remove('dragover');
    fileArea.classList.remove('active');
});

fileArea.addEventListener('drop', function (evt) {
    evt.preventDefault();
    fileArea.classList.remove('dragenter');
    fileArea.classList.remove('active');
    // Image data is placed in these dropped Files
    droppedFiles = evt.dataTransfer.files;
    fileInput.files = droppedFiles;
});

fileInput.addEventListener('change', function (evt) {
    droppedFiles = evt.target.files;
}, false);

// Run button
executeButton.addEventListener('click', function () {
    if (droppedFiles.length >= 1) {
        config.applyConfigOfProcess();

        removeCanvasElement();
        convertPdfToImage();
    }
})

// Execution process
function convertPdfToImage() {
    let PDFbase64;

    if (droppedFiles.length > 0) {
        let fileToLoad = droppedFiles[0];
        let fileReader = new FileReader();

        fileReader.onload = async function (fileLoadedEvent) {
            let base64 = fileLoadedEvent.target.result;
            PDFbase64 = atob(base64.replace('data:application/pdf;base64', ''));

            // Use async/await, Promise to process asynchronously in order
            let PDFlength = await getPDFpageLength(PDFbase64);
            compressToZip(PDFlength);
        }

        // Change data to base 64 (onload event)
        fileReader.readAsDataURL(fileToLoad);
    }
}


function removeCanvasElement() {
    let element = document.getElementById('canvas-area');
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function getPDFpageLength(PDFData) {
    // Match the return value of asynchronous processing
    return new Promise(function (resolve, reject) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/build/pdf.worker.min.js';

        let loadingTask = pdfjsLib.getDocument({ data: PDFdata });
        loadingTask.promise.then(function (pdf) {
            // console.log(pdf.numPages);
            resolve(pdf.numPages);
        });
    })
}

function drawPDFinCanvas(PDFlength, PDFdata) {
    return new Promise(function (resolve, reject) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.2.228/build/pdf.worker.min.js';

        let count = 0;
        for (let pageNUm = 1; pageNum <= PDFlength; pageNum++) {
            let loadingTask = pdfjsLib.getDocument({ data: PDFdata, });
            loadingTask.promise.then(function (pdf) {
                pdf.getPage(pageNum).then(function (page) {
                    let canvas = document.createElement('canvas');
                    canvas.id = 'PDFpage_' + pageNum;
                    document.getElementById('canvas-area').appendChild(canvas);

                    // Fetch the page
                    let scale = config.scale;
                    console.log(scale);
                    let viewport = page.getViewport({ scale: scale, });

                    // Prepare canvas using PDF page dimensions
                    let context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render PDF page into canvas context
                    let renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    page.render(renderContext).promise.then(function () {
                        if (count == PDFlength - 1) {
                            resolve();
                        } else {
                            count++;
                        }
                    });
                });
            });
        }
    });
}

function compressToZip(PDFlength) {
    let zip = new JSZip();
    let count = 0;
    let extension, underscore;

    if (config.type === 'image/jpeg') {
        extension = '.jpg';
    } else if (config.type === 'image/png') {
        extension = '.png';
    }

    if (config.noUnderscore) {
        underscore = '';
    } else {
        underscore = '_';
    }

    for (let i = 1; i <= PDFlength; i++) {
        let canvas = document.getElementById('PDFpage_' + i);
        let num = threeDigits(config.threeDigit, i);
        canvas.toBlob(function (image) {
            zip.folder(config.folderName)
                .file(config.imageFileName + underscore + num + extension, image, { base64: true });

            if (count == PDFlength - 1) {
                zip.generateAsync({ type: 'blob' }).then(function (content) {
                    //see FileSaver.js
                    saveAs(content, 'pdf.zip');
                });
            } else {
                count++;
            }
        }, config.type, config.quality);
    }
}
