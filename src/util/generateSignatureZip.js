import { Document, Packer, Paragraph, Table, TableCell, TableRow, VerticalAlign, ImageRun, TextRun} from 'docx';
import JSZip from 'jszip';

// export function generateDocument(courseName, courseCode, gradeDateStr) {
export function generateDocument(data) {
    const fill = '#bbbbbb'
    return new Document({
        sections: [
            {
                children: [
                    new Paragraph({ children: [
                        new TextRun({ text: "Betreft/Regarding: Individueel cijfer(s)/Individual grade(s)", bold: true})
                    ]}),
                    new Paragraph({ children: [
                        new TextRun({ text: "Naam vak/Name course: ", bold: true}),
                        new TextRun({ text: `${data.courseName}`})
                    ]}),
                    new Paragraph({ children: [
                        new TextRun({ text: "Vak code/Course code: ", bold: true}),
                        new TextRun({ text: `${data.courseCode}`})
                    ]}),                    
                    new Paragraph({ children: [
                        new TextRun({ text: "Datum cijfer/Date grade: ", bold: true}),
                        new TextRun({ text: `${data.gradeDate}`})
                    ]}),                    
                    new Paragraph({ text: "" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ text: 'Studentnummer/Studentnumber'})],
                                        verticalAlign: VerticalAlign.CENTER,
                                        shading: { fill },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: 'Naam student/name student'})],
                                        verticalAlign: VerticalAlign.CENTER,
                                        shading: { fill },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: 'Cijfer/Grade'})],
                                        verticalAlign: VerticalAlign.CENTER,
                                        shading: { fill },
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ text: data.studentId })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: data.studentName })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: data.studentResult })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Paragraph({ text: "" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ text: 'Datum ondertekening/Date signature'})],
                                        verticalAlign: VerticalAlign.CENTER,
                                        shading: { fill },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: 'Naam & Handtekening docent/Name & Signature professor' })],
                                        verticalAlign: VerticalAlign.CENTER,
                                        shading: { fill },
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ text: data.signatureDate})],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: data.teacherName }),
                                                   new Paragraph({children: [
                                                        new ImageRun({
                                                            data: data.signatureBlob,
                                                            transformation: {
                                                                width: data.signatureWidth,
                                                                height: data.signatureHeight,
                                                            }
                                                        })
                                                    ]}),
                                                    new Paragraph({ text: "" })
                                        ],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            },
        ],
    });
}

export function documentToBlob(document) {
    return Packer.toBlob(document);
}

export function generateZipFile(documents) {
    const promises = [];
    const zip = new JSZip();
    for (const {studentid, document} of documents) {
        const path = studentid+'.docx';
        const promise = new Promise((resolve, reject) => {
            documentToBlob(document)
                .then(blob => {
                    zip.file(path, blob);
                    resolve();
                }).catch(err => reject(err));
        })
        promises.push(promise);
    }
    return Promise.all(promises).then(
        () => zip.generateAsync({type: 'blob'})
    );
}

export function downloadZipFile(documents, filename) {
    return generateZipFile(documents)
    .then(blob => {
        const el = document.createElement('a');
        el.href = window.URL.createObjectURL(blob);
        el.download = filename;
        el.click();
        el.remove();
    })
}