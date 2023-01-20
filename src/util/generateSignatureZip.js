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

function sanitizeName(name) {
    let result = name;
    const commaIdx = name.indexOf(',');
    // Flip the name if a comma is present
    if (commaIdx >= 0) {
        result = name.slice(commaIdx+1).trim() + ' ' + name.slice(0, commaIdx).trim();
    }
    return sanitizeFilename(result);
}

// This list of characters and replacements was taken from https://web.archive.org/web/20130208144021/http://neo22s.com/slug
const accents = ['À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'ß', 'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', 'ø', 'ù', 'ú', 'û', 'ü', 'ý', 'ÿ', 'Ā', 'ā', 'Ă', 'ă', 'Ą', 'ą', 'Ć', 'ć', 'Ĉ', 'ĉ', 'Ċ', 'ċ', 'Č', 'č', 'Ď', 'ď', 'Đ', 'đ', 'Ē', 'ē', 'Ĕ', 'ĕ', 'Ė', 'ė', 'Ę', 'ę', 'Ě', 'ě', 'Ĝ', 'ĝ', 'Ğ', 'ğ', 'Ġ', 'ġ', 'Ģ', 'ģ', 'Ĥ', 'ĥ', 'Ħ', 'ħ', 'Ĩ', 'ĩ', 'Ī', 'ī', 'Ĭ', 'ĭ', 'Į', 'į', 'İ', 'ı', 'Ĳ', 'ĳ', 'Ĵ', 'ĵ', 'Ķ', 'ķ', 'Ĺ', 'ĺ', 'Ļ', 'ļ', 'Ľ', 'ľ', 'Ŀ', 'ŀ', 'Ł', 'ł', 'Ń', 'ń', 'Ņ', 'ņ', 'Ň', 'ň', 'ŉ', 'Ō', 'ō', 'Ŏ', 'ŏ', 'Ő', 'ő', 'Œ', 'œ', 'Ŕ', 'ŕ', 'Ŗ', 'ŗ', 'Ř', 'ř', 'Ś', 'ś', 'Ŝ', 'ŝ', 'Ş', 'ş', 'Š', 'š', 'Ţ', 'ţ', 'Ť', 'ť', 'Ŧ', 'ŧ', 'Ũ', 'ũ', 'Ū', 'ū', 'Ŭ', 'ŭ', 'Ů', 'ů', 'Ű', 'ű', 'Ų', 'ų', 'Ŵ', 'ŵ', 'Ŷ', 'ŷ', 'Ÿ', 'Ź', 'ź', 'Ż', 'ż', 'Ž', 'ž', 'ſ', 'ƒ', 'Ơ', 'ơ', 'Ư', 'ư', 'Ǎ', 'ǎ', 'Ǐ', 'ǐ', 'Ǒ', 'ǒ', 'Ǔ', 'ǔ', 'Ǖ', 'ǖ', 'Ǘ', 'ǘ', 'Ǚ', 'ǚ', 'Ǜ', 'ǜ', 'Ǻ', 'ǻ', 'Ǽ', 'ǽ', 'Ǿ', 'ǿ'];
const replacements = ['A', 'A', 'A', 'A', 'A', 'A', 'AE', 'C', 'E', 'E', 'E', 'E', 'I', 'I', 'I', 'I', 'D', 'N', 'O', 'O', 'O', 'O', 'O', 'O', 'U', 'U', 'U', 'U', 'Y', 's', 'a', 'a', 'a', 'a', 'a', 'a', 'ae', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'n', 'o', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'y', 'y', 'A', 'a', 'A', 'a', 'A', 'a', 'C', 'c', 'C', 'c', 'C', 'c', 'C', 'c', 'D', 'd', 'D', 'd', 'E', 'e', 'E', 'e', 'E', 'e', 'E', 'e', 'E', 'e', 'G', 'g', 'G', 'g', 'G', 'g', 'G', 'g', 'H', 'h', 'H', 'h', 'I', 'i', 'I', 'i', 'I', 'i', 'I', 'i', 'I', 'i', 'IJ', 'ij', 'J', 'j', 'K', 'k', 'L', 'l', 'L', 'l', 'L', 'l', 'L', 'l', 'l', 'l', 'N', 'n', 'N', 'n', 'N', 'n', 'n', 'O', 'o', 'O', 'o', 'O', 'o', 'OE', 'oe', 'R', 'r', 'R', 'r', 'R', 'r', 'S', 's', 'S', 's', 'S', 's', 'S', 's', 'T', 't', 'T', 't', 'T', 't', 'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u', 'W', 'w', 'Y', 'y', 'Y', 'Z', 'z', 'Z', 'z', 'Z', 'z', 's', 'f', 'O', 'o', 'U', 'u', 'A', 'a', 'I', 'i', 'O', 'o', 'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u', 'A', 'a', 'AE', 'ae', 'O', 'o'];
const sanitizeRegex = /[^A-Za-z0-9\s._-]/g;

export function sanitizeFilename(filename) {
    let result = filename;
    // Replace accents
    for (let i=0; i < accents.length; i++) {
        result = result.replaceAll(accents[i], replacements[i]);
    }
    // Sanitize
    return result.replaceAll(sanitizeRegex, '_');
}

export function generateZipFile(documents) {
    const promises = [];
    const zip = new JSZip();
    for (const {studentid, studentname, document} of documents) {
        const name = sanitizeName(studentname);
        const path = `Grade Change Form ${studentid} ${name}.docx`;
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