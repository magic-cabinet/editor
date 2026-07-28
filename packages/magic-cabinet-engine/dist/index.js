var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// ../../apps/web/node_modules/polygon-clipping/dist/polygon-clipping.umd.js
var require_polygon_clipping_umd = __commonJS((exports, module) => {
  (function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.polygonClipping = factory());
  })(exports, function() {
    /*! *****************************************************************************
        Copyright (c) Microsoft Corporation. All rights reserved.
        Licensed under the Apache License, Version 2.0 (the "License"); you may not use
        this file except in compliance with the License. You may obtain a copy of the
        License at http://www.apache.org/licenses/LICENSE-2.0
    
        THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
        KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
        WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
        MERCHANTABLITY OR NON-INFRINGEMENT.
    
        See the Apache Version 2.0 License for specific language governing permissions
        and limitations under the License.
        ***************************************************************************** */
    function __generator(thisArg, body) {
      var _ = {
        label: 0,
        sent: function() {
          if (t[0] & 1)
            throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      }, f, y, t, g;
      return g = {
        next: verb(0),
        throw: verb(1),
        return: verb(2)
      }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([n, v]);
        };
      }
      function step(op) {
        if (f)
          throw new TypeError("Generator is already executing.");
        while (_)
          try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
              return t;
            if (y = 0, t)
              op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                _.label++;
                return {
                  value: op[1],
                  done: false
                };
              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = _.ops.pop();
                _.trys.pop();
                continue;
              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2];
                  _.ops.push(op);
                  break;
                }
                if (t[2])
                  _.ops.pop();
                _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f = t = 0;
          }
        if (op[0] & 5)
          throw op[1];
        return {
          value: op[0] ? op[1] : undefined,
          done: true
        };
      }
    }
    var Node = function() {
      function Node2(key, data) {
        this.next = null;
        this.key = key;
        this.data = data;
        this.left = null;
        this.right = null;
      }
      return Node2;
    }();
    function DEFAULT_COMPARE(a, b) {
      return a > b ? 1 : a < b ? -1 : 0;
    }
    function splay(i, t, comparator) {
      var N = new Node(null, null);
      var l = N;
      var r = N;
      while (true) {
        var cmp2 = comparator(i, t.key);
        if (cmp2 < 0) {
          if (t.left === null)
            break;
          if (comparator(i, t.left.key) < 0) {
            var y = t.left;
            t.left = y.right;
            y.right = t;
            t = y;
            if (t.left === null)
              break;
          }
          r.left = t;
          r = t;
          t = t.left;
        } else if (cmp2 > 0) {
          if (t.right === null)
            break;
          if (comparator(i, t.right.key) > 0) {
            var y = t.right;
            t.right = y.left;
            y.left = t;
            t = y;
            if (t.right === null)
              break;
          }
          l.right = t;
          l = t;
          t = t.right;
        } else
          break;
      }
      l.right = t.left;
      r.left = t.right;
      t.left = N.right;
      t.right = N.left;
      return t;
    }
    function insert(i, data, t, comparator) {
      var node = new Node(i, data);
      if (t === null) {
        node.left = node.right = null;
        return node;
      }
      t = splay(i, t, comparator);
      var cmp2 = comparator(i, t.key);
      if (cmp2 < 0) {
        node.left = t.left;
        node.right = t;
        t.left = null;
      } else if (cmp2 >= 0) {
        node.right = t.right;
        node.left = t;
        t.right = null;
      }
      return node;
    }
    function split(key, v, comparator) {
      var left = null;
      var right = null;
      if (v) {
        v = splay(key, v, comparator);
        var cmp2 = comparator(v.key, key);
        if (cmp2 === 0) {
          left = v.left;
          right = v.right;
        } else if (cmp2 < 0) {
          right = v.right;
          v.right = null;
          left = v;
        } else {
          left = v.left;
          v.left = null;
          right = v;
        }
      }
      return {
        left,
        right
      };
    }
    function merge(left, right, comparator) {
      if (right === null)
        return left;
      if (left === null)
        return right;
      right = splay(left.key, right, comparator);
      right.left = left;
      return right;
    }
    function printRow(root, prefix, isTail, out, printNode) {
      if (root) {
        out("" + prefix + (isTail ? "└── " : "├── ") + printNode(root) + `
`);
        var indent = prefix + (isTail ? "    " : "│   ");
        if (root.left)
          printRow(root.left, indent, false, out, printNode);
        if (root.right)
          printRow(root.right, indent, true, out, printNode);
      }
    }
    var Tree = function() {
      function Tree2(comparator) {
        if (comparator === undefined) {
          comparator = DEFAULT_COMPARE;
        }
        this._root = null;
        this._size = 0;
        this._comparator = comparator;
      }
      Tree2.prototype.insert = function(key, data) {
        this._size++;
        return this._root = insert(key, data, this._root, this._comparator);
      };
      Tree2.prototype.add = function(key, data) {
        var node = new Node(key, data);
        if (this._root === null) {
          node.left = node.right = null;
          this._size++;
          this._root = node;
        }
        var comparator = this._comparator;
        var t = splay(key, this._root, comparator);
        var cmp2 = comparator(key, t.key);
        if (cmp2 === 0)
          this._root = t;
        else {
          if (cmp2 < 0) {
            node.left = t.left;
            node.right = t;
            t.left = null;
          } else if (cmp2 > 0) {
            node.right = t.right;
            node.left = t;
            t.right = null;
          }
          this._size++;
          this._root = node;
        }
        return this._root;
      };
      Tree2.prototype.remove = function(key) {
        this._root = this._remove(key, this._root, this._comparator);
      };
      Tree2.prototype._remove = function(i, t, comparator) {
        var x;
        if (t === null)
          return null;
        t = splay(i, t, comparator);
        var cmp2 = comparator(i, t.key);
        if (cmp2 === 0) {
          if (t.left === null) {
            x = t.right;
          } else {
            x = splay(i, t.left, comparator);
            x.right = t.right;
          }
          this._size--;
          return x;
        }
        return t;
      };
      Tree2.prototype.pop = function() {
        var node = this._root;
        if (node) {
          while (node.left)
            node = node.left;
          this._root = splay(node.key, this._root, this._comparator);
          this._root = this._remove(node.key, this._root, this._comparator);
          return {
            key: node.key,
            data: node.data
          };
        }
        return null;
      };
      Tree2.prototype.findStatic = function(key) {
        var current = this._root;
        var compare = this._comparator;
        while (current) {
          var cmp2 = compare(key, current.key);
          if (cmp2 === 0)
            return current;
          else if (cmp2 < 0)
            current = current.left;
          else
            current = current.right;
        }
        return null;
      };
      Tree2.prototype.find = function(key) {
        if (this._root) {
          this._root = splay(key, this._root, this._comparator);
          if (this._comparator(key, this._root.key) !== 0)
            return null;
        }
        return this._root;
      };
      Tree2.prototype.contains = function(key) {
        var current = this._root;
        var compare = this._comparator;
        while (current) {
          var cmp2 = compare(key, current.key);
          if (cmp2 === 0)
            return true;
          else if (cmp2 < 0)
            current = current.left;
          else
            current = current.right;
        }
        return false;
      };
      Tree2.prototype.forEach = function(visitor, ctx) {
        var current = this._root;
        var Q = [];
        var done = false;
        while (!done) {
          if (current !== null) {
            Q.push(current);
            current = current.left;
          } else {
            if (Q.length !== 0) {
              current = Q.pop();
              visitor.call(ctx, current);
              current = current.right;
            } else
              done = true;
          }
        }
        return this;
      };
      Tree2.prototype.range = function(low, high, fn, ctx) {
        var Q = [];
        var compare = this._comparator;
        var node = this._root;
        var cmp2;
        while (Q.length !== 0 || node) {
          if (node) {
            Q.push(node);
            node = node.left;
          } else {
            node = Q.pop();
            cmp2 = compare(node.key, high);
            if (cmp2 > 0) {
              break;
            } else if (compare(node.key, low) >= 0) {
              if (fn.call(ctx, node))
                return this;
            }
            node = node.right;
          }
        }
        return this;
      };
      Tree2.prototype.keys = function() {
        var keys = [];
        this.forEach(function(_a) {
          var key = _a.key;
          return keys.push(key);
        });
        return keys;
      };
      Tree2.prototype.values = function() {
        var values = [];
        this.forEach(function(_a) {
          var data = _a.data;
          return values.push(data);
        });
        return values;
      };
      Tree2.prototype.min = function() {
        if (this._root)
          return this.minNode(this._root).key;
        return null;
      };
      Tree2.prototype.max = function() {
        if (this._root)
          return this.maxNode(this._root).key;
        return null;
      };
      Tree2.prototype.minNode = function(t) {
        if (t === undefined) {
          t = this._root;
        }
        if (t)
          while (t.left)
            t = t.left;
        return t;
      };
      Tree2.prototype.maxNode = function(t) {
        if (t === undefined) {
          t = this._root;
        }
        if (t)
          while (t.right)
            t = t.right;
        return t;
      };
      Tree2.prototype.at = function(index2) {
        var current = this._root;
        var done = false;
        var i = 0;
        var Q = [];
        while (!done) {
          if (current) {
            Q.push(current);
            current = current.left;
          } else {
            if (Q.length > 0) {
              current = Q.pop();
              if (i === index2)
                return current;
              i++;
              current = current.right;
            } else
              done = true;
          }
        }
        return null;
      };
      Tree2.prototype.next = function(d) {
        var root = this._root;
        var successor = null;
        if (d.right) {
          successor = d.right;
          while (successor.left)
            successor = successor.left;
          return successor;
        }
        var comparator = this._comparator;
        while (root) {
          var cmp2 = comparator(d.key, root.key);
          if (cmp2 === 0)
            break;
          else if (cmp2 < 0) {
            successor = root;
            root = root.left;
          } else
            root = root.right;
        }
        return successor;
      };
      Tree2.prototype.prev = function(d) {
        var root = this._root;
        var predecessor = null;
        if (d.left !== null) {
          predecessor = d.left;
          while (predecessor.right)
            predecessor = predecessor.right;
          return predecessor;
        }
        var comparator = this._comparator;
        while (root) {
          var cmp2 = comparator(d.key, root.key);
          if (cmp2 === 0)
            break;
          else if (cmp2 < 0)
            root = root.left;
          else {
            predecessor = root;
            root = root.right;
          }
        }
        return predecessor;
      };
      Tree2.prototype.clear = function() {
        this._root = null;
        this._size = 0;
        return this;
      };
      Tree2.prototype.toList = function() {
        return toList(this._root);
      };
      Tree2.prototype.load = function(keys, values, presort) {
        if (values === undefined) {
          values = [];
        }
        if (presort === undefined) {
          presort = false;
        }
        var size = keys.length;
        var comparator = this._comparator;
        if (presort)
          sort(keys, values, 0, size - 1, comparator);
        if (this._root === null) {
          this._root = loadRecursive(keys, values, 0, size);
          this._size = size;
        } else {
          var mergedList = mergeLists(this.toList(), createList(keys, values), comparator);
          size = this._size + size;
          this._root = sortedListToBST({
            head: mergedList
          }, 0, size);
        }
        return this;
      };
      Tree2.prototype.isEmpty = function() {
        return this._root === null;
      };
      Object.defineProperty(Tree2.prototype, "size", {
        get: function() {
          return this._size;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Tree2.prototype, "root", {
        get: function() {
          return this._root;
        },
        enumerable: true,
        configurable: true
      });
      Tree2.prototype.toString = function(printNode) {
        if (printNode === undefined) {
          printNode = function(n) {
            return String(n.key);
          };
        }
        var out = [];
        printRow(this._root, "", true, function(v) {
          return out.push(v);
        }, printNode);
        return out.join("");
      };
      Tree2.prototype.update = function(key, newKey, newData) {
        var comparator = this._comparator;
        var _a = split(key, this._root, comparator), left = _a.left, right = _a.right;
        if (comparator(key, newKey) < 0) {
          right = insert(newKey, newData, right, comparator);
        } else {
          left = insert(newKey, newData, left, comparator);
        }
        this._root = merge(left, right, comparator);
      };
      Tree2.prototype.split = function(key) {
        return split(key, this._root, this._comparator);
      };
      Tree2.prototype[Symbol.iterator] = function() {
        var current, Q, done;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              current = this._root;
              Q = [];
              done = false;
              _a.label = 1;
            case 1:
              if (!!done)
                return [3, 6];
              if (!(current !== null))
                return [3, 2];
              Q.push(current);
              current = current.left;
              return [3, 5];
            case 2:
              if (!(Q.length !== 0))
                return [3, 4];
              current = Q.pop();
              return [4, current];
            case 3:
              _a.sent();
              current = current.right;
              return [3, 5];
            case 4:
              done = true;
              _a.label = 5;
            case 5:
              return [3, 1];
            case 6:
              return [2];
          }
        });
      };
      return Tree2;
    }();
    function loadRecursive(keys, values, start, end) {
      var size = end - start;
      if (size > 0) {
        var middle = start + Math.floor(size / 2);
        var key = keys[middle];
        var data = values[middle];
        var node = new Node(key, data);
        node.left = loadRecursive(keys, values, start, middle);
        node.right = loadRecursive(keys, values, middle + 1, end);
        return node;
      }
      return null;
    }
    function createList(keys, values) {
      var head = new Node(null, null);
      var p = head;
      for (var i = 0;i < keys.length; i++) {
        p = p.next = new Node(keys[i], values[i]);
      }
      p.next = null;
      return head.next;
    }
    function toList(root) {
      var current = root;
      var Q = [];
      var done = false;
      var head = new Node(null, null);
      var p = head;
      while (!done) {
        if (current) {
          Q.push(current);
          current = current.left;
        } else {
          if (Q.length > 0) {
            current = p = p.next = Q.pop();
            current = current.right;
          } else
            done = true;
        }
      }
      p.next = null;
      return head.next;
    }
    function sortedListToBST(list, start, end) {
      var size = end - start;
      if (size > 0) {
        var middle = start + Math.floor(size / 2);
        var left = sortedListToBST(list, start, middle);
        var root = list.head;
        root.left = left;
        list.head = list.head.next;
        root.right = sortedListToBST(list, middle + 1, end);
        return root;
      }
      return null;
    }
    function mergeLists(l1, l2, compare) {
      var head = new Node(null, null);
      var p = head;
      var p1 = l1;
      var p2 = l2;
      while (p1 !== null && p2 !== null) {
        if (compare(p1.key, p2.key) < 0) {
          p.next = p1;
          p1 = p1.next;
        } else {
          p.next = p2;
          p2 = p2.next;
        }
        p = p.next;
      }
      if (p1 !== null) {
        p.next = p1;
      } else if (p2 !== null) {
        p.next = p2;
      }
      return head.next;
    }
    function sort(keys, values, left, right, compare) {
      if (left >= right)
        return;
      var pivot = keys[left + right >> 1];
      var i = left - 1;
      var j = right + 1;
      while (true) {
        do
          i++;
        while (compare(keys[i], pivot) < 0);
        do
          j--;
        while (compare(keys[j], pivot) > 0);
        if (i >= j)
          break;
        var tmp = keys[i];
        keys[i] = keys[j];
        keys[j] = tmp;
        tmp = values[i];
        values[i] = values[j];
        values[j] = tmp;
      }
      sort(keys, values, left, j, compare);
      sort(keys, values, j + 1, right, compare);
    }
    const isInBbox = (bbox, point) => {
      return bbox.ll.x <= point.x && point.x <= bbox.ur.x && bbox.ll.y <= point.y && point.y <= bbox.ur.y;
    };
    const getBboxOverlap = (b1, b2) => {
      if (b2.ur.x < b1.ll.x || b1.ur.x < b2.ll.x || b2.ur.y < b1.ll.y || b1.ur.y < b2.ll.y)
        return null;
      const lowerX = b1.ll.x < b2.ll.x ? b2.ll.x : b1.ll.x;
      const upperX = b1.ur.x < b2.ur.x ? b1.ur.x : b2.ur.x;
      const lowerY = b1.ll.y < b2.ll.y ? b2.ll.y : b1.ll.y;
      const upperY = b1.ur.y < b2.ur.y ? b1.ur.y : b2.ur.y;
      return {
        ll: {
          x: lowerX,
          y: lowerY
        },
        ur: {
          x: upperX,
          y: upperY
        }
      };
    };
    let epsilon$1 = Number.EPSILON;
    if (epsilon$1 === undefined)
      epsilon$1 = Math.pow(2, -52);
    const EPSILON_SQ = epsilon$1 * epsilon$1;
    const cmp = (a, b) => {
      if (-epsilon$1 < a && a < epsilon$1) {
        if (-epsilon$1 < b && b < epsilon$1) {
          return 0;
        }
      }
      const ab = a - b;
      if (ab * ab < EPSILON_SQ * a * b) {
        return 0;
      }
      return a < b ? -1 : 1;
    };

    class PtRounder {
      constructor() {
        this.reset();
      }
      reset() {
        this.xRounder = new CoordRounder;
        this.yRounder = new CoordRounder;
      }
      round(x, y) {
        return {
          x: this.xRounder.round(x),
          y: this.yRounder.round(y)
        };
      }
    }

    class CoordRounder {
      constructor() {
        this.tree = new Tree;
        this.round(0);
      }
      round(coord) {
        const node = this.tree.add(coord);
        const prevNode = this.tree.prev(node);
        if (prevNode !== null && cmp(node.key, prevNode.key) === 0) {
          this.tree.remove(coord);
          return prevNode.key;
        }
        const nextNode = this.tree.next(node);
        if (nextNode !== null && cmp(node.key, nextNode.key) === 0) {
          this.tree.remove(coord);
          return nextNode.key;
        }
        return coord;
      }
    }
    const rounder = new PtRounder;
    const epsilon = 0.00000000000000011102230246251565;
    const splitter = 134217729;
    const resulterrbound = (3 + 8 * epsilon) * epsilon;
    function sum(elen, e, flen, f, h) {
      let Q, Qnew, hh, bvirt;
      let enow = e[0];
      let fnow = f[0];
      let eindex = 0;
      let findex = 0;
      if (fnow > enow === fnow > -enow) {
        Q = enow;
        enow = e[++eindex];
      } else {
        Q = fnow;
        fnow = f[++findex];
      }
      let hindex = 0;
      if (eindex < elen && findex < flen) {
        if (fnow > enow === fnow > -enow) {
          Qnew = enow + Q;
          hh = Q - (Qnew - enow);
          enow = e[++eindex];
        } else {
          Qnew = fnow + Q;
          hh = Q - (Qnew - fnow);
          fnow = f[++findex];
        }
        Q = Qnew;
        if (hh !== 0) {
          h[hindex++] = hh;
        }
        while (eindex < elen && findex < flen) {
          if (fnow > enow === fnow > -enow) {
            Qnew = Q + enow;
            bvirt = Qnew - Q;
            hh = Q - (Qnew - bvirt) + (enow - bvirt);
            enow = e[++eindex];
          } else {
            Qnew = Q + fnow;
            bvirt = Qnew - Q;
            hh = Q - (Qnew - bvirt) + (fnow - bvirt);
            fnow = f[++findex];
          }
          Q = Qnew;
          if (hh !== 0) {
            h[hindex++] = hh;
          }
        }
      }
      while (eindex < elen) {
        Qnew = Q + enow;
        bvirt = Qnew - Q;
        hh = Q - (Qnew - bvirt) + (enow - bvirt);
        enow = e[++eindex];
        Q = Qnew;
        if (hh !== 0) {
          h[hindex++] = hh;
        }
      }
      while (findex < flen) {
        Qnew = Q + fnow;
        bvirt = Qnew - Q;
        hh = Q - (Qnew - bvirt) + (fnow - bvirt);
        fnow = f[++findex];
        Q = Qnew;
        if (hh !== 0) {
          h[hindex++] = hh;
        }
      }
      if (Q !== 0 || hindex === 0) {
        h[hindex++] = Q;
      }
      return hindex;
    }
    function estimate(elen, e) {
      let Q = e[0];
      for (let i = 1;i < elen; i++)
        Q += e[i];
      return Q;
    }
    function vec(n) {
      return new Float64Array(n);
    }
    const ccwerrboundA = (3 + 16 * epsilon) * epsilon;
    const ccwerrboundB = (2 + 12 * epsilon) * epsilon;
    const ccwerrboundC = (9 + 64 * epsilon) * epsilon * epsilon;
    const B = vec(4);
    const C1 = vec(8);
    const C2 = vec(12);
    const D = vec(16);
    const u = vec(4);
    function orient2dadapt(ax, ay, bx, by, cx, cy, detsum) {
      let acxtail, acytail, bcxtail, bcytail;
      let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;
      const acx = ax - cx;
      const bcx = bx - cx;
      const acy = ay - cy;
      const bcy = by - cy;
      s1 = acx * bcy;
      c = splitter * acx;
      ahi = c - (c - acx);
      alo = acx - ahi;
      c = splitter * bcy;
      bhi = c - (c - bcy);
      blo = bcy - bhi;
      s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
      t1 = acy * bcx;
      c = splitter * acy;
      ahi = c - (c - acy);
      alo = acy - ahi;
      c = splitter * bcx;
      bhi = c - (c - bcx);
      blo = bcx - bhi;
      t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
      _i = s0 - t0;
      bvirt = s0 - _i;
      B[0] = s0 - (_i + bvirt) + (bvirt - t0);
      _j = s1 + _i;
      bvirt = _j - s1;
      _0 = s1 - (_j - bvirt) + (_i - bvirt);
      _i = _0 - t1;
      bvirt = _0 - _i;
      B[1] = _0 - (_i + bvirt) + (bvirt - t1);
      u3 = _j + _i;
      bvirt = u3 - _j;
      B[2] = _j - (u3 - bvirt) + (_i - bvirt);
      B[3] = u3;
      let det = estimate(4, B);
      let errbound = ccwerrboundB * detsum;
      if (det >= errbound || -det >= errbound) {
        return det;
      }
      bvirt = ax - acx;
      acxtail = ax - (acx + bvirt) + (bvirt - cx);
      bvirt = bx - bcx;
      bcxtail = bx - (bcx + bvirt) + (bvirt - cx);
      bvirt = ay - acy;
      acytail = ay - (acy + bvirt) + (bvirt - cy);
      bvirt = by - bcy;
      bcytail = by - (bcy + bvirt) + (bvirt - cy);
      if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
        return det;
      }
      errbound = ccwerrboundC * detsum + resulterrbound * Math.abs(det);
      det += acx * bcytail + bcy * acxtail - (acy * bcxtail + bcx * acytail);
      if (det >= errbound || -det >= errbound)
        return det;
      s1 = acxtail * bcy;
      c = splitter * acxtail;
      ahi = c - (c - acxtail);
      alo = acxtail - ahi;
      c = splitter * bcy;
      bhi = c - (c - bcy);
      blo = bcy - bhi;
      s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
      t1 = acytail * bcx;
      c = splitter * acytail;
      ahi = c - (c - acytail);
      alo = acytail - ahi;
      c = splitter * bcx;
      bhi = c - (c - bcx);
      blo = bcx - bhi;
      t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
      _i = s0 - t0;
      bvirt = s0 - _i;
      u[0] = s0 - (_i + bvirt) + (bvirt - t0);
      _j = s1 + _i;
      bvirt = _j - s1;
      _0 = s1 - (_j - bvirt) + (_i - bvirt);
      _i = _0 - t1;
      bvirt = _0 - _i;
      u[1] = _0 - (_i + bvirt) + (bvirt - t1);
      u3 = _j + _i;
      bvirt = u3 - _j;
      u[2] = _j - (u3 - bvirt) + (_i - bvirt);
      u[3] = u3;
      const C1len = sum(4, B, 4, u, C1);
      s1 = acx * bcytail;
      c = splitter * acx;
      ahi = c - (c - acx);
      alo = acx - ahi;
      c = splitter * bcytail;
      bhi = c - (c - bcytail);
      blo = bcytail - bhi;
      s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
      t1 = acy * bcxtail;
      c = splitter * acy;
      ahi = c - (c - acy);
      alo = acy - ahi;
      c = splitter * bcxtail;
      bhi = c - (c - bcxtail);
      blo = bcxtail - bhi;
      t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
      _i = s0 - t0;
      bvirt = s0 - _i;
      u[0] = s0 - (_i + bvirt) + (bvirt - t0);
      _j = s1 + _i;
      bvirt = _j - s1;
      _0 = s1 - (_j - bvirt) + (_i - bvirt);
      _i = _0 - t1;
      bvirt = _0 - _i;
      u[1] = _0 - (_i + bvirt) + (bvirt - t1);
      u3 = _j + _i;
      bvirt = u3 - _j;
      u[2] = _j - (u3 - bvirt) + (_i - bvirt);
      u[3] = u3;
      const C2len = sum(C1len, C1, 4, u, C2);
      s1 = acxtail * bcytail;
      c = splitter * acxtail;
      ahi = c - (c - acxtail);
      alo = acxtail - ahi;
      c = splitter * bcytail;
      bhi = c - (c - bcytail);
      blo = bcytail - bhi;
      s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
      t1 = acytail * bcxtail;
      c = splitter * acytail;
      ahi = c - (c - acytail);
      alo = acytail - ahi;
      c = splitter * bcxtail;
      bhi = c - (c - bcxtail);
      blo = bcxtail - bhi;
      t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
      _i = s0 - t0;
      bvirt = s0 - _i;
      u[0] = s0 - (_i + bvirt) + (bvirt - t0);
      _j = s1 + _i;
      bvirt = _j - s1;
      _0 = s1 - (_j - bvirt) + (_i - bvirt);
      _i = _0 - t1;
      bvirt = _0 - _i;
      u[1] = _0 - (_i + bvirt) + (bvirt - t1);
      u3 = _j + _i;
      bvirt = u3 - _j;
      u[2] = _j - (u3 - bvirt) + (_i - bvirt);
      u[3] = u3;
      const Dlen = sum(C2len, C2, 4, u, D);
      return D[Dlen - 1];
    }
    function orient2d(ax, ay, bx, by, cx, cy) {
      const detleft = (ay - cy) * (bx - cx);
      const detright = (ax - cx) * (by - cy);
      const det = detleft - detright;
      const detsum = Math.abs(detleft + detright);
      if (Math.abs(det) >= ccwerrboundA * detsum)
        return det;
      return -orient2dadapt(ax, ay, bx, by, cx, cy, detsum);
    }
    const crossProduct = (a, b) => a.x * b.y - a.y * b.x;
    const dotProduct = (a, b) => a.x * b.x + a.y * b.y;
    const compareVectorAngles = (basePt, endPt1, endPt2) => {
      const res = orient2d(basePt.x, basePt.y, endPt1.x, endPt1.y, endPt2.x, endPt2.y);
      if (res > 0)
        return -1;
      if (res < 0)
        return 1;
      return 0;
    };
    const length = (v) => Math.sqrt(dotProduct(v, v));
    const sineOfAngle = (pShared, pBase, pAngle) => {
      const vBase = {
        x: pBase.x - pShared.x,
        y: pBase.y - pShared.y
      };
      const vAngle = {
        x: pAngle.x - pShared.x,
        y: pAngle.y - pShared.y
      };
      return crossProduct(vAngle, vBase) / length(vAngle) / length(vBase);
    };
    const cosineOfAngle = (pShared, pBase, pAngle) => {
      const vBase = {
        x: pBase.x - pShared.x,
        y: pBase.y - pShared.y
      };
      const vAngle = {
        x: pAngle.x - pShared.x,
        y: pAngle.y - pShared.y
      };
      return dotProduct(vAngle, vBase) / length(vAngle) / length(vBase);
    };
    const horizontalIntersection = (pt, v, y) => {
      if (v.y === 0)
        return null;
      return {
        x: pt.x + v.x / v.y * (y - pt.y),
        y
      };
    };
    const verticalIntersection = (pt, v, x) => {
      if (v.x === 0)
        return null;
      return {
        x,
        y: pt.y + v.y / v.x * (x - pt.x)
      };
    };
    const intersection$1 = (pt1, v1, pt2, v2) => {
      if (v1.x === 0)
        return verticalIntersection(pt2, v2, pt1.x);
      if (v2.x === 0)
        return verticalIntersection(pt1, v1, pt2.x);
      if (v1.y === 0)
        return horizontalIntersection(pt2, v2, pt1.y);
      if (v2.y === 0)
        return horizontalIntersection(pt1, v1, pt2.y);
      const kross = crossProduct(v1, v2);
      if (kross == 0)
        return null;
      const ve = {
        x: pt2.x - pt1.x,
        y: pt2.y - pt1.y
      };
      const d1 = crossProduct(ve, v1) / kross;
      const d2 = crossProduct(ve, v2) / kross;
      const x1 = pt1.x + d2 * v1.x, x2 = pt2.x + d1 * v2.x;
      const y1 = pt1.y + d2 * v1.y, y2 = pt2.y + d1 * v2.y;
      const x = (x1 + x2) / 2;
      const y = (y1 + y2) / 2;
      return {
        x,
        y
      };
    };

    class SweepEvent {
      static compare(a, b) {
        const ptCmp = SweepEvent.comparePoints(a.point, b.point);
        if (ptCmp !== 0)
          return ptCmp;
        if (a.point !== b.point)
          a.link(b);
        if (a.isLeft !== b.isLeft)
          return a.isLeft ? 1 : -1;
        return Segment.compare(a.segment, b.segment);
      }
      static comparePoints(aPt, bPt) {
        if (aPt.x < bPt.x)
          return -1;
        if (aPt.x > bPt.x)
          return 1;
        if (aPt.y < bPt.y)
          return -1;
        if (aPt.y > bPt.y)
          return 1;
        return 0;
      }
      constructor(point, isLeft) {
        if (point.events === undefined)
          point.events = [this];
        else
          point.events.push(this);
        this.point = point;
        this.isLeft = isLeft;
      }
      link(other) {
        if (other.point === this.point) {
          throw new Error("Tried to link already linked events");
        }
        const otherEvents = other.point.events;
        for (let i = 0, iMax = otherEvents.length;i < iMax; i++) {
          const evt = otherEvents[i];
          this.point.events.push(evt);
          evt.point = this.point;
        }
        this.checkForConsuming();
      }
      checkForConsuming() {
        const numEvents = this.point.events.length;
        for (let i = 0;i < numEvents; i++) {
          const evt1 = this.point.events[i];
          if (evt1.segment.consumedBy !== undefined)
            continue;
          for (let j = i + 1;j < numEvents; j++) {
            const evt2 = this.point.events[j];
            if (evt2.consumedBy !== undefined)
              continue;
            if (evt1.otherSE.point.events !== evt2.otherSE.point.events)
              continue;
            evt1.segment.consume(evt2.segment);
          }
        }
      }
      getAvailableLinkedEvents() {
        const events = [];
        for (let i = 0, iMax = this.point.events.length;i < iMax; i++) {
          const evt = this.point.events[i];
          if (evt !== this && !evt.segment.ringOut && evt.segment.isInResult()) {
            events.push(evt);
          }
        }
        return events;
      }
      getLeftmostComparator(baseEvent) {
        const cache = new Map;
        const fillCache = (linkedEvent) => {
          const nextEvent = linkedEvent.otherSE;
          cache.set(linkedEvent, {
            sine: sineOfAngle(this.point, baseEvent.point, nextEvent.point),
            cosine: cosineOfAngle(this.point, baseEvent.point, nextEvent.point)
          });
        };
        return (a, b) => {
          if (!cache.has(a))
            fillCache(a);
          if (!cache.has(b))
            fillCache(b);
          const {
            sine: asine,
            cosine: acosine
          } = cache.get(a);
          const {
            sine: bsine,
            cosine: bcosine
          } = cache.get(b);
          if (asine >= 0 && bsine >= 0) {
            if (acosine < bcosine)
              return 1;
            if (acosine > bcosine)
              return -1;
            return 0;
          }
          if (asine < 0 && bsine < 0) {
            if (acosine < bcosine)
              return -1;
            if (acosine > bcosine)
              return 1;
            return 0;
          }
          if (bsine < asine)
            return -1;
          if (bsine > asine)
            return 1;
          return 0;
        };
      }
    }
    let segmentId = 0;

    class Segment {
      static compare(a, b) {
        const alx = a.leftSE.point.x;
        const blx = b.leftSE.point.x;
        const arx = a.rightSE.point.x;
        const brx = b.rightSE.point.x;
        if (brx < alx)
          return 1;
        if (arx < blx)
          return -1;
        const aly = a.leftSE.point.y;
        const bly = b.leftSE.point.y;
        const ary = a.rightSE.point.y;
        const bry = b.rightSE.point.y;
        if (alx < blx) {
          if (bly < aly && bly < ary)
            return 1;
          if (bly > aly && bly > ary)
            return -1;
          const aCmpBLeft = a.comparePoint(b.leftSE.point);
          if (aCmpBLeft < 0)
            return 1;
          if (aCmpBLeft > 0)
            return -1;
          const bCmpARight = b.comparePoint(a.rightSE.point);
          if (bCmpARight !== 0)
            return bCmpARight;
          return -1;
        }
        if (alx > blx) {
          if (aly < bly && aly < bry)
            return -1;
          if (aly > bly && aly > bry)
            return 1;
          const bCmpALeft = b.comparePoint(a.leftSE.point);
          if (bCmpALeft !== 0)
            return bCmpALeft;
          const aCmpBRight = a.comparePoint(b.rightSE.point);
          if (aCmpBRight < 0)
            return 1;
          if (aCmpBRight > 0)
            return -1;
          return 1;
        }
        if (aly < bly)
          return -1;
        if (aly > bly)
          return 1;
        if (arx < brx) {
          const bCmpARight = b.comparePoint(a.rightSE.point);
          if (bCmpARight !== 0)
            return bCmpARight;
        }
        if (arx > brx) {
          const aCmpBRight = a.comparePoint(b.rightSE.point);
          if (aCmpBRight < 0)
            return 1;
          if (aCmpBRight > 0)
            return -1;
        }
        if (arx !== brx) {
          const ay = ary - aly;
          const ax = arx - alx;
          const by = bry - bly;
          const bx = brx - blx;
          if (ay > ax && by < bx)
            return 1;
          if (ay < ax && by > bx)
            return -1;
        }
        if (arx > brx)
          return 1;
        if (arx < brx)
          return -1;
        if (ary < bry)
          return -1;
        if (ary > bry)
          return 1;
        if (a.id < b.id)
          return -1;
        if (a.id > b.id)
          return 1;
        return 0;
      }
      constructor(leftSE, rightSE, rings, windings) {
        this.id = ++segmentId;
        this.leftSE = leftSE;
        leftSE.segment = this;
        leftSE.otherSE = rightSE;
        this.rightSE = rightSE;
        rightSE.segment = this;
        rightSE.otherSE = leftSE;
        this.rings = rings;
        this.windings = windings;
      }
      static fromRing(pt1, pt2, ring) {
        let leftPt, rightPt, winding;
        const cmpPts = SweepEvent.comparePoints(pt1, pt2);
        if (cmpPts < 0) {
          leftPt = pt1;
          rightPt = pt2;
          winding = 1;
        } else if (cmpPts > 0) {
          leftPt = pt2;
          rightPt = pt1;
          winding = -1;
        } else
          throw new Error(`Tried to create degenerate segment at [${pt1.x}, ${pt1.y}]`);
        const leftSE = new SweepEvent(leftPt, true);
        const rightSE = new SweepEvent(rightPt, false);
        return new Segment(leftSE, rightSE, [ring], [winding]);
      }
      replaceRightSE(newRightSE) {
        this.rightSE = newRightSE;
        this.rightSE.segment = this;
        this.rightSE.otherSE = this.leftSE;
        this.leftSE.otherSE = this.rightSE;
      }
      bbox() {
        const y1 = this.leftSE.point.y;
        const y2 = this.rightSE.point.y;
        return {
          ll: {
            x: this.leftSE.point.x,
            y: y1 < y2 ? y1 : y2
          },
          ur: {
            x: this.rightSE.point.x,
            y: y1 > y2 ? y1 : y2
          }
        };
      }
      vector() {
        return {
          x: this.rightSE.point.x - this.leftSE.point.x,
          y: this.rightSE.point.y - this.leftSE.point.y
        };
      }
      isAnEndpoint(pt) {
        return pt.x === this.leftSE.point.x && pt.y === this.leftSE.point.y || pt.x === this.rightSE.point.x && pt.y === this.rightSE.point.y;
      }
      comparePoint(point) {
        if (this.isAnEndpoint(point))
          return 0;
        const lPt = this.leftSE.point;
        const rPt = this.rightSE.point;
        const v = this.vector();
        if (lPt.x === rPt.x) {
          if (point.x === lPt.x)
            return 0;
          return point.x < lPt.x ? 1 : -1;
        }
        const yDist = (point.y - lPt.y) / v.y;
        const xFromYDist = lPt.x + yDist * v.x;
        if (point.x === xFromYDist)
          return 0;
        const xDist = (point.x - lPt.x) / v.x;
        const yFromXDist = lPt.y + xDist * v.y;
        if (point.y === yFromXDist)
          return 0;
        return point.y < yFromXDist ? -1 : 1;
      }
      getIntersection(other) {
        const tBbox = this.bbox();
        const oBbox = other.bbox();
        const bboxOverlap = getBboxOverlap(tBbox, oBbox);
        if (bboxOverlap === null)
          return null;
        const tlp = this.leftSE.point;
        const trp = this.rightSE.point;
        const olp = other.leftSE.point;
        const orp = other.rightSE.point;
        const touchesOtherLSE = isInBbox(tBbox, olp) && this.comparePoint(olp) === 0;
        const touchesThisLSE = isInBbox(oBbox, tlp) && other.comparePoint(tlp) === 0;
        const touchesOtherRSE = isInBbox(tBbox, orp) && this.comparePoint(orp) === 0;
        const touchesThisRSE = isInBbox(oBbox, trp) && other.comparePoint(trp) === 0;
        if (touchesThisLSE && touchesOtherLSE) {
          if (touchesThisRSE && !touchesOtherRSE)
            return trp;
          if (!touchesThisRSE && touchesOtherRSE)
            return orp;
          return null;
        }
        if (touchesThisLSE) {
          if (touchesOtherRSE) {
            if (tlp.x === orp.x && tlp.y === orp.y)
              return null;
          }
          return tlp;
        }
        if (touchesOtherLSE) {
          if (touchesThisRSE) {
            if (trp.x === olp.x && trp.y === olp.y)
              return null;
          }
          return olp;
        }
        if (touchesThisRSE && touchesOtherRSE)
          return null;
        if (touchesThisRSE)
          return trp;
        if (touchesOtherRSE)
          return orp;
        const pt = intersection$1(tlp, this.vector(), olp, other.vector());
        if (pt === null)
          return null;
        if (!isInBbox(bboxOverlap, pt))
          return null;
        return rounder.round(pt.x, pt.y);
      }
      split(point) {
        const newEvents = [];
        const alreadyLinked = point.events !== undefined;
        const newLeftSE = new SweepEvent(point, true);
        const newRightSE = new SweepEvent(point, false);
        const oldRightSE = this.rightSE;
        this.replaceRightSE(newRightSE);
        newEvents.push(newRightSE);
        newEvents.push(newLeftSE);
        const newSeg = new Segment(newLeftSE, oldRightSE, this.rings.slice(), this.windings.slice());
        if (SweepEvent.comparePoints(newSeg.leftSE.point, newSeg.rightSE.point) > 0) {
          newSeg.swapEvents();
        }
        if (SweepEvent.comparePoints(this.leftSE.point, this.rightSE.point) > 0) {
          this.swapEvents();
        }
        if (alreadyLinked) {
          newLeftSE.checkForConsuming();
          newRightSE.checkForConsuming();
        }
        return newEvents;
      }
      swapEvents() {
        const tmpEvt = this.rightSE;
        this.rightSE = this.leftSE;
        this.leftSE = tmpEvt;
        this.leftSE.isLeft = true;
        this.rightSE.isLeft = false;
        for (let i = 0, iMax = this.windings.length;i < iMax; i++) {
          this.windings[i] *= -1;
        }
      }
      consume(other) {
        let consumer = this;
        let consumee = other;
        while (consumer.consumedBy)
          consumer = consumer.consumedBy;
        while (consumee.consumedBy)
          consumee = consumee.consumedBy;
        const cmp2 = Segment.compare(consumer, consumee);
        if (cmp2 === 0)
          return;
        if (cmp2 > 0) {
          const tmp = consumer;
          consumer = consumee;
          consumee = tmp;
        }
        if (consumer.prev === consumee) {
          const tmp = consumer;
          consumer = consumee;
          consumee = tmp;
        }
        for (let i = 0, iMax = consumee.rings.length;i < iMax; i++) {
          const ring = consumee.rings[i];
          const winding = consumee.windings[i];
          const index2 = consumer.rings.indexOf(ring);
          if (index2 === -1) {
            consumer.rings.push(ring);
            consumer.windings.push(winding);
          } else
            consumer.windings[index2] += winding;
        }
        consumee.rings = null;
        consumee.windings = null;
        consumee.consumedBy = consumer;
        consumee.leftSE.consumedBy = consumer.leftSE;
        consumee.rightSE.consumedBy = consumer.rightSE;
      }
      prevInResult() {
        if (this._prevInResult !== undefined)
          return this._prevInResult;
        if (!this.prev)
          this._prevInResult = null;
        else if (this.prev.isInResult())
          this._prevInResult = this.prev;
        else
          this._prevInResult = this.prev.prevInResult();
        return this._prevInResult;
      }
      beforeState() {
        if (this._beforeState !== undefined)
          return this._beforeState;
        if (!this.prev)
          this._beforeState = {
            rings: [],
            windings: [],
            multiPolys: []
          };
        else {
          const seg = this.prev.consumedBy || this.prev;
          this._beforeState = seg.afterState();
        }
        return this._beforeState;
      }
      afterState() {
        if (this._afterState !== undefined)
          return this._afterState;
        const beforeState = this.beforeState();
        this._afterState = {
          rings: beforeState.rings.slice(0),
          windings: beforeState.windings.slice(0),
          multiPolys: []
        };
        const ringsAfter = this._afterState.rings;
        const windingsAfter = this._afterState.windings;
        const mpsAfter = this._afterState.multiPolys;
        for (let i = 0, iMax = this.rings.length;i < iMax; i++) {
          const ring = this.rings[i];
          const winding = this.windings[i];
          const index2 = ringsAfter.indexOf(ring);
          if (index2 === -1) {
            ringsAfter.push(ring);
            windingsAfter.push(winding);
          } else
            windingsAfter[index2] += winding;
        }
        const polysAfter = [];
        const polysExclude = [];
        for (let i = 0, iMax = ringsAfter.length;i < iMax; i++) {
          if (windingsAfter[i] === 0)
            continue;
          const ring = ringsAfter[i];
          const poly = ring.poly;
          if (polysExclude.indexOf(poly) !== -1)
            continue;
          if (ring.isExterior)
            polysAfter.push(poly);
          else {
            if (polysExclude.indexOf(poly) === -1)
              polysExclude.push(poly);
            const index2 = polysAfter.indexOf(ring.poly);
            if (index2 !== -1)
              polysAfter.splice(index2, 1);
          }
        }
        for (let i = 0, iMax = polysAfter.length;i < iMax; i++) {
          const mp = polysAfter[i].multiPoly;
          if (mpsAfter.indexOf(mp) === -1)
            mpsAfter.push(mp);
        }
        return this._afterState;
      }
      isInResult() {
        if (this.consumedBy)
          return false;
        if (this._isInResult !== undefined)
          return this._isInResult;
        const mpsBefore = this.beforeState().multiPolys;
        const mpsAfter = this.afterState().multiPolys;
        switch (operation.type) {
          case "union": {
            const noBefores = mpsBefore.length === 0;
            const noAfters = mpsAfter.length === 0;
            this._isInResult = noBefores !== noAfters;
            break;
          }
          case "intersection": {
            let least;
            let most;
            if (mpsBefore.length < mpsAfter.length) {
              least = mpsBefore.length;
              most = mpsAfter.length;
            } else {
              least = mpsAfter.length;
              most = mpsBefore.length;
            }
            this._isInResult = most === operation.numMultiPolys && least < most;
            break;
          }
          case "xor": {
            const diff = Math.abs(mpsBefore.length - mpsAfter.length);
            this._isInResult = diff % 2 === 1;
            break;
          }
          case "difference": {
            const isJustSubject = (mps) => mps.length === 1 && mps[0].isSubject;
            this._isInResult = isJustSubject(mpsBefore) !== isJustSubject(mpsAfter);
            break;
          }
          default:
            throw new Error(`Unrecognized operation type found ${operation.type}`);
        }
        return this._isInResult;
      }
    }

    class RingIn {
      constructor(geomRing, poly, isExterior) {
        if (!Array.isArray(geomRing) || geomRing.length === 0) {
          throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
        }
        this.poly = poly;
        this.isExterior = isExterior;
        this.segments = [];
        if (typeof geomRing[0][0] !== "number" || typeof geomRing[0][1] !== "number") {
          throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
        }
        const firstPoint = rounder.round(geomRing[0][0], geomRing[0][1]);
        this.bbox = {
          ll: {
            x: firstPoint.x,
            y: firstPoint.y
          },
          ur: {
            x: firstPoint.x,
            y: firstPoint.y
          }
        };
        let prevPoint = firstPoint;
        for (let i = 1, iMax = geomRing.length;i < iMax; i++) {
          if (typeof geomRing[i][0] !== "number" || typeof geomRing[i][1] !== "number") {
            throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
          }
          let point = rounder.round(geomRing[i][0], geomRing[i][1]);
          if (point.x === prevPoint.x && point.y === prevPoint.y)
            continue;
          this.segments.push(Segment.fromRing(prevPoint, point, this));
          if (point.x < this.bbox.ll.x)
            this.bbox.ll.x = point.x;
          if (point.y < this.bbox.ll.y)
            this.bbox.ll.y = point.y;
          if (point.x > this.bbox.ur.x)
            this.bbox.ur.x = point.x;
          if (point.y > this.bbox.ur.y)
            this.bbox.ur.y = point.y;
          prevPoint = point;
        }
        if (firstPoint.x !== prevPoint.x || firstPoint.y !== prevPoint.y) {
          this.segments.push(Segment.fromRing(prevPoint, firstPoint, this));
        }
      }
      getSweepEvents() {
        const sweepEvents = [];
        for (let i = 0, iMax = this.segments.length;i < iMax; i++) {
          const segment = this.segments[i];
          sweepEvents.push(segment.leftSE);
          sweepEvents.push(segment.rightSE);
        }
        return sweepEvents;
      }
    }

    class PolyIn {
      constructor(geomPoly, multiPoly) {
        if (!Array.isArray(geomPoly)) {
          throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
        }
        this.exteriorRing = new RingIn(geomPoly[0], this, true);
        this.bbox = {
          ll: {
            x: this.exteriorRing.bbox.ll.x,
            y: this.exteriorRing.bbox.ll.y
          },
          ur: {
            x: this.exteriorRing.bbox.ur.x,
            y: this.exteriorRing.bbox.ur.y
          }
        };
        this.interiorRings = [];
        for (let i = 1, iMax = geomPoly.length;i < iMax; i++) {
          const ring = new RingIn(geomPoly[i], this, false);
          if (ring.bbox.ll.x < this.bbox.ll.x)
            this.bbox.ll.x = ring.bbox.ll.x;
          if (ring.bbox.ll.y < this.bbox.ll.y)
            this.bbox.ll.y = ring.bbox.ll.y;
          if (ring.bbox.ur.x > this.bbox.ur.x)
            this.bbox.ur.x = ring.bbox.ur.x;
          if (ring.bbox.ur.y > this.bbox.ur.y)
            this.bbox.ur.y = ring.bbox.ur.y;
          this.interiorRings.push(ring);
        }
        this.multiPoly = multiPoly;
      }
      getSweepEvents() {
        const sweepEvents = this.exteriorRing.getSweepEvents();
        for (let i = 0, iMax = this.interiorRings.length;i < iMax; i++) {
          const ringSweepEvents = this.interiorRings[i].getSweepEvents();
          for (let j = 0, jMax = ringSweepEvents.length;j < jMax; j++) {
            sweepEvents.push(ringSweepEvents[j]);
          }
        }
        return sweepEvents;
      }
    }

    class MultiPolyIn {
      constructor(geom, isSubject) {
        if (!Array.isArray(geom)) {
          throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
        }
        try {
          if (typeof geom[0][0][0] === "number")
            geom = [geom];
        } catch (ex) {}
        this.polys = [];
        this.bbox = {
          ll: {
            x: Number.POSITIVE_INFINITY,
            y: Number.POSITIVE_INFINITY
          },
          ur: {
            x: Number.NEGATIVE_INFINITY,
            y: Number.NEGATIVE_INFINITY
          }
        };
        for (let i = 0, iMax = geom.length;i < iMax; i++) {
          const poly = new PolyIn(geom[i], this);
          if (poly.bbox.ll.x < this.bbox.ll.x)
            this.bbox.ll.x = poly.bbox.ll.x;
          if (poly.bbox.ll.y < this.bbox.ll.y)
            this.bbox.ll.y = poly.bbox.ll.y;
          if (poly.bbox.ur.x > this.bbox.ur.x)
            this.bbox.ur.x = poly.bbox.ur.x;
          if (poly.bbox.ur.y > this.bbox.ur.y)
            this.bbox.ur.y = poly.bbox.ur.y;
          this.polys.push(poly);
        }
        this.isSubject = isSubject;
      }
      getSweepEvents() {
        const sweepEvents = [];
        for (let i = 0, iMax = this.polys.length;i < iMax; i++) {
          const polySweepEvents = this.polys[i].getSweepEvents();
          for (let j = 0, jMax = polySweepEvents.length;j < jMax; j++) {
            sweepEvents.push(polySweepEvents[j]);
          }
        }
        return sweepEvents;
      }
    }

    class RingOut {
      static factory(allSegments) {
        const ringsOut = [];
        for (let i = 0, iMax = allSegments.length;i < iMax; i++) {
          const segment = allSegments[i];
          if (!segment.isInResult() || segment.ringOut)
            continue;
          let prevEvent = null;
          let event = segment.leftSE;
          let nextEvent = segment.rightSE;
          const events = [event];
          const startingPoint = event.point;
          const intersectionLEs = [];
          while (true) {
            prevEvent = event;
            event = nextEvent;
            events.push(event);
            if (event.point === startingPoint)
              break;
            while (true) {
              const availableLEs = event.getAvailableLinkedEvents();
              if (availableLEs.length === 0) {
                const firstPt = events[0].point;
                const lastPt = events[events.length - 1].point;
                throw new Error(`Unable to complete output ring starting at [${firstPt.x},` + ` ${firstPt.y}]. Last matching segment found ends at` + ` [${lastPt.x}, ${lastPt.y}].`);
              }
              if (availableLEs.length === 1) {
                nextEvent = availableLEs[0].otherSE;
                break;
              }
              let indexLE = null;
              for (let j = 0, jMax = intersectionLEs.length;j < jMax; j++) {
                if (intersectionLEs[j].point === event.point) {
                  indexLE = j;
                  break;
                }
              }
              if (indexLE !== null) {
                const intersectionLE = intersectionLEs.splice(indexLE)[0];
                const ringEvents = events.splice(intersectionLE.index);
                ringEvents.unshift(ringEvents[0].otherSE);
                ringsOut.push(new RingOut(ringEvents.reverse()));
                continue;
              }
              intersectionLEs.push({
                index: events.length,
                point: event.point
              });
              const comparator = event.getLeftmostComparator(prevEvent);
              nextEvent = availableLEs.sort(comparator)[0].otherSE;
              break;
            }
          }
          ringsOut.push(new RingOut(events));
        }
        return ringsOut;
      }
      constructor(events) {
        this.events = events;
        for (let i = 0, iMax = events.length;i < iMax; i++) {
          events[i].segment.ringOut = this;
        }
        this.poly = null;
      }
      getGeom() {
        let prevPt = this.events[0].point;
        const points = [prevPt];
        for (let i = 1, iMax = this.events.length - 1;i < iMax; i++) {
          const pt2 = this.events[i].point;
          const nextPt2 = this.events[i + 1].point;
          if (compareVectorAngles(pt2, prevPt, nextPt2) === 0)
            continue;
          points.push(pt2);
          prevPt = pt2;
        }
        if (points.length === 1)
          return null;
        const pt = points[0];
        const nextPt = points[1];
        if (compareVectorAngles(pt, prevPt, nextPt) === 0)
          points.shift();
        points.push(points[0]);
        const step = this.isExteriorRing() ? 1 : -1;
        const iStart = this.isExteriorRing() ? 0 : points.length - 1;
        const iEnd = this.isExteriorRing() ? points.length : -1;
        const orderedPoints = [];
        for (let i = iStart;i != iEnd; i += step)
          orderedPoints.push([points[i].x, points[i].y]);
        return orderedPoints;
      }
      isExteriorRing() {
        if (this._isExteriorRing === undefined) {
          const enclosing = this.enclosingRing();
          this._isExteriorRing = enclosing ? !enclosing.isExteriorRing() : true;
        }
        return this._isExteriorRing;
      }
      enclosingRing() {
        if (this._enclosingRing === undefined) {
          this._enclosingRing = this._calcEnclosingRing();
        }
        return this._enclosingRing;
      }
      _calcEnclosingRing() {
        let leftMostEvt = this.events[0];
        for (let i = 1, iMax = this.events.length;i < iMax; i++) {
          const evt = this.events[i];
          if (SweepEvent.compare(leftMostEvt, evt) > 0)
            leftMostEvt = evt;
        }
        let prevSeg = leftMostEvt.segment.prevInResult();
        let prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;
        while (true) {
          if (!prevSeg)
            return null;
          if (!prevPrevSeg)
            return prevSeg.ringOut;
          if (prevPrevSeg.ringOut !== prevSeg.ringOut) {
            if (prevPrevSeg.ringOut.enclosingRing() !== prevSeg.ringOut) {
              return prevSeg.ringOut;
            } else
              return prevSeg.ringOut.enclosingRing();
          }
          prevSeg = prevPrevSeg.prevInResult();
          prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;
        }
      }
    }

    class PolyOut {
      constructor(exteriorRing) {
        this.exteriorRing = exteriorRing;
        exteriorRing.poly = this;
        this.interiorRings = [];
      }
      addInterior(ring) {
        this.interiorRings.push(ring);
        ring.poly = this;
      }
      getGeom() {
        const geom = [this.exteriorRing.getGeom()];
        if (geom[0] === null)
          return null;
        for (let i = 0, iMax = this.interiorRings.length;i < iMax; i++) {
          const ringGeom = this.interiorRings[i].getGeom();
          if (ringGeom === null)
            continue;
          geom.push(ringGeom);
        }
        return geom;
      }
    }

    class MultiPolyOut {
      constructor(rings) {
        this.rings = rings;
        this.polys = this._composePolys(rings);
      }
      getGeom() {
        const geom = [];
        for (let i = 0, iMax = this.polys.length;i < iMax; i++) {
          const polyGeom = this.polys[i].getGeom();
          if (polyGeom === null)
            continue;
          geom.push(polyGeom);
        }
        return geom;
      }
      _composePolys(rings) {
        const polys = [];
        for (let i = 0, iMax = rings.length;i < iMax; i++) {
          const ring = rings[i];
          if (ring.poly)
            continue;
          if (ring.isExteriorRing())
            polys.push(new PolyOut(ring));
          else {
            const enclosingRing = ring.enclosingRing();
            if (!enclosingRing.poly)
              polys.push(new PolyOut(enclosingRing));
            enclosingRing.poly.addInterior(ring);
          }
        }
        return polys;
      }
    }

    class SweepLine {
      constructor(queue) {
        let comparator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Segment.compare;
        this.queue = queue;
        this.tree = new Tree(comparator);
        this.segments = [];
      }
      process(event) {
        const segment = event.segment;
        const newEvents = [];
        if (event.consumedBy) {
          if (event.isLeft)
            this.queue.remove(event.otherSE);
          else
            this.tree.remove(segment);
          return newEvents;
        }
        const node = event.isLeft ? this.tree.add(segment) : this.tree.find(segment);
        if (!node)
          throw new Error(`Unable to find segment #${segment.id} ` + `[${segment.leftSE.point.x}, ${segment.leftSE.point.y}] -> ` + `[${segment.rightSE.point.x}, ${segment.rightSE.point.y}] ` + "in SweepLine tree.");
        let prevNode = node;
        let nextNode = node;
        let prevSeg = undefined;
        let nextSeg = undefined;
        while (prevSeg === undefined) {
          prevNode = this.tree.prev(prevNode);
          if (prevNode === null)
            prevSeg = null;
          else if (prevNode.key.consumedBy === undefined)
            prevSeg = prevNode.key;
        }
        while (nextSeg === undefined) {
          nextNode = this.tree.next(nextNode);
          if (nextNode === null)
            nextSeg = null;
          else if (nextNode.key.consumedBy === undefined)
            nextSeg = nextNode.key;
        }
        if (event.isLeft) {
          let prevMySplitter = null;
          if (prevSeg) {
            const prevInter = prevSeg.getIntersection(segment);
            if (prevInter !== null) {
              if (!segment.isAnEndpoint(prevInter))
                prevMySplitter = prevInter;
              if (!prevSeg.isAnEndpoint(prevInter)) {
                const newEventsFromSplit = this._splitSafely(prevSeg, prevInter);
                for (let i = 0, iMax = newEventsFromSplit.length;i < iMax; i++) {
                  newEvents.push(newEventsFromSplit[i]);
                }
              }
            }
          }
          let nextMySplitter = null;
          if (nextSeg) {
            const nextInter = nextSeg.getIntersection(segment);
            if (nextInter !== null) {
              if (!segment.isAnEndpoint(nextInter))
                nextMySplitter = nextInter;
              if (!nextSeg.isAnEndpoint(nextInter)) {
                const newEventsFromSplit = this._splitSafely(nextSeg, nextInter);
                for (let i = 0, iMax = newEventsFromSplit.length;i < iMax; i++) {
                  newEvents.push(newEventsFromSplit[i]);
                }
              }
            }
          }
          if (prevMySplitter !== null || nextMySplitter !== null) {
            let mySplitter = null;
            if (prevMySplitter === null)
              mySplitter = nextMySplitter;
            else if (nextMySplitter === null)
              mySplitter = prevMySplitter;
            else {
              const cmpSplitters = SweepEvent.comparePoints(prevMySplitter, nextMySplitter);
              mySplitter = cmpSplitters <= 0 ? prevMySplitter : nextMySplitter;
            }
            this.queue.remove(segment.rightSE);
            newEvents.push(segment.rightSE);
            const newEventsFromSplit = segment.split(mySplitter);
            for (let i = 0, iMax = newEventsFromSplit.length;i < iMax; i++) {
              newEvents.push(newEventsFromSplit[i]);
            }
          }
          if (newEvents.length > 0) {
            this.tree.remove(segment);
            newEvents.push(event);
          } else {
            this.segments.push(segment);
            segment.prev = prevSeg;
          }
        } else {
          if (prevSeg && nextSeg) {
            const inter = prevSeg.getIntersection(nextSeg);
            if (inter !== null) {
              if (!prevSeg.isAnEndpoint(inter)) {
                const newEventsFromSplit = this._splitSafely(prevSeg, inter);
                for (let i = 0, iMax = newEventsFromSplit.length;i < iMax; i++) {
                  newEvents.push(newEventsFromSplit[i]);
                }
              }
              if (!nextSeg.isAnEndpoint(inter)) {
                const newEventsFromSplit = this._splitSafely(nextSeg, inter);
                for (let i = 0, iMax = newEventsFromSplit.length;i < iMax; i++) {
                  newEvents.push(newEventsFromSplit[i]);
                }
              }
            }
          }
          this.tree.remove(segment);
        }
        return newEvents;
      }
      _splitSafely(seg, pt) {
        this.tree.remove(seg);
        const rightSE = seg.rightSE;
        this.queue.remove(rightSE);
        const newEvents = seg.split(pt);
        newEvents.push(rightSE);
        if (seg.consumedBy === undefined)
          this.tree.add(seg);
        return newEvents;
      }
    }
    const POLYGON_CLIPPING_MAX_QUEUE_SIZE = typeof process !== "undefined" && process.env.POLYGON_CLIPPING_MAX_QUEUE_SIZE || 1e6;
    const POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS = typeof process !== "undefined" && process.env.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS || 1e6;

    class Operation {
      run(type, geom, moreGeoms) {
        operation.type = type;
        rounder.reset();
        const multipolys = [new MultiPolyIn(geom, true)];
        for (let i = 0, iMax = moreGeoms.length;i < iMax; i++) {
          multipolys.push(new MultiPolyIn(moreGeoms[i], false));
        }
        operation.numMultiPolys = multipolys.length;
        if (operation.type === "difference") {
          const subject = multipolys[0];
          let i = 1;
          while (i < multipolys.length) {
            if (getBboxOverlap(multipolys[i].bbox, subject.bbox) !== null)
              i++;
            else
              multipolys.splice(i, 1);
          }
        }
        if (operation.type === "intersection") {
          for (let i = 0, iMax = multipolys.length;i < iMax; i++) {
            const mpA = multipolys[i];
            for (let j = i + 1, jMax = multipolys.length;j < jMax; j++) {
              if (getBboxOverlap(mpA.bbox, multipolys[j].bbox) === null)
                return [];
            }
          }
        }
        const queue = new Tree(SweepEvent.compare);
        for (let i = 0, iMax = multipolys.length;i < iMax; i++) {
          const sweepEvents = multipolys[i].getSweepEvents();
          for (let j = 0, jMax = sweepEvents.length;j < jMax; j++) {
            queue.insert(sweepEvents[j]);
            if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
              throw new Error("Infinite loop when putting segment endpoints in a priority queue " + "(queue size too big).");
            }
          }
        }
        const sweepLine = new SweepLine(queue);
        let prevQueueSize = queue.size;
        let node = queue.pop();
        while (node) {
          const evt = node.key;
          if (queue.size === prevQueueSize) {
            const seg = evt.segment;
            throw new Error(`Unable to pop() ${evt.isLeft ? "left" : "right"} SweepEvent ` + `[${evt.point.x}, ${evt.point.y}] from segment #${seg.id} ` + `[${seg.leftSE.point.x}, ${seg.leftSE.point.y}] -> ` + `[${seg.rightSE.point.x}, ${seg.rightSE.point.y}] from queue.`);
          }
          if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
            throw new Error("Infinite loop when passing sweep line over endpoints " + "(queue size too big).");
          }
          if (sweepLine.segments.length > POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS) {
            throw new Error("Infinite loop when passing sweep line over endpoints " + "(too many sweep line segments).");
          }
          const newEvents = sweepLine.process(evt);
          for (let i = 0, iMax = newEvents.length;i < iMax; i++) {
            const evt2 = newEvents[i];
            if (evt2.consumedBy === undefined)
              queue.insert(evt2);
          }
          prevQueueSize = queue.size;
          node = queue.pop();
        }
        rounder.reset();
        const ringsOut = RingOut.factory(sweepLine.segments);
        const result = new MultiPolyOut(ringsOut);
        return result.getGeom();
      }
    }
    const operation = new Operation;
    const union = function(geom) {
      for (var _len = arguments.length, moreGeoms = new Array(_len > 1 ? _len - 1 : 0), _key = 1;_key < _len; _key++) {
        moreGeoms[_key - 1] = arguments[_key];
      }
      return operation.run("union", geom, moreGeoms);
    };
    const intersection = function(geom) {
      for (var _len2 = arguments.length, moreGeoms = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1;_key2 < _len2; _key2++) {
        moreGeoms[_key2 - 1] = arguments[_key2];
      }
      return operation.run("intersection", geom, moreGeoms);
    };
    const xor = function(geom) {
      for (var _len3 = arguments.length, moreGeoms = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1;_key3 < _len3; _key3++) {
        moreGeoms[_key3 - 1] = arguments[_key3];
      }
      return operation.run("xor", geom, moreGeoms);
    };
    const difference = function(subjectGeom) {
      for (var _len4 = arguments.length, clippingGeoms = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1;_key4 < _len4; _key4++) {
        clippingGeoms[_key4 - 1] = arguments[_key4];
      }
      return operation.run("difference", subjectGeom, clippingGeoms);
    };
    var index = {
      union,
      intersection,
      xor,
      difference
    };
    return index;
  });
});

// ../../apps/web/src/data/cabinets.ts
var CABINET_SPECS = [
  {
    id: "B3",
    name: 'Base Filler 3"',
    type: "filler",
    width: 3,
    height: 34.5,
    depth: 24,
    description: "Narrow filler panel"
  },
  {
    id: "B6",
    name: 'Base Filler 6"',
    type: "filler",
    width: 6,
    height: 34.5,
    depth: 24,
    description: "Filler cabinet"
  },
  {
    id: "B9",
    name: 'Base 9"',
    type: "base",
    width: 9,
    height: 34.5,
    depth: 24,
    description: "Narrow base cabinet"
  },
  {
    id: "B12",
    name: 'Base 12"',
    type: "base",
    width: 12,
    height: 34.5,
    depth: 24,
    description: "Single door base cabinet"
  },
  {
    id: "B15",
    name: 'Base 15"',
    type: "base",
    width: 15,
    height: 34.5,
    depth: 24,
    description: "Single door base cabinet"
  },
  {
    id: "B18",
    name: 'Base 18"',
    type: "base",
    width: 18,
    height: 34.5,
    depth: 24,
    description: "Single door base cabinet"
  },
  {
    id: "B24",
    name: 'Base 24"',
    type: "base",
    width: 24,
    height: 34.5,
    depth: 24,
    description: "Double door base cabinet"
  },
  {
    id: "B30",
    name: 'Base 30"',
    type: "base",
    width: 30,
    height: 34.5,
    depth: 24,
    description: "Double door base cabinet"
  },
  {
    id: "B36",
    name: 'Base 36"',
    type: "base",
    width: 36,
    height: 34.5,
    depth: 24,
    description: "Double door base cabinet"
  },
  {
    id: "B42",
    name: 'Base 42"',
    type: "base",
    width: 42,
    height: 34.5,
    depth: 24,
    description: "Double door base cabinet with drawers"
  },
  {
    id: "B48",
    name: 'Base 48"',
    type: "base",
    width: 48,
    height: 34.5,
    depth: 24,
    description: "Double door base cabinet with drawers"
  },
  {
    id: "W330",
    name: 'Wall Filler 3×30"',
    type: "wall",
    width: 3,
    height: 30,
    depth: 12,
    description: "Narrow filler panel"
  },
  {
    id: "W630",
    name: 'Wall Filler 6×30"',
    type: "wall",
    width: 6,
    height: 30,
    depth: 12,
    description: "Filler cabinet"
  },
  {
    id: "W930",
    name: 'Wall 9×30"',
    type: "wall",
    width: 9,
    height: 30,
    depth: 12,
    description: "Narrow wall cabinet"
  },
  {
    id: "W1230",
    name: 'Wall 12×30"',
    type: "wall",
    width: 12,
    height: 30,
    depth: 12,
    description: "Single door wall cabinet"
  },
  {
    id: "W1530",
    name: 'Wall 15×30"',
    type: "wall",
    width: 15,
    height: 30,
    depth: 12,
    description: "Single door wall cabinet"
  },
  {
    id: "W1830",
    name: 'Wall 18×30"',
    type: "wall",
    width: 18,
    height: 30,
    depth: 12,
    description: "Single door wall cabinet"
  },
  {
    id: "W2430",
    name: 'Wall 24×30"',
    type: "wall",
    width: 24,
    height: 30,
    depth: 12,
    description: "Double door wall cabinet"
  },
  {
    id: "W3030",
    name: 'Wall 30×30"',
    type: "wall",
    width: 30,
    height: 30,
    depth: 12,
    description: "Double door wall cabinet"
  },
  {
    id: "W3630",
    name: 'Wall 36×30"',
    type: "wall",
    width: 36,
    height: 30,
    depth: 12,
    description: "Double door wall cabinet"
  },
  {
    id: "W3042",
    name: 'Wall 30×42"',
    type: "wall",
    width: 30,
    height: 42,
    depth: 12,
    description: "Tall double door wall cabinet"
  },
  {
    id: "W3642",
    name: 'Wall 36×42"',
    type: "wall",
    width: 36,
    height: 42,
    depth: 12,
    description: "Tall double door wall cabinet"
  },
  {
    id: "W2418",
    name: 'Wall 24×18"',
    type: "wall",
    width: 24,
    height: 18,
    depth: 12,
    description: "Over-sink wall cabinet"
  },
  {
    id: "W3018",
    name: 'Wall 30×18"',
    type: "wall",
    width: 30,
    height: 18,
    depth: 12,
    description: "Over-sink wall cabinet"
  },
  {
    id: "W3318",
    name: 'Wall 33×18"',
    type: "wall",
    width: 33,
    height: 18,
    depth: 12,
    description: "Over-sink wall cabinet"
  },
  {
    id: "W3618",
    name: 'Wall 36×18"',
    type: "wall",
    width: 36,
    height: 18,
    depth: 12,
    description: "Over-sink wall cabinet"
  },
  {
    id: "T1884",
    name: 'Tall 18×84"',
    type: "tall",
    width: 18,
    height: 84,
    depth: 24,
    description: "Single door pantry cabinet"
  },
  {
    id: "T2484",
    name: 'Tall 24×84"',
    type: "tall",
    width: 24,
    height: 84,
    depth: 24,
    description: "Double door pantry cabinet"
  },
  {
    id: "T3084",
    name: 'Tall 30×84"',
    type: "tall",
    width: 30,
    height: 84,
    depth: 24,
    description: "Double door pantry cabinet"
  },
  {
    id: "T2496",
    name: 'Tall 24×96"',
    type: "tall",
    width: 24,
    height: 96,
    depth: 24,
    description: "Full height pantry cabinet"
  },
  {
    id: "WRF3614",
    name: 'Above Fridge 36×14"',
    type: "wall",
    width: 36,
    height: 12,
    depth: 24,
    description: "Cabinet above refrigerator, recessed from fridge front"
  },
  {
    id: "BCORN",
    name: "Corner Base Cabinet",
    type: "corner-base",
    width: 24,
    height: 34.5,
    depth: 24,
    description: "90° corner base cabinet with diagonal door"
  },
  {
    id: "WCORN",
    name: "Corner Wall Cabinet",
    type: "corner-wall",
    width: 24,
    height: 30,
    depth: 24,
    description: "90° corner wall cabinet with diagonal door"
  },
  {
    id: "SB24",
    name: 'Sink Base 24"',
    type: "sink-base",
    width: 24,
    height: 34.5,
    depth: 24,
    description: "Sink base cabinet with false front"
  },
  {
    id: "SB30",
    name: 'Sink Base 30"',
    type: "sink-base",
    width: 30,
    height: 34.5,
    depth: 24,
    description: "Sink base cabinet with false front"
  },
  {
    id: "SB33",
    name: 'Sink Base 33"',
    type: "sink-base",
    width: 33,
    height: 34.5,
    depth: 24,
    description: "Sink base cabinet with false front"
  },
  {
    id: "SB36",
    name: 'Sink Base 36"',
    type: "sink-base",
    width: 36,
    height: 34.5,
    depth: 24,
    description: "Sink base cabinet with false front"
  }
];
var getCabinetById = (id) => {
  return CABINET_SPECS.find((c) => c.id === id);
};
var getCabinetsByType = (type) => {
  return CABINET_SPECS.filter((c) => c.type === type);
};

// ../../apps/web/src/lib/layout/constants.ts
var BASE_CABINET_DEPTH = 24;
var DOOR_CLEARANCE = 18;
var WINDOW_CLEARANCE = 3;
var BASE_CABINET_HEIGHT = 34.5;
var WALL_CABINET_Y = 54;
var baseCabinets = null;
var wallCabinets = null;
var tallCabinets = null;
function getBaseCabinets() {
  if (!baseCabinets) {
    baseCabinets = [
      ...getCabinetsByType("base").filter((cabinet) => cabinet.id !== "B9"),
      ...getCabinetsByType("filler")
    ].sort((a, b) => b.width - a.width);
  }
  return baseCabinets;
}
function getWallCabinets() {
  if (!wallCabinets) {
    wallCabinets = getCabinetsByType("wall").filter((c) => c.height === 30).sort((a, b) => b.width - a.width);
  }
  return wallCabinets;
}
function getTallCabinets() {
  if (!tallCabinets) {
    tallCabinets = getCabinetsByType("tall").filter((c) => c.height === 84).sort((a, b) => b.width - a.width);
  }
  return tallCabinets;
}

// ../../apps/web/src/lib/layout/rng.ts
function mulberry32(seed) {
  let s = seed | 0;
  return () => {
    s = s + 1831565813 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function randomSeed() {
  return Math.floor(Math.random() * 4294967296) >>> 0;
}
function decisionSeed(rootSeed, key) {
  let hash = (2166136261 ^ rootSeed >>> 0) >>> 0;
  for (let index = 0;index < key.length; index++) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 2146121005) >>> 0;
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 2221713035) >>> 0;
  return (hash ^ hash >>> 16) >>> 0;
}
function decisionRng(rootSeed, key) {
  return mulberry32(decisionSeed(rootSeed, key));
}
function randomChoice(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

// ../../apps/web/src/lib/layout/wall-geometry.ts
function wallGeometry(wall, room, activeWalls) {
  const hasWest = activeWalls.has("west");
  const hasSouth = activeWalls.has("south");
  switch (wall) {
    case "north":
      return { rotation: 180, fixedCoord: room.depth, runAxis: "x", perpOffset: hasWest ? BASE_CABINET_DEPTH : 0, anchorIsEndEdge: true, wallFacesLowCoord: true };
    case "south":
      return { rotation: 0, fixedCoord: 0, runAxis: "x", perpOffset: hasWest ? BASE_CABINET_DEPTH : 0, anchorIsEndEdge: false, wallFacesLowCoord: false };
    case "east":
      return { rotation: 270, fixedCoord: room.width, runAxis: "z", perpOffset: hasSouth ? BASE_CABINET_DEPTH : 0, anchorIsEndEdge: false, wallFacesLowCoord: true };
    case "west":
      return { rotation: 90, fixedCoord: 0, runAxis: "z", perpOffset: hasSouth ? BASE_CABINET_DEPTH : 0, anchorIsEndEdge: true, wallFacesLowCoord: false };
  }
}
function doorToReservation(door, geo, clearance) {
  const cabStart = Math.max(0, door.offset - geo.perpOffset - clearance);
  const cabEnd = door.offset + door.width - geo.perpOffset + clearance;
  if (cabEnd <= 0)
    return null;
  return {
    category: "door",
    wall: door.wall,
    offset: cabStart,
    width: cabEnd - cabStart,
    blocksBaseCabinets: true,
    blocksWallCabinets: true
  };
}
function windowToReservation(win, geo, clearance) {
  if (win.wall === "angled")
    return null;
  const cabStart = Math.max(0, win.offset - geo.perpOffset - clearance);
  const cabEnd = win.offset + win.width - geo.perpOffset + clearance;
  if (cabEnd <= 0)
    return null;
  return {
    category: "window",
    wall: win.wall,
    offset: cabStart,
    width: cabEnd - cabStart,
    blocksBaseCabinets: false,
    blocksWallCabinets: true
  };
}

// ../../apps/web/src/lib/layout/weights.ts
var DEFAULT_WEIGHTS = {
  minIslandClearance: 36,
  maxIslandClearance: 48,
  minIslandClearanceEmptyWall: 18,
  minIslandWidth: 36,
  maxIslandWidth: 72,
  minIslandDepth: 24,
  maxIslandDepth: 48,
  islandWidthFloor: 0.85,
  islandDoubleRowProbability: 0.5,
  preferredApplianceBuffer: 12,
  minimumApplianceBuffer: 6,
  rangeEdgeGap: 9,
  reservedDishwasherWidth: 24,
  reservedTrashWidth: 18,
  doorClearance: 18,
  doorHeight: 80,
  windowClearance: 3,
  windowWidth: 36,
  windowHeight: 36,
  windowFromFloor: 42,
  wallCabinetY: 54,
  wallCabinetHeight: 30,
  wallCabinetDepth: 12,
  aboveFridgeCabinetHeight: 12,
  minPeninsulaLength: 36,
  maxPeninsulaLength: 72,
  tallCabinetThreshold: 36,
  tallCabinetProbability: 0.75
};

// ../../apps/web/src/data/cabinet-panels/appliance-colors.ts
var APPLIANCE_STEEL = "#33373d";
var APPLIANCE_DARK = "#1b1d22";
var APPLIANCE_GLASS = "#202329";

// ../../apps/web/src/data/cabinet-panels/dimensions.ts
var SIDE_THICKNESS = 0.75;
var BACK_THICKNESS = 0.25;
var SHELF_THICKNESS = 0.75;
var DOOR_THICKNESS = 0.75;

// ../../apps/web/src/data/cabinet-panels/base-microwave.ts
function baseMicrowaveCasePanels(width, depth, innerWidth, innerDepth, caseHeight, toeKickHeight) {
  return [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "bottom",
      name: "Bottom",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "divider",
      name: "Divider",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "top-stretcher",
      name: "Top Stretcher",
      width: innerWidth,
      height: 4,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "back",
      name: "Back Panel",
      width: width - 2 * SIDE_THICKNESS + BACK_THICKNESS * 2,
      height: caseHeight - SIDE_THICKNESS,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "toe-kick",
      name: "Toe Kick",
      width,
      height: toeKickHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#8b6914"
    }
  ];
}
function baseMicrowaveCasePlacements(panels, width, height, depth, caseHeight, dividerY, toeKickHeight, toeKickDepth) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  return [
    {
      panel: panel("left-side"),
      x: SIDE_THICKNESS / 2,
      y: toeKickHeight + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: toeKickHeight + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("bottom"),
      x: width / 2,
      y: toeKickHeight + SIDE_THICKNESS / 2,
      z: (depth - BACK_THICKNESS) / 2 + BACK_THICKNESS,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("divider"),
      x: width / 2,
      y: dividerY,
      z: (depth - BACK_THICKNESS) / 2 + BACK_THICKNESS,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("top-stretcher"),
      x: width / 2,
      y: height - SIDE_THICKNESS / 2,
      z: depth - 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back"),
      x: width / 2,
      y: toeKickHeight + (caseHeight - SIDE_THICKNESS) / 2 + SIDE_THICKNESS,
      z: BACK_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("toe-kick"),
      x: width / 2,
      y: toeKickHeight / 2,
      z: depth - toeKickDepth,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }
  ];
}
function addLowerDrawer(panels, placements, width, depth, dividerY, toeKickHeight) {
  const lowerHeight = dividerY - toeKickHeight - 0.25;
  const drawer = {
    id: "lower-drawer",
    name: "Drawer Front",
    width: width - 0.25,
    height: lowerHeight,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  };
  panels.push(drawer);
  placements.push({
    panel: drawer,
    x: width / 2,
    y: toeKickHeight + 0.125 + lowerHeight / 2,
    z: depth + DOOR_THICKNESS / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const drawerPull = {
    id: "lower-pull",
    name: "Drawer Pull",
    width: Math.min(width * 0.4, 10),
    height: 0.5,
    thickness: 0.4,
    material: "mdf",
    color: "#3a3a3a"
  };
  panels.push(drawerPull);
  placements.push({
    panel: drawerPull,
    x: width / 2,
    y: toeKickHeight + 0.125 + lowerHeight * 0.78,
    z: depth + DOOR_THICKNESS + 0.2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
}
function addBaseMicrowaveUnit(panels, placements, width, depth, innerWidth, microwaveBay, dividerY) {
  const microwaveWidth = innerWidth - 1;
  const microwaveHeight = microwaveBay - 1;
  const bodyDepth = Math.max(8, depth * 0.7);
  const centerY = dividerY + SIDE_THICKNESS / 2 + microwaveHeight / 2 + 0.25;
  const bodyFrontZ = depth - 0.4;
  const body = {
    id: "mw-body",
    name: "Microwave Body",
    width: microwaveWidth,
    height: microwaveHeight,
    thickness: bodyDepth,
    material: "appliance",
    color: APPLIANCE_STEEL
  };
  panels.push(body);
  placements.push({
    panel: body,
    x: width / 2,
    y: centerY,
    z: bodyFrontZ - bodyDepth / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const windowWidth = microwaveWidth * 0.6;
  const controlWidth = microwaveWidth * 0.3;
  const faceZ = bodyFrontZ + 0.05;
  const window = {
    id: "mw-window",
    name: "Microwave Window",
    width: windowWidth,
    height: microwaveHeight * 0.78,
    thickness: 0.25,
    material: "glass",
    color: APPLIANCE_GLASS
  };
  panels.push(window);
  placements.push({
    panel: window,
    x: SIDE_THICKNESS + 0.5 + windowWidth / 2,
    y: centerY,
    z: faceZ,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const control = {
    id: "mw-control",
    name: "Microwave Controls",
    width: controlWidth,
    height: microwaveHeight * 0.78,
    thickness: 0.3,
    material: "appliance",
    color: APPLIANCE_DARK
  };
  panels.push(control);
  placements.push({
    panel: control,
    x: width - SIDE_THICKNESS - 0.5 - controlWidth / 2,
    y: centerY,
    z: faceZ,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
}
function generateBaseMicrowavePanels(width, height, depth) {
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const innerDepth = depth - BACK_THICKNESS;
  const toeKickHeight = 4;
  const toeKickDepth = 3;
  const caseHeight = height - toeKickHeight;
  const microwaveBay = Math.min(14, caseHeight * 0.42);
  const dividerY = toeKickHeight + (caseHeight - microwaveBay);
  const panels = baseMicrowaveCasePanels(width, depth, innerWidth, innerDepth, caseHeight, toeKickHeight);
  const placements = baseMicrowaveCasePlacements(panels, width, height, depth, caseHeight, dividerY, toeKickHeight, toeKickDepth);
  addLowerDrawer(panels, placements, width, depth, dividerY, toeKickHeight);
  addBaseMicrowaveUnit(panels, placements, width, depth, innerWidth, microwaveBay, dividerY);
  return { cabinetId: "base-microwave", panels, placements };
}

// ../../apps/web/src/lib/cabinet-taxonomy.ts
var CABINET_TYPE_INFO = {
  B: { geom: "base", label: "Base" },
  BSR: { geom: "base", label: "Spice Rack Base" },
  BEC: { geom: "base", label: "Base End Cabinet" },
  BEA: { geom: "base", label: "Base End Angle" },
  BPP: { geom: "base", label: "Base Panel" },
  BMC: { geom: "base-microwave", label: "Base Microwave" },
  MOC: { geom: "base-microwave", label: "Base Microwave" },
  FDB: { geom: "base-fulldoor", label: "Full Door Base" },
  BFH: { geom: "base-fulldoor", label: "Base Full Door" },
  BWB: { geom: "base", label: "Waste Basket Base" },
  WB: { geom: "base", label: "Waste Basket Base" },
  V: { geom: "base", label: "Vanity" },
  VB: { geom: "base", label: "Vanity Base" },
  VA: { geom: "base", label: "Vanity" },
  FVA: { geom: "wall", label: "Floating Vanity" },
  DB: { geom: "base-drawer", label: "Drawer Base" },
  PD: { geom: "base-drawer", label: "Pot Drawer Base" },
  SVA: { geom: "base-drawer", label: "Vanity Drawer Base" },
  VDB: { geom: "base-drawer", label: "Vanity Drawer Base" },
  FVD: { geom: "base-drawer", label: "Floating Vanity Drawer" },
  SB: { geom: "sink-base", label: "Sink Base" },
  FSB: { geom: "sink-base", label: "Farm Sink Base" },
  FA: { geom: "sink-base", label: "Vanity Sink Base" },
  VSB: { geom: "sink-base", label: "Vanity Sink Base" },
  BBC: { geom: "corner-base", label: "Blind Corner Base" },
  BLS: { geom: "corner-base", label: "Lazy Susan" },
  LAZ: { geom: "corner-base", label: "Lazy Susan" },
  BDC: { geom: "corner-base", label: "Corner Sink Base" },
  SBA: { geom: "corner-base", label: "Corner Sink Base" },
  LS: { geom: "corner-base", label: "Lazy Susan" },
  CSB: { geom: "corner-base", label: "Corner Sink Base" },
  BCORN: { geom: "corner-base", label: "Corner Base" },
  W: { geom: "wall", label: "Wall" },
  WRF: { geom: "wall", label: "Above Fridge" },
  WEC: { geom: "wall", label: "Wall End Cabinet" },
  WMC: { geom: "wall-microwave", label: "Wall Microwave" },
  MWC: { geom: "wall-microwave", label: "Wall Microwave" },
  WEA: { geom: "wall", label: "Wall End" },
  WR: { geom: "wine-rack", label: "Wine Rack" },
  WWR: { geom: "wine-rack", label: "Wine Rack" },
  WRC: { geom: "wine-rack", label: "Wine Rack" },
  WFD: { geom: "flat-panel", label: "Wall Fake Door" },
  BFD: { geom: "flat-panel", label: "Base Fake Door" },
  D: { geom: "flat-panel", label: "Decorative Door" },
  GD: { geom: "flat-panel", label: "Glass Door" },
  "GD-W": { geom: "wall-glass", label: "Glass Door Wall" },
  GW: { geom: "wall-glass", label: "Glass Wall" },
  "GC-W": { geom: "wall-glass", label: "Glass Door Cabinet" },
  "GD-WDC": { geom: "wall-glass", label: "Glass Corner" },
  GWDC: { geom: "wall-glass", label: "Glass Corner" },
  WES: { geom: "wall-open", label: "Wall End Shelf" },
  WSF: { label: "Floating Shelf", accessory: true },
  WCORN: { geom: "corner-wall", label: "Corner Wall" },
  WDC: { geom: "corner-wall", label: "Wall Diagonal Corner" },
  WLS: { geom: "corner-wall", label: "Wall Lazy Susan" },
  WBC: { geom: "corner-wall", label: "Wall Blind Corner" },
  WLC: { geom: "corner-wall", label: "Wall Pie Cut" },
  WER: { geom: "corner-wall", label: "Wall Easy Reach" },
  T: { geom: "tall", label: "Tall Pantry" },
  TP: { geom: "tall", label: "Tall Pantry" },
  WP: { geom: "tall", label: "Pantry" },
  OC: { geom: "oven-tall", label: "Oven Cabinet" },
  PC: { geom: "tall", label: "Pantry Cabinet" },
  OVD: { geom: "oven-tall", label: "Oven Cabinet" },
  WF: { geom: "filler", label: "Wall Filler" },
  PCVFF: { geom: "filler", label: "Fluted Filler" },
  FP: { geom: "filler", label: "Filler Panel" },
  TF: { geom: "filler", label: "Tall Filler" },
  BF: { geom: "filler", label: "Base Filler" },
  ACM: { label: "Crown Molding", accessory: true },
  CCM: { label: "Crown Molding", accessory: true },
  OGM: { label: "Ogee Molding", accessory: true },
  OCM: { label: "Outside Corner Molding", accessory: true },
  BCB: { label: "Chair Rail Molding", accessory: true },
  BM: { label: "Base Board Molding", accessory: true },
  SM: { label: "Scribe Molding", accessory: true },
  TLR: { label: "Light Rail Molding", accessory: true },
  DMI: { label: "Dental Molding", accessory: true },
  RMI: { label: "Rope Molding", accessory: true },
  QR: { label: "Quarter Round", accessory: true },
  BP: { label: "Back Panel", accessory: true },
  DWR: { label: "Dishwasher Panel", accessory: true },
  RRP: { label: "Refrigerator Panel", accessory: true },
  UREP: { label: "Refrigerator Panel", accessory: true },
  TK: { label: "Toe Kick", accessory: true },
  PN: { label: "Panel", accessory: true },
  WEP: { label: "Wall End Panel", accessory: true },
  HC: { label: "Hood Cover", accessory: true },
  CORBEL: { label: "Corbel", accessory: true },
  FB: { label: "Rosette", accessory: true },
  SPOOL: { label: "Turned Spool", accessory: true },
  SS: { label: "Split Spool", accessory: true },
  RD: { label: "Roll Out Tray", accessory: true },
  TILT: { label: "Tilt Out Tray", accessory: true },
  UTC: { label: "Spice Rack Tray", accessory: true },
  SR: { label: "Spice Rack Insert", accessory: true },
  SO: { label: "Spice / Silverware Organizer", accessory: true },
  FD: { label: "Knee Drawer", accessory: true },
  BES: { label: "Base End Shelf", accessory: true },
  SVAM: { label: "Vanity Mirror", accessory: true },
  SD: { label: "Sample Door", accessory: true },
  TOUCH: { label: "Touch-Up Kit", accessory: true },
  VAL: { label: "Big Valance", accessory: true },
  GR: { label: "Glass Rack", accessory: true },
  ROT: { label: "Roll Out Tray", accessory: true },
  LM: { label: "Light Rail Molding", accessory: true },
  CM: { label: "Corbel / Molding", accessory: true },
  RR: { label: "Refrigerator Return Panel", accessory: true },
  CHC: { label: "Hood Cover", accessory: true },
  MR: { label: "Mirror", accessory: true },
  WFF: { label: "Fluted Filler", accessory: true },
  PNL: { label: "Panel", accessory: true },
  WDP: { label: "Wall Decorative Panel", accessory: true },
  WFP: { label: "Wall Filler Panel", accessory: true },
  BIP: { label: "Base Inside Panel", accessory: true },
  PRC: { label: "Plate Rack", accessory: true }
};
var DEFAULT_TYPE_INFO = { geom: "base", label: "Cabinet" };
function typeInfo(code) {
  if (!code)
    return DEFAULT_TYPE_INFO;
  return CABINET_TYPE_INFO[code] ?? CABINET_TYPE_INFO[code.toUpperCase()] ?? DEFAULT_TYPE_INFO;
}
var CATALOG_TYPE_TO_GEOM = Object.fromEntries(Object.entries(CABINET_TYPE_INFO).filter(([, info]) => info.geom != null).map(([code, info]) => [code, info.geom]));
function cabinetTypeGeom(code) {
  return typeInfo(code).geom ?? "base";
}
function displayCabinetGeom(cabinetType, itemCode) {
  const geom = cabinetTypeGeom(cabinetType);
  if (geom === "base" && isFullDoorBase(itemCode))
    return "base-fulldoor";
  return geom === "oven-tall" && isDoubleOven(itemCode) ? "oven-tall-d" : geom;
}
function businessCabinetGeom(geom) {
  if (geom === "base-fulldoor")
    return "base";
  if (geom === "oven-tall-d")
    return "oven-tall";
  if (geom === "corner-base-blind" || geom === "corner-base-diag")
    return "corner-base";
  if (geom === "corner-wall-blind" || geom === "corner-wall-diag")
    return "corner-wall";
  return geom;
}
function isBlindCorner(code) {
  return /\bblind\b/i.test(typeInfo(code).label);
}
function cabinetTypeLabel(code) {
  return typeInfo(code).label;
}
function isFullDoorBase(code) {
  if (!code)
    return false;
  const normalized = code.trim().toUpperCase();
  const leaf = normalized.split("/").at(-1) ?? normalized;
  return /^(?:FDB|BFH|FB)(?:\d|[-_]|$)/.test(leaf) || /(?:^|[-_\s])FULL[-_\s]?DOOR(?:$|[-_\s\d])/.test(leaf) || /(?:^|[-_\s])FD(?:$|[-_\s\d])/.test(leaf);
}
function isDoubleOven(itemCode) {
  if (!itemCode)
    return false;
  return /(?:^|[-\s])OC\d+-D$/.test(itemCode.trim().toUpperCase());
}
function isGlassPanel(code) {
  if (!code)
    return false;
  const leaf = stripManufacturerPrefix(code).trim().toUpperCase();
  return leaf === "GD" || /^GD\d/.test(leaf);
}
var TYPE_ALIASES = { TP: "T" };
var canonicalizeType = (p) => TYPE_ALIASES[p] ?? p;
var IMPLIED_DIMS = {
  B: { depthIn: 24, heightIn: 34.5 },
  SB: { depthIn: 24, heightIn: 34.5 },
  DB: { depthIn: 24, heightIn: 34.5 },
  BBC: { depthIn: 24, heightIn: 34.5 },
  BLS: { depthIn: 24, heightIn: 34.5 },
  BMC: { depthIn: 24, heightIn: 34.5 },
  BSR: { depthIn: 24, heightIn: 34.5 },
  FSB: { depthIn: 24, heightIn: 34.5 },
  BEC: { depthIn: 24, heightIn: 34.5 },
  BES: { depthIn: 24, heightIn: 34.5 },
  BDC: { depthIn: 24, heightIn: 34.5 },
  BEA: { depthIn: 24, heightIn: 34.5 },
  BPP: { depthIn: 24, heightIn: 34.5 },
  CSB: { depthIn: 24, heightIn: 34.5 },
  WB: { depthIn: 24, heightIn: 34.5 },
  LAZ: { depthIn: 24, heightIn: 34.5 },
  FD: { depthIn: 24, heightIn: 34.5 },
  W: { depthIn: 12 },
  WRF: { depthIn: 12 },
  WP: { depthIn: 24 },
  GW: { depthIn: 12 },
  GD: { depthIn: 12 },
  OC: { depthIn: 24 },
  WMC: { depthIn: 12 },
  WWR: { depthIn: 12 },
  WR: { depthIn: 12 },
  WBC: { depthIn: 12 },
  WDC: { depthIn: 12 },
  WER: { depthIn: 12 },
  WEC: { depthIn: 12 },
  WES: { depthIn: 12 },
  WLS: { depthIn: 12 },
  WLC: { depthIn: 12 },
  WFD: { depthIn: 12 },
  WSF: { depthIn: 12 },
  D: { depthIn: 12 },
  "GC-W": { depthIn: 12 },
  "GD-WDC": { depthIn: 12 },
  VAL: { depthIn: 12 },
  T: { depthIn: 24 },
  PC: { depthIn: 24 },
  OVD: { depthIn: 24 },
  V: { heightIn: 34.5 },
  VDB: { heightIn: 34.5 },
  VSB: { heightIn: 34.5 },
  FA: { heightIn: 34.5 },
  SVA: { heightIn: 34.5 }
};
var TWO_DIM_PREFIXES = new Set([
  "W",
  "WRF",
  "WP",
  "GW",
  "GD",
  "OC",
  "WMC",
  "WWR",
  "WR",
  "WBC",
  "WDC",
  "WER",
  "WEC",
  "WES",
  "WLS",
  "WLC",
  "WFD",
  "WSF",
  "D",
  "GC-W",
  "GD-WDC",
  "VAL",
  "T",
  "PC",
  "OVD"
]);
var ONE_DIM_PREFIXES = new Set([
  "B",
  "SB",
  "DB",
  "BBC",
  "BLS",
  "BMC",
  "BSR",
  "FSB",
  "BEC",
  "BES",
  "BDC",
  "BEA",
  "BPP",
  "CSB",
  "WB",
  "LAZ",
  "FD"
]);
var VANITY_PREFIXES = new Set(["V", "VDB", "VSB", "FA", "SVA"]);
var DEEP_SUFFIX_PREFIXES = new Set(["W", "WRF", "WP", "GW", "GD", "OC"]);
var CATEGORICAL_CODES = {
  BCORN: { cabinetType: "BCORN", widthIn: null, heightIn: null, depthIn: 24, variant: null, side: null },
  WCORN: { cabinetType: "WCORN", widthIn: null, heightIn: null, depthIn: 12, variant: null, side: null },
  CORBEL: { cabinetType: "CORBEL", widthIn: null, heightIn: null, depthIn: null, variant: null, side: null },
  "GD-W": { cabinetType: "GD-W", widthIn: null, heightIn: null, depthIn: 12, variant: null, side: null }
};
function tokenize(code) {
  const m = code.match(/^([A-Z]+(?:-[A-Z]+)*?)(\d+)?(?:D(\d+))?([A-Z]+)?$/);
  if (!m)
    return null;
  const prefix = m[1];
  if (!prefix)
    return null;
  return {
    prefix,
    digits: m[2] ?? null,
    deepDepth: m[3] != null ? Number(m[3]) : null,
    variant: m[4] ?? null
  };
}
function parseCanonicalCode(rawCode) {
  if (!rawCode)
    return null;
  let code = rawCode.trim().toUpperCase();
  if (!code)
    return null;
  let side = null;
  const dashIdx = code.lastIndexOf("-");
  if (dashIdx >= 0) {
    const before = code.slice(0, dashIdx);
    const after = code.slice(dashIdx + 1);
    if (/^\d/.test(after) === false && after.length <= 2 && /[A-Z]+$/.test(after)) {
      if (/\d/.test(before)) {
        side = after;
        code = before;
      }
    }
  }
  const categorical = CATEGORICAL_CODES[code];
  if (categorical)
    return { ...categorical, side };
  const tokens = tokenize(code);
  if (!tokens)
    return null;
  const prefix = canonicalizeType(tokens.prefix);
  const variant = tokens.variant;
  if (tokens.digits == null) {
    const implied2 = IMPLIED_DIMS[prefix] ?? {};
    return {
      cabinetType: prefix,
      widthIn: null,
      heightIn: null,
      depthIn: tokens.deepDepth ?? implied2.depthIn ?? null,
      variant,
      side
    };
  }
  const digits = tokens.digits;
  const implied = IMPLIED_DIMS[prefix] ?? {};
  let widthIn = null;
  let heightIn = null;
  let depthIn = tokens.deepDepth ?? implied.depthIn ?? null;
  if (ONE_DIM_PREFIXES.has(prefix)) {
    widthIn = Number(digits);
    heightIn = implied.heightIn ?? null;
  } else if (VANITY_PREFIXES.has(prefix)) {
    if (digits.length >= 4) {
      widthIn = Number(digits.slice(0, 2));
      depthIn = Number(digits.slice(2, 4));
    } else {
      widthIn = Number(digits);
    }
    heightIn = implied.heightIn ?? null;
  } else {
    if (digits.length === 6 && tokens.deepDepth == null) {
      widthIn = Number(digits.slice(0, 2));
      heightIn = Number(digits.slice(2, 4));
      depthIn = Number(digits.slice(4, 6));
    } else if (digits.length >= 3) {
      widthIn = Number(digits.slice(0, -2));
      heightIn = Number(digits.slice(-2));
    } else {
      widthIn = Number(digits);
      heightIn = implied.heightIn ?? null;
    }
  }
  return {
    cabinetType: prefix,
    widthIn: Number.isFinite(widthIn) ? widthIn : null,
    heightIn: heightIn !== null && Number.isFinite(heightIn) ? heightIn : null,
    depthIn,
    variant,
    side
  };
}
function stripManufacturerPrefix(itemCode) {
  const trimmed = itemCode.trim();
  const hyphen = trimmed.indexOf("-");
  if (hyphen >= 0) {
    const after = trimmed.slice(hyphen + 1).trim();
    const before = trimmed.slice(0, hyphen);
    if (/^[A-Za-z0-9]+$/.test(before) && after.length > 0 && !CATEGORICAL_CODES[trimmed.toUpperCase()]) {
      return after;
    }
  }
  return trimmed;
}

// ../../apps/web/src/data/cabinet-panels/base.ts
var TOE_KICK_HEIGHT = 4;
var TOE_KICK_DEPTH = 3;
var REVEAL = 0.125;
var PULL_THICKNESS = 0.4;
function baseCasePanels(width, depth, caseHeight, innerWidth, innerDepth) {
  return [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "bottom",
      name: "Bottom",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "top-stretcher",
      name: "Top Stretcher",
      width: innerWidth,
      height: 4,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "back",
      name: "Back Panel",
      width: width - 2 * SIDE_THICKNESS + BACK_THICKNESS * 2,
      height: caseHeight - SIDE_THICKNESS,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "toe-kick",
      name: "Toe Kick",
      width,
      height: TOE_KICK_HEIGHT,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#8b6914"
    }
  ];
}
function baseFrontSpec(width, caseHeight, cabinetCodeOrType) {
  const hasDrawerBand = width >= 12 && !isFullDoorBase(cabinetCodeOrType);
  const drawerFrontCount = hasDrawerBand ? width >= 33 ? 2 : 1 : 0;
  const drawerFrontH = hasDrawerBand ? Math.min(6.5, Math.max(4.5, caseHeight * 0.2)) : 0;
  const drawerFrontW = drawerFrontCount === 2 ? (width - 0.25 - REVEAL) / 2 : width - 0.25;
  const faceTotalH = caseHeight - 0.25;
  const doorH = hasDrawerBand ? faceTotalH - REVEAL - drawerFrontH : faceTotalH;
  return {
    drawerFrontCount,
    drawerFrontH,
    drawerFrontW,
    doorH,
    doorCenterY: TOE_KICK_HEIGHT + 0.125 + doorH / 2,
    drawerCenterY: TOE_KICK_HEIGHT + 0.125 + doorH + REVEAL + drawerFrontH / 2,
    isDoubleDoor: width >= 24
  };
}
function addBaseFrontPanels(panels, width, front) {
  for (let i = 0;i < front.drawerFrontCount; i++) {
    const suffix = front.drawerFrontCount > 1 ? `-${i}` : "";
    panels.push({
      id: `top-drawer${suffix}`,
      name: front.drawerFrontCount > 1 ? `${i === 0 ? "Left" : "Right"} Drawer Front` : "Drawer Front",
      width: front.drawerFrontW,
      height: front.drawerFrontH,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    });
    panels.push({
      id: `top-drawer-pull${suffix}`,
      name: front.drawerFrontCount > 1 ? `${i === 0 ? "Left" : "Right"} Drawer Pull` : "Drawer Pull",
      width: Math.min(front.drawerFrontW * 0.4, 8),
      height: 0.5,
      thickness: PULL_THICKNESS,
      material: "mdf",
      color: "#3a3a3a"
    });
  }
  if (front.isDoubleDoor) {
    const doorWidth = (width - 0.25) / 2;
    panels.push({
      id: "door-left",
      name: "Left Door",
      width: doorWidth,
      height: front.doorH,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    }, {
      id: "door-right",
      name: "Right Door",
      width: doorWidth,
      height: front.doorH,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    });
    return;
  }
  panels.push({
    id: "door",
    name: "Door",
    width: width - 0.25,
    height: front.doorH,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  });
}
function baseShelf(innerWidth, innerDepth) {
  return {
    id: "shelf-1",
    name: "Adjustable Shelf",
    width: innerWidth - 0.125,
    height: innerDepth - 1,
    thickness: SHELF_THICKNESS,
    material: "plywood",
    color: "#c4a88a"
  };
}
function baseCasePlacements(panels, width, height, depth, caseHeight) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  return [
    {
      panel: panel("left-side"),
      x: SIDE_THICKNESS / 2,
      y: TOE_KICK_HEIGHT + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: TOE_KICK_HEIGHT + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("bottom"),
      x: width / 2,
      y: TOE_KICK_HEIGHT + SIDE_THICKNESS / 2,
      z: (depth - BACK_THICKNESS) / 2 + BACK_THICKNESS,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("top-stretcher"),
      x: width / 2,
      y: height - SIDE_THICKNESS / 2,
      z: depth - 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back"),
      x: width / 2,
      y: TOE_KICK_HEIGHT + (caseHeight - SIDE_THICKNESS) / 2 + SIDE_THICKNESS,
      z: BACK_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("toe-kick"),
      x: width / 2,
      y: TOE_KICK_HEIGHT / 2,
      z: depth - TOE_KICK_DEPTH,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("shelf-1"),
      x: width / 2,
      y: TOE_KICK_HEIGHT + caseHeight * 0.4,
      z: (depth - BACK_THICKNESS) / 2 + BACK_THICKNESS,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    }
  ];
}
function addBaseFrontPlacements(placements, panels, width, depth, front) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  for (let i = 0;i < front.drawerFrontCount; i++) {
    const suffix = front.drawerFrontCount > 1 ? `-${i}` : "";
    const drawerCenterX = front.drawerFrontCount === 2 ? 0.125 + front.drawerFrontW / 2 + i * (front.drawerFrontW + REVEAL) : width / 2;
    placements.push({
      panel: panel(`top-drawer${suffix}`),
      x: drawerCenterX,
      y: front.drawerCenterY,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
    placements.push({
      panel: panel(`top-drawer-pull${suffix}`),
      x: drawerCenterX,
      y: front.drawerCenterY + front.drawerFrontH * 0.22,
      z: depth + DOOR_THICKNESS + PULL_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
  }
  if (front.isDoubleDoor) {
    const doorWidth = (width - 0.25) / 2;
    placements.push({
      panel: panel("door-left"),
      x: doorWidth / 2 + 0.0625,
      y: front.doorCenterY,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }, {
      panel: panel("door-right"),
      x: width - doorWidth / 2 - 0.0625,
      y: front.doorCenterY,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
    return;
  }
  placements.push({
    panel: panel("door"),
    x: width / 2,
    y: front.doorCenterY,
    z: depth + DOOR_THICKNESS / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
}
function generateBaseCabinetPanels(width, height, depth, cabinetCodeOrType) {
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const innerDepth = depth - BACK_THICKNESS;
  const caseHeight = height - TOE_KICK_HEIGHT;
  const front = baseFrontSpec(width, caseHeight, cabinetCodeOrType);
  const panels = baseCasePanels(width, depth, caseHeight, innerWidth, innerDepth);
  addBaseFrontPanels(panels, width, front);
  panels.push(baseShelf(innerWidth, innerDepth));
  const placements = baseCasePlacements(panels, width, height, depth, caseHeight);
  addBaseFrontPlacements(placements, panels, width, depth, front);
  return { cabinetId: "base", panels, placements };
}

// ../../apps/web/src/data/cabinet-panels/corner-blind.ts
var REVEAL2 = 0.125;
function blindCornerCasePanels(width, depth, innerWidth, innerDepth, caseHeight) {
  return [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "bottom",
      name: "Bottom",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "back",
      name: "Back Panel",
      width: width - 2 * SIDE_THICKNESS + BACK_THICKNESS * 2,
      height: caseHeight - SIDE_THICKNESS,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    }
  ];
}
function blindCornerCasePlacements(panels, width, depth, caseHeight, toeKickHeight) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  return [
    {
      panel: panel("left-side"),
      x: SIDE_THICKNESS / 2,
      y: toeKickHeight + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: toeKickHeight + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("bottom"),
      x: width / 2,
      y: toeKickHeight + SIDE_THICKNESS / 2,
      z: (depth - BACK_THICKNESS) / 2 + BACK_THICKNESS,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back"),
      x: width / 2,
      y: toeKickHeight + (caseHeight - SIDE_THICKNESS) / 2 + SIDE_THICKNESS,
      z: BACK_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }
  ];
}
function addBlindCornerCap(panels, placements, width, height, depth, innerWidth, innerDepth, toeKickHeight, toeKickDepth, includeToeKick) {
  if (includeToeKick) {
    const stretcher = {
      id: "top-stretcher",
      name: "Top Stretcher",
      width: innerWidth,
      height: 4,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    };
    panels.push(stretcher);
    placements.push({
      panel: stretcher,
      x: width / 2,
      y: height - SIDE_THICKNESS / 2,
      z: depth - 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    });
    const toeKick = {
      id: "toe-kick",
      name: "Toe Kick",
      width,
      height: toeKickHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#8b6914"
    };
    panels.push(toeKick);
    placements.push({
      panel: toeKick,
      x: width / 2,
      y: toeKickHeight / 2,
      z: depth - toeKickDepth,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
    return;
  }
  const top = {
    id: "top",
    name: "Top",
    width: innerWidth,
    height: innerDepth,
    thickness: SIDE_THICKNESS,
    material: "plywood",
    color: "#c4a88a"
  };
  panels.push(top);
  placements.push({
    panel: top,
    x: width / 2,
    y: height - SIDE_THICKNESS / 2,
    z: (depth - BACK_THICKNESS) / 2 + BACK_THICKNESS,
    rotationX: 90,
    rotationY: 0,
    rotationZ: 0
  });
}
function addBlindCornerFacade(panels, placements, width, depth, caseHeight, toeKickHeight, includeToeKick) {
  const doorWidth = Math.max(3, Math.max(Math.min(18, width - 21), Math.min(12, width - 9.25))) - REVEAL2;
  const blindWidth = width - 0.25 - REVEAL2 - doorWidth;
  const faceHeight = caseHeight - 0.25;
  const drawerHeight = includeToeKick ? Math.min(6.5, Math.max(4.5, caseHeight * 0.2)) : 0;
  const doorHeight = includeToeKick ? faceHeight - REVEAL2 - drawerHeight : faceHeight;
  const doorCenterX = width - 0.125 - doorWidth / 2;
  const doorCenterY = toeKickHeight + 0.125 + doorHeight / 2;
  const pullThickness = 0.4;
  const blindPanel = {
    id: "blind-panel",
    name: "Blind Dead Panel",
    width: blindWidth,
    height: faceHeight,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  };
  panels.push(blindPanel);
  placements.push({
    panel: blindPanel,
    x: 0.125 + blindWidth / 2,
    y: toeKickHeight + 0.125 + faceHeight / 2,
    z: depth + DOOR_THICKNESS / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const door = {
    id: "door",
    name: "Door",
    width: doorWidth,
    height: doorHeight,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  };
  panels.push(door);
  placements.push({
    panel: door,
    x: doorCenterX,
    y: doorCenterY,
    z: depth + DOOR_THICKNESS / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  if (!includeToeKick)
    return;
  const drawerCenterY = toeKickHeight + 0.125 + doorHeight + REVEAL2 + drawerHeight / 2;
  const drawer = {
    id: "top-drawer",
    name: "Drawer Front",
    width: doorWidth,
    height: drawerHeight,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  };
  panels.push(drawer);
  placements.push({
    panel: drawer,
    x: doorCenterX,
    y: drawerCenterY,
    z: depth + DOOR_THICKNESS / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const pull = {
    id: "top-drawer-pull",
    name: "Drawer Pull",
    width: Math.min(doorWidth * 0.4, 8),
    height: 0.5,
    thickness: pullThickness,
    material: "mdf",
    color: "#3a3a3a"
  };
  panels.push(pull);
  placements.push({
    panel: pull,
    x: doorCenterX,
    y: drawerCenterY + drawerHeight * 0.22,
    z: depth + DOOR_THICKNESS + pullThickness / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
}
function generateBlindCornerPanels(width, height, depth, includeToeKick = true) {
  const toeKickHeight = includeToeKick ? 4 : 0;
  const toeKickDepth = 3;
  const caseHeight = height - toeKickHeight;
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const innerDepth = depth - BACK_THICKNESS;
  const panels = blindCornerCasePanels(width, depth, innerWidth, innerDepth, caseHeight);
  const placements = blindCornerCasePlacements(panels, width, depth, caseHeight, toeKickHeight);
  addBlindCornerCap(panels, placements, width, height, depth, innerWidth, innerDepth, toeKickHeight, toeKickDepth, includeToeKick);
  addBlindCornerFacade(panels, placements, width, depth, caseHeight, toeKickHeight, includeToeKick);
  return {
    cabinetId: includeToeKick ? "corner-base-blind" : "corner-wall-blind",
    panels,
    placements
  };
}

// ../../apps/web/src/data/cabinet-panels/corner-base.ts
function cornerBasePanels(width, depth, caseHeight) {
  return [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "bottom-1",
      name: "Bottom (arm 1)",
      width: width - 2 * SIDE_THICKNESS - 0.125,
      height: depth / 2 - SIDE_THICKNESS,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "bottom-2",
      name: "Bottom (arm 2)",
      width: width / 2 - SIDE_THICKNESS,
      height: depth / 2 - BACK_THICKNESS,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "back",
      name: "Back Panel (arm 2 face)",
      width: width / 2,
      height: caseHeight - SIDE_THICKNESS,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "back-side",
      name: "Back Panel (arm 1 face)",
      width: depth / 2,
      height: caseHeight - SIDE_THICKNESS,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "door",
      name: "Corner Door",
      width: Math.SQRT2 * 12,
      height: caseHeight - 0.25,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    },
    {
      id: "shelf-1",
      name: "Adjustable Shelf 1",
      width: width - 2 * SIDE_THICKNESS - 0.125,
      height: depth / 2 - SIDE_THICKNESS,
      thickness: SHELF_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "shelf-2",
      name: "Adjustable Shelf 2",
      width: width / 2 - SIDE_THICKNESS,
      height: depth / 2 - BACK_THICKNESS,
      thickness: SHELF_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    }
  ];
}
function cornerBasePlacements(panels, width, depth, caseHeight, toeKickHeight) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  return [
    {
      panel: panel("left-side"),
      x: SIDE_THICKNESS / 2,
      y: toeKickHeight + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width / 2,
      y: toeKickHeight + caseHeight / 2,
      z: SIDE_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("bottom-1"),
      x: width / 2,
      y: toeKickHeight + SIDE_THICKNESS / 2,
      z: SIDE_THICKNESS + (depth / 2 - SIDE_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("bottom-2"),
      x: SIDE_THICKNESS + (width / 2 - SIDE_THICKNESS) / 2,
      y: toeKickHeight + SIDE_THICKNESS / 2,
      z: depth / 2 + (depth / 2 - BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back"),
      x: width / 4,
      y: toeKickHeight + (caseHeight - SIDE_THICKNESS) / 2 + SIDE_THICKNESS,
      z: depth - BACK_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back-side"),
      x: width - BACK_THICKNESS / 2,
      y: toeKickHeight + (caseHeight - SIDE_THICKNESS) / 2 + SIDE_THICKNESS,
      z: depth / 4,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("door"),
      x: width * 3 / 4,
      y: toeKickHeight + (caseHeight - 0.25) / 2,
      z: depth * 3 / 4,
      rotationX: 0,
      rotationY: 45,
      rotationZ: 0
    },
    {
      panel: panel("shelf-1"),
      x: width / 2,
      y: toeKickHeight + caseHeight * 0.4,
      z: SIDE_THICKNESS + (depth / 2 - SIDE_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("shelf-2"),
      x: SIDE_THICKNESS + (width / 2 - SIDE_THICKNESS) / 2,
      y: toeKickHeight + caseHeight * 0.4,
      z: depth / 2 + (depth / 2 - BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    }
  ];
}
function addCornerToeKick(panels, placements, width, depth, toeKickHeight, toeKickDepth) {
  const toeKick = {
    id: "toe-kick",
    name: "Toe Kick",
    width: Math.SQRT2 * (width / 2 - SIDE_THICKNESS),
    height: toeKickHeight,
    thickness: SIDE_THICKNESS,
    material: "plywood",
    color: "#8b6914"
  };
  panels.push(toeKick);
  placements.push({
    panel: toeKick,
    x: width * 3 / 4 - toeKickDepth / (2 * Math.SQRT2),
    y: toeKickHeight / 2,
    z: depth * 3 / 4 - toeKickDepth / (2 * Math.SQRT2),
    rotationX: 0,
    rotationY: 45,
    rotationZ: 0
  });
}
function generateCornerBaseCabinetPanels(width, height, depth, includeToeKick = true) {
  const toeKickHeight = includeToeKick ? 4 : 0;
  const toeKickDepth = 3;
  const caseHeight = height - toeKickHeight;
  const panels = cornerBasePanels(width, depth, caseHeight);
  const placements = cornerBasePlacements(panels, width, depth, caseHeight, toeKickHeight);
  if (includeToeKick) {
    addCornerToeKick(panels, placements, width, depth, toeKickHeight, toeKickDepth);
  }
  return { cabinetId: "corner-base", panels, placements };
}

// ../../apps/web/src/data/cabinet-panels/corner-diag.ts
function diagCornerPanels(dimensions, includeToeKick) {
  const {
    backHeight,
    caseHeight,
    depth,
    diagonalLength,
    horizontalOutline,
    width
  } = dimensions;
  return [
    {
      id: "back",
      name: "Back Panel",
      width,
      height: backHeight,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "left-back",
      name: "Left Back Panel",
      width,
      height: backHeight,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height: includeToeKick ? caseHeight + dimensions.toeKickHeight : caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "front-left",
      name: "Front Left Face",
      width: depth,
      height: includeToeKick ? caseHeight + dimensions.toeKickHeight : caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "bottom-pentagon",
      name: "Bottom",
      width,
      height: width,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a",
      outline: horizontalOutline
    },
    {
      id: "top-pentagon",
      name: "Top",
      width,
      height: width,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a",
      outline: horizontalOutline
    },
    {
      id: "door",
      name: "Corner Door",
      width: diagonalLength - 2.5,
      height: caseHeight - 1,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    },
    {
      id: "stile-left",
      name: "Face Frame Stile (Left)",
      width: 1.75,
      height: caseHeight,
      thickness: DOOR_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "stile-right",
      name: "Face Frame Stile (Right)",
      width: 1.75,
      height: caseHeight,
      thickness: DOOR_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "rail-bottom",
      name: "Face Frame Rail (Bottom)",
      width: diagonalLength - 3.5,
      height: 1.75,
      thickness: DOOR_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "rail-top",
      name: "Face Frame Rail (Top)",
      width: diagonalLength - 3.5,
      height: 1.75,
      thickness: DOOR_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    }
  ];
}
function diagCornerPlacements(panels, dimensions, includeToeKick) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  const {
    backHeight,
    caseHeight,
    depth,
    diagonalMidpoint,
    outward,
    stileInset,
    stileOffset,
    toeKickHeight,
    width
  } = dimensions;
  const centerY = toeKickHeight + caseHeight / 2;
  const backY = toeKickHeight + backHeight / 2;
  return [
    {
      panel: panel("back"),
      x: width / 2,
      y: backY,
      z: BACK_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("left-back"),
      x: BACK_THICKNESS / 2,
      y: backY,
      z: width / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: includeToeKick ? (caseHeight + toeKickHeight) / 2 : centerY,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("front-left"),
      x: depth / 2,
      y: includeToeKick ? (caseHeight + toeKickHeight) / 2 : centerY,
      z: width - SIDE_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("bottom-pentagon"),
      x: width / 2,
      y: toeKickHeight + SIDE_THICKNESS / 2,
      z: width / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("top-pentagon"),
      x: width / 2,
      y: toeKickHeight + caseHeight - SIDE_THICKNESS / 2,
      z: width / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("door"),
      x: diagonalMidpoint + outward * (DOOR_THICKNESS / 2),
      y: toeKickHeight + 0.5 + (caseHeight - 1) / 2,
      z: diagonalMidpoint + outward * (DOOR_THICKNESS / 2),
      rotationX: 0,
      rotationY: 45,
      rotationZ: 0
    },
    {
      panel: panel("stile-left"),
      x: diagonalMidpoint - stileOffset - stileInset,
      y: centerY,
      z: diagonalMidpoint + stileOffset - stileInset,
      rotationX: 0,
      rotationY: 45,
      rotationZ: 0
    },
    {
      panel: panel("stile-right"),
      x: diagonalMidpoint + stileOffset - stileInset,
      y: centerY,
      z: diagonalMidpoint - stileOffset - stileInset,
      rotationX: 0,
      rotationY: 45,
      rotationZ: 0
    },
    {
      panel: panel("rail-bottom"),
      x: diagonalMidpoint - stileInset,
      y: toeKickHeight + 0.875,
      z: diagonalMidpoint - stileInset,
      rotationX: 0,
      rotationY: 45,
      rotationZ: 0
    },
    {
      panel: panel("rail-top"),
      x: diagonalMidpoint - stileInset,
      y: toeKickHeight + caseHeight - 0.875,
      z: diagonalMidpoint - stileInset,
      rotationX: 0,
      rotationY: 45,
      rotationZ: 0
    }
  ];
}
function addDiagToeKick(panels, placements, dimensions, toeKickDepth) {
  const { diagonalLength, diagonalMidpoint, outward, toeKickHeight } = dimensions;
  const toeKick = {
    id: "toe-kick",
    name: "Toe Kick",
    width: diagonalLength,
    height: toeKickHeight,
    thickness: SIDE_THICKNESS,
    material: "plywood",
    color: "#8b6914"
  };
  panels.push(toeKick);
  placements.push({
    panel: toeKick,
    x: diagonalMidpoint - outward * toeKickDepth,
    y: toeKickHeight / 2,
    z: diagonalMidpoint - outward * toeKickDepth,
    rotationX: 0,
    rotationY: 45,
    rotationZ: 0
  });
}
function orientDiagForProduct(placements, width) {
  const scale = Math.SQRT1_2;
  const center = width / 2;
  for (const placement of placements) {
    const deltaX = placement.x - center;
    const deltaZ = placement.z - center;
    placement.x = center + scale * (deltaX - deltaZ);
    placement.z = center + scale * (deltaX + deltaZ);
    placement.rotationY -= 45;
  }
}
function generateDiagCornerPanels(width, height, depth, includeToeKick = true, orientForProductView = true) {
  const effectiveDepth = Math.min(depth, width - 12);
  const toeKickHeight = includeToeKick ? 4 : 0;
  const toeKickDepth = 3;
  const caseHeight = height - toeKickHeight;
  const diagonalLength = Math.SQRT2 * (width - effectiveDepth);
  const diagonalMidpoint = (width + effectiveDepth) / 2;
  const outward = Math.SQRT1_2;
  const innerBack = -width / 2 + BACK_THICKNESS;
  const innerReturn = width / 2 - SIDE_THICKNESS;
  const diagonalReturn = effectiveDepth - SIDE_THICKNESS * Math.SQRT2 - innerReturn;
  const dimensions = {
    backHeight: caseHeight - SIDE_THICKNESS,
    caseHeight,
    depth: effectiveDepth,
    diagonalLength,
    diagonalMidpoint,
    horizontalOutline: [
      { x: innerBack, y: innerBack },
      { x: innerReturn, y: innerBack },
      { x: innerReturn, y: diagonalReturn },
      { x: diagonalReturn, y: innerReturn },
      { x: innerBack, y: innerReturn }
    ],
    outward,
    stileInset: outward * SIDE_THICKNESS / 2,
    stileOffset: outward * (diagonalLength / 2 - 0.875),
    toeKickHeight,
    width
  };
  const panels = diagCornerPanels(dimensions, includeToeKick);
  const placements = diagCornerPlacements(panels, dimensions, includeToeKick);
  if (includeToeKick)
    addDiagToeKick(panels, placements, dimensions, toeKickDepth);
  if (orientForProductView)
    orientDiagForProduct(placements, width);
  return {
    cabinetId: includeToeKick ? "corner-base-diag" : "corner-wall-diag",
    panels,
    placements
  };
}

// ../../apps/web/src/data/cabinet-panels/drawer-base.ts
var TOE_KICK_HEIGHT2 = 4;
var TOE_KICK_DEPTH2 = 3;
var REVEAL3 = 0.125;
var PULL_THICKNESS2 = 0.4;
function drawerCasePanels(width, depth, caseHeight, innerWidth, innerDepth) {
  return [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "bottom",
      name: "Bottom",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "top-stretcher",
      name: "Top Stretcher",
      width: innerWidth,
      height: 4,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "back",
      name: "Back Panel",
      width: width - 2 * SIDE_THICKNESS + BACK_THICKNESS * 2,
      height: caseHeight - SIDE_THICKNESS,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "toe-kick",
      name: "Toe Kick",
      width,
      height: TOE_KICK_HEIGHT2,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#8b6914"
    }
  ];
}
function drawerStackSpec(width, caseHeight) {
  const drawerCount = caseHeight >= 36 ? 4 : 3;
  const usableHeight = caseHeight - 0.25 - REVEAL3 * (drawerCount - 1);
  const drawerWeights = Array.from({ length: drawerCount }, (_, i) => drawerCount + 2 - i);
  const weightSum = drawerWeights.reduce((a, b) => a + b, 0);
  return {
    drawerCount,
    faceWidth: width - 0.25,
    frontHeights: drawerWeights.map((weight) => usableHeight * weight / weightSum)
  };
}
function addDrawerFrontPanels(panels, stack) {
  for (let i = 0;i < stack.drawerCount; i++) {
    panels.push({
      id: `drawer-${i}`,
      name: `Drawer Front ${stack.drawerCount - i}`,
      width: stack.faceWidth,
      height: stack.frontHeights[i],
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    });
    panels.push({
      id: `drawer-pull-${i}`,
      name: `Drawer Pull ${stack.drawerCount - i}`,
      width: Math.min(stack.faceWidth * 0.4, 8),
      height: 0.5,
      thickness: PULL_THICKNESS2,
      material: "mdf",
      color: "#3a3a3a"
    });
  }
}
function drawerCasePlacements(panels, width, height, depth, caseHeight) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  return [
    {
      panel: panel("left-side"),
      x: SIDE_THICKNESS / 2,
      y: TOE_KICK_HEIGHT2 + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: TOE_KICK_HEIGHT2 + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("bottom"),
      x: width / 2,
      y: TOE_KICK_HEIGHT2 + SIDE_THICKNESS / 2,
      z: (depth - BACK_THICKNESS) / 2 + BACK_THICKNESS,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("top-stretcher"),
      x: width / 2,
      y: height - SIDE_THICKNESS / 2,
      z: depth - 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back"),
      x: width / 2,
      y: TOE_KICK_HEIGHT2 + (caseHeight - SIDE_THICKNESS) / 2 + SIDE_THICKNESS,
      z: BACK_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("toe-kick"),
      x: width / 2,
      y: TOE_KICK_HEIGHT2 / 2,
      z: depth - TOE_KICK_DEPTH2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }
  ];
}
function addDrawerFrontPlacements(placements, panels, width, depth, stack) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  let drawerCursorY = TOE_KICK_HEIGHT2 + 0.125;
  for (let i = 0;i < stack.drawerCount; i++) {
    const frontHeight = stack.frontHeights[i];
    const faceCenterY = drawerCursorY + frontHeight / 2;
    placements.push({
      panel: panel(`drawer-${i}`),
      x: width / 2,
      y: faceCenterY,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
    placements.push({
      panel: panel(`drawer-pull-${i}`),
      x: width / 2,
      y: faceCenterY + frontHeight * 0.28,
      z: depth + DOOR_THICKNESS + PULL_THICKNESS2 / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
    drawerCursorY += frontHeight + REVEAL3;
  }
}
function generateDrawerBaseCabinetPanels(width, height, depth) {
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const innerDepth = depth - BACK_THICKNESS;
  const caseHeight = height - TOE_KICK_HEIGHT2;
  const stack = drawerStackSpec(width, caseHeight);
  const panels = drawerCasePanels(width, depth, caseHeight, innerWidth, innerDepth);
  addDrawerFrontPanels(panels, stack);
  const placements = drawerCasePlacements(panels, width, height, depth, caseHeight);
  addDrawerFrontPlacements(placements, panels, width, depth, stack);
  return { cabinetId: "base-drawer", panels, placements };
}

// ../../apps/web/src/data/cabinet-panels/filler.ts
function generateFillerPanel(width, height, _depth) {
  const stripWidth = Math.min(width > 0 ? width : 3, 6);
  const stripDepth = 0.75;
  const panel = {
    id: "filler",
    name: "Filler Strip",
    width: stripWidth,
    height,
    thickness: stripDepth,
    material: "mdf",
    color: "#e8c99b"
  };
  const placements = [
    {
      panel,
      x: stripWidth / 2,
      y: height / 2,
      z: stripDepth / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }
  ];
  return { cabinetId: "filler", panels: [panel], placements };
}

// ../../apps/web/src/data/cabinet-panels/flat-panel.ts
var PANEL_THICKNESS = 0.75;
var GLASS_THICKNESS = 0.2;
var MUNTIN_WIDTH = 0.5;
function addGlassLeafFrame(panels, placements, idPrefix, centerX, leafWidth, height, stileWidth) {
  const railWidth = leafWidth - 2 * stileWidth;
  const verticals = [
    { id: `${idPrefix}-stile-l`, x: centerX - leafWidth / 2 + stileWidth / 2 },
    { id: `${idPrefix}-stile-r`, x: centerX + leafWidth / 2 - stileWidth / 2 }
  ];
  for (const vertical of verticals) {
    const panel = {
      id: vertical.id,
      name: "Door Stile",
      width: stileWidth,
      height,
      thickness: PANEL_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    };
    panels.push(panel);
    placements.push({
      panel,
      x: vertical.x,
      y: height / 2,
      z: PANEL_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
  }
  const horizontals = [
    { id: `${idPrefix}-rail-t`, y: height - stileWidth / 2 },
    { id: `${idPrefix}-rail-b`, y: stileWidth / 2 }
  ];
  for (const horizontal of horizontals) {
    const panel = {
      id: horizontal.id,
      name: "Door Rail",
      width: railWidth,
      height: stileWidth,
      thickness: PANEL_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    };
    panels.push(panel);
    placements.push({
      panel,
      x: centerX,
      y: horizontal.y,
      z: PANEL_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
  }
  return railWidth;
}
function addGlassLeafLite(panels, placements, idPrefix, centerX, railWidth, glassHeight, height) {
  if (railWidth <= 0.5 || glassHeight <= 0.5)
    return;
  const glass = {
    id: `${idPrefix}-glass`,
    name: "Glass Lite",
    width: railWidth,
    height: glassHeight,
    thickness: GLASS_THICKNESS,
    material: "glass",
    color: "#cfe3e8"
  };
  panels.push(glass);
  placements.push({
    panel: glass,
    x: centerX,
    y: height / 2,
    z: PANEL_THICKNESS - GLASS_THICKNESS / 2 - 0.05,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const muntinZ = PANEL_THICKNESS - 0.05;
  const verticalMuntin = {
    id: `${idPrefix}-muntin-v`,
    name: "Muntin",
    width: MUNTIN_WIDTH,
    height: glassHeight,
    thickness: PANEL_THICKNESS * 0.5,
    material: "mdf",
    color: "#e8c99b"
  };
  panels.push(verticalMuntin);
  placements.push({
    panel: verticalMuntin,
    x: centerX,
    y: height / 2,
    z: muntinZ,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const horizontalMuntin = {
    id: `${idPrefix}-muntin-h`,
    name: "Muntin",
    width: railWidth,
    height: MUNTIN_WIDTH,
    thickness: PANEL_THICKNESS * 0.5,
    material: "mdf",
    color: "#e8c99b"
  };
  panels.push(horizontalMuntin);
  placements.push({
    panel: horizontalMuntin,
    x: centerX,
    y: height / 2,
    z: muntinZ,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
}
function generateGlassPanelDoor(width, height) {
  const panels = [];
  const placements = [];
  const isDoubleDoor = width >= 24;
  const leafWidth = isDoubleDoor ? (width - 0.25) / 2 : width;
  const stileWidth = Math.min(2.25, Math.max(1.25, leafWidth * 0.12));
  const leafCenters = isDoubleDoor ? [leafWidth / 2 + 0.0625, width - leafWidth / 2 - 0.0625] : [width / 2];
  leafCenters.forEach((centerX, index) => {
    const idPrefix = isDoubleDoor ? index === 0 ? "door-left" : "door-right" : "door";
    const railWidth = addGlassLeafFrame(panels, placements, idPrefix, centerX, leafWidth, height, stileWidth);
    addGlassLeafLite(panels, placements, idPrefix, centerX, railWidth, height - 2 * stileWidth, height);
  });
  return { cabinetId: "flat-panel", panels, placements };
}
function generateFlatPanelDoor(width, height, _depth, cabinetCodeOrType) {
  if (isGlassPanel(cabinetCodeOrType)) {
    return generateGlassPanelDoor(width, height);
  }
  const stileWidth = Math.min(3, Math.max(1.75, width * 0.16));
  const panels = [];
  const placements = [];
  const slab = {
    id: "panel",
    name: "Door Panel",
    width,
    height,
    thickness: PANEL_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  };
  panels.push(slab);
  placements.push({
    panel: slab,
    x: width / 2,
    y: height / 2,
    z: PANEL_THICKNESS / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const centerWidth = width - 2 * stileWidth;
  const centerHeight = height - 2 * stileWidth;
  if (centerWidth > 2 && centerHeight > 2) {
    const center = {
      id: "panel-center",
      name: "Panel Center",
      width: centerWidth,
      height: centerHeight,
      thickness: 0.4,
      material: "mdf",
      color: "#e8c99b"
    };
    panels.push(center);
    placements.push({
      panel: center,
      x: width / 2,
      y: height / 2,
      z: PANEL_THICKNESS,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
  }
  return { cabinetId: "flat-panel", panels, placements };
}

// ../../apps/web/src/data/cabinet-panels/wall.ts
function wallCasePanels(width, height, depth, innerWidth, innerDepth, innerHeight) {
  return [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "top",
      name: "Top",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "bottom",
      name: "Bottom",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "back",
      name: "Back Panel",
      width,
      height: innerHeight,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "shelf-1",
      name: "Shelf 1",
      width: innerWidth - 0.125,
      height: innerDepth - 0.5,
      thickness: SHELF_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "shelf-2",
      name: "Shelf 2",
      width: innerWidth - 0.125,
      height: innerDepth - 0.5,
      thickness: SHELF_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    }
  ];
}
function addWallDoorPanels(panels, width, height) {
  if (width >= 24) {
    const doorWidth = (width - 0.25) / 2;
    panels.push({
      id: "door-left",
      name: "Left Door",
      width: doorWidth,
      height: height - 0.25,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    }, {
      id: "door-right",
      name: "Right Door",
      width: doorWidth,
      height: height - 0.25,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    });
    return;
  }
  panels.push({
    id: "door",
    name: "Door",
    width: width - 0.25,
    height: height - 0.25,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  });
}
function wallCasePlacements(panels, width, height, depth) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  return [
    {
      panel: panel("left-side"),
      x: SIDE_THICKNESS / 2,
      y: height / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: height / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("top"),
      x: width / 2,
      y: height - SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("bottom"),
      x: width / 2,
      y: SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back"),
      x: width / 2,
      y: height / 2,
      z: BACK_THICKNESS / 2 + 0.1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("shelf-1"),
      x: width / 2,
      y: height * 0.33,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("shelf-2"),
      x: width / 2,
      y: height * 0.66,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    }
  ];
}
function addWallDoorPlacements(placements, panels, width, height, depth) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  if (width >= 24) {
    const doorWidth = (width - 0.25) / 2;
    placements.push({
      panel: panel("door-left"),
      x: doorWidth / 2 + 0.0625,
      y: height / 2,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }, {
      panel: panel("door-right"),
      x: width - doorWidth / 2 - 0.0625,
      y: height / 2,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
    return;
  }
  placements.push({
    panel: panel("door"),
    x: width / 2,
    y: height / 2,
    z: depth + DOOR_THICKNESS / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
}
function generateWallCabinetPanels(width, height, depth) {
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const innerDepth = depth - BACK_THICKNESS;
  const panels = wallCasePanels(width, height, depth, innerWidth, innerDepth, height - 2 * SIDE_THICKNESS);
  addWallDoorPanels(panels, width, height);
  const placements = wallCasePlacements(panels, width, height, depth);
  addWallDoorPlacements(placements, panels, width, height, depth);
  return { cabinetId: "wall", panels, placements };
}

// ../../apps/web/src/data/cabinet-panels/glass-wall.ts
var STILE_WIDTH = 2;
var GLASS_THICKNESS2 = 0.2;
var MUNTIN_WIDTH2 = 0.6;
function addGlassDoorFrame(panels, placements, idPrefix, centerX, dimensions) {
  const { bottomY, faceWidth, frameZ, height, railWidth, topY } = dimensions;
  const verticals = [
    { id: `${idPrefix}-stile-l`, x: centerX - faceWidth / 2 + STILE_WIDTH / 2 },
    { id: `${idPrefix}-stile-r`, x: centerX + faceWidth / 2 - STILE_WIDTH / 2 }
  ];
  for (const vertical of verticals) {
    const panel = {
      id: vertical.id,
      name: "Door Stile",
      width: STILE_WIDTH,
      height,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    };
    panels.push(panel);
    placements.push({
      panel,
      x: vertical.x,
      y: (topY + bottomY) / 2,
      z: frameZ,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
  }
  const horizontals = [
    { id: `${idPrefix}-rail-t`, y: topY - STILE_WIDTH / 2 },
    { id: `${idPrefix}-rail-b`, y: bottomY + STILE_WIDTH / 2 }
  ];
  for (const horizontal of horizontals) {
    const panel = {
      id: horizontal.id,
      name: "Door Rail",
      width: railWidth,
      height: STILE_WIDTH,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    };
    panels.push(panel);
    placements.push({
      panel,
      x: centerX,
      y: horizontal.y,
      z: frameZ,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
  }
}
function addGlassDoorLite(panels, placements, idPrefix, centerX, depth, dimensions) {
  const { centerY, height, railWidth } = dimensions;
  const glassHeight = height - 2 * STILE_WIDTH;
  const glass = {
    id: `${idPrefix}-glass`,
    name: "Glass Lite",
    width: railWidth,
    height: glassHeight,
    thickness: GLASS_THICKNESS2,
    material: "glass",
    color: "#cfe3e8"
  };
  panels.push(glass);
  placements.push({
    panel: glass,
    x: centerX,
    y: centerY,
    z: depth + GLASS_THICKNESS2 / 2 + 0.05,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const muntinZ = depth + GLASS_THICKNESS2 + 0.06;
  const verticalMuntin = {
    id: `${idPrefix}-muntin-v`,
    name: "Muntin",
    width: MUNTIN_WIDTH2,
    height: glassHeight,
    thickness: DOOR_THICKNESS * 0.5,
    material: "mdf",
    color: "#e8c99b"
  };
  panels.push(verticalMuntin);
  placements.push({
    panel: verticalMuntin,
    x: centerX,
    y: centerY,
    z: muntinZ,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const horizontalMuntin = {
    id: `${idPrefix}-muntin-h`,
    name: "Muntin",
    width: railWidth,
    height: MUNTIN_WIDTH2,
    thickness: DOOR_THICKNESS * 0.5,
    material: "mdf",
    color: "#e8c99b"
  };
  panels.push(horizontalMuntin);
  placements.push({
    panel: horizontalMuntin,
    x: centerX,
    y: centerY,
    z: muntinZ,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
}
function addGlassDoor(panels, placements, idPrefix, faceWidth, centerX, height, depth) {
  const topY = height - 0.125;
  const bottomY = 0.125;
  const dimensions = {
    bottomY,
    centerY: (topY + bottomY) / 2,
    faceWidth,
    frameZ: depth + DOOR_THICKNESS / 2,
    height: topY - bottomY,
    railWidth: faceWidth - 2 * STILE_WIDTH,
    topY
  };
  addGlassDoorFrame(panels, placements, idPrefix, centerX, dimensions);
  addGlassDoorLite(panels, placements, idPrefix, centerX, depth, dimensions);
}
function generateGlassWallCabinetPanels(width, height, depth) {
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const panels = wallCasePanels(width, height, depth, innerWidth, depth - BACK_THICKNESS, height - 2 * SIDE_THICKNESS);
  const placements = wallCasePlacements(panels, width, height, depth);
  if (width >= 24) {
    const doorWidth = (width - 0.25) / 2;
    addGlassDoor(panels, placements, "door-left", doorWidth, doorWidth / 2 + 0.0625, height, depth);
    addGlassDoor(panels, placements, "door-right", doorWidth, width - doorWidth / 2 - 0.0625, height, depth);
  } else {
    addGlassDoor(panels, placements, "door", width - 0.25, width / 2, height, depth);
  }
  return { cabinetId: "wall-glass", panels, placements };
}

// ../../apps/web/src/data/cabinet-panels/microwave-wall.ts
function microwaveWallCasePanels(width, height, depth, innerWidth, innerDepth, innerHeight) {
  return [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "top",
      name: "Top",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "bottom",
      name: "Bottom",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "divider",
      name: "Divider Shelf",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "back",
      name: "Back Panel",
      width,
      height: innerHeight,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    }
  ];
}
function microwaveWallCasePlacements(panels, width, height, depth, dividerY) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  return [
    {
      panel: panel("left-side"),
      x: SIDE_THICKNESS / 2,
      y: height / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: height / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("top"),
      x: width / 2,
      y: height - SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("bottom"),
      x: width / 2,
      y: SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("divider"),
      x: width / 2,
      y: dividerY + SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back"),
      x: width / 2,
      y: height / 2,
      z: BACK_THICKNESS / 2 + 0.1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }
  ];
}
function addMicrowaveUpperDoors(panels, placements, width, depth, upperBottom, upperHeight) {
  const doorHeight = upperHeight - 0.25;
  if (width < 24) {
    const door = {
      id: "upper-door",
      name: "Upper Door",
      width: width - 0.25,
      height: doorHeight,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    };
    panels.push(door);
    placements.push({
      panel: door,
      x: width / 2,
      y: upperBottom + doorHeight / 2,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
    return;
  }
  const doorWidth = (width - 0.25) / 2;
  const doors = [
    ["l", doorWidth / 2 + 0.0625],
    ["r", width - doorWidth / 2 - 0.0625]
  ];
  for (const [side, x] of doors) {
    const door = {
      id: `upper-door-${side}`,
      name: "Upper Door",
      width: doorWidth,
      height: doorHeight,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    };
    panels.push(door);
    placements.push({
      panel: door,
      x,
      y: upperBottom + doorHeight / 2,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
  }
}
function addMicrowaveUnit(panels, placements, width, depth, innerWidth, bayHeight) {
  const microwaveWidth = innerWidth - 1;
  const microwaveHeight = bayHeight - 1.5;
  const bodyDepth = Math.max(8, depth * 0.7);
  const centerY = SIDE_THICKNESS + 0.75 + microwaveHeight / 2;
  const bodyFrontZ = depth - 0.4;
  const body = {
    id: "mw-body",
    name: "Microwave Body",
    width: microwaveWidth,
    height: microwaveHeight,
    thickness: bodyDepth,
    material: "appliance",
    color: APPLIANCE_STEEL
  };
  panels.push(body);
  placements.push({
    panel: body,
    x: width / 2,
    y: centerY,
    z: bodyFrontZ - bodyDepth / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const windowWidth = microwaveWidth * 0.6;
  const controlWidth = microwaveWidth * 0.3;
  const faceZ = bodyFrontZ + 0.05;
  const window = {
    id: "mw-window",
    name: "Microwave Window",
    width: windowWidth,
    height: microwaveHeight * 0.82,
    thickness: 0.25,
    material: "glass",
    color: APPLIANCE_GLASS
  };
  panels.push(window);
  placements.push({
    panel: window,
    x: SIDE_THICKNESS + 0.5 + windowWidth / 2,
    y: centerY,
    z: faceZ,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const control = {
    id: "mw-control",
    name: "Microwave Controls",
    width: controlWidth,
    height: microwaveHeight * 0.82,
    thickness: 0.3,
    material: "appliance",
    color: APPLIANCE_DARK
  };
  panels.push(control);
  placements.push({
    panel: control,
    x: width - SIDE_THICKNESS - 0.5 - controlWidth / 2,
    y: centerY,
    z: faceZ,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const handle = {
    id: "mw-handle",
    name: "Microwave Handle",
    width: 0.5,
    height: microwaveHeight * 0.7,
    thickness: 0.6,
    material: "appliance",
    color: APPLIANCE_DARK
  };
  panels.push(handle);
  placements.push({
    panel: handle,
    x: SIDE_THICKNESS + 0.5 + windowWidth + 0.4,
    y: centerY,
    z: faceZ + 0.3,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
}
function generateMicrowaveWallPanels(width, height, depth) {
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const innerDepth = depth - BACK_THICKNESS;
  const innerHeight = height - 2 * SIDE_THICKNESS;
  const bayHeight = Math.min(16, height * 0.55);
  const upperBottom = bayHeight + SIDE_THICKNESS;
  const upperHeight = height - upperBottom - SIDE_THICKNESS;
  const panels = microwaveWallCasePanels(width, height, depth, innerWidth, innerDepth, innerHeight);
  const placements = microwaveWallCasePlacements(panels, width, height, depth, bayHeight);
  addMicrowaveUpperDoors(panels, placements, width, depth, upperBottom, upperHeight);
  addMicrowaveUnit(panels, placements, width, depth, innerWidth, bayHeight);
  return { cabinetId: "wall-microwave", panels, placements };
}

// ../../apps/web/src/data/cabinet-panels/open-wall.ts
function generateOpenWallCabinetPanels(width, height, depth) {
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const innerDepth = depth - BACK_THICKNESS;
  const innerHeight = height - 2 * SIDE_THICKNESS;
  const panels = [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "top",
      name: "Top",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "bottom",
      name: "Bottom",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "back",
      name: "Back Panel",
      width,
      height: innerHeight,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    }
  ];
  const shelfYs = [0.28, 0.5, 0.72];
  shelfYs.forEach((_, i) => {
    panels.push({
      id: `shelf-${i + 1}`,
      name: `Shelf ${i + 1}`,
      width: innerWidth - 0.125,
      height: innerDepth - 0.5,
      thickness: SHELF_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    });
  });
  const placements = [
    {
      panel: panels.find((p) => p.id === "left-side"),
      x: SIDE_THICKNESS / 2,
      y: height / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panels.find((p) => p.id === "right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: height / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panels.find((p) => p.id === "top"),
      x: width / 2,
      y: height - SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panels.find((p) => p.id === "bottom"),
      x: width / 2,
      y: SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panels.find((p) => p.id === "back"),
      x: width / 2,
      y: height / 2,
      z: BACK_THICKNESS / 2 + 0.1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }
  ];
  shelfYs.forEach((pos, i) => {
    placements.push({
      panel: panels.find((p) => p.id === `shelf-${i + 1}`),
      x: width / 2,
      y: height * pos,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    });
  });
  return { cabinetId: "wall-open", panels, placements };
}

// ../../apps/web/src/data/cabinet-panels/oven-shared.ts
function ovenCasePanels(width, height, depth, spec) {
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const innerDepth = depth - BACK_THICKNESS;
  return [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "top",
      name: "Top",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "bottom",
      name: "Bottom",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: spec.lowerShelfId,
      name: "Shelf",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#b8956d"
    },
    {
      id: spec.upperShelfId,
      name: "Shelf",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#b8956d"
    },
    {
      id: "back-lower",
      name: "Back Lower",
      width,
      height: spec.backLowerHeight,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "back-upper",
      name: "Back Upper",
      width,
      height: spec.backUpperHeight,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    }
  ];
}
function ovenCasePlacements(panels, width, height, depth, spec) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  return [
    {
      panel: panel("left-side"),
      x: SIDE_THICKNESS / 2,
      y: height / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: height / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("top"),
      x: width / 2,
      y: height - SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("bottom"),
      x: width / 2,
      y: SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel(spec.lowerShelfId),
      x: width / 2,
      y: spec.lowerShelfY,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel(spec.upperShelfId),
      x: width / 2,
      y: spec.upperShelfY,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back-lower"),
      x: width / 2,
      y: spec.backLowerY,
      z: BACK_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back-upper"),
      x: width / 2,
      y: spec.backUpperY,
      z: BACK_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }
  ];
}
function addUpperOvenDoors(panels, placements, width, depth, upperBottom, upperHeight) {
  if (width < 24) {
    const door = {
      id: "upper-door",
      name: "Upper Door",
      width: width - 0.25,
      height: upperHeight,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    };
    panels.push(door);
    placements.push({
      panel: door,
      x: width / 2,
      y: upperBottom + SIDE_THICKNESS + upperHeight / 2,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
    return;
  }
  const doorWidth = (width - 0.25) / 2;
  const doors = [
    ["l", doorWidth / 2 + 0.0625],
    ["r", width - doorWidth / 2 - 0.0625]
  ];
  for (const [side, x] of doors) {
    const door = {
      id: `upper-door-${side}`,
      name: "Upper Door",
      width: doorWidth,
      height: upperHeight,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    };
    panels.push(door);
    placements.push({
      panel: door,
      x,
      y: upperBottom + SIDE_THICKNESS + upperHeight / 2,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
  }
}
function addOvenUnit(panels, placements, width, depth, ovenWidth, ovenHeight, centerY, idSuffix = "") {
  const bodyDepth = Math.max(10, depth * 0.7);
  const frontZ = depth - 0.4;
  const faceZ = frontZ + 0.05;
  const body = {
    id: `oven-body${idSuffix}`,
    name: "Oven Body",
    width: ovenWidth,
    height: ovenHeight,
    thickness: bodyDepth,
    material: "appliance",
    color: APPLIANCE_STEEL
  };
  panels.push(body);
  placements.push({
    panel: body,
    x: width / 2,
    y: centerY,
    z: frontZ - bodyDepth / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const control = {
    id: `oven-control${idSuffix}`,
    name: "Oven Controls",
    width: ovenWidth,
    height: ovenHeight * 0.16,
    thickness: 0.3,
    material: "appliance",
    color: APPLIANCE_DARK
  };
  panels.push(control);
  placements.push({
    panel: control,
    x: width / 2,
    y: centerY + ovenHeight * 0.42,
    z: faceZ,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const window = {
    id: `oven-window${idSuffix}`,
    name: "Oven Window",
    width: ovenWidth * 0.86,
    height: ovenHeight * 0.58,
    thickness: 0.25,
    material: "glass",
    color: APPLIANCE_GLASS
  };
  panels.push(window);
  placements.push({
    panel: window,
    x: width / 2,
    y: centerY - ovenHeight * 0.05,
    z: faceZ,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const handle = {
    id: `oven-handle${idSuffix}`,
    name: "Oven Handle",
    width: ovenWidth * 0.9,
    height: 0.6,
    thickness: 0.8,
    material: "appliance",
    color: APPLIANCE_DARK
  };
  panels.push(handle);
  placements.push({
    panel: handle,
    x: width / 2,
    y: centerY + ovenHeight * 0.3,
    z: faceZ + 0.4,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
}

// ../../apps/web/src/data/cabinet-panels/oven-tall-double.ts
function addDoubleOvenDrawer(panels, placements, width, depth, drawerTop) {
  const drawerHeight = drawerTop - SIDE_THICKNESS - 0.25;
  const drawer = {
    id: "drawer-0",
    name: "Drawer Front",
    width: width - 0.25,
    height: drawerHeight,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  };
  panels.push(drawer);
  placements.push({
    panel: drawer,
    x: width / 2,
    y: SIDE_THICKNESS + 0.125 + drawerHeight / 2,
    z: depth + DOOR_THICKNESS / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
  const pull = {
    id: "drawer-pull-0",
    name: "Drawer Pull",
    width: Math.min(width * 0.4, 8),
    height: 0.5,
    thickness: 0.4,
    material: "mdf",
    color: "#3a3a3a"
  };
  panels.push(pull);
  placements.push({
    panel: pull,
    x: width / 2,
    y: SIDE_THICKNESS + 0.125 + drawerHeight * 0.78,
    z: depth + DOOR_THICKNESS + 0.2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
}
function generateOvenTallDoublePanels(width, height, depth) {
  if (height < 40)
    return generateWallCabinetPanels(width, height, depth);
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const drawerBandHeight = Math.min(12, height * 0.14);
  const drawerTop = SIDE_THICKNESS + drawerBandHeight + 0.25;
  const ovenStackHeight = Math.min(height * 0.58, 54);
  const ovenStackBottom = drawerTop;
  const ovenStackTop = ovenStackBottom + ovenStackHeight;
  const eachOvenHeight = ovenStackHeight / 2;
  const spec = {
    backLowerHeight: drawerTop,
    backLowerY: drawerTop / 2,
    backUpperHeight: height - drawerTop,
    backUpperY: (height + drawerTop) / 2,
    lowerShelfId: "shelf-above-drawer",
    lowerShelfY: drawerTop - SIDE_THICKNESS / 2,
    upperShelfId: "shelf-above-ovens",
    upperShelfY: ovenStackTop + SIDE_THICKNESS / 2
  };
  const panels = ovenCasePanels(width, height, depth, spec);
  const placements = ovenCasePlacements(panels, width, height, depth, spec);
  addDoubleOvenDrawer(panels, placements, width, depth, drawerTop);
  const upperHeight = height - ovenStackTop - SIDE_THICKNESS - 0.25;
  addUpperOvenDoors(panels, placements, width, depth, ovenStackTop, upperHeight);
  for (let index = 0;index < 2; index++) {
    addOvenUnit(panels, placements, width, depth, innerWidth - 1, eachOvenHeight - 1, ovenStackBottom + (index + 0.5) * eachOvenHeight, `-${index}`);
  }
  return { cabinetId: "oven-tall-d", panels, placements };
}

// ../../apps/web/src/data/cabinet-panels/oven-tall.ts
function addSingleOvenDrawers(panels, placements, width, depth, drawerTop) {
  const reveal = 0.125;
  const drawerCount = 3;
  const stackHeight = drawerTop - SIDE_THICKNESS - 0.25;
  const usableHeight = stackHeight - reveal * (drawerCount - 1);
  const weights = Array.from({ length: drawerCount }, (_, index) => drawerCount + 2 - index);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const frontHeights = weights.map((weight) => usableHeight * weight / weightSum);
  const pullThickness = 0.4;
  let cursorY = SIDE_THICKNESS + 0.125;
  for (let index = 0;index < drawerCount; index++) {
    const frontHeight = frontHeights[index];
    const centerY = cursorY + frontHeight / 2;
    const drawer = {
      id: `drawer-${index}`,
      name: `Drawer Front ${drawerCount - index}`,
      width: width - 0.25,
      height: frontHeight,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    };
    panels.push(drawer);
    placements.push({
      panel: drawer,
      x: width / 2,
      y: centerY,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
    const pull = {
      id: `drawer-pull-${index}`,
      name: `Drawer Pull ${drawerCount - index}`,
      width: Math.min(width * 0.4, 8),
      height: 0.5,
      thickness: pullThickness,
      material: "mdf",
      color: "#3a3a3a"
    };
    panels.push(pull);
    placements.push({
      panel: pull,
      x: width / 2,
      y: centerY + frontHeight * 0.28,
      z: depth + DOOR_THICKNESS + pullThickness / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
    cursorY += frontHeight + reveal;
  }
}
function generateOvenTallPanels(width, height, depth) {
  if (height < 40)
    return generateWallCabinetPanels(width, height, depth);
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const ovenBandHeight = Math.min(30, height * 0.4);
  const ovenBottom = Math.min(height * 0.32, 28);
  const ovenTop = ovenBottom + ovenBandHeight;
  const spec = {
    backLowerHeight: ovenBottom,
    backLowerY: ovenBottom / 2,
    backUpperHeight: height - ovenTop,
    backUpperY: (height + ovenTop) / 2,
    lowerShelfId: "shelf-below-oven",
    lowerShelfY: ovenBottom - SIDE_THICKNESS / 2,
    upperShelfId: "shelf-above-oven",
    upperShelfY: ovenTop + SIDE_THICKNESS / 2
  };
  const panels = ovenCasePanels(width, height, depth, spec);
  const placements = ovenCasePlacements(panels, width, height, depth, spec);
  addSingleOvenDrawers(panels, placements, width, depth, ovenBottom);
  const upperHeight = height - ovenTop - SIDE_THICKNESS - 0.25;
  addUpperOvenDoors(panels, placements, width, depth, ovenTop, upperHeight);
  addOvenUnit(panels, placements, width, depth, innerWidth - 1, ovenBandHeight - 1, ovenBottom + ovenBandHeight / 2);
  return { cabinetId: "oven-tall", panels, placements };
}

// ../../apps/web/src/data/cabinet-panels/sink-base.ts
var TOE_KICK_HEIGHT3 = 4;
var TOE_KICK_DEPTH3 = 3;
var REVEAL4 = 0.125;
function sinkCasePanels(width, depth, caseHeight, innerWidth, innerDepth) {
  return [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "bottom",
      name: "Bottom",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "back",
      name: "Back Panel",
      width: width - 2 * SIDE_THICKNESS + BACK_THICKNESS * 2,
      height: caseHeight - SIDE_THICKNESS,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "toe-kick",
      name: "Toe Kick",
      width,
      height: TOE_KICK_HEIGHT3,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#8b6914"
    }
  ];
}
function sinkFrontSpec(width, caseHeight) {
  const tiltFrontH = Math.min(4.5, Math.max(3, caseHeight * 0.13));
  const doorH = caseHeight - 0.25 - REVEAL4 - tiltFrontH;
  return {
    tiltFrontH,
    tiltFrontCenterY: TOE_KICK_HEIGHT3 + 0.125 + doorH + REVEAL4 + tiltFrontH / 2,
    doorH,
    doorWidth: (width - 0.25) / 2,
    doorCenterY: TOE_KICK_HEIGHT3 + 0.125 + doorH / 2
  };
}
function addSinkFrontPanels(panels, width, front) {
  panels.push({
    id: "tilt-front",
    name: "Tilt-Out False Front",
    width: width - 0.25,
    height: front.tiltFrontH,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  });
  panels.push({
    id: "door-left",
    name: "Left Door",
    width: front.doorWidth,
    height: front.doorH,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  }, {
    id: "door-right",
    name: "Right Door",
    width: front.doorWidth,
    height: front.doorH,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  });
}
function sinkPlacements(panels, width, depth, caseHeight, front) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  return [
    {
      panel: panel("left-side"),
      x: SIDE_THICKNESS / 2,
      y: TOE_KICK_HEIGHT3 + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: TOE_KICK_HEIGHT3 + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("bottom"),
      x: width / 2,
      y: TOE_KICK_HEIGHT3 + SIDE_THICKNESS / 2,
      z: (depth - BACK_THICKNESS) / 2 + BACK_THICKNESS,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back"),
      x: width / 2,
      y: TOE_KICK_HEIGHT3 + (caseHeight - SIDE_THICKNESS) / 2 + SIDE_THICKNESS,
      z: BACK_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("toe-kick"),
      x: width / 2,
      y: TOE_KICK_HEIGHT3 / 2,
      z: depth - TOE_KICK_DEPTH3,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("tilt-front"),
      x: width / 2,
      y: front.tiltFrontCenterY,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("door-left"),
      x: front.doorWidth / 2 + 0.0625,
      y: front.doorCenterY,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("door-right"),
      x: width - front.doorWidth / 2 - 0.0625,
      y: front.doorCenterY,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }
  ];
}
function generateSinkBaseCabinetPanels(width, height, depth) {
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const innerDepth = depth - BACK_THICKNESS;
  const caseHeight = height - TOE_KICK_HEIGHT3;
  const front = sinkFrontSpec(width, caseHeight);
  const panels = sinkCasePanels(width, depth, caseHeight, innerWidth, innerDepth);
  addSinkFrontPanels(panels, width, front);
  return {
    cabinetId: "sink-base",
    panels,
    placements: sinkPlacements(panels, width, depth, caseHeight, front)
  };
}

// ../../apps/web/src/data/cabinet-panels/tall.ts
function tallCasePanels(width, depth, innerWidth, innerDepth, caseHeight, toeKickHeight) {
  const panels = [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height: caseHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "top",
      name: "Top",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "bottom",
      name: "Bottom",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "fixed-shelf",
      name: "Fixed Shelf",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#b8956d"
    },
    {
      id: "back-upper",
      name: "Back Panel Upper",
      width,
      height: caseHeight / 2 - SIDE_THICKNESS,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "back-lower",
      name: "Back Panel Lower",
      width,
      height: caseHeight / 2 - SIDE_THICKNESS,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    },
    {
      id: "toe-kick",
      name: "Toe Kick",
      width,
      height: toeKickHeight,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#8b6914"
    }
  ];
  for (let index = 1;index <= 4; index++) {
    panels.push({
      id: `shelf-${index}`,
      name: `Adjustable Shelf ${index}`,
      width: innerWidth - 0.125,
      height: innerDepth - 0.5,
      thickness: SHELF_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    });
  }
  return panels;
}
function addTallDoorPanels(panels, width, caseHeight) {
  const doorHeight = caseHeight - 0.25;
  if (width < 24) {
    panels.push({
      id: "door",
      name: "Door",
      width: width - 0.25,
      height: doorHeight,
      thickness: DOOR_THICKNESS,
      material: "mdf",
      color: "#e8c99b"
    });
    return;
  }
  const doorWidth = (width - 0.25) / 2;
  panels.push({
    id: "door-left",
    name: "Left Door",
    width: doorWidth,
    height: doorHeight,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  }, {
    id: "door-right",
    name: "Right Door",
    width: doorWidth,
    height: doorHeight,
    thickness: DOOR_THICKNESS,
    material: "mdf",
    color: "#e8c99b"
  });
}
function tallCasePlacements(panels, width, depth, caseHeight, toeKickHeight, toeKickDepth) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  return [
    {
      panel: panel("left-side"),
      x: SIDE_THICKNESS / 2,
      y: toeKickHeight + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: toeKickHeight + caseHeight / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("top"),
      x: width / 2,
      y: toeKickHeight + caseHeight - SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("bottom"),
      x: width / 2,
      y: toeKickHeight + SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("fixed-shelf"),
      x: width / 2,
      y: toeKickHeight + caseHeight / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back-upper"),
      x: width / 2,
      y: toeKickHeight + caseHeight * 0.75,
      z: BACK_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back-lower"),
      x: width / 2,
      y: toeKickHeight + caseHeight * 0.25,
      z: BACK_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("toe-kick"),
      x: width / 2,
      y: toeKickHeight / 2,
      z: depth - toeKickDepth,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }
  ];
}
function addTallShelfPlacements(panels, placements, width, depth, caseHeight, toeKickHeight) {
  [0.15, 0.35, 0.65, 0.85].forEach((position, index) => {
    placements.push({
      panel: panels.find((candidate) => candidate.id === `shelf-${index + 1}`),
      x: width / 2,
      y: toeKickHeight + caseHeight * position,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    });
  });
}
function addTallDoorPlacements(panels, placements, width, depth, caseHeight, toeKickHeight) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  const centerY = toeKickHeight + caseHeight / 2;
  if (width < 24) {
    placements.push({
      panel: panel("door"),
      x: width / 2,
      y: centerY,
      z: depth + DOOR_THICKNESS / 2,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
    return;
  }
  const doorWidth = (width - 0.25) / 2;
  placements.push({
    panel: panel("door-left"),
    x: doorWidth / 2 + 0.0625,
    y: centerY,
    z: depth + DOOR_THICKNESS / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  }, {
    panel: panel("door-right"),
    x: width - doorWidth / 2 - 0.0625,
    y: centerY,
    z: depth + DOOR_THICKNESS / 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  });
}
function generateTallCabinetPanels(width, height, depth) {
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const innerDepth = depth - BACK_THICKNESS;
  const toeKickHeight = 4;
  const toeKickDepth = 3;
  const caseHeight = height - toeKickHeight;
  const panels = tallCasePanels(width, depth, innerWidth, innerDepth, caseHeight, toeKickHeight);
  addTallDoorPanels(panels, width, caseHeight);
  const placements = tallCasePlacements(panels, width, depth, caseHeight, toeKickHeight, toeKickDepth);
  addTallShelfPlacements(panels, placements, width, depth, caseHeight, toeKickHeight);
  addTallDoorPlacements(panels, placements, width, depth, caseHeight, toeKickHeight);
  return { cabinetId: "tall", panels, placements };
}

// ../../apps/web/src/data/cabinet-panels/wine-rack.ts
function wineRackCasePanels(width, height, depth, innerWidth, innerDepth, innerHeight) {
  return [
    {
      id: "left-side",
      name: "Left Side",
      width: depth,
      height,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "right-side",
      name: "Right Side",
      width: depth,
      height,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c9985a"
    },
    {
      id: "top",
      name: "Top",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "bottom",
      name: "Bottom",
      width: innerWidth,
      height: innerDepth,
      thickness: SIDE_THICKNESS,
      material: "plywood",
      color: "#c4a88a"
    },
    {
      id: "back",
      name: "Back Panel",
      width,
      height: innerHeight,
      thickness: BACK_THICKNESS,
      material: "back_panel",
      color: "#e8d4b8"
    }
  ];
}
function wineRackCasePlacements(panels, width, height, depth) {
  const panel = (id) => panels.find((candidate) => candidate.id === id);
  return [
    {
      panel: panel("left-side"),
      x: SIDE_THICKNESS / 2,
      y: height / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("right-side"),
      x: width - SIDE_THICKNESS / 2,
      y: height / 2,
      z: depth / 2,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0
    },
    {
      panel: panel("top"),
      x: width / 2,
      y: height - SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("bottom"),
      x: width / 2,
      y: SIDE_THICKNESS / 2,
      z: (depth + BACK_THICKNESS) / 2,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0
    },
    {
      panel: panel("back"),
      x: width / 2,
      y: height / 2,
      z: BACK_THICKNESS / 2 + 0.1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    }
  ];
}
function addWineLattice(panels, placements, depth, innerWidth, innerHeight) {
  const cols = Math.max(3, Math.round(innerWidth / 7.5));
  const rows = Math.max(1, Math.round(innerHeight / 7.5));
  const cellW = innerWidth / cols;
  const cellH = innerHeight / rows;
  const armLen = Math.hypot(cellW, cellH);
  const armAngle = Math.atan2(cellH, cellW) * 180 / Math.PI;
  let slatIndex = 0;
  for (let row = 0;row < rows; row++) {
    for (let column = 0;column < cols; column++) {
      const x = SIDE_THICKNESS + (column + 0.5) * cellW;
      const y = SIDE_THICKNESS + (row + 0.5) * cellH;
      for (const direction of [1, -1]) {
        const slat = {
          id: `lattice-${slatIndex++}`,
          name: "Lattice Slat",
          width: armLen,
          height: 0.5,
          thickness: 0.75,
          material: "mdf",
          color: "#e8c99b"
        };
        panels.push(slat);
        placements.push({
          panel: slat,
          x,
          y,
          z: depth - 0.7,
          rotationX: 0,
          rotationY: 0,
          rotationZ: direction * armAngle
        });
      }
    }
  }
}
function generateWineRackPanels(width, height, depth) {
  const innerWidth = width - 2 * SIDE_THICKNESS;
  const innerDepth = depth - BACK_THICKNESS;
  const innerHeight = height - 2 * SIDE_THICKNESS;
  const panels = wineRackCasePanels(width, height, depth, innerWidth, innerDepth, innerHeight);
  const placements = wineRackCasePlacements(panels, width, height, depth);
  addWineLattice(panels, placements, depth, innerWidth, innerHeight);
  return { cabinetId: "wine-rack", panels, placements };
}

// ../../apps/web/src/data/cabinetPanels.ts
function getCabinetConstruction(type, width, height, depth, cabinetCodeOrType) {
  switch (type) {
    case "base":
      return generateBaseCabinetPanels(width, height, depth, cabinetCodeOrType);
    case "wall":
      return generateWallCabinetPanels(width, height, depth);
    case "tall":
      return generateTallCabinetPanels(width, height, depth);
    case "sink-base":
      return generateSinkBaseCabinetPanels(width, height, depth);
    case "corner-base":
      return generateCornerBaseCabinetPanels(width, height, depth);
    case "corner-wall":
      return generateCornerBaseCabinetPanels(width, height, depth, false);
    case "corner-base-blind":
      return generateBlindCornerPanels(width, height, depth, true);
    case "corner-wall-blind":
      return generateBlindCornerPanels(width, height, depth, false);
    case "corner-base-diag":
      return generateDiagCornerPanels(width, height, depth, true);
    case "corner-wall-diag":
      return generateDiagCornerPanels(width, height, depth, false);
    case "base-drawer":
      return generateDrawerBaseCabinetPanels(width, height, depth);
    case "wall-glass":
      return generateGlassWallCabinetPanels(width, height, depth);
    case "wall-open":
      return generateOpenWallCabinetPanels(width, height, depth);
    case "filler":
      return generateFillerPanel(width, height, depth);
    case "wall-microwave":
      return generateMicrowaveWallPanels(width, height, depth);
    case "wine-rack":
      return generateWineRackPanels(width, height, depth);
    case "oven-tall":
      return generateOvenTallPanels(width, height, depth);
    case "oven-tall-d":
      return generateOvenTallDoublePanels(width, height, depth);
    case "flat-panel":
      return generateFlatPanelDoor(width, height, depth, cabinetCodeOrType);
    case "base-fulldoor":
      return generateBaseCabinetPanels(width, height, depth, "FDB");
    case "base-microwave":
      return generateBaseMicrowavePanels(width, height, depth);
  }
}

// ../../apps/web/src/lib/layout/scene-cabinet-construction.ts
function getSceneCabinetConstruction(type, width, height, depth, cabinetCodeOrType) {
  if (type !== "corner-base" && type !== "corner-wall") {
    return getCabinetConstruction(type, width, height, depth, cabinetCodeOrType);
  }
  const cabinetType = cabinetCodeOrType ? parseCanonicalCode(cabinetCodeOrType)?.cabinetType : undefined;
  const includeToeKick = type === "corner-base";
  return isBlindCorner(cabinetType ?? cabinetCodeOrType) ? generateBlindCornerPanels(width, height, depth, includeToeKick) : generateDiagCornerPanels(width, height, depth, includeToeKick, false);
}

// ../../apps/web/src/lib/layout/cabinet-resolution.ts
function cabinetSpecForCode(specId) {
  const builtIn = getCabinetById(specId);
  if (builtIn)
    return builtIn;
  const parsed = parseCanonicalCode(specId);
  if (!parsed)
    return null;
  const type = displayCabinetGeom(parsed.cabinetType, specId);
  const width = parsed.widthIn ?? (type === "corner-base" || type === "corner-wall" ? 24 : 0);
  const height = parsed.heightIn ?? (type === "wall" || type === "corner-wall" ? 30 : type === "tall" || type === "oven-tall" ? 84 : 34.5);
  const depth = parsed.depthIn ?? (type === "wall" || type === "corner-wall" ? 12 : 24);
  if (![width, height, depth].every((value) => Number.isFinite(value) && value > 0))
    return null;
  const label = cabinetTypeLabel(parsed.cabinetType);
  return {
    id: specId,
    name: `${label} ${specId}`,
    type,
    width,
    height,
    depth,
    description: `Catalog-derived ${label.toLowerCase()}`
  };
}
function resolveCabinet(id, placement) {
  const spec = cabinetSpecForCode(placement.specId);
  if (!spec) {
    console.warn(`Cabinet spec not found: ${placement.specId}`);
    return null;
  }
  const construction = getSceneCabinetConstruction(spec.type, spec.width, spec.height, spec.depth, spec.id);
  const panels = construction.placements.map((p, index) => ({
    id: `${id}-panel-${index}-${p.panel.id}`,
    name: p.panel.name,
    width: p.panel.width,
    height: p.panel.height,
    thickness: p.panel.thickness,
    material: p.panel.material,
    color: p.panel.color,
    ...p.panel.outline ? { outline: p.panel.outline } : {},
    localPosition: { x: p.x, y: p.y, z: p.z },
    localRotation: { x: p.rotationX, y: p.rotationY, z: p.rotationZ }
  }));
  return {
    id,
    spec: {
      id: spec.id,
      name: spec.name,
      type: spec.type,
      width: spec.width,
      height: spec.height,
      depth: spec.depth
    },
    position: { x: placement.x, y: placement.y, z: placement.z },
    rotation: placement.rotation,
    wall: placement.wall,
    panels
  };
}

// ../../apps/web/src/lib/layout/cabinet-selection.ts
function computeAvailableSegments(totalWidth, reservations, startOffset = 0) {
  const segments = [];
  const sorted = [...reservations].sort((a, b) => a.offset - b.offset);
  let currentStart = startOffset;
  for (const res of sorted) {
    const resStart = res.offset;
    const resEnd = res.offset + res.width;
    if (resStart > currentStart) {
      segments.push({ start: currentStart, end: resStart });
    }
    currentStart = Math.max(currentStart, resEnd);
  }
  if (currentStart < totalWidth) {
    segments.push({ start: currentStart, end: totalWidth });
  }
  return segments;
}
function fillSegmentAroundSinks(segment, sortedSinks, placeSinkCabinet, fillType, rng = Math.random, allowedSpecIds) {
  const result = [];
  let currentOffset = segment.start;
  for (const sink of sortedSinks) {
    const targetOffset = Math.max(sink.offset, segment.start);
    if (targetOffset > currentOffset) {
      for (const cab of selectCabinetsForWidth(targetOffset - currentOffset, fillType, rng, allowedSpecIds)) {
        result.push({ specId: cab.specId, width: cab.width, offset: currentOffset });
        currentOffset += cab.width;
      }
    }
    const sinkPlacement = placeSinkCabinet(sink);
    if (sinkPlacement) {
      result.push({ ...sinkPlacement, offset: currentOffset });
      currentOffset += sinkPlacement.width;
    }
  }
  if (currentOffset < segment.end) {
    for (const cab of selectCabinetsForWidth(segment.end - currentOffset, fillType, rng, allowedSpecIds)) {
      result.push({ specId: cab.specId, width: cab.width, offset: currentOffset });
      currentOffset += cab.width;
    }
  }
  return result;
}
function selectCabinetsForSegments(segments, cabinetType, sinkReservations = [], rng = Math.random, allowedSpecIds) {
  const result = [];
  const allowed = allowedSpecIds ? new Set(allowedSpecIds) : null;
  for (const segment of segments) {
    const sinksInSegment = sinkReservations.filter((r) => {
      if (r.category !== "sink" || !r.sinkCabinetId)
        return false;
      const sinkCab = getCabinetById(r.sinkCabinetId);
      const sinkWidth = sinkCab?.width ?? 30;
      return r.offset < segment.end && r.offset + sinkWidth > segment.start;
    });
    if (sinksInSegment.length > 0) {
      const sortedSinks = [...sinksInSegment].sort((a, b) => a.offset - b.offset);
      const placeSinkCabinet = (sink) => {
        if (cabinetType === "base") {
          if (!sink.sinkCabinetId)
            return null;
          if (allowed && !allowed.has(sink.sinkCabinetId))
            return null;
          const spec = getCabinetById(sink.sinkCabinetId);
          return spec ? { specId: sink.sinkCabinetId, width: spec.width } : null;
        } else {
          const sinkCab = sink.sinkCabinetId ? getCabinetById(sink.sinkCabinetId) : null;
          const sinkWidth = sinkCab?.width ?? 30;
          const overSinkId = `W${sinkWidth}18`;
          if (allowed && !allowed.has(overSinkId))
            return null;
          const spec = getCabinetById(overSinkId);
          return spec ? { specId: overSinkId, width: spec.width, overSink: true } : null;
        }
      };
      result.push(...fillSegmentAroundSinks(segment, sortedSinks, placeSinkCabinet, cabinetType, rng, allowedSpecIds));
    } else {
      const segmentWidth = segment.end - segment.start;
      const cabinets = selectCabinetsForWidth(segmentWidth, cabinetType, rng, allowedSpecIds);
      let offset = segment.start;
      for (const cab of cabinets) {
        result.push({ ...cab, offset });
        offset += cab.width;
      }
    }
  }
  return result;
}
function selectCabinetsForWidth(targetWidth, cabinetType, rng = Math.random, allowedSpecIds) {
  const cabinets = allowedSpecIds ? allowedSpecIds.map(cabinetSpecForCode).filter((cabinet) => !!cabinet && (cabinetType === "base" ? cabinet.type === "base" : cabinet.type === "wall" && cabinet.height === 30)).sort((a, b) => b.width - a.width || a.id.localeCompare(b.id)) : cabinetType === "base" ? getBaseCabinets() : getWallCabinets();
  if (allowedSpecIds) {
    const unitsPerInch = 4;
    const targetUnits = Math.round(targetWidth * unitsPerInch);
    const candidates = cabinets.map((cabinet) => ({ cabinet, units: Math.round(cabinet.width * unitsPerInch) })).filter(({ cabinet, units }) => units > 0 && Math.abs(cabinet.width * unitsPerInch - units) < 0.001 && units <= targetUnits);
    const solutions = Array(targetUnits + 1).fill(undefined);
    solutions[0] = [];
    for (let width = 1;width <= targetUnits; width++) {
      for (const { cabinet, units } of candidates) {
        const previous = solutions[width - units];
        if (!previous)
          continue;
        const next = [...previous, cabinet];
        const current = solutions[width];
        if (!current || next.length < current.length || next.length === current.length && rng() < 0.5) {
          solutions[width] = next;
        }
      }
    }
    let selected = solutions[targetUnits];
    for (let width = targetUnits - 1;!selected && width > 0; width--)
      selected = solutions[width];
    return (selected ?? []).map((cabinet) => ({ specId: cabinet.id, width: cabinet.width }));
  }
  const result = [];
  let remainingWidth = targetWidth;
  const MIN_CABINET_WIDTH = 3;
  while (remainingWidth >= MIN_CABINET_WIDTH) {
    const availableCabinets = cabinets.filter((c) => c.width <= remainingWidth);
    if (availableCabinets.length === 0)
      break;
    let selectedCabinet;
    if (remainingWidth >= 12) {
      const regularCabinets = availableCabinets.filter((c) => c.width >= 12);
      if (regularCabinets.length > 0) {
        const weights = regularCabinets.map((_, idx) => Math.pow(2, regularCabinets.length - idx));
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = rng() * totalWeight;
        selectedCabinet = regularCabinets[0];
        for (let i = 0;i < regularCabinets.length; i++) {
          random -= weights[i];
          if (random <= 0) {
            selectedCabinet = regularCabinets[i];
            break;
          }
        }
      } else {
        selectedCabinet = availableCabinets[0];
      }
    } else {
      selectedCabinet = availableCabinets[0];
    }
    result.push({ specId: selectedCabinet.id, width: selectedCabinet.width });
    remainingWidth -= selectedCabinet.width;
  }
  return result;
}
function maybeAddTallCabinet(availableWidth, w, rng = Math.random, allowedSpecIds) {
  if (rng() > w.tallCabinetProbability)
    return null;
  const allowed = allowedSpecIds ? new Set(allowedSpecIds) : null;
  const tallCabs = getTallCabinets().filter((c) => c.width <= availableWidth && (!allowed || allowed.has(c.id)));
  if (tallCabs.length === 0)
    return null;
  const narrowTall = tallCabs.filter((c) => c.width <= 24);
  return narrowTall.length > 0 ? randomChoice(narrowTall, rng) : randomChoice(tallCabs, rng);
}

// ../../apps/web/src/lib/layout/types.ts
function getLRoomNotch(room) {
  return {
    nw: room.lRoomNotchWidth ?? 0,
    nd: room.lRoomNotchDepth ?? 0
  };
}

// ../../apps/web/src/lib/layout/wall-placement.ts
function getActiveWalls(layout) {
  const resolved = layout === "angled" ? "l-shape" : layout;
  switch (resolved) {
    case "one-wall":
      return new Set(["north"]);
    case "galley":
      return new Set(["north", "south"]);
    case "l-shape":
      return new Set(["north", "east"]);
    case "u-shape":
      return new Set(["north", "east", "west"]);
    default:
      return new Set(["north"]);
  }
}
function planWallRun(wallLength, hasPerpendicularAtStart, hasPerpendicularAtEnd, wallReservations, baseGaps, wallCabGaps, sinkReservations, w, wallCabWallLength, rng = Math.random, allowedSpecIds) {
  let available = wallLength;
  const hasApplianceNearStart = wallReservations.some((r) => r.offset < w.tallCabinetThreshold);
  const tallStart = hasPerpendicularAtStart || hasApplianceNearStart ? null : maybeAddTallCabinet(available, w, rng, allowedSpecIds);
  const tallStartWidth = tallStart ? tallStart.width : 0;
  if (tallStart)
    available -= tallStart.width;
  const hasApplianceNearEnd = wallReservations.some((r) => r.offset + r.width > available - w.tallCabinetThreshold);
  const tallEnd = hasPerpendicularAtEnd || hasApplianceNearEnd ? null : maybeAddTallCabinet(available, w, rng, allowedSpecIds);
  if (tallEnd)
    available -= tallEnd.width;
  const startOffset = tallStartWidth;
  const endOffset = startOffset + available;
  const baseCabs = selectCabinetsForSegments(computeAvailableSegments(endOffset, baseGaps, startOffset), "base", sinkReservations, rng, allowedSpecIds);
  const wallCabAvailable = wallCabWallLength != null ? wallCabWallLength - tallStartWidth - (tallEnd ? tallEnd.width : 0) : available;
  const wallCabEndOffset = startOffset + wallCabAvailable;
  const wallCabs = selectCabinetsForSegments(computeAvailableSegments(wallCabEndOffset, wallCabGaps, startOffset), "wall", sinkReservations, rng, allowedSpecIds);
  return { tallStart, tallEnd, tallStartWidth, baseCabs, wallCabs };
}
function cabOffsetToPlacement(specId, offset, width, y, geo, wall) {
  const runCoord = geo.perpOffset + offset + (geo.anchorIsEndEdge ? width : 0);
  return {
    specId,
    x: geo.runAxis === "x" ? runCoord : geo.fixedCoord,
    y,
    z: geo.runAxis === "z" ? runCoord : geo.fixedCoord,
    rotation: geo.rotation,
    wall
  };
}
function placeCabinetsOnWall(wall, room, activeWalls, reservations, w, rng = Math.random, allowedSpecIds, cornerBaseRunWidths = {}) {
  const placements = [];
  const { width, depth } = room;
  const wallReservations = reservations.filter((r) => r.wall === wall);
  const baseGaps = wallReservations.filter((r) => r.blocksBaseCabinets).map((r) => ({ offset: r.offset, width: r.width }));
  const wallCabGaps = wallReservations.filter((r) => r.blocksWallCabinets).map((r) => ({ offset: r.offset, width: r.width }));
  const sinkReservations = wallReservations.filter((r) => r.category === "sink");
  const hasEastWall = activeWalls.has("east");
  const hasWestWall = activeWalls.has("west");
  const hasNorthWall = activeWalls.has("north");
  const geo = wallGeometry(wall, room, activeWalls);
  const push = (specId, offset, cabWidth, y) => placements.push(cabOffsetToPlacement(specId, offset, cabWidth, y, geo, wall));
  switch (wall) {
    case "north": {
      const { nw: lnw, nd: lnd } = getLRoomNotch(room);
      const isLRoom = lnw > 0 && lnd > 0;
      let endX, endX_wall;
      if (isLRoom) {
        endX = width - lnw;
        endX_wall = endX;
      } else {
        endX = hasEastWall ? width - (cornerBaseRunWidths.north ?? BASE_CABINET_DEPTH) : width;
        endX_wall = hasEastWall ? width - BASE_CABINET_DEPTH : width;
      }
      const runLength = endX - geo.perpOffset;
      const { tallStart, tallEnd, baseCabs, wallCabs } = planWallRun(runLength, hasWestWall, isLRoom ? false : hasEastWall, wallReservations, baseGaps, wallCabGaps, sinkReservations, w, endX_wall - geo.perpOffset, rng, allowedSpecIds);
      if (tallStart)
        push(tallStart.id, 0, tallStart.width, 0);
      baseCabs.forEach((cab) => push(cab.specId, cab.offset, cab.width, 0));
      wallCabs.forEach((cab) => push(cab.specId, cab.offset, cab.width, cab.overSink ? w.wallCabinetY + 12 : w.wallCabinetY));
      if (tallEnd)
        push(tallEnd.id, runLength - tallEnd.width, tallEnd.width, 0);
      break;
    }
    case "south": {
      const endX = hasEastWall ? width - BASE_CABINET_DEPTH : width;
      const runLength = endX - geo.perpOffset;
      const { tallStart, tallEnd, baseCabs, wallCabs } = planWallRun(runLength, hasWestWall, hasEastWall, wallReservations, baseGaps, wallCabGaps, sinkReservations, w, undefined, rng, allowedSpecIds);
      if (tallStart)
        push(tallStart.id, 0, tallStart.width, 0);
      baseCabs.forEach((cab) => push(cab.specId, cab.offset, cab.width, 0));
      wallCabs.forEach((cab) => push(cab.specId, cab.offset, cab.width, cab.overSink ? w.wallCabinetY + 12 : w.wallCabinetY));
      if (tallEnd)
        push(tallEnd.id, runLength - tallEnd.width, tallEnd.width, 0);
      break;
    }
    case "east": {
      const { nw: lnwE, nd: lndE } = getLRoomNotch(room);
      const isLRoomE = lnwE > 0 && lndE > 0;
      let endZ, endZ_wall;
      if (isLRoomE) {
        endZ = depth - lndE;
        endZ_wall = endZ;
      } else {
        endZ = hasNorthWall ? depth - BASE_CABINET_DEPTH : depth;
        endZ_wall = endZ;
      }
      const runLength = endZ;
      const { tallStart, tallEnd, baseCabs, wallCabs } = planWallRun(runLength, false, isLRoomE ? false : hasNorthWall, wallReservations, baseGaps, wallCabGaps, sinkReservations, w, endZ_wall, rng, allowedSpecIds);
      if (tallStart)
        push(tallStart.id, 0, tallStart.width, 0);
      baseCabs.forEach((cab) => push(cab.specId, cab.offset, cab.width, 0));
      wallCabs.forEach((cab) => push(cab.specId, cab.offset, cab.width, cab.overSink ? w.wallCabinetY + 12 : w.wallCabinetY));
      if (tallEnd)
        push(tallEnd.id, runLength - tallEnd.width, tallEnd.width, 0);
      break;
    }
    case "west": {
      const endZ = hasNorthWall ? depth - (cornerBaseRunWidths.west ?? BASE_CABINET_DEPTH) : depth;
      const runLength = endZ;
      const { tallStart, tallEnd, baseCabs, wallCabs } = planWallRun(runLength, false, hasNorthWall, wallReservations, baseGaps, wallCabGaps, sinkReservations, w, undefined, rng, allowedSpecIds);
      if (tallStart)
        push(tallStart.id, 0, tallStart.width, 0);
      baseCabs.forEach((cab) => push(cab.specId, cab.offset, cab.width, 0));
      wallCabs.forEach((cab) => push(cab.specId, cab.offset, cab.width, cab.overSink ? w.wallCabinetY + 12 : w.wallCabinetY));
      if (tallEnd)
        push(tallEnd.id, runLength - tallEnd.width, tallEnd.width, 0);
      break;
    }
  }
  return placements;
}

// ../../apps/web/src/lib/layout/corner-fillers.ts
function generateWallCornerGeometry(w, d, h, cut, corner) {
  if (corner === "north-east") {
    const positions = [
      0,
      0,
      d,
      w,
      0,
      d,
      w,
      0,
      0,
      w - cut,
      0,
      0,
      0,
      0,
      d - cut,
      0,
      h,
      d,
      w,
      h,
      d,
      w,
      h,
      0,
      w - cut,
      h,
      0,
      0,
      h,
      d - cut
    ];
    const indices = [
      0,
      1,
      4,
      1,
      3,
      4,
      1,
      2,
      3,
      5,
      9,
      6,
      6,
      9,
      8,
      6,
      8,
      7,
      0,
      6,
      1,
      0,
      5,
      6,
      1,
      6,
      7,
      1,
      7,
      2,
      2,
      7,
      8,
      2,
      8,
      3,
      3,
      8,
      9,
      3,
      9,
      4,
      4,
      9,
      5,
      4,
      5,
      0
    ];
    return { positions, indices };
  } else if (corner === "north-west") {
    const positions = [
      w,
      0,
      d,
      0,
      0,
      d,
      0,
      0,
      0,
      cut,
      0,
      0,
      w,
      0,
      d - cut,
      w,
      h,
      d,
      0,
      h,
      d,
      0,
      h,
      0,
      cut,
      h,
      0,
      w,
      h,
      d - cut
    ];
    const indices = [
      0,
      4,
      1,
      1,
      4,
      3,
      1,
      3,
      2,
      5,
      6,
      9,
      6,
      8,
      9,
      6,
      7,
      8,
      0,
      1,
      6,
      0,
      6,
      5,
      1,
      2,
      7,
      1,
      7,
      6,
      2,
      3,
      8,
      2,
      8,
      7,
      3,
      4,
      9,
      3,
      9,
      8,
      4,
      0,
      5,
      4,
      5,
      9
    ];
    return { positions, indices };
  }
  return { positions: [], indices: [] };
}
function generateCornerFillers(room, activeWalls, w) {
  const fillers = [];
  const hasNorth = activeWalls.has("north");
  const hasEast = activeWalls.has("east");
  const hasWest = activeWalls.has("west");
  const fillerColor = "#c4a88a";
  const { nw: lRoomNW, nd: lRoomND } = getLRoomNotch(room);
  const isLRoom = lRoomNW > 0 && lRoomND > 0;
  if (hasNorth && hasEast && !isLRoom) {
    fillers.push({
      id: "corner-filler-wall-ne",
      type: "wall",
      width: BASE_CABINET_DEPTH,
      depth: BASE_CABINET_DEPTH,
      height: w.wallCabinetHeight,
      color: fillerColor,
      position: {
        x: room.width - BASE_CABINET_DEPTH,
        y: w.wallCabinetY,
        z: room.depth - BASE_CABINET_DEPTH
      },
      corner: "north-east",
      geometry: generateWallCornerGeometry(BASE_CABINET_DEPTH, BASE_CABINET_DEPTH, w.wallCabinetHeight, w.wallCabinetDepth, "north-east")
    });
  }
  if (hasNorth && hasWest) {
    fillers.push({
      id: "corner-filler-wall-nw",
      type: "wall",
      width: BASE_CABINET_DEPTH,
      depth: BASE_CABINET_DEPTH,
      height: w.wallCabinetHeight,
      color: fillerColor,
      position: {
        x: 0,
        y: w.wallCabinetY,
        z: room.depth - BASE_CABINET_DEPTH
      },
      corner: "north-west",
      geometry: generateWallCornerGeometry(BASE_CABINET_DEPTH, BASE_CABINET_DEPTH, w.wallCabinetHeight, w.wallCabinetDepth, "north-west")
    });
  }
  return fillers;
}

// ../../apps/web/src/data/countertops.ts
var DEFAULT_COUNTERTOP = {
  id: "CT-QUARTZ-WHITE",
  name: "Quartz - Off White",
  thickness: 1.5,
  material: "quartz",
  color: "#F5F5F0",
  overhangFront: 1.5,
  overhangSide: 1
};

// ../../apps/web/src/lib/layout/door-swing.ts
var OVERLAP_EPSILON = 0.01;
var INWARD_NORMAL = {
  north: { x: 0, z: -1 },
  south: { x: 0, z: 1 },
  east: { x: -1, z: 0 },
  west: { x: 1, z: 0 }
};
function openingEnds(door, roomWidth, roomDepth) {
  const plane = door.plane;
  switch (door.wall) {
    case "north":
      return openingPoints("x", door.offset, door.width, plane ?? roomDepth);
    case "south":
      return openingPoints("x", door.offset, door.width, plane ?? 0);
    case "east":
      return openingPoints("z", door.offset, door.width, plane ?? roomWidth);
    case "west":
      return openingPoints("z", door.offset, door.width, plane ?? 0);
  }
}
function openingPoints(runAxis, offset, width, plane) {
  return runAxis === "x" ? [{ x: offset, z: plane }, { x: offset + width, z: plane }] : [{ x: plane, z: offset }, { x: plane, z: offset + width }];
}
function doorSwingPose(door, roomWidth, roomDepth, arcSegments = 12) {
  const [start, end] = openingEnds(door, roomWidth, roomDepth);
  const hingeSide = door.hingeSide ?? "start";
  const swingDirection = door.swingDirection ?? "inward";
  const hinge = hingeSide === "start" ? start : end;
  const closedEnd = hingeSide === "start" ? end : start;
  const inward = INWARD_NORMAL[door.wall];
  const direction = swingDirection === "inward" ? 1 : -1;
  const openEnd = {
    x: hinge.x + inward.x * door.width * direction,
    z: hinge.z + inward.z * door.width * direction
  };
  const closedAngle = Math.atan2(closedEnd.z - hinge.z, closedEnd.x - hinge.x);
  const openAngle = Math.atan2(openEnd.z - hinge.z, openEnd.x - hinge.x);
  const cross = (closedEnd.x - hinge.x) * (openEnd.z - hinge.z) - (closedEnd.z - hinge.z) * (openEnd.x - hinge.x);
  const delta = Math.sign(cross) * Math.PI / 2;
  const segmentCount = Math.max(1, Math.floor(arcSegments));
  const arc = Array.from({ length: segmentCount + 1 }, (_, index) => {
    const angle = closedAngle + delta * index / segmentCount;
    return {
      x: hinge.x + Math.cos(angle) * door.width,
      z: hinge.z + Math.sin(angle) * door.width
    };
  });
  arc[0] = closedEnd;
  arc[arc.length - 1] = openEnd;
  const sector = [hinge, ...arc];
  const xs = sector.map((point) => point.x);
  const zs = sector.map((point) => point.z);
  return {
    hinge,
    closedEnd,
    openEnd,
    arc,
    sector,
    bounds: {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs)
    }
  };
}
function projection(points, axis) {
  const values = points.map((point) => point.x * axis.x + point.z * axis.z);
  return { min: Math.min(...values), max: Math.max(...values) };
}
function convexPolygonsOverlap(first, second) {
  for (const polygon of [first, second]) {
    for (let index = 0;index < polygon.length; index += 1) {
      const start = polygon[index];
      const end = polygon[(index + 1) % polygon.length];
      const axis = { x: -(end.z - start.z), z: end.x - start.x };
      const length = Math.hypot(axis.x, axis.z);
      if (length <= OVERLAP_EPSILON)
        continue;
      const normalized = { x: axis.x / length, z: axis.z / length };
      const a = projection(first, normalized);
      const b = projection(second, normalized);
      if (Math.min(a.max, b.max) - Math.max(a.min, b.min) <= OVERLAP_EPSILON)
        return false;
    }
  }
  return true;
}
function wallObjectFootprint(wall, offset, width, depth, roomWidth, roomDepth) {
  switch (wall) {
    case "north":
      return [
        { x: offset, z: roomDepth - depth },
        { x: offset + width, z: roomDepth - depth },
        { x: offset + width, z: roomDepth },
        { x: offset, z: roomDepth }
      ];
    case "south":
      return [
        { x: offset, z: 0 },
        { x: offset + width, z: 0 },
        { x: offset + width, z: depth },
        { x: offset, z: depth }
      ];
    case "east":
      return [
        { x: roomWidth - depth, z: offset },
        { x: roomWidth, z: offset },
        { x: roomWidth, z: offset + width },
        { x: roomWidth - depth, z: offset + width }
      ];
    case "west":
      return [
        { x: 0, z: offset },
        { x: depth, z: offset },
        { x: depth, z: offset + width },
        { x: 0, z: offset + width }
      ];
  }
}
function overlapsDoorSwing(polygon, doors, roomWidth, roomDepth) {
  return doors.some((door) => convexPolygonsOverlap(polygon, doorSwingPose(door, roomWidth, roomDepth).sector));
}

// ../../apps/web/src/lib/layout/appliance-fit.ts
function createBaseFriendlyPlacementChooser({
  activeWalls,
  allowedBaseWidths,
  applianceWidths,
  getWallLength,
  hasPerpendicularAtEnd,
  reservations,
  rng,
  room,
  weights
}) {
  const unfilledWidth = (width) => {
    if (allowedBaseWidths.length === 0 || width <= 0)
      return 0;
    const unitsPerInch = 4;
    const target = Math.max(0, Math.round(width * unitsPerInch));
    const widths = allowedBaseWidths.map((candidate) => Math.round(candidate * unitsPerInch));
    const fillable = Array(target + 1).fill(false);
    fillable[0] = true;
    for (let filled = 1;filled <= target; filled += 1) {
      fillable[filled] = widths.some((candidate) => candidate <= filled && fillable[filled - candidate]);
    }
    for (let filled = target;filled >= 0; filled -= 1) {
      if (fillable[filled])
        return (target - filled) / unitsPerInch;
    }
    return width;
  };
  const penalty = (candidate, category, isSinkCluster) => {
    if (allowedBaseWidths.length === 0)
      return 0;
    const wallLength = getWallLength(candidate.wall);
    const gaps = reservations.filter((reservation) => reservation.wall === candidate.wall && reservation.blocksBaseCabinets).map((reservation) => ({ start: reservation.offset, end: reservation.offset + reservation.width }));
    for (const door of room.doors ?? []) {
      if (door.wall !== candidate.wall)
        continue;
      const reservation = doorToReservation(door, wallGeometry(door.wall, room, activeWalls), weights.doorClearance);
      if (reservation)
        gaps.push({ start: reservation.offset, end: reservation.offset + reservation.width });
    }
    if (category === "range" || category === "refrigerator") {
      gaps.push({ start: candidate.offset, end: candidate.offset + applianceWidths[category] });
    } else if (isSinkCluster) {
      gaps.push({ start: candidate.offset, end: candidate.offset + weights.reservedDishwasherWidth });
    }
    gaps.sort((left, right) => left.start - right.start);
    let cursor = 0;
    let total = 0;
    for (const gap of gaps) {
      const end = Math.max(0, Math.min(wallLength, gap.start));
      if (end > cursor) {
        const remainder = unfilledWidth(end - cursor);
        total += remainder;
        if (remainder > 0)
          total += 1e4;
      }
      cursor = Math.max(cursor, Math.min(wallLength, gap.end));
    }
    if (cursor < wallLength) {
      const remainder = unfilledWidth(wallLength - cursor);
      total += remainder;
      if (remainder > 0 && hasPerpendicularAtEnd(candidate.wall))
        total += 1e4;
    }
    return total;
  };
  const choose = (candidates, category, isSinkCluster = false) => {
    const scored = candidates.map((candidate) => ({
      candidate,
      penalty: penalty(candidate, category, isSinkCluster)
    }));
    const bestPenalty = Math.min(...scored.map((entry) => entry.penalty));
    const best = scored.filter((entry) => entry.penalty === bestPenalty);
    return best[Math.floor(rng() * best.length)].candidate;
  };
  return { choose, penalty };
}

// ../../apps/web/src/lib/layout/appliances.ts
var APPLIANCE_COLORS = {
  range: "#8B0000",
  refrigerator: "#F5F5F0",
  sink: "#ADD8E6",
  dishwasher: "#B7BDC3",
  hood: "#707070"
};
var APPLIANCE_DIMENSIONS = {
  range: { width: 30, height: 36.5, depth: 26.5 },
  refrigerator: { width: 36, height: 66, depth: 30 },
  sink: { width: 30, height: 8, depth: 22 },
  dishwasher: { width: 24, height: BASE_CABINET_HEIGHT, depth: BASE_CABINET_DEPTH },
  hood: { width: 30, height: 6, depth: 20 }
};
var FLOOR_APPLIANCE_WALL_OFFSET = 0.5;
function getSinkCabinetId(width) {
  if (width <= 24)
    return "SB24";
  if (width <= 30)
    return "SB30";
  if (width <= 33)
    return "SB33";
  return "SB36";
}
function applianceToReservation(placement, geo) {
  const dims = APPLIANCE_DIMENSIONS[placement.category];
  const cabOffset = Math.max(0, placement.offset - geo.perpOffset);
  const isSink = placement.category === "sink";
  const isDishwasher = placement.category === "dishwasher";
  return {
    id: placement.id,
    sourceId: placement.id,
    category: placement.category === "dishwasher" ? "dishwasher-reserved" : placement.category,
    wall: placement.wall,
    offset: cabOffset,
    width: dims.width,
    blocksBaseCabinets: !isSink,
    blocksWallCabinets: !isSink && !isDishwasher,
    sinkCabinetId: isSink ? getSinkCabinetId(dims.width) : undefined
  };
}
var NO_BUFFER = 0;
function planAppliancePlacements(activeWalls, room, w, rng = Math.random, allowedSpecIds) {
  const walls = Array.from(activeWalls);
  if (walls.length === 0)
    return [];
  const { nw: lRoomNW, nd: lRoomND } = getLRoomNotch(room);
  const isLRoom = lRoomNW > 0 && lRoomND > 0;
  const reservations = [];
  const includeAutoDishwasher = room.dishwasher === true;
  const wallUsage = new Map;
  walls.forEach((w2) => wallUsage.set(w2, []));
  (room.doors ?? []).forEach((d) => {
    const used = wallUsage.get(d.wall);
    if (used) {
      const geo = wallGeometry(d.wall, room, activeWalls);
      const res = doorToReservation(d, geo, 0);
      if (res)
        used.push({ start: res.offset, end: res.offset + res.width });
    }
  });
  const windowZones = new Map;
  walls.forEach((wall) => windowZones.set(wall, []));
  (room.windows ?? []).forEach((win) => {
    const zones = windowZones.get(win.wall);
    if (zones) {
      const geo = wallGeometry(win.wall, room, activeWalls);
      const res = windowToReservation(win, geo, w.windowClearance);
      if (res)
        zones.push({ start: res.offset, end: res.offset + res.width });
    }
  });
  const overlapsWindow = (wall, start, width) => {
    const zones = windowZones.get(wall) || [];
    const end = start + width;
    return zones.some((z) => !(end <= z.start || start >= z.end));
  };
  const getWallLength = (wall) => {
    if (wall === "north" || wall === "south") {
      const hasEast = activeWalls.has("east");
      const hasWest = activeWalls.has("west");
      let length = room.width;
      if (hasEast)
        length -= isLRoom ? lRoomNW : BASE_CABINET_DEPTH;
      if (hasWest)
        length -= BASE_CABINET_DEPTH;
      return length;
    } else {
      const hasNorth = activeWalls.has("north");
      const hasSouth = activeWalls.has("south");
      let length = room.depth;
      if (hasNorth)
        length -= isLRoom ? lRoomND : BASE_CABINET_DEPTH;
      if (hasSouth)
        length -= BASE_CABINET_DEPTH;
      return length;
    }
  };
  const canPlace = (wall, start, width, buffer, footprintDepth = BASE_CABINET_DEPTH) => {
    const effectiveStart = start - buffer;
    const effectiveEnd = start + width + buffer;
    const used = wallUsage.get(wall) || [];
    if (used.some((u) => !(effectiveEnd <= u.start || effectiveStart >= u.end)))
      return false;
    const geo = wallGeometry(wall, room, activeWalls);
    return !overlapsDoorSwing(wallObjectFootprint(wall, start + geo.perpOffset, width, footprintDepth, room.width, room.depth), room.doors ?? [], room.width, room.depth);
  };
  const markUsed = (wall, start, width) => {
    const used = wallUsage.get(wall) || [];
    used.push({ start, end: start + width });
    wallUsage.set(wall, used);
  };
  const findValidPositions = (wall, width, buffer, minEdgeGap = 6, footprintDepth = BASE_CABINET_DEPTH) => {
    const wallLength = getWallLength(wall);
    if (wallLength < width + minEdgeGap * 2)
      return [];
    const positions = [];
    const step = 3;
    for (let offset = minEdgeGap;offset <= wallLength - width - minEdgeGap; offset += step) {
      if (canPlace(wall, offset, width, buffer, footprintDepth)) {
        positions.push(offset);
      }
    }
    return positions;
  };
  const hasPerpendicularAtStart = (wall) => {
    if (wall === "north" || wall === "south")
      return activeWalls.has("west");
    return activeWalls.has("south");
  };
  const hasPerpendicularAtEnd = (wall) => {
    if (isLRoom && (wall === "north" || wall === "east"))
      return false;
    if (wall === "north" || wall === "south")
      return activeWalls.has("east");
    return activeWalls.has("north");
  };
  const allowedBaseWidths = allowedSpecIds ? [...new Set(allowedSpecIds.map((id) => cabinetSpecForCode(id)).filter((spec) => spec?.type === "base").map((spec) => spec.width))] : [];
  const dishwasherSupportWidth = allowedBaseWidths.filter((width) => width >= 9).sort((a, b) => a - b)[0] ?? 12;
  const { choose: chooseBaseFriendlyPlacement, penalty: baseFitPenalty } = createBaseFriendlyPlacementChooser({
    activeWalls,
    allowedBaseWidths,
    applianceWidths: {
      sink: APPLIANCE_DIMENSIONS.sink.width,
      range: APPLIANCE_DIMENSIONS.range.width,
      refrigerator: APPLIANCE_DIMENSIONS.refrigerator.width
    },
    getWallLength,
    hasPerpendicularAtEnd,
    reservations,
    rng,
    room,
    weights: w
  });
  const userPlaced = new Set;
  const explicitlyPlacedCategories = new Set((room.appliances ?? []).map((placement) => placement.category));
  const seededPlacements = [
    ...(room.retainedAppliances ?? []).filter((placement) => !explicitlyPlacedCategories.has(placement.category)).map((placement) => ({ placement, authored: false })),
    ...(room.appliances ?? []).map((placement) => ({ placement, authored: true }))
  ];
  seededPlacements.forEach(({ placement, authored }) => {
    if (!walls.includes(placement.wall))
      return;
    const dims = APPLIANCE_DIMENSIONS[placement.category];
    if (overlapsDoorSwing(wallObjectFootprint(placement.wall, placement.offset, dims.width, dims.depth, room.width, room.depth), room.doors ?? [], room.width, room.depth))
      return;
    const geo = wallGeometry(placement.wall, room, activeWalls);
    const res = applianceToReservation(placement, geo);
    if (!authored)
      delete res.sourceId;
    reservations.push(res);
    markUsed(res.wall, res.offset, res.width);
    userPlaced.add(placement.category);
    if (placement.category === "sink" && room.dishwasher === true) {
      const wallLen = getWallLength(res.wall);
      const dishwasherOffset = res.offset - w.reservedDishwasherWidth;
      if (dishwasherOffset >= dishwasherSupportWidth && canPlace(res.wall, dishwasherOffset, w.reservedDishwasherWidth, 0)) {
        reservations.push({
          category: "dishwasher-reserved",
          wall: res.wall,
          offset: dishwasherOffset,
          width: w.reservedDishwasherWidth,
          blocksBaseCabinets: true,
          blocksWallCabinets: false
        });
        markUsed(res.wall, dishwasherOffset, w.reservedDishwasherWidth);
      }
      const trashOffset = res.offset + res.width;
      if (trashOffset + w.reservedTrashWidth <= wallLen && canPlace(res.wall, trashOffset, w.reservedTrashWidth, 0)) {
        reservations.push({
          category: "trash-reserved",
          wall: res.wall,
          offset: trashOffset,
          width: w.reservedTrashWidth,
          blocksBaseCabinets: false,
          blocksWallCabinets: false
        });
        markUsed(res.wall, trashOffset, w.reservedTrashWidth);
      }
    }
  });
  const sinkClusterWidth = APPLIANCE_DIMENSIONS.sink.width + w.reservedDishwasherWidth + w.reservedTrashWidth;
  const viableWallsForSinkCluster = walls.filter((wall) => getWallLength(wall) >= sinkClusterWidth);
  const hasWindowOnActiveWall = (room.windows ?? []).some((win) => activeWalls.has(win.wall));
  const sinkFirst = viableWallsForSinkCluster.length === 1 || hasWindowOnActiveWall;
  const applianceTypes = sinkFirst ? ["sink", "refrigerator", "range"] : ["refrigerator", "sink", "range"];
  const buildAttemptQueue = (canTryCluster) => {
    const bufferLevels = [w.preferredApplianceBuffer, w.minimumApplianceBuffer, NO_BUFFER];
    const modes = canTryCluster ? ["cluster", "solo"] : ["solo"];
    return modes.flatMap((mode) => bufferLevels.map((buffer) => ({ mode, buffer })));
  };
  const collectPlacements = (wallPool, searchWidth, buffer, edgeGap, category) => {
    const all = [];
    for (const wall of wallPool) {
      findValidPositions(wall, searchWidth, buffer, edgeGap, APPLIANCE_DIMENSIONS[category].depth).forEach((offset) => all.push({ wall, offset }));
    }
    if (all.length === 0) {
      const fallbackGap = category === "range" ? w.rangeEdgeGap : 0;
      for (const wall of wallPool) {
        findValidPositions(wall, searchWidth, buffer, fallbackGap, APPLIANCE_DIMENSIONS[category].depth).forEach((offset) => all.push({ wall, offset }));
      }
    }
    return all;
  };
  const chooseFridgePlacement = (candidates) => {
    const fridgeWidth = APPLIANCE_DIMENSIONS.refrigerator.width;
    const windowFiltered = candidates.filter((p) => !overlapsWindow(p.wall, p.offset, fridgeWidth));
    const pool = windowFiltered.length > 0 ? windowFiltered : candidates;
    const endCandidates = [];
    for (const p of pool) {
      const wallLen = getWallLength(p.wall);
      if (p.offset <= 6)
        endCandidates.push({ wall: p.wall, offset: 0 });
      const farOffset = wallLen - fridgeWidth;
      if (p.offset >= farOffset - 6)
        endCandidates.push({ wall: p.wall, offset: farOffset });
    }
    const seen = new Set;
    const uniqueEnds = endCandidates.filter((p) => {
      const key = `${p.wall}:${p.offset}`;
      if (seen.has(key))
        return false;
      seen.add(key);
      return true;
    });
    const validEnds = uniqueEnds.filter((p) => canPlace(p.wall, p.offset, fridgeWidth, 0, APPLIANCE_DIMENSIONS.refrigerator.depth));
    const outsideEnds = validEnds.filter((p) => {
      const wallLen = getWallLength(p.wall);
      const atStart = p.offset <= 6;
      const atEnd = p.offset >= wallLen - fridgeWidth - 6;
      if (atStart && !hasPerpendicularAtStart(p.wall))
        return true;
      if (atEnd && !hasPerpendicularAtEnd(p.wall))
        return true;
      return false;
    });
    const finalPool = outsideEnds.length > 0 ? outsideEnds : validEnds.length > 0 ? validEnds : pool;
    return chooseBaseFriendlyPlacement(finalPool, "refrigerator");
  };
  const chooseSinkPlacement = (candidates, wallPool, searchWidth, buffer, isCluster, dims) => {
    if ((room.windows?.length ?? 0) === 0)
      return chooseBaseFriendlyPlacement(candidates, "sink", isCluster);
    const dishwasherWidth = isCluster ? w.reservedDishwasherWidth : 0;
    const underWindow = [];
    for (const win of room.windows) {
      if (win.wall === "angled")
        continue;
      if (!wallPool.includes(win.wall))
        continue;
      const geo = wallGeometry(win.wall, room, activeWalls);
      const winCenter = win.offset + win.width / 2 - geo.perpOffset;
      const idealOffset = winCenter - dishwasherWidth - dims.width / 2;
      if (canPlace(win.wall, idealOffset, searchWidth, buffer, APPLIANCE_DIMENSIONS.sink.depth)) {
        const wallLen = getWallLength(win.wall);
        if (idealOffset >= 0 && idealOffset + searchWidth <= wallLen) {
          underWindow.push({ wall: win.wall, offset: idealOffset });
        }
      }
    }
    if (underWindow.some((candidate) => baseFitPenalty(candidate, "sink", isCluster) < 1e4)) {
      return chooseBaseFriendlyPlacement(underWindow, "sink", isCluster);
    }
    return chooseBaseFriendlyPlacement(candidates, "sink", isCluster);
  };
  applianceTypes.forEach((category) => {
    if (userPlaced.has(category))
      return;
    const dims = APPLIANCE_DIMENSIONS[category];
    const shuffledWalls = [...walls].sort(() => rng() - 0.5);
    if (category === "sink" && (room.windows?.length ?? 0) > 0) {
      const wallsWithWindows = new Set(room.windows.map((win) => win.wall));
      shuffledWalls.sort((a, b) => (wallsWithWindows.has(a) ? 0 : 1) - (wallsWithWindows.has(b) ? 0 : 1));
    }
    const canTryCluster = category === "sink" && !explicitlyPlacedCategories.has("dishwasher") && includeAutoDishwasher && viableWallsForSinkCluster.length > 0;
    const attempts = buildAttemptQueue(canTryCluster);
    let placed = false;
    for (const attempt of attempts) {
      if (placed)
        break;
      const isCluster = attempt.mode === "cluster";
      const searchWidth = isCluster ? sinkClusterWidth : dims.width;
      const wallPool = isCluster ? shuffledWalls.filter((wall) => viableWallsForSinkCluster.includes(wall)) : shuffledWalls;
      const edgeGap = category === "range" ? w.rangeEdgeGap : category === "sink" && isCluster ? dishwasherSupportWidth : 6;
      const candidates = collectPlacements(wallPool, searchWidth, attempt.buffer, edgeGap, category);
      if (candidates.length === 0)
        continue;
      const chosen = category === "refrigerator" ? chooseFridgePlacement(candidates) : category === "sink" ? chooseSinkPlacement(candidates, wallPool, searchWidth, attempt.buffer, isCluster, dims) : chooseBaseFriendlyPlacement(candidates, "range");
      if (category === "sink" && isCluster) {
        const dishwasherOffset = chosen.offset;
        const sinkOffset = chosen.offset + w.reservedDishwasherWidth;
        const trashOffset = chosen.offset + w.reservedDishwasherWidth + dims.width;
        const sinkCabinetId = getSinkCabinetId(dims.width);
        reservations.push({
          category: "sink",
          wall: chosen.wall,
          offset: sinkOffset,
          width: dims.width,
          blocksBaseCabinets: false,
          blocksWallCabinets: false,
          sinkCabinetId
        });
        reservations.push({
          category: "dishwasher-reserved",
          wall: chosen.wall,
          offset: dishwasherOffset,
          width: w.reservedDishwasherWidth,
          blocksBaseCabinets: true,
          blocksWallCabinets: false
        });
        reservations.push({
          category: "trash-reserved",
          wall: chosen.wall,
          offset: trashOffset,
          width: w.reservedTrashWidth,
          blocksBaseCabinets: false,
          blocksWallCabinets: false
        });
        markUsed(chosen.wall, chosen.offset, sinkClusterWidth);
      } else {
        const sinkCabinetId = category === "sink" ? getSinkCabinetId(dims.width) : undefined;
        reservations.push({
          category,
          wall: chosen.wall,
          offset: chosen.offset,
          width: dims.width,
          blocksBaseCabinets: category !== "sink",
          blocksWallCabinets: category !== "sink",
          sinkCabinetId
        });
        markUsed(chosen.wall, chosen.offset, dims.width);
      }
      placed = true;
    }
  });
  const categoryCounts = new Map;
  for (const reservation of reservations) {
    if (reservation.category !== "sink" && reservation.category !== "range" && reservation.category !== "refrigerator")
      continue;
    if (reservation.id?.trim())
      continue;
    const count = (categoryCounts.get(reservation.category) ?? 0) + 1;
    categoryCounts.set(reservation.category, count);
    reservation.id = `appliance-${reservation.category}-${count}`;
  }
  return reservations;
}
function resolveAppliances(reservations, room, activeWalls, cabinets = [], w) {
  const appliances = [];
  const rangePositions = [];
  const sinkCabinets = cabinets.filter((cabinet) => cabinet.spec.type === "sink-base");
  const usedSinkCabinetIds = new Set;
  const fallbackCounts = new Map;
  const nextFallbackId = (category) => {
    const count = (fallbackCounts.get(category) ?? 0) + 1;
    fallbackCounts.set(category, count);
    return `appliance-${category}-${count}`;
  };
  const runCenterForCabinet = (cabinet) => {
    if (cabinet.wall === "north" || cabinet.wall === "south") {
      return cabinet.rotation === 180 ? cabinet.position.x - cabinet.spec.width / 2 : cabinet.position.x + cabinet.spec.width / 2;
    }
    return cabinet.rotation === 90 ? cabinet.position.z - cabinet.spec.width / 2 : cabinet.position.z + cabinet.spec.width / 2;
  };
  for (const res of reservations) {
    if (res.category !== "sink" && res.category !== "range" && res.category !== "refrigerator")
      continue;
    const dims = APPLIANCE_DIMENSIONS[res.category];
    const applianceId = res.id?.trim() || nextFallbackId(res.category);
    const wallOffset = res.category === "sink" ? 0 : FLOOR_APPLIANCE_WALL_OFFSET;
    const sinkInset = res.category === "sink" ? 1 : 0;
    let x = 0;
    let z = 0;
    let rotation = 0;
    let hostObjectId;
    if (res.category === "sink" && sinkCabinets.length > 0) {
      const geo = wallGeometry(res.wall, room, activeWalls);
      const expectedRunCenter = geo.perpOffset + res.offset + dims.width / 2;
      const sinkCab = sinkCabinets.filter((cabinet) => cabinet.wall === res.wall && !usedSinkCabinetIds.has(cabinet.id)).sort((a, b) => Math.abs(runCenterForCabinet(a) - expectedRunCenter) - Math.abs(runCenterForCabinet(b) - expectedRunCenter) || a.id.localeCompare(b.id))[0];
      if (sinkCab) {
        usedSinkCabinetIds.add(sinkCab.id);
        hostObjectId = sinkCab.id;
        const cabW = sinkCab.spec.width;
        const cabD = sinkCab.spec.depth;
        let cabCenterX;
        let cabCenterZ;
        switch (sinkCab.rotation) {
          case 0:
            cabCenterX = sinkCab.position.x + cabW / 2;
            cabCenterZ = sinkCab.position.z + cabD / 2;
            break;
          case 90:
            cabCenterX = sinkCab.position.x + cabD / 2;
            cabCenterZ = sinkCab.position.z - cabW / 2;
            break;
          case 180:
            cabCenterX = sinkCab.position.x - cabW / 2;
            cabCenterZ = sinkCab.position.z - cabD / 2;
            break;
          case 270:
            cabCenterX = sinkCab.position.x - cabD / 2;
            cabCenterZ = sinkCab.position.z + cabW / 2;
            break;
          default:
            cabCenterX = sinkCab.position.x;
            cabCenterZ = sinkCab.position.z;
        }
        const isRotated90 = sinkCab.rotation === 90 || sinkCab.rotation === 270;
        const sinkWorldWidth = isRotated90 ? dims.depth : dims.width;
        const sinkWorldDepth = isRotated90 ? dims.width : dims.depth;
        x = cabCenterX - sinkWorldWidth / 2;
        z = cabCenterZ - sinkWorldDepth / 2;
        if (res.wall === "north")
          z -= sinkInset;
        else if (res.wall === "south")
          z += sinkInset;
        else if (res.wall === "east")
          x -= sinkInset;
        else
          x += sinkInset;
        rotation = sinkCab.rotation;
      }
    }
    if (res.category !== "sink" || !hostObjectId) {
      const geo = wallGeometry(res.wall, room, activeWalls);
      const perpCoord = geo.wallFacesLowCoord ? geo.fixedCoord - dims.depth + wallOffset : -wallOffset;
      const runCoord = geo.perpOffset + res.offset;
      x = geo.runAxis === "x" ? runCoord : perpCoord;
      z = geo.runAxis === "z" ? runCoord : perpCoord;
      rotation = geo.rotation;
    }
    const y = res.category === "sink" ? BASE_CABINET_HEIGHT : 0;
    let flipHorizontal = false;
    if (res.category === "refrigerator") {
      const { nw: lrNW, nd: lrND } = getLRoomNotch(room);
      const lrIsLRoom = lrNW > 0 && lrND > 0;
      const wallLength = res.wall === "north" || res.wall === "south" ? room.width - (activeWalls.has("east") ? lrIsLRoom ? lrNW : BASE_CABINET_DEPTH : 0) - (activeWalls.has("west") ? BASE_CABINET_DEPTH : 0) : room.depth - (activeWalls.has("north") ? lrIsLRoom ? lrND : BASE_CABINET_DEPTH : 0) - (activeWalls.has("south") ? BASE_CABINET_DEPTH : 0);
      const isHighEnd = res.offset + dims.width / 2 > wallLength / 2;
      flipHorizontal = res.wall === "north" || res.wall === "west" ? isHighEnd : !isHighEnd;
    }
    appliances.push({
      id: applianceId,
      ...res.sourceId ? { sourceId: res.sourceId } : {},
      category: res.category,
      supportState: "supported",
      ...hostObjectId ? { hostObjectId } : {},
      width: dims.width,
      height: dims.height,
      depth: dims.depth,
      color: APPLIANCE_COLORS[res.category],
      position: { x, y, z },
      rotation,
      wall: res.wall,
      flipHorizontal
    });
    if (res.category === "range") {
      rangePositions.push({ id: applianceId, x, z, rotation, wall: res.wall });
    }
  }
  for (const rangePosition of rangePositions) {
    const hoodDims = APPLIANCE_DIMENSIONS.hood;
    const rangeDims = APPLIANCE_DIMENSIONS.range;
    let hoodX = rangePosition.x;
    let hoodZ = rangePosition.z;
    const depthDiff = rangeDims.depth - hoodDims.depth;
    if (rangePosition.wall === "north")
      hoodZ += depthDiff;
    else if (rangePosition.wall === "east")
      hoodX += depthDiff;
    const wallCabinetTop = w.wallCabinetY + w.wallCabinetHeight;
    const hoodBottomY = wallCabinetTop - 18;
    appliances.push({
      id: `${rangePosition.id}-hood`,
      category: "hood",
      supportState: "supported",
      pairedObjectId: rangePosition.id,
      width: hoodDims.width,
      height: room.ceilingHeight - hoodBottomY,
      depth: hoodDims.depth,
      color: APPLIANCE_COLORS.hood,
      position: { x: hoodX, y: hoodBottomY, z: hoodZ },
      rotation: rangePosition.rotation,
      wall: rangePosition.wall
    });
  }
  return appliances;
}

// ../../apps/web/src/lib/layout/countertop-topology.ts
var import_polygon_clipping = __toESM(require_polygon_clipping_umd(), 1);
var EPSILON = 0.001;
function rectOf(countertop) {
  return {
    minX: countertop.position.x,
    maxX: countertop.position.x + countertop.width,
    minZ: countertop.position.z,
    maxZ: countertop.position.z + countertop.depth
  };
}
function geometryRects(countertop) {
  return countertop.supportRects?.length ? countertop.supportRects : [rectOf(countertop)];
}
function positiveOverlap(a, b) {
  return Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX) > EPSILON && Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ) > EPSILON;
}
function signedArea(points) {
  let area = 0;
  for (let i = 0;i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.z - b.x * a.z;
  }
  return area / 2;
}
function simplify(points) {
  return points.filter((point, index) => {
    const previous = points[(index + points.length - 1) % points.length];
    const next = points[(index + 1) % points.length];
    return !(Math.abs(previous.x - point.x) <= EPSILON && Math.abs(point.x - next.x) <= EPSILON || Math.abs(previous.z - point.z) <= EPSILON && Math.abs(point.z - next.z) <= EPSILON);
  });
}
function unionRectangles(rectangles) {
  const xs = [...new Set(rectangles.flatMap((rect) => [rect.minX, rect.maxX]))].sort((a, b) => a - b);
  const zs = [...new Set(rectangles.flatMap((rect) => [rect.minZ, rect.maxZ]))].sort((a, b) => a - b);
  const filled = Array.from({ length: xs.length - 1 }, () => Array(zs.length - 1).fill(false));
  for (let xIndex = 0;xIndex < xs.length - 1; xIndex++) {
    for (let zIndex = 0;zIndex < zs.length - 1; zIndex++) {
      const x = (xs[xIndex] + xs[xIndex + 1]) / 2;
      const z = (zs[zIndex] + zs[zIndex + 1]) / 2;
      filled[xIndex][zIndex] = rectangles.some((rect) => x > rect.minX - EPSILON && x < rect.maxX + EPSILON && z > rect.minZ - EPSILON && z < rect.maxZ + EPSILON);
    }
  }
  const key = (point) => `${point.x},${point.z}`;
  const edges = new Map;
  const addEdge = (from, to) => {
    const outgoing = edges.get(key(from)) ?? [];
    outgoing.push(to);
    outgoing.sort((a, b) => a.x - b.x || a.z - b.z);
    edges.set(key(from), outgoing);
  };
  for (let xIndex = 0;xIndex < xs.length - 1; xIndex++) {
    for (let zIndex = 0;zIndex < zs.length - 1; zIndex++) {
      if (!filled[xIndex][zIndex])
        continue;
      const x0 = xs[xIndex], x1 = xs[xIndex + 1];
      const z0 = zs[zIndex], z1 = zs[zIndex + 1];
      if (zIndex === 0 || !filled[xIndex][zIndex - 1])
        addEdge({ x: x0, z: z0 }, { x: x1, z: z0 });
      if (xIndex === xs.length - 2 || !filled[xIndex + 1][zIndex])
        addEdge({ x: x1, z: z0 }, { x: x1, z: z1 });
      if (zIndex === zs.length - 2 || !filled[xIndex][zIndex + 1])
        addEdge({ x: x1, z: z1 }, { x: x0, z: z1 });
      if (xIndex === 0 || !filled[xIndex - 1][zIndex])
        addEdge({ x: x0, z: z1 }, { x: x0, z: z0 });
    }
  }
  const start = [...edges.keys()].sort((a, b) => {
    const [ax, az] = a.split(",").map(Number);
    const [bx, bz] = b.split(",").map(Number);
    return az - bz || ax - bx;
  })[0];
  if (!start)
    return [];
  const outline = [];
  let current = start;
  const edgeCount = [...edges.values()].reduce((sum, outgoing) => sum + outgoing.length, 0);
  for (let guard = 0;guard <= edgeCount; guard++) {
    const [x, z] = current.split(",").map(Number);
    outline.push({ x, z });
    const outgoing = edges.get(current);
    if (!outgoing?.length)
      break;
    const next = outgoing.shift();
    current = key(next);
    if (current === start)
      break;
  }
  const simplified = simplify(outline);
  return signedArea(simplified) < 0 ? [...simplified].reverse() : simplified;
}
function holeFromLegacy(countertop) {
  if (!countertop.cutout)
    return [];
  const { x, z, width, depth } = countertop.cutout;
  const minX = countertop.position.x + x;
  const minZ = countertop.position.z + z;
  return [{
    id: `${countertop.id}-sink-hole`,
    kind: "sink",
    ownerId: countertop.id,
    outline: [
      { x: minX, z: minZ },
      { x: minX, z: minZ + depth },
      { x: minX + width, z: minZ + depth },
      { x: minX + width, z: minZ }
    ]
  }];
}
function connectedOrTouching(a, b) {
  const xOverlap = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
  const zOverlap = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
  return xOverlap >= -EPSILON && zOverlap >= -EPSILON && (xOverlap > EPSILON || zOverlap > EPSILON);
}
function connectedPieceGroups(countertops) {
  const remaining = countertops.flatMap((slab) => geometryRects(slab).map((rect) => ({ slab, rect }))).sort((a, b) => a.slab.id.localeCompare(b.slab.id) || a.rect.minX - b.rect.minX || a.rect.minZ - b.rect.minZ);
  const groups = [];
  while (remaining.length > 0) {
    const group = [remaining.shift()];
    for (let index = 0;index < group.length; index++) {
      const current = group[index];
      for (let candidate = remaining.length - 1;candidate >= 0; candidate--) {
        const next = remaining[candidate];
        if (Math.abs(current.slab.position.y - next.slab.position.y) <= EPSILON && connectedOrTouching(current.rect, next.rect)) {
          group.push(next);
          remaining.splice(candidate, 1);
        }
      }
    }
    groups.push(group.sort((a, b) => a.slab.id.localeCompare(b.slab.id) || a.rect.minX - b.rect.minX || a.rect.minZ - b.rect.minZ));
  }
  return groups.sort((a, b) => a[0].rect.minX - b[0].rect.minX || a[0].rect.minZ - b[0].rect.minZ);
}
function buildCountertopComponents(slabs) {
  const polygonSlabs = slabs.filter((slab) => slab.polygon?.length);
  const rectangularSlabs = slabs.filter((slab) => !slab.polygon?.length);
  const components = connectedPieceGroups(rectangularSlabs).map((pieces) => {
    const group = [...new Map(pieces.map((piece) => [piece.slab.id, piece.slab])).values()].sort((a, b) => a.id.localeCompare(b.id));
    const rectangles = pieces.map((piece) => piece.rect);
    const outline = unionRectangles(rectangles);
    const minX = Math.min(...outline.map((point) => point.x));
    const maxX = Math.max(...outline.map((point) => point.x));
    const minZ = Math.min(...outline.map((point) => point.z));
    const maxZ = Math.max(...outline.map((point) => point.z));
    const supportWalls = [...new Set(group.flatMap((slab) => slab.supportWalls ?? (slab.wall ? [slab.wall] : [])))].sort();
    const runIds = group.flatMap((slab) => slab.supportRunIds ?? [slab.id]).sort();
    const joints = [];
    for (let i = 0;i < group.length; i++) {
      for (let j = i + 1;j < group.length; j++) {
        const a = group[i], b = group[j];
        const aRect = rectOf(a), bRect = rectOf(b);
        if (!positiveOverlap(aRect, bRect) || a.wall === b.wall)
          continue;
        joints.push({
          id: `joint-${a.id}-${b.id}`,
          kind: "continuous-corner",
          runIds: [(a.supportRunIds ?? [a.id])[0], (b.supportRunIds ?? [b.id])[0]],
          pointOrEdge: [{ x: Math.max(aRect.minX, bRect.minX), z: Math.max(aRect.minZ, bRect.minZ) }]
        });
      }
    }
    const id = `countertop-component-${group.map((slab) => slab.id.replace(/^countertop-/, "")).join("+")}-${minX}-${minZ}`;
    const holes = group.flatMap((slab) => slab.holes ?? holeFromLegacy(slab)).filter((hole) => {
      const centerX = hole.outline.reduce((sum, point) => sum + point.x, 0) / hole.outline.length;
      const centerZ = hole.outline.reduce((sum, point) => sum + point.z, 0) / hole.outline.length;
      return rectangles.some((rect) => centerX > rect.minX && centerX < rect.maxX && centerZ > rect.minZ && centerZ < rect.maxZ);
    });
    return {
      ...group[0],
      id,
      componentId: id,
      supportRunIds: runIds,
      supportCabinetIds: [...new Set(rectangles.flatMap((rect) => rect.ownerId ? [rect.ownerId] : []))].sort(),
      supportRects: rectangles,
      supportWalls,
      width: maxX - minX,
      depth: maxZ - minZ,
      position: { x: minX, y: group[0].position.y, z: minZ },
      wall: supportWalls.length === 1 ? supportWalls[0] : null,
      polygon: outline,
      outline,
      holes,
      joints,
      cutout: undefined
    };
  });
  const polygons = polygonSlabs.map((slab) => ({
    ...slab,
    componentId: slab.componentId ?? `countertop-component-${slab.id.replace(/^countertop-/, "")}`,
    outline: slab.outline ?? slab.polygon,
    supportRunIds: slab.supportRunIds ?? [slab.id],
    supportWalls: slab.supportWalls ?? (slab.wall ? [slab.wall] : []),
    holes: slab.holes ?? holeFromLegacy(slab),
    joints: slab.joints ?? []
  }));
  return [...components, ...polygons].sort((a, b) => a.id.localeCompare(b.id));
}

// ../../apps/web/src/lib/layout/countertop-support.ts
function withApplianceOpeningSupports(cabinets, openings) {
  return [...cabinets, ...openings.map((opening) => ({
    id: opening.id,
    spec: {
      id: "APPLIANCE-OPENING",
      name: "Dishwasher opening",
      type: "base",
      width: opening.width,
      height: opening.height,
      depth: opening.depth
    },
    position: opening.position,
    rotation: opening.rotation,
    wall: opening.wall,
    panels: []
  }))];
}
function subtractRect(rect, exclusion) {
  const minX = Math.max(rect.minX, exclusion.minX);
  const maxX = Math.min(rect.maxX, exclusion.maxX);
  const minZ = Math.max(rect.minZ, exclusion.minZ);
  const maxZ = Math.min(rect.maxZ, exclusion.maxZ);
  if (maxX - minX <= 0.001 || maxZ - minZ <= 0.001)
    return [rect];
  return [
    { ...rect, maxZ: minZ },
    { ...rect, minZ: maxZ },
    { ...rect, maxX: minX, minZ, maxZ },
    { ...rect, minX: maxX, minZ, maxZ }
  ].filter((piece) => piece.maxX - piece.minX > 0.001 && piece.maxZ - piece.minZ > 0.001);
}
function excludeCountertopSupport(rects, exclusions) {
  return exclusions.reduce((remaining, exclusion) => remaining.flatMap((rect) => subtractRect(rect, exclusion)), rects);
}

// ../../apps/web/src/lib/layout/countertops.ts
function getCabinetBounds(cab) {
  const { x, z } = cab.position;
  const w = cab.spec.width;
  const d = cab.spec.depth;
  const rot = cab.rotation;
  if (rot === 0) {
    return { minX: x, maxX: x + w, minZ: z, maxZ: z + d };
  } else if (rot === 90) {
    return { minX: x, maxX: x + d, minZ: z - w, maxZ: z };
  } else if (rot === 180) {
    return { minX: x - w, maxX: x, minZ: z - d, maxZ: z };
  } else {
    return { minX: x - d, maxX: x, minZ: z, maxZ: z + w };
  }
}
function getFridgeBounds(fridge) {
  const { x, z } = fridge.position;
  const isRotated90 = fridge.rotation === 90 || fridge.rotation === 270;
  const worldWidth = isRotated90 ? fridge.depth : fridge.width;
  const worldDepth = isRotated90 ? fridge.width : fridge.depth;
  return {
    minX: x,
    maxX: x + worldWidth,
    minZ: z,
    maxZ: z + worldDepth
  };
}
var INBOARD_THRESHOLD_IN = 30;
var INBOARD_LANE_TOL_IN = 12;
function reachesCountertopPlane(item) {
  return item.position.y <= BASE_CABINET_HEIGHT;
}
function wallBackCoordCab(wall, cab) {
  const b = getCabinetBounds(cab);
  if (wall === "north")
    return b.maxZ;
  if (wall === "south")
    return b.minZ;
  if (wall === "east")
    return b.maxX;
  return b.minX;
}
function wallBackCoordAppliance(wall, appl) {
  const b = getFridgeBounds(appl);
  if (wall === "north")
    return b.maxZ;
  if (wall === "south")
    return b.minZ;
  if (wall === "east")
    return b.maxX;
  return b.minX;
}
function inboardDistance(wall, wallBack, back) {
  return wall === "north" || wall === "east" ? wallBack - back : back - wallBack;
}
function wallPerpIntervalCab(wall, cab) {
  const b = getCabinetBounds(cab);
  return wall === "north" || wall === "south" ? [b.minZ, b.maxZ] : [b.minX, b.maxX];
}
function wallPerpIntervalAppliance(wall, appl) {
  const b = getFridgeBounds(appl);
  return wall === "north" || wall === "south" ? [b.minZ, b.maxZ] : [b.minX, b.maxX];
}
function cornerIsOnMinSide(wall, filler) {
  const c = filler.corner;
  if (wall === "north" || wall === "south") {
    if (c.includes("west"))
      return true;
    if (c.includes("east"))
      return false;
    return false;
  }
  if (c.includes("south"))
    return true;
  if (c.includes("north"))
    return false;
  return false;
}
function partitionInboard(items, dist) {
  const inboard = [];
  const seated = [];
  for (const it of items) {
    (dist(it) > INBOARD_THRESHOLD_IN ? inboard : seated).push(it);
  }
  return { inboard, seated };
}
function partitionWallInboardRuns(wall, bases, talls, cornerCabs, gapAppliances, sourceFaithful = false) {
  const seatedAll = {
    seatedBases: bases,
    seatedTalls: talls,
    seatedGapAppliances: gapAppliances,
    inboardRuns: []
  };
  const floorBacks = [
    ...[...bases, ...talls, ...cornerCabs].map((c) => wallBackCoordCab(wall, c)),
    ...gapAppliances.map((a) => wallBackCoordAppliance(wall, a))
  ];
  if (floorBacks.length === 0)
    return seatedAll;
  const wallBack = wall === "north" || wall === "east" ? Math.max(...floorBacks) : Math.min(...floorBacks);
  const cabDist = (c) => inboardDistance(wall, wallBack, wallBackCoordCab(wall, c));
  const applDist = (a) => inboardDistance(wall, wallBack, wallBackCoordAppliance(wall, a));
  const { inboard: inboardBases, seated: seatedBases } = partitionInboard(bases, cabDist);
  if (inboardBases.length === 0 && !sourceFaithful)
    return seatedAll;
  const { inboard: inboardTalls, seated: seatedTalls } = partitionInboard(talls, cabDist);
  const { inboard: inboardGapAppliances, seated: seatedGapAppliances } = partitionInboard(gapAppliances, applDist);
  if (inboardBases.length === 0) {
    return { seatedBases, seatedTalls, seatedGapAppliances, inboardRuns: [] };
  }
  const sorted = [...inboardBases].sort((a, b) => wallBackCoordCab(wall, a) - wallBackCoordCab(wall, b));
  const lanes = [];
  let current = [];
  let laneMinBack = Number.POSITIVE_INFINITY;
  let laneMaxBack = Number.NEGATIVE_INFINITY;
  for (const cab of sorted) {
    const back = wallBackCoordCab(wall, cab);
    const nextMin = Math.min(laneMinBack, back);
    const nextMax = Math.max(laneMaxBack, back);
    if (current.length === 0 || nextMax - nextMin <= INBOARD_LANE_TOL_IN) {
      current.push(cab);
      laneMinBack = nextMin;
      laneMaxBack = nextMax;
    } else {
      lanes.push({ bases: current, talls: [], gapAppliances: [] });
      current = [cab];
      laneMinBack = back;
      laneMaxBack = back;
    }
  }
  if (current.length > 0)
    lanes.push({ bases: current, talls: [], gapAppliances: [] });
  for (const run of lanes) {
    let laneLo = Number.POSITIVE_INFINITY;
    let laneHi = Number.NEGATIVE_INFINITY;
    for (const c of run.bases) {
      const [lo, hi] = wallPerpIntervalCab(wall, c);
      laneLo = Math.min(laneLo, lo);
      laneHi = Math.max(laneHi, hi);
    }
    const overlaps = (lo, hi) => hi >= laneLo && lo <= laneHi;
    run.talls = inboardTalls.filter((t) => {
      const [lo, hi] = wallPerpIntervalCab(wall, t);
      return overlaps(lo, hi);
    });
    run.gapAppliances = inboardGapAppliances.filter((a) => {
      const [lo, hi] = wallPerpIntervalAppliance(wall, a);
      return overlaps(lo, hi);
    });
  }
  return { seatedBases, seatedTalls, seatedGapAppliances, inboardRuns: lanes };
}
function generateCountertops(cabinets, cornerFillers, appliances = [], doorGapRanges = [], sourceFaithful = false, applianceOpenings = []) {
  const countertops = [];
  const ct = DEFAULT_COUNTERTOP;
  const sinks = appliances.filter((a) => a.category === "sink");
  const gapAppliances = appliances.filter((a) => a.category === "refrigerator" || a.category === "range");
  const countertopExclusions = gapAppliances.filter(reachesCountertopPlane).map((appliance) => getFridgeBounds(appliance));
  const countertopSupports = withApplianceOpeningSupports(cabinets, applianceOpenings);
  const baseCabinetsByWall = {};
  const cornerCabinets = [];
  countertopSupports.forEach((cab) => {
    const businessType = businessCabinetGeom(cab.spec.type);
    if (businessType === "corner-base") {
      cornerCabinets.push(cab);
      return;
    }
    if ((businessType === "base" || businessType === "sink-base") && cab.wall && cab.wall !== "angled") {
      const wallKey = cab.wall;
      if (!baseCabinetsByWall[wallKey]) {
        baseCabinetsByWall[wallKey] = [];
      }
      baseCabinetsByWall[wallKey].push(cab);
    }
  });
  const cornersByWall = {
    north: [],
    south: [],
    east: [],
    west: []
  };
  cornerFillers.forEach((filler) => {
    if (filler.corner === "north-east") {
      cornersByWall.north.push(filler);
      cornersByWall.east.push(filler);
    } else if (filler.corner === "north-west") {
      cornersByWall.north.push(filler);
      cornersByWall.west.push(filler);
    } else if (filler.corner === "south-east") {
      cornersByWall.south.push(filler);
      cornersByWall.east.push(filler);
    } else if (filler.corner === "south-west") {
      cornersByWall.south.push(filler);
      cornersByWall.west.push(filler);
    } else if (filler.corner === "north-angled") {
      cornersByWall.north.push(filler);
    } else if (filler.corner === "east-angled") {
      cornersByWall.east.push(filler);
    }
  });
  cornerCabinets.forEach((cab) => {
    const bounds = getCabinetBounds(cab);
    const fakeCornerFiller = {
      id: cab.id,
      type: "base",
      width: bounds.maxX - bounds.minX,
      depth: bounds.maxZ - bounds.minZ,
      height: cab.spec.height,
      color: "",
      corner: "north-east",
      position: { x: bounds.minX, y: 0, z: bounds.minZ }
    };
    if (cab.wall === "north") {
      fakeCornerFiller.corner = "north-east";
      cornersByWall.north.push(fakeCornerFiller);
      cornersByWall.east.push(fakeCornerFiller);
    } else if (cab.wall === "west") {
      fakeCornerFiller.corner = "north-west";
      cornersByWall.north.push(fakeCornerFiller);
      cornersByWall.west.push(fakeCornerFiller);
    }
  });
  const createCountertop = (wall, cabs, wallCorners, segmentIndex, gapOnMinSide = false, gapOnMaxSide = false) => {
    if (cabs.length === 0 && wallCorners.length === 0)
      return null;
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    cabs.forEach((cab) => {
      const bounds = getCabinetBounds(cab);
      minX = Math.min(minX, bounds.minX);
      maxX = Math.max(maxX, bounds.maxX);
      minZ = Math.min(minZ, bounds.minZ);
      maxZ = Math.max(maxZ, bounds.maxZ);
    });
    wallCorners.forEach((filler) => {
      if (filler.corner === "north-angled") {
        maxX = Math.max(maxX, filler.position.x + filler.width);
        return;
      }
      if (filler.corner === "east-angled") {
        maxZ = Math.max(maxZ, filler.position.z + filler.depth);
        return;
      }
      if (filler.type !== "base")
        return;
      minX = Math.min(minX, filler.position.x);
      maxX = Math.max(maxX, filler.position.x + filler.width);
      minZ = Math.min(minZ, filler.position.z);
      maxZ = Math.max(maxZ, filler.position.z + filler.depth);
    });
    if (minX === Infinity)
      return null;
    let ctWidth;
    let ctDepth;
    let ctX;
    let ctZ;
    const isRunAlongX = wall === "north" || wall === "south";
    const wallFacesLowCoord = wall === "north" || wall === "east";
    const overhangLeft = gapOnMinSide ? 0 : ct.overhangSide;
    const overhangRight = gapOnMaxSide ? 0 : ct.overhangSide;
    if (isRunAlongX) {
      ctWidth = maxX - minX + overhangLeft + overhangRight;
      ctDepth = maxZ - minZ + ct.overhangFront;
      ctX = minX - overhangLeft;
      ctZ = wallFacesLowCoord ? minZ - ct.overhangFront : minZ;
    } else {
      ctWidth = maxX - minX + ct.overhangFront;
      ctDepth = maxZ - minZ + overhangLeft + overhangRight;
      ctZ = minZ - overhangLeft;
      ctX = wallFacesLowCoord ? minX - ct.overhangFront : minX;
    }
    const supportRects = cabs.map((cabinet) => {
      const bounds = getCabinetBounds(cabinet);
      const rect = { ...bounds, ownerId: cabinet.id };
      if (wall === "north")
        rect.minZ -= ct.overhangFront;
      else if (wall === "south")
        rect.maxZ += ct.overhangFront;
      else if (wall === "east")
        rect.minX -= ct.overhangFront;
      else
        rect.maxX += ct.overhangFront;
      const runMin = isRunAlongX ? bounds.minX : bounds.minZ;
      const runMax = isRunAlongX ? bounds.maxX : bounds.maxZ;
      if (Math.abs(runMin - (isRunAlongX ? minX : minZ)) < 0.01) {
        if (isRunAlongX)
          rect.minX -= overhangLeft;
        else
          rect.minZ -= overhangLeft;
      }
      if (Math.abs(runMax - (isRunAlongX ? maxX : maxZ)) < 0.01) {
        if (isRunAlongX)
          rect.maxX += overhangRight;
        else
          rect.maxZ += overhangRight;
      }
      return rect;
    });
    wallCorners.filter((filler) => filler.type === "base").forEach((filler) => {
      const rect = {
        minX: filler.position.x,
        maxX: filler.position.x + filler.width,
        minZ: filler.position.z,
        maxZ: filler.position.z + filler.depth,
        ownerId: filler.id
      };
      if (wall === "north")
        rect.minZ -= ct.overhangFront;
      else if (wall === "south")
        rect.maxZ += ct.overhangFront;
      else if (wall === "east")
        rect.minX -= ct.overhangFront;
      else
        rect.maxX += ct.overhangFront;
      supportRects.push(rect);
    });
    const visibleSupportRects = excludeCountertopSupport(supportRects, countertopExclusions);
    const wallSinks = sinks.filter((s) => s.wall === wall);
    let cutout;
    const holes = [];
    for (const sink of wallSinks) {
      const sinkDims = APPLIANCE_DIMENSIONS.sink;
      const isRotated90 = sink.rotation === 90 || sink.rotation === 270;
      const sinkWorldWidth = isRotated90 ? sinkDims.depth : sinkDims.width;
      const sinkWorldDepth = isRotated90 ? sinkDims.width : sinkDims.depth;
      const sinkCenterX = sink.position.x + sinkWorldWidth / 2;
      const sinkCenterZ = sink.position.z + sinkWorldDepth / 2;
      if (sinkCenterX >= ctX && sinkCenterX <= ctX + ctWidth && sinkCenterZ >= ctZ && sinkCenterZ <= ctZ + ctDepth) {
        const cutoutMargin = 0.5;
        const cutoutWidth = isRotated90 ? sinkDims.depth - cutoutMargin * 2 : sinkDims.width - cutoutMargin * 2;
        const cutoutDepth = isRotated90 ? sinkDims.width - cutoutMargin * 2 : sinkDims.depth - cutoutMargin * 2;
        const nextCutout = {
          x: sinkCenterX - cutoutWidth / 2 - ctX,
          z: sinkCenterZ - cutoutDepth / 2 - ctZ,
          width: cutoutWidth,
          depth: cutoutDepth
        };
        cutout ??= nextCutout;
        const holeMinX = ctX + nextCutout.x;
        const holeMinZ = ctZ + nextCutout.z;
        holes.push({
          id: `${sink.id}-countertop-hole`,
          kind: "sink",
          ownerId: sink.id,
          outline: [
            { x: holeMinX, z: holeMinZ },
            { x: holeMinX, z: holeMinZ + cutoutDepth },
            { x: holeMinX + cutoutWidth, z: holeMinZ + cutoutDepth },
            { x: holeMinX + cutoutWidth, z: holeMinZ }
          ]
        });
      }
    }
    return {
      id: `countertop-${wall}-${segmentIndex}`,
      supportRunIds: [`countertop-run-${wall}-${segmentIndex}`],
      supportCabinetIds: cabs.map((cabinet) => cabinet.id).sort(),
      supportWalls: [wall],
      supportRects: visibleSupportRects,
      width: ctWidth,
      depth: ctDepth,
      thickness: ct.thickness,
      material: ct.material,
      color: ct.color,
      position: {
        x: ctX,
        y: BASE_CABINET_HEIGHT,
        z: ctZ
      },
      rotation: 0,
      wall,
      cutout,
      holes
    };
  };
  const tallCabinetsByWall = {};
  cabinets.forEach((cab) => {
    const businessType = businessCabinetGeom(cab.spec.type);
    if ((businessType === "tall" || businessType === "oven-tall") && cab.wall) {
      if (!tallCabinetsByWall[cab.wall]) {
        tallCabinetsByWall[cab.wall] = [];
      }
      tallCabinetsByWall[cab.wall].push(cab);
    }
  });
  const countertopIndices = new Map;
  const nextCountertopIndex = (wall) => {
    const index = countertopIndices.get(wall) ?? 0;
    countertopIndices.set(wall, index + 1);
    return index;
  };
  const emitRun = (wallKey, cabs, rawWallCorners, wallTallCabs, wallGapAppliances, wallDoorGaps) => {
    if (cabs.length === 0 && rawWallCorners.length === 0)
      return;
    const wall = wallKey;
    const isHorizontalWall = wall === "north" || wall === "south";
    const gapTallCabs = wallTallCabs.filter(reachesCountertopPlane);
    const gapAppliancesAtCounter = wallGapAppliances.filter(reachesCountertopPlane);
    let tallOnMin = false;
    let tallOnMax = false;
    if (gapTallCabs.length > 0) {
      let baseMin = Infinity, baseMax = -Infinity;
      cabs.forEach((cab) => {
        const bounds = getCabinetBounds(cab);
        baseMin = Math.min(baseMin, isHorizontalWall ? bounds.minX : bounds.minZ);
        baseMax = Math.max(baseMax, isHorizontalWall ? bounds.maxX : bounds.maxZ);
      });
      rawWallCorners.forEach((filler) => {
        if (filler.type !== "base")
          return;
        baseMin = Math.min(baseMin, isHorizontalWall ? filler.position.x : filler.position.z);
        baseMax = Math.max(baseMax, isHorizontalWall ? filler.position.x + filler.width : filler.position.z + filler.depth);
      });
      if (Number.isFinite(baseMin) && Number.isFinite(baseMax)) {
        gapTallCabs.forEach((tc) => {
          const tcBounds = getCabinetBounds(tc);
          const tcMin = isHorizontalWall ? tcBounds.minX : tcBounds.minZ;
          const tcMax = isHorizontalWall ? tcBounds.maxX : tcBounds.maxZ;
          if (tcMax <= baseMin + 1)
            tallOnMin = true;
          if (tcMin >= baseMax - 1)
            tallOnMax = true;
        });
      }
    }
    let cornerOnMin = false;
    let cornerOnMax = false;
    {
      const wallCornerFillers = rawWallCorners;
      if (wallCornerFillers.length > 0) {
        let cabMin = Infinity, cabMax = -Infinity;
        cabs.forEach((cab) => {
          const bounds = getCabinetBounds(cab);
          cabMin = Math.min(cabMin, isHorizontalWall ? bounds.minX : bounds.minZ);
          cabMax = Math.max(cabMax, isHorizontalWall ? bounds.maxX : bounds.maxZ);
        });
        const haveCabs = cabs.length > 0;
        const cabCenter = (cabMin + cabMax) / 2;
        wallCornerFillers.forEach((filler) => {
          const fillerCenter = isHorizontalWall ? filler.position.x + filler.width / 2 : filler.position.z + filler.depth / 2;
          const onMinSide = haveCabs ? fillerCenter < cabCenter : cornerIsOnMinSide(wall, filler);
          if (onMinSide) {
            cornerOnMin = true;
          } else {
            cornerOnMax = true;
          }
        });
      }
    }
    const allGaps = [
      ...gapAppliancesAtCounter.map((a) => {
        const bounds = getFridgeBounds(a);
        return {
          min: isHorizontalWall ? bounds.minX : bounds.minZ,
          max: isHorizontalWall ? bounds.maxX : bounds.maxZ
        };
      }),
      ...gapTallCabs.map((cabinet) => {
        const bounds = getCabinetBounds(cabinet);
        return {
          min: isHorizontalWall ? bounds.minX : bounds.minZ,
          max: isHorizontalWall ? bounds.maxX : bounds.maxZ
        };
      }),
      ...wallDoorGaps
    ].sort((a, b) => a.min - b.min);
    if (allGaps.length === 0) {
      const wallCorners = isHorizontalWall ? rawWallCorners : [];
      const countertop = createCountertop(wallKey, cabs, wallCorners, nextCountertopIndex(wallKey), tallOnMin || cornerOnMin, tallOnMax || cornerOnMax);
      if (countertop) {
        countertops.push(countertop);
      }
    } else {
      const gaps = allGaps;
      const segments = Array.from({ length: gaps.length + 1 }, () => []);
      cabs.forEach((cab) => {
        const bounds = getCabinetBounds(cab);
        const cabCenter = isHorizontalWall ? (bounds.minX + bounds.maxX) / 2 : (bounds.minZ + bounds.maxZ) / 2;
        let segmentIdx = -1;
        if (cabCenter < gaps[0].min) {
          segmentIdx = 0;
        } else if (cabCenter > gaps[gaps.length - 1].max) {
          segmentIdx = gaps.length;
        } else {
          for (let i = 0;i < gaps.length - 1; i++) {
            if (cabCenter > gaps[i].max && cabCenter < gaps[i + 1].min) {
              segmentIdx = i + 1;
              break;
            }
          }
        }
        if (segmentIdx >= 0) {
          segments[segmentIdx].push(cab);
        }
      });
      const wallCorners = rawWallCorners;
      const cornerSegments = Array.from({ length: gaps.length + 1 }, () => []);
      wallCorners.forEach((filler) => {
        const fillerCenter = isHorizontalWall ? filler.position.x + filler.width / 2 : filler.position.z + filler.depth / 2;
        let segmentIdx = -1;
        if (fillerCenter < gaps[0].min) {
          segmentIdx = 0;
        } else if (fillerCenter > gaps[gaps.length - 1].max) {
          segmentIdx = gaps.length;
        } else {
          for (let i = 0;i < gaps.length - 1; i++) {
            if (fillerCenter > gaps[i].max && fillerCenter < gaps[i + 1].min) {
              segmentIdx = i + 1;
              break;
            }
          }
        }
        if (segmentIdx >= 0) {
          cornerSegments[segmentIdx].push(filler);
        }
      });
      for (let i = 0;i < segments.length; i++) {
        const gapOnMin = i > 0 || tallOnMin || cornerOnMin;
        const gapOnMax = i < gaps.length || tallOnMax || cornerOnMax;
        const segCorners = isHorizontalWall ? cornerSegments[i] : [];
        const countertop = createCountertop(wallKey, segments[i], segCorners, nextCountertopIndex(wallKey), gapOnMin, gapOnMax);
        if (countertop) {
          countertops.push(countertop);
        }
      }
    }
  };
  Object.entries(baseCabinetsByWall).forEach(([wall, cabs]) => {
    if (cabs.length === 0)
      return;
    const wallKey = wall;
    const wallTallCabs = tallCabinetsByWall[wall] || [];
    const wallGapAppliances = gapAppliances.filter((a) => a.wall === wall);
    const wallDoorGaps = doorGapRanges.filter((d) => d.wall === wall);
    const rawWallCorners = cornersByWall[wallKey] || [];
    const partition = partitionWallInboardRuns(wallKey, cabs, wallTallCabs, cornerCabinets.filter((c) => c.wall === wallKey), wallGapAppliances, sourceFaithful);
    if (partition.inboardRuns.length === 0) {
      emitRun(wallKey, partition.seatedBases, rawWallCorners, partition.seatedTalls, partition.seatedGapAppliances, wallDoorGaps);
      return;
    }
    emitRun(wallKey, partition.seatedBases, rawWallCorners, partition.seatedTalls, partition.seatedGapAppliances, wallDoorGaps);
    for (const run of partition.inboardRuns) {
      emitRun(wallKey, run.bases, [], run.talls, run.gapAppliances, []);
    }
  });
  return buildCountertopComponents(countertops);
}

// ../../apps/web/src/lib/pose-engine/extract.ts
function overlapLength(aStart, aEnd, bStart, bEnd) {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

// ../../apps/web/src/lib/layout/appliance-openings.ts
function legacyApplianceOpeningKind(cabinet) {
  if (cabinet.catalogState !== "render-only")
    return null;
  const name = (cabinet.spec.name ?? "").trim().toLowerCase();
  if (name === "undercounter appliance")
    return "undercounter-appliance";
  if (name === "dishwasher")
    return "dishwasher";
  const code = (cabinet.spec.id ?? "").trim().toUpperCase();
  if (code.startsWith("DHW") || code.startsWith("DW") && !code.startsWith("DWR")) {
    return "dishwasher";
  }
  return null;
}
function migrateLegacyApplianceOpenings(cabinets, existing = []) {
  const openingIds = new Set(existing.map((opening) => opening.id));
  const applianceOpenings = [...existing];
  const retainedCabinets = [];
  const migratedCabinetIds = [];
  for (const cabinet of cabinets) {
    const category = legacyApplianceOpeningKind(cabinet);
    if (!category) {
      retainedCabinets.push(cabinet);
      continue;
    }
    migratedCabinetIds.push(cabinet.id);
    if (!openingIds.has(cabinet.id)) {
      openingIds.add(cabinet.id);
      applianceOpenings.push({
        id: cabinet.id,
        ...cabinet.handle !== undefined ? { sourceId: `dsg:${cabinet.handle}` } : {},
        ...cabinet.sourceSegment !== undefined ? { sourceSegment: cabinet.sourceSegment } : {},
        category,
        width: cabinet.spec.width,
        height: cabinet.spec.height,
        depth: cabinet.spec.depth,
        position: cabinet.position,
        rotation: cabinet.rotation,
        wall: cabinet.wall === "angled" ? null : cabinet.wall
      });
    }
  }
  return { cabinets: retainedCabinets, applianceOpenings, migratedCabinetIds };
}

// ../../apps/web/src/lib/layout/catalog-integrity.ts
var PRODUCT_FIELDS = [
  "canonicalCode",
  "productId",
  "sku",
  "cabinetName",
  "listPriceCents",
  "manufacturerCode",
  "finishCode"
];
function isStructurallyRenderOnlyCabinet(cabinet) {
  return legacyApplianceOpeningKind(cabinet) !== null;
}
function isRenderOnlyCabinet(cabinet) {
  return isStructurallyRenderOnlyCabinet(cabinet);
}
function clearCatalogIdentity(cabinet, catalogState) {
  const safeState = catalogState === "render-only" && !isStructurallyRenderOnlyCabinet(cabinet) ? "unresolved" : catalogState;
  const next = { ...cabinet, catalogState: safeState };
  for (const field of PRODUCT_FIELDS)
    delete next[field];
  return next;
}
function isCatalogProduct(cabinet) {
  return !isRenderOnlyCabinet(cabinet) && cabinet.catalogState === "catalog-product" && !!cabinet.productId && !!cabinet.sku && !!cabinet.canonicalCode && !!cabinet.manufacturerCode && !!cabinet.finishCode;
}
function inspectCatalogIntegrity(cabinets, status) {
  const productCabinets = cabinets.filter(isCatalogProduct);
  const renderOnlyCabinets = cabinets.filter(isRenderOnlyCabinet);
  const invalidCabinets = cabinets.filter((cabinet) => !isCatalogProduct(cabinet) && !isRenderOnlyCabinet(cabinet));
  const unresolvedCodes = Array.from(new Set(invalidCabinets.map((cabinet) => cabinet.spec.id).filter(Boolean))).sort();
  return {
    status,
    productCabinets,
    renderOnlyCabinets,
    invalidCabinets,
    unresolvedCodes,
    isComplete: status === "ready" && invalidCabinets.length === 0
  };
}
function buildCatalogQuoteContext(cabinets) {
  const products = cabinets.filter(isCatalogProduct);
  const invalid = cabinets.some((cabinet) => !isCatalogProduct(cabinet) && !isRenderOnlyCabinet(cabinet));
  if (invalid || products.length === 0)
    return null;
  const manufacturerCode = products[0].manufacturerCode;
  const finishCode = products[0].finishCode;
  if (products.some((cabinet) => cabinet.manufacturerCode !== manufacturerCode || cabinet.finishCode !== finishCode))
    return null;
  const byProduct = new Map;
  for (const cabinet of products) {
    const key = `${cabinet.productId}|${cabinet.sku}|${cabinet.canonicalCode}`;
    const current = byProduct.get(key);
    if (current)
      current.quantity += 1;
    else {
      byProduct.set(key, {
        productId: cabinet.productId,
        sku: cabinet.sku,
        canonicalCode: cabinet.canonicalCode,
        quantity: 1
      });
    }
  }
  return {
    manufacturerCode,
    finishCode,
    items: Array.from(byProduct.values()).sort((a, b) => a.sku.localeCompare(b.sku))
  };
}
var COLLISION_EPSILON = 0.01;
function cabinetTier(cabinet) {
  return cabinet.position.y <= COLLISION_EPSILON ? "floor" : "wall";
}
function verticalRange(cabinet) {
  return { min: cabinet.position.y, max: cabinet.position.y + cabinet.spec.height };
}
function cabinetClearsDoorSwings(config, cabinet) {
  const cabinetVertical = verticalRange(cabinet);
  const roomWidth = config.room.roomWidth ?? config.room.width;
  const roomDepth = config.room.roomDepth ?? config.room.depth;
  return (config.doors ?? []).every((door) => {
    if (overlapLength(cabinetVertical.min, cabinetVertical.max, 0, door.height) <= COLLISION_EPSILON)
      return true;
    const offset = (door.wall === "north" || door.wall === "south" ? door.position.x : door.position.z) - door.width / 2;
    const swing = doorSwingPose({
      wall: door.wall,
      offset,
      width: door.width,
      hingeSide: door.hingeSide,
      swingDirection: door.swingDirection
    }, roomWidth, roomDepth);
    return !convexPolygonsOverlap(cabinetFootprintPolygon(cabinet), swing.sector);
  });
}
function rotatedFootprintPolygon(position, widthIn, depthIn, rotationDeg) {
  const radians = rotationDeg * Math.PI / 180;
  const width = { x: Math.cos(radians) * widthIn, z: -Math.sin(radians) * widthIn };
  const depth = { x: Math.sin(radians) * depthIn, z: Math.cos(radians) * depthIn };
  const origin = { x: position.x, z: position.z };
  return [
    origin,
    { x: origin.x + width.x, z: origin.z + width.z },
    { x: origin.x + width.x + depth.x, z: origin.z + width.z + depth.z },
    { x: origin.x + depth.x, z: origin.z + depth.z }
  ];
}
function cabinetFootprintPolygon(cabinet) {
  return rotatedFootprintPolygon(cabinet.position, cabinet.spec.width, cabinet.spec.depth, cabinet.rotation);
}
function applianceOpeningFootprintPolygon(opening) {
  return rotatedFootprintPolygon(opening.position, opening.width, opening.depth, opening.rotation);
}
function polygonBounds(points) {
  const xs = points.map((point) => point.x);
  const zs = points.map((point) => point.z);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) };
}
function projection2(points, axis) {
  const values = points.map((point) => point.x * axis.x + point.z * axis.z);
  return { min: Math.min(...values), max: Math.max(...values) };
}
function polygonsOverlap(first, second) {
  for (const polygon of [first, second]) {
    for (let index = 0;index < polygon.length; index += 1) {
      const start = polygon[index];
      const end = polygon[(index + 1) % polygon.length];
      const axis = { x: -(end.z - start.z), z: end.x - start.x };
      const length = Math.hypot(axis.x, axis.z);
      const normalized = { x: axis.x / length, z: axis.z / length };
      const a = projection2(first, normalized);
      const b = projection2(second, normalized);
      if (overlapLength(a.min, a.max, b.min, b.max) <= COLLISION_EPSILON)
        return false;
    }
  }
  return true;
}
function cabinetCollision(_config, first, second) {
  const firstPolygon = cabinetFootprintPolygon(first);
  const secondPolygon = cabinetFootprintPolygon(second);
  const a = polygonBounds(firstPolygon);
  const b = polygonBounds(secondPolygon);
  const horizontalOverlapX = overlapLength(a.minX, a.maxX, b.minX, b.maxX);
  const horizontalOverlapZ = overlapLength(a.minZ, a.maxZ, b.minZ, b.maxZ);
  if (!polygonsOverlap(firstPolygon, secondPolygon))
    return null;
  const av = verticalRange(first);
  const bv = verticalRange(second);
  const verticalOverlap = overlapLength(av.min, av.max, bv.min, bv.max);
  const firstTier = cabinetTier(first);
  const secondTier = cabinetTier(second);
  const exactlyOneFloorStanding = firstTier !== secondTier;
  const diagnostic = {
    firstId: first.id,
    secondId: second.id,
    firstWall: first.wall,
    secondWall: second.wall,
    firstTier,
    secondTier,
    horizontalOverlapX,
    horizontalOverlapZ,
    verticalOverlap
  };
  if (verticalOverlap > COLLISION_EPSILON) {
    return {
      ...diagnostic,
      reason: "vertical-volume-overlap"
    };
  }
  if (!exactlyOneFloorStanding) {
    return {
      ...diagnostic,
      reason: "same-tier-overlap"
    };
  }
  return null;
}
function findCabinetCollisions(config) {
  const collisions = [];
  for (let i = 0;i < config.cabinets.length; i += 1) {
    for (let j = i + 1;j < config.cabinets.length; j += 1) {
      const collision = cabinetCollision(config, config.cabinets[i], config.cabinets[j]);
      if (collision)
        collisions.push(collision);
    }
  }
  return collisions;
}
function canPlaceCabinet(config, candidate, ignoreCabinetId) {
  if (!cabinetClearsDoorSwings(config, candidate))
    return false;
  const clearsCabinets = config.cabinets.every((existing) => existing.id === ignoreCabinetId || cabinetCollision(config, candidate, existing) === null);
  if (!clearsCabinets)
    return false;
  const candidateVertical = verticalRange(candidate);
  return (config.applianceOpenings ?? []).every((opening) => {
    if (!polygonsOverlap(cabinetFootprintPolygon(candidate), applianceOpeningFootprintPolygon(opening)))
      return true;
    return overlapLength(candidateVertical.min, candidateVertical.max, opening.position.y, opening.position.y + opening.height) <= COLLISION_EPSILON;
  });
}

// ../../apps/web/src/lib/layout/architectural-segments.ts
var EPSILON2 = 0.001;
function finite(value) {
  return Number.isFinite(value);
}
function architecturalSegmentAxis(segment) {
  const dx = segment.end.x - segment.start.x;
  const dz = segment.end.z - segment.start.z;
  if (Math.abs(dx) > EPSILON2 && Math.abs(dz) <= EPSILON2)
    return "x";
  if (Math.abs(dz) > EPSILON2 && Math.abs(dx) <= EPSILON2)
    return "z";
  return null;
}
function architecturalSegmentLength(segment) {
  return Math.hypot(segment.end.x - segment.start.x, segment.end.z - segment.start.z);
}
function architecturalSegmentPointAt(segment, offset) {
  const length = architecturalSegmentLength(segment);
  if (length <= EPSILON2)
    return { ...segment.start };
  return {
    x: segment.start.x + (segment.end.x - segment.start.x) / length * offset,
    z: segment.start.z + (segment.end.z - segment.start.z) / length * offset
  };
}
function architecturalSegmentProjection(segment) {
  const axis = architecturalSegmentAxis(segment);
  if (!axis)
    throw new Error(`Architectural segment ${segment.id} must be axis-aligned`);
  const length = architecturalSegmentLength(segment);
  const halfThickness = segment.thickness / 2;
  const xMin = axis === "x" ? Math.min(segment.start.x, segment.end.x) : segment.start.x - halfThickness;
  const xMax = axis === "x" ? Math.max(segment.start.x, segment.end.x) : segment.start.x + halfThickness;
  const zMin = axis === "z" ? Math.min(segment.start.z, segment.end.z) : segment.start.z - halfThickness;
  const zMax = axis === "z" ? Math.max(segment.start.z, segment.end.z) : segment.start.z + halfThickness;
  return {
    axis,
    length,
    center: {
      x: (segment.start.x + segment.end.x) / 2,
      y: segment.height / 2,
      z: (segment.start.z + segment.end.z) / 2
    },
    size: {
      width: axis === "x" ? length : segment.thickness,
      height: segment.height,
      depth: axis === "z" ? length : segment.thickness
    },
    footprint: [
      { x: xMin, z: zMin },
      { x: xMax, z: zMin },
      { x: xMax, z: zMax },
      { x: xMin, z: zMax }
    ],
    envelope: { xMin, xMax, yMin: 0, yMax: segment.height, zMin, zMax }
  };
}
function validateArchitecturalSegment(segment, room) {
  const diagnostics = [];
  const axis = architecturalSegmentAxis(segment);
  const length = architecturalSegmentLength(segment);
  if (segment.schemaVersion !== 1)
    diagnostics.push("unsupported-schema-version");
  if (!segment.id.trim())
    diagnostics.push("missing-id");
  if (segment.kind !== "kitchen-living-separator")
    diagnostics.push("unsupported-kind");
  if (!axis || length <= EPSILON2)
    diagnostics.push("not-axis-aligned");
  if (!finite(segment.height) || segment.height <= 0)
    diagnostics.push("invalid-height");
  if (!finite(segment.thickness) || segment.thickness <= 0)
    diagnostics.push("invalid-thickness");
  if (!Number.isInteger(segment.revision) || segment.revision < 1)
    diagnostics.push("invalid-revision");
  if (segment.provenance.source !== "designer-entry")
    diagnostics.push("invalid-provenance");
  if (axis === "x" && segment.kitchenSide !== "north" && segment.kitchenSide !== "south") {
    diagnostics.push("invalid-kitchen-side");
  }
  if (axis === "z" && segment.kitchenSide !== "east" && segment.kitchenSide !== "west") {
    diagnostics.push("invalid-kitchen-side");
  }
  const interval = segment.baseCabinetEligibleInterval;
  if (!finite(interval.startOffset) || !finite(interval.endOffset) || interval.startOffset < 0 || interval.endOffset <= interval.startOffset || interval.endOffset > length + EPSILON2)
    diagnostics.push("invalid-eligible-interval");
  const clearance = segment.circulation.minimumClearance;
  if (!finite(clearance) || clearance < 0)
    diagnostics.push("invalid-circulation-clearance");
  else if (segment.circulation.exposedEnd === "start" && interval.startOffset + EPSILON2 < clearance) {
    diagnostics.push("circulation-clearance-breached");
  } else if (segment.circulation.exposedEnd === "end" && interval.endOffset - EPSILON2 > length - clearance) {
    diagnostics.push("circulation-clearance-breached");
  }
  if (room) {
    for (const point of [segment.start, segment.end]) {
      if (point.x < -EPSILON2 || point.x > room.width + EPSILON2 || point.z < -EPSILON2 || point.z > room.depth + EPSILON2) {
        diagnostics.push("outside-room-envelope");
        break;
      }
    }
    if (segment.height > room.ceilingHeight + EPSILON2)
      diagnostics.push("above-room-ceiling");
  }
  return [...new Set(diagnostics)].sort();
}
function architecturalSegmentWorldInterval(segment) {
  const axis = architecturalSegmentAxis(segment);
  if (!axis)
    return null;
  const start = architecturalSegmentPointAt(segment, segment.baseCabinetEligibleInterval.startOffset);
  const end = architecturalSegmentPointAt(segment, segment.baseCabinetEligibleInterval.endOffset);
  const first = axis === "x" ? start.x : start.z;
  const second = axis === "x" ? end.x : end.z;
  return { axis, min: Math.min(first, second), max: Math.max(first, second) };
}
function architecturalSegmentKitchenFace(segment) {
  const projection3 = architecturalSegmentProjection(segment);
  if (segment.kitchenSide === "north")
    return projection3.envelope.zMax;
  if (segment.kitchenSide === "south")
    return projection3.envelope.zMin;
  if (segment.kitchenSide === "east")
    return projection3.envelope.xMax;
  return projection3.envelope.xMin;
}
function exposedEdge(segment) {
  const axis = architecturalSegmentAxis(segment);
  const point = segment.circulation.exposedEnd === "start" ? segment.start : segment.end;
  if (axis === "x") {
    const low2 = Math.min(segment.start.x, segment.end.x);
    return Math.abs(point.x - low2) <= EPSILON2 ? "west-end" : "east-end";
  }
  const low = Math.min(segment.start.z, segment.end.z);
  return Math.abs(point.z - low) <= EPSILON2 ? "south-end" : "north-end";
}
function cabinetPlacement(axis, side, face, runCoordinate, width) {
  if (axis === "x" && side === "north")
    return { x: runCoordinate, z: face, rotation: 0 };
  if (axis === "x" && side === "south")
    return { x: runCoordinate + width, z: face, rotation: 180 };
  if (axis === "z" && side === "east")
    return { x: face, z: runCoordinate + width, rotation: 90 };
  return { x: face, z: runCoordinate, rotation: 270 };
}
function countertopForCabinets(id, assemblyId, rowId, segment, cabinets) {
  const points = cabinets.flatMap(cabinetFootprintPolygon);
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minZ = Math.min(...points.map((point) => point.z));
  const maxZ = Math.max(...points.map((point) => point.z));
  const overhang = DEFAULT_COUNTERTOP.overhangFront;
  const face = architecturalSegmentKitchenFace(segment);
  let x0 = minX - overhang;
  let x1 = maxX + overhang;
  let z0 = minZ - overhang;
  let z1 = maxZ + overhang;
  if (segment.kitchenSide === "east")
    x0 = face;
  if (segment.kitchenSide === "west")
    x1 = face;
  if (segment.kitchenSide === "north")
    z0 = face;
  if (segment.kitchenSide === "south")
    z1 = face;
  return {
    id,
    assemblyId,
    assemblyRole: "countertop",
    width: x1 - x0,
    depth: z1 - z0,
    thickness: DEFAULT_COUNTERTOP.thickness,
    material: DEFAULT_COUNTERTOP.material,
    color: DEFAULT_COUNTERTOP.color,
    position: { x: x0, y: BASE_CABINET_HEIGHT, z: z0 },
    rotation: 0,
    wall: null,
    supportRunIds: [rowId],
    supportCabinetIds: cabinets.map((cabinet) => cabinet.id)
  };
}
function materializeArchitecturalSegmentPeninsula({
  room,
  segment,
  rng = Math.random,
  allowedSpecIds
}) {
  const diagnostics = validateArchitecturalSegment(segment, room);
  const axis = architecturalSegmentAxis(segment);
  const interval = architecturalSegmentWorldInterval(segment);
  const assemblyId = `${segment.id}-assembly`;
  if (diagnostics.length > 0 || !axis || !interval) {
    return {
      assembly: {
        schemaVersion: 1,
        id: assemblyId,
        kind: "peninsula",
        origin: { x: 0, y: 0, z: 0 },
        rotation: 0,
        footprint: { width: 0, depth: 0 },
        rows: [],
        cabinetIds: [],
        countertopIds: [],
        panelIds: [],
        applianceIds: [],
        cutoutIds: [],
        countertopJunctions: [],
        commercialState: "preview-only",
        unresolvedCommercialMemberIds: [],
        source: "generated",
        lifecycle: "invalid"
      },
      cabinets: [],
      countertops: [],
      diagnostics
    };
  }
  const selected = selectCabinetsForWidth(interval.max - interval.min, "base", rng, allowedSpecIds);
  const selectedWidth = selected.reduce((total, cabinet) => total + cabinet.width, 0);
  const exposedPoint = segment.circulation.exposedEnd === "start" ? segment.start : segment.end;
  const exposedCoordinate = axis === "x" ? exposedPoint.x : exposedPoint.z;
  const exposedAtLow = Math.abs(exposedCoordinate - Math.min(axis === "x" ? segment.start.x : segment.start.z, axis === "x" ? segment.end.x : segment.end.z)) <= EPSILON2;
  let cursor = exposedAtLow ? interval.max - selectedWidth : interval.min;
  const face = architecturalSegmentKitchenFace(segment);
  const cabinets = [];
  for (const [index, selectedCabinet] of selected.entries()) {
    const pose = cabinetPlacement(axis, segment.kitchenSide, face, cursor, selectedCabinet.width);
    const cabinet = resolveCabinet(`${assemblyId}-cabinet-${index}`, {
      specId: selectedCabinet.specId,
      x: pose.x,
      y: 0,
      z: pose.z,
      rotation: pose.rotation,
      wall: null
    });
    if (cabinet) {
      cabinets.push({ ...cabinet, assemblyId, assemblyRole: "cabinet" });
    } else {
      diagnostics.push(`unresolved-cabinet:${selectedCabinet.specId}`);
    }
    cursor += selectedCabinet.width;
  }
  if (cabinets.length === 0 || cabinets.length !== selected.length)
    diagnostics.push("empty-assembly");
  const bounds = cabinets.length > 0 ? cabinets.flatMap(cabinetFootprintPolygon) : [{ x: 0, z: 0 }];
  const minX = Math.min(...bounds.map((point) => point.x));
  const maxX = Math.max(...bounds.map((point) => point.x));
  const minZ = Math.min(...bounds.map((point) => point.z));
  const maxZ = Math.max(...bounds.map((point) => point.z));
  const rowId = `${assemblyId}-row-${segment.kitchenSide}`;
  const row = {
    id: rowId,
    axis,
    side: segment.kitchenSide,
    facingRotation: cabinets[0]?.rotation ?? 0,
    cabinetIds: cabinets.map((cabinet) => cabinet.id),
    occupiedRanges: cabinets.map((cabinet) => {
      const footprint = cabinetFootprintPolygon(cabinet);
      const values = footprint.map((point) => axis === "x" ? point.x : point.z);
      return { min: Math.min(...values), max: Math.max(...values) };
    })
  };
  const countertopId = `${assemblyId}-countertop`;
  const countertops = cabinets.length > 0 ? [countertopForCabinets(countertopId, assemblyId, rowId, segment, cabinets)] : [];
  const eligibleStart = architecturalSegmentPointAt(segment, segment.baseCabinetEligibleInterval.startOffset);
  const eligibleEnd = architecturalSegmentPointAt(segment, segment.baseCabinetEligibleInterval.endOffset);
  const unresolvedCommercialMemberIds = cabinets.filter((cabinet) => cabinet.catalogState !== "catalog-product").map((cabinet) => cabinet.id);
  const invalid = diagnostics.length > 0 || countertops.length !== 1;
  const assembly = {
    schemaVersion: 1,
    id: assemblyId,
    kind: "peninsula",
    origin: { x: minX, y: 0, z: minZ },
    rotation: 0,
    footprint: { width: maxX - minX, depth: maxZ - minZ },
    rows: cabinets.length > 0 ? [row] : [],
    cabinetIds: cabinets.map((cabinet) => cabinet.id),
    countertopIds: countertops.map((countertop) => countertop.id),
    panelIds: [],
    applianceIds: [],
    cutoutIds: [],
    attachment: {
      id: `${assemblyId}-attachment`,
      kind: "architectural-segment",
      architecturalSegmentId: segment.id,
      parentWall: segment.kitchenSide,
      parentRunId: rowId,
      parentCountertopId: countertopId,
      edge: exposedEdge(segment),
      pointOrEdge: [eligibleStart, eligibleEnd]
    },
    countertopJunctions: [],
    commercialState: unresolvedCommercialMemberIds.length === 0 ? "complete" : "preview-only",
    unresolvedCommercialMemberIds,
    source: "generated",
    lifecycle: invalid ? "invalid" : "active"
  };
  return invalid ? { assembly, cabinets: [], countertops: [], diagnostics } : { assembly, cabinets, countertops, diagnostics };
}

// ../../apps/web/src/lib/layout/architectural-segment-assembly-integrity.ts
function architecturalSegmentAttachmentStatus(config, assembly) {
  if (assembly.attachment?.kind !== "architectural-segment")
    return null;
  const segmentId = assembly.attachment.architecturalSegmentId;
  return segmentId && (config.architecturalSegments ?? []).some((segment) => segment.id === segmentId) ? "valid" : "invalid";
}

// ../../apps/web/src/lib/layout/assembly.ts
var EPSILON3 = 0.001;
function normalizeRow(row) {
  const rotation = row.facingRotation === 90 || row.facingRotation === 180 || row.facingRotation === 270 ? row.facingRotation : 0;
  const axis = row.axis === "z" ? "z" : "x";
  const side = row.side === "north" || row.side === "east" || row.side === "west" ? row.side : "south";
  return {
    id: row.id ?? `assembly-row-${side}`,
    axis,
    side,
    facingRotation: rotation,
    cabinetIds: row.cabinetIds ?? [],
    occupiedRanges: (row.occupiedRanges ?? []).map((range) => ({
      min: range.min ?? range.minX ?? 0,
      max: range.max ?? range.maxX ?? 0
    }))
  };
}
function normalizeAssembly(input) {
  const kind = input.kind === "peninsula" ? "peninsula" : "island";
  const panelIds = input.panelIds ?? [];
  return {
    schemaVersion: 1,
    id: input.id,
    kind,
    origin: input.origin ?? { x: 0, y: 0, z: 0 },
    rotation: input.rotation ?? 0,
    footprint: input.footprint ?? { width: 0, depth: 0 },
    rows: (input.rows ?? []).map(normalizeRow),
    cabinetIds: input.cabinetIds ?? [],
    countertopIds: input.countertopIds ?? [],
    panelIds,
    applianceIds: input.applianceIds ?? [],
    cutoutIds: input.cutoutIds ?? [],
    ...input.attachment ? { attachment: input.attachment } : {},
    countertopJunctions: input.countertopJunctions ?? [],
    commercialState: input.commercialState ?? "preview-only",
    unresolvedCommercialMemberIds: input.unresolvedCommercialMemberIds ?? panelIds,
    source: input.source ?? "legacy",
    lifecycle: input.lifecycle ?? "active"
  };
}
function resolvedAssemblies(config) {
  const inputs = config.assemblies ?? config.islandAssemblies ?? [];
  return inputs.map((assembly) => normalizeAssembly(assembly));
}
function removeAssemblyMembers(config, assemblyId) {
  const assembly = resolvedAssemblies(config).find((candidate) => candidate.id === assemblyId);
  if (!assembly)
    return config;
  const cabinetIds = new Set(assembly.cabinetIds);
  const countertopIds = new Set(assembly.countertopIds);
  const panelIds = new Set(assembly.panelIds);
  const applianceIds = new Set(assembly.applianceIds);
  const removedIds = new Set([
    assembly.id,
    ...cabinetIds,
    ...countertopIds,
    ...panelIds,
    ...applianceIds
  ]);
  const seamIds = new Set(assembly.countertopJunctions.map(parentSeamJointId));
  const { islandAssemblies: _legacyAssemblies, ...rest } = config;
  return {
    ...rest,
    cabinets: config.cabinets.filter((member) => !cabinetIds.has(member.id)),
    countertops: config.countertops?.filter((member) => !countertopIds.has(member.id)).map((member) => member.joints?.some((joint) => seamIds.has(joint.id)) ? { ...member, joints: member.joints.filter((joint) => !seamIds.has(joint.id)) } : member),
    islandPanels: config.islandPanels?.filter((member) => !panelIds.has(member.id)),
    appliances: config.appliances?.filter((member) => !applianceIds.has(member.id)),
    assemblies: resolvedAssemblies(config).filter((candidate) => candidate.id !== assemblyId),
    sceneRelationships: config.sceneRelationships?.filter((relationship) => !removedIds.has(relationship.sourceObjectId) && !removedIds.has(relationship.targetObjectId))
  };
}
function parentSeamJointId(junction) {
  return `${junction.id}-parent-seam`;
}
function countertopOutline(countertop) {
  return countertop.outline ?? countertop.polygon ?? [
    { x: countertop.position.x, z: countertop.position.z },
    { x: countertop.position.x + countertop.width, z: countertop.position.z },
    { x: countertop.position.x + countertop.width, z: countertop.position.z + countertop.depth },
    { x: countertop.position.x, z: countertop.position.z + countertop.depth }
  ];
}
function pointOnSegment(point, start, end) {
  const cross = (point.x - start.x) * (end.z - start.z) - (point.z - start.z) * (end.x - start.x);
  const segmentLength = Math.hypot(end.x - start.x, end.z - start.z);
  if (segmentLength <= EPSILON3 || Math.abs(cross) / segmentLength > EPSILON3)
    return false;
  return point.x >= Math.min(start.x, end.x) - EPSILON3 && point.x <= Math.max(start.x, end.x) + EPSILON3 && point.z >= Math.min(start.z, end.z) - EPSILON3 && point.z <= Math.max(start.z, end.z) + EPSILON3;
}
function pointOnCountertopBoundary(point, countertop) {
  const outline = countertopOutline(countertop);
  return outline.some((start, index) => pointOnSegment(point, start, outline[(index + 1) % outline.length]));
}
function junctionFitsCountertops(pointOrEdge, parent, child) {
  return pointOrEdge.length > 0 && pointOrEdge.every((point) => pointOnCountertopBoundary(point, parent) && pointOnCountertopBoundary(point, child));
}
function reconcilePeninsulaAssemblies(config) {
  const assemblies = resolvedAssemblies(config);
  const peninsulas = assemblies.filter((assembly) => assembly.kind === "peninsula");
  if (peninsulas.length === 0)
    return config;
  const { islandAssemblies: _legacyAssemblies, ...rest } = config;
  let next = { ...rest, assemblies };
  for (const sourceAssembly of peninsulas) {
    const assembly = resolvedAssemblies(next).find((candidate) => candidate.id === sourceAssembly.id);
    if (!assembly)
      continue;
    const memberIds = [
      ...assembly.cabinetIds,
      ...assembly.countertopIds,
      ...assembly.panelIds,
      ...assembly.applianceIds
    ];
    const ownedMembers = new Map([
      ...next.cabinets.map((member) => [member.id, member]),
      ...(next.countertops ?? []).map((member) => [member.id, member]),
      ...(next.islandPanels ?? []).map((member) => [member.id, member]),
      ...(next.appliances ?? []).map((member) => [member.id, member])
    ]);
    const completeOwnership = memberIds.every((id) => ownedMembers.get(id)?.assemblyId === assembly.id);
    if (assembly.lifecycle !== "active" || !assembly.attachment || !completeOwnership) {
      next = removeAssemblyMembers(next, assembly.id);
      continue;
    }
    const segmentStatus = architecturalSegmentAttachmentStatus(next, assembly);
    if (segmentStatus) {
      if (segmentStatus === "invalid")
        next = removeAssemblyMembers(next, assembly.id);
      continue;
    }
    let invalid = assembly.countertopJunctions.length === 0;
    let updatedAttachment = assembly.attachment;
    const updatedJunctions = [];
    let countertops = next.countertops ?? [];
    for (const junction of assembly.countertopJunctions) {
      const child = countertops.find((countertop) => countertop.id === junction.assemblyCountertopId && countertop.assemblyId === assembly.id);
      if (!child) {
        invalid = true;
        break;
      }
      const viableParents = countertops.filter((countertop) => !countertop.assemblyId).filter((countertop) => countertop.supportWalls?.includes(assembly.attachment.parentWall)).filter((countertop) => junctionFitsCountertops(junction.pointOrEdge, countertop, child));
      const exactParents = viableParents.filter((countertop) => countertop.id === junction.parentCountertopId || countertop.id === assembly.attachment.parentCountertopId);
      const runParents = viableParents.filter((countertop) => countertop.supportRunIds?.includes(junction.parentRunId) || countertop.supportRunIds?.includes(assembly.attachment.parentRunId));
      const candidates = exactParents.length > 0 ? exactParents : runParents.length > 0 ? runParents : viableParents;
      if (candidates.length !== 1) {
        invalid = true;
        break;
      }
      const parent = candidates[0];
      const parentRunId = parent.supportRunIds?.includes(junction.parentRunId) ? junction.parentRunId : parent.supportRunIds?.[0];
      const childRunId = child.supportRunIds?.[0] ?? assembly.rows[0]?.id;
      if (!parentRunId || !childRunId) {
        invalid = true;
        break;
      }
      const updatedJunction = {
        ...junction,
        parentCountertopId: parent.id,
        parentRunId,
        pointOrEdge: junction.pointOrEdge.map((point) => ({ ...point }))
      };
      const seam = {
        id: parentSeamJointId(updatedJunction),
        kind: "intentional-seam",
        runIds: [parentRunId, childRunId],
        pointOrEdge: updatedJunction.pointOrEdge.map((point) => ({ ...point }))
      };
      countertops = countertops.map((countertop) => {
        const withoutStaleSeam = (countertop.joints ?? []).filter((joint) => joint.id !== seam.id);
        return countertop.id === parent.id ? { ...countertop, joints: [...withoutStaleSeam, seam].sort((a, b) => a.id.localeCompare(b.id)) } : withoutStaleSeam.length !== (countertop.joints ?? []).length ? { ...countertop, joints: withoutStaleSeam } : countertop;
      });
      updatedAttachment = {
        ...updatedAttachment,
        parentCountertopId: parent.id,
        parentRunId,
        pointOrEdge: updatedJunction.pointOrEdge.map((point) => ({ ...point }))
      };
      updatedJunctions.push(updatedJunction);
    }
    if (invalid) {
      next = removeAssemblyMembers({ ...next, countertops }, assembly.id);
      continue;
    }
    next = {
      ...next,
      countertops,
      assemblies: resolvedAssemblies(next).map((candidate) => candidate.id === assembly.id ? { ...candidate, attachment: updatedAttachment, countertopJunctions: updatedJunctions } : candidate)
    };
  }
  return next;
}

// ../../apps/web/src/lib/layout/island.ts
function getDoorSwingBoundingBox(door, roomWidth, roomDepth) {
  return { ...doorSwingPose(door, roomWidth, roomDepth).bounds, wall: door.wall };
}
function calculateIslandZone(room, activeWalls, w) {
  const { width, depth } = room;
  const hasNorthCabinets = activeWalls.has("north");
  const hasSouthCabinets = activeWalls.has("south");
  const hasEastCabinets = activeWalls.has("east");
  const hasWestCabinets = activeWalls.has("west");
  const northEdge = hasNorthCabinets ? depth - BASE_CABINET_DEPTH : depth;
  const southEdge = hasSouthCabinets ? BASE_CABINET_DEPTH : 0;
  const eastEdge = hasEastCabinets ? width - BASE_CABINET_DEPTH : width;
  const westEdge = hasWestCabinets ? BASE_CABINET_DEPTH : 0;
  let minX = 0;
  let maxX = width;
  let minZ = 0;
  let maxZ = depth;
  if (hasNorthCabinets) {
    maxZ = northEdge - w.minIslandClearance;
  } else {
    maxZ = northEdge - w.minIslandClearanceEmptyWall;
  }
  if (hasSouthCabinets) {
    minZ = southEdge + w.minIslandClearance;
  } else {
    minZ = southEdge + w.minIslandClearanceEmptyWall;
  }
  if (hasEastCabinets) {
    maxX = eastEdge - w.minIslandClearance;
  } else {
    maxX = eastEdge - w.minIslandClearanceEmptyWall;
  }
  if (hasWestCabinets) {
    minX = westEdge + w.minIslandClearance;
  } else {
    minX = westEdge + w.minIslandClearanceEmptyWall;
  }
  const { nw: lRoomNW, nd: lRoomND } = getLRoomNotch(room);
  if (lRoomNW > 0 && lRoomND > 0) {
    maxX = Math.min(maxX, width - lRoomNW - w.minIslandClearance);
    maxZ = Math.min(maxZ, depth - lRoomND - w.minIslandClearance);
  }
  for (const door of room.doors ?? []) {
    const swing = getDoorSwingBoundingBox(door, width, depth);
    switch (swing.wall) {
      case "west":
        minX = Math.max(minX, swing.maxX);
        break;
      case "east":
        maxX = Math.min(maxX, swing.minX);
        break;
      case "south":
        minZ = Math.max(minZ, swing.maxZ);
        break;
      case "north":
        maxZ = Math.min(maxZ, swing.minZ);
        break;
    }
  }
  return {
    minX,
    maxX,
    minZ,
    maxZ,
    availableWidth: maxX - minX,
    availableDepth: maxZ - minZ,
    hasNorthCabinets,
    hasSouthCabinets,
    hasEastCabinets,
    hasWestCabinets,
    northEdge,
    southEdge,
    eastEdge,
    westEdge
  };
}
function calculateIslandDimensions(zone, w, rng = Math.random) {
  if (zone.availableWidth < w.minIslandWidth || zone.availableDepth < w.minIslandDepth) {
    return null;
  }
  const maxAllowedWidth = Math.min(w.maxIslandWidth, zone.availableWidth);
  const maxAllowedDepth = Math.min(w.maxIslandDepth, zone.availableDepth);
  const floorWidthSteps = Math.ceil(maxAllowedWidth * w.islandWidthFloor / 3);
  const maxWidthSteps = Math.floor(maxAllowedWidth / 3);
  const minWidthSteps = Math.max(Math.ceil(w.minIslandWidth / 3), floorWidthSteps);
  const widthSteps = minWidthSteps + Math.floor(rng() * (maxWidthSteps - minWidthSteps + 1));
  const islandWidth = widthSteps * 3;
  const canFitTwoRows = maxAllowedDepth >= w.maxIslandDepth;
  const islandDepth = canFitTwoRows && rng() < w.islandDoubleRowProbability ? w.maxIslandDepth : w.minIslandDepth;
  if (islandWidth > zone.availableWidth || islandDepth > zone.availableDepth) {
    return null;
  }
  return { width: islandWidth, depth: islandDepth };
}
function generateIslandCabinets(islandWidth, islandDepth, centerX, centerZ, rng = Math.random, allowedSpecIds) {
  const placements = [];
  const originX = centerX - islandWidth / 2;
  const originZ = centerZ - islandDepth / 2;
  const numRows = islandDepth > BASE_CABINET_DEPTH ? 2 : 1;
  const rowDepth = islandDepth / numRows;
  for (let row = 0;row < numRows; row++) {
    const rowZ = originZ + row * rowDepth;
    const rotation = row === 0 ? 180 : 0;
    const cabinets = selectCabinetsForWidth(islandWidth, "base", rng, allowedSpecIds);
    let currentX = originX;
    cabinets.forEach((cab) => {
      const x = rotation === 0 ? currentX : currentX + cab.width;
      const z = rotation === 0 ? rowZ : rowZ + rowDepth;
      placements.push({
        specId: cab.specId,
        x,
        y: 0,
        z,
        rotation,
        wall: null
      });
      currentX += cab.width;
    });
  }
  return placements;
}
function generateIslandCountertop(islandWidth, islandDepth, centerX, centerZ) {
  const ct = DEFAULT_COUNTERTOP;
  const ctWidth = islandWidth + ct.overhangFront * 2;
  const ctDepth = islandDepth + ct.overhangFront * 2;
  const ctX = centerX - ctWidth / 2;
  const ctZ = centerZ - ctDepth / 2;
  return {
    id: "countertop-island",
    width: ctWidth,
    depth: ctDepth,
    thickness: ct.thickness,
    material: ct.material,
    color: ct.color,
    position: {
      x: ctX,
      y: BASE_CABINET_HEIGHT,
      z: ctZ
    },
    rotation: 0,
    wall: null
  };
}
function generateIslandPanels(islandWidth, islandDepth, centerX, centerZ) {
  const panels = [];
  const panelThickness = 0.75;
  const panelHeight = BASE_CABINET_HEIGHT;
  const panelColor = "#c4a88a";
  const halfWidth = islandWidth / 2;
  const halfDepth = islandDepth / 2;
  panels.push({
    id: "island-panel-west",
    width: islandDepth,
    height: panelHeight,
    thickness: panelThickness,
    color: panelColor,
    position: {
      x: centerX - halfWidth,
      y: panelHeight / 2,
      z: centerZ
    },
    rotation: 90
  });
  panels.push({
    id: "island-panel-east",
    width: islandDepth,
    height: panelHeight,
    thickness: panelThickness,
    color: panelColor,
    position: {
      x: centerX + halfWidth,
      y: panelHeight / 2,
      z: centerZ
    },
    rotation: 90
  });
  if (islandDepth <= BASE_CABINET_DEPTH) {
    panels.push({
      id: "island-panel-north",
      width: islandWidth,
      height: panelHeight,
      thickness: panelThickness,
      color: panelColor,
      position: {
        x: centerX,
        y: panelHeight / 2,
        z: centerZ + halfDepth
      },
      rotation: 0
    });
  }
  return panels;
}
function subtractRanges(sources, covers) {
  return sources.flatMap((source) => {
    let remaining = [source];
    for (const cover of covers) {
      remaining = remaining.flatMap((range) => {
        if (cover.maxX <= range.minX || cover.minX >= range.maxX)
          return [range];
        return [
          ...cover.minX > range.minX ? [{ minX: range.minX, maxX: Math.min(cover.minX, range.maxX) }] : [],
          ...cover.maxX < range.maxX ? [{ minX: Math.max(cover.maxX, range.minX), maxX: range.maxX }] : []
        ];
      });
    }
    return remaining.filter((range) => range.maxX - range.minX > 0.01);
  });
}
function generateIslandPanelsFromRows(islandWidth, islandDepth, centerX, centerZ, rows) {
  const panels = generateIslandPanels(islandWidth, islandDepth, centerX, centerZ).filter((panel) => !panel.id.endsWith("-north"));
  const south = (rows.find((row) => row.side === "south")?.occupiedRanges ?? []).map((range) => ({ minX: range.min, maxX: range.max }));
  const north = (rows.find((row) => row.side === "north")?.occupiedRanges ?? []).map((range) => ({ minX: range.min, maxX: range.max }));
  const exposed = subtractRanges(south, north);
  const panelHeight = BASE_CABINET_HEIGHT;
  const panelZ = north.length > 0 ? centerZ : centerZ + islandDepth / 2;
  for (const [index, range] of exposed.entries()) {
    panels.push({
      id: exposed.length === 1 && Math.abs(range.maxX - range.minX - islandWidth) < 0.01 ? "island-panel-north" : `island-panel-north-${index}`,
      width: range.maxX - range.minX,
      height: panelHeight,
      thickness: 0.75,
      color: "#c4a88a",
      position: { x: (range.minX + range.maxX) / 2, y: panelHeight / 2, z: panelZ },
      rotation: 0
    });
  }
  return panels;
}
function cabinetRange(cabinet) {
  const minX = cabinet.rotation === 180 ? cabinet.position.x - cabinet.spec.width : cabinet.position.x;
  const minZ = cabinet.rotation === 180 ? cabinet.position.z - cabinet.spec.depth : cabinet.position.z;
  return { minX, maxX: minX + cabinet.spec.width, minZ, maxZ: minZ + cabinet.spec.depth };
}
function materializeIslandAssembly({
  id = "island-assembly",
  width,
  depth,
  centerX,
  centerZ,
  rng = Math.random,
  allowedSpecIds
}) {
  const diagnostics = [];
  const placements = generateIslandCabinets(width, depth, centerX, centerZ, rng, allowedSpecIds);
  const cabinets = [];
  placements.forEach((placement, index) => {
    const memberId = `${id}-cabinet-${index}`;
    const resolved = resolveCabinet(memberId, placement);
    if (!resolved) {
      diagnostics.push({ code: "unresolved-cabinet", assemblyId: id, memberId });
      return;
    }
    cabinets.push({ ...resolved, assemblyId: id, assemblyRole: "cabinet" });
  });
  const originX = centerX - width / 2;
  const originZ = centerZ - depth / 2;
  for (const cabinet of cabinets) {
    const { minX, maxX } = cabinetRange(cabinet);
    if (minX < originX - 0.01 || maxX > originX + width + 0.01) {
      diagnostics.push({ code: "member-outside-footprint", assemblyId: id, memberId: cabinet.id });
    }
  }
  if (cabinets.length === 0)
    diagnostics.push({ code: "empty-assembly", assemblyId: id });
  const rows = [180, 0].flatMap((rotation) => {
    const members = cabinets.filter((cabinet) => cabinet.rotation === rotation);
    if (members.length === 0)
      return [];
    return [{
      id: `${id}-row-${rotation === 180 ? "south" : "north"}`,
      axis: "x",
      side: rotation === 180 ? "south" : "north",
      facingRotation: rotation,
      cabinetIds: members.map((cabinet) => cabinet.id),
      occupiedRanges: members.map((cabinet) => {
        const minX = cabinet.rotation === 180 ? cabinet.position.x - cabinet.spec.width : cabinet.position.x;
        return { min: minX, max: minX + cabinet.spec.width };
      })
    }];
  });
  const countertop = {
    ...generateIslandCountertop(width, depth, centerX, centerZ),
    id: `${id}-countertop`,
    assemblyId: id,
    assemblyRole: "countertop"
  };
  const panels = generateIslandPanelsFromRows(width, depth, centerX, centerZ, rows).map((panel) => ({
    ...panel,
    id: panel.id.replace("island-", `${id}-`),
    assemblyId: id,
    assemblyRole: panel.id.endsWith("-west") ? "end-panel-west" : panel.id.endsWith("-east") ? "end-panel-east" : "finished-back",
    catalogState: "render-only"
  }));
  const invalid = diagnostics.length > 0 || cabinets.length !== placements.length;
  const assembly = {
    schemaVersion: 1,
    id,
    kind: "island",
    origin: { x: originX, y: 0, z: originZ },
    rotation: 0,
    footprint: { width, depth },
    rows,
    cabinetIds: cabinets.map((cabinet) => cabinet.id),
    countertopIds: [countertop.id],
    panelIds: panels.map((panel) => panel.id),
    applianceIds: [],
    cutoutIds: [],
    countertopJunctions: [],
    commercialState: "preview-only",
    unresolvedCommercialMemberIds: panels.map((panel) => panel.id),
    source: "generated",
    lifecycle: invalid ? "invalid" : "active"
  };
  if (invalid)
    return { assembly, cabinets: [], countertops: [], panels: [], diagnostics };
  return { assembly, cabinets, countertops: [countertop], panels, diagnostics };
}

// ../../apps/web/src/lib/layout/peninsula.ts
var import_polygon_clipping2 = __toESM(require_polygon_clipping_umd(), 1);
var { difference, intersection } = import_polygon_clipping2.default;
var EPSILON4 = 0.001;
function pickLength(available, w, rng) {
  const maxLen = Math.min(w.maxPeninsulaLength, available);
  const steps = Math.floor((maxLen - w.minPeninsulaLength) / 3);
  return w.minPeninsulaLength + Math.floor(rng() * (steps + 1)) * 3;
}
function calculatePeninsulaFeasibility(room, activeWalls, reservations, w, rng = Math.random) {
  const { width, depth } = room;
  const hasNorth = activeWalls.has("north");
  const hasSouth = activeWalls.has("south");
  const hasEast = activeWalls.has("east");
  const hasWest = activeWalls.has("west");
  const backClearance = w.minIslandClearance;
  const southAvail = depth - BASE_CABINET_DEPTH - (hasSouth ? BASE_CABINET_DEPTH : 0) - w.minIslandClearance;
  const westAvail = width - BASE_CABINET_DEPTH - (hasWest ? BASE_CABINET_DEPTH : 0) - w.minIslandClearance;
  const eastBackAvail = width - BASE_CABINET_DEPTH - (hasWest ? BASE_CABINET_DEPTH : 0);
  const westBackAvail = width - BASE_CABINET_DEPTH - (hasEast ? BASE_CABINET_DEPTH : 0);
  const southBackAvail = depth - BASE_CABINET_DEPTH - (hasNorth ? BASE_CABINET_DEPTH : 0);
  const viable = [];
  const attachBlocked = (wall, attachStart, attachEnd) => reservations.some((r) => r.wall === wall && r.offset < attachEnd && r.offset + r.width > attachStart);
  if (hasNorth && !hasEast && southAvail >= w.minPeninsulaLength && eastBackAvail >= backClearance) {
    const northWallLen = width - (hasWest ? BASE_CABINET_DEPTH : 0);
    const attachStart = northWallLen - backClearance - BASE_CABINET_DEPTH;
    const attachEnd = northWallLen - backClearance;
    if (!attachBlocked("north", attachStart, attachEnd))
      viable.push({ type: "one-wall-east", peninsulaLength: pickLength(southAvail, w, rng), backClearance });
  }
  if (hasNorth && !hasWest && southAvail >= w.minPeninsulaLength && westBackAvail >= backClearance) {
    const attachStart = backClearance;
    const attachEnd = backClearance + BASE_CABINET_DEPTH;
    if (!attachBlocked("north", attachStart, attachEnd))
      viable.push({ type: "one-wall-west", peninsulaLength: pickLength(southAvail, w, rng), backClearance });
  }
  if (hasEast && !hasSouth && westAvail >= w.minPeninsulaLength && southBackAvail >= backClearance) {
    const attachStart = backClearance;
    const attachEnd = backClearance + BASE_CABINET_DEPTH;
    if (!attachBlocked("east", attachStart, attachEnd))
      viable.push({ type: "l-shape-south", peninsulaLength: pickLength(westAvail, w, rng), backClearance });
  }
  const doorSwings = (room.doors ?? []).map((d) => getDoorSwingBoundingBox(d, width, depth));
  const filtered = viable.filter((def) => {
    let pMinX, pMaxX, pMinZ, pMaxZ;
    if (def.type === "one-wall-east") {
      pMinX = width - def.backClearance - BASE_CABINET_DEPTH;
      pMaxX = width - def.backClearance;
      pMinZ = depth - BASE_CABINET_DEPTH - def.peninsulaLength;
      pMaxZ = depth - BASE_CABINET_DEPTH;
    } else if (def.type === "one-wall-west") {
      pMinX = def.backClearance;
      pMaxX = def.backClearance + BASE_CABINET_DEPTH;
      pMinZ = depth - BASE_CABINET_DEPTH - def.peninsulaLength;
      pMaxZ = depth - BASE_CABINET_DEPTH;
    } else {
      pMinX = width - BASE_CABINET_DEPTH - def.peninsulaLength;
      pMaxX = width - BASE_CABINET_DEPTH;
      pMinZ = def.backClearance;
      pMaxZ = def.backClearance + BASE_CABINET_DEPTH;
    }
    return !doorSwings.some((s) => pMinX < s.maxX && pMaxX > s.minX && pMinZ < s.maxZ && pMaxZ > s.minZ);
  });
  if (filtered.length === 0)
    return null;
  return filtered[Math.floor(rng() * filtered.length)] ?? null;
}
function getPeninsulaBackClearanceReservation(def, room, activeWalls) {
  const { backClearance } = def;
  const hasWest = activeWalls.has("west");
  if (def.type === "one-wall-east") {
    const wallLength = room.width - (hasWest ? BASE_CABINET_DEPTH : 0);
    return {
      category: "peninsula-clearance",
      wall: "north",
      offset: wallLength - backClearance,
      width: backClearance,
      blocksBaseCabinets: true,
      blocksWallCabinets: true
    };
  } else if (def.type === "one-wall-west") {
    return {
      category: "peninsula-clearance",
      wall: "north",
      offset: 0,
      width: backClearance,
      blocksBaseCabinets: true,
      blocksWallCabinets: true
    };
  } else {
    return {
      category: "peninsula-clearance",
      wall: "east",
      offset: 0,
      width: backClearance,
      blocksBaseCabinets: true,
      blocksWallCabinets: true
    };
  }
}
function getPeninsulaGeometry(type, def, room) {
  const { peninsulaLength: len, backClearance: bc } = def;
  const { width, depth } = room;
  const D = BASE_CABINET_DEPTH;
  const ov = DEFAULT_COUNTERTOP.overhangFront;
  if (type === "one-wall-east") {
    const centerX = width - bc - D / 2;
    const centerZ = depth - D - len / 2;
    return {
      cabRotation: 270,
      runAxis: "z",
      fixedCoord: width - bc,
      runStart: depth - D - len,
      stepSign: 1,
      ctWidth: D + ov,
      ctDepth: len + ov,
      ctX: width - bc - D - ov,
      ctZ: depth - D - len - ov,
      centerX,
      centerZ,
      panels: [
        { id: "peninsula-panel-west", panelWidth: len, rotation: 90, dx: -D / 2, dz: 0 },
        { id: "peninsula-panel-east", panelWidth: len, rotation: 90, dx: +D / 2, dz: 0 },
        { id: "peninsula-panel-south", panelWidth: D, rotation: 0, dx: 0, dz: -len / 2 }
      ]
    };
  } else if (type === "one-wall-west") {
    const centerX = bc + D / 2;
    const centerZ = depth - D - len / 2;
    return {
      cabRotation: 90,
      runAxis: "z",
      fixedCoord: bc,
      runStart: depth - D,
      stepSign: -1,
      ctWidth: D + ov,
      ctDepth: len + ov,
      ctX: bc,
      ctZ: depth - D - len - ov,
      centerX,
      centerZ,
      panels: [
        { id: "peninsula-panel-east", panelWidth: len, rotation: 90, dx: +D / 2, dz: 0 },
        { id: "peninsula-panel-west", panelWidth: len, rotation: 90, dx: -D / 2, dz: 0 },
        { id: "peninsula-panel-south", panelWidth: D, rotation: 0, dx: 0, dz: -len / 2 }
      ]
    };
  } else {
    const centerX = width - D - len / 2;
    const centerZ = bc + D / 2;
    return {
      cabRotation: 0,
      runAxis: "x",
      fixedCoord: bc,
      runStart: width - D - len,
      stepSign: 1,
      ctWidth: len + ov,
      ctDepth: D + ov,
      ctX: width - D - len - ov,
      ctZ: bc,
      centerX,
      centerZ,
      panels: [
        { id: "peninsula-panel-north", panelWidth: len, rotation: 0, dx: 0, dz: +D / 2 },
        { id: "peninsula-panel-south", panelWidth: len, rotation: 0, dx: 0, dz: -D / 2 },
        { id: "peninsula-panel-west", panelWidth: D, rotation: 90, dx: -len / 2, dz: 0 }
      ]
    };
  }
}
function generatePeninsulaPlacement(room, def, rng = Math.random, allowedSpecIds) {
  const geo = getPeninsulaGeometry(def.type, def, room);
  const cabs = selectCabinetsForWidth(def.peninsulaLength, "base", rng, allowedSpecIds);
  const placements = [];
  let runOffset = geo.runStart;
  for (const cab of cabs) {
    const x = geo.runAxis === "x" ? runOffset : geo.fixedCoord;
    const z = geo.runAxis === "z" ? runOffset : geo.fixedCoord;
    placements.push({ specId: cab.specId, x, y: 0, z, rotation: geo.cabRotation, wall: null });
    runOffset += geo.stepSign * cab.width;
  }
  return placements;
}
function generatePeninsulaCountertop(room, def) {
  const geo = getPeninsulaGeometry(def.type, def, room);
  const ct = DEFAULT_COUNTERTOP;
  return {
    id: "countertop-peninsula",
    width: geo.ctWidth,
    depth: geo.ctDepth,
    thickness: ct.thickness,
    material: ct.material,
    color: ct.color,
    position: { x: geo.ctX, y: BASE_CABINET_HEIGHT, z: geo.ctZ },
    rotation: 0,
    wall: null
  };
}
function generatePeninsulaIslandPanels(room, def) {
  const geo = getPeninsulaGeometry(def.type, def, room);
  const panelThickness = 0.75;
  const panelHeight = BASE_CABINET_HEIGHT;
  const panelColor = "#c4a88a";
  return geo.panels.map(({ id, panelWidth, rotation, dx, dz }) => ({
    id,
    width: panelWidth,
    height: panelHeight,
    thickness: panelThickness,
    color: panelColor,
    position: { x: geo.centerX + dx, y: panelHeight / 2, z: geo.centerZ + dz },
    rotation
  }));
}
function closedRing(points) {
  const ring = points.map((point) => [point.x, point.z]);
  if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
    ring.push([...ring[0]]);
  }
  return ring;
}
function countertopPoints(countertop) {
  return countertop.outline ?? countertop.polygon ?? [
    { x: countertop.position.x, z: countertop.position.z },
    { x: countertop.position.x + countertop.width, z: countertop.position.z },
    { x: countertop.position.x + countertop.width, z: countertop.position.z + countertop.depth },
    { x: countertop.position.x, z: countertop.position.z + countertop.depth }
  ];
}
function countertopPolygon(countertop) {
  return [closedRing(countertopPoints(countertop))];
}
function signedArea2(points) {
  let area = 0;
  for (let index = 0;index < points.length; index++) {
    const point = points[index];
    const next = points[(index + 1) % points.length];
    area += point.x * next.z - next.x * point.z;
  }
  return area / 2;
}
function polygonArea(polygons) {
  return polygons.reduce((total, polygon) => total + Math.abs(signedArea2(polygon[0].slice(0, -1).map(([x, z]) => ({ x, z })))), 0);
}
function cabinetBounds(cabinet) {
  const footprint = cabinetFootprintPolygon(cabinet);
  return {
    minX: Math.min(...footprint.map((point) => point.x)),
    maxX: Math.max(...footprint.map((point) => point.x)),
    minZ: Math.min(...footprint.map((point) => point.z)),
    maxZ: Math.max(...footprint.map((point) => point.z))
  };
}
function panelRole(panel) {
  if (panel.id.endsWith("-north"))
    return "end-panel-north";
  if (panel.id.endsWith("-south"))
    return "end-panel-south";
  if (panel.id.endsWith("-west"))
    return "end-panel-west";
  if (panel.id.endsWith("-east"))
    return "end-panel-east";
  return "finished-back";
}
function attachmentContract(def) {
  if (def.type === "one-wall-east") {
    return { parentWall: "north", edge: "east-end", rowSide: "west" };
  }
  if (def.type === "one-wall-west") {
    return { parentWall: "north", edge: "west-end", rowSide: "east" };
  }
  return { parentWall: "east", edge: "south-end", rowSide: "south" };
}
function junctionEdge(child, parent, parentWall) {
  const overlap = intersection(countertopPolygon(child), countertopPolygon(parent));
  if (polygonArea(overlap) <= EPSILON4)
    return [];
  const points = overlap.flatMap((polygon) => polygon[0].slice(0, -1).map(([x, z]) => ({ x, z })));
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minZ = Math.min(...points.map((point) => point.z));
  const maxZ = Math.max(...points.map((point) => point.z));
  return parentWall === "north" ? [{ x: minX, z: minZ }, { x: maxX, z: minZ }] : [{ x: minX, z: minZ }, { x: minX, z: maxZ }];
}
function clipCountertopAtJunction(child, parent) {
  const clipped = difference(countertopPolygon(child), countertopPolygon(parent));
  if (clipped.length !== 1 || clipped[0].length !== 1)
    return null;
  let outline = clipped[0][0].slice(0, -1).map(([x, z]) => ({ x, z }));
  if (signedArea2(outline) < 0)
    outline = [...outline].reverse();
  if (outline.length < 3 || Math.abs(signedArea2(outline)) <= EPSILON4)
    return null;
  const minX = Math.min(...outline.map((point) => point.x));
  const maxX = Math.max(...outline.map((point) => point.x));
  const minZ = Math.min(...outline.map((point) => point.z));
  const maxZ = Math.max(...outline.map((point) => point.z));
  return {
    ...child,
    width: maxX - minX,
    depth: maxZ - minZ,
    position: { ...child.position, x: minX, z: minZ },
    polygon: outline,
    outline
  };
}
function materializePeninsulaAssembly({
  id = "peninsula-assembly",
  room,
  def,
  parentCountertops,
  rng = Math.random,
  allowedSpecIds
}) {
  const diagnostics = [];
  const placements = generatePeninsulaPlacement(room, def, rng, allowedSpecIds);
  const cabinets = [];
  placements.forEach((placement, index) => {
    const memberId = `${id}-cabinet-${index}`;
    const resolved = resolveCabinet(memberId, placement);
    if (!resolved) {
      diagnostics.push({ code: "unresolved-cabinet", assemblyId: id, memberId });
      return;
    }
    cabinets.push({ ...resolved, assemblyId: id, assemblyRole: "cabinet" });
  });
  if (cabinets.length === 0)
    diagnostics.push({ code: "empty-assembly", assemblyId: id });
  const rawCountertop = {
    ...generatePeninsulaCountertop(room, def),
    id: `${id}-countertop`,
    assemblyId: id,
    assemblyRole: "countertop",
    supportRunIds: [`${id}-row`],
    supportCabinetIds: cabinets.map((cabinet) => cabinet.id)
  };
  const { parentWall, edge, rowSide } = attachmentContract(def);
  const parentCandidates = parentCountertops.filter((countertop2) => countertop2.supportWalls?.includes(parentWall)).map((countertop2) => ({
    countertop: countertop2,
    overlap: polygonArea(intersection(countertopPolygon(rawCountertop), countertopPolygon(countertop2)))
  })).filter((candidate) => candidate.overlap > EPSILON4).sort((a, b) => b.overlap - a.overlap || a.countertop.id.localeCompare(b.countertop.id));
  const parent = parentCandidates[0]?.countertop;
  if (!parent || parentCandidates.length !== 1) {
    diagnostics.push({ code: "missing-parent-countertop", assemblyId: id, memberId: parent?.id });
  }
  const pointOrEdge = parent ? junctionEdge(rawCountertop, parent, parentWall) : [];
  const countertop = parent ? clipCountertopAtJunction(rawCountertop, parent) : null;
  if (!countertop || pointOrEdge.length === 0) {
    diagnostics.push({ code: "invalid-countertop-junction", assemblyId: id, memberId: rawCountertop.id });
  }
  const panels = generatePeninsulaIslandPanels(room, def).map((panel) => ({
    ...panel,
    id: panel.id.replace(/^peninsula-panel-/, `${id}-panel-`),
    assemblyId: id,
    assemblyRole: panelRole(panel),
    catalogState: "render-only"
  }));
  const bounds = cabinets.map(cabinetBounds);
  const minX = bounds.length ? Math.min(...bounds.map((bound) => bound.minX)) : 0;
  const maxX = bounds.length ? Math.max(...bounds.map((bound) => bound.maxX)) : 0;
  const minZ = bounds.length ? Math.min(...bounds.map((bound) => bound.minZ)) : 0;
  const maxZ = bounds.length ? Math.max(...bounds.map((bound) => bound.maxZ)) : 0;
  const axis = def.type === "l-shape-south" ? "x" : "z";
  const row = {
    id: `${id}-row-${rowSide}`,
    axis,
    side: rowSide,
    facingRotation: placements[0]?.rotation ?? 0,
    cabinetIds: cabinets.map((cabinet) => cabinet.id),
    occupiedRanges: bounds.map((bound) => axis === "x" ? { min: bound.minX, max: bound.maxX } : { min: bound.minZ, max: bound.maxZ })
  };
  if (countertop)
    countertop.supportRunIds = [row.id];
  const unresolvedCommercialMemberIds = [
    ...cabinets.filter((cabinet) => cabinet.catalogState !== "catalog-product").map((cabinet) => cabinet.id),
    ...panels.map((panel) => panel.id)
  ];
  const parentRunId = parent?.supportRunIds?.[0] ?? parent?.id ?? `wall-run-${parentWall}`;
  const invalid = diagnostics.length > 0 || cabinets.length !== placements.length || !parent || !countertop;
  const assembly = {
    schemaVersion: 1,
    id,
    kind: "peninsula",
    origin: { x: minX, y: 0, z: minZ },
    rotation: 0,
    footprint: { width: maxX - minX, depth: maxZ - minZ },
    rows: cabinets.length ? [row] : [],
    cabinetIds: cabinets.map((cabinet) => cabinet.id),
    countertopIds: [rawCountertop.id],
    panelIds: panels.map((panel) => panel.id),
    applianceIds: [],
    cutoutIds: [],
    ...parent ? {
      attachment: {
        id: `${id}-attachment`,
        kind: "parent-run",
        parentWall,
        parentRunId,
        parentCountertopId: parent.id,
        edge,
        pointOrEdge
      }
    } : {},
    countertopJunctions: parent ? [{
      id: `${id}-countertop-junction`,
      kind: "continuous",
      parentCountertopId: parent.id,
      assemblyCountertopId: rawCountertop.id,
      parentRunId,
      pointOrEdge
    }] : [],
    commercialState: unresolvedCommercialMemberIds.length === 0 ? "complete" : "preview-only",
    unresolvedCommercialMemberIds,
    source: "generated",
    lifecycle: invalid ? "invalid" : "active"
  };
  if (invalid)
    return { assembly, cabinets: [], countertops: [], panels: [], diagnostics };
  return { assembly, cabinets, countertops: [countertop], panels, diagnostics };
}

// ../../apps/web/src/lib/layout/architectural-segment-generation.ts
function authoredArchitecturalSegment(room) {
  if ((room.architecturalSegments?.length ?? 0) > 1) {
    throw new Error("The authored separator slice supports exactly one architectural segment");
  }
  const segment = room.architecturalSegments?.[0];
  if (!segment)
    return;
  const diagnostics = validateArchitecturalSegment(segment, room);
  if (diagnostics.length > 0) {
    throw new Error(`Invalid authored separator ${segment.id}: ${diagnostics.join(", ")}`);
  }
  return segment;
}
function appendArchitecturalSegmentPeninsula(room, segment, rng, allowedSpecIds, cabinets, countertops, assemblies) {
  if (!segment || room.peninsula === false)
    return;
  const result = materializeArchitecturalSegmentPeninsula({
    room,
    segment,
    rng,
    allowedSpecIds
  });
  if (result.assembly.lifecycle !== "active")
    return;
  cabinets.push(...result.cabinets);
  countertops.push(...result.countertops);
  assemblies.push(result.assembly);
}

// ../../apps/web/src/lib/layout/cover-boards.ts
var BOARD_THICKNESS = 0.75;
var BOARD_COLOR = "#c4a88a";
var FRIDGE_PANEL_WALL_GAP = 0.05;
function findClearanceBoundaryCabs(wallCabs, clearLo, clearHi, isNS) {
  let loCab = null;
  let bestLo = -Infinity;
  let hiCab = null;
  let bestHi = Infinity;
  for (const cab of wallCabs) {
    const bounds = getCabinetBounds(cab);
    const hiEdge = isNS ? bounds.maxX : bounds.maxZ;
    const loEdge = isNS ? bounds.minX : bounds.minZ;
    if (hiEdge <= clearLo + 0.5 && hiEdge > bestLo) {
      bestLo = hiEdge;
      loCab = cab;
    }
    if (loEdge >= clearHi - 0.5 && loEdge < bestHi) {
      bestHi = loEdge;
      hiCab = cab;
    }
  }
  return { loCab, hiCab };
}
function generateUnboundedFridgeCoverBoards(fridgeAppliance) {
  const boards = [];
  const wallCabinetTop = WALL_CABINET_Y + 30;
  const boardHeight = wallCabinetTop;
  const fridgeWidth = fridgeAppliance.width;
  const fridgeDepth = fridgeAppliance.depth;
  const sidePanelWidth = BASE_CABINET_DEPTH;
  const fridgeX = fridgeAppliance.position.x;
  const fridgeZ = fridgeAppliance.position.z;
  const rotation = fridgeAppliance.rotation;
  let fridgeMinX, fridgeMaxX;
  let fridgeMinZ, fridgeMaxZ;
  const isRotated90 = rotation === 90 || rotation === 270;
  const worldWidth = isRotated90 ? fridgeDepth : fridgeWidth;
  const worldDepth = isRotated90 ? fridgeWidth : fridgeDepth;
  fridgeMinX = fridgeX;
  fridgeMaxX = fridgeX + worldWidth;
  fridgeMinZ = fridgeZ;
  fridgeMaxZ = fridgeZ + worldDepth;
  switch (fridgeAppliance.wall) {
    case "north": {
      boards.push({
        id: "fridge-cover-left",
        width: sidePanelWidth,
        height: boardHeight,
        thickness: BOARD_THICKNESS,
        color: BOARD_COLOR,
        position: {
          x: fridgeMinX - BOARD_THICKNESS / 2,
          y: boardHeight / 2,
          z: fridgeMaxZ - FLOOR_APPLIANCE_WALL_OFFSET - FRIDGE_PANEL_WALL_GAP - sidePanelWidth / 2
        },
        rotation: 90,
        side: "left"
      });
      boards.push({
        id: "fridge-cover-right",
        width: sidePanelWidth,
        height: boardHeight,
        thickness: BOARD_THICKNESS,
        color: BOARD_COLOR,
        position: {
          x: fridgeMaxX + BOARD_THICKNESS / 2,
          y: boardHeight / 2,
          z: fridgeMaxZ - FLOOR_APPLIANCE_WALL_OFFSET - FRIDGE_PANEL_WALL_GAP - sidePanelWidth / 2
        },
        rotation: 90,
        side: "right"
      });
      break;
    }
    case "south": {
      boards.push({
        id: "fridge-cover-left",
        width: sidePanelWidth,
        height: boardHeight,
        thickness: BOARD_THICKNESS,
        color: BOARD_COLOR,
        position: {
          x: fridgeMinX - BOARD_THICKNESS / 2,
          y: boardHeight / 2,
          z: fridgeMinZ + FLOOR_APPLIANCE_WALL_OFFSET + FRIDGE_PANEL_WALL_GAP + sidePanelWidth / 2
        },
        rotation: 90,
        side: "left"
      });
      boards.push({
        id: "fridge-cover-right",
        width: sidePanelWidth,
        height: boardHeight,
        thickness: BOARD_THICKNESS,
        color: BOARD_COLOR,
        position: {
          x: fridgeMaxX + BOARD_THICKNESS / 2,
          y: boardHeight / 2,
          z: fridgeMinZ + FLOOR_APPLIANCE_WALL_OFFSET + FRIDGE_PANEL_WALL_GAP + sidePanelWidth / 2
        },
        rotation: 90,
        side: "right"
      });
      break;
    }
    case "east": {
      boards.push({
        id: "fridge-cover-left",
        width: sidePanelWidth,
        height: boardHeight,
        thickness: BOARD_THICKNESS,
        color: BOARD_COLOR,
        position: {
          x: fridgeMaxX - FLOOR_APPLIANCE_WALL_OFFSET - FRIDGE_PANEL_WALL_GAP - sidePanelWidth / 2,
          y: boardHeight / 2,
          z: fridgeMinZ - BOARD_THICKNESS / 2
        },
        rotation: 0,
        side: "left"
      });
      boards.push({
        id: "fridge-cover-right",
        width: sidePanelWidth,
        height: boardHeight,
        thickness: BOARD_THICKNESS,
        color: BOARD_COLOR,
        position: {
          x: fridgeMaxX - FLOOR_APPLIANCE_WALL_OFFSET - FRIDGE_PANEL_WALL_GAP - sidePanelWidth / 2,
          y: boardHeight / 2,
          z: fridgeMaxZ + BOARD_THICKNESS / 2
        },
        rotation: 0,
        side: "right"
      });
      break;
    }
    case "west": {
      boards.push({
        id: "fridge-cover-left",
        width: sidePanelWidth,
        height: boardHeight,
        thickness: BOARD_THICKNESS,
        color: BOARD_COLOR,
        position: {
          x: fridgeMinX + FLOOR_APPLIANCE_WALL_OFFSET + FRIDGE_PANEL_WALL_GAP + sidePanelWidth / 2,
          y: boardHeight / 2,
          z: fridgeMaxZ + BOARD_THICKNESS / 2
        },
        rotation: 0,
        side: "left"
      });
      boards.push({
        id: "fridge-cover-right",
        width: sidePanelWidth,
        height: boardHeight,
        thickness: BOARD_THICKNESS,
        color: BOARD_COLOR,
        position: {
          x: fridgeMinX + FLOOR_APPLIANCE_WALL_OFFSET + FRIDGE_PANEL_WALL_GAP + sidePanelWidth / 2,
          y: boardHeight / 2,
          z: fridgeMinZ - BOARD_THICKNESS / 2
        },
        rotation: 0,
        side: "right"
      });
      break;
    }
  }
  return boards;
}
function fridgeBoardInsideRoom(board, room) {
  const rotated = board.rotation % 180 !== 0;
  const halfX = (rotated ? board.thickness : board.width) / 2;
  const halfZ = (rotated ? board.width : board.thickness) / 2;
  const tolerance = 0.01;
  return board.position.x - halfX >= -tolerance && board.position.x + halfX <= room.width + tolerance && board.position.z - halfZ >= -tolerance && board.position.z + halfZ <= room.depth + tolerance;
}
function generateFridgeCoverBoards(fridgeAppliance, room) {
  return generateUnboundedFridgeCoverBoards(fridgeAppliance).filter((board) => fridgeBoardInsideRoom(board, room));
}
function generateDoorClearanceCoverBoards(cabinets, doors) {
  if (!doors || doors.length === 0)
    return [];
  const boards = [];
  for (const door of doors) {
    const isNS = door.wall === "north" || door.wall === "south";
    const doorCenter = isNS ? door.position.x : door.position.z;
    const clearLo = doorCenter - door.width / 2 - DOOR_CLEARANCE;
    const clearHi = doorCenter + door.width / 2 + DOOR_CLEARANCE;
    const wallCabs = cabinets.filter((c) => c.wall === door.wall && !c.id.includes("island"));
    for (const typeFilter of ["base", "wall"]) {
      const { loCab, hiCab } = findClearanceBoundaryCabs(wallCabs.filter((c) => c.spec.type === typeFilter), clearLo, clearHi, isNS);
      if (loCab)
        boards.push(makeClearancePanel(loCab, door.wall, true, BOARD_THICKNESS, BOARD_COLOR, `door-clearance-${door.id}-lo-${typeFilter}`));
      if (hiCab)
        boards.push(makeClearancePanel(hiCab, door.wall, false, BOARD_THICKNESS, BOARD_COLOR, `door-clearance-${door.id}-hi-${typeFilter}`));
    }
  }
  return boards;
}
function generateWindowClearanceCoverBoards(cabinets, windows) {
  if (!windows || windows.length === 0)
    return [];
  const boards = [];
  for (const win of windows) {
    if (win.wall === "angled")
      continue;
    const isNS = win.wall === "north" || win.wall === "south";
    const winCenter = isNS ? win.position.x : win.position.z;
    const clearLo = winCenter - win.width / 2 - WINDOW_CLEARANCE;
    const clearHi = winCenter + win.width / 2 + WINDOW_CLEARANCE;
    const wallCabs = cabinets.filter((c) => c.wall === win.wall && !c.id.includes("island") && c.spec.type === "wall");
    const { loCab, hiCab } = findClearanceBoundaryCabs(wallCabs, clearLo, clearHi, isNS);
    if (loCab)
      boards.push(makeClearancePanel(loCab, win.wall, true, BOARD_THICKNESS, BOARD_COLOR, `window-clearance-${win.id}-lo-wall`));
    if (hiCab)
      boards.push(makeClearancePanel(hiCab, win.wall, false, BOARD_THICKNESS, BOARD_COLOR, `window-clearance-${win.id}-hi-wall`));
  }
  return boards;
}
function makeClearancePanel(cab, wall, hiSide, thickness, color, id) {
  const bounds = getCabinetBounds(cab);
  const isNS = wall === "north" || wall === "south";
  const panelWidth = cab.spec.depth;
  const panelHeight = cab.spec.height;
  let x, y, z, rotation;
  y = cab.position.y + panelHeight / 2;
  if (isNS) {
    z = (bounds.minZ + bounds.maxZ) / 2;
    x = hiSide ? bounds.maxX + thickness / 2 : bounds.minX - thickness / 2;
    rotation = 90;
  } else {
    x = (bounds.minX + bounds.maxX) / 2;
    z = hiSide ? bounds.maxZ + thickness / 2 : bounds.minZ - thickness / 2;
    rotation = 0;
  }
  return {
    id,
    width: panelWidth,
    height: panelHeight,
    thickness,
    color,
    position: { x, y, z },
    rotation,
    cabinetId: cab.id,
    side: hiSide ? "right" : "left"
  };
}

// ../../apps/web/src/lib/layout/dishwasher-support-panels.ts
var BOARD_THICKNESS2 = 0.75;
var BOARD_COLOR2 = "#c4a88a";
var ADJACENCY_TOLERANCE = 0.5;
function openingBounds(opening) {
  const { x, z } = opening.position;
  if (opening.rotation === 0) {
    return { minX: x, maxX: x + opening.width, minZ: z, maxZ: z + opening.depth };
  }
  if (opening.rotation === 90) {
    return { minX: x, maxX: x + opening.depth, minZ: z - opening.width, maxZ: z };
  }
  if (opening.rotation === 180) {
    return { minX: x - opening.width, maxX: x, minZ: z - opening.depth, maxZ: z };
  }
  return { minX: x - opening.depth, maxX: x, minZ: z, maxZ: z + opening.width };
}
function floorCasework(cabinet) {
  const type = businessCabinetGeom(cabinet.spec.type);
  return [
    "base",
    "sink-base",
    "base-drawer",
    "base-microwave",
    "corner-base",
    "tall",
    "oven-tall"
  ].includes(type);
}
function cabinetTouchesDishwasherOpeningSide(cabinet, opening, side) {
  if (opening.category !== "dishwasher" || cabinet.wall !== opening.wall || !floorCasework(cabinet)) {
    return false;
  }
  const cabinetBounds2 = getCabinetBounds(cabinet);
  const bounds = openingBounds(opening);
  const isNS = opening.wall === "north" || opening.wall === "south";
  const overlapsDepth = isNS ? cabinetBounds2.maxZ >= bounds.minZ - ADJACENCY_TOLERANCE && cabinetBounds2.minZ <= bounds.maxZ + ADJACENCY_TOLERANCE : cabinetBounds2.maxX >= bounds.minX - ADJACENCY_TOLERANCE && cabinetBounds2.minX <= bounds.maxX + ADJACENCY_TOLERANCE;
  if (!overlapsDepth)
    return false;
  const cabinetEdge = isNS ? side === "low" ? cabinetBounds2.maxX : cabinetBounds2.minX : side === "low" ? cabinetBounds2.maxZ : cabinetBounds2.minZ;
  const openingEdge = isNS ? side === "low" ? bounds.minX : bounds.maxX : side === "low" ? bounds.minZ : bounds.maxZ;
  return Math.abs(cabinetEdge - openingEdge) <= ADJACENCY_TOLERANCE;
}
function touchingCabinet(cabinets, opening, side) {
  return cabinets.filter((cabinet) => cabinetTouchesDishwasherOpeningSide(cabinet, opening, side)).sort((first, second) => first.id.localeCompare(second.id))[0];
}
function generateDishwasherSupportPanels(cabinets, applianceOpenings, activeWalls) {
  const boards = [];
  for (const opening of applianceOpenings) {
    if (opening.category !== "dishwasher" || !opening.wall)
      continue;
    const lowCabinet = touchingCabinet(cabinets, opening, "low");
    const highCabinet = touchingCabinet(cabinets, opening, "high");
    const lowWall = opening.wall === "north" || opening.wall === "south" ? "west" : "south";
    const highWall = opening.wall === "north" || opening.wall === "south" ? "east" : "north";
    const bounds = openingBounds(opening);
    const isNS = opening.wall === "north" || opening.wall === "south";
    const add = (side, owner) => {
      if (!owner)
        return;
      boards.push({
        id: `dishwasher-support-${opening.id}-${side}`,
        width: opening.depth,
        height: opening.height,
        thickness: BOARD_THICKNESS2,
        color: BOARD_COLOR2,
        position: {
          x: isNS ? side === "low" ? bounds.minX - BOARD_THICKNESS2 / 2 : bounds.maxX + BOARD_THICKNESS2 / 2 : (bounds.minX + bounds.maxX) / 2,
          y: opening.height / 2,
          z: isNS ? (bounds.minZ + bounds.maxZ) / 2 : side === "low" ? bounds.minZ - BOARD_THICKNESS2 / 2 : bounds.maxZ + BOARD_THICKNESS2 / 2
        },
        rotation: isNS ? 90 : 0,
        cabinetId: owner.id,
        openingId: opening.id,
        purpose: "dishwasher-support",
        side: side === "low" ? "left" : "right"
      });
    };
    if (!lowCabinet && !activeWalls.has(lowWall))
      add("low", highCabinet);
    if (!highCabinet && !activeWalls.has(highWall))
      add("high", lowCabinet);
  }
  return boards;
}

// ../../apps/web/src/lib/layout/end-panel-cover-boards.ts
var BOARD_THICKNESS3 = 0.75;
var BOARD_COLOR3 = "#c4a88a";
var TOE_KICK_HEIGHT4 = 4;
var TOE_KICK_RECESS = 3;
var END_TOUCH_TOLERANCE = 0.5;
function isCardinalWall(wall) {
  return wall === "north" || wall === "south" || wall === "east" || wall === "west";
}
function hasToeKick(cabinet) {
  const geom = businessCabinetGeom(cabinet.spec.type);
  return [
    "base",
    "sink-base",
    "base-drawer",
    "base-microwave",
    "tall",
    "oven-tall"
  ].includes(geom);
}
function occupiesToeKickLane(cabinet) {
  const geom = businessCabinetGeom(cabinet.spec.type);
  return hasToeKick(cabinet) || geom === "corner-base" || geom === "filler";
}
function openingBounds2(opening) {
  const { x, z } = opening.position;
  if (opening.rotation === 0) {
    return { minX: x, maxX: x + opening.width, minZ: z, maxZ: z + opening.depth };
  }
  if (opening.rotation === 90) {
    return { minX: x, maxX: x + opening.depth, minZ: z - opening.width, maxZ: z };
  }
  if (opening.rotation === 180) {
    return { minX: x - opening.width, maxX: x, minZ: z - opening.depth, maxZ: z };
  }
  return { minX: x - opening.depth, maxX: x, minZ: z, maxZ: z + opening.width };
}
function intervalsOverlap(firstMin, firstMax, secondMin, secondMax) {
  return Math.min(firstMax, secondMax) - Math.max(firstMin, secondMin) > END_TOUCH_TOLERANCE;
}
function footprintTouchesRunEnd(candidate, blocker, wall, side) {
  const isNorthSouth = wall === "north" || wall === "south";
  const end = isNorthSouth ? side === "low" ? candidate.minX : candidate.maxX : side === "low" ? candidate.minZ : candidate.maxZ;
  const crossesEnd = isNorthSouth ? blocker.minX <= end + END_TOUCH_TOLERANCE && blocker.maxX >= end - END_TOUCH_TOLERANCE : blocker.minZ <= end + END_TOUCH_TOLERANCE && blocker.maxZ >= end - END_TOUCH_TOLERANCE;
  const overlapsDepth = isNorthSouth ? intervalsOverlap(candidate.minZ, candidate.maxZ, blocker.minZ, blocker.maxZ) : intervalsOverlap(candidate.minX, candidate.maxX, blocker.minX, blocker.maxX);
  return crossesEnd && overlapsDepth;
}
function runEndTouchesRoomWall(bounds, wall, side, room) {
  const isNorthSouth = wall === "north" || wall === "south";
  const end = isNorthSouth ? side === "low" ? bounds.minX : bounds.maxX : side === "low" ? bounds.minZ : bounds.maxZ;
  const runLength = isNorthSouth ? room.width : room.depth;
  return side === "low" ? end <= END_TOUCH_TOLERANCE : end >= runLength - END_TOUCH_TOLERANCE;
}
function createToeKickReturn(cabinet, wall, side) {
  const bounds = getCabinetBounds(cabinet);
  const isNorthSouth = wall === "north" || wall === "south";
  const returnDepth = TOE_KICK_RECESS + BOARD_THICKNESS3 / 2;
  const frontCenter = wall === "north" ? bounds.minZ + returnDepth / 2 : wall === "south" ? bounds.maxZ - returnDepth / 2 : wall === "east" ? bounds.minX + returnDepth / 2 : bounds.maxX - returnDepth / 2;
  return {
    id: `toe-kick-return-${cabinet.id}-${side}`,
    width: returnDepth,
    height: TOE_KICK_HEIGHT4,
    thickness: BOARD_THICKNESS3,
    color: BOARD_COLOR3,
    position: {
      x: isNorthSouth ? side === "low" ? bounds.minX + BOARD_THICKNESS3 / 2 : bounds.maxX - BOARD_THICKNESS3 / 2 : frontCenter,
      y: cabinet.position.y + TOE_KICK_HEIGHT4 / 2,
      z: isNorthSouth ? frontCenter : side === "low" ? bounds.minZ + BOARD_THICKNESS3 / 2 : bounds.maxZ - BOARD_THICKNESS3 / 2
    },
    rotation: isNorthSouth ? 90 : 0,
    cabinetId: cabinet.id,
    purpose: "toe-kick-return",
    side: side === "low" ? "left" : "right"
  };
}
function generateToeKickReturns(cabinets, applianceOpenings, room) {
  const floorBlockers = cabinets.filter((cabinet) => !cabinet.id.includes("island") && isCardinalWall(cabinet.wall) && occupiesToeKickLane(cabinet));
  const returnCabinets = floorBlockers.filter(hasToeKick);
  const returns = [];
  for (const cabinet of returnCabinets) {
    const wall = cabinet.wall;
    const bounds = getCabinetBounds(cabinet);
    for (const side of ["low", "high"]) {
      if (runEndTouchesRoomWall(bounds, wall, side, room))
        continue;
      const blockedByCabinet = floorBlockers.some((other) => other.id !== cabinet.id && footprintTouchesRunEnd(bounds, getCabinetBounds(other), wall, side));
      if (blockedByCabinet)
        continue;
      const blockedByOpening = applianceOpenings.some((opening) => footprintTouchesRunEnd(bounds, openingBounds2(opening), wall, side));
      if (blockedByOpening)
        continue;
      returns.push(createToeKickReturn(cabinet, wall, side));
    }
  }
  return returns.sort((first, second) => first.id.localeCompare(second.id));
}
function generateCabinetRunCoverBoards(cabinets, activeWalls, applianceOpenings, room) {
  return [
    ...generateEndPanelCoverBoards(cabinets, activeWalls, applianceOpenings),
    ...generateToeKickReturns(cabinets, applianceOpenings, room)
  ];
}
function generateEndPanelCoverBoards(cabinets, activeWalls, applianceOpenings = []) {
  const boards = [];
  const cabinetsByWall = new Map;
  for (const cabinet of cabinets) {
    if (!cabinet.wall || cabinet.id.includes("island"))
      continue;
    const wallCabs = cabinetsByWall.get(cabinet.wall) || [];
    wallCabs.push(cabinet);
    cabinetsByWall.set(cabinet.wall, wallCabs);
  }
  const hasNorthWall = activeWalls.has("north");
  const hasSouthWall = activeWalls.has("south");
  const hasEastWall = activeWalls.has("east");
  const hasWestWall = activeWalls.has("west");
  for (const [wall, wallCabinets2] of cabinetsByWall) {
    const baseCabinets2 = wallCabinets2.filter((cabinet) => cabinet.spec.type === "base");
    const wallCabs = wallCabinets2.filter((cabinet) => cabinet.spec.type === "wall");
    if (baseCabinets2.length === 0)
      continue;
    let sortedBase;
    let sortedWall;
    let exposedLeftEnd = false;
    let exposedRightEnd = false;
    switch (wall) {
      case "north":
      case "south":
        sortedBase = [...baseCabinets2].sort((first, second) => first.position.x - second.position.x);
        sortedWall = [...wallCabs].sort((first, second) => first.position.x - second.position.x);
        exposedLeftEnd = !hasWestWall;
        exposedRightEnd = !hasEastWall;
        break;
      case "east":
      case "west":
        sortedBase = [...baseCabinets2].sort((first, second) => first.position.z - second.position.z);
        sortedWall = [...wallCabs].sort((first, second) => first.position.z - second.position.z);
        exposedLeftEnd = !hasSouthWall;
        exposedRightEnd = !hasNorthWall;
        break;
      default:
        continue;
    }
    if (exposedLeftEnd && sortedBase.length > 0) {
      const firstCabinet = sortedBase[0];
      const touchesDishwasher = applianceOpenings.some((opening) => cabinetTouchesDishwasherOpeningSide(firstCabinet, opening, "high"));
      if (firstCabinet.spec.type === "base" && !touchesDishwasher) {
        const panel = createEndPanelForCabinet(firstCabinet, "left", wall);
        if (panel)
          boards.push(panel);
      }
    }
    if (exposedRightEnd && sortedBase.length > 0) {
      const lastCabinet = sortedBase.at(-1);
      const touchesDishwasher = applianceOpenings.some((opening) => cabinetTouchesDishwasherOpeningSide(lastCabinet, opening, "low"));
      if (lastCabinet.spec.type === "base" && !touchesDishwasher) {
        const panel = createEndPanelForCabinet(lastCabinet, "right", wall);
        if (panel)
          boards.push(panel);
      }
    }
    if (exposedLeftEnd && sortedWall.length > 0) {
      const panel = createEndPanelForCabinet(sortedWall[0], "left", wall);
      if (panel)
        boards.push(panel);
    }
    if (exposedRightEnd && sortedWall.length > 0) {
      const panel = createEndPanelForCabinet(sortedWall.at(-1), "right", wall);
      if (panel)
        boards.push(panel);
    }
  }
  return boards;
}
function createEndPanelForCabinet(cabinet, side, wall) {
  const { width, height, depth } = cabinet.spec;
  const { x: cabinetX, y: cabinetY, z: cabinetZ } = cabinet.position;
  let x;
  let y;
  let z;
  let rotation;
  switch (wall) {
    case "north":
      y = cabinetY + height / 2;
      z = cabinetZ - depth / 2;
      rotation = 90;
      x = side === "left" ? cabinetX - width - BOARD_THICKNESS3 / 2 : cabinetX + BOARD_THICKNESS3 / 2;
      break;
    case "south":
      y = cabinetY + height / 2;
      z = cabinetZ + depth / 2;
      rotation = 90;
      x = side === "left" ? cabinetX - BOARD_THICKNESS3 / 2 : cabinetX + width + BOARD_THICKNESS3 / 2;
      break;
    case "east":
      y = cabinetY + height / 2;
      x = cabinetX - depth / 2;
      rotation = 0;
      z = side === "left" ? cabinetZ - BOARD_THICKNESS3 / 2 : cabinetZ + width + BOARD_THICKNESS3 / 2;
      break;
    case "west":
      y = cabinetY + height / 2;
      x = cabinetX + depth / 2;
      rotation = 0;
      z = side === "left" ? cabinetZ - width - BOARD_THICKNESS3 / 2 : cabinetZ + BOARD_THICKNESS3 / 2;
      break;
    default:
      return null;
  }
  return {
    id: `end-panel-${cabinet.id}-${side}`,
    width: depth,
    height,
    thickness: BOARD_THICKNESS3,
    color: BOARD_COLOR3,
    position: { x, y, z },
    rotation,
    cabinetId: cabinet.id,
    side
  };
}
function generateWallCoverBoards(cabinets, applianceOpenings, activeWalls, doors, windows, room) {
  return [
    ...generateCabinetRunCoverBoards(cabinets, activeWalls, applianceOpenings, room),
    ...generateDishwasherSupportPanels(cabinets, applianceOpenings, activeWalls),
    ...generateDoorClearanceCoverBoards(cabinets, doors),
    ...generateWindowClearanceCoverBoards(cabinets, windows)
  ];
}

// ../../apps/web/src/lib/layout/corner-top-band.ts
var CORNER_TOLERANCE = 0.5;
function crownCornersClose(a, b) {
  return Math.abs(a.x - b.x) <= CORNER_TOLERANCE && Math.abs(a.z - b.z) <= CORNER_TOLERANCE;
}
function setCabinetMiter(point, degrees, kind, cabInfos, descriptors, frontSegmentByCabinet) {
  for (const cabinet of cabInfos) {
    const side = crownCornersClose(cabinet.loCorner, point) ? "lo" : crownCornersClose(cabinet.hiCorner, point) ? "hi" : null;
    if (!side)
      continue;
    const index = frontSegmentByCabinet.get(cabinet.id);
    if (index === undefined)
      return false;
    const segment = descriptors[index];
    const loIsStart = cabinet.wall === "south" || cabinet.wall === "east";
    const isStart = side === "lo" === loIsStart;
    if (isStart) {
      segment.miterStartDeg = degrees;
      segment.startKind = kind;
    } else {
      segment.miterEndDeg = degrees;
      segment.endKind = kind;
    }
    return true;
  }
  return false;
}
function transformPoint(cabinet, x, z) {
  const radians = cabinet.rotation * Math.PI / 180;
  return {
    x: cabinet.position.x + x * Math.cos(radians) + z * Math.sin(radians),
    z: cabinet.position.z - x * Math.sin(radians) + z * Math.cos(radians)
  };
}
function transformNormal(cabinet, x, z) {
  const radians = cabinet.rotation * Math.PI / 180;
  return {
    x: x * Math.cos(radians) + z * Math.sin(radians),
    z: -x * Math.sin(radians) + z * Math.cos(radians)
  };
}
function cardinalWall(normal) {
  if (Math.abs(normal.x) > Math.abs(normal.z))
    return normal.x > 0 ? "west" : "east";
  return normal.z > 0 ? "south" : "north";
}
function segmentBetween(ownerId, role, topY, first, second, normal, wall) {
  const rotation = (Math.atan2(normal.x, normal.z) * 180 / Math.PI + 360) % 360;
  const axis = { x: Math.cos(rotation * Math.PI / 180), z: -Math.sin(rotation * Math.PI / 180) };
  const forward = (second.x - first.x) * axis.x + (second.z - first.z) * axis.z >= 0;
  const start = forward ? first : second;
  const end = forward ? second : first;
  return {
    ownerId,
    role,
    topY,
    length: Math.hypot(second.x - first.x, second.z - first.z),
    faceX: (first.x + second.x) / 2,
    faceZ: (first.z + second.z) / 2,
    outNormalX: normal.x,
    outNormalZ: normal.z,
    rotation,
    wall,
    miterStartDeg: 0,
    miterEndDeg: 0,
    runId: `top-band-corner-${ownerId}`,
    startKind: "open",
    endKind: "open",
    start,
    end
  };
}
function setPointMiter(segment, point, degrees, kind) {
  if (crownCornersClose(segment.start, point)) {
    segment.miterStartDeg = degrees;
    segment.startKind = kind;
  } else {
    segment.miterEndDeg = degrees;
    segment.endKind = kind;
  }
}
function appendCatalogCorners(cabinets, cabInfos, descriptors, frontSegmentByCabinet) {
  for (const cabinet of cabinets.filter((item) => item.spec.type === "corner-wall")) {
    const width = cabinet.spec.width;
    const depth = Math.min(cabinet.spec.depth, width - 12);
    const first = transformPoint(cabinet, width, depth);
    const pivot = transformPoint(cabinet, depth, depth);
    const last = transformPoint(cabinet, depth, width);
    const topY = cabinet.position.y + cabinet.spec.height;
    const cabinetType = parseCanonicalCode(cabinet.spec.id)?.cabinetType ?? cabinet.spec.id;
    const blind = isBlindCorner(cabinetType);
    if (blind) {
      const frontNormal = transformNormal(cabinet, 0, 1);
      const returnNormal = transformNormal(cabinet, 1, 0);
      const front = segmentBetween(cabinet.id, "corner-front", topY, first, pivot, frontNormal, cardinalWall(frontNormal));
      const side = segmentBetween(cabinet.id, "corner-return", topY, pivot, last, returnNormal, cardinalWall(returnNormal));
      setPointMiter(front, pivot, 45, "perpendicular-corner");
      setPointMiter(side, pivot, 45, "perpendicular-corner");
      descriptors.push(front, side);
      if (setCabinetMiter(first, 0, "continuous", cabInfos, descriptors, frontSegmentByCabinet)) {
        setPointMiter(front, first, 0, "continuous");
      }
      if (setCabinetMiter(last, 0, "continuous", cabInfos, descriptors, frontSegmentByCabinet)) {
        setPointMiter(side, last, 0, "continuous");
      }
      continue;
    }
    const diagonalNormal = transformNormal(cabinet, Math.SQRT1_2, Math.SQRT1_2);
    const diagonal = segmentBetween(cabinet.id, "corner-front", topY, first, last, diagonalNormal, "angled");
    descriptors.push(diagonal);
    if (setCabinetMiter(first, 22.5, "corner-filler", cabInfos, descriptors, frontSegmentByCabinet)) {
      setPointMiter(diagonal, first, 22.5, "corner-filler");
    }
    if (setCabinetMiter(last, 22.5, "corner-filler", cabInfos, descriptors, frontSegmentByCabinet)) {
      setPointMiter(diagonal, last, 22.5, "corner-filler");
    }
  }
}
function appendLegacyFillers(fillers, cabInfos, descriptors, frontSegmentByCabinet) {
  for (const filler of [...fillers ?? []].sort((a, b) => a.id.localeCompare(b.id))) {
    if (filler.type !== "wall" || filler.corner !== "north-east" && filler.corner !== "north-west")
      continue;
    const cut = 12;
    const northEast = filler.corner === "north-east";
    const first = { x: filler.position.x + cut, z: filler.position.z };
    const last = northEast ? { x: filler.position.x, z: filler.position.z + cut } : { x: filler.position.x + 2 * cut, z: filler.position.z + cut };
    const half = Math.SQRT1_2;
    const normal = { x: northEast ? -half : half, z: -half };
    const segment = segmentBetween(filler.id, "corner-front", filler.position.y + filler.height, first, last, normal, "north");
    segment.role = "wall-filler";
    segment.runId = `top-band-filler-${filler.id}`;
    descriptors.push(segment);
    if (setCabinetMiter(first, 22.5, "corner-filler", cabInfos, descriptors, frontSegmentByCabinet)) {
      setPointMiter(segment, first, 22.5, "corner-filler");
    }
    if (setCabinetMiter(last, 22.5, "corner-filler", cabInfos, descriptors, frontSegmentByCabinet)) {
      setPointMiter(segment, last, 22.5, "corner-filler");
    }
  }
}
function appendCornerTopBands(cabinets, fillers, cabInfos, descriptors, frontSegmentByCabinet) {
  appendCatalogCorners(cabinets, cabInfos, descriptors, frontSegmentByCabinet);
  appendLegacyFillers(fillers, cabInfos, descriptors, frontSegmentByCabinet);
}

// ../../apps/web/src/lib/layout/crown-molding.ts
var CROWN_HEIGHT = 4;
var CROWN_DEPTH = 3;
var CROWN_COLOR = "#c4a88a";
var ADJACENCY_TOLERANCE2 = 0.5;
var TOP_TOLERANCE = 0.25;
var MAX_STEP_JOG = 24;
function frontCorner(wall, runCoord, bounds) {
  switch (wall) {
    case "south":
      return { x: runCoord, z: bounds.maxZ };
    case "north":
      return { x: runCoord, z: bounds.minZ };
    case "west":
      return { x: bounds.maxX, z: runCoord };
    case "east":
      return { x: bounds.minX, z: runCoord };
  }
}
function topsMatch(a, b) {
  return Math.abs(a.topY - b.topY) <= TOP_TOLERANCE;
}
function touchesHoodGap(info, side, appliances) {
  const endpoint = side === "lo" ? info.runLo : info.runHi;
  return appliances?.some((appliance) => {
    if (appliance.category !== "hood" || appliance.wall !== info.wall)
      return false;
    const start = info.wall === "north" || info.wall === "south" ? appliance.position.x : appliance.position.z;
    const end = start + appliance.width;
    return Math.abs(endpoint - start) <= ADJACENCY_TOLERANCE2 || Math.abs(endpoint - end) <= ADJACENCY_TOLERANCE2;
  }) ?? false;
}
function assignRunIds(cabinets) {
  const parent = new Map(cabinets.map((cab) => [cab.id, cab.id]));
  const find = (id) => {
    const next = parent.get(id);
    if (next === id)
      return id;
    const root = find(next);
    parent.set(id, root);
    return root;
  };
  const union = (a, b) => {
    const aRoot = find(a);
    const bRoot = find(b);
    if (aRoot !== bRoot)
      parent.set(aRoot < bRoot ? bRoot : aRoot, aRoot < bRoot ? aRoot : bRoot);
  };
  for (let i = 0;i < cabinets.length; i++) {
    for (let j = i + 1;j < cabinets.length; j++) {
      const a = cabinets[i];
      const b = cabinets[j];
      if (a.wall !== b.wall || !topsMatch(a, b))
        continue;
      if (Math.abs(a.runHi - b.runLo) <= ADJACENCY_TOLERANCE2 || Math.abs(b.runHi - a.runLo) <= ADJACENCY_TOLERANCE2) {
        union(a.id, b.id);
      }
    }
  }
  const members = new Map;
  for (const cab of cabinets) {
    const root = find(cab.id);
    const group = members.get(root) ?? [];
    group.push(cab.id);
    members.set(root, group);
  }
  const ids = new Map;
  for (const cab of cabinets) {
    const group = members.get(find(cab.id)).sort();
    ids.set(cab.id, `top-band-${cab.wall}-${group.join("+")}`);
  }
  return ids;
}
function computeTopBandSegments(cabinets, cornerFillers, activeWalls, appliances) {
  const descriptors = [];
  const cabInfos = [];
  for (const cab of cabinets) {
    if (cab.spec.type !== "wall")
      continue;
    if (cab.id.includes("island"))
      continue;
    const wall = cab.wall;
    if (wall !== "north" && wall !== "south" && wall !== "east" && wall !== "west")
      continue;
    const bounds = getCabinetBounds(cab);
    const isNS = wall === "north" || wall === "south";
    const runLo = isNS ? bounds.minX : bounds.minZ;
    const runHi = isNS ? bounds.maxX : bounds.maxZ;
    cabInfos.push({
      id: cab.id,
      topY: cab.position.y + cab.spec.height,
      wall,
      bounds,
      runLo,
      runHi,
      loCorner: frontCorner(wall, runLo, bounds),
      hiCorner: frontCorner(wall, runHi, bounds)
    });
  }
  cabInfos.sort((a, b) => a.wall.localeCompare(b.wall) || a.topY - b.topY || a.runLo - b.runLo || a.id.localeCompare(b.id));
  const runIds = assignRunIds(cabInfos);
  const frontSegIndexByCab = new Map;
  cabInfos.forEach((info, idx) => {
    const { id, topY, wall, bounds, runLo, runHi } = info;
    let loAdjacent = null;
    let hiAdjacent = null;
    let loCornerMatched = false;
    let hiCornerMatched = false;
    for (let j = 0;j < cabInfos.length; j++) {
      if (j === idx)
        continue;
      const other = cabInfos[j];
      if (other.wall === wall && topsMatch(info, other)) {
        if (Math.abs(other.runHi - runLo) < ADJACENCY_TOLERANCE2)
          loAdjacent = other;
        if (Math.abs(other.runLo - runHi) < ADJACENCY_TOLERANCE2)
          hiAdjacent = other;
      } else if (other.wall !== wall && topsMatch(info, other)) {
        if (crownCornersClose(info.loCorner, other.loCorner) || crownCornersClose(info.loCorner, other.hiCorner)) {
          loCornerMatched = true;
        }
        if (crownCornersClose(info.hiCorner, other.loCorner) || crownCornersClose(info.hiCorner, other.hiCorner)) {
          hiCornerMatched = true;
        }
      }
    }
    const loFullEndReturn = false;
    const hiFullEndReturn = false;
    const endpointKind = (side, adjacent, cornerMatched) => {
      if (cornerMatched)
        return "perpendicular-corner";
      if (!adjacent)
        return touchesHoodGap(info, side, appliances) ? "hood-gap" : "open";
      return Math.abs(depthCoord(adjacent.bounds) - depthCoord(bounds)) <= ADJACENCY_TOLERANCE2 ? "continuous" : "same-wall-step";
    };
    const length = runHi - runLo;
    const runCenter = (runLo + runHi) / 2;
    let faceX = 0;
    let faceZ = 0;
    let outNormalX = 0;
    let outNormalZ = 0;
    let frontRotation = 0;
    switch (wall) {
      case "south":
        faceX = runCenter;
        faceZ = bounds.maxZ;
        outNormalX = 0;
        outNormalZ = 1;
        frontRotation = 0;
        break;
      case "north":
        faceX = runCenter;
        faceZ = bounds.minZ;
        outNormalX = 0;
        outNormalZ = -1;
        frontRotation = 180;
        break;
      case "west":
        faceX = bounds.maxX;
        faceZ = runCenter;
        outNormalX = 1;
        outNormalZ = 0;
        frontRotation = 90;
        break;
      case "east":
        faceX = bounds.minX;
        faceZ = runCenter;
        outNormalX = -1;
        outNormalZ = 0;
        frontRotation = 270;
        break;
    }
    const loIsStart = wall === "south" || wall === "east";
    let miterStartDeg = 0;
    let miterEndDeg = 0;
    if (loCornerMatched) {
      if (loIsStart)
        miterStartDeg = 45;
      else
        miterEndDeg = 45;
    }
    if (hiCornerMatched) {
      if (loIsStart)
        miterEndDeg = 45;
      else
        miterStartDeg = 45;
    }
    if (loFullEndReturn) {
      if (loIsStart)
        miterStartDeg = -45;
      else
        miterEndDeg = -45;
    }
    if (hiFullEndReturn) {
      if (loIsStart)
        miterEndDeg = -45;
      else
        miterStartDeg = -45;
    }
    function depthCoord(b) {
      switch (wall) {
        case "south":
          return b.maxZ;
        case "north":
          return b.minZ;
        case "west":
          return b.maxX;
        case "east":
          return b.minX;
      }
    }
    const deeperThan = (other) => {
      switch (wall) {
        case "south":
          return bounds.maxZ > other.maxZ;
        case "north":
          return bounds.minZ < other.minZ;
        case "west":
          return bounds.maxX > other.maxX;
        case "east":
          return bounds.minX < other.minX;
      }
    };
    if (loAdjacent && depthCoord(loAdjacent.bounds) !== depthCoord(bounds)) {
      const deeper = deeperThan(loAdjacent.bounds);
      const stepDeg = deeper ? -45 : 45;
      if (loIsStart)
        miterStartDeg = stepDeg;
      else
        miterEndDeg = stepDeg;
    }
    if (hiAdjacent && depthCoord(hiAdjacent.bounds) !== depthCoord(bounds)) {
      const deeper = deeperThan(hiAdjacent.bounds);
      const stepDeg = deeper ? -45 : 45;
      if (loIsStart)
        miterEndDeg = stepDeg;
      else
        miterStartDeg = stepDeg;
    }
    frontSegIndexByCab.set(id, descriptors.length);
    const loKind = endpointKind("lo", loAdjacent, loCornerMatched);
    const hiKind = endpointKind("hi", hiAdjacent, hiCornerMatched);
    descriptors.push({
      ownerId: id,
      role: "front",
      topY,
      length,
      faceX,
      faceZ,
      outNormalX,
      outNormalZ,
      rotation: frontRotation,
      wall,
      miterStartDeg,
      miterEndDeg,
      runId: runIds.get(id),
      startKind: loIsStart ? loKind : hiKind,
      endKind: loIsStart ? hiKind : loKind
    });
    const emitEndReturn = (side, adjacentBounds) => {
      const sideCoord = side === "lo" ? runLo : runHi;
      const isFull = adjacentBounds === null;
      if (wall === "south" || wall === "north") {
        let backEnd;
        let frontEnd;
        if (wall === "south") {
          frontEnd = bounds.maxZ;
          backEnd = adjacentBounds ? adjacentBounds.maxZ : bounds.minZ;
          if (backEnd >= frontEnd)
            return;
        } else {
          frontEnd = bounds.minZ;
          backEnd = adjacentBounds ? adjacentBounds.minZ : bounds.maxZ;
          if (backEnd <= frontEnd)
            return;
        }
        const erLength = Math.abs(frontEnd - backEnd);
        if (erLength > MAX_STEP_JOG)
          return;
        const zCenter = (frontEnd + backEnd) / 2;
        const deepIsEnd = wall === "south" && side === "lo" || wall === "north" && side === "hi";
        let miterStartDegER = 0;
        let miterEndDegER = 0;
        if (isFull) {
          if (deepIsEnd)
            miterEndDegER = -45;
          else
            miterStartDegER = -45;
        } else {
          if (deepIsEnd) {
            miterEndDegER = -45;
            miterStartDegER = 45;
          } else {
            miterStartDegER = -45;
            miterEndDegER = 45;
          }
        }
        descriptors.push({
          ownerId: id,
          role: side,
          topY,
          length: erLength,
          faceX: sideCoord,
          faceZ: zCenter,
          outNormalX: side === "lo" ? -1 : 1,
          outNormalZ: 0,
          rotation: side === "lo" ? 270 : 90,
          wall,
          miterStartDeg: miterStartDegER,
          miterEndDeg: miterEndDegER,
          runId: runIds.get(id),
          startKind: "same-wall-step",
          endKind: "same-wall-step"
        });
      } else {
        let backEnd;
        let frontEnd;
        if (wall === "west") {
          frontEnd = bounds.maxX;
          backEnd = adjacentBounds ? adjacentBounds.maxX : bounds.minX;
          if (backEnd >= frontEnd)
            return;
        } else {
          frontEnd = bounds.minX;
          backEnd = adjacentBounds ? adjacentBounds.minX : bounds.maxX;
          if (backEnd <= frontEnd)
            return;
        }
        const erLength = Math.abs(frontEnd - backEnd);
        if (erLength > MAX_STEP_JOG)
          return;
        const xCenter = (frontEnd + backEnd) / 2;
        const deepIsEnd = wall === "west" && side === "hi" || wall === "east" && side === "lo";
        let miterStartDegER = 0;
        let miterEndDegER = 0;
        if (isFull) {
          if (deepIsEnd)
            miterEndDegER = -45;
          else
            miterStartDegER = -45;
        } else {
          if (deepIsEnd) {
            miterEndDegER = -45;
            miterStartDegER = 45;
          } else {
            miterStartDegER = -45;
            miterEndDegER = 45;
          }
        }
        descriptors.push({
          ownerId: id,
          role: side,
          topY,
          length: erLength,
          faceX: xCenter,
          faceZ: sideCoord,
          outNormalX: 0,
          outNormalZ: side === "lo" ? -1 : 1,
          rotation: side === "lo" ? 180 : 0,
          wall,
          miterStartDeg: miterStartDegER,
          miterEndDeg: miterEndDegER,
          runId: runIds.get(id),
          startKind: "same-wall-step",
          endKind: "same-wall-step"
        });
      }
    };
    if (!loCornerMatched) {
      if (loAdjacent) {
        emitEndReturn("lo", loAdjacent.bounds);
      } else if (loFullEndReturn) {
        emitEndReturn("lo", null);
      }
    }
    if (!hiCornerMatched) {
      if (hiAdjacent) {
        emitEndReturn("hi", hiAdjacent.bounds);
      } else if (hiFullEndReturn) {
        emitEndReturn("hi", null);
      }
    }
  });
  appendCornerTopBands(cabinets, cornerFillers, cabInfos, descriptors, frontSegIndexByCab);
  const angledCabs = [];
  for (const cab of cabinets) {
    if (cab.spec.type !== "wall")
      continue;
    if (cab.id.includes("island"))
      continue;
    if (cab.wall !== "angled")
      continue;
    const W = cab.spec.width;
    const D = cab.spec.depth;
    const topY = cab.position.y + cab.spec.height;
    const rotRad = cab.rotation * Math.PI / 180;
    const cosR = Math.cos(rotRad);
    const sinR = Math.sin(rotRad);
    const ox = cab.position.x;
    const oz = cab.position.z;
    const seBackX = ox, seBackZ = oz;
    const nwBackX = ox + W * cosR, nwBackZ = oz - W * sinR;
    const seFrontX = seBackX + D * sinR, seFrontZ = seBackZ + D * cosR;
    const nwFrontX = nwBackX + D * sinR, nwFrontZ = nwBackZ + D * cosR;
    const frontMidX = (seFrontX + nwFrontX) / 2;
    const frontMidZ = (seFrontZ + nwFrontZ) / 2;
    const segmentIdx = descriptors.length;
    descriptors.push({
      ownerId: cab.id,
      role: "front",
      topY,
      length: W,
      faceX: frontMidX,
      faceZ: frontMidZ,
      outNormalX: sinR,
      outNormalZ: cosR,
      rotation: cab.rotation,
      wall: "angled",
      miterStartDeg: 0,
      miterEndDeg: 0,
      runId: `top-band-angled-${cab.id}`,
      startKind: "open",
      endKind: "open"
    });
    angledCabs.push({
      id: cab.id,
      segmentIdx,
      offsetAlong: ox - oz,
      nwFrontCorner: { x: nwFrontX, z: nwFrontZ },
      seFrontCorner: { x: seFrontX, z: seFrontZ }
    });
  }
  let nwMost = null;
  let seMost = null;
  if (angledCabs.length > 0) {
    angledCabs.sort((a, b) => a.offsetAlong - b.offsetAlong);
    nwMost = angledCabs[0];
    seMost = angledCabs[angledCabs.length - 1];
    descriptors[nwMost.segmentIdx].miterEndDeg = 22.5;
    descriptors[seMost.segmentIdx].miterStartDeg = 22.5;
  }
  if (cornerFillers && angledCabs.length > 0) {
    const firstAngledCab = cabinets.find((c) => c.wall === "angled" && c.spec.type === "wall");
    const diagRotation = firstAngledCab?.rotation ?? 225;
    const diagRotRad = diagRotation * Math.PI / 180;
    const forwardX = Math.sin(diagRotRad);
    const forwardZ = Math.cos(diagRotRad);
    const pointAlmostEqual = (a, b) => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.z - b.z) < 0.5;
    for (const filler of cornerFillers) {
      if (filler.type !== "wall")
        continue;
      if (filler.corner !== "north-angled" && filler.corner !== "east-angled")
        continue;
      const pos = filler.geometry?.positions;
      if (!pos || pos.length < 33)
        continue;
      const p4w = { x: pos[9] + filler.position.x, z: pos[11] + filler.position.z };
      const p5w = { x: pos[24] + filler.position.x, z: pos[26] + filler.position.z };
      const pcw = { x: pos[30] + filler.position.x, z: pos[32] + filler.position.z };
      const topY = filler.position.y + filler.height;
      if (filler.corner === "north-angled") {
        const cardLen = Math.abs(pcw.x - p4w.x);
        if (cardLen > 0.1) {
          const centerX = (p4w.x + pcw.x) / 2;
          descriptors.push({
            ownerId: filler.id,
            role: "card",
            topY,
            length: cardLen,
            faceX: centerX,
            faceZ: p4w.z,
            outNormalX: 0,
            outNormalZ: -1,
            rotation: 180,
            wall: "north",
            miterStartDeg: 22.5,
            miterEndDeg: 0,
            runId: `top-band-filler-${filler.id}`,
            startKind: "angled-junction",
            endKind: "corner-filler"
          });
        }
      } else {
        const cardLen = Math.abs(pcw.z - p4w.z);
        if (cardLen > 0.1) {
          const centerZ = (p4w.z + pcw.z) / 2;
          descriptors.push({
            ownerId: filler.id,
            role: "card",
            topY,
            length: cardLen,
            faceX: p4w.x,
            faceZ: centerZ,
            outNormalX: -1,
            outNormalZ: 0,
            rotation: 270,
            wall: "east",
            miterStartDeg: 0,
            miterEndDeg: 22.5,
            runId: `top-band-filler-${filler.id}`,
            startKind: "corner-filler",
            endKind: "angled-junction"
          });
        }
      }
      const diagDx = p5w.x - pcw.x;
      const diagDz = p5w.z - pcw.z;
      const diagLen = Math.sqrt(diagDx * diagDx + diagDz * diagDz);
      if (diagLen > 0.5) {
        const centerX = (pcw.x + p5w.x) / 2;
        const centerZ = (pcw.z + p5w.z) / 2;
        const localXDirX = Math.cos(diagRotRad);
        const localXDirZ = -Math.sin(diagRotRad);
        const pcDot = (pcw.x - centerX) * localXDirX + (pcw.z - centerZ) * localXDirZ;
        const pcIsEnd = pcDot > 0;
        descriptors.push({
          ownerId: filler.id,
          role: "diag",
          topY,
          length: diagLen,
          faceX: centerX,
          faceZ: centerZ,
          outNormalX: forwardX,
          outNormalZ: forwardZ,
          rotation: diagRotation,
          wall: "angled",
          miterStartDeg: pcIsEnd ? 0 : 22.5,
          miterEndDeg: pcIsEnd ? 22.5 : 0,
          runId: `top-band-filler-${filler.id}`,
          startKind: pcIsEnd ? "corner-filler" : "angled-junction",
          endKind: pcIsEnd ? "angled-junction" : "corner-filler"
        });
        if (filler.corner === "north-angled" && nwMost && pointAlmostEqual(p5w, nwMost.nwFrontCorner)) {
          descriptors[nwMost.segmentIdx].miterEndDeg = 0;
        }
        if (filler.corner === "east-angled" && seMost && pointAlmostEqual(p5w, seMost.seFrontCorner)) {
          descriptors[seMost.segmentIdx].miterStartDeg = 0;
        }
      }
    }
  }
  return descriptors.filter((segment) => segment.length > 0 && Number.isFinite(segment.length) && Number.isFinite(segment.faceX) && Number.isFinite(segment.faceZ)).sort((a, b) => (a.runId ?? "").localeCompare(b.runId ?? "") || a.ownerId.localeCompare(b.ownerId) || a.role.localeCompare(b.role));
}
function descriptorId(d, prefix) {
  if (d.role === "wall-filler")
    return `${prefix}-${d.ownerId}`;
  return `${prefix}-${d.ownerId}-${d.role}`;
}
function generateCrownMolding(cabinets, cornerFillers, activeWalls, appliances = undefined) {
  const descriptors = computeTopBandSegments(cabinets, cornerFillers, activeWalls, appliances);
  return descriptors.map((d) => ({
    id: descriptorId(d, "crown"),
    runId: d.runId ?? `top-band-${d.wall}-${d.ownerId}`,
    ownerId: d.ownerId,
    role: d.role === "lo" || d.role === "hi" ? "step-jog" : d.role === "wall-filler" ? "corner-filler" : d.role === "diag" ? "angled" : d.role === "card" ? "corner-filler" : "front",
    length: d.length,
    height: CROWN_HEIGHT,
    depth: CROWN_DEPTH,
    color: CROWN_COLOR,
    position: {
      x: d.faceX + d.outNormalX * (CROWN_DEPTH / 2),
      y: d.topY + CROWN_HEIGHT / 2,
      z: d.faceZ + d.outNormalZ * (CROWN_DEPTH / 2)
    },
    rotation: d.rotation,
    wall: d.wall,
    miterStartDeg: d.miterStartDeg,
    miterEndDeg: d.miterEndDeg,
    startKind: d.startKind ?? "open",
    endKind: d.endKind ?? "open"
  }));
}

// ../../apps/web/src/lib/layout/ceiling-filler-panels.ts
var PANEL_THICKNESS2 = 0.75;
var PANEL_COLOR = "#c4a88a";
var MIN_GAP = 0.5;
function generateCeilingFillerPanels(cabinets, cornerFillers, activeWalls, appliances, ceilingHeight) {
  const descriptors = computeTopBandSegments(cabinets, cornerFillers, activeWalls, appliances);
  const panels = [];
  for (const d of descriptors) {
    const panelHeight = ceilingHeight - d.topY;
    if (panelHeight < MIN_GAP)
      continue;
    const idSuffix = d.role === "wall-filler" ? "" : `-${d.role}`;
    panels.push({
      id: `ceiling-filler-${d.ownerId}${idSuffix}`,
      length: d.length,
      height: panelHeight,
      depth: PANEL_THICKNESS2,
      color: PANEL_COLOR,
      position: {
        x: d.faceX + d.outNormalX * (PANEL_THICKNESS2 / 2),
        y: d.topY + panelHeight / 2,
        z: d.faceZ + d.outNormalZ * (PANEL_THICKNESS2 / 2)
      },
      rotation: d.rotation,
      wall: d.wall,
      miterStartDeg: d.miterStartDeg,
      miterEndDeg: d.miterEndDeg
    });
  }
  return panels;
}

// ../../apps/web/src/lib/layout/architectural-segment-scene.ts
function sceneAttachmentTarget(attachment) {
  return attachment.kind === "architectural-segment" ? [attachment.architecturalSegmentId, "authored-separator"] : [attachment.parentCountertopId, attachment.parentRunId];
}

// ../../apps/web/src/lib/layout/scene-integrity.ts
var SCENE_SCHEMA_VERSION = 1;
var ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:+-]*$/;
var APPLIANCE_CATEGORY_SUPPORT = Object.freeze({
  sink: {
    supported: true,
    dimensionsSource: "layout-standard",
    placementSupported: true,
    collisionParticipant: true,
    relationshipRequirement: "hosted-by",
    rendererSupport: "parametric",
    commerceEligible: false
  },
  range: {
    supported: true,
    dimensionsSource: "layout-standard",
    placementSupported: true,
    collisionParticipant: true,
    relationshipRequirement: "none",
    rendererSupport: "asset-or-parametric",
    commerceEligible: false
  },
  refrigerator: {
    supported: true,
    dimensionsSource: "layout-standard",
    placementSupported: true,
    collisionParticipant: true,
    relationshipRequirement: "none",
    rendererSupport: "asset-or-parametric",
    commerceEligible: false
  },
  dishwasher: {
    supported: true,
    dimensionsSource: "layout-standard",
    placementSupported: true,
    collisionParticipant: true,
    relationshipRequirement: "none",
    rendererSupport: "asset-or-parametric",
    commerceEligible: false
  },
  hood: {
    supported: true,
    dimensionsSource: "layout-standard",
    placementSupported: true,
    collisionParticipant: true,
    relationshipRequirement: "paired-with",
    rendererSupport: "asset-or-parametric",
    commerceEligible: false
  },
  microwave: {
    supported: true,
    dimensionsSource: "layout-standard",
    placementSupported: true,
    collisionParticipant: true,
    relationshipRequirement: "none",
    rendererSupport: "parametric",
    commerceEligible: false
  },
  "wine-cooler": {
    supported: true,
    dimensionsSource: "layout-standard",
    placementSupported: true,
    collisionParticipant: true,
    relationshipRequirement: "none",
    rendererSupport: "parametric",
    commerceEligible: false
  },
  "trash-compactor": {
    supported: true,
    dimensionsSource: "layout-standard",
    placementSupported: true,
    collisionParticipant: true,
    relationshipRequirement: "none",
    rendererSupport: "parametric",
    commerceEligible: false
  }
});
var APPLIANCE_CATEGORY_ALIASES = Object.freeze({
  sink: "sink",
  basin: "sink",
  range: "range",
  stove: "range",
  oven: "range",
  cooktop: "range",
  refrigerator: "refrigerator",
  fridge: "refrigerator",
  fridgefreezer: "refrigerator",
  dishwasher: "dishwasher",
  dw: "dishwasher",
  dhw: "dishwasher",
  hood: "hood",
  rangehood: "hood",
  vent: "hood",
  extractor: "hood",
  microwave: "microwave",
  mw: "microwave",
  winecooler: "wine-cooler",
  beveragecooler: "wine-cooler",
  trashcompactor: "trash-compactor",
  compactor: "trash-compactor"
});
function canonicalApplianceCategory(category) {
  if (typeof category !== "string")
    return null;
  return APPLIANCE_CATEGORY_ALIASES[category.trim().toLowerCase().replace(/[^a-z0-9]+/g, "")] ?? null;
}
var SUPPORTED_APPLIANCE_CATEGORIES = new Set(Object.entries(APPLIANCE_CATEGORY_SUPPORT).filter(([, support]) => support.supported).map(([category]) => category));
var relationId = (kind, sourceObjectId, targetObjectId, role) => ["rel", kind, sourceObjectId, targetObjectId, role].filter(Boolean).join(":");
function stableStringify(value) {
  if (value === null || typeof value !== "object")
    return JSON.stringify(value);
  if (Array.isArray(value))
    return `[${value.map(stableStringify).join(",")}]`;
  const record = value;
  return `{${Object.keys(record).filter((key) => key !== "id" && key !== "sceneRelationships").sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}
function fnv1a(value) {
  let hash = 2166136261;
  for (let index = 0;index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
function deterministicId(kind, category, object) {
  return `${kind}-${category || "object"}-${fnv1a(stableStringify(object))}`;
}
function normalizedIdObject(object, kind, category) {
  const record = object;
  const id = typeof record.id === "string" && record.id.trim() ? record.id.trim() : deterministicId(kind, category, object);
  return { ...object, id };
}
function normalizedArray(values, kind, category, legacySentinel) {
  const normalized = values?.map((value) => normalizedIdObject(value, kind, category(value)));
  if (!normalized || !legacySentinel)
    return normalized;
  const sentinelCount = normalized.filter((value) => value.id === legacySentinel.id).length;
  if (sentinelCount < 2)
    return normalized;
  const used = new Set(normalized.filter((value) => value.id !== legacySentinel.id).map((value) => value.id));
  return normalized.map((value, index) => {
    if (value.id !== legacySentinel.id)
      return value;
    const base = `${legacySentinel.prefix}-${index}-${fnv1a(stableStringify(value))}`;
    let id = base;
    let suffix = 2;
    while (used.has(id))
      id = `${base}-${suffix++}`;
    used.add(id);
    return { ...value, id };
  });
}
function collectSceneObjects(config) {
  const objects = [];
  const add = (id, kind, category, object, integrityImpact) => {
    objects.push({ id: typeof id === "string" ? id : "", kind, category, object, integrityImpact });
  };
  for (const item of config.cabinets ?? [])
    add(item.id, "cabinet", item.spec?.type ?? "cabinet", item);
  for (const item of config.appliances ?? []) {
    const category = canonicalApplianceCategory(item.category);
    if (!category)
      throw new Error(`Unregistered appliance category: ${String(item.category)}`);
    add(item.id, "appliance", category, item);
  }
  for (const item of config.applianceOpenings ?? []) {
    add(item.id, item.category === "dishwasher" ? "appliance" : "opening", item.category, item);
  }
  for (const item of config.unsupportedSceneObjects ?? [])
    add(item.id, "appliance", item.sourceCategory, item, item.integrityImpact);
  for (const item of config.doors ?? [])
    add(item.id, "opening", "door", item);
  for (const item of config.windows ?? [])
    add(item.id, "opening", "window", item);
  for (const item of config.countertops ?? [])
    add(item.id, "countertop", "countertop", item);
  for (const item of config.cornerFillers ?? [])
    add(item.id, "filler", item.type ?? "filler", item);
  for (const item of config.islandPanels ?? [])
    add(item.id, "panel", item.assemblyRole ?? "island-panel", item);
  for (const item of config.fridgeCoverBoards ?? [])
    add(item.id, "panel", `fridge-${item.side}`, item);
  for (const item of config.endPanelCoverBoards ?? [])
    add(item.id, "panel", item.purpose ?? `end-${item.side}`, item);
  for (const item of config.crownMolding ?? [])
    add(item.id, "trim", item.role ?? "crown", item);
  for (const item of config.ceilingFillerPanels ?? [])
    add(item.id, "trim", "ceiling-filler", item);
  for (const item of resolvedAssemblies(config))
    add(item.id, "assembly", item.kind, item);
  for (const item of config.architecturalSegments ?? [])
    add(item.id, "architecture", item.kind, item);
  return objects;
}
function deriveSceneRelationships(config, designSlot = 0) {
  const relationships = [];
  const objectIds = new Set(collectSceneObjects(config).map((object) => object.id));
  const add = (kind, sourceObjectId, targetObjectId, role) => {
    if (!sourceObjectId || !targetObjectId)
      return;
    if (!objectIds.has(sourceObjectId) || !objectIds.has(targetObjectId))
      return;
    relationships.push({
      id: relationId(kind, sourceObjectId, targetObjectId, role),
      kind,
      sourceObjectId,
      targetObjectId,
      role,
      designSlot,
      origin: "derived"
    });
  };
  for (const appliance of config.appliances ?? []) {
    if (appliance.category === "sink")
      add("hosted-by", appliance.id, appliance.hostObjectId, "sink-base");
    if (appliance.category === "hood") {
      const pair = collectSceneObjects(config).find((object) => object.id === appliance.pairedObjectId);
      add("paired-with", appliance.id, appliance.pairedObjectId, pair?.kind === "cabinet" ? "cooktop-host" : "range");
    }
  }
  for (const countertop of config.countertops ?? []) {
    for (const cabinetId of countertop.supportCabinetIds ?? []) {
      add("generated-from", countertop.id, cabinetId, "countertop-support");
    }
    for (const hole of countertop.holes ?? []) {
      if (objectIds.has(hole.ownerId))
        add("creates-cutout", hole.ownerId, countertop.id, hole.kind);
    }
  }
  for (const panel of config.endPanelCoverBoards ?? []) {
    add("generated-from", panel.id, panel.openingId ?? panel.cabinetId, panel.purpose ?? `end-panel-${panel.side}`);
  }
  for (const crown of config.crownMolding ?? []) {
    add("generated-from", crown.id, crown.ownerId, crown.role ?? "crown");
  }
  for (const assembly of resolvedAssemblies(config)) {
    for (const memberId of [
      ...assembly.cabinetIds,
      ...assembly.countertopIds,
      ...assembly.panelIds,
      ...assembly.applianceIds
    ])
      add("generated-from", memberId, assembly.id, `${assembly.kind}-member`);
    if (assembly.attachment) {
      add("attached-to", assembly.id, ...sceneAttachmentTarget(assembly.attachment));
    }
  }
  return relationships.sort((a, b) => a.id.localeCompare(b.id));
}
function normalizeSceneConfig(input, designSlot = 0) {
  const migratedOpenings = migrateLegacyApplianceOpenings(input.cabinets ?? [], input.applianceOpenings ?? []);
  const normalizedAssemblies = normalizedArray(resolvedAssemblies(input), "assembly", (item) => item.kind)?.map((assembly) => normalizeAssembly(assembly));
  const { islandAssemblies: _legacyAssemblies, ...restInput } = input;
  const canonicalAppliances = input.appliances?.map((item) => {
    const category = canonicalApplianceCategory(item.category);
    if (!category)
      throw new Error(`Unregistered appliance category: ${String(item.category)}`);
    return { ...item, category };
  });
  const normalizedAppliances = normalizedArray(canonicalAppliances, "appliance", (item) => item.category, { id: "dsg-appliance-0", prefix: "dsg-appliance-legacy" })?.map((item) => {
    const supported = SUPPORTED_APPLIANCE_CATEGORIES.has(item.category);
    const { supportReason: _supportReason, ...rest } = item;
    return supported ? { ...rest, supportState: "supported" } : { ...rest, supportState: "unsupported", supportReason: "unsupported-scene-object" };
  });
  const normalizedUnsupportedSceneObjects = normalizedArray(input.unsupportedSceneObjects, "appliance", (item) => item.sourceCategory, { id: "unsupported-appliance-0", prefix: "unsupported-appliance-legacy" })?.map((item) => item.integrityImpact === undefined && item.kind === "appliance" ? { ...item, integrityImpact: "advisory" } : item);
  const migratedOpeningIds = new Set(migratedOpenings.migratedCabinetIds);
  const retainedEndPanelCoverBoards = input.endPanelCoverBoards?.filter((panel) => !migratedOpeningIds.has(panel.cabinetId));
  const config = {
    ...restInput,
    sceneSchemaVersion: SCENE_SCHEMA_VERSION,
    cabinets: normalizedArray(migratedOpenings.cabinets, "cabinet", (item) => item.spec?.type ?? "cabinet") ?? [],
    ...normalizedUnsupportedSceneObjects ? {
      unsupportedSceneObjects: normalizedUnsupportedSceneObjects
    } : {},
    ...normalizedAppliances ? { appliances: normalizedAppliances } : {},
    ...migratedOpenings.applianceOpenings.length > 0 ? {
      applianceOpenings: normalizedArray(migratedOpenings.applianceOpenings, "opening", (item) => item.category)
    } : {},
    ...input.doors ? { doors: normalizedArray(input.doors, "opening", () => "door") } : {},
    ...input.windows ? { windows: normalizedArray(input.windows, "opening", () => "window") } : {},
    ...input.countertops ? { countertops: normalizedArray(input.countertops, "countertop", () => "countertop") } : {},
    ...input.cornerFillers ? { cornerFillers: normalizedArray(input.cornerFillers, "filler", (item) => item.type ?? "filler") } : {},
    ...input.islandPanels ? { islandPanels: normalizedArray(input.islandPanels, "panel", (item) => item.assemblyRole ?? "island-panel") } : {},
    ...input.fridgeCoverBoards ? { fridgeCoverBoards: normalizedArray(input.fridgeCoverBoards, "panel", (item) => `fridge-${item.side}`) } : {},
    ...retainedEndPanelCoverBoards ? {
      endPanelCoverBoards: normalizedArray(retainedEndPanelCoverBoards, "panel", (item) => `end-${item.side}`)
    } : {},
    ...input.crownMolding ? { crownMolding: normalizedArray(input.crownMolding, "trim", (item) => item.role ?? "crown") } : {},
    ...input.ceilingFillerPanels ? { ceilingFillerPanels: normalizedArray(input.ceilingFillerPanels, "trim", () => "ceiling-filler") } : {},
    ...input.architecturalSegments ? {
      architecturalSegments: normalizedArray(input.architecturalSegments, "architecture", (item) => item.kind)
    } : {},
    ...normalizedAssemblies?.length ? { assemblies: normalizedAssemblies } : {}
  };
  const sinkHosts = config.cabinets.filter(isSinkHostCabinet);
  const cooktopHosts = config.cabinets.filter(isCooktopHostCabinet);
  const ranges = (config.appliances ?? []).filter((appliance) => appliance.category === "range");
  config.appliances = config.appliances?.map((appliance) => {
    if (appliance.category === "sink") {
      const currentHost = config.cabinets.find((cabinet) => cabinet.id === appliance.hostObjectId);
      if (currentHost && isSinkHostCabinet(currentHost) && cabinetContainsApplianceCenter(currentHost, appliance))
        return appliance;
      const candidates = sinkHosts.filter((cabinet) => cabinetContainsApplianceCenter(cabinet, appliance));
      if (candidates.length === 1)
        return { ...appliance, hostObjectId: candidates[0].id };
      const { hostObjectId: _hostObjectId, ...rest } = appliance;
      return rest;
    }
    if (appliance.category === "hood") {
      const currentPair = ranges.find((range) => range.id === appliance.pairedObjectId);
      if (currentPair)
        return appliance;
      const currentHost = cooktopHosts.find((cabinet) => cabinet.id === appliance.pairedObjectId && cabinetContainsApplianceCenter(cabinet, appliance));
      if (currentHost)
        return appliance;
      const candidates = ranges.filter((range) => range.wall === appliance.wall);
      if (candidates.length === 1)
        return { ...appliance, pairedObjectId: candidates[0].id };
      const hostCandidates = cooktopHosts.filter((cabinet) => cabinetContainsApplianceCenter(cabinet, appliance));
      if (hostCandidates.length === 1)
        return { ...appliance, pairedObjectId: hostCandidates[0].id };
      const { pairedObjectId: _pairedObjectId, ...rest } = appliance;
      return rest;
    }
    return appliance;
  });
  config.sceneRelationships = (input.sceneRelationships ?? []).filter((relationship) => relationship.origin === "explicit").map((relationship) => ({ ...relationship, designSlot: relationship.designSlot ?? designSlot })).sort((a, b) => a.id.localeCompare(b.id));
  return reconcilePeninsulaAssemblies(config);
}
function isSinkHostCabinet(cabinet) {
  if (cabinet.spec.type === "sink-base")
    return true;
  if (cabinet.spec.type !== "base" && cabinet.spec.type !== "corner-base")
    return false;
  return /^(CSB|SBA|BDC)\d/i.test((cabinet.spec.id ?? cabinet.spec.name ?? "").trim());
}
function isCooktopHostCabinet(cabinet) {
  if (cabinet.spec.type !== "base" && cabinet.spec.type !== "sink-base")
    return false;
  return /^SB\d/i.test((cabinet.canonicalCode ?? cabinet.spec.id ?? cabinet.sku ?? cabinet.spec.name ?? "").trim());
}
function cabinetContainsApplianceCenter(cabinet, appliance) {
  const radians = cabinet.rotation * Math.PI / 180;
  const widthX = Math.cos(radians) * cabinet.spec.width;
  const widthZ = -Math.sin(radians) * cabinet.spec.width;
  const depthX = Math.sin(radians) * cabinet.spec.depth;
  const depthZ = Math.cos(radians) * cabinet.spec.depth;
  const xs = [
    cabinet.position.x,
    cabinet.position.x + widthX,
    cabinet.position.x + widthX + depthX,
    cabinet.position.x + depthX
  ];
  const zs = [
    cabinet.position.z,
    cabinet.position.z + widthZ,
    cabinet.position.z + widthZ + depthZ,
    cabinet.position.z + depthZ
  ];
  const rotated = appliance.rotation === 90 || appliance.rotation === 270;
  const centerX = appliance.position.x + (rotated ? appliance.depth : appliance.width) / 2;
  const centerZ = appliance.position.z + (rotated ? appliance.width : appliance.depth) / 2;
  return centerX > Math.min(...xs) && centerX < Math.max(...xs) && centerZ > Math.min(...zs) && centerZ < Math.max(...zs);
}
function sortedIdentityViolations(violations) {
  return violations.sort((a, b) => (a.objectId ?? "").localeCompare(b.objectId ?? "") || a.reason.localeCompare(b.reason) || (a.kind ?? "").localeCompare(b.kind ?? ""));
}
function sortedRelationshipViolations(violations) {
  return violations.sort((a, b) => (a.relationshipId ?? "").localeCompare(b.relationshipId ?? "") || a.reason.localeCompare(b.reason) || (a.sourceObjectId ?? "").localeCompare(b.sourceObjectId ?? ""));
}
function findSceneIdentityViolations(config, designSlot = 0) {
  const objects = collectSceneObjects(config);
  const byId = new Map;
  const violations = [];
  for (const object of objects) {
    if (!object.id) {
      violations.push({ designSlot, kind: object.kind, category: object.category, reason: "missing-object-id" });
      continue;
    }
    if (!ID_PATTERN.test(object.id)) {
      violations.push({ objectId: object.id, designSlot, kind: object.kind, category: object.category, reason: "malformed-object-id" });
    }
    const matches = byId.get(object.id) ?? [];
    matches.push(object);
    byId.set(object.id, matches);
    if (object.kind === "appliance" && object.integrityImpact !== "advisory" && !SUPPORTED_APPLIANCE_CATEGORIES.has(object.category)) {
      violations.push({
        objectId: object.id,
        designSlot,
        kind: object.kind,
        category: object.category,
        reason: "unsupported-scene-object"
      });
    }
  }
  for (const [id, matches] of byId) {
    if (matches.length <= 1)
      continue;
    violations.push({
      objectId: id,
      designSlot,
      reason: "duplicate-object-id",
      relatedObjectIds: matches.map((match) => `${match.kind}:${match.category}`).sort()
    });
  }
  const sourceWallIds = new Set((config.sourceWallSegments ?? []).map((segment) => segment.id));
  for (const opening of [...config.doors ?? [], ...config.windows ?? []]) {
    if (!opening.backingWallId || sourceWallIds.has(opening.backingWallId))
      continue;
    violations.push({
      objectId: opening.id,
      designSlot,
      kind: "opening",
      category: "backing-wall",
      reason: "missing-backing-wall",
      relatedObjectIds: [opening.backingWallId]
    });
  }
  return sortedIdentityViolations(violations);
}
function findSceneIdentityAdvisories(config, designSlot) {
  return sortedIdentityViolations(collectSceneObjects(config).filter((object) => object.kind === "appliance" && object.integrityImpact === "advisory" && !SUPPORTED_APPLIANCE_CATEGORIES.has(object.category)).map((object) => ({
    objectId: object.id,
    designSlot,
    kind: object.kind,
    category: object.category,
    reason: "unsupported-scene-object"
  })));
}
function relationshipCompatibility(relationship, source, target) {
  if (relationship.kind === "hosted-by") {
    return source.kind === "appliance" && source.category === "sink" && target.kind === "cabinet" && isSinkHostCabinet(target.object) && cabinetContainsApplianceCenter(target.object, source.object) ? null : "incompatible-host";
  }
  if (relationship.kind === "paired-with") {
    const hood = source.kind === "appliance" && source.category === "hood" ? source.object : null;
    return hood && (target.kind === "appliance" && target.category === "range" || target.kind === "cabinet" && isCooktopHostCabinet(target.object) && cabinetContainsApplianceCenter(target.object, hood)) ? null : "incompatible-pair";
  }
  if (relationship.kind === "creates-cutout") {
    return source.kind === "appliance" && source.category === "sink" && target.kind === "countertop" ? null : "invalid-derived-parent";
  }
  if (relationship.kind === "generated-from") {
    return source.kind === "opening" ? "invalid-derived-parent" : null;
  }
  if (relationship.kind === "attached-to") {
    return source.kind === "assembly" && (target.kind === "countertop" || target.kind === "architecture") ? null : "invalid-derived-parent";
  }
  return null;
}
function findSceneRelationshipViolations(config, designSlot = 0) {
  const objects = collectSceneObjects(config);
  const objectsById = new Map(objects.map((object) => [object.id, object]));
  const explicitRelationships = config.sceneRelationships ?? [];
  const explicitIds = new Set(explicitRelationships.map((relationship) => relationship.id));
  const relationships = [
    ...explicitRelationships,
    ...deriveSceneRelationships(config, designSlot).filter((relationship) => !explicitIds.has(relationship.id))
  ];
  const violations = [];
  const relationshipIds = new Set;
  const hostedByCount = new Map;
  const pairedWithCount = new Map;
  for (const relationship of relationships) {
    if (!ID_PATTERN.test(relationship.id)) {
      violations.push({ relationshipId: relationship.id, designSlot, reason: "malformed-relationship-id" });
    }
    if (relationshipIds.has(relationship.id)) {
      violations.push({ relationshipId: relationship.id, designSlot, reason: "duplicate-relationship-id" });
    }
    relationshipIds.add(relationship.id);
    if (relationship.designSlot !== undefined && relationship.designSlot !== designSlot) {
      violations.push({
        relationshipId: relationship.id,
        sourceObjectId: relationship.sourceObjectId,
        targetObjectId: relationship.targetObjectId,
        designSlot,
        reason: "relationship-crosses-design-slot"
      });
      continue;
    }
    if (relationship.sourceObjectId === relationship.targetObjectId) {
      violations.push({
        relationshipId: relationship.id,
        sourceObjectId: relationship.sourceObjectId,
        targetObjectId: relationship.targetObjectId,
        designSlot,
        reason: "self-reference"
      });
      continue;
    }
    const source = objectsById.get(relationship.sourceObjectId);
    const target = objectsById.get(relationship.targetObjectId);
    if (!source || !target) {
      violations.push({
        relationshipId: relationship.id,
        sourceObjectId: relationship.sourceObjectId,
        targetObjectId: relationship.targetObjectId,
        designSlot,
        reason: "stale-reference"
      });
      continue;
    }
    const incompatible = relationshipCompatibility(relationship, source, target);
    if (incompatible) {
      violations.push({
        relationshipId: relationship.id,
        sourceObjectId: relationship.sourceObjectId,
        targetObjectId: relationship.targetObjectId,
        designSlot,
        reason: incompatible
      });
    }
    if (relationship.kind === "hosted-by") {
      hostedByCount.set(relationship.sourceObjectId, (hostedByCount.get(relationship.sourceObjectId) ?? 0) + 1);
    }
    if (relationship.kind === "paired-with") {
      pairedWithCount.set(relationship.sourceObjectId, (pairedWithCount.get(relationship.sourceObjectId) ?? 0) + 1);
    }
  }
  for (const appliance of config.appliances ?? []) {
    if (appliance.category === "sink") {
      const count = hostedByCount.get(appliance.id) ?? 0;
      if (count === 0)
        violations.push({ sourceObjectId: appliance.id, designSlot, reason: "missing-host" });
      if (count > 1)
        violations.push({ sourceObjectId: appliance.id, designSlot, reason: "ambiguous-host" });
    }
    if (appliance.category === "hood") {
      const count = pairedWithCount.get(appliance.id) ?? 0;
      if (count === 0)
        violations.push({ sourceObjectId: appliance.id, designSlot, reason: "missing-pair" });
      if (count > 1)
        violations.push({ sourceObjectId: appliance.id, designSlot, reason: "ambiguous-pair" });
    }
  }
  return sortedRelationshipViolations(violations);
}
function rawDuplicateRelationshipViolations(input, designSlot) {
  const counts = new Map;
  for (const relationship of (input.sceneRelationships ?? []).filter((item) => item.origin === "explicit")) {
    counts.set(relationship.id, (counts.get(relationship.id) ?? 0) + 1);
  }
  return Array.from(counts.entries()).filter(([, count]) => count > 1).map(([relationshipId]) => ({
    relationshipId,
    designSlot,
    reason: "duplicate-relationship-id"
  }));
}
function inspectSceneIntegrity(input, designSlot = 0) {
  const rawDuplicateViolations = rawDuplicateRelationshipViolations(input, designSlot);
  const config = normalizeSceneConfig(input, designSlot);
  const identityViolations = findSceneIdentityViolations(config, designSlot);
  const advisoryIdentityViolations = findSceneIdentityAdvisories(config, designSlot);
  const allRelationshipViolations = sortedRelationshipViolations([
    ...rawDuplicateViolations,
    ...findSceneRelationshipViolations(config, designSlot)
  ]);
  const hoodIds = new Set((config.appliances ?? []).filter((appliance) => appliance.category === "hood").map((appliance) => appliance.id));
  const advisoryRelationshipViolations = allRelationshipViolations.filter((violation) => violation.sourceObjectId !== undefined && hoodIds.has(violation.sourceObjectId) && violation.reason !== "duplicate-relationship-id" && violation.reason !== "malformed-relationship-id");
  const advisoryRelationships = new Set(advisoryRelationshipViolations);
  const relationshipViolations = allRelationshipViolations.filter((violation) => !advisoryRelationships.has(violation));
  const invalidObjectIds = new Set;
  for (const violation of identityViolations)
    if (violation.objectId)
      invalidObjectIds.add(violation.objectId);
  for (const violation of relationshipViolations) {
    if (violation.sourceObjectId)
      invalidObjectIds.add(violation.sourceObjectId);
    if (violation.targetObjectId && violation.reason !== "stale-reference")
      invalidObjectIds.add(violation.targetObjectId);
  }
  const acceptedObjectIds = collectSceneObjects(config).map((object) => object.id).filter((id) => id && !invalidObjectIds.has(id)).sort();
  return {
    schemaVersion: SCENE_SCHEMA_VERSION,
    designSlot,
    identityViolations,
    advisoryIdentityViolations,
    relationshipViolations,
    advisoryRelationshipViolations,
    acceptedObjectIds,
    isValid: identityViolations.length === 0 && relationshipViolations.length === 0
  };
}

// ../../apps/web/src/lib/layout/doors.ts
function resolveDoors(room, activeWalls, weights) {
  return (room.doors ?? []).map((door) => {
    const geometry = wallGeometry(door.wall, room, activeWalls);
    const runCenter = door.offset + door.width / 2;
    return {
      id: door.id,
      wall: door.wall,
      position: {
        x: geometry.runAxis === "x" ? runCenter : geometry.fixedCoord,
        y: 0,
        z: geometry.runAxis === "z" ? runCenter : geometry.fixedCoord
      },
      width: door.width,
      height: weights.doorHeight,
      rotation: geometry.rotation,
      hingeSide: door.hingeSide,
      swingDirection: door.swingDirection
    };
  });
}
function omitDoorSwingCabinetConflicts(cabinets, room) {
  return cabinets.filter((cabinet) => !overlapsDoorSwing(cabinetFootprintPolygon(cabinet), room.doors ?? [], room.width, room.depth));
}

// ../../apps/web/src/lib/layout/generate-layout.ts
function materializeDishwasherOpenings(reservations, room, activeWalls) {
  return reservations.filter((reservation) => reservation.category === "dishwasher-reserved").map((reservation, index) => {
    const geo = wallGeometry(reservation.wall, room, activeWalls);
    const runCoord = geo.perpOffset + reservation.offset + (geo.anchorIsEndEdge ? reservation.width : 0);
    return {
      id: reservation.id?.trim() || `dishwasher-opening-${index + 1}`,
      ...reservation.sourceId ? { sourceId: reservation.sourceId } : {},
      category: "dishwasher",
      width: reservation.width,
      height: BASE_CABINET_HEIGHT,
      depth: BASE_CABINET_DEPTH,
      position: {
        x: geo.runAxis === "x" ? runCoord : geo.fixedCoord,
        y: 0,
        z: geo.runAxis === "z" ? runCoord : geo.fixedCoord
      },
      rotation: geo.rotation,
      wall: reservation.wall
    };
  });
}
function selectCornerBaseSpecId(allowedSpecIds) {
  if (!allowedSpecIds)
    return "BCORN";
  const specs = allowedSpecIds.map((id) => cabinetSpecForCode(id)).filter((spec) => !!spec);
  const candidates = specs.filter((spec) => businessCabinetGeom(spec.type) === "corner-base").sort((a, b) => a.width - b.width || a.id.localeCompare(b.id));
  if (candidates[0])
    return candidates[0].id;
  return specs.filter((spec) => businessCabinetGeom(spec.type) === "base" && spec.width === BASE_CABINET_DEPTH).sort((a, b) => a.id.localeCompare(b.id))[0]?.id ?? null;
}
function selectCornerWallSpecId(allowedSpecIds) {
  if (!allowedSpecIds)
    return "WDC2430";
  const familyRank = (id) => id.toUpperCase().startsWith("WDC") ? 0 : id.toUpperCase().startsWith("WLC") ? 1 : id.toUpperCase().startsWith("WLS") ? 2 : id.toUpperCase().startsWith("WBC") ? 4 : 3;
  return allowedSpecIds.map((id) => cabinetSpecForCode(id)).filter((spec) => !!spec && businessCabinetGeom(spec.type) === "corner-wall" && spec.width === 24 && spec.height === 30 && spec.depth === 12).sort((a, b) => familyRank(a.id) - familyRank(b.id) || a.id.localeCompare(b.id))[0]?.id ?? null;
}
function selectAboveFridgeSpecIds(allowedSpecIds) {
  if (!allowedSpecIds)
    return ["WRF3614"];
  const candidates = allowedSpecIds.map((id) => cabinetSpecForCode(id)).filter((spec) => spec && businessCabinetGeom(spec.type) === "wall" && spec.width <= APPLIANCE_DIMENSIONS.refrigerator.width && spec.height <= 24).sort((a, b) => {
    const aFridge = a.id.toUpperCase().startsWith("WRF") ? 0 : 1;
    const bFridge = b.id.toUpperCase().startsWith("WRF") ? 0 : 1;
    return aFridge - bFridge || b.width - a.width || a.height - b.height || a.id.localeCompare(b.id);
  });
  const target = APPLIANCE_DIMENSIONS.refrigerator.width;
  const solutions = Array(target + 1).fill(undefined);
  solutions[0] = [];
  for (let width = 1;width <= target; width++) {
    for (const candidate of candidates) {
      if (!Number.isInteger(candidate.width) || candidate.width > width || !solutions[width - candidate.width])
        continue;
      const next = [...solutions[width - candidate.width], candidate.id];
      const current = solutions[width];
      if (!current || next.length < current.length)
        solutions[width] = next;
    }
  }
  return solutions[target] ?? [];
}
function placeIslandInZone(zone, dims, w, rng) {
  const halfWidth = dims.width / 2;
  const halfDepth = dims.depth / 2;
  let minCenterX = zone.minX + halfWidth;
  let maxCenterX = zone.maxX - halfWidth;
  if (zone.hasWestCabinets) {
    minCenterX = Math.max(minCenterX, zone.westEdge + w.minIslandClearance + halfWidth);
    maxCenterX = Math.min(maxCenterX, zone.westEdge + w.maxIslandClearance + halfWidth);
  }
  if (zone.hasEastCabinets) {
    minCenterX = Math.max(minCenterX, zone.eastEdge - w.maxIslandClearance - halfWidth);
    maxCenterX = Math.min(maxCenterX, zone.eastEdge - w.minIslandClearance - halfWidth);
  }
  let minCenterZ = zone.minZ + halfDepth;
  let maxCenterZ = zone.maxZ - halfDepth;
  if (zone.hasSouthCabinets) {
    minCenterZ = Math.max(minCenterZ, zone.southEdge + w.minIslandClearance + halfDepth);
    maxCenterZ = Math.min(maxCenterZ, zone.southEdge + w.maxIslandClearance + halfDepth);
  }
  if (zone.hasNorthCabinets) {
    minCenterZ = Math.max(minCenterZ, zone.northEdge - w.maxIslandClearance - halfDepth);
    maxCenterZ = Math.min(maxCenterZ, zone.northEdge - w.minIslandClearance - halfDepth);
  }
  return {
    centerX: minCenterX + rng() * Math.max(0, maxCenterX - minCenterX),
    centerZ: minCenterZ + rng() * Math.max(0, maxCenterZ - minCenterZ)
  };
}
function generateLayout(room, weights, seed, allowedSpecIdsInput) {
  const allowedSpecIds = allowedSpecIdsInput?.length ? allowedSpecIdsInput : undefined;
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const rootSeed = seed != null ? seed >>> 0 : randomSeed();
  const applianceRng = decisionRng(rootSeed, "appliances");
  const dishwasherRng = decisionRng(rootSeed, "appliance:dishwasher");
  const islandRng = decisionRng(rootSeed, "assembly:island");
  const peninsulaRng = decisionRng(rootSeed, "assembly:peninsula");
  const activeWalls = getActiveWalls(room.layout);
  const architecturalSegment = authoredArchitecturalSegment(room);
  const applianceRoom = room.dishwasher === undefined ? { ...room, dishwasher: dishwasherRng() < 0.65 } : room;
  const applianceReservations = planAppliancePlacements(activeWalls, applianceRoom, w, applianceRng, allowedSpecIds);
  const doorReservations = (room.doors ?? []).flatMap((d) => {
    const geo = wallGeometry(d.wall, room, activeWalls);
    const res = doorToReservation(d, geo, w.doorClearance);
    return res ? [res] : [];
  });
  const windowReservations = (room.windows ?? []).flatMap((win) => {
    if (win.wall === "angled")
      return [];
    const geo = wallGeometry(win.wall, room, activeWalls);
    const res = windowToReservation(win, geo, w.windowClearance);
    return res ? [res] : [];
  });
  const allReservations = [...applianceReservations, ...doorReservations, ...windowReservations];
  const islandZone = !architecturalSegment && room.island !== false ? calculateIslandZone(room, activeWalls, w) : null;
  const islandDimensions = islandZone ? calculateIslandDimensions(islandZone, w, islandRng) : null;
  const useGenericPeninsula = !architecturalSegment && room.peninsula !== false && !islandDimensions && room.layout !== "u-shape";
  const peninsulaDef = useGenericPeninsula ? calculatePeninsulaFeasibility(room, activeWalls, applianceReservations, w, peninsulaRng) : null;
  if (peninsulaDef) {
    allReservations.push(getPeninsulaBackClearanceReservation(peninsulaDef, room, activeWalls));
  }
  const hasEastWall = activeWalls.has("east");
  const hasWestWall = activeWalls.has("west");
  const hasNorthWall = activeWalls.has("north");
  const { nw: lRoomNW, nd: lRoomND } = getLRoomNotch(room);
  const isLRoom = lRoomNW > 0 && lRoomND > 0;
  const hasNorthEastCorner = hasNorthWall && hasEastWall && !isLRoom;
  const hasNorthWestCorner = hasNorthWall && hasWestWall;
  const cornerBaseSpecId = selectCornerBaseSpecId(allowedSpecIds);
  const cornerWallSpecId = selectCornerWallSpecId(allowedSpecIds);
  const cornerBaseSpec = cornerBaseSpecId ? cabinetSpecForCode(cornerBaseSpecId) : null;
  const cornerBaseRunWidths = {
    ...hasNorthEastCorner && cornerBaseSpec ? { north: cornerBaseSpec.width } : {},
    ...hasNorthWestCorner && cornerBaseSpec ? { west: cornerBaseSpec.width } : {}
  };
  const placements = [];
  for (const wall of activeWalls) {
    placements.push(...placeCabinetsOnWall(wall, room, activeWalls, allReservations, w, decisionRng(rootSeed, `wall:${wall}`), allowedSpecIds, cornerBaseRunWidths));
  }
  if (hasNorthEastCorner && cornerBaseSpecId) {
    placements.push({ specId: cornerBaseSpecId, x: room.width, y: 0, z: room.depth, rotation: 180, wall: "north" });
    if (cornerWallSpecId)
      placements.push({ specId: cornerWallSpecId, x: room.width, y: w.wallCabinetY, z: room.depth, rotation: 180, wall: "north" });
  }
  if (hasNorthWestCorner && cornerBaseSpecId) {
    placements.push({ specId: cornerBaseSpecId, x: 0, y: 0, z: room.depth, rotation: 90, wall: "west" });
    if (cornerWallSpecId)
      placements.push({ specId: cornerWallSpecId, x: 0, y: w.wallCabinetY, z: room.depth, rotation: 90, wall: "west" });
  }
  const fridgeReservation = applianceReservations.find((r) => r.category === "refrigerator");
  if (fridgeReservation) {
    const wallCabinetTop = w.wallCabinetY + w.wallCabinetHeight;
    const fridgeGeo = wallGeometry(fridgeReservation.wall, room, activeWalls);
    let offset = fridgeReservation.offset;
    for (const specId of selectAboveFridgeSpecIds(allowedSpecIds)) {
      const spec = cabinetSpecForCode(specId);
      const runCoord = fridgeGeo.perpOffset + offset + (fridgeGeo.anchorIsEndEdge ? spec.width : 0);
      const frontOffset = Math.max(0, BASE_CABINET_DEPTH - spec.depth);
      const panelBackCoord = fridgeGeo.fixedCoord + (fridgeGeo.wallFacesLowCoord ? -FRIDGE_PANEL_WALL_GAP : FRIDGE_PANEL_WALL_GAP);
      const fixedCoord = panelBackCoord + (fridgeGeo.wallFacesLowCoord ? -frontOffset : frontOffset);
      placements.push({
        specId,
        x: fridgeGeo.runAxis === "x" ? runCoord : fixedCoord,
        y: wallCabinetTop - spec.height,
        z: fridgeGeo.runAxis === "z" ? runCoord : fixedCoord,
        rotation: fridgeGeo.rotation,
        wall: fridgeReservation.wall
      });
      offset += spec.width;
    }
  }
  const resolvedCabinets = [];
  const wallOrdinals = new Map;
  placements.forEach((placement) => {
    const identity = placement.wall ?? "unassigned";
    const ordinal = wallOrdinals.get(identity) ?? 0;
    wallOrdinals.set(identity, ordinal + 1);
    const resolved = resolveCabinet(`cabinet-${identity}-${ordinal}`, placement);
    if (resolved) {
      resolvedCabinets.push(resolved);
    }
  });
  const cabinets = omitDoorSwingCabinetConflicts(resolvedCabinets, room);
  const applianceOpenings = materializeDishwasherOpenings(applianceReservations, room, activeWalls);
  const catalogCornerWalls = new Set(cornerWallSpecId ? [
    ...hasNorthEastCorner ? ["north-east"] : [],
    ...hasNorthWestCorner ? ["north-west"] : []
  ] : []);
  const cornerFillers = generateCornerFillers(room, activeWalls, w).filter((filler) => filler.type !== "wall" || !catalogCornerWalls.has(filler.corner));
  const appliances = resolveAppliances(allReservations, room, activeWalls, cabinets, w);
  const doorGapRanges = (room.doors ?? []).map((d) => ({
    wall: d.wall,
    min: d.offset,
    max: d.offset + d.width
  }));
  const countertops = generateCountertops(cabinets, cornerFillers, appliances, doorGapRanges, false, applianceOpenings);
  const resolvedDoors = resolveDoors(room, activeWalls, w);
  const resolvedWindows = (room.windows ?? []).flatMap((win) => {
    if (win.wall === "angled")
      return [];
    const winY = win.fromFloor + win.height / 2;
    const geo = wallGeometry(win.wall, room, activeWalls);
    const runCenter = win.offset + win.width / 2;
    const position = {
      x: geo.runAxis === "x" ? runCenter : geo.fixedCoord,
      y: winY,
      z: geo.runAxis === "z" ? runCenter : geo.fixedCoord
    };
    const rotation = geo.rotation;
    return [{ id: win.id, wall: win.wall, position, width: win.width, height: win.height, fromFloor: win.fromFloor, rotation }];
  });
  const islandPanels = [];
  const assemblies = [];
  if (islandDimensions && islandZone) {
    const { centerX, centerZ } = placeIslandInZone(islandZone, islandDimensions, w, islandRng);
    const island = materializeIslandAssembly({
      width: islandDimensions.width,
      depth: islandDimensions.depth,
      centerX,
      centerZ,
      rng: islandRng,
      allowedSpecIds
    });
    if (island.assembly.lifecycle === "active") {
      cabinets.push(...island.cabinets);
      countertops.push(...island.countertops);
      islandPanels.push(...island.panels);
      assemblies.push(island.assembly);
    }
  }
  if (peninsulaDef) {
    const peninsula = materializePeninsulaAssembly({
      room,
      def: peninsulaDef,
      parentCountertops: countertops,
      rng: peninsulaRng,
      allowedSpecIds
    });
    if (peninsula.assembly.lifecycle === "active") {
      cabinets.push(...peninsula.cabinets);
      countertops.push(...peninsula.countertops);
      islandPanels.push(...peninsula.panels);
      assemblies.push(peninsula.assembly);
    }
  }
  appendArchitecturalSegmentPeninsula(room, architecturalSegment, peninsulaRng, allowedSpecIds, cabinets, countertops, assemblies);
  const fridgeCoverBoards = [];
  const fridgeAppliance = appliances.find((a) => a.category === "refrigerator");
  if (fridgeAppliance) {
    const boards = generateFridgeCoverBoards(fridgeAppliance, room);
    fridgeCoverBoards.push(...boards);
  }
  const endPanelCoverBoards = generateWallCoverBoards(cabinets, applianceOpenings, activeWalls, resolvedDoors, resolvedWindows, room);
  const crownMolding = generateCrownMolding(cabinets, cornerFillers, activeWalls, appliances);
  const ceilingFillerPanels = generateCeilingFillerPanels(cabinets, cornerFillers, activeWalls, appliances, room.ceilingHeight);
  const resolvedRoom = {
    layout: room.layout,
    width: room.width,
    depth: room.depth,
    ceilingHeight: room.ceilingHeight,
    lRoomNotchWidth: isLRoom ? lRoomNW : undefined,
    lRoomNotchDepth: isLRoom ? lRoomND : undefined
  };
  return normalizeSceneConfig({
    layoutDecisionContext: { schemaVersion: 1, rootSeed },
    room: resolvedRoom,
    cabinets,
    countertops,
    cornerFillers,
    appliances,
    applianceOpenings,
    islandPanels,
    ...assemblies.length > 0 ? { assemblies } : {},
    fridgeCoverBoards,
    endPanelCoverBoards,
    crownMolding,
    ceilingFillerPanels,
    doors: resolvedDoors,
    windows: resolvedWindows,
    ...architecturalSegment ? { architecturalSegments: [architecturalSegment] } : {}
  });
}

// ../../apps/web/src/lib/layout/resolve-products.ts
function applyResolvedProducts(cabinets, response) {
  const resolvedByCode = new Map(response.resolved.map((r) => [r.canonicalCode.toUpperCase(), r]));
  return cabinets.map((cabinet) => {
    if (isRenderOnlyCabinet(cabinet)) {
      return clearCatalogIdentity(cabinet, "render-only");
    }
    const code = cabinet.spec.id?.toUpperCase();
    const match = code ? resolvedByCode.get(code) : undefined;
    if (code && match) {
      const clean = clearCatalogIdentity(cabinet, "catalog-product");
      return {
        ...clean,
        canonicalCode: match.canonicalCode,
        productId: match.productId,
        sku: match.sku,
        cabinetName: match.name,
        listPriceCents: match.listPriceCents,
        catalogState: "catalog-product",
        manufacturerCode: response.manufacturerCode,
        finishCode: response.finishCode
      };
    }
    return clearCatalogIdentity(cabinet, "unresolved");
  });
}

// ../../apps/web/src/lib/2020/cnc-code.ts
var CNC_PREFIX_TO_CANONICAL = {
  B: "B",
  SB: "SB",
  DB: "DB",
  FSB: "FSB",
  BSP: "BSR",
  MCB: "BMC",
  BWBK: "WB",
  LS: "BLS",
  BLB: "BBC",
  BEC: "BEC",
  CAR: "BEA",
  CW: "WDC",
  UC: "T",
  OVB: "OVD",
  OVD: "OVD",
  OV: "OVD",
  V: "V",
  WEC: "WEC",
  MW: "WMC"
};
var CNC_PREFIXES = Object.keys(CNC_PREFIX_TO_CANONICAL).sort((a, b) => b.length - a.length);
var CNC_TWO_DIM_TYPES = new Set(["W", "WDC", "WEC", "WMC"]);
var CNC_BASE_TYPES = new Set([
  "B",
  "SB",
  "DB",
  "FSB",
  "BSR",
  "BMC",
  "WB",
  "BLS",
  "BBC",
  "BEC",
  "BEA",
  "V"
]);
var CNC_TALL_TYPES = new Set(["T", "OVD"]);
var SIDE_LETTERS = new Set(["L", "R", "W"]);

// ../../apps/web/src/lib/2020/build-cabinet-specs.ts
var FLOOR_TIER = new Set([
  "base",
  "base-fulldoor",
  "sink-base",
  "tall",
  "oven-tall",
  "oven-tall-d",
  "base-drawer",
  "base-microwave",
  "corner-base"
]);
var COUNTER_BEARING_FLOOR = new Set([
  "base",
  "base-fulldoor",
  "sink-base",
  "base-drawer",
  "base-microwave",
  "corner-base"
]);
var WALL_TIER = new Set([
  "wall",
  "wall-glass",
  "wall-open",
  "wall-microwave",
  "wine-rack",
  "corner-wall"
]);

// ../../apps/web/src/lib/2020/match-catalog.ts
var TWO_DIM_PREFIXES2 = new Set([
  "W",
  "WRF",
  "WP",
  "GW",
  "GD",
  "OC",
  "WMC",
  "WWR",
  "WR",
  "WBC",
  "WDC",
  "WER",
  "WEC",
  "WES",
  "WLS",
  "WFD",
  "WSF",
  "D",
  "GC-W",
  "GD-WDC",
  "VAL",
  "T",
  "TP",
  "PC",
  "OVD"
]);

// ../../apps/web/src/lib/layout/placement.ts
function rebuildPlacementDerivedGeometry(config) {
  const cabinets = config.cabinets;
  const appliances = config.appliances ?? [];
  const cornerFillers = config.cornerFillers ?? [];
  const activeWalls = new Set;
  for (const cabinet of cabinets) {
    if (cabinet.wall && cabinet.wall !== "angled")
      activeWalls.add(cabinet.wall);
  }
  const fridge = appliances.find((appliance) => appliance.category === "refrigerator");
  const assemblyCountertops = (config.countertops ?? []).filter((countertop) => countertop.assemblyId || countertop.id === "countertop-island");
  return normalizeSceneConfig({
    ...config,
    countertops: [
      ...generateCountertops(cabinets, cornerFillers, appliances, [], false, config.applianceOpenings ?? []),
      ...assemblyCountertops
    ],
    fridgeCoverBoards: fridge ? generateFridgeCoverBoards(fridge, config.room) : [],
    endPanelCoverBoards: generateCabinetRunCoverBoards(cabinets, activeWalls, config.applianceOpenings ?? [], config.room),
    crownMolding: generateCrownMolding(cabinets, cornerFillers, activeWalls, appliances)
  });
}

// src/index.ts
var ENGINE_VERSION = "0.1.0";
var DEFAULT_ENGINE_SEED = 20260727;
var CM_PER_INCH = 2.54;
var cmToIn = (cm) => cm / CM_PER_INCH;
var PILOT_REFERENCE_VALUE = {
  runWidthCm: 410,
  cabinetDepthCm: 60,
  counterTopCm: 88,
  plinthCm: 10,
  backsplashGapCm: 60,
  upperHeightCm: 72,
  upperTopCm: 220,
  envelopeHeightCm: 240,
  segments: [
    { id: "fridge", widthCm: 102 },
    { id: "dishwasher", widthCm: 61 },
    { id: "sink", widthCm: 103 },
    { id: "oven", widthCm: 74 },
    { id: "storage", widthCm: 70 }
  ]
};
var PILOT_REFERENCE = Object.freeze(PILOT_REFERENCE_VALUE);
var PILOT_KITCHEN_INPUT_VALUE = {
  seed: DEFAULT_ENGINE_SEED,
  room: {
    layout: "one-wall",
    widthIn: cmToIn(PILOT_REFERENCE.runWidthCm),
    depthIn: cmToIn(380),
    ceilingHeightIn: cmToIn(PILOT_REFERENCE.envelopeHeightCm),
    island: false,
    peninsula: false,
    dishwasher: false,
    appliances: [
      { id: "pilot-fridge", category: "refrigerator", wall: "north", offsetIn: 0 },
      {
        id: "pilot-dishwasher",
        category: "dishwasher",
        wall: "north",
        offsetIn: cmToIn(102)
      },
      {
        id: "pilot-sink",
        category: "sink",
        wall: "north",
        offsetIn: cmToIn(163 + (103 - 76.2) / 2)
      },
      {
        id: "pilot-range",
        category: "range",
        wall: "north",
        offsetIn: cmToIn(266 + (74 - 76.2) / 2)
      }
    ]
  }
};
var PILOT_KITCHEN_INPUT = Object.freeze(PILOT_KITCHEN_INPUT_VALUE);
function finitePositive(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number greater than zero`);
  }
}
function finiteNonNegative(value, name) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite non-negative number`);
  }
}
function cloneCatalog(catalog) {
  return catalog ? {
    ...catalog,
    resolved: catalog.resolved.map((product) => ({ ...product })),
    unresolved: catalog.unresolved.map((product) => ({ ...product }))
  } : undefined;
}
function normalizeRoom(room) {
  finitePositive(room.widthIn, "room.widthIn");
  finitePositive(room.depthIn, "room.depthIn");
  finitePositive(room.ceilingHeightIn, "room.ceilingHeightIn");
  const ids = new Set;
  const registerId = (id, path) => {
    if (!id.trim())
      throw new RangeError(`${path}.id must be non-empty`);
    if (ids.has(id))
      throw new RangeError(`${path}.id must be unique`);
    ids.add(id);
  };
  room.doors?.forEach((door, index) => {
    registerId(door.id, `room.doors[${index}]`);
    finiteNonNegative(door.offsetIn, `room.doors[${index}].offsetIn`);
    finitePositive(door.widthIn, `room.doors[${index}].widthIn`);
  });
  room.windows?.forEach((window, index) => {
    registerId(window.id, `room.windows[${index}]`);
    finiteNonNegative(window.offsetIn, `room.windows[${index}].offsetIn`);
    finitePositive(window.widthIn, `room.windows[${index}].widthIn`);
    finitePositive(window.heightIn, `room.windows[${index}].heightIn`);
    finiteNonNegative(window.fromFloorIn, `room.windows[${index}].fromFloorIn`);
  });
  room.appliances?.forEach((appliance, index) => {
    registerId(appliance.id, `room.appliances[${index}]`);
    finiteNonNegative(appliance.offsetIn, `room.appliances[${index}].offsetIn`);
  });
  const notchPair = room.lRoomNotchWidthIn !== undefined || room.lRoomNotchDepthIn !== undefined;
  if (notchPair) {
    if (room.lRoomNotchWidthIn === undefined || room.lRoomNotchDepthIn === undefined) {
      throw new RangeError("L-room notch width and depth must be provided together");
    }
    finitePositive(room.lRoomNotchWidthIn, "room.lRoomNotchWidthIn");
    finitePositive(room.lRoomNotchDepthIn, "room.lRoomNotchDepthIn");
  }
  return {
    ...room,
    doors: room.doors?.map((door) => ({ ...door })),
    windows: room.windows?.map((window) => ({ ...window })),
    appliances: room.appliances?.map((appliance) => ({ ...appliance }))
  };
}
function normalizeInput(input) {
  const room = normalizeRoom(input.room);
  const seed = (input.seed ?? DEFAULT_ENGINE_SEED) >>> 0;
  const allowedSpecIds = input.allowedSpecIds ? Array.from(new Set(input.allowedSpecIds.map((id) => id.trim()).filter(Boolean))).sort() : undefined;
  return {
    room,
    seed,
    ...allowedSpecIds ? { allowedSpecIds } : {},
    ...input.catalog ? { catalog: cloneCatalog(input.catalog) } : {}
  };
}
function toRoomDefinition(room) {
  return {
    layout: room.layout,
    width: room.widthIn,
    depth: room.depthIn,
    ceilingHeight: room.ceilingHeightIn,
    island: room.island,
    peninsula: room.peninsula,
    dishwasher: room.dishwasher,
    doors: room.doors?.map((door) => ({
      id: door.id,
      wall: door.wall,
      offset: door.offsetIn,
      width: door.widthIn,
      hingeSide: door.hingeSide,
      swingDirection: door.swingDirection
    })),
    windows: room.windows?.map((window) => ({
      id: window.id,
      wall: window.wall,
      offset: window.offsetIn,
      width: window.widthIn,
      height: window.heightIn,
      fromFloor: window.fromFloorIn
    })),
    appliances: room.appliances?.map((appliance) => ({
      id: appliance.id,
      category: appliance.category,
      wall: appliance.wall,
      offset: appliance.offsetIn
    })),
    lRoomNotchWidth: room.lRoomNotchWidthIn,
    lRoomNotchDepth: room.lRoomNotchDepthIn
  };
}
function toResolveResponse(catalog) {
  return {
    manufacturerCode: catalog.manufacturerCode,
    finishCode: catalog.finishCode,
    manufacturerName: catalog.manufacturerName,
    finishName: catalog.finishName,
    resolved: catalog.resolved.map((product) => ({
      canonicalCode: product.canonicalCode,
      qty: product.quantity,
      productId: product.productId,
      sku: product.sku,
      name: product.name,
      cabinetType: product.cabinetType ?? null,
      listPriceCents: product.listPriceCents,
      widthIn: product.widthIn ?? null,
      heightIn: product.heightIn ?? null,
      depthIn: product.depthIn ?? null
    })),
    unresolved: catalog.unresolved.map((product) => ({
      canonicalCode: product.canonicalCode,
      qty: product.quantity,
      reason: product.reason
    }))
  };
}
function applyCatalog(config, catalog) {
  if (!catalog) {
    return {
      ...config,
      cabinets: config.cabinets.map((cabinet) => clearCatalogIdentity(cabinet, cabinet.catalogState === "render-only" ? "render-only" : "pending"))
    };
  }
  return {
    ...config,
    activeFinish: {
      manufacturerCode: catalog.manufacturerCode,
      finishCode: catalog.finishCode
    },
    cabinets: applyResolvedProducts(config.cabinets, toResolveResponse(catalog))
  };
}
function vector(x, y, z) {
  return { x, y, z };
}
function transform(positionIn, rotationYDeg = 0, rotationXDeg = 0, rotationZDeg = 0) {
  return {
    positionIn,
    rotationDeg: vector(rotationXDeg, rotationYDeg, rotationZDeg)
  };
}
function box(dimensionsIn, materialKey, color, localTransform = transform(vector(0, 0, 0)), space = "component-local") {
  return {
    kind: "box",
    space,
    dimensionsIn,
    transform: localTransform,
    materialKey,
    ...color ? { color } : {}
  };
}
function cabinetComponent(cabinet) {
  const geometry = cabinet.panels.map((panel) => box(vector(panel.width, panel.height, panel.thickness), `cabinet-panel:${panel.material}`, panel.color, transform(vector(panel.localPosition.x, panel.localPosition.y, panel.localPosition.z), panel.localRotation.y, panel.localRotation.x, panel.localRotation.z)));
  return {
    id: cabinet.id,
    kind: "cabinet",
    subtype: cabinet.spec.type,
    name: cabinet.cabinetName ?? cabinet.spec.name,
    transform: transform(vector(cabinet.position.x, cabinet.position.y, cabinet.position.z), cabinet.rotation),
    dimensionsIn: vector(cabinet.spec.width, cabinet.spec.height, cabinet.spec.depth),
    wall: cabinet.wall,
    geometry,
    planOutlineIn: cabinetFootprintPolygon(cabinet),
    catalogState: cabinet.catalogState,
    ...cabinet.assemblyId ? { assemblyId: cabinet.assemblyId } : {},
    ...cabinet.productId && cabinet.sku && cabinet.canonicalCode && cabinet.manufacturerCode && cabinet.finishCode ? {
      catalog: {
        productId: cabinet.productId,
        sku: cabinet.sku,
        canonicalCode: cabinet.canonicalCode,
        manufacturerCode: cabinet.manufacturerCode,
        finishCode: cabinet.finishCode
      }
    } : {}
  };
}
function componentsFromScene(config) {
  const components = config.cabinets.map(cabinetComponent);
  for (const countertop of config.countertops ?? []) {
    const outline = countertop.outline ?? countertop.polygon;
    const geometry = outline?.length ? [{
      kind: "polygon-prism",
      space: "world",
      outlineIn: outline.map((point) => ({ ...point })),
      heightIn: countertop.thickness,
      baseYIn: countertop.position.y - countertop.thickness,
      materialKey: `countertop:${countertop.material}`,
      color: countertop.color,
      holesIn: countertop.holes?.map((hole) => ({
        id: hole.id,
        kind: hole.kind,
        outlineIn: hole.outline.map((point) => ({ ...point }))
      }))
    }] : [box(vector(countertop.width, countertop.thickness, countertop.depth), `countertop:${countertop.material}`, countertop.color)];
    components.push({
      id: countertop.id,
      kind: "countertop",
      subtype: countertop.material,
      name: "Countertop",
      transform: transform(vector(countertop.position.x, countertop.position.y, countertop.position.z), countertop.rotation),
      dimensionsIn: vector(countertop.width, countertop.thickness, countertop.depth),
      wall: countertop.wall,
      geometry,
      planOutlineIn: outline?.map((point) => ({ ...point })),
      ...countertop.assemblyId ? { assemblyId: countertop.assemblyId } : {}
    });
  }
  for (const appliance of config.appliances ?? []) {
    components.push({
      id: appliance.id,
      kind: "appliance",
      subtype: appliance.category,
      name: appliance.category,
      transform: transform(vector(appliance.position.x, appliance.position.y, appliance.position.z), appliance.rotation),
      dimensionsIn: vector(appliance.width, appliance.height, appliance.depth),
      wall: appliance.wall,
      geometry: [box(vector(appliance.width, appliance.height, appliance.depth), `appliance:${appliance.category}`, appliance.color)],
      ...appliance.assemblyId ? { assemblyId: appliance.assemblyId } : {}
    });
  }
  for (const opening of config.applianceOpenings ?? []) {
    components.push({
      id: opening.id,
      kind: "appliance-opening",
      subtype: opening.category,
      name: opening.category,
      transform: transform(vector(opening.position.x, opening.position.y, opening.position.z), opening.rotation),
      dimensionsIn: vector(opening.width, opening.height, opening.depth),
      wall: opening.wall,
      geometry: []
    });
  }
  for (const door of config.doors ?? []) {
    components.push({
      id: door.id,
      kind: "door",
      subtype: "architectural-opening",
      name: "Door",
      transform: transform(vector(door.position.x, door.position.y, door.position.z), door.rotation),
      dimensionsIn: vector(door.width, door.height, 1),
      wall: door.wall,
      geometry: []
    });
  }
  for (const window of config.windows ?? []) {
    components.push({
      id: window.id,
      kind: "window",
      subtype: "architectural-opening",
      name: "Window",
      transform: transform(vector(window.position.x, window.position.y, window.position.z), window.rotation),
      dimensionsIn: vector(window.width, window.height, 1),
      wall: window.wall,
      geometry: []
    });
  }
  for (const filler of config.cornerFillers ?? []) {
    const mesh = filler.geometry ? {
      kind: "triangle-mesh",
      space: "component-local",
      positionsIn: [...filler.geometry.positions],
      indices: [...filler.geometry.indices],
      transform: transform(vector(0, 0, 0)),
      materialKey: "cabinet-filler",
      color: filler.color
    } : null;
    components.push({
      id: filler.id,
      kind: "filler",
      subtype: filler.type,
      name: `${filler.type} filler`,
      transform: transform(vector(filler.position.x, filler.position.y, filler.position.z)),
      dimensionsIn: vector(filler.width, filler.height, filler.depth),
      wall: null,
      geometry: mesh ? [mesh] : [box(vector(filler.width, filler.height, filler.depth), "cabinet-filler", filler.color)]
    });
  }
  const addPanel = (panel, subtype) => components.push({
    id: panel.id,
    kind: "panel",
    subtype,
    name: subtype,
    transform: transform(vector(panel.position.x, panel.position.y, panel.position.z), panel.rotation),
    dimensionsIn: vector(panel.width, panel.height, panel.thickness),
    wall: null,
    geometry: [box(vector(panel.width, panel.height, panel.thickness), `panel:${subtype}`, panel.color)],
    ...panel.assemblyId ? { assemblyId: panel.assemblyId } : {}
  });
  for (const panel of config.islandPanels ?? [])
    addPanel(panel, "island-panel");
  for (const panel of config.fridgeCoverBoards ?? [])
    addPanel(panel, "fridge-cover-board");
  for (const panel of config.endPanelCoverBoards ?? [])
    addPanel(panel, panel.purpose ?? "end-panel");
  for (const molding of config.crownMolding ?? []) {
    components.push({
      id: molding.id,
      kind: "trim",
      subtype: "crown-molding",
      name: "Crown molding",
      transform: transform(vector(molding.position.x, molding.position.y, molding.position.z), molding.rotation),
      dimensionsIn: vector(molding.length, molding.height, molding.depth),
      wall: molding.wall,
      geometry: [box(vector(molding.length, molding.height, molding.depth), "trim:crown-molding", molding.color)]
    });
  }
  for (const filler of config.ceilingFillerPanels ?? []) {
    components.push({
      id: filler.id,
      kind: "trim",
      subtype: "ceiling-filler",
      name: "Ceiling filler",
      transform: transform(vector(filler.position.x, filler.position.y, filler.position.z), filler.rotation),
      dimensionsIn: vector(filler.length, filler.height, filler.depth),
      wall: filler.wall,
      geometry: [box(vector(filler.length, filler.height, filler.depth), "trim:ceiling-filler", filler.color)]
    });
  }
  return components.sort((a, b) => a.id.localeCompare(b.id));
}
function relationshipsFromScene(config) {
  return (config.sceneRelationships ?? []).map((relationship) => ({
    id: relationship.id,
    kind: relationship.kind,
    sourceComponentId: relationship.sourceObjectId,
    targetComponentId: relationship.targetObjectId,
    ...relationship.role ? { role: relationship.role } : {}
  })).sort((a, b) => a.id.localeCompare(b.id));
}
function catalogStatus(config, catalog) {
  if (!catalog)
    return "idle";
  return inspectCatalogIntegrity(config.cabinets, catalog.unresolved.length > 0 ? "incomplete" : "ready").isComplete ? "ready" : "incomplete";
}
function resultFromScene(input, config, diagnostics = [], pinnedComponentIds = []) {
  const status = catalogStatus(config, input.catalog);
  const catalogDiagnostic = status === "incomplete" ? [{
    code: "catalog-incomplete",
    message: "One or more geometry candidates lack verified catalog identity; checkout must remain disabled.",
    severity: "warning"
  }] : [];
  return {
    schemaVersion: 1,
    engineVersion: ENGINE_VERSION,
    input,
    components: componentsFromScene(config),
    relationships: relationshipsFromScene(config),
    diagnostics: [...diagnostics, ...catalogDiagnostic],
    pinnedComponentIds: [...pinnedComponentIds].sort(),
    engineState: { schemaVersion: 1, scene: config }
  };
}
function generateScene(input) {
  const generated = generateLayout(toRoomDefinition(input.room), undefined, input.seed, input.allowedSpecIds);
  return applyCatalog(generated, input.catalog);
}
function generateKitchen(input) {
  const normalized = normalizeInput(input);
  return resultFromScene(normalized, generateScene(normalized));
}
function internalScene(result) {
  const scene = result.engineState?.scene;
  if (!scene || typeof scene !== "object")
    return null;
  const candidate = scene;
  return candidate.room && Array.isArray(candidate.cabinets) ? candidate : null;
}
function mergeRequest(previous, request) {
  const room = {
    ...previous.room,
    ...request.room
  };
  const catalog = request.catalog === null ? undefined : request.catalog ?? previous.catalog;
  return normalizeInput({
    room,
    seed: request.seed ?? previous.seed,
    allowedSpecIds: request.allowedSpecIds ?? previous.allowedSpecIds,
    ...catalog ? { catalog } : {}
  });
}
function editedCabinet(source, edit) {
  const position = edit?.positionIn;
  return {
    ...source,
    position: {
      x: position?.x ?? source.position.x,
      y: position?.y ?? source.position.y,
      z: position?.z ?? source.position.z
    },
    rotation: edit?.rotationYDeg ?? source.rotation,
    wall: edit?.wall === undefined ? source.wall : edit.wall
  };
}
function inRoomBounds(config, cabinet) {
  if (!Number.isFinite(cabinet.position.y) || cabinet.position.y < -0.01 || cabinet.position.y + cabinet.spec.height > config.room.ceilingHeight + 0.01)
    return false;
  const outline = cabinetFootprintPolygon(cabinet);
  return outline.every((point) => point.x >= -0.01 && point.z >= -0.01 && point.x <= config.room.width + 0.01 && point.z <= config.room.depth + 0.01);
}
function reconcilePins(previous, generated, request, pinnedIds) {
  const diagnostics = [];
  const requestedPins = Array.from(new Set(pinnedIds)).sort();
  const pinSet = new Set(requestedPins);
  let config = {
    ...generated,
    cabinets: generated.cabinets.filter((cabinet) => !pinSet.has(cabinet.id))
  };
  const acceptedPins = [];
  for (const id of requestedPins) {
    const previousCabinet = previous.cabinets.find((cabinet) => cabinet.id === id);
    const generatedCabinet = generated.cabinets.find((cabinet) => cabinet.id === id);
    if (!previousCabinet) {
      diagnostics.push({
        code: "pin-not-found",
        message: `Pinned component ${id} does not exist in the previous engine state.`,
        componentIds: [id],
        severity: "error"
      });
      continue;
    }
    if (previousCabinet.assemblyId) {
      diagnostics.push({
        code: "pin-assembly-member-unsupported",
        message: `Pinned component ${id} belongs to an atomic assembly and cannot be reconciled independently.`,
        componentIds: [id],
        severity: "error"
      });
      continue;
    }
    const cleanSource = clearCatalogIdentity(generatedCabinet ?? previousCabinet, "pending");
    const sourceWithPreviousTransform = {
      ...cleanSource,
      position: { ...previousCabinet.position },
      rotation: previousCabinet.rotation,
      wall: previousCabinet.wall
    };
    const proposed = editedCabinet(sourceWithPreviousTransform, request.componentEdits?.[id]);
    if (!inRoomBounds(config, proposed)) {
      diagnostics.push({
        code: "pin-out-of-bounds",
        message: `Pinned component ${id} falls outside the updated room envelope.`,
        componentIds: [id],
        severity: "error"
      });
      continue;
    }
    const collidingIds = config.cabinets.filter((cabinet) => cabinetCollision(config, proposed, cabinet) !== null).map((cabinet) => cabinet.id);
    const acceptedConflict = collidingIds.find((candidateId) => acceptedPins.includes(candidateId));
    if (acceptedConflict) {
      diagnostics.push({
        code: "pin-placement-conflict",
        message: `Pinned component ${id} conflicts with pinned component ${acceptedConflict}.`,
        componentIds: [id, acceptedConflict],
        severity: "error"
      });
      continue;
    }
    const withoutGeneratedCollisions = {
      ...config,
      cabinets: config.cabinets.filter((cabinet) => !collidingIds.includes(cabinet.id))
    };
    if (!canPlaceCabinet(withoutGeneratedCollisions, proposed)) {
      diagnostics.push({
        code: "pin-placement-conflict",
        message: `Pinned component ${id} conflicts with an opening or reserved appliance bay.`,
        componentIds: [id],
        severity: "error"
      });
      continue;
    }
    const candidate = {
      ...withoutGeneratedCollisions,
      cabinets: [...withoutGeneratedCollisions.cabinets, proposed]
    };
    if (findCabinetCollisions(candidate).length > 0) {
      diagnostics.push({
        code: "pin-placement-conflict",
        message: `Pinned component ${id} conflicts with the updated kitchen geometry.`,
        componentIds: [id],
        severity: "error"
      });
      continue;
    }
    config = candidate;
    acceptedPins.push(id);
  }
  return {
    config: rebuildPlacementDerivedGeometry(config),
    diagnostics,
    acceptedPins
  };
}
function reconcileKitchen(previous, request, pinnedIds) {
  const previousScene = internalScene(previous);
  if (!previousScene) {
    throw new TypeError("previous.engineState is not a valid Magic Cabinet engine state");
  }
  const input = mergeRequest(previous.input, request);
  const generated = generateLayout(toRoomDefinition(input.room), undefined, input.seed, input.allowedSpecIds);
  const reconciled = reconcilePins(previousScene, generated, request, pinnedIds);
  const config = applyCatalog(reconciled.config, input.catalog);
  return resultFromScene(input, config, reconciled.diagnostics, reconciled.acceptedPins);
}
function finiteVector(value) {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
}
function componentGeometryFinite(component) {
  if (!finiteVector(component.transform.positionIn) || !finiteVector(component.transform.rotationDeg))
    return false;
  if (!finiteVector(component.dimensionsIn))
    return false;
  if (component.dimensionsIn.x < 0 || component.dimensionsIn.y < 0 || component.dimensionsIn.z < 0)
    return false;
  return component.geometry.every((primitive) => {
    if (primitive.kind === "box") {
      return finiteVector(primitive.dimensionsIn) && finiteVector(primitive.transform.positionIn) && finiteVector(primitive.transform.rotationDeg);
    }
    if (primitive.kind === "triangle-mesh") {
      return primitive.positionsIn.every(Number.isFinite) && primitive.indices.every(Number.isInteger) && finiteVector(primitive.transform.positionIn) && finiteVector(primitive.transform.rotationDeg);
    }
    return Number.isFinite(primitive.heightIn) && Number.isFinite(primitive.baseYIn) && primitive.outlineIn.every((point) => Number.isFinite(point.x) && Number.isFinite(point.z)) && (primitive.holesIn ?? []).every((hole) => hole.outlineIn.every((point) => Number.isFinite(point.x) && Number.isFinite(point.z)));
  });
}
function validateKitchen(result) {
  const issues = [...result.diagnostics];
  const ids = new Set;
  for (const component of result.components) {
    if (ids.has(component.id)) {
      issues.push({
        code: "duplicate-component-id",
        message: `Component id ${component.id} appears more than once.`,
        componentIds: [component.id],
        severity: "error"
      });
    }
    ids.add(component.id);
    if (!componentGeometryFinite(component)) {
      issues.push({
        code: "non-finite-geometry",
        message: `Component ${component.id} contains invalid geometry.`,
        componentIds: [component.id],
        severity: "error"
      });
    }
  }
  const scene = internalScene(result);
  let sceneValid = false;
  if (!scene) {
    issues.push({
      code: "scene-integrity",
      message: "The opaque engine scene is missing or malformed.",
      severity: "error"
    });
  } else {
    const integrity = inspectSceneIntegrity(scene);
    sceneValid = integrity.isValid;
    if (!integrity.isValid) {
      issues.push({
        code: "scene-integrity",
        message: "The scene identity or relationship graph is invalid.",
        componentIds: Array.from(new Set([
          ...integrity.identityViolations.flatMap((violation) => violation.objectId ? [violation.objectId] : []),
          ...integrity.relationshipViolations.flatMap((violation) => [
            ...violation.sourceObjectId ? [violation.sourceObjectId] : [],
            ...violation.targetObjectId ? [violation.targetObjectId] : []
          ])
        ])).sort(),
        severity: "error"
      });
    }
    const collisions = findCabinetCollisions(scene);
    if (collisions.length > 0) {
      issues.push({
        code: "cabinet-collision",
        message: "The kitchen contains overlapping cabinet volumes.",
        componentIds: Array.from(new Set(collisions.flatMap((collision) => [collision.firstId, collision.secondId]))).sort(),
        severity: "error"
      });
    }
  }
  const geometryValid = !issues.some((issue) => issue.severity === "error" && (issue.code === "duplicate-component-id" || issue.code === "non-finite-geometry" || issue.code === "cabinet-collision" || issue.code.startsWith("pin-")));
  const commerceReady = buildCommerceContext(result) !== null;
  return {
    valid: geometryValid && sceneValid,
    geometryValid,
    sceneValid,
    commerceReady,
    issues
  };
}
function buildCommerceContext(result) {
  const scene = internalScene(result);
  if (!scene)
    return null;
  const context = buildCatalogQuoteContext(scene.cabinets);
  if (!context)
    return null;
  return {
    schemaVersion: 1,
    pricingAuthority: "server",
    requiresServerQuote: true,
    manufacturerCode: context.manufacturerCode,
    finishCode: context.finishCode,
    items: context.items
  };
}
export {
  validateKitchen,
  reconcileKitchen,
  generateKitchen,
  buildCommerceContext,
  PILOT_REFERENCE,
  PILOT_KITCHEN_INPUT,
  ENGINE_VERSION,
  DEFAULT_ENGINE_SEED
};

//# debugId=216CB545A7079A5664756E2164756E21
