import { inflateRawSync } from "node:zlib"

export const MAX_BRIEF_FILE_BYTES = 10 * 1024 * 1024
export const BRIEF_FILE_MIMES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain", "text/csv", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] as const
type BriefMime = typeof BRIEF_FILE_MIMES[number]
const extensions: Record<BriefMime, string[]> = {
  "application/pdf": ["pdf"], "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"], "image/webp": ["webp"], "text/plain": ["txt"], "text/csv": ["csv"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
}
export function validBriefFile(value: { filename?: unknown; size?: unknown; mime?: unknown }) {
  const { filename, size, mime } = value
  if (typeof filename !== "string" || !filename.trim() || filename.length > 255 || /[\p{Cc}\p{Cf}/\\<>:"|?*]/u.test(filename) || typeof size !== "number" || !Number.isSafeInteger(size) || size < 1 || size > MAX_BRIEF_FILE_BYTES || typeof mime !== "string" || !BRIEF_FILE_MIMES.includes(mime as BriefMime)) return false
  const split = filename.lastIndexOf(".")
  return split > 0 && extensions[mime as BriefMime].includes(filename.slice(split + 1).toLowerCase())
}
export const validFileRevision = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2147483647
function fail(): never { throw new Error("Invalid brief file") }
const text = (bytes: Uint8Array) => new TextDecoder("utf-8", { fatal: true }).decode(bytes)
function plain(bytes: Buffer) {
  const value = text(bytes)
  if (/[\p{Cc}]/u.test(value.replace(/[\t\r\n]/g, "")) || /^\s*(?:<!doctype\s+html|<html\b|<svg\b|<script\b|#!)/i.test(value)) fail()
  return value
}
function validCsv(value: string) {
  // CSV can legitimately have one column. Check balanced RFC-style quoting;
  // commas, semicolons and tabs are supported without guessing a locale.
  let quoted = false, boundary = true
  for (let index = 0; index < value.length; index++) {
    const char = value[index]
    if (char === '"') {
      if (quoted && value[index + 1] === '"') index++
      else if (quoted) { quoted = false; boundary = false }
      else if (boundary) quoted = true
      else fail()
    } else if (!quoted) {
      if (",;\t\r\n".includes(char)) boundary = true
      else if (!/\s/.test(char)) boundary = false
    }
  }
  if (quoted) fail()
}
function crc32(bytes: Buffer) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
  }
  return (crc ^ 0xffffffff) >>> 0
}
function office(bytes: Buffer, mime: BriefMime) {
  // OOXML ZIP is parsed locally with bounded decompression. Generic ZIP files,
  // encryption, ZIP64, traversal, overlapping records and macro content fail.
  let end = -1
  for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 65557); index--) {
    if (bytes.readUInt32LE(index) === 0x06054b50 && index + 22 + bytes.readUInt16LE(index + 20) === bytes.length) { end = index; break }
  }
  if (end < 0 || bytes.readUInt16LE(end + 4) || bytes.readUInt16LE(end + 6)) fail()
  const count = bytes.readUInt16LE(end + 10), directorySize = bytes.readUInt32LE(end + 12), directory = bytes.readUInt32LE(end + 16)
  if (!count || count > 512 || count !== bytes.readUInt16LE(end + 8) || directory + directorySize !== end || directory >= end) fail()
  const parts = new Map<string, Buffer>(), ranges: [number, number][] = []
  let cursor = directory, expanded = 0
  for (let index = 0; index < count; index++) {
    if (cursor + 46 > end || bytes.readUInt32LE(cursor) !== 0x02014b50) fail()
    const flags = bytes.readUInt16LE(cursor + 8), method = bytes.readUInt16LE(cursor + 10), crc = bytes.readUInt32LE(cursor + 16), compressed = bytes.readUInt32LE(cursor + 20), size = bytes.readUInt32LE(cursor + 24)
    const nameLength = bytes.readUInt16LE(cursor + 28), extraLength = bytes.readUInt16LE(cursor + 30), commentLength = bytes.readUInt16LE(cursor + 32), offset = bytes.readUInt32LE(cursor + 42)
    if (flags & ~0x0808 || ![0, 8].includes(method) || compressed === 0xffffffff || size === 0xffffffff || offset === 0xffffffff || !nameLength || bytes.readUInt16LE(cursor + 34) || cursor + 46 + nameLength + extraLength + commentLength > end) fail()
    const nameBytes = bytes.subarray(cursor + 46, cursor + 46 + nameLength), name = text(nameBytes)
    if (parts.has(name) || !/^[A-Za-z0-9_. /\[\]-]+$/.test(name) || name.startsWith("/") || name.split("/").some(part => part === ".." || part === ".") || /vbaProject|\.exe$|\.js$|\.html?$/i.test(name)) fail()
    let extra = cursor + 46 + nameLength
    while (extra < cursor + 46 + nameLength + extraLength) {
      if (extra + 4 > cursor + 46 + nameLength + extraLength || bytes.readUInt16LE(extra) === 1) fail()
      extra += 4 + bytes.readUInt16LE(extra + 2)
    }
    if (extra !== cursor + 46 + nameLength + extraLength || offset + 30 > directory || bytes.readUInt32LE(offset) !== 0x04034b50 || bytes.readUInt16LE(offset + 6) !== flags || bytes.readUInt16LE(offset + 8) !== method || bytes.readUInt16LE(offset + 26) !== nameLength) fail()
    const start = offset + 30 + nameLength + bytes.readUInt16LE(offset + 28), finish = start + compressed
    if (start > directory || finish > directory || !bytes.subarray(offset + 30, offset + 30 + nameLength).equals(nameBytes) || expanded + size > 32 * 1024 * 1024 || size > 16 * 1024 * 1024) fail()
    if (!(flags & 8) && (bytes.readUInt32LE(offset + 14) !== crc || bytes.readUInt32LE(offset + 18) !== compressed || bytes.readUInt32LE(offset + 22) !== size)) fail()
    let rangeEnd = finish
    if (flags & 8) {
      if (rangeEnd + 12 > directory) fail()
      if (bytes.readUInt32LE(rangeEnd) === 0x08074b50) rangeEnd += 4
      if (rangeEnd + 12 > directory || bytes.readUInt32LE(rangeEnd) !== crc || bytes.readUInt32LE(rangeEnd + 4) !== compressed || bytes.readUInt32LE(rangeEnd + 8) !== size) fail()
      rangeEnd += 12
    }
    if (ranges.some(([a, b]) => offset < b && rangeEnd > a)) fail()
    ranges.push([offset, rangeEnd])
    const inflated = method === 0 ? bytes.subarray(start, finish) : inflateRawSync(bytes.subarray(start, finish), { maxOutputLength: 16 * 1024 * 1024 })
    if (inflated.length !== size || crc32(inflated) !== crc) fail()
    parts.set(name, inflated); expanded += size; cursor += 46 + nameLength + extraLength + commentLength
  }
  if (cursor !== end || Math.min(...ranges.map(([start]) => start)) !== 0) fail()
  const types = parts.get("[Content_Types].xml"), relations = parts.get("_rels/.rels")
  if (!types || !relations) fail()
  const typeXml = text(types), relationXml = text(relations)
  if (/<!DOCTYPE|<!ENTITY/i.test(typeXml + relationXml) || !/<Types\b/.test(typeXml) || !/<Relationships\b/.test(relationXml) || /macroEnabled|vbaProject/i.test(typeXml)) fail()
  const word = mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document", main = word ? "word/document.xml" : "xl/workbook.xml", root = word ? "document" : "workbook"
  const mainBytes = parts.get(main)
  if (!mainBytes || !typeXml.includes('PartName="/' + main + '"') || !typeXml.includes(word ? "wordprocessingml.document.main+xml" : "spreadsheetml.sheet.main+xml") || !relationXml.includes(main)) fail()
  const mainXml = text(mainBytes)
  if (/<!DOCTYPE|<!ENTITY/i.test(mainXml) || !new RegExp("<(?:[A-Za-z_][\\w.-]*:)?" + root + "\\b").test(mainXml) || !new RegExp("</(?:[A-Za-z_][\\w.-]*:)?" + root + "\\s*>").test(mainXml)) fail()
}
export function validateBriefBytes(input: Uint8Array, metadata: { original_filename: string; size_bytes: number; mime_type: string }) {
  const bytes = Buffer.from(input)
  if (!validBriefFile({ filename: metadata.original_filename, size: Number(metadata.size_bytes), mime: metadata.mime_type }) || bytes.length !== Number(metadata.size_bytes)) fail()
  const mime = metadata.mime_type as BriefMime
  if (mime === "application/pdf") {
    if (!/^%PDF-[12]\.\d/.test(bytes.subarray(0, 8).toString("ascii")) || !/%%EOF\s*$/.test(bytes.subarray(Math.max(0, bytes.length - 1024)).toString("ascii"))) fail()
  } else if (mime === "image/jpeg") {
    if (bytes.length < 6 || !bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) || !bytes.subarray(-2).equals(Buffer.from([255, 217]))) fail()
  } else if (mime === "image/png") {
    if (bytes.length < 45 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || bytes.readUInt32BE(8) !== 13 || bytes.toString("ascii", 12, 16) !== "IHDR" || !bytes.readUInt32BE(16) || !bytes.readUInt32BE(20) || bytes.toString("ascii", bytes.length - 8, bytes.length - 4) !== "IEND") fail()
  } else if (mime === "image/webp") {
    if (bytes.length < 20 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.readUInt32LE(4) + 8 !== bytes.length || bytes.toString("ascii", 8, 12) !== "WEBP" || !["VP8 ", "VP8L", "VP8X"].includes(bytes.toString("ascii", 12, 16))) fail()
  } else if (mime === "text/plain" || mime === "text/csv") {
    const value = plain(bytes)
    if (mime === "text/csv") validCsv(value)
  } else office(bytes, mime)
  return mime
}
