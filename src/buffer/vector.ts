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
 * VectorBuffer
 */
export class VectorBuffer implements ToImageData {
  private buffer: Float32Array
  public width:   number
  public height:  number
  /** Creates a new VectorBuffer */
  constructor(private image: ImageData) {
    this.buffer = new Float32Array(image.width * image.height * 3)
    this.width  = image.width
    this.height = image.height
    for(let iy = 0; iy < image.height; iy++) {
      for(let ix = 0; ix < image.width; ix++) {
        const i = this.offset(ix, iy) * 4
        const r = image.data[i + 0]
        const g = image.data[i + 1]
        const b = image.data[i + 2]
        this.set(ix, iy, [
          ((r / 255) - 0.5) * 2.0,
          ((g / 255) - 0.5) * 2.0,
          ((b / 255) - 0.5) * 2.0
        ])
      }
    }
  }

  /** returns the index at the given x and y */
  private offset(x: number, y: number): number {
    return x + (y * this.image.width)
  }

  /** sets the value at the given x and y */
  public set(x: number, y: number, vector: [number, number, number]) {
    const offset = this.offset(x, y) * 3
    this.buffer[offset + 0] = vector[0]
    this.buffer[offset + 1] = vector[1]
    this.buffer[offset + 2] = vector[2]
  }

  /** gets the vector at the given x and y */
  public get(x: number, y: number): [number, number, number] {
    const offset = this.offset(x, y) * 3
    return [
      this.buffer[offset + 0],
      this.buffer[offset + 1],
      this.buffer[offset + 2]
    ]
  }

  /** maps the data into a rgba ImageData object */
  public to_image_data(): ImageData {
    for(let iy = 0; iy < this.image.height; iy++) {
      for(let ix = 0; ix < this.image.width; ix++) {
        const offset_a = this.offset(ix, iy) * 4
        const offset_b = this.offset(ix, iy) * 3
        this.image.data[offset_a + 0] = ((this.buffer[offset_b + 0] + 1.0) / 2.0) * 255
        this.image.data[offset_a + 1] = ((this.buffer[offset_b + 1] + 1.0) / 2.0) * 255
        this.image.data[offset_a + 2] = ((this.buffer[offset_b + 2] + 1.0) / 2.0) * 255
        this.image.data[offset_a + 3] = 255
      }
    }
    return this.image
  }
}
