import PdfPrinter from 'pdfmake'
import imageToBase64 from 'image-to-base64'

export const getPDFReadableStream = async (show) => {
  async function createBase64Img(url) {
    let base64Encoded = await imageToBase64(url)
    return 'data:image/jpeg;base64,' + base64Encoded
  }

  const fonts = {
    Courier: {
      normal: 'Courier',
      bold: 'Courier-Bold',
      italics: 'Courier-Oblique',
      bolditalics: 'Courier-BoldOblique',
    },
    Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique',
    },
  }

  const printer = new PdfPrinter(fonts)

  const content = [
    { image: 'moviePoster', width: '200' },
    { text: show.Title },
    { text: show.Year },
    { text: show.Type },
  ]

  const docDefinition = {
    content: [...content],
    images: {
      moviePoster: await createBase64Img(show.Poster),
    },
    defaultStyle: {
      font: 'Helvetica',
    },
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
  pdfReadableStream.end()

  return pdfReadableStream
}
