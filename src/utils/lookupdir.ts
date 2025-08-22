import process from 'node:process'
import fsPromises from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import { URL } from 'node:url'

const toPath = (urlOrPath: string | URL) => {
  return urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath
}

/**
 * Options for lookUp and lookUpSync.
 * - cwd: where to start searching (defaults to process.cwd()).
 * - type: whether to look for a file or a directory (defaults to 'file').
 * - stopAt: directory where the search should stop (defaults to filesystem root).
 */
export type LoopUpOptions = {
  cwd?: string | URL
  type?: 'file' | 'directory'
  stopAt?: string | URL
}

/**
 * Yields ancestor directories starting at `start`, up to and including `stopAt` or the filesystem root.
 */
function * ancestors (start: string, stopAt: string, root: string): Generator<string> {
  let dir = start
  while (dir) {
    yield dir
    if (dir === stopAt || dir === root) break
    const next = path.dirname(dir)
    if (next === dir) break
    dir = next
  }
}

/**
 * Walk up directories to find the first matching path.
 * Returns the absolute path to the found item or null if not found.
 */
export async function lookUp (name: string, options: LoopUpOptions = {}) {
  const { type = 'file' } = options || {}
  const cwd = toPath(options.cwd ?? process.cwd())
  let directory = path.resolve(cwd ?? '')
  const { root } = path.parse(directory)
  const stopAt = path.resolve(directory, toPath(options.stopAt ?? root))
  const isAbsoluteName = path.isAbsolute(name)

  const matches = (stats?: fs.Stats | null) =>
    type === 'file' ? stats?.isFile() : stats?.isDirectory()

  // Absolute path: single check, no traversal needed.
  if (isAbsoluteName) {
    try {
      const stats = await fsPromises.stat(name)
      return matches(stats) ? name : null
    } catch {
      // If stat fails (e.g., ENOENT), treat as not found.
      return null
    }
  }

  for (const dir of ancestors(directory, stopAt, root)) {
    const filePath = path.join(dir, name)
    try {
      // eslint-disable-next-line no-await-in-loop
      const stats = await fsPromises.stat(filePath)
      if (matches(stats)) return filePath
    } catch {
      // Ignore and continue walking up (e.g., ENOENT or permission errors on this level)
    }
  }

  return null
}

/**
 * Synchronous variant of lookUp.
 * Returns the absolute path to the found item or null if not found.
 */
export function lookUpSync (name: string, options: LoopUpOptions = {}) {
  const { type = 'file' } = options || {}
  const cwd = toPath(options.cwd ?? process.cwd())
  let directory = path.resolve(cwd ?? '')
  const { root } = path.parse(directory)
  const stopAt = path.resolve(directory, toPath(options.stopAt ?? root))
  const isAbsoluteName = path.isAbsolute(name)

  const matches = (stats?: fs.Stats | null) =>
    type === 'file' ? stats?.isFile() : stats?.isDirectory()

  if (isAbsoluteName) {
    try {
      const stats = fs.statSync(name)
      return matches(stats) ? name : null
    } catch {
      return null
    }
  }

  for (const dir of ancestors(directory, stopAt, root)) {
    const filePath = path.join(dir, name)
    try {
      const stats = fs.statSync(filePath)
      if (matches(stats)) return filePath
    } catch {
      // Ignore and continue walking up
    }
  }

  return null
}
