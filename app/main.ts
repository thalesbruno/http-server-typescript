import { parseArgs } from "util";
import { ContentType, HttpMethod, StatusCode } from "./types";
import { parseRequest } from "./request";
import { buildResponse } from "./response";

const getDirectory = () => {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      directory: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  return values["directory"];
};

Bun.listen({
  hostname: "localhost",
  port: 4221,
  socket: {
    close(socket) {
      socket.end();
    },
    async data(socket, data) {
      const {
        requestLine: { method, path },
        getHeader,
        body,
      } = parseRequest(data.toString());

      if (path.startsWith("/files/")) {
        const [, fileName] = path.split("/files/");
        const directory = getDirectory();

        if (method === HttpMethod.GET) {
          const file = Bun.file(`${directory}/${fileName}`);
          const exists = await file.exists();
          if (!exists) {
            const response = await buildResponse(StatusCode.NOT_FOUND);
            socket.write(response);
            return;
          }

          const response = await buildResponse(
            StatusCode.OK,
            "application/octet-stream",
            file,
          );
          socket.write(response);
          return;
        }

        if (method === HttpMethod.POST) {
          const fileReference = Bun.file(`${directory}/${fileName}`);
          await Bun.write(fileReference, body);
          const response = await buildResponse(StatusCode.CREATED);
          socket.write(response);
          return;
        }
      }

      if (path === "/user-agent") {
        const userAgent = getHeader("User-Agent");
        if (!userAgent) {
          const response = await buildResponse(StatusCode.BAD_REQUEST);
          socket.write(response);
        } else {
          const response = await buildResponse(
            StatusCode.OK,
            "application/octet-stream",
            userAgent,
          );
          socket.write(response);
        }
        return;
      }

      if (path.startsWith("/echo/")) {
        const [, str] = path.split("/echo/");
        const response = await buildResponse(
          StatusCode.OK,
          ContentType.octet,
          str,
        );
        socket.write(response);
        return;
      }

      if (path === "/") {
        socket.write(await buildResponse(StatusCode.OK));
        return;
      }

      socket.write(await buildResponse(StatusCode.NOT_FOUND));
      return;
    },
  },
});

// const server = net.createServer((socket) => {
//   socket.on("close", () => {
//     socket.end();
//   });
//   socket.on("data", async (data) => {
//     const {
//       requestLine: { method, path },
//       getHeader,
//       body,
//     } = parseRequest(data.toString());
//
//     if (path.startsWith("/files/")) {
//       const [, fileName] = path.split("/files/");
//       const directory = getDirectory();
//
//       if (method === HttpMethod.GET) {
//         const file = Bun.file(`${directory}/${fileName}`);
//         const exists = await file.exists();
//         if (!exists) {
//           const response = await buildResponse(StatusCode.NOT_FOUND);
//           socket.write(response);
//           return;
//         }
//
//         const response = await buildResponse(
//           StatusCode.OK,
//           "application/octet-stream",
//           file,
//         );
//         socket.write(response);
//         return;
//       }
//
//       if (method === HttpMethod.POST) {
//         const fileReference = Bun.file(`${directory}/${fileName}`);
//         await Bun.write(fileReference, body);
//         const response = await buildResponse(StatusCode.CREATED);
//         socket.write(response);
//         return;
//       }
//     }
//
//     if (path === "/user-agent") {
//       const userAgent = getHeader("User-Agent");
//       if (!userAgent) {
//         const response = await buildResponse(StatusCode.BAD_REQUEST);
//         socket.write(response);
//       } else {
//         const response = await buildResponse(
//           StatusCode.OK,
//           "application/octet-stream",
//           userAgent,
//         );
//         socket.write(response);
//       }
//       return;
//     }
//
//     if (path.startsWith("/echo/")) {
//       const [, str] = path.split("/echo/");
//       const response = await buildResponse(
//         StatusCode.OK,
//         ContentType.octet,
//         str,
//       );
//       socket.write(response);
//       return;
//     }
//
//     if (path === "/") {
//       socket.write(await buildResponse(StatusCode.OK));
//       return;
//     }
//
//     socket.write(await buildResponse(StatusCode.NOT_FOUND));
//     return;
//   });
// });

// server.listen(4221, "localhost");
