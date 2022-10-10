import fs from "fs";

export const readAsJSON = async () => {
  const rawAddresses = await fs.readFileSync("./constants/addresses.json");
  return JSON.parse(rawAddresses);
};

export const writeAsJSON = async (data) => {
  await fs.writeFileSync("./constants/addresses.json", JSON.stringify(data));
};
