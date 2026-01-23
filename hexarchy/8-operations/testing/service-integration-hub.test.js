import { describe, expect, it } from "vitest";

// Import the hub (supports CommonJS or ESM exports)
const mod = await import("../services/service-integration-hub.js");
const hub = mod.default || mod;

describe("ServiceIntegrationHub health checks", () => {
  it("prefers instance.health() when available", async () => {
    const fakeService = {
      instance: {
        health: async () => ({ status: "ok", healthy: true }),
      },
      port: 3010,
      healthEndpoint: "/health",
    };

    const res = await hub.performHealthCheck(fakeService);
    expect(res.healthy).toBe(true);
    expect(res.raw).toBeDefined();
  });

  it("falls back to HTTP endpoint when no instance.health()", async () => {
    // spin up a small HTTP server that returns 200
    const http = await import("http");
    const server = http.createServer((req, res) => {
      if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise((resolve) => server.listen(5001, resolve));

    const fakeService = {
      port: 5001,
      healthEndpoint: "/health",
    };

    const res = await hub.performHealthCheck(fakeService);
    expect(res.healthy).toBe(true);
    expect(res.statusCode).toBe(200);

    await new Promise((resolve) => server.close(resolve));
  });

  it("returns unhealthy when no port provided", async () => {
    const fakeService = { healthEndpoint: "/health" };
    const res = await hub.performHealthCheck(fakeService);
    expect(res.healthy).toBe(false);
    expect(res.reason).toBe("no-port");
  });
});
