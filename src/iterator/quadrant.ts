import { Iterator } from "./iterator"

export interface QuadrantIndex {
  width:  number
  height: number
  x:      number
  y:      number
  z:      number
}

export class QuadrantIterator {
  private iterator: Iterator
  constructor(private width:   number,
              private height:  number,
              private swidth:  number,
              private sheight: number,
              private sdepth:  number) {

    this.iterator = new Iterator([
      width  / swidth,
      height / sheight,
      sdepth
    ])
  }

  public next(): QuadrantIndex {
    const address = this.iterator.next()
    return {
      x: address[0] * this.swidth,
      y: address[1] * this.sheight,
      width:   this.swidth,
      height:  this.sheight,
      z:   address[2]
    }
  }
}