import { Miniflare, type WorkerOptions } from "miniflare";
import { readConfig } from "../../config";
import { getBindings } from "../../dev";
import { getBoundRegisteredWorkers } from "../../dev-registry";
import { buildMiniflareBindingOptions } from "../../dev/miniflare";
import type { Bindings } from "../startDevWorker";
import type { MiniflareOptions } from "miniflare";

export type GetBindingsProxyOpts = {
	bindings?: Bindings;
	noConfigRead?: boolean;
};

export async function getBindingsProxy(opts: GetBindingsProxyOpts = {}) {
	const miniflareOptions = opts.bindings
		? convertBindingsForMiniflare(opts.bindings)
		: opts.noConfigRead !== true
		? await getMiniflareOptionsFromConfig(opts)
		: {};

	const mf = new Miniflare({
		script: "",
		modules: true,
		...miniflareOptions,
	});

	const bindings = await mf.getBindings();

	return {
		bindings,
		dispose: () => mf.dispose(),
	};
}

async function getMiniflareOptionsFromConfig(
	opts: GetBindingsProxyOpts
): Promise<Partial<MiniflareOptions>> {
	if (opts.noConfigRead === false) {
		return {};
	}

	const rawConfig = readConfig(undefined, {
		experimentalJsonConfig: true,
	});

	const bindings = getBindings(rawConfig, undefined, true, {});

	const workerDefinitions = await getBoundRegisteredWorkers({
		services: undefined,
		durableObjects: rawConfig["durable_objects"],
	});

	const { bindingOptions, externalDurableObjectWorker } =
		buildMiniflareBindingOptions({
			name: undefined,
			bindings,
			workerDefinitions,
			queueConsumers: undefined,
			serviceBindings: {},
		});

	const options: MiniflareOptions = {
		// TODO: allow users to define the persistance options (they could come from opts)
		// ...persistOptions,
		workers: [
			{
				script: "",
				modules: true,
				...bindingOptions,
			},
			externalDurableObjectWorker,
		],
	};

	return options;
}

// POC_CODE_START /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Note: the following should use what will be available in packages/wrangler/src/api/startDevWorker/LocalRuntimeController.ts
//       as the devprod team is already looking into doing such conversion: https://github.com/cloudflare/workers-sdk/pull/4450/files#diff-1a586aa1afa9860949b416f63fdea1f7e2575ebee74e27706177ebb806de0364R236-R292
// Based on that the following code is extremely simplified and just a POC
type MiniflareBindings = Pick<WorkerOptions, "bindings" | "kvNamespaces">; // etc...

function convertBindingsForMiniflare(
	bindingsOpts: Bindings
): MiniflareBindings {
	const bindings = Object.entries(bindingsOpts)
		.map(([bindingName, binding]) => {
			if (binding.type === "var") {
				return [bindingName, binding.value];
			}
			return null;
		})
		.filter(Boolean)
		.reduce((kvs, bindingInfo) => {
			const [bindingName, kvId] = bindingInfo as [string, string];
			return {
				...kvs,
				[bindingName]: kvId,
			};
		}, {} as Record<string, string>);

	const kvNamespaces = Object.entries(bindingsOpts)
		.map(([bindingName, binding]) => {
			if (binding.type === "kv") {
				return [bindingName, binding.id];
			}
			return null;
		})
		.filter(Boolean)
		.reduce((kvs, bindingInfo) => {
			const [bindingName, kvId] = bindingInfo as [string, string];
			return {
				...kvs,
				[bindingName]: kvId,
			};
		}, {} as Record<string, string>);

	return {
		bindings,
		kvNamespaces,
	};
}
// POC_CODE_END /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
