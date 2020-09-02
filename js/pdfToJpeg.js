// File information class
class singleFileInfo {
    constructor(number, name, lastModified, size, type) {
        this.number = number;
        this.name = name;
        this.lastModified = lastModified;
        this.size = size;
        this.type = type;
    }
}

// Main code
let fileArea = document.getElementById('dragDropArea');
let fileInput = document.getElementById('fileInput');
let btn = document.getElementById('execute');
let files;

fileArea.addEventListener('dragover', function(evt){
    evt.preventDefault();
    fileArea.classList.add('dragover');
});
fileArea.addEventListener('dragleave', function(evt){
    evt.preventDefault();
    fileArea.classList.remove('dragover');
});

fileArea.addEventListener('drop', function(evt) {
    evt.preventDefault();
    fileArea.classList.remove('drageneter');
    // Image data is put in these files
    files = evt.dataTransfer.files;
    fileInput.files = files;
    console.log(files);

    const url = window.URL.createObjectURL(files[0]);
    console.log(url);

    let loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf) {

        console.log(pdf);

        let pageNumber = 1;
        pdf.getPage(pageNumber).then(function(page) {
            let scale = 1.5;
            let viewport = page.getViewport({scale: scale});

            let canvas = document.getElementById('the-canvas');
            let context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page in canvas context
            let renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            console.log(renderContext);

            let renderTask = page.render(renderContext);

            console.log(page);
        });
    });
});

function readFile(file) {
    const reader = new FileReader();
    reader.onload = function () {
        console.log(reader.results);
        return reader.result;
    }
    reader(file);
}
