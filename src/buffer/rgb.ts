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

import { ToImageData } from "./interfaces"

/** 
 * RgbBuffer
 * 
 * Maintains a 2-dimensional image buffer with elements encoded
 * as vec3 with a range between 0 and 255. This type is constructed
 * from a ImageData and will retain the original ImageData as well
 * as an internal Float32Array buffer which is used for encoding. 
 */
export class RgbBuffer implements ToImageData {
  public width: number
  public height: number
  /**
   * Creates a new RgbaBuffer
   * @param image the image data to construct with.
   */
  constructor(private image: ImageData) {
    this.width = image.width
    this.height = image.height
  }

  /** returns the index at the given x and y */
  private offset(x: number, y: number): number {
    return x + (y * this.image.width)
  }

  /** sets the value at the given x and y */
  public set(x: number, y: number, rgb: [number, number, number]) {
    const offset = this.offset(x, y) * 4
    this.image.data[offset + 0] = rgb[0]
    this.image.data[offset + 1] = rgb[1]
    this.image.data[offset + 2] = rgb[2]
    this.image.data[offset + 4] = 1
  }

  /** gets the vector at the given x and y */
  public get(x: number, y: number): [number, number, number] {
    const offset = this.offset(x, y) * 4
    return [
      this.image.data[offset + 0],
      this.image.data[offset + 1],
      this.image.data[offset + 2]
    ]
  }

  /** maps the data into a rgba ImageData object */
  public to_image_data(): ImageData {
    return this.image
  }
}
