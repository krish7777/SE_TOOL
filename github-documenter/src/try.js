const { jsPDF } = require("jspdf");

const fs = require('fs')

const fileUrl = "./report.txt"

var data = fs.readFileSync(fileUrl)
const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [40, 15]
});



doc.text(data.toString(), 1, 1);

doc.save("a4.pdf");
console.log(doc.getTextDimensions(data.toString()))
