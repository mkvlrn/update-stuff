import fs from "node:fs/promises";
import workerpool from "workerpool";

async function singleDownload(url: string, destination: string) {
  const response = await fetch(url);
  await fs.writeFile(destination, new Uint8Array(await response.arrayBuffer()));
}

export async function downloadBatch(url: string[], destination: string[]) {
  const pool = workerpool.pool();
  const promises = url.map((url, index) =>
    pool.exec(singleDownload, [url, destination[index]]),
  );

  try {
    await Promise.all(promises);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    await pool.terminate();
  }
}
