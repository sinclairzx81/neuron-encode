/*--------------------------------------------------------------------------

neuron-encode

The MIT License (MIT)

Copyright (c) 2018 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

export class Loader {

  /** returns a device context */
  private static context(width: number, height: number): CanvasRenderingContext2D {
    const canvas = document.createElement("canvas")
    canvas.width  = width
    canvas.height = height
    return canvas.getContext("2d")
  }

  /** loads the given image */
  public static load(url: string, width: number, height: number): Promise<ImageData> {
    return new Promise<ImageData>((resolve, reject) => {
      const image = new Image()
      image.src = url
      image.onload = (e) => {
        const context = Loader.context(width, height)
        context.clearRect(0, 0, width, height)
        context.drawImage(image, 0, 0, width, height)
        resolve(context.getImageData(0, 0, width, height))
      }
    })
  }
}