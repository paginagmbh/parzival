export class Leaf {
  constructor (lr, lv, rr, rv, contents = [], parent) {
    Object.assign(this, { lr, lv, rr, rv, contents, parent })
  }

  static fromArray ([lr, lv, contents, rr, rv], parent) {
    const leaf = new Leaf(lr, lv, rr, rv, contents, parent)
    for (let li = 0, ll = contents.length; li < ll; li++) {
      contents[li] = Leaf.fromArray(contents[li], leaf)
    }
    return leaf
  }

  leftLeaf () {
    const { contents } = this
    for (let ci = 1, cl = contents.length; ci < cl; ci++) {
      if (contents[ci] === this) {
        return contents[ci - 1]
      }
    }
    return undefined
  }

  rightLeaf () {
    const { contents } = this
    for (let ci = 0, cl = contents.length - 1; ci < cl; ci++) {
      if (contents[ci] === this) {
        return contents[ci + 1]
      }
    }
    return undefined
  }
}

export const traverse = (leaf, fn, ancestors = [], parent, pos) => {
  const { lr, lv, rr, rv, contents } = leaf

  fn({ lr, lv, leaf }, ancestors, parent, pos)
  ancestors.unshift(leaf)

  for (let p = 0, l = contents.length; p < l; p++) {
    traverse(contents[p], fn, ancestors, leaf, p)
  }

  ancestors.shift()
  fn({ rr, rv, leaf }, ancestors, parent, pos)
}

export const pages = (leaf) => {
  const pages = []
  traverse(
    leaf,
    ({ lr, lv, rr, rv }) => [lr, lv, rr, rv]
      .filter(p => p)
      .forEach(p => pages.push(p))
  )
  return pages
}

export const leafs = (pages) => {
  const [ page ] = pages
  if (!page) {
    return []
  }

  const leafs = [[]]
  let [ next ] = leafs

  if (page.page === 'r') {
    next.push(undefined)
  }

  for (let pc = 0, pl = pages.length; pc < pl; pc++) {
    const last = (pc + 1) === pl
    const page = pages[pc]

    next.push(page)

    switch (page.page) {
      case 'r':
        if (!last) {
          leafs.push(next = [])
        }
        break
      case 'v':
        if (last) {
          next.push(undefined)
        }
        break
    }
  }

  return leafs
}

export default { Leaf, pages, leafs }
