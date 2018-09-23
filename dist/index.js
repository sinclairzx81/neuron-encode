(function () {
  var main = null;
  var modules = {
      "require": {
          factory: undefined,
          dependencies: [],
          exports: function (args, callback) { return require(args, callback); },
          resolved: true
      }
  };
  function define(id, dependencies, factory) {
      return main = modules[id] = {
          dependencies: dependencies,
          factory: factory,
          exports: {},
          resolved: false
      };
  }
  function resolve(definition) {
      if (definition.resolved === true)
          return;
      definition.resolved = true;
      var dependencies = definition.dependencies.map(function (id) {
          return (id === "exports")
              ? definition.exports
              : (function () {
                  if(modules[id] !== undefined) {
                    resolve(modules[id]);
                    return modules[id].exports;
                  } else {
                    try {
                      return require(id);
                    } catch(e) {
                      throw Error("module '" + id + "' not found.");
                    }
                  }
              })();
      });
      definition.factory.apply(null, dependencies);
  }
  function collect() {
      Object.keys(modules).map(function (key) { return modules[key]; }).forEach(resolve);
      return (main !== null) 
        ? main.exports
        : undefined
  }

  var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  };
  var __generator = (this && this.__generator) || function (thisArg, body) {
      var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];
              switch (op[0]) {
                  case 0: case 1: t = op; break;
                  case 4: _.label++; return { value: op[1], done: false };
                  case 5: _.label++; y = op[1]; op = [0]; continue;
                  case 7: op = _.ops.pop(); _.trys.pop(); continue;
                  default:
                      if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                      if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                      if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                      if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                      if (t[2]) _.ops.pop();
                      _.trys.pop(); continue;
              }
              op = body.call(thisArg, _);
          } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
          if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
  };
  define("loader/loader", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var Loader = (function () {
          function Loader() {
          }
          Loader.context = function (width, height) {
              var canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              return canvas.getContext("2d");
          };
          Loader.load = function (url, width, height) {
              return new Promise(function (resolve, reject) {
                  var image = new Image();
                  image.src = url;
                  image.onload = function (e) {
                      var context = Loader.context(width, height);
                      context.clearRect(0, 0, width, height);
                      context.drawImage(image, 0, 0, width, height);
                      resolve(context.getImageData(0, 0, width, height));
                  };
              });
          };
          return Loader;
      }());
      exports.Loader = Loader;
  });
  define("loader/index", ["require", "exports", "loader/loader"], function (require, exports, loader_1) {
      "use strict";
      exports.__esModule = true;
      exports.Loader = loader_1.Loader;
  });
  define("network/matrix", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var Matrix = (function () {
          function Matrix(inputs, outputs) {
              this.inputs = inputs;
              this.outputs = outputs;
              this.data = new Float32Array(this.inputs * this.outputs);
          }
          Matrix.prototype.get = function (i, o) {
              return this.data[i + (o * this.inputs)];
          };
          Matrix.prototype.set = function (i, o, value) {
              this.data[i + (o * this.inputs)] = value;
          };
          return Matrix;
      }());
      exports.Matrix = Matrix;
  });
  define("network/tensor", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var select = function (type) {
          switch (type) {
              case "identity": return {
                  activate: function (x) { return x; },
                  derive: function (x) { return 1; }
              };
              case "tanh": return {
                  activate: function (x) { return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x)); },
                  derive: function (x) { return (1 - (x * x)); }
              };
              case "binary-step": return {
                  activate: function (x) { return (x >= 0) ? 1 : 0; },
                  derive: function (x) { return (x >= 0) ? 1 : 0; }
              };
              case "relu": return {
                  activate: function (x) { return (x >= 0) ? x : 0; },
                  derive: function (x) { return (x >= 0) ? 1 : 0; }
              };
              default: throw Error("unknown activation");
          }
      };
      var Tensor = (function () {
          function Tensor(units, activation, bias) {
              if (activation === void 0) { activation = "identity"; }
              if (bias === void 0) { bias = 1.0; }
              this.data = new Float32Array(units + 1);
              this.data[this.data.length - 1] = bias;
              this.activation = select(activation);
          }
          return Tensor;
      }());
      exports.Tensor = Tensor;
  });
  define("network/network", ["require", "exports", "network/matrix"], function (require, exports, matrix_1) {
      "use strict";
      exports.__esModule = true;
      var Network = (function () {
          function Network(tensors) {
              this.tensors = tensors;
              this.output = new Array(this.tensors[this.tensors.length - 1].data.length - 1);
              this.matrices = new Array(this.tensors.length - 1);
              for (var i = 0; i < this.tensors.length - 1; i++) {
                  this.matrices[i] = new matrix_1.Matrix(this.tensors[i + 0].data.length, this.tensors[i + 1].data.length - 1);
              }
              this.kernels = new Array(this.matrices.length);
              for (var i = 0; i < this.kernels.length; i++) {
                  this.kernels[i] = {
                      input: this.tensors[i + 0],
                      output: this.tensors[i + 1],
                      matrix: this.matrices[i]
                  };
              }
          }
          Network.prototype.memory = function () {
              var tensors = this.tensors.reduce(function (acc, t) { return acc + (t.data.byteLength); }, 0);
              var matrices = this.matrices.reduce(function (acc, m) { return acc + (m.data.byteLength); }, 0);
              return tensors + matrices;
          };
          Network.prototype.inputs = function () {
              return (this.tensors[0].data.length - 1);
          };
          Network.prototype.outputs = function () {
              return (this.tensors[this.tensors.length - 1].data.length - 1);
          };
          Network.prototype.forward = function (input) {
              for (var i = 0; i < input.length; i++) {
                  this.kernels[0].input.data[i] = input[i];
              }
              for (var k = 0; k < this.kernels.length; k++) {
                  var kernel = this.kernels[k];
                  for (var o = 0; o < kernel.matrix.outputs; o++) {
                      var sum = 0;
                      for (var i = 0; i < kernel.matrix.inputs; i++) {
                          sum += kernel.matrix.get(i, o) * kernel.input.data[i];
                      }
                      kernel.output.data[o] = kernel.output.activation.activate(sum);
                  }
              }
              for (var o = 0; o < this.output.length; o++) {
                  this.output[o] = this.kernels[this.kernels.length - 1].output.data[o];
              }
              return this.output;
          };
          return Network;
      }());
      exports.Network = Network;
  });
  define("network/random", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var Random = (function () {
          function Random(seed) {
              this.seed = seed;
              this.seed = this.seed === undefined ? 1 : this.seed;
              this.a = 1103515245;
              this.c = 12345;
              this.m = Math.pow(2, 31);
          }
          Random.prototype.next = function () {
              this.seed = (this.a * this.seed + this.c) % this.m;
              return this.seed / this.m;
          };
          return Random;
      }());
      exports.Random = Random;
  });
  define("network/trainer", ["require", "exports", "network/matrix", "network/random"], function (require, exports, matrix_2, random_1) {
      "use strict";
      exports.__esModule = true;
      var Trainer = (function () {
          function Trainer(network, options) {
              this.network = network;
              this.options = options;
              this.options = this.options || {};
              this.options.seed = this.options.seed || 0;
              this.options.step = this.options.step || 0.15;
              this.options.momentum = this.options.momentum || 0.5;
              this.random = new random_1.Random(this.options.seed);
              this.deltas = new Array(this.network.matrices.length);
              for (var i = 0; i < this.network.matrices.length; i++) {
                  this.deltas[i] = new matrix_2.Matrix(this.network.matrices[i].inputs, this.network.matrices[i].outputs);
              }
              this.gradients = new Array(this.network.tensors.length);
              for (var i = 0; i < this.network.tensors.length; i++) {
                  this.gradients[i] = new Float32Array(this.network.tensors[i].data.length);
              }
              for (var m = 0; m < this.network.matrices.length; m++) {
                  for (var o = 0; o < this.network.matrices[m].outputs; o++) {
                      for (var i = 0; i < this.network.matrices[m].inputs; i++) {
                          var rand = (this.random.next() - 0.5) * (1 / Math.sqrt(this.network.matrices[m].inputs));
                          this.network.matrices[m].set(i, o, rand);
                      }
                  }
              }
              this.kernels = new Array(this.network.kernels.length);
              for (var i = 0; i < this.network.kernels.length; i++) {
                  this.kernels[i] = {
                      matrix: {
                          matrix: this.network.matrices[i],
                          deltas: this.deltas[i]
                      },
                      input: {
                          tensor: this.network.tensors[i + 0],
                          grads: this.gradients[i + 0]
                      },
                      output: {
                          tensor: this.network.tensors[i + 1],
                          grads: this.gradients[i + 1]
                      }
                  };
              }
          }
          Trainer.prototype.forward = function (input) {
              return this.network.forward(input);
          };
          Trainer.prototype.error = function (input, expect) {
              var actual = this.network.forward(input);
              return Math.sqrt(actual.reduce(function (acc, value, index) {
                  var delta = (expect[index] - value);
                  return (acc + (delta * delta));
              }, 0) / actual.length);
          };
          Trainer.prototype.backward = function (input, expect) {
              var actual = this.network.forward(input);
              var kernel = this.kernels[this.kernels.length - 1];
              for (var o = 0; o < kernel.matrix.matrix.outputs; o++) {
                  var delta = (expect[o] - kernel.output.tensor.data[o]);
                  kernel.output.grads[o] = (delta * kernel.output.tensor.activation.derive(kernel.output.tensor.data[o]));
              }
              for (var k = this.kernels.length - 1; k > -1; k--) {
                  var kernel_1 = this.kernels[k];
                  for (var i = 0; i < kernel_1.matrix.matrix.inputs; i++) {
                      var delta = 0;
                      for (var o = 0; o < kernel_1.matrix.matrix.outputs; o++) {
                          delta += kernel_1.matrix.matrix.get(i, o) * kernel_1.output.grads[o];
                      }
                      kernel_1.input.grads[i] = (delta * kernel_1.input.tensor.activation.derive(kernel_1.input.tensor.data[i]));
                  }
              }
              for (var k = this.kernels.length - 1; k > -1; k--) {
                  var kernel_2 = this.kernels[k];
                  for (var i = 0; i < kernel_2.matrix.matrix.inputs; i++) {
                      for (var o = 0; o < kernel_2.matrix.matrix.outputs; o++) {
                          var old_delta = kernel_2.matrix.deltas.get(i, o);
                          var new_delta = (this.options.step * kernel_2.input.tensor.data[i] * kernel_2.output.grads[o]) + (this.options.momentum * old_delta);
                          var new_weight = kernel_2.matrix.matrix.get(i, o) + new_delta;
                          kernel_2.matrix.matrix.set(i, o, new_weight);
                          kernel_2.matrix.deltas.set(i, o, new_delta);
                      }
                  }
              }
              return Math.sqrt(actual.reduce(function (acc, value, index) {
                  var delta = (expect[index] - value);
                  return (acc + (delta * delta));
              }, 0) / actual.length);
          };
          return Trainer;
      }());
      exports.Trainer = Trainer;
  });
  define("network/index", ["require", "exports", "network/network", "network/tensor", "network/trainer"], function (require, exports, network_1, tensor_1, trainer_1) {
      "use strict";
      exports.__esModule = true;
      exports.Network = network_1.Network;
      exports.Tensor = tensor_1.Tensor;
      exports.Trainer = trainer_1.Trainer;
  });
  define("buffer/interfaces", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
  });
  define("buffer/rgb", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var RgbBuffer = (function () {
          function RgbBuffer(image) {
              this.image = image;
              this.width = image.width;
              this.height = image.height;
          }
          RgbBuffer.prototype.offset = function (x, y) {
              return x + (y * this.image.width);
          };
          RgbBuffer.prototype.set = function (x, y, rgb) {
              var offset = this.offset(x, y) * 4;
              this.image.data[offset + 0] = rgb[0];
              this.image.data[offset + 1] = rgb[1];
              this.image.data[offset + 2] = rgb[2];
              this.image.data[offset + 4] = 1;
          };
          RgbBuffer.prototype.get = function (x, y) {
              var offset = this.offset(x, y) * 4;
              return [
                  this.image.data[offset + 0],
                  this.image.data[offset + 1],
                  this.image.data[offset + 2]
              ];
          };
          RgbBuffer.prototype.to_image_data = function () {
              return this.image;
          };
          return RgbBuffer;
      }());
      exports.RgbBuffer = RgbBuffer;
  });
  define("buffer/scalar", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var ScalarBuffer = (function () {
          function ScalarBuffer(image) {
              this.image = image;
              this.buffer = new Float32Array(image.width * image.height);
              this.width = image.width;
              this.height = image.height;
              for (var iy = 0; iy < image.height; iy++) {
                  for (var ix = 0; ix < image.width; ix++) {
                      var i = this.offset(ix, iy) * 4;
                      var r = this.image.data[i + 0];
                      var g = this.image.data[i + 1];
                      var b = this.image.data[i + 2];
                      var s = ((((r + b + g) / 3) / 255) - 0.5) * 2.0;
                      this.set(ix, iy, s);
                  }
              }
          }
          ScalarBuffer.prototype.offset = function (x, y) {
              return x + (y * this.image.width);
          };
          ScalarBuffer.prototype.set = function (x, y, scalar) {
              var offset = this.offset(x, y);
              this.buffer[offset] = scalar;
          };
          ScalarBuffer.prototype.get = function (x, y) {
              var offset = this.offset(x, y);
              return this.buffer[offset];
          };
          ScalarBuffer.prototype.to_image_data = function () {
              for (var iy = 0; iy < this.image.height; iy++) {
                  for (var ix = 0; ix < this.image.width; ix++) {
                      var offset_a = this.offset(ix, iy) * 4;
                      var offset_b = this.offset(ix, iy);
                      this.image.data[offset_a + 0] = ((this.buffer[offset_b] + 1.0) / 2.0) * 255;
                      this.image.data[offset_a + 1] = ((this.buffer[offset_b] + 1.0) / 2.0) * 255;
                      this.image.data[offset_a + 2] = ((this.buffer[offset_b] + 1.0) / 2.0) * 255;
                      this.image.data[offset_a + 3] = 255;
                  }
              }
              return this.image;
          };
          return ScalarBuffer;
      }());
      exports.ScalarBuffer = ScalarBuffer;
  });
  define("buffer/vector", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var VectorBuffer = (function () {
          function VectorBuffer(image) {
              this.image = image;
              this.buffer = new Float32Array(image.width * image.height * 3);
              this.width = image.width;
              this.height = image.height;
              for (var iy = 0; iy < image.height; iy++) {
                  for (var ix = 0; ix < image.width; ix++) {
                      var i = this.offset(ix, iy) * 4;
                      var r = image.data[i + 0];
                      var g = image.data[i + 1];
                      var b = image.data[i + 2];
                      this.set(ix, iy, [
                          ((r / 255) - 0.5) * 2.0,
                          ((g / 255) - 0.5) * 2.0,
                          ((b / 255) - 0.5) * 2.0
                      ]);
                  }
              }
          }
          VectorBuffer.prototype.offset = function (x, y) {
              return x + (y * this.image.width);
          };
          VectorBuffer.prototype.set = function (x, y, vector) {
              var offset = this.offset(x, y) * 3;
              this.buffer[offset + 0] = vector[0];
              this.buffer[offset + 1] = vector[1];
              this.buffer[offset + 2] = vector[2];
          };
          VectorBuffer.prototype.get = function (x, y) {
              var offset = this.offset(x, y) * 3;
              return [
                  this.buffer[offset + 0],
                  this.buffer[offset + 1],
                  this.buffer[offset + 2]
              ];
          };
          VectorBuffer.prototype.to_image_data = function () {
              for (var iy = 0; iy < this.image.height; iy++) {
                  for (var ix = 0; ix < this.image.width; ix++) {
                      var offset_a = this.offset(ix, iy) * 4;
                      var offset_b = this.offset(ix, iy) * 3;
                      this.image.data[offset_a + 0] = ((this.buffer[offset_b + 0] + 1.0) / 2.0) * 255;
                      this.image.data[offset_a + 1] = ((this.buffer[offset_b + 1] + 1.0) / 2.0) * 255;
                      this.image.data[offset_a + 2] = ((this.buffer[offset_b + 2] + 1.0) / 2.0) * 255;
                      this.image.data[offset_a + 3] = 255;
                  }
              }
              return this.image;
          };
          return VectorBuffer;
      }());
      exports.VectorBuffer = VectorBuffer;
  });
  define("buffer/index", ["require", "exports", "buffer/rgb", "buffer/scalar", "buffer/vector"], function (require, exports, rgb_1, scalar_1, vector_1) {
      "use strict";
      exports.__esModule = true;
      exports.RgbBuffer = rgb_1.RgbBuffer;
      exports.ScalarBuffer = scalar_1.ScalarBuffer;
      exports.VectorBuffer = vector_1.VectorBuffer;
  });
  define("encoding/encoder", ["require", "exports", "network/index"], function (require, exports, index_1) {
      "use strict";
      exports.__esModule = true;
      var range = function (count) { return (new Array(count)).fill(0); };
      var Encoder = (function () {
          function Encoder(width, depth) {
              var _this = this;
              this.width = width;
              this.depth = depth;
              var input = new index_1.Tensor(3);
              var output = new index_1.Tensor(3);
              var hidden = range(depth).map(function (_) { return new index_1.Tensor(_this.width, "tanh"); });
              this.network = new index_1.Trainer(new index_1.Network([input].concat(hidden, [output])), { step: 0.0025, momentum: 0.0125 });
          }
          Encoder.prototype.input = function (buffer, x, y, width, height, z) {
              for (var iy = y; iy < (y + height); iy++) {
                  for (var ix = x; ix < (x + width); ix++) {
                      var sx = ((ix / buffer.width) - 0.5 * 2.0);
                      var sy = ((iy / buffer.height) - 0.5 * 2.0);
                      var v = buffer.get(ix, iy);
                      this.network.backward([sx, sy, z], [v[0], v[1], v[2]]);
                  }
              }
          };
          Encoder.prototype.output = function (z, buffer) {
              for (var iy = 0; iy < buffer.width; iy++) {
                  for (var ix = 0; ix < buffer.height; ix++) {
                      var x = ((ix / buffer.width) - 0.5 * 2.0);
                      var y = ((iy / buffer.height) - 0.5 * 2.0);
                      var v = this.network.forward([x, y, z]);
                      buffer.set(ix, iy, [v[0], v[1], v[2]]);
                  }
              }
          };
          return Encoder;
      }());
      exports.Encoder = Encoder;
  });
  define("encoding/index", ["require", "exports", "encoding/encoder"], function (require, exports, encoder_1) {
      "use strict";
      exports.__esModule = true;
      exports.Encoder = encoder_1.Encoder;
  });
  define("render/device", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      var Device = (function () {
          function Device(canvas) {
              this.canvas = canvas;
              this.context = this.canvas.getContext("2d");
          }
          Device.prototype.clear = function () {
              this.context.fillStyle = '#000000';
              this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
              this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
          };
          Device.prototype.draw = function (image) {
              this.context.putImageData(image.to_image_data(), 0, 0);
          };
          Device.prototype.rect = function (x, y, width, height, color, border) {
              if (color === void 0) { color = 0xFFFFFF88; }
              if (border === void 0) { border = 0xFFFFFF88; }
              this.context.fillStyle = '#' + color.toString(16);
              this.context.fillRect(x, y, width, height);
              this.context.strokeStyle = '#' + border.toString(16);
              this.context.beginPath();
              this.context.rect(x, y, width, height);
              this.context.stroke();
          };
          return Device;
      }());
      exports.Device = Device;
  });
  define("render/index", ["require", "exports", "render/device"], function (require, exports, device_1) {
      "use strict";
      exports.__esModule = true;
      exports.Device = device_1.Device;
  });
  define("iterator/iterator", ["require", "exports"], function (require, exports) {
      "use strict";
      exports.__esModule = true;
      function to_spatial(bounds, offset) {
          var array = new Array(bounds.length);
          var extent = 1;
          for (var i = 0; i < bounds.length; i++) {
              if (i > 0)
                  extent *= bounds[i - 1];
              array[i] = Math.floor(offset / extent % bounds[i]);
          }
          return array;
      }
      exports.to_spatial = to_spatial;
      function to_offset(bounds, address) {
          if (bounds.length !== address.length)
              throw Error("address-index: dimensional mismatch");
          var _a = [0, 1], acc = _a[0], mul = _a[1];
          for (var i = 0; i < bounds.length; i++) {
              acc += (address[i] * mul);
              mul *= bounds[i];
          }
          return acc;
      }
      exports.to_offset = to_offset;
      var Iterator = (function () {
          function Iterator(dimensions) {
              this.dimensions = dimensions;
              this.index = 0;
              this.length = 0;
              this.length = dimensions.reduce(function (acc, c) { return acc * c; }, 1);
          }
          Iterator.prototype.next = function () {
              var address = to_spatial(this.dimensions, this.index);
              this.index += 1;
              this.index = (this.index % this.length);
              return address;
          };
          return Iterator;
      }());
      exports.Iterator = Iterator;
  });
  define("iterator/quadrant", ["require", "exports", "iterator/iterator"], function (require, exports, iterator_1) {
      "use strict";
      exports.__esModule = true;
      var QuadrantIterator = (function () {
          function QuadrantIterator(width, height, swidth, sheight, sdepth) {
              this.width = width;
              this.height = height;
              this.swidth = swidth;
              this.sheight = sheight;
              this.sdepth = sdepth;
              this.iterator = new iterator_1.Iterator([
                  width / swidth,
                  height / sheight,
                  sdepth
              ]);
          }
          QuadrantIterator.prototype.next = function () {
              var address = this.iterator.next();
              return {
                  x: address[0] * this.swidth,
                  y: address[1] * this.sheight,
                  width: this.swidth,
                  height: this.sheight,
                  z: address[2]
              };
          };
          return QuadrantIterator;
      }());
      exports.QuadrantIterator = QuadrantIterator;
  });
  define("iterator/index", ["require", "exports", "iterator/iterator", "iterator/quadrant"], function (require, exports, iterator_2, quadrant_1) {
      "use strict";
      exports.__esModule = true;
      exports.Iterator = iterator_2.Iterator;
      exports.QuadrantIterator = quadrant_1.QuadrantIterator;
  });
  define("index", ["require", "exports", "loader/index", "encoding/index", "render/index", "buffer/index", "iterator/index"], function (require, exports, index_2, index_3, index_4, index_5, index_6) {
      "use strict";
      var _this = this;
      exports.__esModule = true;
      var select_image = function (count) {
          var idx0 = Math.floor(Math.random() * count);
          while (true) {
              var idx1 = Math.floor(Math.random() * count);
              if (idx0 !== idx1) {
                  return {
                      left: "./images/" + idx0 + ".png",
                      right: "./images/" + idx1 + ".png"
                  };
              }
          }
      };
      var images = select_image(8);
      (function () { return __awaiter(_this, void 0, void 0, function () {
          var devices, buffers, _a, _b, _c, _d, _e, _f, _g, draw, iterator, encoder, count, loop;
          return __generator(this, function (_h) {
              switch (_h.label) {
                  case 0:
                      devices = {
                          slider: document.getElementById("slider"),
                          left: new index_4.Device(document.getElementById("canvas-left")),
                          right: new index_4.Device(document.getElementById("canvas-right")),
                          middle: new index_4.Device(document.getElementById("canvas-middle"))
                      };
                      _a = {};
                      _b = {};
                      _c = index_5.VectorBuffer.bind;
                      return [4, index_2.Loader.load(images.left, 64, 64)];
                  case 1:
                      _b.full = new (_c.apply(index_5.VectorBuffer, [void 0, _h.sent()]))();
                      _d = index_5.VectorBuffer.bind;
                      return [4, index_2.Loader.load(images.left, 32, 32)];
                  case 2:
                      _a.left = (_b.half = new (_d.apply(index_5.VectorBuffer, [void 0, _h.sent()]))(),
                          _b);
                      _e = {};
                      _f = index_5.VectorBuffer.bind;
                      return [4, index_2.Loader.load(images.right, 64, 64)];
                  case 3:
                      _e.full = new (_f.apply(index_5.VectorBuffer, [void 0, _h.sent()]))();
                      _g = index_5.VectorBuffer.bind;
                      return [4, index_2.Loader.load(images.right, 32, 32)];
                  case 4:
                      buffers = (_a.right = (_e.half = new (_g.apply(index_5.VectorBuffer, [void 0, _h.sent()]))(),
                          _e),
                          _a.middle = {
                              full: new index_5.VectorBuffer(new ImageData(64, 64))
                          },
                          _a);
                      devices.slider.oninput = function () { return draw(); };
                      draw = function () {
                          var z = parseFloat(devices.slider.value);
                          encoder.output(z, buffers.middle.full);
                          devices.middle.draw(buffers.middle.full);
                      };
                      iterator = new index_6.QuadrantIterator(32, 32, 4, 4, 2);
                      encoder = new index_3.Encoder(32, 3);
                      count = 0;
                      loop = function () {
                          requestAnimationFrame(function () {
                              var next = iterator.next();
                              var device = (next.z === 0) ? devices.left : devices.right;
                              var full = (next.z === 0) ? buffers.left.full : buffers.right.full;
                              var half = (next.z === 0) ? buffers.left.half : buffers.right.half;
                              var depth = (next.z === 0) ? -1 : 1;
                              device.clear();
                              device.draw(full);
                              device.rect(next.x * 2, next.y * 2, next.width * 2, next.height * 2);
                              encoder.input(half, next.x, next.y, next.width, next.height, depth);
                              if (next.x === 0 && next.y === 0) {
                                  draw();
                              }
                              loop();
                          });
                      };
                      loop();
                      return [2];
              }
          });
      }); })();
  });
  
  return collect(); 
})();