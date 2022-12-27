import { Document, Packer, Paragraph, Table, TableCell, TableRow, VerticalAlign, ImageRun, TextRun, Header, WidthType, AlignmentType, BorderStyle} from 'docx';
import {EURVerticalLogo, EURHorizontalLogo, ErasmusLogo} from '@/util/EURlogos';
import JSZip from 'jszip';

// export function generateDocument(courseName, courseCode, gradeDateStr) {

const noBorders = {
    top: {
        style: BorderStyle.NONE,
        size: 0,
        color: "#FFFFFF"
    },
    bottom: {
        style: BorderStyle.NONE,
        size: 0,
        color: "#FFFFFF"
    },
    left: {
        style: BorderStyle.NONE,
        size: 0,
        color: "#FFFFFF"
    },
    right: {
        style: BorderStyle.NONE,
        size: 0,
        color: "#FFFFFF"
    }
}

const font = 'Museo Sans 300';
const size = 24;
const bold = true;

export function generateDocument(data) {
    const fill = '#bbbbbb'
    return new Document({
        sections: [
            {
                headers: {
                    default: new Header({
                        children: [new Paragraph({children: [
                                new ImageRun({
                                    data: EURVerticalLogo,
                                    transformation: {
                                        width: 189,
                                        height: 141,
                                    }
                                })
                            ]}),
                        ],
                    })
                },
                footers: {
                    default: new Header({
                        children: [
                            new Table({
                                rows: [
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                children: [new Paragraph({
                                                    children: [
                                                        new ImageRun({
                                                            data: EURHorizontalLogo,
                                                            transformation: {
                                                                width: 369,
                                                                height: 159,
                                                            }
                                                        })
                                                    ],
                                                    alignment: AlignmentType.LEFT
                                                    }),
                                                ],
                                                verticalAlign: VerticalAlign.CENTER,
                                                width: {
                                                    size: 700,
                                                    type: WidthType.DXA
                                                },
                                                borders: noBorders
                                            }),
                                            new TableCell({
                                                children: [new Paragraph({
                                                    children: [
                                                        new ImageRun({
                                                            data: ErasmusLogo,
                                                            transformation: {
                                                                width: 225,
                                                                height: 135,
                                                            }
                                                        })
                                                    ],
                                                    alignment: AlignmentType.RIGHT
                                                    }),
                                                ],
                                                verticalAlign: VerticalAlign.CENTER,
                                                width: {
                                                    size: 150,
                                                    type: WidthType.DXA
                                                },
                                                borders: noBorders                                         
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    })
                },
                children: [
                    new Paragraph({ children: [
                        new TextRun({ text: "Betreft/Regarding: Individueel cijfer(s) / Individual grade(s)", bold, font, size })
                    ]}),
                    new Paragraph({ children: [
                        new TextRun({ text: "Naam vak/Name course: ", bold, font, size }),
                        new TextRun({ text: `${data.courseName}`, font, size })
                    ]}),
                    new Paragraph({ children: [
                        new TextRun({ text: "Vak code/Course code: ", bold, font, size }),
                        new TextRun({ text: `${data.courseCode}`, font, size })
                    ]}),                    
                    new Paragraph({ children: [
                        new TextRun({ text: "Datum cijfer/Date grade: ", bold, font, size }),
                        new TextRun({ text: `${data.gradeDate}`, font, size })
                    ]}),                    
                    new Paragraph({ text: "" }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [
                                                new TextRun({ text: 'Studentnummer / Studentnumber', bold, font, size })
                                            ]
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                        shading: { fill },
                                        width: {
                                            size: 30,
                                            type: WidthType.PERCENTAGE
                                        },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [
                                                new TextRun({ text: 'Naam student / name student', bold, font, size })
                                            ]
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                        shading: { fill },
                                        width: {
                                            size: 60,
                                            type: WidthType.PERCENTAGE
                                        },                                        
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [
                                                new TextRun({text: 'Cijfer / Grade', bold, font, size})
                                            ]
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                        shading: { fill },
                                        width: {
                                            size: 30,
                                            type: WidthType.PERCENTAGE
                                        },                                        

                                    }),
                                ],
                                tableHeader: true
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [
                                                new TextRun({ text: data.studentId, font, size })
                                            ]
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [
                                                new TextRun({ text: data.studentName, font, size })
                                            ]
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [
                                                new TextRun({ text: data.studentResult, font, size })
                                            ]
                                        })],
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
                                        children: [new Paragraph({ children: [
                                                new TextRun({text: 'Datum ondertekening /\n Date signature', bold, font, size})
                                            ]
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                        shading: { fill },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [
                                                new TextRun({text: 'Naam & Handtekening docent /\n Name & Signature professor', bold, font, size})
                                            ]
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                        shading: { fill },
                                    }),
                                ],
                                tableHeader: true
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [
                                                new TextRun({ text: data.signatureDate, font, size })
                                            ]
                                        })],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [
                                                            new TextRun({ text: data.teacherName, font, size })
                                                        ]   
                                                    }),
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