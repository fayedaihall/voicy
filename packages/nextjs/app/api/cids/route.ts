import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Path to the text file
const filePath = path.join(process.cwd(), "data", "cids.txt");

// Ensure the data directory and file exist
async function ensureFileExists() {
  const dir = path.dirname(filePath);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "");
  }
}

export async function GET() {
  try {
    await ensureFileExists();
    const content = await fs.readFile(filePath, "utf-8");
    // Split by newlines, filter out empty lines
    const strings = content.split("\n").filter(line => line.trim());
    return NextResponse.json({ strings });
  } catch (error) {
    console.error("Error reading cids:", error);
    return NextResponse.json({ error: "Failed to read strings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { string } = await request.json();
    // Validate the string
    if (typeof string !== "string" || !string.trim()) {
      return NextResponse.json({ error: "Invalid string" }, { status: 400 });
    }

    await ensureFileExists();
    // Append string to file (new line)
    await fs.appendFile(filePath, `${string.trim()}\n`, "utf-8");
    return NextResponse.json({ message: "CID added", string });
  } catch (error) {
    console.error("Error writing string:", error);
    return NextResponse.json({ error: "Failed to add CID" }, { status: 500 });
  }
}
