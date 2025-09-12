import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createServer as createViteServer } from "vite";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface EvaliteConfig {
	apiBaseUrl?: string;
	wsBaseUrl?: string;
	[key: string]: unknown;
}

async function loadEvaliteConfig(): Promise<EvaliteConfig | null> {
	const configPath = path.resolve(process.cwd(), "evalite.config.ts");

	if (!existsSync(configPath)) {
		console.warn("evalite.config.ts not found at:", configPath);
		return null;
	}

	try {
		// Convert file path to file URL for dynamic import
		const configUrl = pathToFileURL(configPath).href;
		const configModule = await import(configUrl);

		// Handle both default export and named export
		const config = configModule.default || configModule;

		console.log("✅ Loaded evalite.config.ts:", config);
		return config;
	} catch (error) {
		console.error("❌ Failed to load evalite.config.ts:", error);
		return null;
	}
}

async function createServer() {
	const app = express();

	// Load evalite config before starting Vite server
	const evaliteConfig = await loadEvaliteConfig();

	if (evaliteConfig) {
		console.log("🚀 Starting server with config:", {
			apiBaseUrl: evaliteConfig.apiBaseUrl,
			wsBaseUrl: evaliteConfig.wsBaseUrl,
		});
	}

	// Create Vite server in middleware mode and configure the app type as
	// 'custom', disabling Vite's own HTML serving logic so parent server
	// can take control
	const vite = await createViteServer({
		server: { middlewareMode: true },
		appType: "custom",
		// Pass config values to Vite for client-side access
		define: {
			__EVALITE_CONFIG__: JSON.stringify(evaliteConfig),
		},
	});

	// Use vite's connect instance as middleware
	app.use(vite.middlewares);

	app.use("*all", async (req, res, next) => {
		const url = req.originalUrl;

		try {
			// 1. Read index.html
			let template = await fs.readFile(
				path.resolve(__dirname, "index.html"),
				"utf-8",
			);

			// 2. Apply Vite HTML transforms. This injects the Vite HMR client,
			//    and also applies HTML transforms from Vite plugins, e.g. global
			//    preambles from @vitejs/plugin-react
			template = await vite.transformIndexHtml(url, template);

			// 3. Inject the config into the template
			template = template.replace(
				"<head>",
				`<head>
    <script>
      window.__EVALITE_CONFIG__ = ${JSON.stringify(evaliteConfig)};
    </script>`,
			);

			// 4. Load the server entry. ssrLoadModule automatically transforms
			//    ESM source code to be usable in Node.js! There is no bundling
			//    required, and provides efficient invalidation similar to HMR.
			const { render } = await vite.ssrLoadModule("/app/entry-server.tsx");

			// 5. render the app HTML. This assumes entry-server.tsx's exported
			//    `render` function calls appropriate framework SSR APIs,
			//    e.g. ReactDOMServer.renderToString()
			const appHtml = render(url, evaliteConfig);

			// 6. Inject the app-rendered HTML into the template.
			const html = template.replace(`<!--ssr-outlet-->`, appHtml);

			// 7. Send the rendered HTML back.
			res.status(200).set({ "Content-Type": "text/html" }).send(html);
		} catch (error) {
			// If an error is caught, let Vite fix the stack trace so it maps back
			// to your actual source code.
			if (error instanceof Error) {
				vite.ssrFixStacktrace(error);
			}
			next(error);
		}
	});

	const port = 5173;
	app.listen(port, () => {
		console.log(`🌟 Server running at http://localhost:${port}`);
	});
}

createServer().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
