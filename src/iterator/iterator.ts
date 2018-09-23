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

/**
 * computes the spatial index for the given offset.
 */
export function to_spatial (bounds: number[], offset: number): number[]  {
  let array  = new Array <number> (bounds.length)
  let extent = 1
  for (let i = 0; i < bounds.length; i++) {
    if (i > 0) extent *= bounds[i - 1]
    array[i] = Math.floor(offset / extent % bounds[i])
  } return array
}

/**
 * computes the index offset for the given spatial index.
 */
export function to_offset (bounds: number[], address: number[]): number {
  if(bounds.length !== address.length) throw Error("address-index: dimensional mismatch")
  let [acc, mul] = [0, 1]
  for (let i = 0; i < bounds.length; i++) {
    acc += (address[i] * mul)
    mul *= bounds[i]
  } return acc
}


export class Iterator {
  private index:  number = 0
  private length: number = 0
  constructor(private dimensions: number[]) {
    this.length = dimensions.reduce((acc, c) => acc * c, 1)
  }
  public next(): number[] {
    const address = to_spatial(this.dimensions, this.index)
    this.index += 1
    this.index = (this.index % this.length)
    return address
  }
}