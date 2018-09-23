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

import { Loader } from "./loader/index"
import { Encoder } from "./encoding/index"
import { Device } from "./render/index"
import { VectorBuffer } from "./buffer/index"
import { QuadrantIterator } from "./iterator/index"


const select_image = (count: number) => {
  const idx0 = Math.floor(Math.random() * count)
  while(true) {
    const idx1 = Math.floor(Math.random() * count)
    if(idx0 !== idx1) {
      return {
        left: `./images/${idx0}.png`,
        right: `./images/${idx1}.png`
      }
    }
  }
}
const images = select_image(8);
(async () => {
  const devices = {
    slider: document.getElementById("slider") as HTMLInputElement,
    left: new Device(document.getElementById("canvas-left") as HTMLCanvasElement),
    right: new Device(document.getElementById("canvas-right") as HTMLCanvasElement),
    middle: new Device(document.getElementById("canvas-middle") as HTMLCanvasElement),
  }
  const buffers = {
    left: {
      full: new VectorBuffer(await Loader.load(images.left, 64, 64)),
      half: new VectorBuffer(await Loader.load(images.left, 32, 32))
    },
    right: {
      full: new VectorBuffer(await Loader.load(images.right, 64, 64)),
      half: new VectorBuffer(await Loader.load(images.right, 32, 32))
    },
    middle: {
      full: new VectorBuffer(new ImageData(64, 64))
    }
  }

  devices.slider.oninput = () => draw()
  const draw = () => {
    const z = parseFloat(devices.slider.value)
    encoder.output(z, buffers.middle.full)
    devices.middle.draw(buffers.middle.full)
  }

  const iterator  = new QuadrantIterator(32, 32, 4, 4, 2)
  const encoder = new Encoder(32, 3)
  let count = 0
  const loop = () => {
    requestAnimationFrame(() => {
      // calculate next quadrant to train
      const next   = iterator.next()
      const device = (next.z === 0) ? devices.left : devices.right
      const full   = (next.z === 0) ? buffers.left.full : buffers.right.full
      const half   = (next.z === 0) ? buffers.left.half : buffers.right.half
      const depth  = (next.z === 0) ? -1 : 1
  
      // draw quadant over source
      device.clear()
      device.draw(full)
      device.rect(
        next.x * 2, 
        next.y * 2, 
        next.width * 2, 
        next.height * 2)
  
      // submit quadrant for training
      encoder.input(half, 
        next.x, 
        next.y, 
        next.width, 
        next.height, 
        depth)
      
      // write network output
      if (next.x === 0 && next.y === 0) {
        draw()
      }
      loop()
    })
  }
  loop()
})()
