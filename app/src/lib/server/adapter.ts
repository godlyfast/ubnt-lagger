import { ChildProcess, exec } from "node:child_process";

import brackets from "g2-bracket-parser";
import mergeDeep from "merge-deep";

const buildObjWithValue = (path: string, value = "") => {
  const paths = path.split(".");
  return paths.reduceRight(
    (acc, item, index) => ({
      [item]: index === paths.length - 1 ? value : acc,
    }),
    {}
  );
};

const chunkArray = (arr: any[], chunkSize: number) => {
  let chunks = Array.from(
    { length: Math.ceil(arr.length / chunkSize) },
    (_, i) => arr.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
  return chunks;
};

const parseConfig = (outData: string) => {
  // console.log(outData);
  if (!outData) {
    return {};
  }  
  while (outData.includes("  ")) {
    outData = outData.replace("  ", " ");
  }
  outData = `${outData.replaceAll("\n", "")}`;
  var results = brackets(outData, {});
  let flat: any[] = [];
  const walk = (node: any) => {
    node.startString = node.startString.trim();
    node.path = node.parent?.path + "/" + node.startString?.trim();

    const children = node.children
      ? node.children.map((c: any) => {
          c.parent = node;
          return walk(c);
        })
      : [];
    node.children = children;
    flat.push(node);
    if (node.endString.trim() !== "") {
      flat.push({
        path: node.path,
        content: node.endString.trim(),
        children: [],
      });
    }
    return node;
  };
  results = results
    .filter((r: any) => r.src.indexOf("traffic-control") > -1)
    .map((r: any) => walk(r.match));

  let map: any = {};

  flat.forEach((r) => {
    if (r.path) {
      if (r.children.length > 0) {
        return;
      }
      let paths = r.path
        .split("/")
        .filter((p: any) => p !== "" && p !== "undefined")
        .map((p: any) => p.trim())
        .map((p: any) => {
          if (p.includes(" ")) {
            if (p.split(" ").length % 2 === 0) {
              return p.replaceAll(" ", ".");
            }
          }
          return p;
        })
        .map((p: any) => {
          if (p.includes(" ")) {
            const cc = p.split(" ");
            const last = cc.pop();
            const relPAth = r.path
              .split(cc[0])[0]
              .split("/")
              .map((p: any) => {
                if (p.includes(" ")) {
                  const cc = p.split(" ");
                  if (cc.length % 2 === 0) {
                    return p.replaceAll(" ", ".");
                  } else {
                    throw new Error("Invalid path");
                  }
                }
                return p;
              })
              .filter((p: any) => p !== "" && p !== "undefined")
              .join(".");
            let chunks = chunkArray(cc, 2);
            chunks.forEach(([k, v]: any) => {
              map = mergeDeep(map, buildObjWithValue(`${relPAth}.${k}`, v));
            });
            return last;
          }
          return p;
        });

      const content = r.content.trim();
      if (content.includes(" ")) {
        chunkArray(content.split(" "), 2).forEach(([k, v]: any) => {
          map = mergeDeep(map, buildObjWithValue(paths.join(".") + `.${k}`, v));
        });
        return;
      }
      map = mergeDeep(map, buildObjWithValue(paths.join("."), content));
    }
  });

  return map
};



async function execute(args: string[]) {
  let outData: any;
  let errData: any;
  let exitCode: number | null = null;
  await new Promise((resolve) => {
    const cp: ChildProcess = exec(
      `cd ../script && npm run lagger ${args.join(" ")}`
    );
    cp.stdout?.on("data", (data) => {
      console.log('DATA', data);
      outData = data;
    });
    cp.stderr?.on("data", (data) => {
      console.error('ERR', data);
      errData = data;
    });
    cp.on("close", (code) => {
      exitCode = code;
    //   console.log(`child process close all stdio with code ${code}`);
      resolve(null);
    });
    cp.on("exit", (code) => {
      exitCode = code;
    //   console.log(`child process exited with code ${code}`);
      resolve(null);
    });
  });
  return {
    outData,
    errData,
    exitCode,
  };
}

export async function showConfig() {
  let { outData, errData, exitCode } = await execute(["showConfig"]);

  return {
    outData,
    errData,
    exitCode,
    config: parseConfig(outData),
  };  
}

export async function fullInstall(
  ip: string,
  upSpeed: number,
  downSpeed: number
) {
  const { outData, errData, exitCode } = await execute([
    "fullInstall",
    ip,
    upSpeed.toString(),
    downSpeed.toString(),
  ]);

  return {
    outData,
    errData,
    exitCode,
  };
}

export async function fullDell() {
    const { outData, errData, exitCode } = await execute(["fullDell"]);
    
    return {
        outData,
        errData,
        exitCode,
    };
}
