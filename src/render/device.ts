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

import { ToImageData } from "../buffer/index"

/** simple graphical rendering device. */
export class Device {
  private context: CanvasRenderingContext2D
  constructor(private canvas: HTMLCanvasElement) {
    this.context = this.canvas.getContext("2d")
  }

  /** clears this device */
  public clear() {
    this.context.fillStyle = '#000000'
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /** submits this image to the device. */
  public draw(image: ToImageData) {
    this.context.putImageData(image.to_image_data(), 0, 0)
  }

  /** draws a rectangle */
  public rect(x: number, 
              y: number, 
              width: number, 
              height: number, 
              color: number = 0xFFFFFF88, 
              border: number = 0xFFFFFF88) {
    this.context.fillStyle = '#' + color.toString(16)
    this.context.fillRect(x, y, width, height)

    this.context.strokeStyle = '#' + border.toString(16)
    this.context.beginPath()
    this.context.rect(x, y, width, height)
    this.context.stroke()
    
  }
}