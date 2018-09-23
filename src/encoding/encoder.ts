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

import { Network, Tensor, Trainer } from "../network/index"
import { VectorBuffer }from "../buffer/index"

const range = (count: number) => (new Array(count)).fill(0)


export class Encoder {
  private network: Trainer
  constructor(private width: number, private depth: number) {
    const input  = new Tensor(3)
    const output = new Tensor(3)
    const hidden = range(depth).map(_ => new Tensor(this.width, "tanh"))
    this.network = new Trainer(new Network([input, ...hidden, output]), { step: 0.0025, momentum: 0.0125 })
  }

  /**
   * trains this network.
   * @param input the vector 3 encoded image.
   * @param x the training region x value.
   * @param y the training region y value.
   * @param width the training region width value.
   * @param height the training region height value.
   * @param z the z offset of the training image (-1 to 1)
   */
  public input(buffer: VectorBuffer, x: number, y: number, width: number, height: number, z: number): void {
    for(let iy = y; iy < (y + height); iy++) {
      for(let ix = x; ix < (x + width); ix++) {
        const sx = ((ix / buffer.width) - 0.5 * 2.0)
        const sy = ((iy / buffer.height) - 0.5 * 2.0)
        const v  = buffer.get(ix, iy)
        this.network.backward([sx, sy, z], [v[0], v[1], v[2]])
      }
    }
  }

  /** 
   * writes the results of the network into the given output buffer.
   * @param buffer the target buffer to write to.
   * @param z the z offset to get.
   */
  public output(z: number, buffer: VectorBuffer) {
    for(let iy = 0; iy < buffer.width; iy++) {
      for(let ix = 0; ix < buffer.height; ix++) {
        const x = ((ix / buffer.width) - 0.5 * 2.0)
        const y = ((iy / buffer.height) - 0.5 * 2.0)
        const v = this.network.forward([x, y, z])
        buffer.set(ix, iy, [v[0], v[1], v[2]])
      }
    }
  }
}